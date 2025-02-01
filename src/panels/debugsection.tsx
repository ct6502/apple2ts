import "./debugsection.css"
import DisassemblyPanel from "./disassemblypanel";
import TimeTravelPanel from "./timetravelpanel";
import State6502Controls from "./state6502controls";
import DebugInfoPanel from "./debuginfopanel";
import MemoryDump from "./memorydump";
import BreakpointsView from "./breakpointsview";

const DebugSection = () => {
  return (
    <div className="flex-column-gap">
      <State6502Controls />
      <div className="flex-row-gap">
        <DisassemblyPanel />
        <DebugInfoPanel />
        <MemoryDump />
      </div>
      <div className="flex-row-gap">
        <BreakpointsView />
        <TimeTravelPanel />
      </div>
    </div>
  )
}

export default DebugSection;
