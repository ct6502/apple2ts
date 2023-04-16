import React, { useEffect, KeyboardEvent } from 'react';
import { handleGetAltCharSet, handleGetTextPage, handleGetLores, handleGetHires,
  handleGoBackInTime, handleGoForwardInTime,
  handleSetCPUState,
  handleKeyboardBuffer, handleSetGamepad,
  handleAppleCommandKeyPress, handleAppleCommandKeyRelease } from "./main2worker"
import { STATE, getPrintableChar, convertAppleKey, COLOR_MODE } from "./emulator/utility"
const screenRatio = 1.33  // (20 * 40) / (24 * 24)
const xmargin = 0.025
const ymargin = 0.025
let width = 800
let height = 600
let frameCount = 0

const TEXT_GREEN = '#39FF14'
const green = [0x39, 0xFF, 0x14]
const TEXT_AMBER = '#FFA500'
const amber = [0xFF, 0xA5, 0x0]

const loresHex: string[] = [
  "#000000", //black
  "#DD0033", //red
  "#000099", //dk blue
  "#DD22DD", //purple
  "#007722", //dk green
  "#555555", //gray
  "#2222FF", //med blue
  "#66AAFF", //lt blue
  "#885500", //brown
  "#FF6600", //orange
  "#AAAAAA", //grey
  "#FF9988", //pink
  "#11DD00", //lt green
  "#FFFF00", //yellow
  "#4AFDC5", //aqua
  "#FFFFFF"] //white

const hgrRGBcolors = [
  [0, 0, 0],       // black1
  [1, 255, 1],     // green
  [255, 1, 255],   // violet
  [255, 255, 255], // white1
  [0, 0, 0],       // black2
  [255, 127, 1],   // orange
  [1, 127, 255],   // blue
  [255, 255, 255], // white2
  [254, 251, 82],  // yellow (extended green)
  [183, 184, 249], // light blue (extended violet)
  [255, 255, 255],
  [0, 0, 0],
  [148, 106, 33],  // brown (extended orange)
  [9, 29, 162],    // dark blue (extended blue)
]

const loresColors: number[][] = loresHex.map(hex => {
  const red = parseInt(hex.substring(1, 3), 16);
  const green = parseInt(hex.substring(3, 5), 16);
  const blue = parseInt(hex.substring(5, 7), 16);
  return [red, green, blue];
});

const translateDHGR = [0, 1, 8, 9, 4, 5, 12, 13, 2, 3, 10, 11, 6, 7, 14, 15]

const loresGreen: number[][] = loresColors.map(c => {
  return [0, (c[0] + c[1] + c[2]) / 3, 0]
})

const loresAmber: number[][] = loresColors.map(c => {
  const c1 = (c[0] + c[1] + c[2]) / 3
  return [c1, c1 * (0xA5 / 255), 0]
})

const hgrGreenScreen = [
  [0, 0, 0], green, green, green, [0, 0, 0], green, green, green
]

const hgrAmberScreen = [
  [0, 0, 0], amber, amber, amber, [0, 0, 0], amber, amber, amber
]

const processTextPage = (ctx: CanvasRenderingContext2D, colorMode: COLOR_MODE) => {
  const textPage = handleGetTextPage()
  if (textPage.length === 0) return
  const doubleRes = textPage.length === 320 || textPage.length === 1920
  const mixedMode = textPage.length === 160 || textPage.length === 320
  const nchars = doubleRes ? 80 : 40
  const cwidth = width * (1 - 2 * xmargin) / nchars
  const cheight = height * (1 - 2 * ymargin) / 24
  const xmarginPx = xmargin * width
  const ymarginPx = ymargin * height
  ctx.font = `${cheight}px ${nchars === 80 ? "PRNumber3" : "PrintChar21"}`
  // full text page will be more than 80 char x 4 lines
  const jstart = mixedMode ? 20 : 0
  const doFlashCycle = (Math.trunc(frameCount / 24) % 2) === 0
  const isAltCharSet = handleGetAltCharSet()
  let colorFill = ['#FFFFFF', '#FFFFFF', TEXT_GREEN, TEXT_AMBER][colorMode]

  for (let j = jstart; j < 24; j++) {
    const yoffset = ymarginPx + (j + 1)*cheight - 3
    const joffset = (j - jstart) * nchars
    textPage.slice(joffset, joffset + nchars).forEach((value, i) => {
      let doInverse = (value <= 63)
      if (isAltCharSet) {
        doInverse = (value <= 63) || (value >= 96 && value <= 127)
      }
      let v1 = getPrintableChar(value, isAltCharSet)
      const v = String.fromCharCode(v1 < 127 ? v1 : (v1 + 0xE000))
      ctx.fillStyle = colorFill
      if (doInverse) {
        // Inverse characters
        ctx.fillRect(xmarginPx + i*cwidth, ymarginPx + (j + 0.05)*cheight, 1.02*cwidth, 1.04*cheight);
        ctx.fillStyle = "#000000";
      } else if (value < 128 && !isAltCharSet) {
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

const processLoRes = (ctx: CanvasRenderingContext2D, colorMode: COLOR_MODE) => {
  const textPage = handleGetLores()
  if (textPage.length === 0) return;
  const doubleRes = textPage.length === 1600 || textPage.length === 1920
  const mixedMode = textPage.length === 800 || textPage.length === 1600
  const nlines = mixedMode ? 160 : 192
  const nchars = doubleRes ? 80 : 40
  const bottom = mixedMode ? 20 : 24
  const cwidth = doubleRes ? 7 : 14
  const colors = [loresColors, loresColors, loresGreen, loresAmber][colorMode]

  const hgrRGBA = new Uint8ClampedArray(4 * 560 * nlines).fill(255);
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
          hgrRGBA[4 * i1] = c1[0]
          hgrRGBA[4 * i1 + 1] = c1[1]
          hgrRGBA[4 * i1 + 2] = c1[2]
          hgrRGBA[4 * i2] = c2[0]
          hgrRGBA[4 * i2 + 1] = c2[1]
          hgrRGBA[4 * i2 + 2] = c2[2]
        }
      }
    });
  }
  drawImage(ctx, hgrRGBA)
};

