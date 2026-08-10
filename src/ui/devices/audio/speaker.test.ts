type TestAudioContext = {
  audioWorklet: { addModule: jest.Mock<Promise<void>, [string]> }
  destination: object
  state: AudioContextState
  close: jest.Mock<Promise<void>, []>
  resume: jest.Mock<Promise<void>, []>
  suspend: jest.Mock<Promise<void>, []>
}

const makeTestAudioContext = (): TestAudioContext => ({
  audioWorklet: { addModule: jest.fn().mockResolvedValue(undefined) },
  destination: {},
  state: "running",
  close: jest.fn().mockResolvedValue(undefined),
  resume: jest.fn().mockResolvedValue(undefined),
  suspend: jest.fn().mockResolvedValue(undefined),
})

describe("speaker audio state", () => {
  const originalAudioContext = globalThis.AudioContext
  const originalAudioWorkletNode = globalThis.AudioWorkletNode

  afterEach(() => {
    jest.restoreAllMocks()
    jest.resetModules()
    Object.defineProperty(globalThis, "AudioContext", {
      configurable: true,
      value: originalAudioContext,
    })
    Object.defineProperty(globalThis, "AudioWorkletNode", {
      configurable: true,
      value: originalAudioWorkletNode,
    })
  })

  const installBrowserAudioMocks = (context: TestAudioContext) => {
    const connect = jest.fn()
    const postMessage = jest.fn()
    Object.defineProperty(globalThis, "AudioContext", {
      configurable: true,
      value: jest.fn(() => context),
    })
    Object.defineProperty(globalThis, "AudioWorkletNode", {
      configurable: true,
      value: jest.fn(() => ({connect, port: {postMessage}})),
    })
    return {connect, postMessage}
  }

  it("keeps the user's enabled state while emulation is paused", async () => {
    const speaker = await import("./speaker")

    speaker.emulatorSoundEnable(false)

    expect(speaker.isAudioEnabled()).toBe(false)
    expect(speaker.getAudioStatus()).toBe("enabled")
  })

  it("distinguishes a user mute from paused emulation", async () => {
    const speaker = await import("./speaker")

    speaker.audioEnable(false)
    expect(speaker.getAudioStatus()).toBe("muted")
    expect(speaker.isAudioEnabled()).toBe(false)

    speaker.audioEnable(true)
    expect(speaker.getAudioStatus()).toBe("enabled")
    expect(speaker.isAudioEnabled()).toBe(true)
  })

  it("keeps the global sound control when only AudioWorkletNode is absent", async () => {
    Object.defineProperty(globalThis, "AudioContext", {
      configurable: true,
      value: jest.fn(),
    })
    Object.defineProperty(globalThis, "AudioWorkletNode", {
      configurable: true,
      value: undefined,
    })
    const speaker = await import("./speaker")

    expect(speaker.canShowAudioControl()).toBe(true)
  })

  it("reports the failed initialization stage and becomes unavailable", async () => {
    const context = makeTestAudioContext()
    const failure = new DOMException("module load failed", "AbortError")
    context.audioWorklet.addModule.mockRejectedValue(failure)
    installBrowserAudioMocks(context)
    const log = jest.spyOn(console, "error").mockImplementation(() => undefined)
    const speaker = await import("./speaker")

    speaker.clickSpeaker(100)
    await Promise.resolve()
    await Promise.resolve()

    expect(speaker.getAudioStatus()).toBe("unavailable")
    expect(speaker.isAudioEnabled()).toBe(false)
    expect(context.close).toHaveBeenCalledTimes(1)
    expect(log).toHaveBeenCalledWith(
      "Unable to initialize speaker audio while loading the speaker worklet.",
      failure,
    )
  })

  it("suspends other audio after speaker failure and resumes it after recovery", async () => {
    const failedContext = makeTestAudioContext()
    failedContext.audioWorklet.addModule.mockRejectedValue(new Error("speaker failed"))
    installBrowserAudioMocks(failedContext)
    jest.spyOn(console, "error").mockImplementation(() => undefined)
    const speaker = await import("./speaker")
    const setOtherAudioEnabled = jest.fn()
    speaker.registerAudioContext(setOtherAudioEnabled)

    speaker.clickSpeaker(100)
    await Promise.resolve()
    await Promise.resolve()
    expect(setOtherAudioEnabled).toHaveBeenLastCalledWith(false)

    const recoveredContext = makeTestAudioContext()
    installBrowserAudioMocks(recoveredContext)
    await speaker.retrySpeakerAudio()
    expect(setOtherAudioEnabled).toHaveBeenLastCalledWith(true)
  })

  it("retries with a fresh context and clears unavailable only after success", async () => {
    const failedContext = makeTestAudioContext()
    failedContext.audioWorklet.addModule.mockRejectedValue(new Error("first attempt"))
    installBrowserAudioMocks(failedContext)
    jest.spyOn(console, "error").mockImplementation(() => undefined)
    const speaker = await import("./speaker")

    speaker.clickSpeaker(100)
    await Promise.resolve()
    await Promise.resolve()
    expect(speaker.getAudioStatus()).toBe("unavailable")

    const recoveredContext = makeTestAudioContext()
    const recovered = installBrowserAudioMocks(recoveredContext)
    const retry = speaker.retrySpeakerAudio()
    const duplicateRetry = speaker.retrySpeakerAudio()
    expect(speaker.getAudioStatus()).toBe("unavailable")
    await Promise.all([retry, duplicateRetry])

    expect(speaker.getAudioStatus()).toBe("enabled")
    expect(speaker.isAudioEnabled()).toBe(true)
    expect(globalThis.AudioContext).toHaveBeenCalledTimes(1)
    expect(recovered.connect).toHaveBeenCalledWith(recoveredContext.destination)
    expect(recoveredContext.suspend).not.toHaveBeenCalled()
  })
})
