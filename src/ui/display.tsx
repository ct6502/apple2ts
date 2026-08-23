// Chris Torrence, 2022
import {
  passSpeedMode,
  passAppleCommandKeyPress,
  passAppleCommandKeyRelease,
  doOnMessage,
  setMain2Worker,
  handleGetMemSize,
  handleGetMachineName,
  handleGetSlotConfig,
  passSetRunMode,
  setBootCallback} from "./main2worker"
import Apple2Canvas from "./canvas"
import ControlPanel from "./controls/controlpanel"
import { useEffect, useState } from "react"
import DebugSection from "./panels/panels"
import FileInput from "./fileinput"
import { RestoreSaveState } from "./savestate"
import { handleFragment, handleInputParams } from "./inputparams"
import { loadPreferences } from "./localstorage"
import { RUN_MODE, TEST_DEBUG } from "../common/utility"
import DiskCollectionPanel from "./diskdialog/diskcollectionpanel"
import { handleSetTheme } from "./ui_utilities"
import DiskInterface from "./devices/disk/diskinterface"
import TouchJoystick from "./controls/touchjoystick"
import { getTheme, isEmbedMode, isGameMode, isMinimalTheme, setHelpText, getColorMode } from "./ui_settings"
import { messagelistener } from "./api/messagelistener"
import { CRTStartup } from "./graphics"
import { startRemoteControlBridge } from "./api/remotecontrol"
import { useTranslation } from "../i18n/useTranslation"
import { desktopLayoutPolicy, getDesktopLayout } from "./layout"
import FitControlRow from "./controls/fitcontrolrow"
import DesktopPanel from "./panels/desktoppanel"

// The classic emulator and Help panel need about this much room side by side.
const specialLayoutNarrowWidth = 1000

const getViewport = () => ({
  height: window.innerHeight || window.outerHeight - 120,
  width: document.documentElement.clientWidth || window.innerWidth || window.outerWidth - 20,
})

