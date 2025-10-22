// Chris Torrence, 2022
import {
  passSpeedMode,
  passAppleCommandKeyPress,
  passAppleCommandKeyRelease,
  doOnMessage,
  setMain2Worker,
  handleGetMemSize,
  passSetRunMode
} from "./main2worker"
import Apple2Canvas from "./canvas"
import ControlPanel from "./controls/controlpanel"
import { useState } from "react"
import DebugSection from "./panels/debugsection"
import FileInput from "./fileinput"
import { RestoreSaveState } from "./savestate"
import { handleFragment, handleInputParams } from "./inputparams"
import { loadPreferences } from "./localstorage"
import { RUN_MODE, TEST_DEBUG } from "../common/utility"
import DiskCollectionPanel from "./panels/diskcollectionpanel"
import { handleSetTheme } from "./ui_utilities"
import DiskInterface from "./devices/disk/diskinterface"
import TouchJoystick from "./controls/touchjoystick"
import { getTheme, isGameMode, isMinimalTheme, setHelpText } from "./ui_settings"

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
    const newWorker = new Worker(new URL("../worker/worker2main", import.meta.url),
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

  const updateDisplay: UpdateDisplay = (speed = 0, newhelptext = "") => {
    if (newhelptext && newhelptext.length > 1) {
      setHelpText(newhelptext)
    }
    if (speed && speed !== currentSpeed) {
      setCurrentSpeed(speed)
    }
    // ***** This is critical to make this update be a function.
    // That way React is forced to pass in the actual previous value,
    // rather than a cached value (thru a closure).
    // If you do setRenderCount(renderCount + 1), renderCount will always be
    // zero and NOTHING will update.
    setRenderCount(prevRenderCount => prevRenderCount + 1)
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
      })
    }
    // TODO: It's unclear whether we need to do this preloadAssets() call
    // or whether just having the assets within that file is good enough
    // for the preloading.
    // preloadAssets()
    passSpeedMode(0)
    loadPreferences()
    const hasBasicProgram = handleInputParams()
    handleFragment(updateDisplay, hasBasicProgram)
    //    window.addEventListener('beforeunload', (event) => {
    // Cancel the event as stated by the standard.
    //      event.preventDefault();
    // Chrome requires returnValue to be set.
    //      event.returnValue = '';
    //    });
    //    window.addEventListener("resize", handleResize)
    if (TEST_DEBUG) {
      passSetRunMode(RUN_MODE.NEED_BOOT)
      setTimeout(() => { passSetRunMode(RUN_MODE.NEED_RESET) }, 500)
      setTimeout(() => { passSetRunMode(RUN_MODE.PAUSED) }, 1000)
    }
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

  const theme = getTheme()
  handleSetTheme(theme)

  const isTouchDevice = "ontouchstart" in document.documentElement
  const height = window.innerHeight ? window.innerHeight : (window.outerHeight - 120)
  const width = window.innerWidth ? window.innerWidth : (window.outerWidth - 20)
  const narrow = isTouchDevice || (width < height)
  const isLandscape = isTouchDevice && (width > height)
  if (isTouchDevice) {
    document.body.style.marginLeft = "0"
    document.body.style.marginRight = "0"
    document.body.style.marginTop = isLandscape ? "10px" : "0"
  }
  const mem = handleGetMemSize() + 64
  const memSize = (mem > 1100) ? ((mem / 1024).toFixed() + " MB") : (mem + " KB")
  const status = <div className="default-font footer-item">
    <span>{currentSpeed} MHz, {memSize}</span>
    <br />
    <span>Apple2TS ©{new Date().getFullYear()} CT6502&nbsp;
      <a id="reportIssue" href="https://github.com/ct6502/apple2ts/issues">Report an Issue</a></span>
  </div>

  return (
    <div>
      <span className={narrow ? "flex-column-gap" : "flex-row-gap"} style={{ alignItems: "inherit" }}>
        <div className={isLandscape ? "flex-row" : "flex-column"}>
          <Apple2Canvas {...props} />
          <div className="flex-row-gap wrap"
            style={{ paddingLeft: "2px" }}>
            <ControlPanel {...props} />
            {!isGameMode() && <DiskInterface {...props} />}
          </div>
          {!isLandscape && !isGameMode() && status}
        </div>
        {isLandscape && status}
        {narrow && !isMinimalTheme() && !isGameMode() && <div className="divider"></div>}
        {!isGameMode() && <DebugSection updateDisplay={updateDisplay} />}
      </span>
      {isMinimalTheme() && <DiskCollectionPanel {...props} />}
      {isMinimalTheme() && isTouchDevice && <TouchJoystick />}
      <FileInput {...props} />
    </div>
  )
}

export default DisplayApple2
