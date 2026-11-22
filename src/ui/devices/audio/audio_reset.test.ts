// Boot/Ctrl-Reset audio cleanup. These tests pin the UI-side stop functions:
// Boot and Reset both notify, and every transport that can keep sounding from
// already-scheduled audio is torn down instead of merely muted.
import * as SoftSynth from "./softsynth"

jest.mock("./speaker", () => ({
  isAudioEnabled: () => true,
  registerAudioContext: jest.fn(() => () => {}),
}))
jest.mock("../../main2worker", () => ({ passAudioClockPort: jest.fn(), passRxMidiData: jest.fn() }))
jest.mock("./enhancedmidi", () => ({ checkEnhancedMidi: jest.fn(() => false) }))
jest.mock("./softsynth", () => ({
  initSoftSynth: jest.fn(),
  isSoftSynthAvailable: jest.fn(() => true),
  stopAllNotes: jest.fn(),
  resetSoftSynth: jest.fn(),
  setMasterVolume: jest.fn(),
}))

const AUDIO_GLOBALS = [
  "AudioContext",
  "AudioWorkletNode",
  "GainNode",
  "OscillatorNode",
  "BiquadFilterNode",
  "AudioBufferSourceNode",
  "AudioBuffer",
  "MessageChannel",
]

let restoreAudioGlobals: () => void = () => {}
let contexts: FakeAudioContext[] = []
let gainNodes: FakeGainNode[] = []
let oscillatorNodes: FakeOscillatorNode[] = []
let filterNodes: FakeBiquadFilterNode[] = []
let sourceNodes: FakeAudioBufferSourceNode[] = []
let workletNodes: FakeAudioWorkletNode[] = []

class FakeAudioBuffer {
  length: number
  numberOfChannels: number
  sampleRate: number
  private data: Float32Array
  constructor({ length, numberOfChannels, sampleRate }: {
    length: number, numberOfChannels: number, sampleRate: number,
  }) {
    this.length = length
    this.numberOfChannels = numberOfChannels
    this.sampleRate = sampleRate
    this.data = new Float32Array(length)
  }
  getChannelData() { return this.data }
}

class FakeAudioBufferSourceNode {
  buffer: FakeAudioBuffer | null
  start = jest.fn()
  stop = jest.fn()
  connect = jest.fn()
  disconnect = jest.fn()
  constructor(_context: FakeAudioContext, opts?: { buffer?: FakeAudioBuffer }) {
    this.buffer = opts?.buffer ?? null
    sourceNodes.push(this)
  }
}

class FakeOscillatorNode {
  frequency = { value: 0 }
  type = "sine"
  start = jest.fn()
  stop = jest.fn()
  connect = jest.fn()
  disconnect = jest.fn()
  setPeriodicWave = jest.fn()
  constructor(_context: FakeAudioContext) {
    oscillatorNodes.push(this)
  }
}

class FakeBiquadFilterNode {
  frequency = { value: 0 }
  Q = { value: 0 }
  connect = jest.fn()
  disconnect = jest.fn()
  constructor(_context: FakeAudioContext, _opts?: object) {
    filterNodes.push(this)
  }
}

class FakeGainNode {
  gain = { value: 0 }
  connect = jest.fn()
  disconnect = jest.fn()
  constructor(_context: FakeAudioContext, opts?: { gain: number }) {
    this.gain.value = opts?.gain ?? 0
    gainNodes.push(this)
  }
}

class FakeAudioWorkletNode {
  port = { postMessage: jest.fn(), close: jest.fn() }
  connect = jest.fn()
  disconnect = jest.fn()
  constructor(_context: FakeAudioContext, _name: string) {
    workletNodes.push(this)
  }
}