const DisplayApple2 = () => {
  const { t } = useTranslation()
  const [myInit, setMyInit] = useState(false)
  const [renderCount, setRenderCount] = useState(0)
  const [currentSpeed, setCurrentSpeed] = useState(1.02)
  const [avgFPS, setAvgFPS] = useState(0)
  const [ctrlKeyMode, setCtrlKeyMode] = useState(0)
  const [openAppleKeyMode, setOpenAppleKeyMode] = useState(0)
  const [closedAppleKeyMode, setClosedAppleKeyMode] = useState(0)
  const [showFileOpenDialog, setShowFileOpenDialog] = useState({ show: false, index: 0 })
  const [desktopPanelBelow, setDesktopPanelBelow] = useState(false)
  const [desktopPanelCollapsed, setDesktopPanelCollapsed] = useState(false)
  const [wideDesktopPanel, setWideDesktopPanel] = useState(false)
  const [worker, setWorker] = useState<Worker | null>(null)
  const [viewport, setViewport] = useState(getViewport)

  useEffect(() => {
    const handleResize = () => setViewport(getViewport())
    window.addEventListener("resize", handleResize)
    return () => window.removeEventListener("resize", handleResize)
  }, [])

  // We need to create our worker here so it has access to our properties
  // such as cpu speed and help text. Otherwise, if the emulator changed
  // those, we would have no way of setting them here and re-rendering.
  if (!worker) {
    const newWorker = new Worker(new URL("../worker/worker2main", import.meta.url),
    { type: "module" })
    newWorker.onmessage = (e: MessageEvent) => {
      const result = doOnMessage(e)
      if (result) {
        updateDisplay(result.speed, result.helptext)
      }
    }
    setWorker(newWorker)
    setMain2Worker(newWorker)
  }

  const updateDisplay: UpdateDisplay = (speed = 0, newhelptext = "") => {
    if (newhelptext.length > 0) {
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
    startRemoteControlBridge()
    const hasBasicProgram = handleInputParams()
    handleFragment(updateDisplay, hasBasicProgram)

    // Set up CRT boot effect callback
    setBootCallback(() => {
      const canvas = document.getElementById("apple2canvas") as HTMLCanvasElement
      if (canvas) {
        const ctx = canvas.getContext("2d")
        if (ctx) {
          const colorMode = getColorMode()
          CRTStartup(ctx, colorMode)
        }
      }
    })

    // Listen for binary data from VS Code extension
    window.addEventListener("message", messagelistener)

    if (TEST_DEBUG) {
      passSetRunMode(RUN_MODE.NEED_BOOT)
      setTimeout(() => { passSetRunMode(RUN_MODE.NEED_RESET) }, 700)
      // setTimeout(() => { passPasteText("CALL 768\n") }, 1000)
      setTimeout(() => { passSetRunMode(RUN_MODE.PAUSED) }, 1200)
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
    setAvgFPS: setAvgFPS,
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
  const { height, width } = viewport
  const desktop = !isTouchDevice && !isEmbedMode() && !isMinimalTheme() && !isGameMode()
  const narrow = isTouchDevice || (!desktop && width < specialLayoutNarrowWidth)
  const isLandscape = isTouchDevice && (width > height)
  useEffect(() => {
    if (isTouchDevice) {
      document.body.style.marginLeft = "0"
      document.body.style.marginRight = "0"
      document.body.style.marginTop = isLandscape ? "10px" : "0"
    }
  }, [isTouchDevice, isLandscape])
  useEffect(() => {
    document.documentElement.classList.toggle("desktop-layout", desktop)
    return () => document.documentElement.classList.remove("desktop-layout")
  }, [desktop])
  const machineName = handleGetMachineName()
  const slotConfig = handleGetSlotConfig()
  const isApple2Plus = machineName === "APPLE2P"
  const hasAuxCard = !isApple2Plus && slotConfig[3] === "aux"
  const mem = isApple2Plus ? 64 : (hasAuxCard ? (handleGetMemSize() + 64) : 64)
  const memSize = (mem > 1100) ? ((mem / 1024).toFixed() + "MB") : (mem + "KB")
  const status = <div className="default-font footer-item">
    <div>{currentSpeed}MHz, {memSize}, {avgFPS.toFixed(1)} FPS</div>
    <div>©{new Date().getFullYear()} Chris Torrence and</div>
    <div>the Apple2TS contributors</div>
    <div><a id="reportIssue" href="https://github.com/ct6502/apple2ts/issues">{t("controls.reportIssue")}</a></div>
    <div><a href="https://ct6502.org/privacy/">Privacy Policy</a></div>
  </div>

  if (isEmbedMode()) {
    return <Apple2Canvas {...props} />
  }

  if (desktop) {
    const layout = getDesktopLayout(width, height, {
      panelBelow: desktopPanelBelow,
      panelCollapsed: desktopPanelCollapsed,
      widePanel: wideDesktopPanel,
    })
    const desktopProps = {
      ...props,
      canvasBounds: { height: layout.screenHeight, width: layout.screenWidth },
    }
    return <>
      <div className={`desktop-emulator-layout${desktopPanelBelow ? " desktop-panel-layout-below" : ""}`} style={{
        gap: desktopLayoutPolicy.columnGap,
        gridTemplateColumns: desktopPanelBelow
          ? `${layout.monitorWidth}px`
          : `${layout.monitorWidth}px ${layout.panelWidth}px`,
      }}>
        <div className="desktop-primary-column" style={{
          minHeight: desktopPanelBelow
            ? undefined
            : layout.boundedPanelHeight,
          width: layout.monitorWidth,
        }}>
          <div className="desktop-primary-sticky">
            <Apple2Canvas {...desktopProps} />
            <div className="desktop-controls-and-status">
              <FitControlRow minHeight={desktopLayoutPolicy.controlStripHeight}>
                <ControlPanel {...desktopProps} singleRow />
              </FitControlRow>
              <div className="desktop-status-strip">
                {status}
              </div>
            </div>
            <div className="desktop-device-strip" style={{
              minHeight: desktopLayoutPolicy.deviceStripHeight,
            }}>
              <div className="desktop-disk-strip">
                <FitControlRow maxScale={0.8} minHeight={desktopLayoutPolicy.deviceStripHeight}>
                  <DiskInterface {...desktopProps} singleRow />
                </FitControlRow>
              </div>
            </div>
          </div>
        </div>
        <DesktopPanel
          boundedHeight={layout.boundedPanelHeight}
          collapsed={desktopPanelCollapsed}
          expandedWidth={layout.panelWidth}
          height={layout.panelHeight}
          below={desktopPanelBelow}
          onBelowChange={setDesktopPanelBelow}
          onCollapsedChange={setDesktopPanelCollapsed}
          wide={wideDesktopPanel}
          onWideChange={setWideDesktopPanel}>
          <DebugSection
            updateDisplay={updateDisplay}
            narrow={false}
            desktop
            horizontalTabs={desktopPanelBelow} />
        </DesktopPanel>
      </div>
      <FileInput {...desktopProps} />
    </>
  }

  return (
    <>
    <div className={narrow ? "flex-column-gap" : "flex-row-gap"} style={{ alignItems: "inherit" }}>
    <div className={isLandscape ? "flex-row" : "flex-column"}>
    <Apple2Canvas {...props} />
    <div className={"flex-row-gap" + " flexwrap"}  style={{ paddingLeft: "2px" }}>
      <ControlPanel {...props} />
      {!isGameMode() && <DiskInterface {...props} />}
    </div>
    {!isLandscape && !isGameMode() && status}
    </div>
    {isLandscape && !isGameMode() && status}
    {narrow && !isMinimalTheme() && !isGameMode() && <div className="divider"></div>}
    {!isGameMode() && <DebugSection updateDisplay={updateDisplay} narrow={narrow}/>}
    </div>
    {isMinimalTheme() && <DiskCollectionPanel {...props} />}
    {isMinimalTheme() && isTouchDevice && <TouchJoystick />}
    <FileInput {...props} />
    </>
  )
}

export default DisplayApple2
