import { FormEvent, KeyboardEvent, useRef, useState } from "react"
import "./canvas.css"
import {
  passSetRunMode, passKeypress,
  passAppleCommandKeyPress, passAppleCommandKeyRelease,
  passGoBackInTime,
  passGoForwardInTime,
  passMouseEvent,
  passPasteText,
  handleGetShowMouse,
  handleGetCapsLock,
  handleGetRunMode,
  handleGetCout,
  handleUseOpenAppleKey,
  handleGetShowScanlines,
  handleGetTheme,
  handleGetIsDebugging,
} from "./main2worker"
import { ARROW, RUN_MODE, convertAppleKey, MouseEventSimple, COLOR_MODE, toHex, UI_THEME } from "../common/utility"
import { ProcessDisplay, getCanvasSize, getOverrideHiresPixels, handleGetOverrideHires, canvasCoordToNormScreenCoord, screenBytesToCanvasPixels, screenCoordToCanvasCoord, nRowsHgrMagnifier, nColsHgrMagnifier, xmargin, ymargin } from "./graphics"
import { checkGamepad, handleArrowKey } from "./devices/gamepad"
import { handleCopyToClipboard } from "./copycanvas"
import { drawHiresTile } from "./graphicshgr"
import { useGlobalContext } from "./globalcontext"
import { handleFileSave } from "./savestate"
import bgImage from "./img/crt.jpg"
import { handleSetCPUState } from "./controller"
import { setPreferenceSpeedMode } from "./localstorage"


let width = 800
let height = 600

type keyEvent = KeyboardEvent<HTMLTextAreaElement> | KeyboardEvent<HTMLCanvasElement>

