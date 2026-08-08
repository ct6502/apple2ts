jest.mock("../../main2worker", () => ({
  passRxMidiData: jest.fn(),
}))

jest.mock("./enhancedmidi", () => ({
  checkEnhancedMidi: jest.fn(() => false),
}))

jest.mock("./softsynth", () => ({
  initSoftSynth: jest.fn(),
  isSoftSynthAvailable: jest.fn(() => true),
  stopAllNotes: jest.fn(),
}))

const createMidiAccess = () => {
  const outputA = { id: "output-a", name: "Test MIDI Output A" } as MIDIOutput
  const outputB = { id: "output-b", name: "Test MIDI Output B" } as MIDIOutput
  return {
    inputs: new Map(),
    outputs: new Map([["output-a", outputA], ["output-b", outputB]]),
    addEventListener: jest.fn(),
  } as unknown as MIDIAccess
}

const triggerStateChange = (midiAccess: MIDIAccess) => {
  const stateChange = (midiAccess.addEventListener as jest.Mock).mock.calls[0][1]
  stateChange()
}

beforeEach(() => {
  jest.resetModules()
  jest.spyOn(console, "log").mockImplementation(() => undefined)
  jest.spyOn(console, "warn").mockImplementation(() => undefined)
})

afterEach(() => {
  jest.restoreAllMocks()
})

test("does not request MIDI permission when the module loads", async () => {
  const requestMIDIAccess = jest.fn(() => Promise.resolve(createMidiAccess()))
  Object.defineProperty(navigator, "requestMIDIAccess", {
    value: requestMIDIAccess,
    configurable: true,
  })

  const midiSelect = await import("./midiselect")

  expect(requestMIDIAccess).not.toHaveBeenCalled()
  const options = midiSelect.getMidiDeviceOptions()
  expect(options.map((option) => option.label)).toEqual([
    "Apple2TS Built-in Synthesizer", "Enable External MIDI…",
  ])
  expect(midiSelect.isMidiDeviceSelected(options[0])).toBe(true)
  expect(midiSelect.isMidiDeviceSelected(options[1])).toBe(false)
})

test("does not offer external MIDI when Web MIDI is unsupported", async () => {
  Object.defineProperty(navigator, "requestMIDIAccess", {
    value: undefined,
    configurable: true,
  })

  const midiSelect = await import("./midiselect")

  expect(midiSelect.getMidiDeviceOptions().map((option) => option.label)).toEqual([
    "Apple2TS Built-in Synthesizer",
  ])
})

test("requests MIDI permission only when Web MIDI access is requested", async () => {
  const midiAccess = createMidiAccess()
  const requestMIDIAccess = jest.fn(() => Promise.resolve(midiAccess))
  Object.defineProperty(navigator, "requestMIDIAccess", {
    value: requestMIDIAccess,
    configurable: true,
  })
  const midi = await import("./midiinterface")
  const midiSelect = await import("./midiselect")
  const enableExternal = midiSelect.getMidiDeviceOptions()
    .find((option) => option.type === "enable-web-midi")

  expect(enableExternal).toBeDefined()
  await midiSelect.handleMidiDeviceSelect(enableExternal!)

  expect(requestMIDIAccess).toHaveBeenCalledTimes(1)
  expect(requestMIDIAccess).toHaveBeenCalledWith({ sysex: true })
  expect(midi.midiOutDevices).toHaveLength(2)

  const options = midiSelect.getMidiDeviceOptions()
  expect(options.map((option) => option.type)).toEqual([
    "built-in-synth", "web-midi-output", "web-midi-output",
  ])
  expect(options[0].label).toBe("Apple2TS Built-in Synthesizer")
  expect(midiSelect.isMidiDeviceSelected(options[0])).toBe(false)
  expect(options[1].label).toBe("Test MIDI Output A")
  expect(midiSelect.isMidiDeviceSelected(options[1])).toBe(true)
  expect(midiSelect.isMidiDeviceSelected(options[2])).toBe(false)
  expect(midi.setMidiOutIndex(99)).toBe(false)
  expect(midi.getMidiOutIndex()).toBe(0)
  expect(console.warn).toHaveBeenCalledWith(
    "Cannot select MIDI output index 99; selection unchanged."
  )

  await expect(midi.requestWebMidiAccess()).resolves.toBe(true)
  expect(requestMIDIAccess).toHaveBeenCalledTimes(1)
})

