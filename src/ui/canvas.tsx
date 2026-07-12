import { KeyboardEvent, MouseEvent as ReactMouseEvent, useEffect, useRef, useState } from "react"
import "./canvas.css"
import {
  passSetRunMode, passKeypress,
  passAppleCommandKeyPress, passAppleCommandKeyRelease,
  passGoBackInTime,
  passGoForwardInTime,
  passMouseEvent,
  passPasteText,
  handleGetShowAppleMouse,
  handleGetRunMode,
  handleGetCout,
  passKeyRelease,
  handleGetMachineName,
  handleGetState6502,
  handleGetSoftSwitches,
  handleGetSpeedMode,
  handleGetTextPage,
} from "./main2worker"
import { ARROW, RUN_MODE, convertAppleKey, MouseEventSimple, UI_THEME } from "../common/utility"
import { ProcessDisplay, getCanvasSize, handleGetOverrideHires, canvasCoordToNormScreenCoord, xmargin, ymargin } from "./graphics"
import { checkGamepad, handleArrowKey, ensureGamepadEventListeners } from "./devices/gamepad"
import { handleCopyToClipboard } from "./copycanvas"
import { handleFileSave } from "./savestate"
import { handleSetCPUState } from "./controller"
import { setPreferenceSpeedMode } from "./localstorage"
import { getUseOpenAppleKey, getLowercaseMode, getShowScanlines, isMinimalTheme, getTheme } from "./ui_settings"
import { KeyboardControl } from "./controls/keyboardcontrol"
import HgrMagnifier from "./hgrmagnifier"
import { useGlobalContext } from "./globalcontext"

let resizeTimeout = 0
const maxFrameSamples = 60

let currentCommand = ""
const recallBuffer: string[] = []
let recallIndex = 99

type keyEvent = KeyboardEvent<HTMLTextAreaElement> | KeyboardEvent<HTMLCanvasElement>
let mainCanvas : HTMLCanvasElement | null = null

