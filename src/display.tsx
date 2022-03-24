import { doBoot6502, doReset, getStatus,
  getProcessorStatus, processInstruction, setDebug } from "./motherboard";
// import { parseAssembly } from "./assembler";
import Apple2Canvas from './canvas'
import { getAudioContext } from "./speaker";
import DiskDrive from "./diskdrive"

import React from "react";
// import Test from "./components/test";

enum STATE {
  IDLE,
  NEED_BOOT,
  NEED_RESET,
  IS_RUNNING,
  PAUSED
}

class DisplayApple2 extends React.Component<{},
  { _6502: STATE; iCycle: number; speedCheck: boolean }> {
  timerID = 0;
  cycles = 0;
  timeDelta = 0;
  speed = Array<number>(100).fill(1020);
  refreshTime = 16.6881
  startTime = 0

  constructor(props: any) {
    super(props);
    this.state = { _6502: STATE.IDLE, iCycle: 0, speedCheck: true };
  }

  doBoot() {
//     const code = `
// START   LDA #$C1     ; (2) "A"
// PRINT   STA $0400    ; (4)
//         INC PRINT+1  ; (6)
//         BNE PRINT    ; (2/3) = 255*13 + 12 = 3327
//         INC PRINT+2  ; (6)
//         INC START+1  ; (6)
//         CMP #$C4     ; (2) "D"
//         BNE START    ; (2/3) = 3327*4 + 19*3 + 18 = 13383 cycles ~ 13.4ms
//         LDX #$F0
// BEEP    LDA $C030
//         BRK
// `;
    doBoot6502();
//    let pcode = parseAssembly(0x2000, code.split("\n"));
//    bank0.set(pcode, 0x2000);
//    setPC(0x2000);
    setDebug(false);
    this.startTime = performance.now();
  }

  componentDidMount() {
    this.doBoot();
    this.setState({ _6502: STATE.IDLE });
    this.timerID = window.setInterval(() => this.advance(), this.refreshTime);
  }

  componentWillUnmount() {
    if (this.timerID) clearInterval(this.timerID);
  }

  advance() {
    const newTime = performance.now()
    this.timeDelta = newTime - this.startTime
    this.startTime = newTime;
    if (this.state._6502 === STATE.IDLE || this.state._6502 === STATE.PAUSED) {
      return;
    }
    if (this.state._6502 === STATE.NEED_BOOT) {
      this.doBoot();
      this.setState({ _6502: STATE.IS_RUNNING });
    } else if (this.state._6502 === STATE.NEED_RESET) {
      doReset();
      this.setState({ _6502: STATE.IS_RUNNING });
    }
    let cycleTotal = 0
    while (true) {
      const cycles = processInstruction();
      if (cycles === 0) {
        this.setState({ _6502: STATE.PAUSED });
        return;
      }
      cycleTotal += cycles;
      if (cycleTotal >= 17030) {
        break;
      }
    }
    const newIndex = (this.state.iCycle + 1) % this.speed.length;
    const currentAvgSpeed = cycleTotal / this.timeDelta / this.speed.length
    this.speed[newIndex] = this.speed[this.state.iCycle] -
      this.speed[newIndex] / this.speed.length + currentAvgSpeed;
    this.setState({
      iCycle: newIndex,
    });
  }

  handleSpeedChange = () => {
    this.speed.fill(1020.484)
    window.clearInterval(this.timerID)
    this.timerID = window.setInterval(() => this.advance(),
      this.state.speedCheck ? 0 : this.refreshTime)
    this.setState({ speedCheck: !this.state.speedCheck });
  };

  render() {
    const delta = (this.timeDelta).toFixed(1)
    const speed = (this.speed[this.state.iCycle] / 1000).toFixed(3)

    return (
      <div>
        <span className="apple2">
          <Apple2Canvas/>
          <br />
          <span className="leftStatus">
            <span className="statusItem">
              Speed (MHz): <span className="fixed">{speed}</span>
            </span>
            <span className="statusItem">
              <label>
                <input
                  type="checkbox"
                  checked={this.state.speedCheck}
                  onChange={this.handleSpeedChange}
                />
                Limit speed
              </label>
            </span>
            <span className="statusItem">
              Delay (ms):{" "}
              <span className="fixed">{delta}</span>
            </span>
            <br />
            <span className="statusItem">
              <span className="fixed">{getProcessorStatus()}</span>
            </span>
            <br />

            <button
              onClick={() => {
                if (getAudioContext().state !== "running") {
                  getAudioContext().resume();
                }
                this.setState({ _6502: STATE.NEED_BOOT });
              }}>
              Boot
            </button>
            <button
              onClick={() => {
                if (getAudioContext().state !== "running") {
                  getAudioContext().resume();
                }
                this.setState({ _6502: STATE.NEED_RESET });
              }}
              disabled={this.state._6502 === STATE.IDLE || this.state._6502 === STATE.NEED_BOOT}
              >
              Reset
            </button>
            <button
              onClick={() => {
                const s =
                  this.state._6502 === STATE.PAUSED
                    ? STATE.IS_RUNNING
                    : STATE.PAUSED;
                this.setState({ _6502: s });
              }}
              disabled={this.state._6502 === STATE.IDLE}>
              {this.state._6502 === STATE.PAUSED ? "Resume" : "Pause"}
            </button>
          </span>
          <span className="rightStatus">
            <span className = "floatRight">
              <DiskDrive/>
            </span>
          </span>
        </span>
        <span className="statusPanel fixed">
          {getStatus()}
        </span>
      </div>
    );
  }
}

export default DisplayApple2;
