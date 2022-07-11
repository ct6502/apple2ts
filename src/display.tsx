import { doBoot6502, doReset, doPause, getApple2State,
  processInstruction, setApple2State, setDebug, STATE } from "./motherboard";
// import { parseAssembly } from "./assembler";
import Apple2Canvas from "./canvas"
import ControlPanel from "./controlpanel"
import DiskDrive from "./diskdrive"
import { getDriveState, setDriveState } from "./diskdrive"
import React from 'react';

// import Test from "./components/test";

class DisplayApple2 extends React.Component<{},
  { _6502: STATE; iCycle: number; speedCheck: boolean; uppercase: boolean }> {
  timerID = 0;
  cycles = 0;
  timeDelta = 0;
  speed = Array<number>(100).fill(1020);
  refreshTime = 16.6881
  startTime = 0
  myCanvas = React.createRef();
  hiddenFileOpen: HTMLInputElement | null = null;

  constructor(props: any) {
    super(props);
    this.state = { _6502: STATE.IDLE,
      iCycle: 0,
      speedCheck: true,
      uppercase: true,
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
  }

  handleSpeedChange = () => {
    this.speed.fill(1020.484)
    window.clearInterval(this.timerID)
    this.timerID = window.setInterval(() => this.advance(),
      this.state.speedCheck ? 0 : this.refreshTime)
    this.setState({ speedCheck: !this.state.speedCheck });
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

  readSavedState = async (file: File) => {
    const fileread = new FileReader()
    const set6502state = () => this.setState({ _6502: STATE.IS_RUNNING })
    fileread.onload = function(e) {
      if (e.target) {
        const state = JSON.parse(e.target.result as string);
        setApple2State(state.state6502)
        setDriveState(state.driveState)
        set6502state()
      }
    };
    fileread.readAsText(file);
  }

  handleRestoreState = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target?.files?.length) {
      this.readSavedState(e.target.files[0])
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
    const state = { state6502: getApple2State(), driveState: getDriveState() }
    const blob = new Blob([JSON.stringify(state)], {type: "text/plain"});
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', "apple2ts.dat");
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  render() {
    const delta = (this.timeDelta).toFixed(1)
    const speed = (this.speed[this.state.iCycle] / 1000).toFixed(3)

    return (
      <div>
        <span className="apple2">
          <Apple2Canvas myCanvas={this.myCanvas} uppercase={this.state.uppercase}/>
          <br />
          <ControlPanel _6502={this.state._6502}
            speed={speed} delta={delta}
            myCanvas={this.myCanvas}
            speedCheck={this.state.speedCheck}
            handleSpeedChange={this.handleSpeedChange}
            uppercase={this.state.uppercase}
            handleUpperCaseChange={this.handleUpperCaseChange}
            handlePause={this.handlePause}
            handle6502StateChange={this.handle6502StateChange}
            handleFileOpen={this.handleFileOpen}
            handleFileSave={this.handleFileSave}/>
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
