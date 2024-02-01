// Chris Torrence, 2022
import {
  setDisplay, handleGetRunMode, passSetRunMode,
  passSetSpeedMode, handleGetTextPage,
  passSetDebug,
  passRestoreSaveState, handleGetSaveState, handleGetAltCharSet,
  handleGetFilename,
  passAppleCommandKeyPress,
  passAppleCommandKeyRelease,
  passSetGamepads,
  passKeypress,
  handleSetDiskFromURL
} from "./main2worker"
import { RUN_MODE, getPrintableChar, COLOR_MODE, TEST_DEBUG, ARROW } from "./emulator/utility/utility"
import Apple2Canvas from "./canvas"
import ControlPanel from "./controls/controlpanel"
import DiskInterface from "./devices/diskinterface"
import React from 'react';
import HelpPanel from "./panels/helppanel"
import DebugSection from "./panels/debugsection"
import { changeMockingboardMode, getMockingboardMode } from "./devices/mockingboard_audio"
import ImageWriter from "./devices/imagewriter"
import { audioEnable, isAudioEnabled } from "./devices/speaker"
// import Test from "./components/test";

class DisplayApple2 extends React.Component<object,
  {
    currentSpeed: number;
    uppercase: boolean;
    useArrowKeysAsJoystick: boolean;
    colorMode: COLOR_MODE;
    ctrlKeyMode: number;
    openAppleKeyMode: number;
    closedAppleKeyMode: number;
    doDebug: boolean;
    breakpoint: string;
    helptext: string;
  }> {
  timerID = 0
  refreshTime = 16.6881
  myCanvas = React.createRef<HTMLCanvasElement>()
  hiddenCanvas = React.createRef<HTMLCanvasElement>()
  hiddenFileOpen = React.createRef<HTMLInputElement>();

  constructor(props: object) {
    super(props);
    this.state = {
      ctrlKeyMode: 0,
      openAppleKeyMode: 0,
      closedAppleKeyMode: 0,
      doDebug: TEST_DEBUG,
      currentSpeed: 1.02,
      uppercase: true,
      useArrowKeysAsJoystick: true,
      colorMode: COLOR_MODE.COLOR,
      breakpoint: '',
      helptext: '',
    };
  }

  updateDisplay = (speed = 0, helptext = '') => {
    if (helptext) {
      this.setState({ helptext })
    } else {
      this.setState({ currentSpeed: (speed ? speed : this.state.currentSpeed) })
    }
  }

  updatehelptext = (helptext: string) => {
    this.setState({ helptext })
  }

  handleInputParams = () => {
    const params = new URLSearchParams(window.location.search)
    if (params.get('capslock')?.toLowerCase() === 'off') {
      this.handleUpperCaseChange(false)
    }
    if (params.get('speed')?.toLowerCase() === 'fast') {
      passSetSpeedMode(1)
    }
    if (params.get('sound')?.toLowerCase() === 'off') {
      audioEnable(false)
    }
    const colorMode = params.get('color')
    if (colorMode) {
      const colors = ['color', 'nofringe', 'green', 'amber', 'white']
      const mode = colors.indexOf(colorMode)
      if (mode >= 0) this.handleColorChange(mode as COLOR_MODE)
    }
  }

  // Examples:
  // https://apple2ts.com/?color=white&speed=fast#https://a2desktop.s3.amazonaws.com/A2DeskTop-1.3-en_800k.2mg
  // https://apple2ts.com/#https://archive.org/download/TotalReplay/Total%20Replay%20v5.0.1.hdv
  // https://apple2ts.com/#https://archive.org/download/wozaday_Davids_Midnight_Magic/00playable.woz
  handleFragment = async () => {
    const fragment = window.location.hash
    if (fragment.length < 2) return
    const url = fragment.substring(1)
    handleSetDiskFromURL(url)
  }

  componentDidMount() {
    setDisplay(this)
    if ("launchQueue" in window) {
      const queue: LaunchQueue = window.launchQueue as LaunchQueue
      queue.setConsumer(async (launchParams: LaunchParams) => {
        const files: FileSystemFileHandle[] = launchParams.files
        if (files && files.length) {
          const fileContents = await (await files[0].getFile()).text()
          this.restoreSaveStateFunc(fileContents)
        }
      });
    }
    // TODO: It's unclear whether I need to actually do this preloadAssets() call
    // or whether just having the assets within that file is good enough
    // for the preloading.
    // preloadAssets()
    passSetSpeedMode(0)
    this.handleInputParams()
    this.handleFragment()
    //    window.addEventListener('beforeunload', (event) => {
    // Cancel the event as stated by the standard.
    //      event.preventDefault();
    // Chrome requires returnValue to be set.
    //      event.returnValue = '';
    //    });
    //    window.addEventListener("resize", handleResize)
  }

  componentWillUnmount() {
    if (this.timerID) clearInterval(this.timerID);
    //    window.removeEventListener("resize", handleResize)
  }

  handleColorChange = (mode: COLOR_MODE) => {
    this.setState({ colorMode: mode });
  };

  handleCtrlDown = (ctrlKeyMode: number) => {
    this.setState({ ctrlKeyMode });
  };

  arrowGamePad = [0, 0]

  handleArrowKey = (key: ARROW, release: boolean) => {
    if (!release) {
      let code = 0
      switch (key) {
        case ARROW.LEFT: code = 8; this.arrowGamePad[0] = -1; break
        case ARROW.RIGHT: code = 21; this.arrowGamePad[0] = 1; break
        case ARROW.UP: code = 11; this.arrowGamePad[1] = -1; break
        case ARROW.DOWN: code = 10; this.arrowGamePad[1] = 1; break
      }
      passKeypress(String.fromCharCode(code))
    } else {
      switch (key) {
        case ARROW.LEFT: // fall thru
        case ARROW.RIGHT: this.arrowGamePad[0] = 0; break
        case ARROW.UP: // fall thru
        case ARROW.DOWN: this.arrowGamePad[1] = 0; break
      }
    }

    const gamePads: EmuGamepad[] = [{
      axes: [this.arrowGamePad[0], this.arrowGamePad[1], 0, 0],
      buttons: []
    }]
    passSetGamepads(gamePads)
  }

  handleOpenAppleDown = (openAppleKeyMode: number) => {
    // If we're going from 0 to nonzero, send the Open Apple keypress
    if (this.state.openAppleKeyMode === 0 && openAppleKeyMode > 0) {
      passAppleCommandKeyPress(true)
    } else if (this.state.openAppleKeyMode > 0 && openAppleKeyMode === 0) {
      window.setTimeout(() => passAppleCommandKeyRelease(true), 100)
    }
    this.setState({ openAppleKeyMode });
  };

  handleClosedAppleDown = (closedAppleKeyMode: number) => {
    // If we're going from 0 to nonzero, send the Closed Apple keypress
    if (this.state.closedAppleKeyMode === 0 && closedAppleKeyMode > 0) {
      passAppleCommandKeyPress(false)
    } else if (this.state.closedAppleKeyMode > 0 && closedAppleKeyMode === 0) {
      window.setTimeout(() => passAppleCommandKeyRelease(false), 100)
    }
    this.setState({ closedAppleKeyMode });
  };

  handleDebugChange = (enable: boolean) => {
    passSetDebug(enable)
    this.setState({ doDebug: enable });
  };

  handleUpperCaseChange = (enable: boolean) => {
    this.setState({ uppercase: enable });
  };

  handleUseArrowKeyJoystick = (enable: boolean) => {
    this.setState({ useArrowKeysAsJoystick: enable });
  };

  restoreSaveStateFunc = (fileContents: string) => {
    const saveState: EmulatorSaveState = JSON.parse(fileContents)
    passRestoreSaveState(saveState)
    if (saveState.emulator?.colorMode !== undefined) {
      this.handleColorChange(saveState.emulator.colorMode)
    }
    if (saveState.emulator?.uppercase !== undefined) {
      this.handleUpperCaseChange(saveState.emulator.uppercase)
    }
    if (saveState.emulator?.audioEnable !== undefined) {
      audioEnable(saveState.emulator.audioEnable)
    }
    if (saveState.emulator?.mockingboardMode !== undefined) {
      changeMockingboardMode(saveState.emulator.mockingboardMode)
    }
    passSetRunMode(RUN_MODE.RUNNING)
  }

  handleRestoreState = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target?.files?.length) {
      const fileread = new FileReader()
      const restoreStateReader = this.restoreSaveStateFunc
      fileread.onload = function (e) {
        if (e.target) {
          restoreStateReader(e.target.result as string)
        }
      };
      fileread.readAsText(e.target.files[0]);
    }
  };

  handleFileOpen = () => {
    if (this.hiddenFileOpen.current) {
      // Hack - clear out old file so we can pick the same file again
      this.hiddenFileOpen.current.value = "";
      this.hiddenFileOpen.current.click()
    }
  }

  doSaveStateCallback = (saveState: EmulatorSaveState) => {
    const d = new Date()
    let datetime = new Date(d.getTime() - (d.getTimezoneOffset() * 60000)).toISOString()
    if (saveState.emulator) {
      saveState.emulator.name = `Apple2TS Emulator`
      saveState.emulator.date = datetime
      saveState.emulator.help = this.state.helptext.split('\n')[0]
      saveState.emulator.colorMode = this.state.colorMode
      saveState.emulator.uppercase = this.state.uppercase
      saveState.emulator.audioEnable = isAudioEnabled()
      saveState.emulator.mockingboardMode = getMockingboardMode()
    }
    const state = JSON.stringify(saveState, null, 2)
    const blob = new Blob([state], { type: "text/plain" });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    let name = handleGetFilename(0)
    if (!name) {
      name = handleGetFilename(1)
      if (!name) {
        name = "apple2ts"
      }
    }
    datetime = datetime.replaceAll('-', '').replaceAll(':', '').split('.')[0]
    link.setAttribute('download', `${name}${datetime}.a2ts`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  handleFileSave = (withSnapshots: boolean) => {
    handleGetSaveState(this.doSaveStateCallback, withSnapshots)
  }

  copyCanvas = (handleBlob: (blob: Blob) => void, thumbnail = false) => {
    if (!this.hiddenCanvas?.current) return
    let copyCanvas = this.hiddenCanvas?.current
    if (thumbnail) {
      copyCanvas = document.createElement('canvas')
      copyCanvas.height = 128
      copyCanvas.width = copyCanvas.height * 1.333333
      // The willReadFrequently is a performance optimization hint that does
      // the rendering in software rather than hardware. This is better because
      // we're just reading back pixels from the canvas.
      const ctx = copyCanvas.getContext('2d', { willReadFrequently: true })
      if (!ctx) return
      ctx.imageSmoothingEnabled = false;
      ctx.drawImage(this.hiddenCanvas.current, 0, 0, 560, 384,
        0, 0, copyCanvas.width, copyCanvas.height)
    }
    copyCanvas.toBlob((blob) => {
      if (blob) handleBlob(blob)
    })
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
          const value = textPage[j * nchars + i]
          const v1 = getPrintableChar(value, isAltCharSet)
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
        this.copyCanvas((blob) => {
          navigator.clipboard.write([new ClipboardItem({ 'image/png': blob, })])
        })
      }
      catch (error) {
        console.error(error);
      }
    }
  }

  render() {
    const props: DisplayProps = {
      runMode: handleGetRunMode(),
      speed: this.state.currentSpeed,
      myCanvas: this.myCanvas,
      hiddenCanvas: this.hiddenCanvas,
      uppercase: this.state.uppercase,
      useArrowKeysAsJoystick: this.state.useArrowKeysAsJoystick,
      colorMode: this.state.colorMode,
      doDebug: this.state.doDebug,
      ctrlKeyMode: this.state.ctrlKeyMode,
      openAppleKeyMode: this.state.openAppleKeyMode,
      closedAppleKeyMode: this.state.closedAppleKeyMode,
      handleArrowKey: this.handleArrowKey,
      handleCtrlDown: this.handleCtrlDown,
      handleOpenAppleDown: this.handleOpenAppleDown,
      handleClosedAppleDown: this.handleClosedAppleDown,
      handleDebugChange: this.handleDebugChange,
      handleColorChange: this.handleColorChange,
      handleCopyToClipboard: this.handleCopyToClipboard,
      handleUpperCaseChange: this.handleUpperCaseChange,
      handleUseArrowKeyJoystick: this.handleUseArrowKeyJoystick,
      handleFileOpen: this.handleFileOpen,
      handleFileSave: this.handleFileSave,
    }
    const width = props.myCanvas.current?.width || 600
    const height = window.innerHeight - 30
    let paperWidth = window.innerWidth - width - 70
    if (paperWidth < 300) paperWidth = 300
    return (
      <div>
        <span className="flex-row">
          <span className="flex-column">
            <Apple2Canvas {...props} />
            <div className="flex-row-space-between wrap" style={{ width: width, display: width ? '' : 'none' }}>
              <ControlPanel {...props} />
              <DiskInterface />
              <ImageWriter />
            </div>
            <span className="defaultFont statusItem">
              <span>{props.speed} MHz</span>
              <br />
              <span>Apple2TS ©{new Date().getFullYear()} Chris Torrence&nbsp;
                <a href="https://github.com/ct6502/apple2ts/issues">Report an Issue</a></span>
            </span>
          </span>
          <span className="sidePanels">
            {props.doDebug ? <DebugSection /> :
              <HelpPanel helptext={this.state.helptext}
                height={height ? height : 400} width={paperWidth} />}
          </span>
        </span>
        <input
          type="file"
          accept=".a2ts"
          ref={this.hiddenFileOpen}
          onChange={this.handleRestoreState}
          style={{ display: 'none' }}
        />
      </div>
    );
  }
}

export default DisplayApple2;
