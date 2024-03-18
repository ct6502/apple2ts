import DisassemblyControls from "./disassemblycontrols";
import DisassemblyView from "./disassemblyview";
import BreakpointsView from "./breakpointsview";

const DisassemblyPanel = () => {

  return (
    <div className="flex-column-gap">
      <div className="round-rect-border tall-panel">
        <div className="bigger-font">Disassembly</div>
        <DisassemblyControls />
        <DisassemblyView />
      </div>
      <BreakpointsView />
    </div>
  )
}

export default DisassemblyPanel
