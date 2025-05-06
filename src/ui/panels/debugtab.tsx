import "./debugsection.css"
import DisassemblyPanel from "./disassemblypanel"
import TimeTravelPanel from "./timetravelpanel"
import State6502Controls from "./state6502controls"
import MemoryDump from "./memorydump"
import BreakpointsView from "./breakpointsview"
import MemoryMap from "./memorymap"
import StackDump from "./stackdump"
import { UI_THEME } from "../../common/utility"
import { getTheme } from "../ui_settings"

const DebugTab = (props: { updateDisplay: UpdateDisplay }) => {

  const isMinimalTheme = getTheme() == UI_THEME.MINIMAL

  if (isMinimalTheme) {
    import("./debugsection.minimal.css")
  }

  return (
    <div className="flex-column-gap debug-section">
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
    </div>
  )
}

export default DebugTab