test("warns and falls back when the selected output disappears", async () => {
  const midiAccess = createMidiAccess()
  Object.defineProperty(navigator, "requestMIDIAccess", {
    value: jest.fn(() => Promise.resolve(midiAccess)),
    configurable: true,
  })
  const midiSelect = await import("./midiselect")
  const enableExternal = midiSelect.getMidiDeviceOptions()
    .find((option) => option.type === "enable-web-midi")

  await midiSelect.handleMidiDeviceSelect(enableExternal!)
  expect(midiSelect.isMidiDeviceSelected(midiSelect.getMidiDeviceOptions()[1])).toBe(true)

  const outputs = midiAccess.outputs as Map<string, MIDIOutput>
  outputs.delete("output-a")
  triggerStateChange(midiAccess)

  const options = midiSelect.getMidiDeviceOptions()
  expect(options.map((option) => option.label)).toEqual([
    "Apple2TS Built-in Synthesizer", "Test MIDI Output B",
  ])
  expect(midiSelect.isMidiDeviceSelected(options[0])).toBe(true)
  expect(midiSelect.isMidiDeviceSelected(options[1])).toBe(false)
  expect(console.warn).toHaveBeenCalledWith(
    "MIDI output \"Test MIDI Output A\" is no longer available; using the built-in synthesizer."
  )
})

test("preserves the selected output by ID when another output disappears", async () => {
  const midiAccess = createMidiAccess()
  Object.defineProperty(navigator, "requestMIDIAccess", {
    value: jest.fn(() => Promise.resolve(midiAccess)),
    configurable: true,
  })
  const midiSelect = await import("./midiselect")
  const enableExternal = midiSelect.getMidiDeviceOptions()
    .find((option) => option.type === "enable-web-midi")

  await midiSelect.handleMidiDeviceSelect(enableExternal!)
  const outputB = midiSelect.getMidiDeviceOptions()
    .find((option) => option.type === "web-midi-output" && option.deviceId === "output-b")
  await midiSelect.handleMidiDeviceSelect(outputB!)

  const outputs = midiAccess.outputs as Map<string, MIDIOutput>
  outputs.delete("output-a")
  triggerStateChange(midiAccess)

  const options = midiSelect.getMidiDeviceOptions()
  expect(options.map((option) => option.label)).toEqual([
    "Apple2TS Built-in Synthesizer", "Test MIDI Output B",
  ])
  expect(midiSelect.isMidiDeviceSelected(options[0])).toBe(false)
  expect(midiSelect.isMidiDeviceSelected(options[1])).toBe(true)
  expect(console.warn).not.toHaveBeenCalled()
})

test("ignores a stale menu option after its output disappears", async () => {
  const midiAccess = createMidiAccess()
  Object.defineProperty(navigator, "requestMIDIAccess", {
    value: jest.fn(() => Promise.resolve(midiAccess)),
    configurable: true,
  })
  const midiSelect = await import("./midiselect")
  const enableExternal = midiSelect.getMidiDeviceOptions()
    .find((option) => option.type === "enable-web-midi")

  await midiSelect.handleMidiDeviceSelect(enableExternal!)
  const staleOutput = midiSelect.getMidiDeviceOptions()
    .find((option) => option.type === "web-midi-output" && option.deviceId === "output-a")
  const outputs = midiAccess.outputs as Map<string, MIDIOutput>
  outputs.delete("output-a")
  triggerStateChange(midiAccess)
  const warnMock = console.warn as jest.Mock
  warnMock.mockClear()

  await midiSelect.handleMidiDeviceSelect(staleOutput!)

  const options = midiSelect.getMidiDeviceOptions()
  expect(midiSelect.isMidiDeviceSelected(options[0])).toBe(true)
  expect(midiSelect.isMidiDeviceSelected(options[1])).toBe(false)
  expect(console.warn).toHaveBeenCalledWith(
    "MIDI output \"Test MIDI Output A\" is no longer available; selection unchanged."
  )
})

test("warns when a disconnected output has no built-in fallback", async () => {
  const midiAccess = createMidiAccess()
  Object.defineProperty(navigator, "requestMIDIAccess", {
    value: jest.fn(() => Promise.resolve(midiAccess)),
    configurable: true,
  })
  const softSynth = await import("./softsynth")
  const midiSelect = await import("./midiselect")
  const enableExternal = midiSelect.getMidiDeviceOptions()
    .find((option) => option.type === "enable-web-midi")

  await midiSelect.handleMidiDeviceSelect(enableExternal!)
  const isSoftSynthAvailable = softSynth.isSoftSynthAvailable as jest.Mock
  isSoftSynthAvailable.mockReturnValue(false)
  const outputs = midiAccess.outputs as Map<string, MIDIOutput>
  outputs.delete("output-a")
  triggerStateChange(midiAccess)

  expect(console.warn).toHaveBeenCalledWith(
    "MIDI output \"Test MIDI Output A\" is no longer available; no MIDI output is selected."
  )
})
