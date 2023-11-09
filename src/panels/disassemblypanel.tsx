import React from "react";
import DisassemblyControls from "./disassemblycontrols";
import DisassemblyView from "./disassemblyview";
import BreakpointsView from "./breakpointsview";
import { passBreakpoints } from "../main2worker";

class DisassemblyPanel extends React.Component<object,
  { breakpoints: Breakpoints;
    setBreakpoints: (breakpoints: Breakpoints) => void;
  }> {
  constructor(props: object) {
    super(props);
    this.state = {
      breakpoints: new Map(),
      setBreakpoints: (breakpoints: Breakpoints) => {
        this.setState({ breakpoints })
        passBreakpoints(breakpoints)
      },
    };
  }

  render() {
    return (
      <div className="roundRectBorder">
        <p className="defaultFont panelTitle bgColor">Disassembly</p>
        <DisassemblyControls/>
        <DisassemblyView {...this.state}/>
        <BreakpointsView {...this.state}/>
      </div>
    )
  }
}

export default DisassemblyPanel
