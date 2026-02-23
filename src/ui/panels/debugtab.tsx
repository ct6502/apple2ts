import "./panels.css"
import DisassemblyPanel from "./disassembly/disassemblypanel"
import TimeTravelPanel from "./timetravelpanel"
import State6502Controls from "./state6502controls"
import MemoryDump from "./memory/memorydump"
import BreakpointsView from "./breakpoints/breakpointsview"
import MemoryMap from "./memory/memorymap"
import StackDump from "./stackdump"
import { isMinimalTheme } from "../ui_settings"

const DebugTab = (props: { updateDisplay: UpdateDisplay }) => {

  if (isMinimalTheme()) {
    import("./panels.minimal.css")
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
