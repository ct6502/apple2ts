import "./panels.css"
import Flyout from "../flyout"
import { faInfo as faHelp, faInfoCircle, faBug, faCode, faRobot, faDesktop } from "@fortawesome/free-solid-svg-icons"
import { faApple } from "@fortawesome/free-brands-svg-icons"
import { handleGetMachineName, handleGetShowDebugTab, handleGetSlotConfig, passSetIsDebugging, passSetShowDebugTab } from "../main2worker"
import { getHelpText, getInfoPanel, getTabView, getTheme, getUIStateBoolean, INFO_PANEL_COLLAPSED_EVENT, isMinimalTheme, setTabView, setUIStateBoolean } from "../ui_settings"
import { useEffect, useState } from "react"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import DebugTab from "./debugtab"
import ExpectinTab from "./expectin/expectintab"
import HelpTab from "./help/helptab"
import BasicTab from "./basic/basic_tab"
import { useTranslation } from "../../i18n/useTranslation"
import AgentTab from "./agent/agent_tab"
import VeraTab from "./vera/veratab"
import { isDefaultHelp } from "./help/helpselection"
import { SETTINGS_CHANGED_EVENT } from "../settingschange"
import { VERA_VIDEO_STARTED_EVENT } from "../vera_events"
import { getPanelTabVisibility } from "./paneltabs"

