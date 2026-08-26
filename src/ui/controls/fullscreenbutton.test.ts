import { setCanvasFullscreen } from "./fullscreenbutton"

describe("setCanvasFullscreen", () => {
  const originalFullscreen = Object.getOwnPropertyDescriptor(document, "fullscreenElement")
  const originalExitFullscreen = Object.getOwnPropertyDescriptor(document, "exitFullscreen")
  const originalKeyboard = Object.getOwnPropertyDescriptor(navigator, "keyboard")
  let host: HTMLDivElement
  let keyboard: { lock: jest.Mock<Promise<void>, [string[]]>, unlock: jest.Mock }

  beforeEach(() => {
    host = document.createElement("div")
    const canvas = document.createElement("canvas")
    canvas.id = "apple2canvas"
    jest.spyOn(canvas, "getContext").mockReturnValue({} as CanvasRenderingContext2D)
    host.appendChild(canvas)
    document.body.appendChild(host)
    keyboard = {
      lock: jest.fn().mockResolvedValue(undefined),
      unlock: jest.fn(),
    }
    Object.defineProperty(navigator, "keyboard", { configurable: true, value: keyboard })
    Object.defineProperty(document, "fullscreenElement", { configurable: true, value: null })
    Object.defineProperty(host, "requestFullscreen", {
      configurable: true,
      value: jest.fn(async () => {
        Object.defineProperty(document, "fullscreenElement", { configurable: true, value: host })
      }),
    })
    Object.defineProperty(document, "exitFullscreen", {
      configurable: true,
      value: jest.fn(async () => {
        Object.defineProperty(document, "fullscreenElement", { configurable: true, value: null })
        document.dispatchEvent(new Event("fullscreenchange"))
      }),
    })
  })

  afterEach(async () => {
    if (document.fullscreenElement) await setCanvasFullscreen(false)
    document.body.replaceChildren()
    if (originalFullscreen) Object.defineProperty(document, "fullscreenElement", originalFullscreen)
    else delete (document as { fullscreenElement?: Element | null }).fullscreenElement
    if (originalExitFullscreen) Object.defineProperty(document, "exitFullscreen", originalExitFullscreen)
    else delete (document as { exitFullscreen?: () => Promise<void> }).exitFullscreen
    if (originalKeyboard) Object.defineProperty(navigator, "keyboard", originalKeyboard)
    else delete (navigator as Navigator & { keyboard?: unknown }).keyboard
    jest.restoreAllMocks()
  })

  test("locks Escape after entering fullscreen", async () => {
    await setCanvasFullscreen(true)

    expect(host.requestFullscreen).toHaveBeenCalledTimes(1)
    expect(keyboard.lock).toHaveBeenCalledWith(["Escape"])
  })

  test("unlocks Escape when fullscreen exits", async () => {
    await setCanvasFullscreen(true)
    await setCanvasFullscreen(false)

    expect(keyboard.unlock).toHaveBeenCalled()
    expect(document.exitFullscreen).toHaveBeenCalledTimes(1)
  })

  test("unlocks Escape after a native fullscreen exit", async () => {
    await setCanvasFullscreen(true)
    Object.defineProperty(document, "fullscreenElement", { configurable: true, value: null })
    document.dispatchEvent(new Event("fullscreenchange"))

    expect(keyboard.unlock).toHaveBeenCalled()
  })

  test("enters fullscreen when Keyboard Lock is unavailable", async () => {
    delete (navigator as Navigator & { keyboard?: unknown }).keyboard

    await expect(setCanvasFullscreen(true)).resolves.toBeUndefined()
    expect(host.requestFullscreen).toHaveBeenCalledTimes(1)
  })
})