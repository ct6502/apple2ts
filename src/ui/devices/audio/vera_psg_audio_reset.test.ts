// Ctrl-Reset must silence PCM/PSG audio that was already scheduled in the
// VERA AudioWorklet graph, including events whose async send lands after reset.
jest.mock("./speaker", () => ({
  isAudioEnabled: () => true,
  registerAudioContext: jest.fn(() => () => {}),
}))
jest.mock("../../main2worker", () => ({ passAudioClockPort: jest.fn() }))

type VeraPsgAudio = typeof import("./vera_psg_audio")

interface Deferred {
  promise: Promise<void>
  resolve: () => void
}

const defer = (): Deferred => {
  let resolve: () => void = () => {}
  const promise = new Promise<void>(promiseResolve => { resolve = promiseResolve })
  return { promise, resolve }
}

// A processor queue stands in for samples/envelopes already scheduled inside
// the AudioWorklet. Closing the old graph must drain it.
interface ScheduledAudio {
  kind: "pcm" | "psg"
  payload: unknown
}

class FakeAudioWorkletNode {
  scheduled: ScheduledAudio[] = []
  messages: unknown[] = []
  port = {
    postMessage: jest.fn((message: unknown) => { this.messages.push(message) }),
    close: jest.fn(() => {
      this.scheduled.length = 0
      this.messages.length = 0
    }),
  }
  connect = jest.fn()
  disconnect = jest.fn()
  constructor(public context: FakeAudioContext, _name: string) {}
}

class FakeAudioContext {
  static suspendedOnCreate = true
  static resumeGate = defer()
  sampleRate = 48000
  state: AudioContextState = FakeAudioContext.suspendedOnCreate ? "suspended" : "running"
  destination = {}
  audioWorklet = { addModule: jest.fn(async () => {}) }
  close = jest.fn(async () => {})
  suspend = jest.fn(async () => {})
  resume = jest.fn(() => FakeAudioContext.resumeGate.promise)
  constructor() {
    FakeAudioContext.suspendedOnCreate = false
  }
}

const contexts: FakeAudioContext[] = []
const nodes: FakeAudioWorkletNode[] = []
const audioContextDescriptor = Object.getOwnPropertyDescriptor(globalThis, "AudioContext")
const audioWorkletNodeDescriptor = Object.getOwnPropertyDescriptor(globalThis, "AudioWorkletNode")
const messageChannelDescriptor = Object.getOwnPropertyDescriptor(globalThis, "MessageChannel")
const fetchDescriptor = Object.getOwnPropertyDescriptor(globalThis, "fetch")

const installAudioGlobals = () => {
  FakeAudioContext.suspendedOnCreate = true
  FakeAudioContext.resumeGate = defer()
  Object.defineProperty(globalThis, "AudioContext", { configurable: true, value: class extends FakeAudioContext {
    constructor() {
      super()
      contexts.push(this)
    }
  } })
  Object.defineProperty(globalThis, "AudioWorkletNode", { configurable: true, value: class extends FakeAudioWorkletNode {
    constructor(context: FakeAudioContext, name: string) {
      super(context, name)
      nodes.push(this)
    }
  } })
  Object.defineProperty(globalThis, "MessageChannel", {
    configurable: true,
    value: class { port1 = { close: jest.fn() }; port2 = {} },
  })
  Object.defineProperty(globalThis, "fetch", {
    configurable: true,
    value: jest.fn(async () => ({})),
  })
}

const restoreAudioGlobals = () => {
  if (audioContextDescriptor) Object.defineProperty(globalThis, "AudioContext", audioContextDescriptor)
  else Reflect.deleteProperty(globalThis, "AudioContext")
  if (audioWorkletNodeDescriptor) Object.defineProperty(globalThis, "AudioWorkletNode", audioWorkletNodeDescriptor)
  else Reflect.deleteProperty(globalThis, "AudioWorkletNode")
  if (messageChannelDescriptor) Object.defineProperty(globalThis, "MessageChannel", messageChannelDescriptor)
  else Reflect.deleteProperty(globalThis, "MessageChannel")
  if (fetchDescriptor) Object.defineProperty(globalThis, "fetch", fetchDescriptor)
  else Reflect.deleteProperty(globalThis, "fetch")
}

const loadActual = (): VeraPsgAudio => {
  let loaded: unknown
  jest.isolateModules(() => {
    loaded = jest.requireActual("./vera_psg_audio")
  })
  return loaded as VeraPsgAudio
}

const flushTurn = async () => {
  await new Promise<void>(resolve => setTimeout(resolve, 0))
}

afterEach(() => {
  jest.restoreAllMocks()
  restoreAudioGlobals()
})

test("reset drains scheduled PCM/PSG and rejects a late pre-reset enqueue into the rebuilt graph", async () => {
  installAudioGlobals()
  jest.spyOn(WebAssembly, "compileStreaming").mockResolvedValue({} as WebAssembly.Module)
  const audio = loadActual()

  // Pre-reset PSG/PCM events are in flight: they already passed the async
  // initialization gate and are waiting on the suspended graph's resume.
  const latePsg = audio.playVeraPsgBatch([
    { reg: 3, value: 0x42, cycle: 10 },
    { reg: 4, value: 0x43, cycle: 12 },
  ])
  const latePcm = audio.playVeraPcmWrite({ reg: "fifo", value: 0x77, cycle: 11 })
  await flushTurn()

  const oldContext = contexts[0]
  const oldNode = nodes[0]
  oldNode.scheduled.push(
    { kind: "pcm", payload: { reg: "fifo", value: 0x77, cycle: 11 } },
    { kind: "psg", payload: [{ reg: 3, value: 0x42, cycle: 10 }, { reg: 4, value: 0x43, cycle: 12 }] },
  )

  audio.stopVeraPsgAudio()
  expect(oldContext.close).toHaveBeenCalledTimes(1)
  expect(oldNode.port.close).toHaveBeenCalledTimes(1)
  expect(oldNode.scheduled).toEqual([])

  // Post-reset graph is legitimate. It should start silently, then accept new
  // writes; the stale pre-reset continuations must not enter it.
  const newPcm = audio.playVeraPcmWrite({ reg: "rate", value: 7, cycle: 999 })
  await flushTurn()
  const newNode = nodes[1]
  expect(newNode).toBeDefined()
  FakeAudioContext.resumeGate.resolve()
  await Promise.all([latePsg, latePcm, newPcm])

  const graphMessages = newNode.messages.filter(
    message => !(message instanceof Object && "type" in message),
  )
  expect(graphMessages).toEqual([
    { reg: "rate", value: 7, cycle: 999 },
  ])
})
