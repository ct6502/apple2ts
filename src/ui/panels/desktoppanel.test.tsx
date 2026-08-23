import { act, ComponentProps, useState } from "react"
import { createRoot, Root } from "react-dom/client"

import DesktopPanel from "./desktoppanel"

const reactEnvironment = globalThis as typeof globalThis & {
  IS_REACT_ACT_ENVIRONMENT?: boolean,
}

type TestPanelProps = Omit<
  ComponentProps<typeof DesktopPanel>,
  "boundedHeight" | "collapsed" | "onCollapsedChange"
>

const TestDesktopPanel = (props: TestPanelProps) => {
  const [collapsed, setCollapsed] = useState(false)
  return <DesktopPanel
    {...props}
    boundedHeight={props.height}
    collapsed={collapsed}
    onCollapsedChange={setCollapsed}
  />
}

describe("DesktopPanel", () => {
  let container: HTMLDivElement
  let previousActEnvironment: boolean | undefined
  let root: Root
  let wide = false
  const onWideChange = jest.fn((nextWide: boolean) => { wide = nextWide })

  beforeEach(() => {
    previousActEnvironment = reactEnvironment.IS_REACT_ACT_ENVIRONMENT
    reactEnvironment.IS_REACT_ACT_ENVIRONMENT = true
    container = document.createElement("div")
    document.body.appendChild(container)
    root = createRoot(container)
    act(() => root.render(
      <TestDesktopPanel
        below={false}
        expandedWidth={720}
        height={600}
        onBelowChange={jest.fn()}
        wide={wide}
        onWideChange={onWideChange}>
        <div id="debug-section">panel content</div>
      </TestDesktopPanel>,
    ))
  })

  afterEach(() => {
    act(() => root.unmount())
    container.remove()
    reactEnvironment.IS_REACT_ACT_ENVIRONMENT = previousActEnvironment
    wide = false
    onWideChange.mockClear()
  })

  it("collapses to its restore control without discarding panel content", () => {
    const panel = container.querySelector<HTMLElement>(".desktop-panel-shell")
    const body = container.querySelector<HTMLElement>(".desktop-panel-body")
    const button = container.querySelector<HTMLButtonElement>(".desktop-panel-collapse-toggle")
    if (!panel || !body || !button) throw new Error("Desktop panel was not rendered")

    expect(panel.style.width).toBe("720px")
    expect(body.hidden).toBe(false)
    expect(button.getAttribute("aria-expanded")).toBe("true")
    expect(button.getAttribute("aria-label")).toBe("Hide side panel")

    act(() => button.click())

    expect(panel.style.width).toBe("34px")
    expect(panel.style.height).toBe("34px")
    expect(body.hidden).toBe(true)
    expect(body.textContent).toContain("panel content")
    expect(button.getAttribute("aria-expanded")).toBe("false")
    expect(button.getAttribute("aria-label")).toBe("Show side panel")

    act(() => button.click())

    expect(panel.style.width).toBe("720px")
    expect(body.hidden).toBe(false)
  })

  it("offers a separate width toggle while the panel is open", () => {
    const button = container.querySelector<HTMLButtonElement>(".desktop-panel-width-toggle")
    if (!button) throw new Error("Desktop panel width toggle was not rendered")

    expect(button.getAttribute("aria-pressed")).toBe("false")
    expect(button.getAttribute("aria-label")).toBe("Widen side panel")

    act(() => button.click())

    expect(onWideChange).toHaveBeenCalledWith(true)
  })

  it("matches keyboard order to the red, yellow, green visual order", () => {
    expect(Array.from(container.querySelectorAll<HTMLButtonElement>(".desktop-panel-toggle"))
      .map(button => button.classList[1])).toEqual([
        "desktop-panel-orientation-toggle",
        "desktop-panel-collapse-toggle",
        "desktop-panel-width-toggle",
      ])
  })

  it("keeps a wide shell bounded until its content explicitly expands it", () => {
    act(() => root.render(
      <TestDesktopPanel
        below={false}
        expandedWidth={760}
        height={780}
        onBelowChange={jest.fn()}
        wide
        onWideChange={onWideChange}>
        <div id="debug-section">panel content</div>
      </TestDesktopPanel>,
    ))

    const panel = container.querySelector<HTMLElement>(".desktop-panel-shell")
    expect(panel?.classList.contains("desktop-panel-wide")).toBe(true)
    expect(panel?.style.height).toBe("780px")
    expect(panel?.style.minHeight).toBe("")
    expect(panel?.style.width).toBe("760px")
    expect(panel?.style.getPropertyValue("--desktop-panel-height")).toBe("780px")
    expect(panel?.style.getPropertyValue("--desktop-bounded-panel-height")).toBe("780px")
    expect(container.querySelector<HTMLButtonElement>(".desktop-panel-width-toggle")
      ?.getAttribute("aria-pressed")).toBe("true")
  })

  it("hides the width toggle while the panel is collapsed", () => {
    const collapse = container.querySelector<HTMLButtonElement>(".desktop-panel-collapse-toggle")
    if (!collapse) throw new Error("Desktop panel collapse toggle was not rendered")

    act(() => collapse.click())

    expect(container.querySelector(".desktop-panel-width-toggle")).toBeNull()
  })

  it("offers a separate orientation toggle", () => {
    const onBelowChange = jest.fn()
    act(() => root.render(
      <TestDesktopPanel
        below={false}
        expandedWidth={720}
        height={600}
        onBelowChange={onBelowChange}
        wide={false}
        onWideChange={onWideChange}>
        <div id="debug-section">panel content</div>
      </TestDesktopPanel>,
    ))
    const button = container.querySelector<HTMLButtonElement>(".desktop-panel-orientation-toggle")
    if (!button) throw new Error("Desktop panel orientation toggle was not rendered")

    expect(button.getAttribute("aria-pressed")).toBe("false")
    expect(button.getAttribute("aria-label")).toBe("Move side panel below emulator")

    act(() => button.click())

    expect(onBelowChange).toHaveBeenCalledWith(true)
    expect(container.querySelector(".desktop-panel-moving-below")).toBeNull()
  })

  it("keeps all three layout controls available below the emulator", () => {
    act(() => root.render(
      <TestDesktopPanel
        below
        expandedWidth={720}
        height={600}
        onBelowChange={jest.fn()}
        wide={false}
        onWideChange={onWideChange}>
        <div id="debug-section">panel content</div>
      </TestDesktopPanel>,
    ))

    const panel = container.querySelector<HTMLElement>(".desktop-panel-shell")
    const button = container.querySelector<HTMLButtonElement>(".desktop-panel-orientation-toggle")
    const width = container.querySelector<HTMLButtonElement>(".desktop-panel-width-toggle")
    expect(panel?.classList.contains("desktop-panel-below")).toBe(true)
    expect(width?.disabled).toBe(true)
    expect(width?.getAttribute("aria-label")).toBe("Width control is available beside the emulator")
    expect(button?.getAttribute("aria-pressed")).toBe("true")
    expect(button?.getAttribute("aria-label")).toBe("Move side panel beside emulator")
  })

  it("collapses a below-panel layout vertically instead of leaving an empty row", () => {
    act(() => root.render(
      <TestDesktopPanel
        below
        expandedWidth={720}
        height={600}
        onBelowChange={jest.fn()}
        wide={false}
        onWideChange={onWideChange}>
        <div id="debug-section">panel content</div>
      </TestDesktopPanel>,
    ))
    const panel = container.querySelector<HTMLElement>(".desktop-panel-shell")
    const collapse = container.querySelector<HTMLButtonElement>(".desktop-panel-collapse-toggle")
    if (!panel || !collapse) throw new Error("Below-panel layout was not rendered")

    act(() => collapse.click())

    expect(panel.style.width).toBe("720px")
    expect(panel.style.height).toBe("34px")
  })
})
