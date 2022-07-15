import React, { useEffect, KeyboardEvent } from 'react';
import DisplayProps from "./displayprops"
import { SWITCHES, toHex, getTextPage, getHGR, STATE } from "./motherboard";
import { addToBuffer, keyPress, convertAppleKey } from "./keyboard"
import { handleGamePad, pressAppleKey, clearAppleKeys } from "./joystick"

const xmargin = 20
const ymargin = 20
const cwidth = 20*1.5
const cheight = 24*1.5
const width = cwidth*40 + 2*xmargin
const height = cheight*24 + 2*ymargin
let frameCount = 0

const lores = [
  [  0,   0,   0], //black   
  [211,  58,  72], //red     
  [  9,  30, 163], //dk blue 
  [213,  84, 221], //purple  
  [ 54, 133,  57], //dk green
  [104, 104, 104], //gray    
  [ 51,  68, 246], //med blue
  [134, 185, 249], //lt blue 
  [147, 106,  33], //brown   
  [240, 131,  49], //orange  
  [184, 184, 184], //grey    
  [244, 175, 157], //pink    
  [ 97, 219,  64], //lt green
  [254, 251,  82], //yellow  
  [134, 247, 210], //aqua    
  [255, 255, 255], //white   
  ]

let loresHex = new Array<string>(16)
for (let c = 0; c < 16; c++) {
  loresHex[c] = '#' + toHex(lores[c][0]) + toHex(lores[c][1]) + toHex(lores[c][2])
}

 const processTextPage = (ctx: CanvasRenderingContext2D,
  textPage2: boolean, mixedMode = false) => {
  const textPage = getTextPage(textPage2)
  ctx.font = cheight + "px PrintChar21"
  const jstart = mixedMode ? 20 : 0
  const doFlashCycle = (Math.trunc(frameCount / 24) % 2) === 0

  for (let j = jstart; j < 24; j++) {
    const yoffset = ymargin + (j + 1)*cheight - 3
    textPage.slice(j * 40, (j + 1) * 40).forEach((value, i) => {
      let v: string
      if (value === 0x60) {
        value = 64 // flashing cursor
        v = "\u00A0"
      } else {
        let v1 = value;
        // Shift Ctrl chars and second ASCII's into correct ASCII range
        if ((v1 >= 0 && v1 <= 0x1f) || (v1 >= 0x61 && v1 <= 0x9f)) {
          v1 += 0x40;
        }
        v = String.fromCharCode(v1 & 0b01111111);
      }
      ctx.fillStyle = "#FFFFFF" // "#39FF14";
      if (value < 64) {
        // Inverse characters
        ctx.fillRect(xmargin + i*cwidth, ymargin + j*cheight, cwidth, cheight);
        ctx.fillStyle = "#000000";
      } else if (value < 128) {
        if (doFlashCycle) {
          ctx.fillRect(xmargin + i*cwidth, ymargin + j*cheight, cwidth, cheight);
          ctx.fillStyle = "#000000";
        }
      }
      ctx.fillText(v, xmargin + i*cwidth, yoffset)
    });
  }
};

const processLoRes = (ctx: CanvasRenderingContext2D,
  textPage2: boolean, mixedMode = false) => {
  const textPage = getTextPage(textPage2)
  const bottom = mixedMode ? 20 : 24

  for (let y = 0; y < bottom; y++) {
    const yposUpper = ymargin + y*cheight
    const yposLower = yposUpper + cheight/2
    textPage.slice(y * 40, (y + 1) * 40).forEach((value, i) => {
      const xpos = xmargin + i*cwidth
      const upperBlock = value % 16
      const lowerBlock = Math.trunc(value / 16)
      ctx.fillStyle = loresHex[upperBlock]
      ctx.fillRect(xpos, yposUpper, cwidth, cheight/2)
      ctx.fillStyle = loresHex[lowerBlock]
      ctx.fillRect(xpos, yposLower, cwidth, cheight/2)
    });
  }
};

const BLACK = 0
const GREEN = 1
const VIOLET = 2
const WHITE = 3
const ORANGE = 5
const BLUE = 6
const colors = [
  [0, 0, 0],
  [1, 255, 1],
  [255, 1, 255],
  [255, 255, 255],
  [0, 0, 0],
  [255, 127, 1],
  [1, 127, 255],
  [255, 255, 255]
]
const decodeColor = (byte: number, bit: number, highBit: boolean, isEven: boolean) => {
  if ((byte >> bit) & 1) {
    return highBit ? (isEven ? BLUE : ORANGE) : (isEven ? VIOLET : GREEN)
  }
  return BLACK
}

