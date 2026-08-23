import { desktopLayoutPolicy, getDesktopLayout } from "./layout"

describe("desktop layout", () => {
  it("reserves a stable panel before sizing the monitor", () => {
    expect(getDesktopLayout(1200, 800)).toEqual({
      boundedPanelHeight: 575,
      monitorWidth: 653,
      panelHeight: 575,
      panelWidth: 520,
      screenHeight: 447,
      screenWidth: 653,
    })
  })

  it("gives unused width to the panel after the monitor reaches its height limit", () => {
    const layout = getDesktopLayout(1800, 800)
    expect(layout.screenHeight).toBe(652)
    expect(layout.screenWidth).toBe(950)
    expect(layout.panelHeight).toBe(780)
    expect(layout.panelWidth).toBe(760)
    expect(layout.screenHeight
      + desktopLayoutPolicy.controlStripHeight
      + desktopLayoutPolicy.deviceStripHeight).toBe(780)
  })

  it("grows the normal panel into width unused by the monitor", () => {
    const layout = getDesktopLayout(1404, 608)
    expect(layout.screenWidth).toBe(670)
    expect(layout.panelWidth).toBe(707)
  })

  it("widens the panel while preserving a usable monitor", () => {
    expect(getDesktopLayout(1200, 800, { widePanel: true })).toEqual({
      boundedPanelHeight: 575,
      monitorWidth: 570,
      panelHeight: 780,
      panelWidth: 760,
      screenHeight: 390,
      screenWidth: 570,
    })
  })

  it("caps the wide panel and leaves extra space to the monitor", () => {
    const layout = getDesktopLayout(1800, 800, { widePanel: true })
    expect(layout.panelHeight).toBe(780)
    expect(layout.panelWidth).toBe(760)
    expect(layout.screenWidth).toBe(950)
  })

  it("keeps the debugger content-sized when the page must scroll", () => {
    expect(getDesktopLayout(700, 800, { widePanel: true })).toEqual({
      boundedPanelHeight: 518,
      monitorWidth: 570,
      panelHeight: 780,
      panelWidth: 760,
      screenHeight: 390,
      screenWidth: 570,
    })
  })

  it("reclaims the side-panel grid track when the panel is collapsed", () => {
    expect(getDesktopLayout(1200, 800, {
      panelCollapsed: true,
      widePanel: true,
    })).toEqual({
      boundedPanelHeight: 575,
      monitorWidth: 950,
      panelHeight: 780,
      panelWidth: 34,
      screenHeight: 652,
      screenWidth: 950,
    })
  })

  it("lets the monitor reclaim the row when the panel moves below it", () => {
    expect(getDesktopLayout(1200, 800, { panelBelow: true })).toEqual({
      boundedPanelHeight: 814,
      monitorWidth: 950,
      panelHeight: 814,
      panelWidth: 950,
      screenHeight: 652,
      screenWidth: 950,
    })
  })

  it("ignores the side-panel width mode while the panel is below", () => {
    expect(getDesktopLayout(1200, 800, {
      panelBelow: true,
      widePanel: true,
    })).toEqual(getDesktopLayout(1200, 800, { panelBelow: true }))
  })

  it("preserves both desktop columns when the viewport is unusually narrow", () => {
    expect(getDesktopLayout(700, 800)).toEqual({
      boundedPanelHeight: 518,
      monitorWidth: 570,
      panelHeight: 518,
      panelWidth: 520,
      screenHeight: 390,
      screenWidth: 570,
    })
  })

  it("lets a very short page scroll instead of collapsing the monitor", () => {
    expect(getDesktopLayout(1200, 200)).toEqual({
      boundedPanelHeight: 518,
      monitorWidth: 570,
      panelHeight: 518,
      panelWidth: 603,
      screenHeight: 390,
      screenWidth: 570,
    })
  })

  it("keeps the policy values available to future layout variants", () => {
    expect(desktopLayoutPolicy.collapsedPanelSize).toBe(34)
    expect(desktopLayoutPolicy.controlStripHeight).toBe(66)
    expect(desktopLayoutPolicy.deviceStripHeight).toBe(62)
    expect(desktopLayoutPolicy.horizontalTabHeight).toBe(34)
    expect(desktopLayoutPolicy.panelWidth).toBe(520)
    expect(desktopLayoutPolicy.widePanelWidth).toBe(760)
    expect(desktopLayoutPolicy.widePanelMinHeight).toBe(700)
  })
})
