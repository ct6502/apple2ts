import { doBoot6502, doReset, doPause, getApple2State,
  processInstruction, setApple2State, setDebug, STATE } from "./motherboard";
// import { parseAssembly } from "./assembler";
import DisplayProps from "./displayprops"
import Apple2Canvas from "./canvas"
import ControlPanel from "./controlpanel"
import DiskDrive from "./diskdrive"
import { getDriveState, setDriveState } from "./diskdrive"
import React from 'react';
import { compress, decompress } from "lz-string"
import { Buffer } from "buffer";

// import Test from "./components/test";

class DisplayApple2 extends React.Component<{},
  { _6502: STATE;
    iCycle: number;
    speedCheck: boolean;
    uppercase: boolean;
    iscolor: boolean }> {
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
    this.state = { _6502: STATE.IDLE,
      iCycle: 0,
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
    if (this.doSaveTimeSlice) {
      this.doSaveTimeSlice = false
      this.iSaveState = (this.iSaveState + 1) % this.maxState
      this.iTempState = this.iSaveState
      this.saveStates[this.iSaveState] = this.getSaveState()
    }
  }

  handleGoBackInTime = () => {
    this.setState({ _6502: STATE.PAUSED })
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
    this.setState({ _6502: STATE.PAUSED })
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
    this.timerID = window.setInterval(() => this.advance(),
      this.state.speedCheck ? 0 : this.refreshTime)
    this.setState({ speedCheck: !this.state.speedCheck });
  };

  handleColorChange = () => {
    this.setState({ iscolor: !this.state.iscolor });
  };

  handleUpperCaseChange = () => {
    this.speed.fill(1020.484)
    window.clearInterval(this.timerID)
    this.timerID = window.setInterval(() => this.advance(),
      this.state.speedCheck ? 0 : this.refreshTime)
    this.setState({ uppercase: !this.state.uppercase });
  };

  handlePause = () => {
    const s = this.state._6502 === STATE.PAUSED ? STATE.IS_RUNNING : STATE.PAUSED
    this.setState({ _6502: s })
    doPause((s === STATE.IS_RUNNING))
  }

  handle6502StateChange = (state: STATE) => {
    this.setState({ _6502: state });
  }

  restoreSaveState = (sState: string) => {
    const data = decompress(Buffer.from(sState, 'base64').toString('ucs2'))
    if (data) {
      const state = JSON.parse(data);
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
      const doRun = () => this.setState({ _6502: STATE.IS_RUNNING })
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

  getSaveState = () => {
    const state = { state6502: getApple2State(), driveState: getDriveState() }
    return Buffer.from(compress(JSON.stringify(state)), 'ucs2').toString('base64')
  }

  handleFileSave = () => {
    const blob = new Blob([this.getSaveState()], {type: "text/plain"});
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    const d = new Date()
    let datetime = new Date(d.getTime() - (d.getTimezoneOffset() * 60000 )).toISOString()
    datetime = datetime.replaceAll('-','').replaceAll(':','').split('.')[0]
    link.setAttribute('download', `apple2ts${datetime}.dat`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  render() {
    const delta = (this.timeDelta).toFixed(1)
    const speed = (this.speed[this.state.iCycle] / 1000).toFixed(3)
    const props: DisplayProps = {
      _6502: this.state._6502,
      speed: speed,
      delta: delta,
      myCanvas: this.myCanvas,
      speedCheck: this.state.speedCheck,
      handleSpeedChange: this.handleSpeedChange,
      uppercase: this.state.uppercase,
      iscolor: this.state.iscolor,
      handleColorChange: this.handleColorChange,
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
          <span className="rightStatus">
            <DiskDrive/>
          </span>
        </span>
        {/* <span className="statusPanel fixed small">
          {parse(getStatus())}
        </span> */}
        <input
          type="file"
          ref={input => this.hiddenFileOpen = input}
          onChange={this.handleRestoreState}
          style={{display: 'none'}}
        />
      </div>
    );
  }
}

export default DisplayApple2;
