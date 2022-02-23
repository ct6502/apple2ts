import { processInstruction, setDebug } from "./interp";
import {
  bank0,
  doBoot6502,
  doReset,
  setPC,
  getProcessorStatus,
  setSpeaker,
  SWITCHES
} from "./instructions";
// import { parseAssembly } from "./assembler";
import Apple2Canvas from './canvas'
import disk2off from './img/disk2.png'
import disk2on from './img/disk2on.png'

import React from "react";
// import Test from "./components/test";

let audioContext: AudioContext
let speaker: OscillatorNode

const getAudioContext = () => {
  if (!audioContext) {
    audioContext = new AudioContext()
  }
  return audioContext
}

// https://marcgg.com/blog/2016/11/01/javascript-audio/
let speakerStartTime = -99;
const duration = 0.1
const clickSpeaker = () => {
  if (getAudioContext().state !== "running") {
    audioContext.resume();
  }
  if ((speakerStartTime + 2*duration) >= audioContext.currentTime) {
    return
  }
  try {
    speaker = audioContext.createOscillator();
    speaker.type = "square";
    speaker.frequency.value = 930
    const gain = audioContext.createGain();
    speaker.connect(gain);
    gain.connect(audioContext.destination);
    gain.gain.value = 0.25;
    speakerStartTime = audioContext.currentTime;
    speaker.start(speakerStartTime);
    speaker.stop(speakerStartTime + duration);
  } catch (error) {
    console.error("error")
  }
};

setSpeaker(clickSpeaker);

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
    setPC(bank0[0xfffd] * 256 + bank0[0xfffc]);
    setDebug(false);
    this.cycles = 0;
    this.startTime = performance.now();
  }

  componentDidMount() {
    this.doBoot();
    this.setState({ _6502: STATE.IDLE });
    this.timerID = setInterval(() => this.advance());
  }

  componentWillUnmount() {
    if (this.timerID) clearInterval(this.timerID);
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

  // Hidden file input element
  hiddenFileInput: HTMLInputElement | null = null;

  readDisk = async (file: File) => {
    const buffer = await file.arrayBuffer();
    const array = new Uint8Array(buffer);
    console.log(array[0])
  }

  handleDiskClick = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target?.files?.length) {
      this.readDisk(e.target.files[0])
    }
  };

  render() {
    const cycleTime = Math.abs(this.cycleTime[this.iCycle]).toFixed(3)
    const speed = (this.speed[this.iSpeed] / 1000).toFixed(3)

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
                audioContext.resume();
              }
              this.setState({ _6502: STATE.NEED_BOOT });
            }}>
            Boot
          </button>
          <button
            onClick={() => {
              if (getAudioContext().state !== "running") {
                audioContext.resume();
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
          <button className="disk2">
            <img src={SWITCHES.DRIVE.set ? disk2on : disk2off} alt="Disk2"
              onClick={() => this.hiddenFileInput!.click()} />
          </button>
        <input
          type="file"
          ref={input => this.hiddenFileInput = input}
          onChange={this.handleDiskClick}
          style={{display: 'none'}}
        />
      </span>
      </div>
    );
  }
}

export default DisplayApple2;
