jest.mock("./speaker", () => ({
  isAudioEnabled: () => true,
  registerAudioContext: jest.fn(),
}))

test.each([true, false])("audio initialization restores FM enabled=%s without opening settings", async enabled => {
  const savedPreference = localStorage.getItem("veraFmAudioEnabled")
  const originals = ["AudioContext", "AudioWorkletNode", "MessageChannel", "fetch"].map(key =>
    [key, Object.getOwnPropertyDescriptor(globalThis, key)] as const)
  const postMessage = jest.fn()
  const compile = jest.spyOn(WebAssembly, "compileStreaming").mockResolvedValue({} as WebAssembly.Module)
  try {
    if (enabled) localStorage.removeItem("veraFmAudioEnabled")
    else localStorage.setItem("veraFmAudioEnabled", "false")
    Object.defineProperty(globalThis, "AudioContext", { configurable: true, value: class {
      sampleRate = 48000
      state = "running"
      destination = {}
      audioWorklet = { addModule: async () => {} }
    } })
    Object.defineProperty(globalThis, "MessageChannel", { configurable: true, value: class {
      port1 = { close: jest.fn() }
      port2 = {}
    } })
    Object.defineProperty(globalThis, "AudioWorkletNode", { configurable: true, value: class {
      port = { postMessage }
      connect() {}
    } })
    Object.defineProperty(globalThis, "fetch", { configurable: true, value: jest.fn(async () => ({})) })
    let play: (event: VeraPsgWrite) => Promise<void> = async () => {}
    jest.isolateModules(() => {
      play = jest.requireActual<typeof import("./vera_psg_audio")>("./vera_psg_audio").playVeraPsgWrite
    })
    await play({ reg: 0, value: 42, cycle: 0 })
    expect(postMessage).toHaveBeenCalledWith({ type: "fm-enabled", enabled })
    expect(postMessage).toHaveBeenCalledWith({ reg: 0, value: 42, cycle: 0 })
  } finally {
    compile.mockRestore()
    for (const [key, descriptor] of originals) {
      if (descriptor) Object.defineProperty(globalThis, key, descriptor)
      else Reflect.deleteProperty(globalThis, key)
    }
    if (savedPreference === null) localStorage.removeItem("veraFmAudioEnabled")
    else localStorage.setItem("veraFmAudioEnabled", savedPreference)
  }
})