const BLACK = 0
const WHITE = 3
// const GREEN = 1
// const VIOLET = 2
// const ORANGE = 5
// const BLUE = 6

const getHiresGreen = (hgrPage: Uint8Array) => {
  const nlines = hgrPage.length / 40
  const hgrColors = new Uint8Array(560 * nlines).fill(BLACK);
  for (let j = 0; j < nlines; j++) {
    const line = hgrPage.slice(j*40, j*40 + 40)
    const joffset = j * 560
    let bitSet = 0
    let prevHighBit = 1
    for (let i = 0; i < 40; i++) {
      const ioffset = joffset + i * 14
      const byte1 = line[i]
      const highBit = (byte1 & 128) ? 1 : 0
      for (let b = 0; b <= 6; b++) {
        const ioff1 = ioffset + 2 * b + highBit
        if (b === 0 && bitSet && highBit && !prevHighBit) hgrColors[ioff1 - 1] = 1
        bitSet = (byte1 & (1 << b)) ? 1 : 0
        hgrColors[ioff1] = bitSet
        hgrColors[ioff1 + 1] = bitSet
      }
      prevHighBit = highBit
    }
  }
  return hgrColors
}

const getHiresColors = (hgrPage: Uint8Array, colorMode: COLOR_MODE) => {
  const nlines = hgrPage.length / 40
  const hgrColors = new Uint8Array(560 * nlines).fill(BLACK);
  for (let j = 0; j < nlines; j++) {
    const line = hgrPage.slice(j*40, j*40 + 40)
    const joffset = j * 560
    let isEven = 1
    let skip = false
    let previousWhite = false
    for (let i = 0; i < 40; i++) {
      const ioffset = joffset + i * 14
      const byte1 = line[i]
      const byte2bit0 = (i < 39) ? (line[i + 1] & 1) : 0
      const highBit = (byte1 & 128) ? 1 : 0
      const nextHighBit = (i < 39) ? (line[i + 1] & 0x80) : 0
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
          let imax = istart + 3
          // If we're already doing white, first pixel is also white.
          // Otherwise, white starts with one pixel of the current bit's color
          // GREEN=1, VIOLET=2, ORANGE=5, BLUE=6
          let color1 = previousWhite ? WHITE : (1 + 4 * highBit + isEven)
          let color2 = color1
          if (bit2) {
            color2 = WHITE
            if (colorMode === COLOR_MODE.NOFRINGE && !previousWhite) color1 = BLACK
            // Fill in a couple extra pixels
            imax += 2
            previousWhite = true
            // Handle interactions between adjacent bytes (ALCB p. 208)
            if (b === 5) {
              if (!highBit && nextHighBit) {
                imax--
                hgrColors[imax + 1] = 9 - isEven
                hgrColors[imax + 2] = 9 - isEven
              } else if (highBit && !nextHighBit) {
                imax--
                color2 = 13 - isEven
                hgrColors[istart++] = color1
                hgrColors[istart++] = color1
              }
            }
          } else {
            previousWhite = false
            // Handle interactions between adjacent bytes (ALCB p. 208)
            if (b === 6) {
              if (!highBit && nextHighBit) {
                imax -= 2
                hgrColors[imax + 1] = isEven + 8
                hgrColors[imax + 2] = isEven + 8
                hgrColors[imax + 3] = isEven + 8
              } else if (highBit && !nextHighBit) {
                color1 = isEven + 12
                color2 = color1
                imax--
              }
            }
          }
          hgrColors[istart] = color1
          for (let ix = istart + 1; ix <= imax; ix++) {
            hgrColors[ix] = color2
          }
          // We just processed 2 bits (4 pixels on the 560-pixel line)
          skip = true
        } else {
          // We only processed 1 bit, so flip our isEven flag
          isEven = 1 - isEven
          previousWhite = false
        }
      }
    }
  }
  return hgrColors
}

