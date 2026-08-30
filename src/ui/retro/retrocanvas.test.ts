import { createRetroPanelSvg } from "./retrocanvas"

describe("retro canvas SVG", () => {
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
    panel.className = "retro-panel retro-color-green retro-monitor-ntsc retro-effect-crt"
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
})
