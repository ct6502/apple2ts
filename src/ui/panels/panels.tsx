import "./panels.css"
import Flyout from "../flyout"
import { faInfo as faHelp, faInfoCircle, faBug, faCode, faRobot, faDesktop } from "@fortawesome/free-solid-svg-icons"
import { faApple } from "@fortawesome/free-brands-svg-icons"
import { handleGetShowDebugTab, passSetDebug, passSetShowDebugTab } from "../main2worker"
import { getHelpText, getInfoPanel, getTabView, getTheme, getUseOpenAppleKey, INFO_PANEL_COLLAPSED_EVENT, isMinimalTheme, setUIStateBoolean } from "../ui_settings"
import { useEffect, useState } from "react"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import DebugTab from "./debugtab"
import ExpectinTab from "./expectin/expectintab"
import HelpTab from "./help/helptab"
import BasicTab from "./basic/basic_tab"
import { useTranslation } from "../../i18n/useTranslation"
import AgentTab from "./agent/agent_tab"
import VeraTab from "./vera/veratab"
import { setPreferenceBoolean } from "../localstorage"
import { isDefaultHelp } from "./help/helpselection"

const DebugSection = (props: { updateDisplay: UpdateDisplay, narrow: boolean, minimalPresentation?: boolean }) => {

  const [activeTab, setActiveTab] = useState<number>(getTabView())
  const isFlyoutOpen = getInfoPanel()
  const useMinimalPresentation = props.minimalPresentation || isMinimalTheme()

  if (useMinimalPresentation) {
    import("./panels.minimal.css")
  }

  const currentHelpText = getHelpText()
  const showHighlight = !isFlyoutOpen && !isDefaultHelp(currentHelpText)

  const { t } = useTranslation()

  const forceRefresh = () => {
    // Force a refresh to pick up the new canvas size
    setTimeout(() => { window.dispatchEvent(new Event("resize")) }, 100)
  }

  const handleTabClick = (tabIndex: number) => (event: React.MouseEvent<HTMLElement>) => {
    if (tabIndex == activeTab) {
      tabIndex = -1
    }
    setActiveTab(tabIndex)
    event.stopPropagation()
    forceRefresh()
    if (tabIndex == 1) {
      setPreferenceBoolean("debugMode", true)
      passSetDebug(true)
    } else {
      setPreferenceBoolean("debugMode", false)
      passSetDebug(false)
    }
  }

  // Do not allow debug panels to be shown in minimal theme on small devices
  const isSmall = useMinimalPresentation && window.innerWidth < 800

  if (handleGetShowDebugTab()) {
    setUIStateBoolean("infoPanel", true)
    setActiveTab(1)
    passSetShowDebugTab(false)
  }

  useEffect(() => {
    forceRefresh()
  }, [isFlyoutOpen])

  const tabOrientation = props.narrow ? "horizontal" : "vertical"
  const tabClass = `dbg-tab-${tabOrientation}`

  return (
    <Flyout
      icon={faInfoCircle}
      position="top-right"
      title={t("controls.debugPanel")}
      hideButtonWhenClosed={props.minimalPresentation}
      minimalPresentation={props.minimalPresentation}
      highlight={showHighlight}
      isOpen={() => { return isFlyoutOpen }}
      onClick={() => {
        const nextIsOpen = !isFlyoutOpen
        setUIStateBoolean("infoPanel", nextIsOpen)
        if (!nextIsOpen) {
          window.dispatchEvent(new Event(INFO_PANEL_COLLAPSED_EVENT))
        }
        props.updateDisplay()
      }}>
      <div id="debug-section" className={`${props.narrow ? "flex-column" : "flex-row"}${useMinimalPresentation ? " minimal-presentation" : ""}`}>
        {!isSmall && <div className={`${props.narrow ? "flex-row" : "flex-column"} dbg-tab-row dbg-tab-row-${tabOrientation}`}>
          <div
            className={`dbg-tab ${tabClass} ${activeTab == 0 ? " dbg-tab-active" : ""}`}
            title={t("debug.helpTab")}
            onClick={handleTabClick(0)}>
            <FontAwesomeIcon icon={faHelp} size="lg" />
          </div>
          <div
            className={`dbg-tab ${tabClass} ${activeTab == 1 ? " dbg-tab-active" : ""}`}
            title={t("debug.debugTab")}
            id="tour-debug-button"
            onClick={handleTabClick(1)}>
            <FontAwesomeIcon icon={faBug} size="lg" />
          </div>
          <div
            className={`dbg-tab ${tabClass} ${activeTab == 2 ? " dbg-tab-active" : ""}`}
            title={t("debug.basicTab")}
            onClick={handleTabClick(2)}>
            <b>{"]"}</b><FontAwesomeIcon icon={faApple as never} size="lg" />
          </div>
          <div
            className={`dbg-tab ${tabClass} ${activeTab == 3 ? " dbg-tab-active" : ""}`}
            title={t("debug.expectinTab")}
            onClick={handleTabClick(3)}>
            <FontAwesomeIcon icon={faCode} size="lg" />
          </div>
          <div
            className={`dbg-tab ${tabClass} ${activeTab == 4 ? " dbg-tab-active" : ""}`}
            title="VERA Monitor"
            onClick={handleTabClick(4)}>
            <FontAwesomeIcon icon={faDesktop} size="lg" />
          </div>
          <div
            className={`dbg-tab ${tabClass} ${activeTab == 5 ? " dbg-tab-active" : ""}`}
            title={t("debug.agentTab")}
            onClick={handleTabClick(5)}>
            <FontAwesomeIcon icon={faRobot} size="lg" />
          </div>
        </div>
        }
        {(activeTab == 0 || isSmall) &&
          <HelpTab
            helptext={getHelpText()}
            minimalPresentation={props.minimalPresentation}
            theme={getTheme()}
            useOpenAppleKey={getUseOpenAppleKey()}
          />
        }
        {(activeTab == 1 && !isSmall) &&
          <DebugTab updateDisplay={props.updateDisplay} />
        }
        {(activeTab == 2 && !isSmall) && 
          <BasicTab updateDisplay={props.updateDisplay} />
        }
        {(activeTab == 3 && !isSmall) && 
          <ExpectinTab />
        }
        {(activeTab == 4 && !isSmall) && 
          <VeraTab />
        }
        {(activeTab == 5 && !isSmall) && 
          <AgentTab />
        }
      </div>
    </Flyout>
  )
}

export default DebugSection
