import React from "react";
import DisassemblyControls from "./disassemblycontrols";
import Disassembly from "./disassembly";

class DisassemblyPanel extends React.Component<object,
  { breakpoints: Breakpoints;
  }> {
  lineHeight = 0 // 13.3333 // 10 * (96 / 72) pixels
  enableScrollEvent = true
  nlines = 40  // should this be an argument?
  timeout = 0
  newScrollAddress = 0
  codeRef = React.createRef<HTMLDivElement>()
  breakpointRef = React.createRef<HTMLDivElement>()
  fakePointRef = React.createRef<SVGSVGElement>()

  constructor(props: object) {
    super(props);
    this.state = {
      breakpoints: new Map(),
    };
  }

  render() {
    return (
      <div className="roundRectBorder">
        <p className="defaultFont panelTitle bgColor">Disassembly</p>
        <DisassemblyControls/>
        <Disassembly/>
      </div>
    )
  }
}

export default DisassemblyPanel
