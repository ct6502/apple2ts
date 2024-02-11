// Chris Torrence, 2022
import {
  passSetSpeedMode,
  passAppleCommandKeyPress,
  passAppleCommandKeyRelease,
  handleGetIsDebugging,
  doOnMessage,
  setMain2Worker
} from "./main2worker"
import Apple2Canvas from "./canvas"
import ControlPanel from "./controls/controlpanel"
import DiskInterface from "./devices/diskinterface"
import React, { useEffect } from 'react';
import HelpPanel from "./panels/helppanel"
import DebugSection from "./panels/debugsection"
import ImageWriter from "./devices/imagewriter"
import FileInput from "./fileinput"
import { RestoreSaveState } from "./restoresavestate"
import { getCanvasSize } from "./graphics"
import { handleFragment, handleInputParams } from "./inputparams"

const DisplayApple2 = () => {
  const [renderCount, setRenderCount] = React.useState(0)
  const [currentSpeed, setCurrentSpeed] = React.useState(1.02)
  const [ctrlKeyMode, setCtrlKeyMode] = React.useState(0)
  const [openAppleKeyMode, setOpenAppleKeyMode] = React.useState(0)
  const [closedAppleKeyMode, setClosedAppleKeyMode] = React.useState(0)
  const [helptext, setHelptext] = React.useState('')
  const [showFileOpenDialog, setShowFileOpenDialog] = React.useState({ show: false, drive: 0 })
  const [worker, setWorker] = React.useState<Worker | null>(null)

  // We need to create our worker here so it has access to our properties
  // such as cpu speed and help text. Otherwise, if the emulator changed
  // those, we would have no way of setting them here and re-rendering.
  if (!worker) {
    const newWorker = new Worker(new URL('./emulator/worker2main', import.meta.url),
      { type: "module" })
    setWorker(newWorker)
    setMain2Worker(newWorker)
    newWorker.onmessage = (e: MessageEvent) => {
      const result = doOnMessage(e)
      if (result.speed || result.helptext) {
        updateDisplay(result.speed, result.helptext)
      }
    }
  }

  const updateDisplay = (speed = 0, helptext = '') => {
    if (helptext) {
      setHelptext(helptext)
    } else if (speed) {
      setCurrentSpeed(speed ? speed : currentSpeed)
    } else {
      setRenderCount(renderCount + 1)
    }
  }

  useEffect(() => {
    //    setDisplay(updateDisplay)
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
  }, [])

  const handleCtrlDown = (ctrlKeyMode: number) => {
    setCtrlKeyMode(ctrlKeyMode)
  }

  const handleOpenAppleDown = (newMode: number) => {
    // If we're going from 0 to nonzero, send the Open Apple keypress
    if (openAppleKeyMode === 0 && newMode > 0) {
      passAppleCommandKeyPress(true)
    } else if (openAppleKeyMode > 0 && newMode === 0) {
      // Hack: I guess a timeout of 100 ms is enough time for the
      // emulator to finish processing the keypress.
      window.setTimeout(() => passAppleCommandKeyRelease(true), 100)
    }
    setOpenAppleKeyMode(newMode)
  }

  const handleClosedAppleDown = (newMode: number) => {
    // If we're going from 0 to nonzero, send the Closed Apple keypress
    if (closedAppleKeyMode === 0 && newMode > 0) {
      passAppleCommandKeyPress(false)
    } else if (closedAppleKeyMode > 0 && newMode === 0) {
      // Hack: I guess a timeout of 100 ms is enough time for the
      // emulator to finish processing the keypress.
      window.setTimeout(() => passAppleCommandKeyRelease(false), 100)
    }
    setClosedAppleKeyMode(newMode)
  }

  const handleShowFileOpenDialog = (show: boolean, drive: number) => {
    setShowFileOpenDialog({ show, drive })
  }

  const props: DisplayProps = {
    speed: currentSpeed,
    renderCount: renderCount,
    ctrlKeyMode: ctrlKeyMode,
    openAppleKeyMode: openAppleKeyMode,
    closedAppleKeyMode: closedAppleKeyMode,
    updateDisplay: updateDisplay,
    handleCtrlDown: handleCtrlDown,
    handleOpenAppleDown: handleOpenAppleDown,
    handleClosedAppleDown: handleClosedAppleDown,
    showFileOpenDialog: showFileOpenDialog,
    setShowFileOpenDialog: handleShowFileOpenDialog,
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
            <DiskInterface {...props} />
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
            <HelpPanel helptext={helptext}
              height={height ? height : 400} width={paperWidth} />}
        </span>
      </span>
      <FileInput {...props} />
    </div>
  )
}

export default DisplayApple2;
