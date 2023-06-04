import React, { useEffect, KeyboardEvent } from 'react';
import { handleGoBackInTime, handleGoForwardInTime,
  handleSetCPUState, handleKeyboardBuffer, handleSetGamepad,
  handleAppleCommandKeyPress, handleAppleCommandKeyRelease, updateDisplay } from "./main2worker"
import { STATE, convertAppleKey } from "./emulator/utility"
import { processDisplay } from './graphics';
const screenRatio = 1.33  // (20 * 40) / (24 * 24)
let width = 800
let height = 600

const Apple2Canvas = (props: DisplayProps) => {
  let keyHandled = false
  let myText = React.createRef<HTMLTextAreaElement>()

  const pasteHandler = (e: ClipboardEvent) => {
    if (e.clipboardData) {
      let data = e.clipboardData.getData("text");
      if (data !== "") {
        data = data.replaceAll(/[”“]/g,'"')  // fancy quotes with regular
        data = data.replaceAll('\n','\r')  // LFs to CRs
        handleKeyboardBuffer(data);
      }
      e.preventDefault();
    }
  };

  const getSizes = () => {
    width = window.innerWidth - 20;
    height = window.innerHeight - 160;
    // shrink either width or height to preserve aspect ratio
    if (width / screenRatio > height) {
      width = height * screenRatio
    } else {
      height = width / screenRatio
    }
    width = Math.floor(width)
    height = Math.floor(height)
    return [width, height]
  }

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>|KeyboardEvent<HTMLCanvasElement>) => {
    if (e.metaKey && e.key === "Meta") {
      handleAppleCommandKeyPress(e.code === "MetaLeft")
    }
    if (e.metaKey) {
      switch (e.key) {
        case 'ArrowLeft':
          handleGoBackInTime()
          keyHandled = true
          break
        case 'ArrowRight':
          handleGoForwardInTime()
          keyHandled = true
          break
        case 'c':
          props.handleCopyToClipboard()
          keyHandled = true
          break;
        case 'v':
          return
        case 'b':
          handleSetCPUState(STATE.NEED_BOOT)
          keyHandled = true
          break;
        case 'f':
          props.handleSpeedChange()
          keyHandled = true
          break;
        case 'o':
          props.handleFileOpen()
          keyHandled = true
          break;
        case 'p':
          if (props.machineState === STATE.PAUSED) {
          handleSetCPUState(STATE.RUNNING)
          } else {
          handleSetCPUState(STATE.PAUSED)
          }
          keyHandled = true
          break;
        case 'r':
          handleSetCPUState(STATE.NEED_RESET)
          keyHandled = true
          break;
        case 's':
          props.handleFileSave()
          keyHandled = true
          break;
        default:
          break;
      }
    }
    // If we're paused, allow <space> to resume
    if (props.machineState === STATE.PAUSED && e.key === ' ') {
      handleSetCPUState(STATE.RUNNING)
      keyHandled = true
    }
    if (keyHandled) {
      handleAppleCommandKeyRelease(true)
      handleAppleCommandKeyRelease(false)
      e.preventDefault()
      e.stopPropagation()
    } else {
      const key = convertAppleKey(e, props.uppercase);
      if (key > 0) {
        handleKeyboardBuffer(String.fromCharCode(key))
        e.preventDefault()
        e.stopPropagation()
      } else {
        // console.log("key=" + e.key + " code=" + e.code + " ctrl=" +
        //   e.ctrlKey + " shift=" + e.shiftKey + " meta=" + e.metaKey);
      }
    }
  };

  const handleKeyUp = (e: KeyboardEvent<HTMLTextAreaElement>|KeyboardEvent<HTMLCanvasElement>) => {
    if (e.code === "MetaLeft" || e.code === "MetaRight") {
      handleAppleCommandKeyRelease(e.code === "MetaLeft")
    }
    if (keyHandled) {
      keyHandled = false
      e.preventDefault()
      e.stopPropagation()
      return
    }
  };

  const checkGamepad = (x: number, y: number, useMouseAsGamepad: boolean) => {
    const gamePads = navigator.getGamepads()
    let gamePad: EmuGamepad = {
      connected: false,
      axes: [],
      buttons: []
    }
    for (let i = 0; i < gamePads.length; i++) {
      if (gamePads[i]) {
        const axes = gamePads[i]?.axes
        const buttons = gamePads[i]?.buttons
        if (axes && buttons) {
          gamePad.connected = true
          for (let i = 0; i < axes.length; i++) {
            gamePad.axes[i] = axes[i]
          }
          for (let i = 0; i < buttons.length; i++) {
            gamePad.buttons[i] = buttons[i].pressed
          }
        }
        break
      }
    }
    if (!gamePad.connected && useMouseAsGamepad) {
      gamePad.connected = true
      gamePad.axes[0] = x
      gamePad.axes[1] = y
    }
    if (gamePad.connected) {
      handleSetGamepad(gamePad)
    }
  }

  // This code only runs once when the component first renders
  useEffect(() => {
    let context: CanvasRenderingContext2D | null
    let hiddenContext: CanvasRenderingContext2D | null
    let animationFrameId = 0
    let x = 0
    let y = 0
    const handleMouseMove = (event: MouseEvent) => {
      const scale = (xx: number, ww: number) => {
        // Scale the mouse "joystick" so the range covers most of the screen.
        xx = 3 * xx / ww - 1.5
        return Math.min(Math.max(xx, -1), 1)}
      if (props.myCanvas.current && context) {
        const rect = props.myCanvas.current.getBoundingClientRect();
        x = scale(event.clientX - rect.left, rect.width);
        y = scale(event.clientY - rect.top, rect.height);
      }
    }
    if (props.myCanvas.current) {
      context = props.myCanvas.current.getContext('2d')
      props.myCanvas.current.addEventListener('mousemove', handleMouseMove)
    }
    if (props.hiddenCanvas.current) {
      hiddenContext = props.hiddenCanvas.current.getContext('2d')
    }
    const handleResize = () => {
      if (context) {
        [width, height] = getSizes()
        context.canvas.width = width;
        context.canvas.height = height;
        updateDisplay()
      }
    }
    const paste = (e: any) => {pasteHandler(e as ClipboardEvent)}
    window.addEventListener("paste", paste)
    window.addEventListener("resize", handleResize)
    updateDisplay()

    // Check for new gamepads on a regular basis
    const gamepadID = window.setInterval(() => {checkGamepad(x, y, props.useMouseAsGamepad)}, 34)
    const renderCanvas = () => {
      if (context && hiddenContext) {
        processDisplay(context, hiddenContext, props.colorMode, width, height)
      }
      animationFrameId = window.requestAnimationFrame(renderCanvas)
    }
    renderCanvas()

    // Return a cleanup function when component unmounts
    return () => {
      window.removeEventListener("paste", paste)
      window.cancelAnimationFrame(animationFrameId)
      window.clearInterval(gamepadID)
      props.myCanvas.current?.removeEventListener('mousemove', handleMouseMove)
    }
  }, [props.myCanvas, props.hiddenCanvas, props.colorMode, props.useMouseAsGamepad]);

  [width, height] = getSizes()

  // Make keyboard events work on touch devices by using a hidden textarea.
  const isTouchDevice = "ontouchstart" in document.documentElement
  const txt = isTouchDevice ?
      <textarea hidden={false} ref={myText}
        onKeyDown={handleKeyDown}
        onKeyUp={handleKeyUp}
      /> : <span></span>

  return <span className="canvasText">
    <canvas ref={props.myCanvas}
      width={width} height={height}
      tabIndex={0}
      onKeyDown={isTouchDevice ? ()=>{} : handleKeyDown}
      onKeyUp={isTouchDevice ? ()=>{} : handleKeyUp}
      onMouseEnter={() => {
        myText.current?.focus()
      }}
      onMouseDown={() => {
        myText.current?.focus()
      }}
    />
    <canvas ref={props.hiddenCanvas}
      hidden={true}
      width={560} height={192} />
    {txt}
    </span>
};

export default Apple2Canvas;
