import { createRetroPanelSvg, renderRetroPanelToCanvas } from "./retrocanvas"

describe("retro canvas SVG", () => {
  test("resolves font URLs relative to their stylesheet", async () => {
    Object.defineProperty(document, "fonts", {
      configurable: true,
      value: { ready: Promise.resolve() },
    })
    const originalFetch = globalThis.fetch
    const fetchMock = jest.fn(async () => ({
      ok: true,
      blob: async () => new Blob(["font"], { type: "font/woff2" }),
    } as Response))
    Object.defineProperty(globalThis, "fetch", { configurable: true, value: fetchMock })
    Object.defineProperty(document, "styleSheets", {
      configurable: true,
      value: [{
        href: "https://example.com/app/assets/index.css",
        cssRules: [{
          cssText: "@font-face { font-family: PrintChar21; src: url(./PrintChar21.woff2); }",
        }],
      }],
    })
    const panel = document.createElement("div")
    panel.className = "retro-panel"
    const nativeSurface = document.createElement("div")

    try {
      const svg = await createRetroPanelSvg(panel, nativeSurface)

      expect(fetchMock).toHaveBeenCalledWith("https://example.com/app/assets/PrintChar21.woff2")
      expect(svg).toContain("data:font/woff2;base64,")
    } finally {
      if (originalFetch) {
        Object.defineProperty(globalThis, "fetch", { configurable: true, value: originalFetch })
      } else {
        Reflect.deleteProperty(globalThis, "fetch")
      }
      Reflect.deleteProperty(document, "styleSheets")
    }
  })

  test("includes panel styles without external or duplicate effect styles", async () => {
    Object.defineProperty(document, "fonts", {
      configurable: true,
      value: { ready: Promise.resolve() },
    })
    const style = document.createElement("style")
    style.textContent = `
      .retro-window { color: rgb(1, 2, 3); }
      .unrelated { background-image: url("https://example.com/image.png"); }
    `
    document.head.append(style)
    const panel = document.createElement("div")
    panel.className = "retro-panel retro-color-green retro-monitor-ntsc retro-effect-crt retro-canvas-pending"
    panel.style.setProperty("--retro-foreground", "#39ff14")
    panel.style.backgroundImage = "url(https://example.com/mask.png)"
    const nativeSurface = document.createElement("div")
    nativeSurface.className = "retro-native-surface"
    nativeSurface.textContent = "Control Panel"

    const svg = await createRetroPanelSvg(panel, nativeSurface)

    expect(svg).toContain("retro-panel retro-color-green")
    expect(svg).toContain(".retro-window")
    expect(svg).toContain("--retro-foreground:#39ff14")
    expect(svg).toContain("Control Panel")
    expect(svg).not.toContain("retro-monitor-ntsc")
    expect(svg).not.toContain("retro-effect-crt")
    expect(svg).not.toContain("retro-canvas-pending")
    expect(svg).not.toContain("example.com")
    style.remove()
  })

  test("preserves native coordinates at destination raster dimensions", async () => {
    Object.defineProperty(document, "fonts", {
      configurable: true,
      value: { ready: Promise.resolve() },
    })
    const panel = document.createElement("div")
    panel.className = "retro-panel"
    const nativeSurface = document.createElement("div")

    const svg = await createRetroPanelSvg(panel, nativeSurface, 1120, 768)

    expect(svg).toContain("width=\"1120\" height=\"768\" viewBox=\"0 0 560 384\"")
    expect(svg).toContain("<foreignObject width=\"560\" height=\"384\">")
  })

  test("reuses a decoded image for identical panel frames", async () => {
    Object.defineProperty(document, "fonts", {
      configurable: true,
      value: { ready: Promise.resolve() },
    })
    const originalImage = globalThis.Image
    const sources: string[] = []
    class TestImage {
      onload: (() => void) | null = null
      onerror: (() => void) | null = null

      set src(value: string) {
        sources.push(value)
        queueMicrotask(() => this.onload?.())
      }
    }
    Object.defineProperty(globalThis, "Image", { configurable: true, value: TestImage })
    const panel = document.createElement("div")
    panel.className = "retro-panel cached-panel"
    const nativeSurface = document.createElement("div")
    nativeSurface.textContent = "Cached frame"
    const drawImage = jest.fn()
    const canvas = document.createElement("canvas")
    canvas.getContext = jest.fn(() => ({ clearRect: jest.fn(), drawImage })) as never

    try {
      await renderRetroPanelToCanvas(panel, nativeSurface, canvas)
      await renderRetroPanelToCanvas(panel, nativeSurface, canvas)
    } finally {
      Object.defineProperty(globalThis, "Image", { configurable: true, value: originalImage })
    }

    expect(sources).toHaveLength(1)
    expect(drawImage).toHaveBeenCalledTimes(2)
  })
})
