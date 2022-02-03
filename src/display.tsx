import { getTextPage1, processInstruction, setDebug } from "./interp";
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

const startTime = performance.now();

class DisplayApple2 extends React.Component<{}, { time: number }> {
  timerID: ReturnType<typeof setInterval> | undefined;
  counter = 0

  constructor(props: any) {
    super(props);
    this.state = { time: 0 };
  }

  componentDidMount() {
    this.timerID = setInterval(() => this.advance());

    const code = `
START   LDA #65     ; (2) "A"
LOOP    STA $0400   ; (4)
        INC LOOP+1  ; (6)
        BNE LOOP    ; (2/3) = 255*13 + 12 = 3327
        INC LOOP+2  ; (6)
        INC START+1 ; (6)
        CMP #68     ; (2) "D"
        BNE START   ; (2/3) = 3327*4 + 19*3 + 18 = 13383 cycles ~ 13.4ms
        BRK
`;
    let pcode = parseAssembly(0x2000, code.split("\n"));
    bank0.set(pcode, 0x2000);
    setPC(0x2000)
//    setPC(bank0[0xfffd] * 256 + bank0[0xfffc]);
//    setDebug();
    this.counter = 0;
  }

  componentWillUnmount() {
    if (this.timerID) clearInterval(this.timerID);
  }

  advance() {
    for (let i = 0; i < 4000; i++) {
      processInstruction();
//      this.counter++
      if (isBreak() && this.timerID) {
        clearInterval(this.timerID);
        i = 4001;
        break;
      }
    }
    this.setState({
      time: performance.now() - startTime
    });
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
      <div className="apple2">
        <pre>
          <span className="normal">{textOutput}</span>
        </pre>
        {getProcessorStatus()}
        <br />
        Counter: {this.counter}
        <br />
        Time (ms): {Math.trunc(this.state.time)}
      </div>
    );
  }
}

export default DisplayApple2;
