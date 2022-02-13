import { getTextPage1, processInstruction, setDebug } from "./interp";
import {
  bank0,
  doReset6502,
  addToBuffer,
  keyPress,
  setPC,
  getProcessorStatus,
  setSpeaker,
} from "./instructions";
import { parseAssembly } from "./assembler";
import { convertAppleKey } from "./keyboard"

import React, {KeyboardEvent} from "react";
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
let speakerStartTime = 0;
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
  NEED_RESET,
  IS_RUNNING,
  PAUSED
}

let startTime = 0

class DisplayApple2 extends React.Component<{},
  { _6502: STATE; tick: number; speedCheck: boolean }> {
  timerID: ReturnType<typeof setInterval> | undefined;
  cycles = 0;
  offset = 15;
  cycleTime = Array<number>(100).fill(0.2);
  iCycle = 0;
  speed = Array<number>(100).fill(1000);
  iSpeed = 0;

  constructor(props: any) {
    super(props);
    this.state = { _6502: STATE.IDLE, tick: 0, speedCheck: true };
  }

  doReset() {
    const code = `
START   LDA #65     ; (2) "A"
PRINT   STA $0400   ; (4)
        INC PRINT+1  ; (6)
        BNE PRINT    ; (2/3) = 255*13 + 12 = 3327
        INC PRINT+2  ; (6)
        INC START+1 ; (6)
        CMP #68     ; (2) "D"
        BNE START   ; (2/3) = 3327*4 + 19*3 + 18 = 13383 cycles ~ 13.4ms
        LDX #$F0
BEEP    LDY #$80
        LDA $C030
DELAY   DEY
        BNE DELAY
DRTN    DEX
        BNE BEEP
        BRK
`;
    doReset6502();
    let pcode = parseAssembly(0x2000, code.split("\n"));
    bank0.set(pcode, 0x2000);
    //    setPC(0x2000);
    setPC(bank0[0xfffd] * 256 + bank0[0xfffc]);
    setDebug(false);
    this.cycles = 0;
    startTime = performance.now();
  }

  componentDidMount() {
    this.doReset();
    this.setState({ _6502: STATE.IDLE });
    this.timerID = setInterval(() => this.advance());
  }

  componentWillUnmount() {
    if (this.timerID) clearInterval(this.timerID);
  }

  advance() {
    const newTime = performance.now();
    if (this.state.speedCheck && newTime - startTime < this.offset) {
      return;
    }
    const timeDelta = newTime - startTime;
    startTime = newTime;
    if (this.state._6502 === STATE.IDLE || this.state._6502 === STATE.PAUSED) {
      return;
    }
    if (this.state._6502 === STATE.NEED_RESET) {
      this.doReset();
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
      this.cycleTime[this.iCycle] - this.cycleTime[newIndex] / this.cycleTime.length + (performance.now() - startTime) / this.cycleTime.length;
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

  pasteHandler = (event: React.ClipboardEvent<HTMLDivElement>) => {
    const data = event.clipboardData.getData("text");
    if (data !== "") {
      addToBuffer(data);
    }
    event.preventDefault();
  };

  handleAppleKey = (e: KeyboardEvent<HTMLDivElement>) => {
    if (e.key === "v" && e.metaKey) {
      return;
    }
    const key = convertAppleKey(e);
    if (key > 0) {
      keyPress(key);
    } else {
      console.log("key=" + e.key + " code=" + e.code + " ctrl=" + e.ctrlKey + " shift=" + e.shiftKey + " meta=" + e.metaKey);
    }
  };

  handleSpeedChange = () => {
    this.setState({ speedCheck: !this.state.speedCheck });
  };

  processTextPage = (textPage: Uint8Array) => {
    let buffer = [];
    for (var i = 0; i < 24; i++) {
      textPage.slice(i * 40, (i + 1) * 40).forEach((value) => {
        let value1 = value;
        if ((value >= 0 && value <= 0x1f) || (value >= 0x61 && value <= 0x9f)) {
          value1 += 0x40;
        }
        let v = String.fromCharCode(value1 & 0b01111111);
        if (v === " ") {
          v = "\u00A0";
        }
        let cname = "normal";
        if (value === 0x60) {
          cname = "cursor";
          v = "\u00A0"; //String.fromCharCode(0x8e);
        } else if (value < 64) {
          cname = "inverse";
        } else if (value < 128) {
          cname = "flashing";
        }
        const key = buffer.length.toString();
        buffer.push(
          <span className={cname} key={key}>
            {v}
          </span>
        );
      });
      buffer.push(<br key={"line" + i} />);
    }
    return <div>{buffer}</div>;
  };

  render() {
    const textPage = this.processTextPage(getTextPage1())
    const cycleTime = Math.abs(this.cycleTime[this.iCycle]).toFixed(3)
    const speed = (this.speed[this.iSpeed] / 1000).toFixed(3)

    return (
      <div className="apple2">
        <div
          className="appleWindow"
          tabIndex={0}
          onKeyDown={this.handleAppleKey}
          onPaste={this.pasteHandler}>
          <span className="textWindow">{textPage}</span>
        </div>
        <br />
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
        <span className="statusItem">
          Offset (ms):{" "}
          <span className="fixed">{this.offset.toFixed(2)}</span>
        </span>

        <br />

        <button
          onClick={() => {
            if (getAudioContext().state !== "running") {
              audioContext.resume();
            }
            this.setState({ _6502: STATE.NEED_RESET });
          }}>
          Boot
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
      </div>
    );
  }
}

export default DisplayApple2;
