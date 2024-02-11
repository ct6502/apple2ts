import { KeyboardEvent, useRef, useState } from 'react';
import "./canvas.css"
import {
  passSetRunMode, passKeypress,
  passAppleCommandKeyPress, passAppleCommandKeyRelease,
  passGoBackInTime,
  passGoForwardInTime,
  setStartTextPage,
  passMouseEvent,
  passPasteText,
  handleGetShowMouse,
  handleGetCapsLock,
  handleGetRunMode,
} from "./main2worker"
import { ARROW, RUN_MODE, convertAppleKey, MouseEventSimple } from "./emulator/utility/utility"
import { ProcessDisplay, getCanvasSize } from './graphics';
import { checkGamepad, handleArrowKey } from './devices/gamepad';
import { handleCopyToClipboard } from './copycanvas';
import { handleFileSave } from './fileoutput';

let width = 800
let height = 600

type keyEvent = KeyboardEvent<HTMLTextAreaElement> | KeyboardEvent<HTMLCanvasElement>

const Apple2Canvas = (props: DisplayProps) => {
  const [myInit, setMyInit] = useState(false)
  const [keyHandled, setKeyHandled] = useState(false)
  const myText = useRef(null)
  const myCanvas = useRef(null)
  const hiddenCanvas = useRef(null)

  const pasteHandler = (e: ClipboardEvent) => {
    const canvas = document.getElementById('apple2canvas')
    if (document.activeElement === canvas && e.clipboardData) {
      const data = e.clipboardData.getData("text")
      if (data !== "") {
        passPasteText(data)
      }
      e.preventDefault()
    }
  };

  const metaKeyHandlers: { [key: string]: () => void } = {
    ArrowLeft: () => passGoBackInTime(),
    ArrowRight: () => passGoForwardInTime(),
    c: () => handleCopyToClipboard(),
    o: () => props.setShowFileOpenDialog(true, 0),
    s: () => handleFileSave(false),
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
  };

  const isMac = navigator.platform.startsWith('Mac')

  const isOpenAppleDown = (e: keyEvent) => {
    return e.code === 'AltLeft'
  }

  const isOpenAppleUp = (e: keyEvent) => {
    return e.code === 'AltLeft'
  }

  const isClosedAppleDown = (e: keyEvent) => {
    return e.code === 'AltRight'
  }

  const isClosedAppleUp = (e: keyEvent) => {
    return e.code === 'AltRight'
  }

  const handleKeyDown = (e: keyEvent) => {
    if (isOpenAppleDown(e)) {
      passAppleCommandKeyPress(true)
    }
    if (isClosedAppleDown(e)) {
      passAppleCommandKeyPress(false)
    }
    // TODO: What modifier key should be used on Windows? Can't use Ctrl
    // because that interferes with Apple II control keys like Ctrl+S
    if (!e.shiftKey && (isMac ? (e.metaKey && e.key !== 'Meta') : (e.altKey && e.key !== 'Alt'))) {
      setKeyHandled(handleMetaKey(e.key))
      // TODO: This allows Cmd+V to paste text, but breaks OpenApple+V.
      // How to handle both?
      if (e.key === 'v') return;
    }
    // If we're paused, allow <space> to resume
    if (handleGetRunMode() === RUN_MODE.PAUSED && e.key === ' ') {
      passSetRunMode(RUN_MODE.RUNNING)
      setKeyHandled(true)
    }
    if (keyHandled) {
      passAppleCommandKeyRelease(true)
      passAppleCommandKeyRelease(false)
      e.preventDefault()
      e.stopPropagation()
      return
    }

    if (e.key in arrowKeys) {  // && handleGetArrowKeysAsJoystick()) {
      handleArrowKey(arrowKeys[e.key], false)
      e.preventDefault()
      e.stopPropagation()
      return
    }

    const capsLock = handleGetCapsLock()
    const key = convertAppleKey(e, capsLock, props.ctrlKeyMode);
    if (key > 0) {
      const key = convertAppleKey(e, capsLock, props.ctrlKeyMode);
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
  };

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

  const handleResize = () => {
    if (myCanvas.current) {
      props.updateDisplay()
    }
  }

  const RenderCanvas = () => {
    if (myCanvas.current && hiddenCanvas.current) {
      const ctx = (myCanvas.current as HTMLCanvasElement).getContext('2d')
      const hiddenCtx = (hiddenCanvas.current as HTMLCanvasElement).getContext('2d')
      if (ctx && hiddenCtx) {
        ProcessDisplay(ctx, hiddenCtx, width, height)
      }
    }
    window.requestAnimationFrame(RenderCanvas)
  }

  const scaleMouseEvent = (event: MouseEvent): MouseEventSimple => {
    // Scale mouse to go 0.0 -> 1.0 between inner canvas borders
    // where the apple screen is rendered
    const scale = (xx: number, ww: number) => {
      const offset = 50
      if (xx < offset)
        return 0.0
      else if (xx > (ww - offset))
        return 1.0
      xx = (xx - offset) / (ww - (2 * offset))
      return Math.min(Math.max(xx, -1), 1)
    }
    let x = 0
    let y = 0
    if (myCanvas.current) {
      const rect = (myCanvas.current as HTMLCanvasElement).getBoundingClientRect()
      x = scale(event.clientX - rect.left, rect.width)
      y = scale(event.clientY - rect.top, rect.height)
    }
    return { x: x, y: y, buttons: -1 }
  }

  const handleMouseDown = (event: MouseEvent) => {
    const evt = scaleMouseEvent(event)
    evt.buttons = event.button === 0 ? 0x10 : 0x11
    passMouseEvent(evt)
  }

  const handleMouseUp = (event: MouseEvent) => {
    const evt = scaleMouseEvent(event)
    evt.buttons = event.button === 0 ? 0x00 : 0x01
    passMouseEvent(evt)
  }

  const handleMouseMove = (event: MouseEvent) => {
    passMouseEvent(scaleMouseEvent(event))
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
        canvas.addEventListener('mousemove', handleMouseMove)
        canvas.addEventListener('mousedown', handleMouseDown)
        canvas.addEventListener('mouseup', handleMouseUp)
        window.addEventListener("copy", () => { handleCopyToClipboard() })
        const paste = (e: object) => { pasteHandler(e as ClipboardEvent) }
        window.addEventListener("paste", paste)
        window.addEventListener("resize", handleResize)
        window.setInterval(() => { checkGamepad() }, 34)
        RenderCanvas()
        window.setTimeout(() => setStartTextPage(), 25);
      } else {
        // This doesn't ever seem to get hit. I guess just doing the 
        // setTimeout below (even with a timeout of 0) is enough to
        // let React get the "myCanvas" ref set properly.
        // But just leave it here as a backup.
        window.setTimeout(() => initialize(), 0);
      }
    }
    window.setTimeout(() => initialize(), 0);
  }

  const setFocus = () => {
    if (myText.current) {
      (myText.current as HTMLTextAreaElement).focus()
    } else if (myCanvas.current) {
      (myCanvas.current as HTMLCanvasElement).focus()
    }
  }

  [width, height] = getCanvasSize()

  // Make keyboard events work on touch devices by using a hidden textarea.
  const isTouchDevice = "ontouchstart" in document.documentElement
  const txt = isTouchDevice ?
    <textarea className="hiddenTextarea" hidden={false} ref={myText}
      onKeyDown={handleKeyDown}
      onKeyUp={handleKeyUp}
    /> : <span></span>

  return (
    <span className="canvasText">
      <canvas ref={myCanvas}
        id="apple2canvas"
        className="mainCanvas"
        style={{ cursor: handleGetShowMouse() ? "auto" : "none" }}
        width={width} height={height}
        tabIndex={0}
        onKeyDown={isTouchDevice ? () => { null } : handleKeyDown}
        onKeyUp={isTouchDevice ? () => { null } : handleKeyUp}
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
    </span>
  )
}

export default Apple2Canvas
