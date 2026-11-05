jest.mock("smplr", () => ({
  Soundfont: jest.fn().mockImplementation(() => ({
    output: { setVolume: jest.fn() },
    start: jest.fn(() => jest.fn()),
  })),
}))

test("selecting the built-in synth resumes an existing suspended audio context", async () => {
  jest.resetModules()
  const original = Object.getOwnPropertyDescriptor(window, "AudioContext")
  let state: AudioContextState = "running"
  const resume = jest.fn(async () => { state = "running" })
  const createGain = jest.fn(() => ({ gain: { value: 1 }, connect: jest.fn() }))
  const constructor = jest.fn().mockImplementation(() => ({
    createGain,
    destination: {},
    get state() { return state },
    resume,
  }))
  Object.defineProperty(window, "AudioContext", { configurable: true, value: constructor })
  const log = jest.spyOn(console, "log").mockImplementation(() => {})
  try {
    const synth = await import("./softsynth")
    await synth.initSoftSynth()
    state = "suspended"
    await synth.initSoftSynth()
    expect(resume).toHaveBeenCalledTimes(1)
    expect(constructor).toHaveBeenCalledTimes(1)
    expect(state).toBe("running")
  } finally {
    log.mockRestore()
    if (original) Object.defineProperty(window, "AudioContext", original)
    else Reflect.deleteProperty(window, "AudioContext")
  }
})
