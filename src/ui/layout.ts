export const desktopLayoutPolicy = {
  bodyMargin: 20,
  collapsedPanelSize: 34,
  columnGap: 7,
  controlStripHeight: 66,
  // Full disk/printer row below the two-row controls.
  // The natural disk/printer row is about 78px tall and renders at 80%.
  deviceStripHeight: 62,
  horizontalTabHeight: 34,
  // Below this width the device controls become too small to use comfortably.
  minMonitorWidth: 570,
  // 34px tab rail + 486px content. The compact width keeps the monitor useful;
  // the longest Help shortcut translations can wrap when space is constrained.
  panelWidth: 520,
  widePanelWidth: 760,
  widePanelMinHeight: 700,
  screenAspectRatio: 1.4583334,
} as const

export type DesktopLayout = {
  boundedPanelHeight: number,
  monitorWidth: number,
  panelHeight: number,
  panelWidth: number,
  screenHeight: number,
  screenWidth: number,
}

export type DesktopLayoutOptions = {
  panelBelow?: boolean,
  panelCollapsed?: boolean,
  widePanel?: boolean,
}

export const getDesktopLayout = (
  viewportWidth: number,
  viewportHeight: number,
  { panelBelow = false, panelCollapsed = false, widePanel = false }: DesktopLayoutOptions = {},
): DesktopLayout => {
  const requestedWidth = Math.max(0,
    viewportWidth - desktopLayoutPolicy.bodyMargin - desktopLayoutPolicy.columnGap)
  const requestedSidePanelWidth = widePanel
    ? desktopLayoutPolicy.widePanelWidth
    : desktopLayoutPolicy.panelWidth
  const sidePanelWidth = panelCollapsed && !panelBelow
    ? desktopLayoutPolicy.collapsedPanelSize
    : requestedSidePanelWidth
  // Keep both columns usable on a narrow desktop. The page can scroll
  // horizontally instead of collapsing either column or switching layouts.
  const availableWidth = Math.max(
    requestedWidth,
    panelBelow
      ? desktopLayoutPolicy.minMonitorWidth
      : desktopLayoutPolicy.minMonitorWidth + sidePanelWidth,
  )
  const minimumScreenHeight = desktopLayoutPolicy.minMonitorWidth
    / desktopLayoutPolicy.screenAspectRatio
  const availableScreenHeight = Math.max(
    minimumScreenHeight,
    viewportHeight
      - desktopLayoutPolicy.bodyMargin
      - desktopLayoutPolicy.controlStripHeight
      - desktopLayoutPolicy.deviceStripHeight,
  )
  const widthAvailableForMonitor = Math.max(
    Math.min(desktopLayoutPolicy.minMonitorWidth, availableWidth),
    panelBelow ? availableWidth : availableWidth - sidePanelWidth,
  )
  const heightLimited = widthAvailableForMonitor
    >= availableScreenHeight * desktopLayoutPolicy.screenAspectRatio
  const screenHeight = Math.floor(heightLimited
    ? availableScreenHeight
    : widthAvailableForMonitor / desktopLayoutPolicy.screenAspectRatio)
  const screenWidth = Math.max(
    desktopLayoutPolicy.minMonitorWidth,
    Math.floor(heightLimited
      ? screenHeight * desktopLayoutPolicy.screenAspectRatio
      : widthAvailableForMonitor),
  )
  // A normal panel can consume width that would otherwise remain blank once
  // the monitor reaches its height limit. Wide mode still reserves its full
  // width even when it has to reduce the monitor.
  const expandedSidePanelWidth = !widePanel && !panelBelow && !panelCollapsed
    ? Math.min(
      desktopLayoutPolicy.widePanelWidth,
      Math.max(
        desktopLayoutPolicy.panelWidth,
        availableWidth - screenWidth,
      ),
    )
    : sidePanelWidth

  // Wide mode must not shorten code workspaces merely because it gives more
  // horizontal room to the debugger. Preserve the height that the normal
  // side-by-side arrangement would have used.
  const normalAvailableWidth = Math.max(
    requestedWidth,
    desktopLayoutPolicy.minMonitorWidth + desktopLayoutPolicy.panelWidth,
  )
  const normalScreenWidth = Math.max(
    desktopLayoutPolicy.minMonitorWidth,
    normalAvailableWidth - desktopLayoutPolicy.panelWidth,
  )
  const normalScreenHeight = Math.floor(Math.min(
    availableScreenHeight,
    normalScreenWidth / desktopLayoutPolicy.screenAspectRatio,
  ))
  const boundedScreenHeight = widePanel && !panelBelow
    ? normalScreenHeight
    : screenHeight
  const boundedPanelHeight = boundedScreenHeight
    + desktopLayoutPolicy.controlStripHeight
    + desktopLayoutPolicy.deviceStripHeight
    + (panelBelow ? desktopLayoutPolicy.horizontalTabHeight : 0)
  const panelContentHeight = widePanel && !panelBelow
    ? Math.max(
      desktopLayoutPolicy.widePanelMinHeight,
      viewportHeight - desktopLayoutPolicy.bodyMargin,
    )
    : boundedPanelHeight
  const panelHeight = panelContentHeight

  return {
    boundedPanelHeight,
    monitorWidth: screenWidth,
    panelHeight,
    panelWidth: panelBelow ? screenWidth : expandedSidePanelWidth,
    screenHeight,
    screenWidth,
  }
}
