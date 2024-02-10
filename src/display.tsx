// Chris Torrence, 2022
import {
  setDisplay,
  passSetSpeedMode,
  passAppleCommandKeyPress,
  passAppleCommandKeyRelease,
  handleGetIsDebugging
} from "./main2worker"
import Apple2Canvas from "./canvas"
import ControlPanel from "./controls/controlpanel"
import DiskInterface from "./devices/diskinterface"
import React from 'react';
import HelpPanel from "./panels/helppanel"
import DebugSection from "./panels/debugsection"
import ImageWriter from "./devices/imagewriter"
import FileInput from "./fileinput"
import { RestoreSaveState } from "./restoresavestate"
import { getCanvasSize } from "./graphics"
import { handleFragment, handleInputParams } from "./inputparams"

class DisplayApple2 extends React.Component<object,
  {
    currentSpeed: number;
    ctrlKeyMode: number;
    openAppleKeyMode: number;
    closedAppleKeyMode: number;
    helptext: string;
    showFileOpenDialog: { show: boolean, drive: number };
  }> {

  constructor(props: object) {
    super(props);
    this.state = {
      ctrlKeyMode: 0,
      openAppleKeyMode: 0,
      closedAppleKeyMode: 0,
      currentSpeed: 1.02,
      helptext: '',
      showFileOpenDialog: { show: false, drive: 0 }
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

  componentDidMount() {
    setDisplay(this)
    if ("launchQueue" in window) {
      const queue: LaunchQueue = window.launchQueue as LaunchQueue
      queue.setConsumer(async (launchParams: LaunchParams) => {
        const files: FileSystemFileHandle[] = launchParams.files
        if (files && files.length) {
          const fileContents = await (await files[0].getFile()).text()
          RestoreSaveState(fileContents)
        }
      });
    }
    // TODO: It's unclear whether I need to actually do this preloadAssets() call
    // or whether just having the assets within that file is good enough
    // for the preloading.
    // preloadAssets()
    passSetSpeedMode(0)
    handleInputParams()
    handleFragment()
    //    window.addEventListener('beforeunload', (event) => {
    // Cancel the event as stated by the standard.
    //      event.preventDefault();
    // Chrome requires returnValue to be set.
    //      event.returnValue = '';
    //    });
    //    window.addEventListener("resize", handleResize)
  }

  componentWillUnmount() {
    //    window.removeEventListener("resize", handleResize)
  }

  handleCtrlDown = (ctrlKeyMode: number) => {
    this.setState({ ctrlKeyMode })
  }

  handleOpenAppleDown = (openAppleKeyMode: number) => {
    // If we're going from 0 to nonzero, send the Open Apple keypress
    if (this.state.openAppleKeyMode === 0 && openAppleKeyMode > 0) {
      passAppleCommandKeyPress(true)
    } else if (this.state.openAppleKeyMode > 0 && openAppleKeyMode === 0) {
      // Hack: I guess a timeout of 100 ms is enough time for the
      // emulator to finish processing the keypress.
      window.setTimeout(() => passAppleCommandKeyRelease(true), 100)
    }
    this.setState({ openAppleKeyMode })
  }

  handleClosedAppleDown = (closedAppleKeyMode: number) => {
    // If we're going from 0 to nonzero, send the Closed Apple keypress
    if (this.state.closedAppleKeyMode === 0 && closedAppleKeyMode > 0) {
      passAppleCommandKeyPress(false)
    } else if (this.state.closedAppleKeyMode > 0 && closedAppleKeyMode === 0) {
      // Hack: I guess a timeout of 100 ms is enough time for the
      // emulator to finish processing the keypress.
      window.setTimeout(() => passAppleCommandKeyRelease(false), 100)
    }
    this.setState({ closedAppleKeyMode })
  }

  setShowFileOpenDialog = (show: boolean, drive: number) => {
    this.setState({ showFileOpenDialog: { show, drive } })
  }

  render() {
    const props: DisplayProps = {
      speed: this.state.currentSpeed,
      ctrlKeyMode: this.state.ctrlKeyMode,
      openAppleKeyMode: this.state.openAppleKeyMode,
      closedAppleKeyMode: this.state.closedAppleKeyMode,
      handleCtrlDown: this.handleCtrlDown,
      handleOpenAppleDown: this.handleOpenAppleDown,
      handleClosedAppleDown: this.handleClosedAppleDown,
      setShowFileOpenDialog: this.setShowFileOpenDialog,
    }
    const saveStateProps: SaveStateProps = {
      showFileOpenDialog: this.state.showFileOpenDialog,
      setShowFileOpenDialog: this.setShowFileOpenDialog,
    }
    const width = getCanvasSize()[0]
    const height = window.innerHeight - 30
    let paperWidth = window.innerWidth - width - 70
    if (paperWidth < 300) paperWidth = 300
    return (
      <div>
        <span className="flex-row">
          <span className="flex-column">
            <Apple2Canvas {...props} />
            <div className="flex-row-space-between wrap"
              style={{ width: width, display: width ? '' : 'none' }}>
              <ControlPanel {...props} />
              <DiskInterface setShowFileOpenDialog={this.setShowFileOpenDialog} />
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
            {handleGetIsDebugging() ? <DebugSection /> :
              <HelpPanel helptext={this.state.helptext}
                height={height ? height : 400} width={paperWidth} />}
          </span>
        </span>
        <FileInput {...saveStateProps} />
      </div>
    );
  }
}

export default DisplayApple2;
