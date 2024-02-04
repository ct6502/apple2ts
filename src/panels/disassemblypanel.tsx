import React from "react";
import DisassemblyControls from "./disassemblycontrols";
import DisassemblyView from "./disassemblyview";
import BreakpointsView from "./breakpointsview";
import { passBreakpoints } from "../main2worker";
import { BreakpointMap } from "./breakpoint";

class DisassemblyPanel extends React.Component<object,
  {
    breakpoints: BreakpointMap;
    setBreakpoints: (breakpoints: BreakpointMap) => void;
  }> {
  constructor(props: object) {
    super(props);
    this.state = {
      breakpoints: new Map(),
      setBreakpoints: (breakpoints: BreakpointMap) => {
        this.setState({ breakpoints })
        passBreakpoints(breakpoints)
      },
    };
  }

  render() {
    return (
      <div className="roundRectBorder">
        <p className="defaultFont panelTitle bgColor">Disassembly</p>
        <DisassemblyControls />
        <DisassemblyView {...this.state} />
        <BreakpointsView {...this.state} />
      </div>
    )
  }
}

export default DisassemblyPanel
