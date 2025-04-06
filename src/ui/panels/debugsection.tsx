import "./debugsection.css"
import DisassemblyPanel from "./disassemblypanel"
import TimeTravelPanel from "./timetravelpanel"
import State6502Controls from "./state6502controls"
import MemoryDump from "./memorydump"
import BreakpointsView from "./breakpointsview"
import MemoryMap from "./memorymap"
import StackDump from "./stackdump"
import Flyout from "../flyout"
import { faBug } from "@fortawesome/free-solid-svg-icons"
import { handleGetIsDebugging } from "../main2worker"
import { UI_THEME } from "../../common/utility"
import { setPreferenceDebugMode } from "../localstorage"
import { getTheme } from "../ui_settings"

const DebugSection = (props: {updateDisplay: UpdateDisplay}) => {
  const isMinimalTheme = getTheme() == UI_THEME.MINIMAL

  if (isMinimalTheme) {
    import("./debugsection.minimal.css")
  }

  return (
    <Flyout
      icon={faBug}
      position="bottom-right"
      title="debug panel"
      isOpen={handleGetIsDebugging}
      onClick={() => {
        setPreferenceDebugMode(!handleGetIsDebugging())
        props.updateDisplay()
      }}
      buttonId={isMinimalTheme ? "tour-debug-button" : ""}>
      <div className="flex-column-gap debug-section" id="debug-section">
        <State6502Controls />
        <div className="flex-row-gap">
          <DisassemblyPanel />
          <div className="flex-column-gap">
            <div className="flex-row-gap round-rect-border" id="tour-debug-info">
              <StackDump />
              <MemoryMap updateDisplay={props.updateDisplay}/>
            </div>
            <MemoryDump />
          </div>
        </div>
        <div className="flex-row-gap">
          <BreakpointsView updateDisplay={props.updateDisplay}/>
          <TimeTravelPanel />
        </div>
      </div>
    </Flyout>
  )
}

export default DebugSection
