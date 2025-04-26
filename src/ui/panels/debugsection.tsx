import "./debugsection.css"
import DisassemblyPanel from "./disassemblypanel"
import TimeTravelPanel from "./timetravelpanel"
import State6502Controls from "./state6502controls"
import MemoryDump from "./memorydump"
import BreakpointsView from "./breakpointsview"
import MemoryMap from "./memorymap"
import StackDump from "./stackdump"
import Flyout from "../flyout"
import { faBug, faTerminal } from "@fortawesome/free-solid-svg-icons"
import { handleGetIsDebugging } from "../main2worker"
import { UI_THEME } from "../../common/utility"
import { setPreferenceDebugMode } from "../localstorage"
import { getTheme } from "../ui_settings"
import { useEffect, useState } from "react"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import defaultExpectin from "./default_expectin.json"
import { Expectin } from "../expectin"

const DebugSection = (props: { updateDisplay: UpdateDisplay }) => {

  const isMinimalTheme = getTheme() == UI_THEME.MINIMAL
  const [activeTab, setActiveTab] = useState<number>(0)
  const [expectinObject, setExpectinObject] = useState<Expectin>()
  const [expectinText, setExpectinText] = useState<string>(JSON.stringify(defaultExpectin, null, 2))
  const [expectinError, setExpectinError] = useState<string>("")

  if (isMinimalTheme) {
    import("./debugsection.minimal.css")
  }

  useEffect(() => {
    try {
      new Expectin(expectinText)
      setExpectinError("")
    } catch (error) {
      setExpectinError(`${error}`)
    }
  }, [expectinText])

  const handleTabClick = (tabIndex: number) => (event: React.MouseEvent<HTMLElement>) => {
    setActiveTab(tabIndex)
    event.stopPropagation()
  }

  const handleTextAreaChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
    const elem = event.target as HTMLTextAreaElement
    setExpectinText(elem.value)
  }

  const handleTextAreaKeyDown = (event: React.KeyboardEvent<HTMLElement>) => {
    const elem = event.target as HTMLTextAreaElement

    if (event.key === "Tab") {
      const v = elem.value
      const s = elem.selectionStart
      const e = elem.selectionEnd

      elem.value = v.substring(0, s) + "  " + v.substring(e)
      elem.selectionStart = elem.selectionEnd = s + 2

      event.preventDefault()
      return false
    }
  }

  const handleExpectButtonClick = async () => {
    if (expectinObject && expectinObject.IsRunning()) {
      expectinObject.Cancel()
      setExpectinObject(undefined)
    } else {
      const expectin = new Expectin(expectinText)
      expectin.Run()
      setExpectinObject(expectin)
    }
  }

  return (
    <Flyout
      icon={faBug}
      position="bottom-right"
      width={`max( ${getTheme() == UI_THEME.MINIMAL ? "41.25vw" : "41.25vw"}, 386px )`}
      title="debug panel"
      isOpen={handleGetIsDebugging}
      onClick={() => {
        setPreferenceDebugMode(!handleGetIsDebugging())
        props.updateDisplay()
      }}
      buttonId={isMinimalTheme ? "tour-debug-button" : ""}>
      <div className="dbg-panel">
        <div className="dbg-tab-row">
          <div
            className={`dbg-tab ${activeTab == 0 ? " dbg-tab-active" : ""}`}
            title="Show debugging panel"
            onClick={handleTabClick(0)}>
            <FontAwesomeIcon icon={faBug} size="lg" />
          </div>
          <div
            className={`dbg-tab ${activeTab == 1 ? " dbg-tab-active" : ""}`}
            title="Show Apple exPectin panel"
            onClick={handleTabClick(1)}>
            <FontAwesomeIcon icon={faTerminal} size="lg" />
          </div>
        </div>
        {activeTab == 0 &&
          <div className="flex-column-gap debug-section" id="debug-section">
            <State6502Controls />
            <div className="flex-row-gap">
              <DisassemblyPanel />
              <div className="flex-column-gap">
                <div className="flex-row-gap round-rect-border" id="tour-debug-info">
                  <StackDump />
                  <MemoryMap updateDisplay={props.updateDisplay} />
                </div>
                <MemoryDump />
              </div>
            </div>
            <div className="flex-row-gap">
              <BreakpointsView updateDisplay={props.updateDisplay} />
              <TimeTravelPanel />
            </div>
          </div>}
        {activeTab == 1 &&
          <div className="dbg-expectin-panel">
            <textarea
              className="dbg-expectin-textarea"
              autoComplete="off"
              autoCorrect="off"
              spellCheck="false"
              readOnly={expectinObject?.IsRunning()}
              onChange={handleTextAreaChange}
              onKeyDown={handleTextAreaKeyDown}
              defaultValue={expectinText} />
            <div className="dbg-expectin-button-row">
              <div
                style={{ gridColumn: expectinError === "" ? "span 1" : "span 2" }}
                title={expectinError}
                className="dbg-expectin-error">{expectinError}</div>
              {expectinError === "" && <button
                className="dbg-expect-button"
                onClick={handleExpectButtonClick}>{expectinObject?.IsRunning() ? "Stop" : "Run"}</button>}
            </div>
          </div>}
      </div>
    </Flyout>
  )
}

export default DebugSection
