import { getTextPage1, processInstruction } from "./interp";
import {
  bank0,
  setPC,
  getProcessorStatus
} from "./instructions";
import { parseAssembly } from "./assembler";
import { Buffer } from "buffer";

import React from "react";
// import Test from "./components/test";

class DisplayApple2 extends React.Component<{}, { counter: number }> {
  timerID: ReturnType<typeof setInterval> | undefined;

  constructor(props: any) {
    super(props);
    this.state = { counter: 0 };
  }

  componentDidMount() {
    this.timerID = setInterval(() => this.advance());

    const code = `
LDX #$00
LDY #65
STX $2008
STY $0400
INX
BNE $F7
INC $2009
INC $2003
JMP $2000
BRK
`;
    let pcode = parseAssembly(code.split("\n"));
    bank0.set(pcode, 0x2000);
    setPC(0x2000);
  }

  componentWillUnmount() {
    if (this.timerID) clearInterval(this.timerID);
  }

  advance() {
    processInstruction();
    this.setState({
      counter: this.state.counter + 1,
    });
    if (this.state.counter > 4400 && this.timerID) {
      clearInterval(this.timerID);
    }
  }

  render() {
    const textPage = getTextPage1();
    var textOutput = "";
    for (var i = 0; i < 24; i++) {
      const str = Buffer.from(textPage.slice(i * 40, (i + 1) * 40)).toString(
        "utf-8"
      );
      textOutput += str + "\n";
    }

    return (
      <div>
        <pre>{textOutput}</pre>
        {getProcessorStatus()}
        <br />
        {this.state.counter}
      </div>
    );
  }
}

export default DisplayApple2;
