import React, { useEffect, KeyboardEvent } from 'react';
import { toHex, STATE, getPrintableChar } from "./utility"
import { getTextPage, getHGR } from "./memory";
import { SWITCHES } from "./softswitches";
import { addToBuffer, keyPress, convertAppleKey } from "./keyboard"
import { handleGamePad, pressAppleCommandKey, clearAppleCommandKeys, setSaveTimeSlice } from "./joystick"

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

const loresGreen = [
  [0,   0, 0], //black   
  [0,  58, 0], //red     
  [0,  30, 0], //dk blue 
  [0,  84, 0], //purple  
  [0, 133, 0], //dk green
  [0, 104, 0], //gray    
  [0,  68, 0], //med blue
  [0, 185, 0], //lt blue 
  [0, 106, 0], //brown   
  [0, 131, 0], //orange  
  [0, 184, 0], //grey    
  [0, 175, 0], //pink    
  [0, 219, 0], //lt green
  [0, 251, 0], //yellow  
  [0, 247, 0], //aqua    
  [0, 255, 0], //white   
  ]

let loresHex = new Array<string>(16)
let loresHexGreen = new Array<string>(16)
for (let c = 0; c < 16; c++) {
  loresHex[c] = `#${toHex(lores[c][0])}${toHex(lores[c][1])}${toHex(lores[c][2])}`
  loresHexGreen[c] = `#00${toHex(lores[c][1])}00`
}

