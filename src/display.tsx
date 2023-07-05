// Chris Torrence, 2022
import { setUpdateDisplay, handleGetState, passSetCPUState,
  passSetBreakpoint, passSetNormalSpeed, handleGetTextPage,
  passSetDebug, handleGetButton,
  passRestoreSaveState, handleGetSaveState, handleGetAltCharSet,
  handleGetFilename, passStepInto, passStepOver, passStepOut } from "./main2worker"
import { STATE, getPrintableChar, COLOR_MODE } from "./emulator/utility"
import Apple2Canvas from "./canvas"
import ControlPanel from "./controlpanel"
import DiskInterface from "./diskinterface"
import React from 'react';
import HelpPanel from "./helppanel"
import DebugPanel from "./debugpanel"
// import Test from "./components/test";

class DisplayApple2 extends React.Component<{},
  { currentSpeed: number;
    speedCheck: boolean;
    uppercase: boolean;
    useArrowKeysAsJoystick: boolean;
    colorMode: COLOR_MODE;
    doDebug: boolean;
    breakpoint: string;
    helptext: string;
  }> {
  timerID = 0
  refreshTime = 16.6881
  myCanvas = React.createRef<HTMLCanvasElement>()
  hiddenCanvas = React.createRef<HTMLCanvasElement>()
  hiddenFileOpen: HTMLInputElement | null = null

  constructor(props: any) {
    super(props);
    this.state = {
      doDebug: false,
      currentSpeed: 1.02,
      speedCheck: true,
      uppercase: true,
      useArrowKeysAsJoystick: true,
      colorMode: COLOR_MODE.COLOR,
      breakpoint: '',
      helptext: '',
    };
  }

  updateDisplay = (speed = 0, helptext = '') => {
    if (helptext) {
      this.setState( {helptext} )
    } else {
      this.setState( {currentSpeed: (speed ? speed : this.state.currentSpeed)} )
    }
  }

  updatehelptext = (helptext: string) => {
    this.setState( {helptext} )
  }

  componentDidMount() {
    setUpdateDisplay(this.updateDisplay)
//    window.addEventListener("resize", handleResize)
  }

  componentWillUnmount() {
    if (this.timerID) clearInterval(this.timerID);
//    window.removeEventListener("resize", handleResize)
  }

  handleSpeedChange = () => {
    passSetNormalSpeed(!this.state.speedCheck)
    this.setState({ speedCheck: !this.state.speedCheck });
  };

  handleColorChange = () => {
    const mode = (this.state.colorMode + 1) % 4
    this.setState({ colorMode: mode });
  };

  handleDebugChange = () => {
    passSetDebug(!this.state.doDebug)
    this.setState({ doDebug: !this.state.doDebug });
  };

  handleBreakpoint = (breakpoint: string) => {
    passSetBreakpoint(parseInt(breakpoint ? breakpoint : '0', 16))
    this.setState({ breakpoint: breakpoint });
  };

  handleUpperCaseChange = () => {
    this.setState({ uppercase: !this.state.uppercase });
  };

  handleUseArrowKeyJoystick = () => {
    this.setState({ useArrowKeysAsJoystick: !this.state.useArrowKeysAsJoystick });
  };

  handleRestoreState = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target?.files?.length) {
      const fileread = new FileReader()
      const restoreSaveStateFunc = (saveState: EmulatorSaveState) => {
        passRestoreSaveState(saveState)
        if (saveState.emulator.colorMode !== undefined) {
          this.setState({colorMode: saveState.emulator.colorMode})
        }
        if (saveState.emulator.uppercase !== undefined) {
          this.setState({uppercase: saveState.emulator.uppercase})
        }
      }
      fileread.onload = function(e) {
        if (e.target) {
          const saveState: EmulatorSaveState = JSON.parse(e.target.result as string)
          restoreSaveStateFunc(saveState)
          passSetCPUState(STATE.RUNNING)
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

  doSaveStateCallback = (saveState: EmulatorSaveState) => {
    const d = new Date()
    let datetime = new Date(d.getTime() - (d.getTimezoneOffset() * 60000 )).toISOString()
    saveState.emulator = {
      name: `Apple2TS Emulator (git ${process.env.REACT_APP_GIT_SHA})`,
      date: datetime,
      help: this.state.helptext.split('\n')[0],
      colorMode: this.state.colorMode,
      uppercase: this.state.uppercase,
    }
    const state = JSON.stringify(saveState, null, 2)
    const blob = new Blob([state], {type: "text/plain"});
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    let name = handleGetFilename(0)
    if (!name) {
      name = "apple2ts"
    }
    datetime = datetime.replaceAll('-','').replaceAll(':','').split('.')[0]
    link.setAttribute('download', `${name}${datetime}.json`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  handleFileSave = () => {
    handleGetSaveState(this.doSaveStateCallback)
  }

  /**
   * For text mode, copy all of the screen text.
   * For graphics mode, do a bitmap copy of the canvas.
   */
  handleCopyToClipboard = () => {
    const textPage = handleGetTextPage()
    if (textPage.length === 960 || textPage.length === 1920) {
      const nchars = textPage.length / 24
      const isAltCharSet = handleGetAltCharSet()
      let output = ''
      for (let j = 0; j < 24; j++) {
        let line = ''
        for (let i = 0; i < nchars; i++) {
          let value = textPage[j * nchars + i]
          let v1 = getPrintableChar(value, isAltCharSet)
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
    const props: DisplayProps = {
      machineState: handleGetState(),
      speed: this.state.currentSpeed,
      myCanvas: this.myCanvas,
      hiddenCanvas: this.hiddenCanvas,
      speedCheck: this.state.speedCheck,
      handleSpeedChange: this.handleSpeedChange,
      uppercase: this.state.uppercase,
      useArrowKeysAsJoystick: this.state.useArrowKeysAsJoystick,
      colorMode: this.state.colorMode,
      handleColorChange: this.handleColorChange,
      handleCopyToClipboard: this.handleCopyToClipboard,
      handleUpperCaseChange: this.handleUpperCaseChange,
      handleUseArrowKeyJoystick: this.handleUseArrowKeyJoystick,
      handleFileOpen: this.handleFileOpen,
      handleFileSave: this.handleFileSave,
      updateDisplay: this.updateDisplay,
      button0: handleGetButton(true),
      button1: handleGetButton(false),
    }
    const debugProps: DebugProps = {
      doDebug: this.state.doDebug,
      breakpoint: this.state.breakpoint,
      handleDebugChange: this.handleDebugChange,
      handleBreakpoint: this.handleBreakpoint,
      handleStepInto: passStepInto,
      handleStepOver: passStepOver,
      handleStepOut: passStepOut,
    }
    const width = props.myCanvas.current?.width
    const height = window.innerHeight - 30
    let paperWidth = window.innerWidth - (width ? width : 600) - 50
    if (paperWidth < 300) paperWidth = 300
    return (
      <div>
        <span className="topRow">
          <span className="apple2">
            <Apple2Canvas {...props}/>
            <div className="controlBar" style={{width: width, display: width ? '' : 'none'}}>
                <ControlPanel {...props}/>
                <DiskInterface
                  speedCheck={this.state.speedCheck}
                />
            </div>
            <span className="statusItem">
              <span>{props.speed} MHz</span>
              <br/>
              <span>Apple2TS ©{new Date().getFullYear()} Chris Torrence (git {process.env.REACT_APP_GIT_SHA}) <a href="https://github.com/ct6502/apple2ts/issues">Report an Issue</a></span>
            </span>
          </span>
          <span className="sideContent">
            <HelpPanel helptext={this.state.helptext}
              height={height ? height : 400} width={paperWidth} />
            <DebugPanel {...debugProps}/>
          </span>
        </span>
        <input
          type="file"
          accept=".json"
          ref={input => this.hiddenFileOpen = input}
          onChange={this.handleRestoreState}
          style={{display: 'none'}}
        />
      </div>
    );
  }
}

export default DisplayApple2;
