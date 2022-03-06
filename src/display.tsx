import { doBoot6502, doReset,
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
  { _6502: STATE; tick: number; speedCheck: boolean }> {
  timerID: ReturnType<typeof setInterval> | undefined;
  gamepadID: ReturnType<typeof setInterval> | undefined;
  cycles = 0;
  offset = 15;
  cycleTime = Array<number>(100).fill(0.2);
  iCycle = 0;
  speed = Array<number>(100).fill(1000);
  iSpeed = 0;
  startTime = 0

  constructor(props: any) {
    super(props);
    this.state = { _6502: STATE.IDLE, tick: 0, speedCheck: true };
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
    this.cycles = 0;
    this.startTime = performance.now();
  }

  componentDidMount() {
    this.doBoot();
    this.setState({ _6502: STATE.IDLE });
    this.timerID = setInterval(() => this.advance());
    window.addEventListener("gamepadconnected", function(e) {
      console.log("Gamepad connected at index %d: %s. %d buttons, %d axes.",
      e.gamepad.index, e.gamepad.id,
      e.gamepad.buttons.length, e.gamepad.axes.length);
    })
  }

  componentWillUnmount() {
    if (this.timerID) clearInterval(this.timerID);
    if (this.gamepadID) clearInterval(this.gamepadID);
  }

  advance() {
    const newTime = performance.now();
    if (this.state.speedCheck && newTime - this.startTime < this.offset) {
      return;
    }
    const timeDelta = newTime - this.startTime;
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
    while (true) {
      const cycles = processInstruction();
      if (cycles === 0) {
        this.setState({ _6502: STATE.PAUSED });
        return;
      }
      this.cycles += cycles;
      if (this.cycles >= 17030) {
        break;
      }
    }
    let newIndex = (this.iCycle + 1) % this.cycleTime.length;
    this.cycleTime[newIndex] =
      this.cycleTime[this.iCycle] -
      this.cycleTime[newIndex] / this.cycleTime.length + (performance.now() - this.startTime) / this.cycleTime.length;
    this.iCycle = newIndex;
    newIndex = (this.iSpeed + 1) % this.speed.length;
    this.speed[newIndex] = this.speed[this.iSpeed] - this.speed[newIndex] / this.speed.length + this.cycles / timeDelta / this.speed.length;
    this.iSpeed = newIndex;
    if (this.state.speedCheck && this.iSpeed === 0) {
      this.offset += this.speed[this.iSpeed] < 1020.484 ? -0.05 : 0.05;
    }
    this.setState({
      tick: this.state.tick + 1,
    });
    this.cycles = 0;
  }

  handleSpeedChange = () => {
    this.setState({ speedCheck: !this.state.speedCheck });
  };

  render() {
    const cycleTime = Math.abs(this.cycleTime[this.iCycle]).toFixed(3)
    const speed = (this.speed[this.iSpeed] / 1000).toFixed(3)
    if (!this.gamepadID) {
    this.gamepadID = setInterval(() => {
      const myGamepad = navigator.getGamepads()[0];
      if (myGamepad) {
      console.log(`Left stick at (${myGamepad.axes[0]}, ${myGamepad.axes[1]})` );
      console.log(`Right stick at (${myGamepad.axes[2]}, ${myGamepad.axes[3]})` );
      }
      }, 100);
    }

    return (
      <div className="apple2">
        <Apple2Canvas/>
        <br />
        <span className="leftStatus">
          <span className="statusItem">
            Refreshes: <span className="fixed">{this.state.tick}</span>
          </span>
          <span className="statusItem">
            <span className="fixed">{getProcessorStatus()}</span>
          </span>
          <br />
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
            Time (ms):{" "}
            <span className="fixed">{cycleTime}</span>
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
      </div>
    );
  }
}

export default DisplayApple2;