class FakeAudioContext {
  sampleRate = 64
  currentTime = 0
  state = "running"
  destination = {}
  audioWorklet = { addModule: jest.fn(async () => {}) }
  suspend = jest.fn(async () => {})
  resume = jest.fn(async () => {})
  close = jest.fn(async () => {})
  createChannelMerger = jest.fn(() => new FakeGainNode(this))
  createGain = jest.fn(() => new FakeGainNode(this))
  createPeriodicWave = jest.fn(() => ({}))
  createBuffer = jest.fn((channels: number, length: number) => new FakeAudioBuffer({
    numberOfChannels: channels, length, sampleRate: this.sampleRate,
  }))
  createBufferSource = jest.fn(() => new FakeAudioBufferSourceNode(this))
  constructor() { contexts.push(this) }
}

const installAudioGlobals = () => {
  contexts = []
  gainNodes = []
  oscillatorNodes = []
  filterNodes = []
  sourceNodes = []
  workletNodes = []
  const originals = AUDIO_GLOBALS.map(key => [key, Object.getOwnPropertyDescriptor(globalThis, key)] as const)
  Object.defineProperty(globalThis, "AudioContext", { configurable: true, value: FakeAudioContext })
  Object.defineProperty(globalThis, "AudioWorkletNode", { configurable: true, value: FakeAudioWorkletNode })
  Object.defineProperty(globalThis, "GainNode", { configurable: true, value: FakeGainNode })
  Object.defineProperty(globalThis, "OscillatorNode", { configurable: true, value: FakeOscillatorNode })
  Object.defineProperty(globalThis, "BiquadFilterNode", { configurable: true, value: FakeBiquadFilterNode })
  Object.defineProperty(globalThis, "AudioBufferSourceNode", { configurable: true, value: FakeAudioBufferSourceNode })
  Object.defineProperty(globalThis, "AudioBuffer", { configurable: true, value: FakeAudioBuffer })
  Object.defineProperty(globalThis, "MessageChannel", {
    configurable: true,
    value: class { port1 = {}; port2 = {} },
  })
  restoreAudioGlobals = () => {
    for (const [key, descriptor] of originals) {
      if (descriptor) Object.defineProperty(globalThis, key, descriptor)
      else Reflect.deleteProperty(globalThis, key)
    }
  }
}

const loadActual = <T>(modulePath: string): T => {
  let loaded: unknown
  jest.isolateModules(() => {
    loaded = jest.requireActual(modulePath)
  })
  return loaded as T
}

afterEach(() => {
  jest.restoreAllMocks()
  restoreAudioGlobals()
})

const sound = (slot = 4): MockingboardSound => ({
  slot,
  chip: 0,
  // Tone 0 = 0 (silent), all disable bits clear, all envelope bits clear.
  params: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
})

test("mockingboard reset stops oscillator, envelope/noise buffer sources, and closes the context", () => {
  installAudioGlobals()
  const mboard = loadActual<typeof import("./mockingboard_audio")>("./mockingboard_audio")
  mboard.playMockingboard(sound(4))

  const beforeStop = {
    oscillators: oscillatorNodes.length,
    noiseSources: sourceNodes.length,
  }
  mboard.stopMockingboardAudio()

  expect(beforeStop.oscillators).toBeGreaterThan(0)
  expect(beforeStop.noiseSources).toBeGreaterThan(0)
  expect(oscillatorNodes.every(node => node.stop.mock.calls.length === 1)).toBe(true)
  expect(oscillatorNodes.every(node => node.disconnect.mock.calls.length === 1)).toBe(true)
  expect(sourceNodes.every(node => node.stop.mock.calls.length === 1)).toBe(true)
  expect(gainNodes.every(node => node.disconnect.mock.calls.length === 1)).toBe(true)
  expect(contexts).toHaveLength(1)
  expect(contexts[0].close).toHaveBeenCalledTimes(1)

  // A later boot rebuilds the graph lazily rather than playing stale nodes.
  mboard.playMockingboard(sound(2))
  expect(contexts).toHaveLength(2)
})

