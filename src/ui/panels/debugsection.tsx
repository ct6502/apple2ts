import "./debugsection.css"
import DisassemblyPanel from "./disassemblypanel"
import TimeTravelPanel from "./timetravelpanel"
import State6502Controls from "./state6502controls"
import MemoryDump from "./memorydump"
import BreakpointsView from "./breakpointsview"
import MemoryMap from "./memorymap"
import StackDump from "./stackdump"

const DebugSection = () => {
  return (
    <div className="flex-column-gap">
      <State6502Controls />
      <div className="flex-row-gap">
        <DisassemblyPanel />
        <div className="flex-column-gap">
          <div className="flex-row-gap round-rect-border"  id="tour-debug-info">
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
  )
}

export default DebugSection