const Apple2Canvas = (props: DisplayProps) => {
  const { updateHgr: updateHgr, setUpdateHgr: setUpdateHgr,
    hgrMagnifier, setHgrMagnifier: setHgrMagnifier } = useGlobalContext()
  const [myInit, setMyInit] = useState(false)
  const [keyHandled, setKeyHandled] = useState(false)
  const [showHgrMagnifier, setshowHgrMagnifier] = useState(false)
  const [hgrMagnifierLocal, setHgrMagnifierLocal] = useState([-1, -1])
  const hgrMagnifierRef = useRef([-1, -1])
  const lockHgrMagnifierRef = useRef(false)
  const myText = useRef<HTMLTextAreaElement>(null)
  const myCanvas = useRef<HTMLCanvasElement>(null)
  const hiddenCanvas = useRef<HTMLCanvasElement>(null)
  const infoCanvas = useRef<HTMLCanvasElement>(null)

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
    1: () => setPreferenceSpeedMode(0),
    2: () => setPreferenceSpeedMode(1),
    3: () => setPreferenceSpeedMode(2),
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
    const useOpenAppleKey = handleUseOpenAppleKey()
    return e.code === "AltLeft" || (useOpenAppleKey && e.code === "MetaLeft")
  }

  const isOpenAppleUp = (e: keyEvent) => {
    const useOpenAppleKey = handleUseOpenAppleKey()
    return e.code === "AltLeft" || (useOpenAppleKey && e.code === "MetaLeft")
  }

  const isClosedAppleDown = (e: keyEvent) => {
    const useOpenAppleKey = handleUseOpenAppleKey()
    return e.code === "AltRight" || (useOpenAppleKey && e.code === "MetaRight")
  }

  const isClosedAppleUp = (e: keyEvent) => {
    const useOpenAppleKey = handleUseOpenAppleKey()
    return e.code === "AltRight" || (useOpenAppleKey && e.code === "MetaRight")
  }

  // This is needed for Android, which does not send keydown/up events.
  // https://bugs.chromium.org/p/chromium/issues/detail?id=118639
  // https://stackoverflow.com/questions/36753548/keycode-on-android-is-always-229
  const handleOnInput = (e: FormEvent) => {
    if ("nativeEvent" in e) {
      const ev = e.nativeEvent as InputEvent
      const event = {
        key: "",
        code: "",
        shiftKey: false,
        metaKey: false,
        altKey: false,
        preventDefault: () => { },
        stopPropagation: () => { }
      }
      // Is this a normal character, or a special one?
      if (ev.data) {
        event.key = ev.data as string
      } else if (ev.inputType === "deleteContentBackward") {
        event.key = "Backspace"
      } else if (ev.inputType === "insertLineBreak") {
        event.key = "Enter"
      }
      handleKeyDown(event as keyEvent)
    }
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
    if (handleUseOpenAppleKey()) {
      return false
    }
    if (isMac) {
      return e.metaKey && e.key !== "Meta"
    } else {
      return e.altKey && e.key !== "Alt"
    }
  }

  const handleKeyDown = (e: keyEvent) => {
    let keyHandledLocal = false
    if (isOpenAppleDown(e)) {
      passAppleCommandKeyPress(true)
    }
    if (isClosedAppleDown(e)) {
      passAppleCommandKeyPress(false)
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

    if (e.key in arrowKeys) {
      handleArrowKey(arrowKeys[e.key], false)
      e.preventDefault()
      e.stopPropagation()
      return
    }

    const capsLock = handleGetCapsLock()
    const key = convertAppleKey(e, capsLock, props.ctrlKeyMode, handleGetCout())
    if (key > 0) {
      passKeypress(String.fromCharCode(key))
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
    if (isOpenAppleUp(e)) {
      passAppleCommandKeyRelease(true)
    } else if (isClosedAppleUp(e)) {
      passAppleCommandKeyRelease(false)
    } else if (e.key in arrowKeys) {
      handleArrowKey(arrowKeys[e.key], true)
    }
    if (keyHandled) {
      setKeyHandled(false)
      e.preventDefault()
      e.stopPropagation()
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

  const handleResize = () => {
    if (myCanvas.current) {
      checkContentHeight()
      props.updateDisplay()
    }
  }

  const RenderCanvas = () => {
    if (myCanvas.current && hiddenCanvas.current) {
      const ctx = (myCanvas.current as HTMLCanvasElement).getContext("2d")
      const hiddenCtx = (hiddenCanvas.current as HTMLCanvasElement).getContext("2d")
      if (ctx && hiddenCtx) {
        ProcessDisplay(ctx, hiddenCtx, width, height)
      }
    }
    // Changing this refresh interval to be less often has no effect on the "fast" speed.
    window.requestAnimationFrame(RenderCanvas)
  }

  const scaleMouseEvent = (event: MouseEvent): MouseEventSimple => {
    let x = 0
    let y = 0
    if (myCanvas.current) {
      [x, y] = canvasCoordToNormScreenCoord(myCanvas.current, event.clientX, event.clientY)
      x = Math.min(Math.max(x, 0), 1)
      y = Math.min(Math.max(y, 0), 1)
    }
    return { x, y, buttons: -1 }
  }

  const handleMouseDown = (event: MouseEvent) => {
    const evt = scaleMouseEvent(event)
    evt.buttons = event.button === 0 ? 0x10 : 0x11
    passMouseEvent(evt)
    if (handleGetOverrideHires()) {
      lockHgrMagnifierRef.current = !lockHgrMagnifierRef.current
      handleNewHgrMagnifierCoord(event.clientX, event.clientY)
      setHgrMagnifier(hgrMagnifierRef.current)
    }
  }

  const handleMouseUp = (event: MouseEvent) => {
    const evt = scaleMouseEvent(event)
    evt.buttons = event.button === 0 ? 0x00 : 0x01
    passMouseEvent(evt)
  }

  const handleNewHgrMagnifierCoord = (clientX: number, clientY: number) => {
    let showView = false
    if (handleGetOverrideHires()) {
      if (myCanvas.current) {
        showView = true
        let [x, y] = canvasCoordToNormScreenCoord(myCanvas.current, clientX, clientY)
        x = Math.floor(x * 280)
        y = Math.floor(y * 192)
        if (x >= 0 && x < 280 && y >= 0 && y < 192) {
          // Make sure the showHgrMagnifier doesn't go off the edge of the screen.
          // Also shift it to the left so it falls more naturally on an
          // HGR screen byte boundary.
          x = Math.min(Math.max(Math.floor(x / 7), 0), 40 - nColsHgrMagnifier)
          const nHalf = nRowsHgrMagnifier / 2
          y = Math.max(nHalf - 1, Math.min(y, 191 - nHalf)) - (nHalf - 1)
          if (!lockHgrMagnifierRef.current) {
            setHgrMagnifierLocal([x, y])
            hgrMagnifierRef.current = [x, y]
          }
        }
      }
    }
    setshowHgrMagnifier(showView)
  }

  const handleMouseMove = (event: MouseEvent) => {
    const scaled = scaleMouseEvent(event)
    handleNewHgrMagnifierCoord(event.clientX, event.clientY)
    passMouseEvent(scaled)
  }

  const drawBytes = (pixels: number[][]) => {
    if (infoCanvas.current) {
      const canvas = infoCanvas.current as HTMLCanvasElement
      const context = canvas.getContext("2d")
      if (context) {
        context.fillStyle = "black"
        context.fillRect(0, 0, canvas.width, canvas.height)
        const tile = new Uint8Array(nColsHgrMagnifier * nRowsHgrMagnifier)
        for (let j = 0; j < nRowsHgrMagnifier; j++) {
          for (let i = 0; i < nColsHgrMagnifier; i++) {
            tile[nColsHgrMagnifier * j + i] = pixels[j][i + 1]
          }
        }
        context.imageSmoothingEnabled = false
        const addr = pixels[0][0]
        const isEven = addr % 2 === 0
        drawHiresTile(context, tile, COLOR_MODE.NOFRINGE,
          nRowsHgrMagnifier, 0, 0, 11, isEven)
        // Draw vertical lines
        const nPixels = 7 * nColsHgrMagnifier
        for (let i = 1; i < nPixels; i++) {
          const x = Math.round((canvas.width / nPixels) * i + 0.5) - 0.5
          context.moveTo(x, 0)
          context.lineTo(x, canvas.height)
        }
        // Draw horizontal lines
        for (let i = 1; i <= nRowsHgrMagnifier - 1; i++) {
          const y = Math.round((canvas.height / nRowsHgrMagnifier) * i + 0.5) - 0.5
          context.moveTo(0, y)
          context.lineTo(canvas.width, y)
        }
        context.strokeStyle = "#888"
        context.stroke()
      }
    }
  }

  const formatHgrMagnifier = () => {
    if (!myCanvas.current || hgrMagnifierLocal[0] < 0) return <></>
    const pixels = getOverrideHiresPixels(hgrMagnifierLocal[0], hgrMagnifierLocal[1])
    if (!pixels) return <></>
    const pixelText = pixels.map((line: Array<number>, i) => {
      return <div key={i}>
        {`${toHex(line[0])}: ${line.slice(1, nColsHgrMagnifier + 1).map((value) => toHex(value, 2)).join(" ")}`}
      </div>
    })
    const [dx, dy] = screenBytesToCanvasPixels(myCanvas.current, nColsHgrMagnifier, nRowsHgrMagnifier)
    const col = 7 * hgrMagnifierLocal[0]
    const row = hgrMagnifierLocal[1]
    let [x, y] = screenCoordToCanvasCoord(myCanvas.current, col, row)
    x -= 2
    y -= 2
    setTimeout(() => drawBytes(pixels), 50)
    return <div className="hgr-view flex-row"
      style={{ left: `${x}px`, top: `${y}px` }}>
      <div className="hgr-view-box" style={{ width: `${dx}px`, height: `${dy}px` }}>&nbsp;</div>
      <div className="hgr-view-text">{pixelText}</div>
      <canvas ref={infoCanvas}
        style={{ zIndex: "9999", border: "2px solid red" }}
        width={`${77 * nColsHgrMagnifier}pt`} height={`${11 * nRowsHgrMagnifier}pt`} />
    </div>
  }

  const handleCanvasResize = (canvas: HTMLCanvasElement) => {
    if (!canvas) return "0"

    const width = canvas.offsetWidth
    const height = canvas.offsetHeight

    const isCanvasFullScreen = document.fullscreenElement === myCanvas?.current?.parentElement

    if (isCanvasFullScreen) {
      const marginLeft = Math.max((window.innerWidth - width) / 2, 0)
      canvas.style.marginLeft = `${marginLeft}px`
      const marginTop = Math.max((window.innerHeight - height) / 2, 0)
      canvas.style.marginTop = `${marginTop}px`
      return canvas.style.marginLeft
    }

    const scanlinesWidth = width - 2 * width * xmargin
    const scanlinesHeight = height - 2 * height * ymargin

    let scanlinesLeft = canvas.offsetLeft + width * xmargin
    let scanlinesTop = canvas.offsetTop + height * ymargin

    if (handleGetTheme() == UI_THEME.MINIMAL) {
      scanlinesLeft = (window.innerWidth - scanlinesWidth) / 2
      scanlinesTop = ((window.innerHeight - scanlinesHeight) / 2) - 50

      if (handleGetIsDebugging()) {
        const debugSection = document.getElementsByClassName("flyout-bottom-right")[0] as HTMLElement
        if (debugSection) {
          scanlinesLeft = Math.max(Math.min(scanlinesLeft, (debugSection.offsetLeft - scanlinesWidth) / 2), 0)
        }
      }

      canvas.style.marginLeft = `${scanlinesLeft - width * xmargin}px`
      canvas.style.marginTop = `${scanlinesTop - height * ymargin}px`
    } else {
      canvas.style.marginLeft = "0"
      canvas.style.marginTop = "0"
    }

    document.body.style.setProperty("--scanlines-left", `${scanlinesLeft}px`)
    document.body.style.setProperty("--scanlines-top", `${scanlinesTop}px`)
    document.body.style.setProperty("--scanlines-width", `${scanlinesWidth}px`)
    document.body.style.setProperty("--scanlines-height", `${scanlinesHeight}px`)

    return canvas.style.marginLeft
  }

  // We should probably be using a useEffect here, but when I tried that,
  // I needed to add dependencies such as RenderCanvas, and useEffect was then
  // called multiple times. Using an initialization flag forces this to
  // only get called once.
  if (!myInit) {
    const initialize = () => {
      if (myCanvas.current) {
        setMyInit(true)
        const canvas = myCanvas.current as HTMLCanvasElement
        canvas.addEventListener("mousemove", handleMouseMove)
        canvas.addEventListener("mousedown", handleMouseDown)
        canvas.addEventListener("mouseup", handleMouseUp)
        canvas.addEventListener("copy", () => { handleCopyToClipboard() })
        const paste = (e: object) => { pasteHandler(e as ClipboardEvent) }
        canvas.addEventListener("paste", paste)
        window.addEventListener("resize", handleResize)
        window.setInterval(() => { checkGamepad() }, 34)
        handleResize()

        new ResizeObserver(entries => {
          for (const entry of entries) {
            handleCanvasResize(entry.target as HTMLCanvasElement)
          }
        }).observe(canvas)
        document.body.style.setProperty("--scanlines-display", handleGetShowScanlines() ? "block" : "none")

        RenderCanvas()
      } else {
        // This doesn't ever seem to get hit. I guess just doing the 
        // setTimeout below (even with a timeout of 0) is enough to
        // let React get the "myCanvas" ref set properly.
        // But just leave it here as a backup.
        window.setTimeout(() => initialize(), 0)
      }
    }
    window.setTimeout(() => initialize(), 0)
  }

  const setFocus = () => {
    if (myText.current) {
      (myText.current as HTMLTextAreaElement).focus()
    } else if (myCanvas.current) {
      (myCanvas.current as HTMLCanvasElement).focus()
    }
  }

  const isMinimalTheme = handleGetTheme() == UI_THEME.MINIMAL
  const isTouchDevice = "ontouchstart" in document.documentElement
  const isCanvasFullScreen = document.fullscreenElement === myCanvas?.current?.parentElement
  const noBackgroundImage = isTouchDevice || isCanvasFullScreen || isMinimalTheme;

  // if (!isCanvasFullScreen && myCanvas && myCanvas.current) {
  //   myCanvas.current.requestFullscreen()
  // }

  [width, height] = getCanvasSize()

  // Make keyboard events work on touch devices by using a hidden textarea.
  const isAndroidDevice = /Android/i.test(navigator.userAgent)
  const txt = isAndroidDevice ?
    <textarea className="hidden-textarea" hidden={false} ref={myText}
      onInput={handleOnInput} /> :
    (isTouchDevice ?
      <textarea className="hidden-textarea" hidden={false} ref={myText}
        onKeyDown={handleKeyDown}
        onKeyUp={handleKeyUp}
      /> : <span></span>)

  if (handleGetOverrideHires() && updateHgr) {
    setTimeout(() => { setUpdateHgr(false) }, 0)
    // See if our view box position has changed, perhaps because the user
    // clicked on an HGR memory location in the memory dump panel.
    if (hgrMagnifier[0] !== -1 && (hgrMagnifier[0] !== hgrMagnifierLocal[0] || hgrMagnifier[1] !== hgrMagnifierLocal[1])) {
      setHgrMagnifierLocal(hgrMagnifier)
      hgrMagnifierRef.current = hgrMagnifier
      setshowHgrMagnifier(true)
    }
  }

  const cursor = handleGetShowMouse() ?
    ((showHgrMagnifier && !lockHgrMagnifierRef.current) ? "none" : "crosshair") : "none"

  const backgroundImage = noBackgroundImage ? "" : `url(${bgImage})`

  return (
    <span className="canvas-text scanline-gradient">
      <canvas ref={myCanvas}
        id="apple2canvas"
        className="main-canvas"
        style={{
          cursor: cursor,
          borderRadius: noBackgroundImage ? "0" : "20px",
          borderWidth: noBackgroundImage ? "0" : "2px",
          backgroundImage: `${backgroundImage}`,
          marginLeft: handleCanvasResize(myCanvas.current as HTMLCanvasElement)
        }}
        width={width} height={height}
        tabIndex={0}
        onKeyDown={isTouchDevice ? () => { } : handleKeyDown}
        onKeyUp={isTouchDevice ? () => { } : handleKeyUp}
        onMouseEnter={setFocus}
        onMouseDown={setFocus}
      />
      {/* Use hidden canvas/context so image rescaling works in iOS < 15.
          See graphics.ts drawImage() */}
      <canvas ref={hiddenCanvas}
        id="hiddenCanvas"
        hidden={true}
        width={560} height={384} />
      {txt}
      {showHgrMagnifier && formatHgrMagnifier()}
    </span>
  )
}

export default Apple2Canvas
