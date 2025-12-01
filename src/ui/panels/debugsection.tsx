import "./debugsection.css"
import Flyout from "../flyout"
import { faInfo as faHelp, faInfoCircle, faBug, faTerminal } from "@fortawesome/free-solid-svg-icons"
import { handleGetShowDebugTab, passSetDebug, passSetShowDebugTab } from "../main2worker"
import { crc32 } from "../../common/utility"
import { getHelpText, getTheme, isMinimalTheme } from "../ui_settings"
import { useMemo, useState } from "react"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import DebugTab from "./debugtab"
import ExpectinTab from "./expectintab"
import HelpTab from "./helptab"
import { defaultHelpText } from "./defaulthelptext"
import { setPreferenceDebugMode } from "../localstorage"

const defaultHelpTextCrc = crc32(new TextEncoder().encode(defaultHelpText))

const DebugSection = (props: { updateDisplay: UpdateDisplay }) => {

  const [activeTab, setActiveTab] = useState<number>(0)
  const [isFlyoutOpen, setIsFlyoutOpen] = useState(false)
  const [helpTextCrc, setHelpTextCrc] = useState(defaultHelpTextCrc)

  if (isMinimalTheme()) {
    import("./debugsection.minimal.css")
  }

  const currentHelpText = getHelpText()
  const helpText = (currentHelpText.length > 1 && currentHelpText !== "<Default>") ? currentHelpText : defaultHelpText
  const newHelpTextCrc = crc32(new TextEncoder().encode(helpText))
  const showHighlight = !isFlyoutOpen && newHelpTextCrc != helpTextCrc && newHelpTextCrc != defaultHelpTextCrc

  const forceRefresh = () => {
    // Force a refresh to pick up the new canvas size
    setTimeout(() => { window.dispatchEvent(new Event("resize")) }, 100)
  }

  const handleTabClick = (tabIndex: number) => (event: React.MouseEvent<HTMLElement>) => {
    setActiveTab(tabIndex)
    event.stopPropagation()
    forceRefresh()
    if (tabIndex == 1) {
      setPreferenceDebugMode(true)
      passSetDebug(true)
    } else {
      setPreferenceDebugMode(false)
      passSetDebug(false)
    }
  }

  // Do not allow debug panels to be shown in minimal theme on small devices
  const isSmall = isMinimalTheme() && window.innerWidth < 800

  if (handleGetShowDebugTab()) {
    setIsFlyoutOpen(true)
    setActiveTab(1)
    passSetShowDebugTab(false)
  }

  useMemo(() => {
    forceRefresh()
    setHelpTextCrc(newHelpTextCrc)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isFlyoutOpen])

  return (
    <Flyout
      icon={faInfoCircle}
      position="top-right"
      title="debug panel"
      highlight={showHighlight}
      isOpen={() => { return isFlyoutOpen }}
      onClick={() => {
        setIsFlyoutOpen(!isFlyoutOpen)
        props.updateDisplay()
      }}>
      <div id="debug-section">
        {!isSmall && <div className="flex-row dbg-tab-row">
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
        {(activeTab == 0 || isSmall) && <HelpTab helptext={getHelpText()} theme={getTheme()} />}
        {activeTab == 1 && !isSmall && <DebugTab updateDisplay={props.updateDisplay} />}
        {activeTab == 2 && !isSmall && <ExpectinTab />}
      </div>
    </Flyout>
  )
}

export default DebugSection