const getDoubleHiresColors = (hgrPage: Uint8Array, colorMode: COLOR_MODE) => {
  const nlines = hgrPage.length / 80
  const hgrColors = new Uint8Array(560 * nlines).fill(BLACK);
  const isColor = colorMode === COLOR_MODE.COLOR || colorMode === COLOR_MODE.NOFRINGE
  for (let j = 0; j < nlines; j++) {
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

const drawImage = async (ctx: CanvasRenderingContext2D, hgrRGBA: Uint8ClampedArray) => {
  const xmarginPx = xmargin * width
  const ymarginPx = ymargin * height
  const nlines = hgrRGBA.length / (4 * 560)
  const image = new ImageData(hgrRGBA, 560, nlines);
  let imgHeight = height * (1 - 2 * ymargin) / 192 * nlines
  ctx.drawImage(await createImageBitmap(image), 0, 0, 560, nlines,
    xmarginPx, ymarginPx, width - 2*xmarginPx, imgHeight);
}

const processHiRes = (ctx: CanvasRenderingContext2D, colorMode: COLOR_MODE) => {
  const hgrPage = handleGetHires()  // 40x160, 40x192, 80x160, 80x192
  if (hgrPage.length === 0) return;
  const mixedMode = hgrPage.length === 6400 || hgrPage.length === 12800
  const nlines = mixedMode ? 160 : 192
  const doubleRes = hgrPage.length === 12800 || hgrPage.length === 15360
  const isColor = colorMode === COLOR_MODE.COLOR || colorMode === COLOR_MODE.NOFRINGE
  const hgrColors = doubleRes ? getDoubleHiresColors(hgrPage, colorMode) :
    (isColor ? getHiresColors(hgrPage, colorMode) : getHiresGreen(hgrPage))
  const hgrRGBA = new Uint8ClampedArray(4 * 560 * nlines).fill(255);
  const colors = doubleRes ?
    [loresColors, loresColors, loresGreen, loresAmber][colorMode] :
    [hgrRGBcolors, hgrRGBcolors, hgrGreenScreen, hgrAmberScreen][colorMode]
  for (let i = 0; i < 560 * nlines; i++) {
    hgrRGBA[4 * i] = colors[hgrColors[i]][0]
    hgrRGBA[4 * i + 1] = colors[hgrColors[i]][1]
    hgrRGBA[4 * i + 2] = colors[hgrColors[i]][2]
  }
  drawImage(ctx, hgrRGBA)
};

const processDisplay = (ctx: CanvasRenderingContext2D, colorMode: COLOR_MODE) => {
  ctx.fillStyle = "#000000";
  ctx.imageSmoothingEnabled = false;
  ctx.fillRect(0, 0, width, height);
  processTextPage(ctx, colorMode)
  processLoRes(ctx, colorMode)
  processHiRes(ctx, colorMode)
}

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

  const checkGamepad = (x: number, y: number) => {
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
    if (!gamePad.connected) {
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
    let animationFrameId = 0
    let x = 0
    let y = 0
    const handleMouseMove = (event: MouseEvent) => {
      const scale = (xx: number, ww: number) => {
        xx = 6 * xx / ww - 3
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
    const handleResize = () => {
      if (context) {
        [width, height] = getSizes()
        context.canvas.width = width;
        context.canvas.height = height;
      }
    }
    const paste = (e: any) => {pasteHandler(e as ClipboardEvent)}
    window.addEventListener("paste", paste)
    window.addEventListener("resize", handleResize)

    // Check for new gamepads on a regular basis
    const gamepadID = window.setInterval(() => {checkGamepad(x, y)}, 34)
    const renderCanvas = () => {
      frameCount++
      if (context) {
        processDisplay(context, props.colorMode)
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
  }, [props.myCanvas, props.colorMode]);

  [width, height] = getSizes()

  // Make keyboard events work on iPhone by using a hidden textarea.
  const smallSize = width < 600
  const txt = smallSize ?
      <textarea hidden={false} ref={myText}
        onKeyDown={handleKeyDown}
        onKeyUp={handleKeyUp}
      /> : <span></span>

  return <span className="canvasText">
    <canvas ref={props.myCanvas}
      width={width} height={height}
      tabIndex={0}
      onKeyDown={smallSize ? ()=>{} : handleKeyDown}
      onKeyUp={smallSize ? ()=>{} : handleKeyUp}
      onMouseEnter={() => {
        myText.current?.focus()
      }}
      onMouseDown={() => {
        myText.current?.focus()
      }}
    />
    {txt}
    </span>
};

export default Apple2Canvas;