const DebugSection = (props: { updateDisplay: UpdateDisplay, narrow: boolean, minimalPresentation?: boolean }) => {

  const [activeTab, setActiveTab] = useState<number>(() => {
    const requestedTab = getTabView()
    const visibility = getPanelTabVisibility(handleGetMachineName(), handleGetSlotConfig())
    return ((requestedTab === 1 && !visibility.showDebugTab) ||
      (requestedTab === 3 && !visibility.showExpectinTab) ||
      (requestedTab === 4 && !visibility.showVeraTab)) ? 0 : requestedTab
  })
  const [flyoutOpen, setFlyoutOpen] = useState<boolean>(getInfoPanel())
  const [slotConfig, setSlotConfig] = useState<SlotConfig>(() => ({ ...handleGetSlotConfig() }))
  const [machineName, setMachineName] = useState<MACHINE_NAME>(() => handleGetMachineName())
  const { showDebugTab, showExpectinTab, showVeraTab } = getPanelTabVisibility(machineName, slotConfig)
  const isFlyoutOpen = flyoutOpen
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
    setTabView(tabIndex)
    event.stopPropagation()
    forceRefresh()
    passSetIsDebugging(tabIndex == 1)
  }

  // Do not allow debug panels to be shown in minimal theme on small devices
  const isSmall = useMinimalPresentation && window.innerWidth < 800

  if (handleGetShowDebugTab()) {
    // Consume the request even when the tab is hidden, so switching back to a
    // machine that has the debugger does not open it unexpectedly later.
    passSetShowDebugTab(false)
    if (showDebugTab) {
      setUIStateBoolean("infoPanel", true)
      setFlyoutOpen(true)
      passSetIsDebugging(true)
      setActiveTab(1)
    }
  }

  // A tab that the current machine or slot layout no longer allows must not
  // stay selected: fall back to the info tab (the state update is safe here
  // because it only runs once for the render that hid the tab).
  if ((activeTab === 1 && !showDebugTab) ||
    (activeTab === 3 && !showExpectinTab) ||
    (activeTab === 4 && !showVeraTab)) {
    setActiveTab(0)
  }

  useEffect(() => {
    forceRefresh()
  }, [isFlyoutOpen])

  useEffect(() => {
    const handleSettingsChanged = () => {
      const visibility = getPanelTabVisibility(handleGetMachineName(), handleGetSlotConfig())
      const requestedTab = getTabView()
      const tab = ((requestedTab === 1 && !visibility.showDebugTab) ||
        (requestedTab === 3 && !visibility.showExpectinTab) ||
        (requestedTab === 4 && !visibility.showVeraTab)) ? 0 : requestedTab
      setActiveTab(tab)
      setTabView(tab)
      passSetIsDebugging(tab === 1)
      setFlyoutOpen(getInfoPanel())
      setSlotConfig({ ...handleGetSlotConfig() })
      setMachineName(handleGetMachineName())
    }
    window.addEventListener(SETTINGS_CHANGED_EVENT, handleSettingsChanged)

    // A VERA title that was not launched with an explicit tab request (a disk
    // loaded from the Internet Archive Software Library or a local file) only
    // announces itself by starting to draw, so open the monitor on its first
    // frame instead of leaving the panel on whatever tab was selected.
    const handleVeraVideoStarted = () => {
      const visibility = getPanelTabVisibility(handleGetMachineName(), handleGetSlotConfig())
      if (!visibility.showVeraTab) return
      setSlotConfig({ ...handleGetSlotConfig() })
      setMachineName(handleGetMachineName())
      setUIStateBoolean("infoPanel", true)
      setTabView(4)
      setActiveTab(4)
      passSetIsDebugging(false)
      setFlyoutOpen(true)
    }
    window.addEventListener(VERA_VIDEO_STARTED_EVENT, handleVeraVideoStarted)

    return () => {
      window.removeEventListener(SETTINGS_CHANGED_EVENT, handleSettingsChanged)
      window.removeEventListener(VERA_VIDEO_STARTED_EVENT, handleVeraVideoStarted)
    }
  }, [])

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
        setFlyoutOpen(nextIsOpen)
        if (!nextIsOpen) {
          window.dispatchEvent(new Event(INFO_PANEL_COLLAPSED_EVENT))
        }
        forceRefresh()
      }}>
      <div id="debug-section" className={`${props.narrow ? "flex-column" : "flex-row"}${useMinimalPresentation ? " minimal-presentation" : ""}`}>
        {!isSmall && <div className={`${props.narrow ? "flex-row" : "flex-column"} dbg-tab-row dbg-tab-row-${tabOrientation}`}>
          <div
            className={`dbg-tab ${tabClass} ${activeTab == 0 ? " dbg-tab-active" : ""}`}
            title={t("debug.helpTab")}
            onClick={handleTabClick(0)}>
            <FontAwesomeIcon icon={faHelp} size="lg" />
          </div>
          {showDebugTab &&
            <div
              className={`dbg-tab ${tabClass} ${activeTab == 1 ? " dbg-tab-active" : ""}`}
              title={t("debug.debugTab")}
              id="tour-debug-button"
              onClick={handleTabClick(1)}>
              <FontAwesomeIcon icon={faBug} size="lg" />
            </div>
          }
          <div
            className={`dbg-tab ${tabClass} ${activeTab == 2 ? " dbg-tab-active" : ""}`}
            title={t("debug.basicTab")}
            onClick={handleTabClick(2)}>
            <b>{"]"}</b><FontAwesomeIcon icon={faApple as never} size="lg" />
          </div>
          {showExpectinTab &&
            <div
              className={`dbg-tab ${tabClass} ${activeTab == 3 ? " dbg-tab-active" : ""}`}
              title={t("debug.expectinTab")}
              onClick={handleTabClick(3)}>
              <FontAwesomeIcon icon={faCode} size="lg" />
            </div>
          }
          {showVeraTab &&
            <div
              className={`dbg-tab ${tabClass} ${activeTab == 4 ? " dbg-tab-active" : ""}`}
              title={t("debug.veraMonitor")}
              onClick={handleTabClick(4)}>
              <FontAwesomeIcon icon={faDesktop} size="lg" />
            </div>
          }
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
            useOpenAppleKey={getUIStateBoolean("useOpenAppleKey")}
          />
        }
        {(activeTab == 1 && !isSmall && showDebugTab) &&
          <DebugTab updateDisplay={props.updateDisplay} />
        }
        {(activeTab == 2 && !isSmall) && 
          <BasicTab updateDisplay={props.updateDisplay} />
        }
        {(activeTab == 3 && !isSmall && showExpectinTab) &&
          <ExpectinTab />
        }
        {(activeTab == 4 && !isSmall && showVeraTab) && 
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
