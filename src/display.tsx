// Chris Torrence, 2022
import {
  passSpeedMode,
  passAppleCommandKeyPress,
  passAppleCommandKeyRelease,
  handleGetIsDebugging,
  doOnMessage,
  setMain2Worker,
  handleGetMemSize,
  passHelpText,
  handleGetHelpText,
  handleGetDarkMode
} from "./main2worker"
import Apple2Canvas from "./canvas"
import ControlPanel from "./controls/controlpanel"
import DiskInterface from "./devices/diskinterface"
import { useState } from 'react';
import HelpPanel from "./panels/helppanel"
import DebugSection from "./panels/debugsection"
import ImageWriter from "./devices/imagewriter"
import FileInput from "./fileinput"
import { RestoreSaveState } from "./savestate"
import { getCanvasSize } from "./graphics"
import { handleFragment, handleInputParams } from "./inputparams"
import { loadPreferences } from "./localstorage";

const DisplayApple2 = () => {
  const [myInit, setMyInit] = useState(false)
  const [renderCount, setRenderCount] = useState(0)
  const [currentSpeed, setCurrentSpeed] = useState(1.02)
  const [ctrlKeyMode, setCtrlKeyMode] = useState(0)
  const [openAppleKeyMode, setOpenAppleKeyMode] = useState(0)
  const [closedAppleKeyMode, setClosedAppleKeyMode] = useState(0)
  const [showFileOpenDialog, setShowFileOpenDialog] = useState({ show: false, index: 0 })
  const [worker, setWorker] = useState<Worker | null>(null)

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
      if (result) {
        updateDisplay(result.speed, result.helptext)
      }
    }
  }

  const updateDisplay: UpdateDisplay = (speed = 0, newhelptext = '') => {
    if (newhelptext && newhelptext.length > 1) {
      passHelpText(newhelptext)
    }
    if (speed && speed !== currentSpeed) {
      setCurrentSpeed(speed)
    }
    // ***** This is critical to make this update be a function.
    // That way React is forced to pass in the actual previous value,
    // rather than a cached value (thru a closure).
    // If you do setRenderCount(renderCount + 1), renderCount will always be
    // zero and NOTHING will update.
    setRenderCount(prevRenderCount => prevRenderCount + 1);
  }

  if (!myInit) {
    setMyInit(true)
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
    // TODO: It's unclear whether we need to do this preloadAssets() call
    // or whether just having the assets within that file is good enough
    // for the preloading.
    // preloadAssets()
    passSpeedMode(0)
    loadPreferences()
    handleInputParams()
    handleFragment(updateDisplay)
    //    window.addEventListener('beforeunload', (event) => {
    // Cancel the event as stated by the standard.
    //      event.preventDefault();
    // Chrome requires returnValue to be set.
    //      event.returnValue = '';
    //    });
    //    window.addEventListener("resize", handleResize)
  }

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

  const handleShowFileOpenDialog = (show: boolean, index: number) => {
    setShowFileOpenDialog({ show, index })
  }

  const props: DisplayProps = {
    speed: currentSpeed,
    renderCount: renderCount,
    ctrlKeyMode: ctrlKeyMode,
    openAppleKeyMode: openAppleKeyMode,
    closedAppleKeyMode: closedAppleKeyMode,
    showFileOpenDialog: showFileOpenDialog,
    updateDisplay: updateDisplay,
    handleCtrlDown: handleCtrlDown,
    handleOpenAppleDown: handleOpenAppleDown,
    handleClosedAppleDown: handleClosedAppleDown,
    setShowFileOpenDialog: handleShowFileOpenDialog,
  }

  if (handleGetDarkMode()) {
    document.body.classList.add('dark-mode')
  } else {
    document.body.classList.remove('dark-mode')
  }

  const isTouchDevice = "ontouchstart" in document.documentElement
  const canvasWidth = getCanvasSize()[0]
  const height = window.innerHeight ? window.innerHeight : (window.outerHeight - 120)
  const width = window.innerWidth ? window.innerWidth : (window.outerWidth - 20)
  const paperHeight = height - 20
  const narrow = isTouchDevice || (width < height)
  const isLandscape = isTouchDevice && (width > height)
  // For narrow we don't need to take into account the canvas width.
  let paperWidth = narrow ? (width) : (width - canvasWidth - 70)
  paperWidth = Math.min(Math.max(paperWidth, 300), canvasWidth)
  if (isTouchDevice) {
    document.body.style.marginLeft = "0"
    document.body.style.marginRight = "0"
    document.body.style.marginTop = isLandscape ? "10px" : "0"
  }
  const mem = handleGetMemSize() + 64
  const memSize = (mem > 1100) ? ((mem / 1024).toFixed() + " MB") : (mem + " KB")
  const status = <div className="default-font statusItem">
    <span>{props.speed} MHz, {memSize}</span>
    <br />
    <span>Apple2TS ©{new Date().getFullYear()} Chris Torrence&nbsp;
      <a href="https://github.com/ct6502/apple2ts/issues">Report an Issue</a></span>
  </div>

  return (
    <div>
      <span className={narrow ? "flex-column-gap" : "flex-row-gap"} style={{ alignItems: "inherit" }}>
        <div className={isLandscape ? "flex-row" : "flex-column"}>
          <Apple2Canvas {...props} />
          <div className="flex-row-space-between wrap"
            style={{ width: canvasWidth, display: canvasWidth ? '' : 'none' , paddingLeft: '2px' }}>
            <ControlPanel {...props} />
            <DiskInterface {...props} />
            <ImageWriter />
          </div>
          {!isLandscape && status}
        </div>
        {isLandscape && status}
        {narrow && <div className="divider"></div>}
        <span className="flex-column">
          {handleGetIsDebugging() ? <DebugSection /> :
            <HelpPanel narrow={narrow}
              helptext={handleGetHelpText()}
              height={paperHeight} width={paperWidth} />}
        </span>
      </span>
      <FileInput {...props} />
    </div>
  )
}

export default DisplayApple2;
