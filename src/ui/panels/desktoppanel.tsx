import { CSSProperties, ReactNode, useLayoutEffect, useRef } from "react"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import {
  faChevronDown,
  faChevronLeft,
  faChevronRight,
  faChevronUp,
} from "@fortawesome/free-solid-svg-icons"

import { useTranslation } from "../../i18n/useTranslation"
import { desktopLayoutPolicy } from "../layout"

type DesktopPanelStyle = CSSProperties & {
  "--desktop-bounded-panel-height": string,
  "--desktop-panel-height": string,
}

const DesktopPanel = ({
  children,
  boundedHeight,
  collapsed,
  expandedWidth,
  height,
  below,
  onBelowChange,
  onCollapsedChange,
  wide,
  onWideChange,
}: {
  children: ReactNode,
  boundedHeight: number,
  collapsed: boolean,
  expandedWidth: number,
  height: number,
  below: boolean,
  onBelowChange: (below: boolean) => void,
  onCollapsedChange: (collapsed: boolean) => void,
  wide: boolean,
  onWideChange: (wide: boolean) => void,
}) => {
  const { t } = useTranslation()
  const panelRef = useRef<HTMLDivElement>(null)
  const revealAfterMove = useRef(false)
  const title = collapsed
    ? t("controls.showSidePanel")
    : t("controls.hideSidePanel")

  useLayoutEffect(() => {
    if (!revealAfterMove.current) return
    revealAfterMove.current = false
    const target = below
      ? panelRef.current?.querySelector(".dbg-tab-row")
      : panelRef.current
    target?.scrollIntoView({
      behavior: "auto",
      block: "nearest",
      inline: "nearest",
    })
  }, [below])

  const handleOrientationChange = () => {
    revealAfterMove.current = true
    onBelowChange(!below)
  }

  return (
    <div
      ref={panelRef}
      className={`desktop-tab-column desktop-panel-shell${collapsed ? " desktop-panel-collapsed" : ""}${below ? " desktop-panel-below" : ""}${wide && !below ? " desktop-panel-wide" : ""}`}
      style={{
        "--desktop-bounded-panel-height": `${boundedHeight}px`,
        "--desktop-panel-height": `${height}px`,
        height: collapsed ? desktopLayoutPolicy.collapsedPanelSize : boundedHeight,
        width: collapsed && !below ? desktopLayoutPolicy.collapsedPanelSize : expandedWidth,
      } as DesktopPanelStyle}>
      <div className="desktop-panel-controls">
        {!collapsed && <button
          type="button"
          className="desktop-panel-toggle desktop-panel-orientation-toggle"
          aria-pressed={below}
          aria-label={below
            ? t("controls.moveSidePanelBeside")
            : t("controls.moveSidePanelBelow")}
          title={below
            ? t("controls.moveSidePanelBeside")
            : t("controls.moveSidePanelBelow")}
          onClick={handleOrientationChange}>
          <span className="desktop-panel-orientation-glyph" aria-hidden="true">↻</span>
        </button>}
        <button
          type="button"
          className="desktop-panel-toggle desktop-panel-collapse-toggle"
          aria-controls="debug-section"
          aria-expanded={!collapsed}
          aria-label={title}
          title={title}
          onClick={() => onCollapsedChange(!collapsed)}>
          <FontAwesomeIcon icon={below
            ? (collapsed ? faChevronDown : faChevronUp)
            : (collapsed ? faChevronRight : faChevronLeft)} />
        </button>
        {!collapsed && <button
          type="button"
          className="desktop-panel-toggle desktop-panel-width-toggle"
          disabled={below}
          aria-pressed={wide}
          aria-label={below
            ? t("controls.sidePanelWidthAvailableBeside")
            : wide
            ? t("controls.restoreSidePanelWidth")
            : t("controls.widenSidePanel")}
          title={below
            ? t("controls.sidePanelWidthAvailableBeside")
            : wide
            ? t("controls.restoreSidePanelWidth")
            : t("controls.widenSidePanel")}
          onClick={() => onWideChange(!wide)}>
          {wide ? "><" : "< >"}
        </button>}
      </div>
      <div className="desktop-panel-body" hidden={collapsed}>
        {children}
      </div>
    </div>
  )
}

export default DesktopPanel
