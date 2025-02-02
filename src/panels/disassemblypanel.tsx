import DisassemblyControls from "./disassemblycontrols";
import DisassemblyView from "./disassemblyview";

const DisassemblyPanel = () => {

  return (
    <div className="round-rect-border tall-panel wide-panel">
      <div className="bigger-font column-gap">Disassembly</div>
      <DisassemblyControls />
      <DisassemblyView />
    </div>
  )
}

export default DisassemblyPanel
