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
import { handleGetIsDebugging, handleGetTheme } from "../main2worker"
import { UI_THEME } from "../../common/utility"
import { setPreferenceDebugMode } from "../localstorage"

const DebugSection = (props: {updateDisplay: UpdateDisplay}) => {
  return (
    <Flyout
      icon={faBug}
      position="bottom-right"
      isOpen={handleGetIsDebugging}
      onClick={() => {
        setPreferenceDebugMode(!handleGetIsDebugging())
        props.updateDisplay()
      }}
      buttonId={handleGetTheme() == UI_THEME.MINIMAL ? "tour-debug-button" : ""}>
      <div className="flex-column-gap debug-section" id="debug-section">
        <State6502Controls />
        <div className="flex-row-gap">
          <DisassemblyPanel />
          <div className="flex-column-gap">
            <div className="flex-row-gap round-rect-border" id="tour-debug-info">
              <StackDump />
              <MemoryMap />
            </div>
            <MemoryDump />
          </div>
        </div>
        <div className="flex-row-gap">
          <BreakpointsView />
          <TimeTravelPanel />
        </div>
      </div>
    </Flyout>
  )
}

export default DebugSection
