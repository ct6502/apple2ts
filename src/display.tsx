import { getTextPage1, processInstruction } from "./interp";
import {
  bank0,
  isBreak,
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
START   LDA #65   ; "A"
LOOP    STA $0400
        INC LOOP+1
        BNE LOOP
        INC LOOP+2
        INC START+1
        CMP #69   ; "E"
        BCC START
        BRK
`;
    let pcode = parseAssembly(0x2000, code.split("\n"));
    bank0.fill(46)
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
    if (isBreak() && this.timerID) {
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
