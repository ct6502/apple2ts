import { getTextPage1, processInstruction, setDebug } from "./interp";
import {
  bank0,
  doReset6502,
  isBreak,
  keyPress,
  setBreak,
  setPC,
  getProcessorStatus,
  setSpeaker,
} from "./instructions";
import { parseAssembly } from "./assembler";
import { Buffer } from "buffer";

import React, {KeyboardEvent} from "react";
// import Test from "./components/test";
import Canvas from './canvas';

let audioContext: AudioContext
let speaker: OscillatorNode

const getAudioContext = () => {
  if (!audioContext) {
    audioContext = new AudioContext()
  }
  return audioContext
}

let speakerStartTime = 0;
const duration = 0.1
const clickSpeaker = () => {
  if (getAudioContext().state !== "running") {
    audioContext.resume();
  }
  if ((speakerStartTime + duration) >= audioContext.currentTime) {
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
  IS_RUNNING
}

let state6502 = STATE.IDLE
let startTime = 0
setBreak();

const TEXT_LINES= [
	0x400,
	0x480,
	0x500,
	0x580,
	0x600,
	0x680,
	0x700,
	0x780,
	0x428,
	0x4A8,
	0x528,
	0x5A8,
	0x628,
	0x6A8,
	0x728,
	0x7A8,
	0x450,
	0x4D0,
	0x550,
	0x5D0,
	0x650,
	0x6D0,
	0x750,
	0x7D0
];

function renderText40(ctx: any) {
  let x= 7;
  let y= 7+22;
  ctx.fillStyle= "white";
  ctx.font = '20px "PrintChar21"';
  for(let line= 0; line<24; line++)
    for(let column= 0; column<40; column++) {
      const addr= TEXT_LINES[line]+column;
      let ascii= bank0[addr];

      if(ascii === 0xA0)
        continue;

      // if(ascii != 0x20)
      // 	ctx.drawImage(this.cacheText40[0xA1], x+(15*column), y+(22*line));

      if(ascii<=0x1F)
        ascii+= 0xE140;
      else
      if(ascii<=0x3F)
        ascii+= 0xE100;
      else
      if(ascii<=0x5F)
        ascii+= 0xE100;
      else
      if(ascii<=0x7F)
        ascii+= 0xE100;
      else
      if(ascii>=0xA0)
        ascii-= 0x80;
      const char= String.fromCharCode(ascii);
      ctx.fillText(char, x+(15*column), y+(22*line));

    }
}

const draw = (ctx: any, frameCount: any) => {
  ctx.fillStyle="black";
  ctx.fillRect(0,0,ctx.canvas.width,ctx.canvas.height);

  renderText40(ctx);

  // switch(this.mode) {
  //   case MODE.TEXT: {
  //     this.col80 ? this.renderText80(ctx) : this.renderText40(ctx);
  //     break;
  //   }
  //   case MODE.GR:
  //     this.renderLowGraphic(ctx);
  //     break;
  //   case MODE.HGR:
  //     this.renderHighGraphic(ctx);
  //     break;
  // }  
}

class DisplayApple2 extends React.Component<{}, { tick: number }> {
  timerID: ReturnType<typeof setInterval> | undefined;
  cycles = 0;
  offset = 15;
  cycleTime = Array<number>(100).fill(0.2);
  iCycle = 0
  speed = Array<number>(100).fill(1000);
  iSpeed = 0

  constructor(props: any) {
    super(props);
    this.state = { tick: 0 };
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
    setBreak();
    this.timerID = setInterval(() => this.advance());
  }

  componentWillUnmount() {
    if (this.timerID) clearInterval(this.timerID);
  }

  advance() {
    const newTime = performance.now();
    if ((newTime - startTime) < this.offset) {
      return;
    }
    const timeDelta = newTime - startTime;
    startTime = newTime;
    if (state6502 === STATE.NEED_RESET) {
      this.doReset();
      state6502 = STATE.IS_RUNNING;
    }
    if (state6502 === STATE.IDLE) {
      if (isBreak()) {
        return;
      }
      state6502 = STATE.IS_RUNNING;
    }
    while (true) {
      const cycles = processInstruction();
      this.cycles += cycles;
      if (isBreak()) {
        state6502 = STATE.IDLE;
        break;
      }
      if (this.cycles >= 17030*5) {
      // if (this.cycles >= 30000) {
        break;
      }
    }
    let newIndex = (this.iCycle + 1) % this.cycleTime.length
    this.cycleTime[newIndex] =
      this.cycleTime[this.iCycle] -
      this.cycleTime[newIndex] / this.cycleTime.length +
      (performance.now() - startTime) / this.cycleTime.length;
    this.iCycle = newIndex
    newIndex = (this.iSpeed + 1) % this.speed.length
    this.speed[newIndex] =
      this.speed[this.iSpeed] -
      this.speed[newIndex] / this.speed.length +
      this.cycles / timeDelta / this.speed.length;
    this.iSpeed = newIndex
    if (this.iSpeed === 0) {
      this.offset += (this.speed[this.iSpeed] < 1020.484) ? -0.05 : 0.05;
    }
    this.setState({
      tick: this.state.tick + 1,
    });
    this.cycles = 0;
  }

  handleAppleKey = (e: KeyboardEvent<HTMLDivElement>) => {
    console.log("key="+e.key+" code="+e.code+" ctrl="+e.ctrlKey+" shift="+e.shiftKey);
    let key = 0
    if (e.key.length === 1) {
      key = e.key.charCodeAt(0)
    } else {
      if (e.key === "Enter") {
        key = 13
      }
    }
    if (key > 0) {
      keyPress(key);
    }
  };

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
        <div
          className="appleWindow"
          tabIndex={0}
          onKeyDown={this.handleAppleKey}
        >
        <Canvas draw={draw} width="620" height="550"/>
          {/* <pre>
            <span className="normal">{textOutput}</span>
          </pre> */}
        </div>
        {getProcessorStatus()}
        <br />
        Refreshes: {this.state.tick}
        <br />
        Time (ms): {Math.round(this.cycleTime[this.iCycle] * 100) / 100}
        <br />
        Offset (ms): {Math.round(this.offset * 100) / 100}
        <br />
        Speed (MHz): {Math.round(this.speed[this.iSpeed]) / 1000}
        <br />
        <button
          onClick={() => {
            clickSpeaker();
            state6502 = STATE.NEED_RESET;
          }}
        >
          Boot
        </button>
        <button
          onClick={() => {
            setBreak(!isBreak());
          }}
        >
          {isBreak() ? "Resume" : "Break"}
        </button>
      </div>
    );
  }
}

export default DisplayApple2;