const processHiRes = async (ctx: CanvasRenderingContext2D,
  page2: boolean, mixedMode = false) => {
  const hgrPage = getHGR(page2)  // 40 x 192 array
  const hgr = new Uint8Array(280 * 192).fill(0);
  for (let j = 0; j < 192; j++) {
    const line = hgrPage.slice(j*40, j*40 + 40)
    const joffset = j * 280
    let isEven = true
    for (let i = 0; i < 40; i++) {
      const ioffset = joffset + i * 7
      const byte = line[i]
      const highBit = (byte & 128) === 128
      for (let b = 0; b <= 6; b++) {
        hgr[ioffset + b] = decodeColor(byte, b, highBit, isEven)
        isEven = !isEven
      }
    }
    for (let i = 0; i < 280; i++) {
      const ioffset = joffset + i
      if (hgr[ioffset] && hgr[ioffset + 1]) {
        hgr[ioffset] = WHITE
        hgr[ioffset + 1] = WHITE
      }
    }
    for (let i = 0; i < 280; i += 2) {
      const ioffset = joffset + i
      if (hgr[ioffset] && hgr[ioffset] !== WHITE) {
        if (!hgr[ioffset + 1]) {
          hgr[ioffset + 1] = hgr[ioffset]
        }
      } else if (hgr[ioffset + 1] && hgr[ioffset + 1] !== WHITE) {
        hgr[ioffset] = hgr[ioffset + 1]
      }
    }
  }
  const hgrRGB = new Uint8ClampedArray(280 * 192 * 4).fill(255);
  for (let i = 0; i < 280 * 192; i++) {
    const c = colors[hgr[i]]
    hgrRGB[4 * i] = c[0]
    hgrRGB[4 * i + 1] = c[1]
    hgrRGB[4 * i + 2] = c[2]
  }
  const image = new ImageData(hgrRGB, 280, 192);
  let imgHeight = height - 2*ymargin - (mixedMode ? 4*cheight : 0)
  ctx.drawImage(await createImageBitmap(image),
    0, 0, 280, mixedMode ? 160 : 192,
    xmargin, ymargin, width - 2*xmargin, imgHeight);
};

const processDisplay = (ctx: CanvasRenderingContext2D, frameCount: number) => {
  ctx.fillStyle = "#000000";
  ctx.imageSmoothingEnabled = false;
  ctx.fillRect(0, 0, width, height);
  if (SWITCHES.TEXT.isSet) {
    processTextPage(ctx, SWITCHES.PAGE2.isSet)
    return
  }
  if (SWITCHES.MIXED.isSet) {
    processTextPage(ctx, SWITCHES.PAGE2.isSet, true)
  }
  if (SWITCHES.HIRES.isSet) {
    processHiRes(ctx, SWITCHES.PAGE2.isSet, SWITCHES.MIXED.isSet)
  } else {
    processLoRes(ctx, SWITCHES.PAGE2.isSet, SWITCHES.MIXED.isSet)
  }
}



const pasteHandler = (e: ClipboardEvent) => {
  if (e.clipboardData) {
    const data = e.clipboardData.getData("text");
    if (data !== "") {
      addToBuffer(data);
    }
    e.preventDefault();
  }
};

const Apple2Canvas = (props: DisplayProps) => {
  let keyHandled = false

  const handleKeyDown = (e: KeyboardEvent<HTMLCanvasElement>) => {
    if (e.metaKey && e.key === "Meta") {
      pressAppleKey(true, e.code === "MetaLeft")
    }
    if (e.metaKey) {
      switch (e.key) {
        case 'ArrowLeft':
          props.handleGoBackInTime()
          keyHandled = true
          break
        case 'ArrowRight':
          props.handleGoForwardInTime()
          keyHandled = true
          break
        case 'v':
          return
        case 'b':
          props.handle6502StateChange(STATE.NEED_BOOT)
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
          props.handlePause()
          keyHandled = true
          break;
        case 'r':
          props.handle6502StateChange(STATE.NEED_RESET)
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
    if (props._6502 === STATE.PAUSED && e.key === ' ') {
      props.handlePause()
      keyHandled = true
    }
    if (keyHandled) {
      clearAppleKeys()
      e.preventDefault()
      e.stopPropagation()
    } else {
      const key = convertAppleKey(e, props.uppercase);
      if (key > 0) {
        keyPress(key)
        props.saveTimeSlice()
      } else {
        // console.log("key=" + e.key + " code=" + e.code + " ctrl=" +
        //   e.ctrlKey + " shift=" + e.shiftKey + " meta=" + e.metaKey);
      }
    }
  };

  const handleKeyUp = (e: KeyboardEvent<HTMLCanvasElement>) => {
    if (e.code === "MetaLeft" || e.code === "MetaRight") {
      pressAppleKey(false, e.code === "MetaLeft")
    }
    if (keyHandled) {
      keyHandled = false
      e.preventDefault()
      e.stopPropagation()
      return
    }
  };

  // This code only runs once when the component first renders
  useEffect(() => {
    let context: CanvasRenderingContext2D | null
    let animationFrameId = 0
    if (props.myCanvas.current) {
      context = props.myCanvas.current.getContext('2d');
    }
    const paste = (e: any) => {pasteHandler(e as ClipboardEvent)}
    window.addEventListener("paste", paste)
    const gamepadID = window.setInterval(() => {
      handleGamePad(navigator.getGamepads()[0])}, 33);

    const render = () => {
      frameCount++
      if (context) {
        processDisplay(context, frameCount)
      }
      animationFrameId = window.requestAnimationFrame(render)
    }
    render()

    // Return a cleanup function when component unmounts
    return () => {
      window.removeEventListener("paste", paste)
      window.cancelAnimationFrame(animationFrameId)
      window.clearInterval(gamepadID)
    }
  }, [props.myCanvas]);

  return <canvas ref={props.myCanvas}
    height={height} width={width}
    tabIndex={0}
    onKeyDown={handleKeyDown}
    onKeyUp={handleKeyUp}
    onMouseEnter={() => {
      props.myCanvas.current?.focus()
    }}
    />
};

export default Apple2Canvas;