const Apple2Canvas = (props: DisplayProps) => {
  // const { updateHgr: updateHgr, setUpdateHgr: setUpdateHgr,
  //   hgrMagnifierLoc, setHgrMagnifierLoc: setHgrMagnifierLoc } = useGlobalContext()
  const { lockHgrMagnifier, setLockHgrMagnifier } = useGlobalContext()
  const [keyHandled, setKeyHandled] = useState(false)
  const [magnifierMouseLoc, setMagnifierMouseLoc] = useState([-1, -1])
  const [isCanvasFullScreen, setIsCanvasFullScreen] = useState(false)
  const [withinScreen, setWithinScreen] = useState(false)
  const lastFrameTimeRef = useRef(0)
  const startTimeForMaxFramesRef = useRef(0)
  const lastFPSLogRef = useRef(0)

  const myCanvas = useRef<HTMLCanvasElement>(null)
  const hiddenCanvas = useRef<HTMLCanvasElement>(null)

  const pasteHandler = (e: ClipboardEvent) => {
    const canvas = document.getElementById("apple2canvas")
    if (document.activeElement === canvas && e.clipboardData) {
      const data = e.clipboardData.getData("text")
      if (data !== "") {
        passPasteText(data)
      }
      e.preventDefault()
    }
  }

  const syntheticPaste = () => {
    const canvas = document.getElementById("apple2canvas")
    if (document.activeElement === canvas && document.hasFocus()) {
      // Errors can sometimes occur during debugging, if the canvas loses
      // focus. I tried using a try/catch but it didn't help. Just ignore.
      navigator.clipboard
        .readText()
        .then((data) => passPasteText(data))
    }
  }

  const metaKeyHandlers: { [key: string]: () => void } = {
    ArrowLeft: () => passGoBackInTime(),
    ArrowRight: () => passGoForwardInTime(),
    b: () => handleSetCPUState(RUN_MODE.NEED_BOOT),
    c: () => handleCopyToClipboard(),
    o: () => props.setShowFileOpenDialog(true, 0),
    r: () => handleSetCPUState(RUN_MODE.NEED_RESET),
    s: () => handleFileSave(false),
    v: () => syntheticPaste(),
    0: () => setPreferenceSpeedMode(-2),
    1: () => setPreferenceSpeedMode(0),
    2: () => setPreferenceSpeedMode(1),
    3: () => setPreferenceSpeedMode(2),
    4: () => setPreferenceSpeedMode(3),
    5: () => setPreferenceSpeedMode(4),
  }

  const handleMetaKey = (key: string) => {
    if (key in metaKeyHandlers) {
      metaKeyHandlers[key]()
      return true
    }
    return false
  }

  const arrowKeys: { [key: string]: ARROW } = {
    ArrowLeft: ARROW.LEFT,
    ArrowRight: ARROW.RIGHT,
    ArrowUp: ARROW.UP,
    ArrowDown: ARROW.DOWN,
  }

  const isMac = navigator.platform.startsWith("Mac")

  const isOpenAppleDown = (e: keyEvent) => {
    const useOpenAppleKey = getUseOpenAppleKey()
    return e.code === "AltLeft" || (useOpenAppleKey && e.code === "MetaLeft")
  }

  const isOpenAppleUp = (e: keyEvent) => {
    const useOpenAppleKey = getUseOpenAppleKey()
    return e.code === "AltLeft" || (useOpenAppleKey && e.code === "MetaLeft")
  }

  const isClosedAppleDown = (e: keyEvent) => {
    const useOpenAppleKey = getUseOpenAppleKey()
    return e.code === "AltRight" || (useOpenAppleKey && e.code === "MetaRight")
  }

  const isClosedAppleUp = (e: keyEvent) => {
    const useOpenAppleKey = getUseOpenAppleKey()
    return e.code === "AltRight" || (useOpenAppleKey && e.code === "MetaRight")
  }

  const isMetaSequence = (e: keyEvent): boolean => {
    if (e.shiftKey) {
      return false
    }
    // ASCII does not allow Ctrl+numbers, so just allow those as metasequence keys.
    // For example, Ctrl+3 to change to warp speed.
    if (e.key >= "0" && e.key <= "9" && e.ctrlKey) {
      return true
    }
    if (getUseOpenAppleKey()) {
      return false
    }
    if (isMac) {
      return e.metaKey && e.key !== "Meta"
    } else {
      return e.altKey && e.key !== "Alt"
    }
  }

  const inKeyboardLoop = () => {
    const s6502 = handleGetState6502()
    const switches = handleGetSoftSwitches()
    const isKeyboardLoop = switches.TEXT && s6502.PC >= 0xC26D && s6502.PC <= 0xC28E
    // See if we have a square bracket ], integer basic >, or monitor * prompt,
    // which are the three known keyboard loops. If we're not in one of those,
    // then just treat it as a normal keypress.
    if (!isKeyboardLoop) {
      return false
    }
    const textPage = handleGetTextPage()
    // First split into lines, dependiing upon whether we are 40 or 80 columns
    if (textPage.length > 0) {
      const nBytesPerLine = (textPage.length === 320 || textPage.length === 1920) ? 80 : 40
      for (let i = 0; i < textPage.length; i += nBytesPerLine) {
        const prompt = String.fromCharCode(textPage[i] & 0x7F)
        if (prompt.includes("]") || prompt.includes(">") || prompt.includes("*")) {
          return true
        }
      }
    }
    return false
  }

  const handleKeyDown = (e: keyEvent) => {
    let keyHandledLocal = false
    const isBrowserAltKey = e.code === "AltLeft" || e.code === "AltRight"
    if (isOpenAppleDown(e)) {
      passAppleCommandKeyPress(true)
    }
    if (isClosedAppleDown(e)) {
      passAppleCommandKeyPress(false)
    }
    if (isBrowserAltKey) {
      e.preventDefault()
      e.stopPropagation()
    }
    // TODO: What modifier key should be used on Windows? Can't use Ctrl
    // because that interferes with Apple II control keys like Ctrl+S
    //if (!e.shiftKey && (isMac ? (e.metaKey && e.key !== 'Meta') : (e.altKey && e.key !== 'Alt'))) {
    if (isMetaSequence(e)) {
      keyHandledLocal = handleMetaKey(e.key)
      // TODO: This allows Cmd+V to paste text, but breaks OpenApple+V.
      // How to handle both?
      //if (e.key === 'v') return;
    }
    // If we're paused, allow <space> to resume
    if (handleGetRunMode() === RUN_MODE.PAUSED && e.key === " ") {
      passSetRunMode(RUN_MODE.RUNNING)
      keyHandledLocal = true
    }
    if (keyHandledLocal) {
      setKeyHandled(true)
      passAppleCommandKeyRelease(true)
      passAppleCommandKeyRelease(false)
      e.preventDefault()
      e.stopPropagation()
      return
    }

    const isKeyboardLoop = inKeyboardLoop()

    if (e.key in arrowKeys) {

      if (isKeyboardLoop && recallBuffer.length > 0 &&
        (arrowKeys[e.key] === ARROW.UP || arrowKeys[e.key] === ARROW.DOWN)) {
        if (arrowKeys[e.key] === ARROW.UP) {
          recallIndex = Math.max(0, recallIndex - 1)
        } else if (arrowKeys[e.key] === ARROW.DOWN) {
          recallIndex = Math.min(recallBuffer.length, recallIndex + 1)
        }
        const recallCommand = recallBuffer[recallIndex]
        if (currentCommand.length > 0) {
          // Clear current command from BASIC line
          // Pass a single string containing the correct number of backspaces,
          // to avoid flooding the message channel with individual key events.
          const back = "\b".repeat(currentCommand.length)
          passPasteText(back + " ".repeat(currentCommand.length) + back)
        }
        if (recallCommand) {
          // Type recalled command into BASIC line
          passPasteText(recallCommand)
          currentCommand = recallCommand
        } else {
          currentCommand = ""
        }
      } else {
        handleArrowKey(arrowKeys[e.key], false)
      }
      e.preventDefault()
      e.stopPropagation()
      return
    }

    const lowercaseMode = getLowercaseMode()
    const key = convertAppleKey(e, lowercaseMode, props.ctrlKeyMode, handleGetCout())
    if (key > 0) {
      passKeypress(key)
      if (isKeyboardLoop) {
        if (key === 13) {
          if (currentCommand.length > 0) {
            if (currentCommand !== recallBuffer[recallBuffer.length - 1]) {
              recallBuffer.push(currentCommand)
              if (recallBuffer.length > 50) {
                recallBuffer.shift()
              }
            }
            currentCommand = ""
            recallIndex = recallBuffer.length
          }
        } else if (key >= 32 && key <= 126) {
          currentCommand += String.fromCharCode(key)
        }
      }
      e.preventDefault()
      e.stopPropagation()
    }
    if (props.ctrlKeyMode == 1) {
      props.handleCtrlDown(0)
    }
    if (props.openAppleKeyMode == 1) {
      props.handleOpenAppleDown(0)
    }
    if (props.closedAppleKeyMode == 1) {
      props.handleClosedAppleDown(0)
    }
  }

  const handleKeyUp = (e: keyEvent) => {
    const isBrowserAltKey = e.code === "AltLeft" || e.code === "AltRight"
    if (isOpenAppleUp(e)) {
      passAppleCommandKeyRelease(true)
    } else if (isClosedAppleUp(e)) {
      passAppleCommandKeyRelease(false)
    } else if (e.key in arrowKeys) {
      handleArrowKey(arrowKeys[e.key], true)
    } else {
      passKeyRelease()
    }
    if (keyHandled) {
      setKeyHandled(false)
      e.preventDefault()
      e.stopPropagation()
    }
    if (isBrowserAltKey) {
      e.preventDefault()
      e.stopPropagation()
      return
    }
  }

  const checkContentHeight = () => {
    const body = document.body
    const html = document.documentElement
    const contentHeight = Math.max(body.scrollHeight, body.offsetHeight, html.clientHeight, html.scrollHeight, html.offsetHeight)
    const viewportHeight = window.innerHeight

    if (contentHeight <= viewportHeight) {
      document.body.classList.add("no-scroll")
    } else {
      document.body.classList.remove("no-scroll")
    }
  }

  const releaseBlurredModifierState = () => {
    passAppleCommandKeyRelease(true)
    passAppleCommandKeyRelease(false)
    passKeyRelease()
  }

  const handleWindowBlur = () => {
    releaseBlurredModifierState()
  }

  const handleVisibilityChange = () => {
    if (document.hidden) {
      releaseBlurredModifierState()
    }
  }

  const handleResize = () => {
    if (mainCanvas) {
      checkContentHeight()
      props.updateDisplay()
    }
  }

  const [width, height] = getCanvasSize()

  const RenderCanvas = (timestamp: number) => {
    const elapsed = timestamp - lastFrameTimeRef.current
    // Some odd "race the beam" graphics demos require 60 FPS, but only do this
    // for 1 MHz or slower speeds. Throttle the frame rate at higher CPU
    // speed to help reduce CPU usage.
    // Test image from Brendan:
    // https://github.com/badvision/a2-pseudocolor/raw/refs/heads/main/disks/flicker.po
    const targetFrameRate = (handleGetSpeedMode() <= 0) ? 75 : 45 // Hz
    const targetInterval = 1000 / targetFrameRate
    
    if (elapsed >= targetInterval) {
      if (mainCanvas && hiddenCanvas.current) {
        const ctx = (mainCanvas as HTMLCanvasElement).getContext("2d")
        const hiddenCtx = (hiddenCanvas.current as HTMLCanvasElement).getContext("2d")
        if (ctx && hiddenCtx) {
          const [w, h] = getCanvasSize()   // always current
          ProcessDisplay(ctx, hiddenCtx, w, h)
        }
        checkGamepad()
      }

      // Calculate and log FPS
      lastFPSLogRef.current++
      if (lastFPSLogRef.current >= maxFrameSamples) {
        const avgFPS = (lastFPSLogRef.current / (timestamp - startTimeForMaxFramesRef.current)) * 1000
        props.setAvgFPS(avgFPS)
        lastFPSLogRef.current = 0
        startTimeForMaxFramesRef.current = timestamp
      }
      
      lastFrameTimeRef.current = timestamp
    }
    
    // Changing this refresh interval to be less often has no effect on the "fast" speed.
    window.requestAnimationFrame(RenderCanvas)
  }

  const scaleMouseEvent = (event: ReactMouseEvent<HTMLCanvasElement>): MouseEventSimple | null => {
    let x = 0
    let y = 0
    if (mainCanvas) {
      [x, y] = canvasCoordToNormScreenCoord(mainCanvas, event.clientX, event.clientY)
      if (x < 0 || x > 1 || y < 0 || y > 1) {
        return null
      }
    }
    return { x, y, buttons: -1 }
  }

  const handleMouseDown = (event: ReactMouseEvent<HTMLCanvasElement>) => {
    const evt = scaleMouseEvent(event)
    if (!evt) return
    evt.buttons = event.button === 0 ? 0x10 : 0x11
    passMouseEvent(evt)
    if (handleGetOverrideHires()) {
      const newLockHgrMagnifier = !lockHgrMagnifier
      setLockHgrMagnifier(newLockHgrMagnifier)
      setMagnifierMouseLoc([event.clientX, event.clientY])
    }
  }

  const handleMouseUp = (event: ReactMouseEvent<HTMLCanvasElement>) => {
    const evt = scaleMouseEvent(event)
    if (!evt) return
    evt.buttons = event.button === 0 ? 0x00 : 0x01
    passMouseEvent(evt)
  }

  const handleMouseMove = (event: ReactMouseEvent<HTMLCanvasElement>) => {
    const evt = scaleMouseEvent(event)
    if (handleGetOverrideHires() && !lockHgrMagnifier) {
      setMagnifierMouseLoc([event.clientX, event.clientY])
    }
    if (!evt) {
      setWithinScreen(false)
      return
    }
    setWithinScreen(true)
    passMouseEvent(evt)
  }

  const handleCanvasResize = (canvas: HTMLCanvasElement) => {
    if (!canvas) return "0px"

    // Give React some time to deal resize events
    window.setTimeout(() => {
      const width = canvas.offsetWidth
      const height = canvas.offsetHeight

      const scanlinesWidth = width - 2 * width * xmargin + 20
      const scanlinesHeight = height - 2 * height * ymargin

      let scanlinesLeft = canvas.offsetLeft + width * xmargin - 10
      let scanlinesTop = canvas.offsetTop + height * ymargin
      const isFullScreen = document.fullscreenElement === canvas.parentElement

      if (!isFullScreen) {
        let marginLeft = canvas.offsetLeft + width * xmargin
        let marginTop = canvas.offsetTop + height * ymargin

        if (isMinimalTheme()) {
          marginLeft = (window.innerWidth - scanlinesWidth) / 2
          marginTop = ((window.innerHeight - scanlinesHeight) / 2)

          const debugSection = document.getElementsByClassName("flyout-top-right")[0] as HTMLElement
          if (debugSection && debugSection.offsetWidth > 200) {
            marginLeft = Math.max(Math.min(marginLeft, (debugSection.offsetLeft - scanlinesWidth) / 2), 0)
          }

          canvas.style.marginLeft = `${marginLeft - width * xmargin}px`
          canvas.style.marginTop = `${Math.max(marginTop - height * ymargin - 160, 32)}px`
        } else {
          canvas.style.marginLeft = "0px"
          canvas.style.marginTop = "0px"
        }
      } else {
        const marginLeft = Math.max((window.innerWidth - width) / 2, 0)
        const marginTop = Math.max((window.innerHeight - height) / 2, 0)

        canvas.style.marginLeft = `${marginLeft}px`
        canvas.style.marginTop = `${marginTop}px`

        scanlinesLeft = marginLeft + width * xmargin
        scanlinesTop = marginTop + height * ymargin
      }

      document.body.style.setProperty("--scanlines-left", `${scanlinesLeft}px`)
      document.body.style.setProperty("--scanlines-top", `${scanlinesTop}px`)
      document.body.style.setProperty("--scanlines-width", `${scanlinesWidth}px`)
      document.body.style.setProperty("--scanlines-height", `${scanlinesHeight}px`)
      resizeTimeout = 200
    }, resizeTimeout)

    return canvas.style.marginLeft
  }

  // To make sure this only gets called once, do not add dependencies such as RenderCanvas.
  useEffect(() => {
    mainCanvas = document.getElementById("apple2canvas") as HTMLCanvasElement
    mainCanvas.addEventListener("copy", () => { handleCopyToClipboard() })
    const paste = (e: object) => { pasteHandler(e as ClipboardEvent) }
    mainCanvas.addEventListener("paste", paste)
    window.addEventListener("resize", handleResize)
    window.addEventListener("blur", handleWindowBlur)
    document.addEventListener("visibilitychange", handleVisibilityChange)
    const handleFullscreenChange = () => {
      setIsCanvasFullScreen(document.fullscreenElement === mainCanvas?.parentElement)
    }
    document.addEventListener("fullscreenchange", handleFullscreenChange)
    ensureGamepadEventListeners()
    handleResize()

    new ResizeObserver(entries => {
      for (const entry of entries) {
        handleCanvasResize(entry.target as HTMLCanvasElement)
      }
    }).observe(mainCanvas)
    document.body.style.setProperty("--scanlines-display", getShowScanlines() ? "block" : "none")

    RenderCanvas(0)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const setFocus = () => {
    if (mainCanvas) {
      (mainCanvas as HTMLCanvasElement).focus()
    }
  }

  const isTouchDevice = "ontouchstart" in document.documentElement
  const noBackgroundImage = isTouchDevice || isCanvasFullScreen || isMinimalTheme()

  // useEffect(() => {
  //   if (handleGetOverrideHires() && updateHgr) {
  //     setUpdateHgr(false)  // no need for setTimeout inside an effect
  //     if (hgrMagnifier[0] !== -1 && (hgrMagnifier[0] !== hgrMagnifierLocal[0] || hgrMagnifier[1] !== hgrMagnifierLocal[1])) {
  //       setHgrMagnifierCoord(hgrMagnifier)
  //       setshowHgrMagnifier(true)
  //     }
  //   }
  // // eslint-disable-next-line react-hooks/exhaustive-deps
  // }, [updateHgr, hgrMagnifier])

  const cursor = (handleGetShowAppleMouse() && withinScreen) ?
    `url(${window.assetRegistry.dotCursor}), none` : "default"

  const machine = handleGetMachineName()
  const bgImg = machine === "APPLE2P" ?
    window.assetRegistry.bgImgApple2Plus : window.assetRegistry.bgImage
  const backgroundImage = noBackgroundImage ? "" : `url(${bgImg})`

  return (
    <span className="canvas-text scanline-gradient">
      <canvas ref={myCanvas}
        id="apple2canvas"
        className="main-canvas"
        style={{
          cursor: cursor,
          borderColor: (machine === "APPLE2P" || getTheme() === UI_THEME.DARK) ? "black" : "#583927",
          borderRadius: noBackgroundImage ? "0" : "18px",
          borderWidth: (noBackgroundImage || machine === "APPLE2P") ? "0" : "2px",
          backgroundImage: `${backgroundImage}`,
        }}
        width={width} height={height}
        tabIndex={0}
        onKeyDown={isTouchDevice ? () => { } : handleKeyDown}
        onKeyUp={isTouchDevice ? () => { } : handleKeyUp}
        onMouseEnter={setFocus}
        onMouseDown={isTouchDevice ? setFocus : (e) => { setFocus(); handleMouseDown(e) }}
        onMouseUp={isTouchDevice ? undefined : handleMouseUp}
        onMouseMove={isTouchDevice ? undefined : handleMouseMove}
      />
      {/* Use hidden canvas/context so image rescaling works in iOS < 15.
          See graphics.ts drawImage() */}
      <canvas ref={hiddenCanvas}
        id="hiddenCanvas"
        hidden={true}
        width={560} height={384} />
      {handleGetOverrideHires() && <HgrMagnifier mainCanvas={mainCanvas}
        mouseLoc={magnifierMouseLoc} lockHgrMagnifier={lockHgrMagnifier} />}
      <KeyboardControl/>
    </span>
  )
}

export default Apple2Canvas