test("VERA PSG reset closes the worklet context, clearing queued PSG/PCM/FM messages", async () => {
  installAudioGlobals()
  jest.spyOn(WebAssembly, "compileStreaming").mockResolvedValue({} as WebAssembly.Module)
  Object.defineProperty(globalThis, "fetch", {
    configurable: true,
    value: jest.fn(async () => ({})),
    writable: true,
  })
  const vera = loadActual<typeof import("./vera_psg_audio")>("./vera_psg_audio")

  await vera.playVeraPsgWrite({ reg: 3, value: 42, cycle: 0 })
  expect(workletNodes).toHaveLength(1)
  expect(workletNodes[0].port.postMessage).toHaveBeenCalledWith({ reg: 3, value: 42, cycle: 0 })

  vera.stopVeraPsgAudio()

  expect(workletNodes[0].disconnect).toHaveBeenCalledTimes(1)
  expect(workletNodes[0].port.close).toHaveBeenCalledTimes(1)
  expect(contexts[0].close).toHaveBeenCalledTimes(1)

  // The lazy initializer rebuilds a fresh worklet after the reset.
  await vera.playVeraPsgWrite({ reg: 4, value: 7, cycle: 1 })
  expect(workletNodes).toHaveLength(2)
})

test("VERA audio reset silences the live worklet before the context closes", async () => {
  installAudioGlobals()
  jest.spyOn(WebAssembly, "compileStreaming").mockResolvedValue({} as WebAssembly.Module)
  Object.defineProperty(globalThis, "fetch", {
    configurable: true,
    value: jest.fn(async () => ({})),
    writable: true,
  })
  const vera = loadActual<typeof import("./vera_psg_audio")>("./vera_psg_audio")

  await vera.playVeraPsgWrite({ reg: 3, value: 42, cycle: 0 })
  expect(workletNodes).toHaveLength(1)

  vera.playVeraAudioReset()

  expect(workletNodes[0].port.postMessage).toHaveBeenCalledWith({ type: "audio-reset" })
  // The live reset must not build a second graph; AUDIO_RESET still owns the
  // teardown.
  expect(workletNodes).toHaveLength(1)
  expect(contexts).toHaveLength(1)
})

test("MIDI reset sends All Notes Off on every channel and clears active soft-synth notes", async () => {
  installAudioGlobals()
  const output = { id: "output-a", name: "Output", state: "connected", send: jest.fn() }
  const midiAccess = {
    inputs: new Map(),
    outputs: new Map([["output-a", output]]),
    addEventListener: jest.fn(),
  } as unknown as MIDIAccess
  Object.defineProperty(navigator, "requestMIDIAccess", {
    configurable: true,
    value: jest.fn(() => Promise.resolve(midiAccess)),
  })
  const midi = loadActual<typeof import("./midiinterface")>("./midiinterface")
  await midi.requestWebMidiAccess()
  midi.disableSoftSynth()

  midi.receiveMidiData(new Uint8Array([0x90, 60, 100]))
  midi.stopMidiAudio()

  const sent = output.send.mock.calls.map(call => call[0] as number[])
  const allNotesOff = sent.filter(bytes => bytes[1] === 123)
  const allSoundOff = sent.filter(bytes => bytes[1] === 120)
  expect(allNotesOff).toHaveLength(16)
  expect(allNotesOff[0]).toEqual([0xB0, 123, 0])
  expect(allNotesOff.at(-1)).toEqual([0xBF, 123, 0])
  expect(allSoundOff).toHaveLength(16)

  midi.enableSoftSynth()
  midi.stopMidiAudio()
  expect(jest.mocked(SoftSynth.resetSoftSynth)).toHaveBeenCalled()
})

test("Ensoniq DOC reset closes its AudioContext and clears the scheduled block queue", () => {
  installAudioGlobals()
  Object.defineProperty(window, "AudioContext", { configurable: true, value: FakeAudioContext })
  const ensoniq = loadActual<typeof import("./iigs_ensoniq_audio")>("./iigs_ensoniq_audio")

  ensoniq.playEnsoniqSamples(new Int16Array(64).fill(0), 26320)
  ensoniq.resetEnsoniqAudio()

  expect(contexts[0].close).toHaveBeenCalledTimes(1)
  expect(ensoniq.getEnsoniqBlocksPlayed()).toBe(0)
})
