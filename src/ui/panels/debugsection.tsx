import "./debugsection.css"
import Flyout from "../flyout"
import { faInfo as faHelp, faInfoCircle, faBug, faTerminal } from "@fortawesome/free-solid-svg-icons"
import { handleGetIsDebugging, handleGetShowDebugTab, passSetDebug, passSetShowDebugTab } from "../main2worker"
import { UI_THEME } from "../../common/utility"
import { setPreferenceDebugMode } from "../localstorage"
import { getHelpText, getTheme } from "../ui_settings"
import { useState } from "react"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import DebugTab from "./debugtab"
import ExpectinTab from "./expectintab"
import HelpTab from "./helptab"

const DebugSection = (props: { updateDisplay: UpdateDisplay }) => {

  const isMinimalTheme = getTheme() == UI_THEME.MINIMAL
  const [activeTab, setActiveTab] = useState<number>(0)

  if (isMinimalTheme) {
    import("./debugsection.minimal.css")
  }

  const handleTabClick = (tabIndex: number) => (event: React.MouseEvent<HTMLElement>) => {
    setActiveTab(tabIndex)
    event.stopPropagation()
    // Force a refresh to pick up the new canvas size
    setTimeout(() => {window.dispatchEvent(new Event("resize"))}, 20)
    if (tabIndex == 1) {
      passSetDebug(true)
    }
  }

  // Do not allow debug panels to be shown in minimal theme on small devices
  const isSmall = isMinimalTheme && window.innerWidth < 800

  if (handleGetShowDebugTab()) {
    setActiveTab(1)
    passSetShowDebugTab(false)
  }

  return (
    <Flyout
      icon={faInfoCircle}
      position="top-right"
      title="debug panel"
      isOpen={handleGetIsDebugging}
      onClick={() => {
        setPreferenceDebugMode(!handleGetIsDebugging())
        props.updateDisplay()
      }}
      buttonId={isMinimalTheme ? "tour-debug-button" : ""}>
      <div id="debug-section">
        {!isSmall && <div className="flex-row">
            <div
              className={`dbg-tab ${activeTab == 0 ? " dbg-tab-active" : ""}`}
              title="Show help panel"
              onClick={handleTabClick(0)}>
              <FontAwesomeIcon icon={faHelp} size="lg" />
            </div>
            <div
              className={`dbg-tab ${activeTab == 1 ? " dbg-tab-active" : ""}`}
              title="Show debugging panel"
               id="tour-debug-button"
              onClick={handleTabClick(1)}>
              <FontAwesomeIcon icon={faBug} size="lg" />
            </div>
            <div
              className={`dbg-tab ${activeTab == 2 ? " dbg-tab-active" : ""}`}
              title="Show Apple exPectin panel"
              onClick={handleTabClick(2)}>
              <FontAwesomeIcon icon={faTerminal} size="lg" />
            </div>
          </div>
        }
        {(activeTab == 0 || isSmall) && <HelpTab helptext={getHelpText()} />}
        {activeTab == 1 && !isSmall && <DebugTab updateDisplay={props.updateDisplay}/>}
        {activeTab == 2 && !isSmall && <ExpectinTab/>}
      </div>
    </Flyout>
  )
}

export default DebugSection
