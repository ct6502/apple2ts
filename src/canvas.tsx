import React, { useEffect, KeyboardEvent } from 'react';
import { STATE, getPrintableChar } from "./utility"
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

const loresColors = [
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

const translateDHGR = [0, 1, 8, 9, 4, 5, 12, 13, 2, 3, 10, 11, 6, 7, 14, 15]

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

const processTextPage = (ctx: CanvasRenderingContext2D, isColor: boolean) => {
  const textPage = getTextPage()
  const nchars = textPage.length / 24
  const cwidth = width * (1 - 2 * xmargin) / nchars
  const cheight = height * (1 - 2 * ymargin) / 24
  const xmarginPx = xmargin * width
  const ymarginPx = ymargin * height
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
  const colors = isColor ? loresColors : loresGreen

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
const WHITE = 3
// const GREEN = 1
// const VIOLET = 2
// const ORANGE = 5
// const BLUE = 6

const hgrRGBcolors = [
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
const hgrGreenScreen = [
  [0, 0, 0],
  green,
  green,
  green,
  [0, 0, 0],
  green,
  green,
  green
]

const getHiresColors = (hgrPage: Uint8Array, isColor: boolean) => {
  const hgrColors = new Uint8Array(560 * 192).fill(BLACK);
  for (let j = 0; j < 192; j++) {
    const line = hgrPage.slice(j*40, j*40 + 40)
    const joffset = j * 560
    let imaxLine = (j + 1) * 560 - 1
    let isEven = 1
    let skip = false
    let previousWhite = false
    for (let i = 0; i < 40; i++) {
      const ioffset = joffset + i * 14
      const byte1 = line[i]
      const byte2bit0 = (i < 39) ? (line[i + 1] & 1) : 0
      const highBit = (byte1 & 128) ? 1 : 0
      for (let b = 0; b <= 6; b++) {
        if (skip) {
          skip = false
          continue
        }
        const bit1 = byte1 & (1 << b)
        const bit2 = (b < 6) ? (byte1 & (1 << (b + 1))) : byte2bit0
        if (bit1) {
          let istart = ioffset + 2 * b + highBit
          // How many pixels do we fill in
          let imax = istart + (isColor ? 3 : 1)
          // If we're already doing white, first pixel is also white.
          // Otherwise, white starts with one pixel of the current bit's color
          // GREEN=1, VIOLET=2, ORANGE=5, BLUE=6
          let color1 = previousWhite ? WHITE : 1 + 4 * highBit + isEven
          let color = color1
          if (bit2) {
            color = WHITE
            // Fill in a couple extra pixels (may get changed later)
            imax += isColor ? 2 : 3
            previousWhite = true
          } else {
            previousWhite = false
          }
          if (imax > imaxLine) imax = imaxLine
          hgrColors[istart] = color1
          for (let ix = istart + 1; ix <= imax; ix++) {
            hgrColors[ix] = color
          }
          // We just processed 2 bits (4 pixels on the 560-pixel line)
          skip = true
        } else {
          previousWhite = false
          isEven = 1 - isEven
        }
      }
    }
  }
  return hgrColors
}

const getDoubleHiresColors = (hgrPage: Uint8Array, isColor: boolean) => {
  const hgrColors = new Uint8Array(560 * 192).fill(BLACK);
  for (let j = 0; j < 192; j++) {
    const line = hgrPage.slice(j*80, j*80 + 80)
    const bits = new Uint8Array(563).fill(0)
    const joffset = j * 560
    let b = 0
    for (let i = 0; i < 560; i++) {
      bits[i] = (line[Math.floor(i / 7)] >> b) & 1
      b = (b + 1) % 7
    }
    if (isColor) {
      for (let i = 0; i < 560; i++) {
        const colorValue = (bits[i + 3] << (3 - ((i + 3) % 4))) +
          (bits[i + 2] << (3 - ((i + 2) % 4))) +
          (bits[i + 1] << (3 - ((i + 1) % 4))) +
          (bits[i] << (3 - (i % 4)))
        hgrColors[joffset + i] = translateDHGR[colorValue]
      }
    } else {
      for (let i = 0; i < 560; i++) {
        if (bits[i]) hgrColors[joffset + i] = 15
      }
    }
  }
  return hgrColors
}

const processHiRes = (ctx: CanvasRenderingContext2D, isColor: boolean) => {
  const doubleRes = SWITCHES.COLUMN80.isSet && !SWITCHES.AN3.isSet
  const hgrPage = getHGR(doubleRes)  // 40 x 192 array
  const hgrColors = doubleRes ? getDoubleHiresColors(hgrPage, isColor) :
    getHiresColors(hgrPage, isColor)
  const hgrRGB = new Uint8ClampedArray(4 * 560 * 192).fill(255);
  const colors = doubleRes ? (isColor ? loresColors : loresGreen) :
    (isColor ? hgrRGBcolors : hgrGreenScreen)
  for (let i = 0; i < 560 * 192; i++) {
    hgrRGB[4 * i] = colors[hgrColors[i]][0]
    hgrRGB[4 * i + 1] = colors[hgrColors[i]][1]
    hgrRGB[4 * i + 2] = colors[hgrColors[i]][2]
  }
  drawImage(ctx, hgrRGB)
};

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
          props.handleBoot()
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
          props.handleReset()
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
