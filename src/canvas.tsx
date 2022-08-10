import React, { useEffect, KeyboardEvent } from 'react';
import { toHex, STATE } from "./utility"
import { getTextPage, getHGR } from "./memory";
import { SWITCHES } from "./softswitches";
import { addToBuffer, keyPress, convertAppleKey } from "./keyboard"
import { handleGamePad, pressAppleKey, clearAppleKeys, setSaveTimeSlice } from "./joystick"

const screenRatio = 1.33  // (20 * 40) / (24 * 24)
const xmargin = 0.025
const ymargin = 0.025
let width = 800
let height = 600
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
  textPage2: boolean, mixedMode: boolean, iscolor: boolean) => {
  const cwidth = width * (1 - 2 * xmargin) / 40
  const cheight = height * (1 - 2 * ymargin) / 24
  const xmarginPx = xmargin * width
  const ymarginPx = ymargin * height
  const textPage = getTextPage(textPage2)
  ctx.font = cheight + "px PrintChar21"
  const jstart = mixedMode ? 20 : 0
  const doFlashCycle = (Math.trunc(frameCount / 24) % 2) === 0

  for (let j = jstart; j < 24; j++) {
    const yoffset = ymarginPx + (j + 1)*cheight - 3
    textPage.slice(j * 40, (j + 1) * 40).forEach((value, i) => {
      let doInverse = false
      let v1 = value
      if (SWITCHES.ALTCHARSET.isSet) {
        if ((v1 >= 0 && v1 <= 31) || (v1 >= 64 && v1 <= 95)) {
          v1 += 64
        } else if (v1 >= 128 && v1 <= 159) {
          v1 -= 64
        } else if (v1 >= 160) {
          v1 -= 128
        }
        doInverse = (value <= 63) || (value >= 96 && value <= 127)
      } else {
        // Shift Ctrl chars and second ASCII's into correct ASCII range
        if ((v1 >= 0 && v1 <= 0x1f) || (v1 >= 0x61 && v1 <= 0x9f)) {
          v1 += 64
        }
        v1 &= 0b01111111
        doInverse = (value <= 63)
      }
      const v = String.fromCharCode(v1);
      ctx.fillStyle = iscolor ? "#FFFFFF" : "#39FF14";
      if (doInverse) {
        // Inverse characters
        ctx.fillRect(xmarginPx + i*cwidth, ymarginPx + (j + 0.05)*cheight, 1.02*cwidth, 1.04*cheight);
        ctx.fillStyle = "#000000";
      } else if (value < 128 && !SWITCHES.ALTCHARSET.isSet) {
        if (doFlashCycle) {
          ctx.fillRect(xmarginPx + i*cwidth, ymarginPx + j*cheight, cwidth, cheight);
          ctx.fillStyle = "#000000";
        }
      }
      ctx.fillText(v, xmarginPx + i*cwidth, yoffset)
    });
  }
};

const processLoRes = (ctx: CanvasRenderingContext2D,
  textPage2: boolean, mixedMode = false) => {
  const textPage = getTextPage(textPage2)
  const bottom = mixedMode ? 20 : 24
  const cwidth = width * (1 - 2 * xmargin) / 40
  const cheight = height * (1 - 2 * ymargin) / 24
  const xmarginPx = xmargin * width
  const ymarginPx = ymargin * height

  for (let y = 0; y < bottom; y++) {
    const yposUpper = ymarginPx + y*cheight
    const yposLower = yposUpper + cheight/2
    textPage.slice(y * 40, (y + 1) * 40).forEach((value, i) => {
      const xpos = xmarginPx + i*cwidth
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

const green = [0x39, 0xFF, 0x14]
const greenscreen = [
  [0, 0, 0],
  green,
  green,
  green,
  [0, 0, 0],
  green,
  green,
  green
]

const decodeColor = (byte: number, bit: number, highBit: boolean, isEven: boolean) => {
  if ((byte >> bit) & 1) {
    return highBit ? (isEven ? BLUE : ORANGE) : (isEven ? VIOLET : GREEN)
  }
  return BLACK
}

const processHiRes = async (ctx: CanvasRenderingContext2D,
  page2: boolean, mixedMode: boolean, iscolor: boolean) => {
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
    if (iscolor) {
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
  }
  const hgrRGB = new Uint8ClampedArray(280 * 192 * 4).fill(255);
  for (let i = 0; i < 280 * 192; i++) {
    const c = iscolor ? colors[hgr[i]] : greenscreen[hgr[i]]
    hgrRGB[4 * i] = c[0]
    hgrRGB[4 * i + 1] = c[1]
    hgrRGB[4 * i + 2] = c[2]
  }
  const cheight = height * (1 - 2 * ymargin) / 24
  const xmarginPx = xmargin * width
  const ymarginPx = ymargin * height
  const image = new ImageData(hgrRGB, 280, 192);
  let imgHeight = height - 2*ymarginPx - (mixedMode ? 4*cheight : 0)
  ctx.drawImage(await createImageBitmap(image),
    0, 0, 280, mixedMode ? 160 : 192,
    xmarginPx, ymarginPx, width - 2*xmarginPx, imgHeight);
};

const processDisplay = (ctx: CanvasRenderingContext2D, frameCount: number, iscolor: boolean) => {
  ctx.fillStyle = "#000000";
  ctx.imageSmoothingEnabled = false;
  ctx.fillRect(0, 0, width, height);
  if (SWITCHES.TEXT.isSet) {
    processTextPage(ctx, SWITCHES.PAGE2.isSet, false, iscolor)
    return
  }
  if (SWITCHES.MIXED.isSet) {
    processTextPage(ctx, SWITCHES.PAGE2.isSet, true, iscolor)
  }
  if (SWITCHES.HIRES.isSet) {
    processHiRes(ctx, SWITCHES.PAGE2.isSet, SWITCHES.MIXED.isSet, iscolor)
  } else {
    processLoRes(ctx, SWITCHES.PAGE2.isSet, SWITCHES.MIXED.isSet)
  }
}



const pasteHandler = (e: ClipboardEvent) => {
  if (e.clipboardData) {
    const data = e.clipboardData.getData("text");
    if (data !== "") {
      addToBuffer(data.replaceAll(/[”“]/g,'"'));
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
    setSaveTimeSlice(props.saveTimeSlice)
    const gamepadID = window.setInterval(() => {
      handleGamePad(navigator.getGamepads()[0])}, 33);

    const resizeCanvasToDisplaySize = () => {
      const ctx = props.myCanvas.current?.getContext("2d");
      if (!ctx) {
        return
      }
      width = window.innerWidth - 40;
      height = window.innerHeight - 160;
      // shrink either width or height to preserve aspect ratio
      if (width / screenRatio > height) {
        width = height * screenRatio
      } else {
        height = width / screenRatio
      }
      width = Math.floor(width)
      height = Math.floor(height)
      if (ctx.canvas.width !== width || ctx.canvas.height !== height) {
        ctx.canvas.width = width;
        ctx.canvas.height = height;
      }
    }

    const render = () => {
      frameCount++
      if (context) {
        resizeCanvasToDisplaySize()
        processDisplay(context, frameCount, props.iscolor)
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
  }, [props.myCanvas, props.iscolor, props.saveTimeSlice, props]);

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
