import { doBoot6502, doReset, doPause, getApple2State,
  processInstruction, setApple2State } from "./motherboard";
// import { parseAssembly } from "./assembler";
import { s6502 } from "./instructions"
import { STATE, getPrintableChar } from "./utility"
import { getTextPage } from "./memory";
import Apple2Canvas from "./canvas"
import ControlPanel from "./controlpanel"
import DiskDrive from "./diskdrive"
import { SWITCHES } from "./softswitches";
import { getDriveState, setDriveState, getFilename } from "./diskdrive"
import React from 'react';
import { decompress } from "lz-string"
import { Buffer } from "buffer";

// import Test from "./components/test";

class DisplayApple2 extends React.Component<{},
  { currentSpeed: number;
    speedCheck: boolean;
    uppercase: boolean;
    iscolor: boolean }> {
  _6502 = STATE.IDLE
  iCycle = 0
  timerID = 0
  cycles = 0
  timeDelta = 0
  speed = Array<number>(100).fill(1020)
  refreshTime = 16.6881
  startTime = 0
  myCanvas = React.createRef<HTMLCanvasElement>()
  hiddenFileOpen: HTMLInputElement | null = null
  doSaveTimeSlice = false
  iSaveState = 0
  iTempState = 0
  maxState = 60
  saveStates = Array<string>(this.maxState).fill('')

  constructor(props: any) {
    super(props);
    this.state = {
      currentSpeed: 0,
      speedCheck: true,
      uppercase: true,
      iscolor: true,
    };
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
//    mainMem.set(pcode, 0x2000);
//    setPC(0x2000);
    this.startTime = performance.now();
  }

  update6502 = () => {
    this.advance()
    this.setState( {currentSpeed: this.speed[this.iCycle] / 1000} )
  }
  componentDidMount() {
    this.doBoot();
    this.handle6502StateChange(STATE.IDLE)
    this.timerID = window.setInterval(() => this.update6502(), this.refreshTime)
  }

  componentWillUnmount() {
    if (this.timerID) clearInterval(this.timerID);
  }

  get6502state = () => {
    return this._6502
  }

  MAXCYCLES = 17030

  advance = () => {
    const newTime = performance.now()
    this.timeDelta = newTime - this.startTime
    this.startTime = newTime;
    if (this.get6502state() === STATE.IDLE || this.get6502state() === STATE.PAUSED) {
      return;
    }
    if (this.get6502state() === STATE.NEED_BOOT) {
      this.doBoot();
      this.handle6502StateChange(STATE.IS_RUNNING)
    } else if (this.get6502state() === STATE.NEED_RESET) {
      doReset();
      this.handle6502StateChange(STATE.IS_RUNNING)
    }
    let cycleTotal = 0
    while (true) {
      const cycles = processInstruction();
      if (cycles === 0) {
        this.handle6502StateChange(STATE.PAUSED)
        return;
      }
      cycleTotal += cycles;
      if (cycleTotal >= this.MAXCYCLES) {
        break;
      }
    }
    const newIndex = (this.iCycle + 1) % this.speed.length;
    const currentAvgSpeed = cycleTotal / this.timeDelta / this.speed.length
    this.speed[newIndex] = this.speed[this.iCycle] -
      this.speed[newIndex] / this.speed.length + currentAvgSpeed;
    this.iCycle = newIndex
    if (this.doSaveTimeSlice) {
      this.doSaveTimeSlice = false
      this.iSaveState = (this.iSaveState + 1) % this.maxState
      this.iTempState = this.iSaveState
      this.saveStates[this.iSaveState] = this.getSaveState()
    }
  }

  handleGoBackInTime = () => {
    this.handle6502StateChange(STATE.PAUSED)
    doPause()
    // if this is the first time we're called, make sure our current
    // state is up to date
    if (this.iTempState === this.iSaveState) {
      this.saveStates[this.iSaveState] = this.getSaveState()
    }
    const newTmp = (this.iTempState + this.maxState - 1) % this.maxState
    if (newTmp === this.iSaveState || this.saveStates[newTmp] === '') {
      return
    }
    this.iTempState = newTmp
    this.restoreSaveState(this.saveStates[newTmp])
  }

  handleGoForwardInTime = () => {
    this.handle6502StateChange(STATE.PAUSED)
    doPause()
    if (this.iTempState === this.iSaveState) {
      return
    }
    const newTmp = (this.iTempState + 1) % this.maxState
    if (this.saveStates[newTmp] === '') {
      return
    }
    this.iTempState = newTmp
    this.restoreSaveState(this.saveStates[newTmp])
  }

  handleSpeedChange = () => {
    this.speed.fill(1020.484)
    window.clearInterval(this.timerID)
    this.timerID = window.setInterval(() => this.update6502(),
      this.state.speedCheck ? 0 : this.refreshTime)
    this.setState({ speedCheck: !this.state.speedCheck });
  };

  handleColorChange = () => {
    this.setState({ iscolor: !this.state.iscolor });
  };

  handleUpperCaseChange = () => {
    this.setState({ uppercase: !this.state.uppercase });
  };

  handlePause = () => {
    const s = this.get6502state() === STATE.PAUSED ? STATE.IS_RUNNING : STATE.PAUSED
    this.handle6502StateChange(s)
    doPause((s === STATE.IS_RUNNING))
  }

  handle6502StateChange = (state: STATE) => {
    this._6502 = state
//    this.setState({_6502: state})
  }

  oldFormat = false

  getSaveState = () => {
    const state = { state6502: getApple2State(), driveState: getDriveState() }
    return JSON.stringify(state)
//    return Buffer.from(compress(JSON.stringify(state)), 'ucs2').toString('base64')
  }

  restoreSaveState = (sState: string) => {
    if (this.oldFormat) {
      const data = decompress(Buffer.from(sState, 'base64').toString('ucs2'))
      if (data) {
        const state = JSON.parse(data);
        setApple2State(state.state6502)
        setDriveState(state.driveState)
      }
    } else {
      const state = JSON.parse(sState);
      setApple2State(state.state6502)
      setDriveState(state.driveState)
    }
  }

  saveTimeSlice = () => {
    // Set a flag and save our slice at the end of the next 6502 display cycle.
    // Otherwise we risk saving in the middle of a keystroke.
    this.doSaveTimeSlice = true
  }

  handleRestoreState = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target?.files?.length) {
      const fileread = new FileReader()
      const restoreState = this.restoreSaveState
      const doRun = () => this.handle6502StateChange(STATE.IS_RUNNING)
      fileread.onload = function(e) {
        if (e.target) {
          restoreState(e.target.result as string)
          doRun()
        }
      };
      fileread.readAsText(e.target.files[0]);
    }
  };

  handleFileOpen = () => {
    if (this.hiddenFileOpen) {
      // Hack - clear out old file so we can pick the same file again
      this.hiddenFileOpen.value = "";
      this.hiddenFileOpen.click()
    }
  }

  handleFileSave = () => {
    const blob = new Blob([this.getSaveState()], {type: "text/plain"});
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    let name = getFilename(0)
    if (!name) {
      name = "apple2ts"
    }
    const d = new Date()
    let datetime = new Date(d.getTime() - (d.getTimezoneOffset() * 60000 )).toISOString()
    datetime = datetime.replaceAll('-','').replaceAll(':','').split('.')[0]
    link.setAttribute('download', `${name}${datetime}.dat`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  /**
   * For text mode, copy all of the screen text.
   * For graphics mode, do a bitmap copy of the canvas.
   */
  handleCopyToClipboard = () => {
    if (SWITCHES.TEXT.isSet) {
      const textPage = getTextPage()
      const nchars = textPage.length / 24
      let output = ''
      for (let j = 0; j < 24; j++) {
        let line = ''
        for (let i = 0; i < nchars; i++) {
          let value = textPage[j * nchars + i]
          let v1 = getPrintableChar(value, SWITCHES.ALTCHARSET.isSet)
          if (v1 >= 32 && v1 !== 127) {
            const c = String.fromCharCode(v1);
            line += c
          }
        }
        line = line.trim()
        output += line + '\n'
      }
      navigator.clipboard.writeText(output);
    } else {
      try {
        this.myCanvas.current?.toBlob((blob) => {
          if (blob) {
            navigator.clipboard.write([
              new ClipboardItem({
                'image/png': blob,
              })
            ])
          }
        })
      }
      catch (error) {
        console.error(error);
      }
    }
  }

  render() {
    const delta = (this.timeDelta).toFixed(1)
    const speed = this.state.currentSpeed.toFixed(3) //(this.speed[this.iCycle] / 1000).toFixed(3)
    const props: DisplayProps = {
      _6502: this.get6502state(),
      s6502: s6502,
      advance: this.advance,
      speed: speed,
      delta: delta,
      myCanvas: this.myCanvas,
      speedCheck: this.state.speedCheck,
      handleSpeedChange: this.handleSpeedChange,
      uppercase: this.state.uppercase,
      isColor: this.state.iscolor,
      handleColorChange: this.handleColorChange,
      handleCopyToClipboard: this.handleCopyToClipboard,
      saveTimeSlice: this.saveTimeSlice,
      handleGoBackInTime: this.handleGoBackInTime,
      handleGoForwardInTime: this.handleGoForwardInTime,
      handleUpperCaseChange: this.handleUpperCaseChange,
      handlePause: this.handlePause,
      handle6502StateChange: this.handle6502StateChange,
      handleFileOpen: this.handleFileOpen,
      handleFileSave: this.handleFileSave,
    }

    const ctx = props.myCanvas.current?.getContext("2d")
    let width = 1280
    if (ctx) {
      width = ctx.canvas.width;
    }

    return (
      <div>
        <span className="apple2" style={{width:width}}>
          <Apple2Canvas {...props}/>
          <br />
          <span className="leftStatus">
            <ControlPanel {...props}/>
          </span>
          <span><DiskDrive speedCheck={this.state.speedCheck}/></span>
        </span>
        {/* <span className="statusPanel fixed small">
          {parse(getStatuss6502, stack, mainMem.slice(0, 512)))}
        </span> */}
        <input
          type="file"
          accept=".dat"
          ref={input => this.hiddenFileOpen = input}
          onChange={this.handleRestoreState}
          style={{display: 'none'}}
        />
      </div>
    );
  }
}

export default DisplayApple2;