const processTextPage = (ctx: CanvasRenderingContext2D, isColor: boolean) => {
  const nchars = SWITCHES.COLUMN80.isSet ? 80 : 40
  const cwidth = width * (1 - 2 * xmargin) / nchars
  const cheight = height * (1 - 2 * ymargin) / 24
  const xmarginPx = xmargin * width
  const ymarginPx = ymargin * height
  const textPage = getTextPage()
  ctx.font = `${cheight}px ${nchars === 80 ? "PRNumber3" : "PrintChar21"}`
  const jstart = SWITCHES.TEXT.isSet ? 0 : 20
  const doFlashCycle = (Math.trunc(frameCount / 24) % 2) === 0

  for (let j = jstart; j < 24; j++) {
    const yoffset = ymarginPx + (j + 1)*cheight - 3
    textPage.slice(j * nchars, (j + 1) * nchars).forEach((value, i) => {
      let doInverse = (value <= 63)
      if (SWITCHES.ALTCHARSET.isSet) {
        doInverse = (value <= 63) || (value >= 96 && value <= 127)
      }
      let v1 = getPrintableChar(value, SWITCHES.ALTCHARSET.isSet)
      const v = String.fromCharCode(v1);
      ctx.fillStyle = isColor ? "#FFFFFF" : "#39FF14";
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

const translateLoresColor = [0, 2, 4, 6, 8, 10, 12, 14, 1, 3, 5, 7, 9, 11, 13, 15]

const processLoRes = (ctx: CanvasRenderingContext2D, isColor: boolean) => {
  const doubleRes = SWITCHES.COLUMN80.isSet && !SWITCHES.AN3.isSet
  const nchars = doubleRes ? 80 : 40
  const textPage = getTextPage(doubleRes)
  const bottom = SWITCHES.MIXED.isSet ? 20 : 24
  const cwidth = doubleRes ? 7 : 14
  const colors = isColor ? lores : loresGreen

  const hgrRGB = new Uint8ClampedArray(4 * 560 * 192).fill(255);
  for (let y = 0; y < bottom; y++) {
    textPage.slice(y * nchars, (y + 1) * nchars).forEach((value, i) => {
      let upperBlock = value % 16
      let lowerBlock = Math.trunc(value / 16)
      if (doubleRes && (i % 2 === 0)) {
        upperBlock = translateLoresColor[upperBlock]
        lowerBlock = translateLoresColor[lowerBlock]
      }
      const c1 = colors[upperBlock]
      const c2 = colors[lowerBlock]
      for (let y1 = 0; y1 < 4; y1++) {
        for (let x1 = 0; x1 < cwidth; x1++) {
          const i1 = 560 * (y1 + 8 * y) + cwidth * i + x1
          const i2 = 560 * (y1 + 4 + 8 * y) + cwidth * i + x1
          hgrRGB[4 * i1] = c1[0]
          hgrRGB[4 * i1 + 1] = c1[1]
          hgrRGB[4 * i1 + 2] = c1[2]
          hgrRGB[4 * i2] = c2[0]
          hgrRGB[4 * i2 + 1] = c2[1]
          hgrRGB[4 * i2 + 2] = c2[2]
        }
      }
    });
  }
  drawImage(ctx, hgrRGB)
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

const drawImage = async (ctx: CanvasRenderingContext2D, hgrRGB: Uint8ClampedArray) => {
    const cheight = height * (1 - 2 * ymargin) / 24
  const xmarginPx = xmargin * width
  const ymarginPx = ymargin * height
  const image = new ImageData(hgrRGB, 560, 192);
  let imgHeight = height - 2*ymarginPx - (SWITCHES.MIXED.isSet ? 4*cheight : 0)
  ctx.drawImage(await createImageBitmap(image),
    0, 0, 560, SWITCHES.MIXED.isSet ? 160 : 192,
    xmarginPx, ymarginPx, width - 2*xmarginPx, imgHeight);
}

const processHiRes = (ctx: CanvasRenderingContext2D, isColor: boolean) => {
  const hgrPage = getHGR()  // 40 x 192 array
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
    if (isColor) {
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
  const hgrRGB = new Uint8ClampedArray(4 * 560 * 192).fill(255);
  for (let i = 0; i < 280 * 192; i++) {
    const c = isColor ? colors[hgr[i]] : greenscreen[hgr[i]]
    hgrRGB[8 * i] = c[0]
    hgrRGB[8 * i + 1] = c[1]
    hgrRGB[8 * i + 2] = c[2]
    hgrRGB[8 * i + 4] = c[0]
    hgrRGB[8 * i + 5] = c[1]
    hgrRGB[8 * i + 6] = c[2]
  }
  drawImage(ctx, hgrRGB)
};

const processDisplay = (ctx: CanvasRenderingContext2D, frameCount: number, isColor: boolean) => {
  ctx.fillStyle = "#000000";
  ctx.imageSmoothingEnabled = false;
  ctx.fillRect(0, 0, width, height);
  if (SWITCHES.TEXT.isSet || SWITCHES.MIXED.isSet) {
    processTextPage(ctx, isColor)
    if (SWITCHES.TEXT.isSet) {
      return
    }
  }
  if (SWITCHES.HIRES.isSet) {
    processHiRes(ctx, isColor)
  } else {
    processLoRes(ctx, isColor)
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

const resizeCanvasToDisplaySize = (ctx: CanvasRenderingContext2D) => {
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

const Apple2Canvas = (props: DisplayProps) => {
  let keyHandled = false

  const handleKeyDown = (e: KeyboardEvent<HTMLCanvasElement>) => {
    if (e.metaKey && e.key === "Meta") {
      pressAppleCommandKey(true, e.code === "MetaLeft")
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
        case 'c':
          props.handleCopyToClipboard()
          keyHandled = true
          break;
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
      clearAppleCommandKeys()
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
      pressAppleCommandKey(false, e.code === "MetaLeft")
    }
    if (keyHandled) {
      keyHandled = false
      e.preventDefault()
      e.stopPropagation()
      return
    }
  };

  setSaveTimeSlice(props.saveTimeSlice)

  // This code only runs once when the component first renders
  useEffect(() => {
    let context: CanvasRenderingContext2D | null
    let animationFrameId = 0
    if (props.myCanvas.current) {
      context = props.myCanvas.current.getContext('2d')
    }
    const paste = (e: any) => {pasteHandler(e as ClipboardEvent)}
    window.addEventListener("paste", paste)
    const gamepadID = window.setInterval(() => {
      handleGamePad(navigator.getGamepads()[0])}, 33);

    const render = () => {
      frameCount++
      if (context) {
        resizeCanvasToDisplaySize(context)
        processDisplay(context, frameCount, props.isColor)
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
  }, [props.myCanvas, props.isColor]);

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
