import React, { KeyboardEvent } from 'react';
import "./canvas.css"
import {
  passSetRunMode, passKeypress,
  passAppleCommandKeyPress, passAppleCommandKeyRelease,
  updateDisplay,
  passGoBackInTime,
  passGoForwardInTime,
  setStartTextPage,
  passMouseEvent,
  passPasteText,
  handleGetShowMouse,
} from "./main2worker"
import { ARROW, RUN_MODE, convertAppleKey, MouseEventSimple } from "./emulator/utility/utility"
import { processDisplay } from './graphics';
import { checkGamepad } from './devices/gamepad';
let width = 800
let height = 600

type keyEvent = KeyboardEvent<HTMLTextAreaElement> | KeyboardEvent<HTMLCanvasElement>

class Apple2Canvas extends React.Component<DisplayProps> {
  keyHandled = false
  myText = React.createRef<HTMLTextAreaElement>()
  myContext: CanvasRenderingContext2D | null = null
  hiddenContext: CanvasRenderingContext2D | null = null

  pasteHandler = (e: ClipboardEvent) => {
    const canvas = document.getElementById('apple2canvas')
    if (document.activeElement === canvas && e.clipboardData) {
      const data = e.clipboardData.getData("text")
      if (data !== "") {
        passPasteText(data)
      }
      e.preventDefault()
    }
  };

  metaKeyHandlers: { [key: string]: () => void } = {
    ArrowLeft: () => passGoBackInTime(),
    ArrowRight: () => passGoForwardInTime(),
    c: () => this.props.handleCopyToClipboard(),
    o: () => this.props.setShowFileOpenDialog(true, 0),
    s: () => this.props.handleFileSave(false),
  }

  handleMetaKey = (key: string) => {
    if (key in this.metaKeyHandlers) {
      this.metaKeyHandlers[key]()
      return true
    }
    return false
  }

  arrowKeys: { [key: string]: ARROW } = {
    ArrowLeft: ARROW.LEFT,
    ArrowRight: ARROW.RIGHT,
    ArrowUp: ARROW.UP,
    ArrowDown: ARROW.DOWN,
  };

  isMac = navigator.platform.startsWith('Mac')

  isOpenAppleDown = (e: keyEvent) => {
    return e.code === 'AltLeft'
  }

  isOpenAppleUp = (e: keyEvent) => {
    return e.code === 'AltLeft'
  }

  isClosedAppleDown = (e: keyEvent) => {
    return e.code === 'AltRight'
  }

  isClosedAppleUp = (e: keyEvent) => {
    return e.code === 'AltRight'
  }

  handleKeyDown = (e: keyEvent) => {
    if (this.isOpenAppleDown(e)) {
      passAppleCommandKeyPress(true)
    }
    if (this.isClosedAppleDown(e)) {
      passAppleCommandKeyPress(false)
    }
    // TODO: What modifier key should be used on Windows? Can't use Ctrl
    // because that interferes with Apple II control keys like Ctrl+S
    if (!e.shiftKey && (this.isMac ? (e.metaKey && e.key !== 'Meta') : (e.altKey && e.key !== 'Alt'))) {
      this.keyHandled = this.handleMetaKey(e.key)
      // TODO: This allows Cmd+V to paste text, but breaks OpenApple+V.
      // How to handle both?
      if (e.key === 'v') return;
    }
    // If we're paused, allow <space> to resume
    if (this.props.runMode === RUN_MODE.PAUSED && e.key === ' ') {
      passSetRunMode(RUN_MODE.RUNNING)
      this.keyHandled = true
    }
    if (this.keyHandled) {
      passAppleCommandKeyRelease(true)
      passAppleCommandKeyRelease(false)
      e.preventDefault()
      e.stopPropagation()
      return
    }

    if (e.key in this.arrowKeys && this.props.useArrowKeysAsJoystick) {
      this.props.handleArrowKey(this.arrowKeys[e.key], false)
      e.preventDefault()
      e.stopPropagation()
      return
    }

    const key = convertAppleKey(e, this.props.uppercase, this.props.ctrlKeyMode);
    if (key > 0) {
      const key = convertAppleKey(e, this.props.uppercase, this.props.ctrlKeyMode);
      passKeypress(String.fromCharCode(key))
      e.preventDefault()
      e.stopPropagation()
    }
    if (this.props.ctrlKeyMode == 1) {
      this.props.handleCtrlDown(0)
    }
    if (this.props.openAppleKeyMode == 1) {
      this.props.handleOpenAppleDown(0)
    }
    if (this.props.closedAppleKeyMode == 1) {
      this.props.handleClosedAppleDown(0)
    }
  };

