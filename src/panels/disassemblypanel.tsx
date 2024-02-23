import { useState } from "react";
import DisassemblyControls from "./disassemblycontrols";
import DisassemblyView from "./disassemblyview";
import BreakpointsView from "./breakpointsview";
import { passBreakpoints } from "../main2worker";
import { BreakpointMap } from "./breakpoint";

const DisassemblyPanel = () => {
  // TODO: This is unfortunate that we need to maintain our own copy
  // of the breakpoints.  It would be better to have the emulator hold them,
  // but if we pass the breakpoints to the emulator, they don't get
  // back here fast enough to update the GUI. 
  const [breakpoints, setBreakpoints] = useState(new BreakpointMap())

  const doSetBreakpoints = (breakpoints: BreakpointMap) => {
    setBreakpoints(breakpoints)
    passBreakpoints(breakpoints)
  }

  return (
    <div className="flex-column-gap">
      <div className="round-rect-border tall-panel">
        <div className="bigger-font">Disassembly</div>
        <DisassemblyControls />
        <DisassemblyView breakpoints={breakpoints} setBreakpoints={doSetBreakpoints} />
      </div>
      <BreakpointsView breakpoints={breakpoints} setBreakpoints={doSetBreakpoints} />
    </div>
  )
}

export default DisassemblyPanel