  handleKeyUp = (e: keyEvent) => {
    if (this.isOpenAppleUp(e)) {
      passAppleCommandKeyRelease(true)
    } else if (this.isClosedAppleUp(e)) {
      passAppleCommandKeyRelease(false)
    } else if (e.key in this.arrowKeys) {
      this.props.handleArrowKey(this.arrowKeys[e.key], true)
    }
    if (this.keyHandled) {
      this.keyHandled = false
      e.preventDefault()
      e.stopPropagation()
    }
  }

  scaleMouseEvent = (event: MouseEvent): MouseEventSimple => {
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
    if (this.props.myCanvas.current) {
      const rect = this.props.myCanvas.current.getBoundingClientRect()
      x = scale(event.clientX - rect.left, rect.width)
      y = scale(event.clientY - rect.top, rect.height)
    }
    return { x: x, y: y, buttons: -1 }
  }

  handleMouseMove = (event: MouseEvent) => {
    passMouseEvent(this.scaleMouseEvent(event))
  }

  handleMouseDown = (event: MouseEvent) => {
    const evt = this.scaleMouseEvent(event)
    evt.buttons = event.button === 0 ? 0x10 : 0x11

    passMouseEvent(evt)
  }

  handleMouseUp = (event: MouseEvent) => {
    const evt = this.scaleMouseEvent(event)
    evt.buttons = event.button === 0 ? 0x00 : 0x01

    passMouseEvent(evt)
  }

  handleResize = () => {
    if (this.props.myCanvas.current) {
      updateDisplay()
    }
  }

  renderCanvas = () => {
    if (this.myContext && this.hiddenContext) {
      processDisplay(this.myContext, this.hiddenContext, this.props.colorMode, width, height)
    }
    window.requestAnimationFrame(this.renderCanvas)
  }

  componentDidMount() {
    if (this.props.myCanvas.current) {
      this.myContext = this.props.myCanvas.current.getContext('2d')
      this.props.myCanvas.current.addEventListener('mousemove', this.handleMouseMove)
      this.props.myCanvas.current.addEventListener('mousedown', this.handleMouseDown)
      this.props.myCanvas.current.addEventListener('mouseup', this.handleMouseUp)
    }
    if (this.props.hiddenCanvas.current) {
      this.hiddenContext = this.props.hiddenCanvas.current.getContext('2d')
    }
    window.addEventListener("copy", () => { this.props.handleCopyToClipboard() })
    const paste = (e: object) => { this.pasteHandler(e as ClipboardEvent) }
    window.addEventListener("paste", paste)
    window.addEventListener("resize", this.handleResize)
    window.setInterval(() => { checkGamepad() }, 34)
    // To prevent flicker, wait until font is downloaded before rendering startup text.
    const setStartTextAfterFontLoad = () => {
      if (document.fonts.check("12px PrintChar21")) {
        // Also need to do an initial resize after everything is wired up.
        this.handleResize()
        setStartTextPage()
      } else {
        window.setTimeout(setStartTextAfterFontLoad, 25);
      }
    }
    window.setTimeout(setStartTextAfterFontLoad, 25);
    this.renderCanvas()
  }

  setFocus = () => {
    if (this.myText.current) {
      this.myText.current.focus()
    } else if (this.props.myCanvas.current) {
      this.props.myCanvas.current.focus()
    }
  }

  render() {
    [width, height] = this.props.canvasSize

    // Make keyboard events work on touch devices by using a hidden textarea.
    const isTouchDevice = "ontouchstart" in document.documentElement
    const txt = isTouchDevice ?
      <textarea className="hiddenTextarea" hidden={false} ref={this.myText}
        onKeyDown={this.handleKeyDown}
        onKeyUp={this.handleKeyUp}
      /> : <span></span>

    return <span className="canvasText">
      <canvas ref={this.props.myCanvas}
        id="apple2canvas"
        className="mainCanvas"
        style={{ cursor: handleGetShowMouse() ? "auto" : "none" }}
        width={width} height={height}
        tabIndex={0}
        onKeyDown={isTouchDevice ? () => { null } : this.handleKeyDown}
        onKeyUp={isTouchDevice ? () => { null } : this.handleKeyUp}
        onMouseEnter={this.setFocus}
        onMouseDown={this.setFocus}
      />
      {/* Use hidden canvas/context so image rescaling works in iOS < 15.
          See graphics.ts drawImage() */}
      <canvas ref={this.props.hiddenCanvas}
        hidden={true}
        width={560} height={384} />
      {txt}
    </span>
  }
}

export default Apple2Canvas;
