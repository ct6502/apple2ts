import { handleGetAltCharSet, handleGetTextPage,
  handleGetLores, handleGetHires, handleGetNoDelayMode, handleGetColorMode, handleGetIsDebugging, passSetSoftSwitches } from "./main2worker"
import { getPrintableChar, COLOR_MODE, TEST_GRAPHICS, hiresLineToAddress } from "./emulator/utility/utility"
import { convertColorsToRGBA, drawHiresTile, getHiresColors, getHiresGreen } from "./graphicshgr"
import { TEXT_AMBER, TEXT_GREEN, TEXT_WHITE, loresAmber, loresColors, loresGreen, loresWhite, translateDHGR } from "./graphicscolors"
const isTouchDevice = "ontouchstart" in document.documentElement
let frameCount = 0

export const nRowsHgrMagnifier = 16
export const nColsHgrMagnifier = 2
export const xmargin = isTouchDevice ? 0.01 : 0.075
export const ymargin = isTouchDevice ? 0.01 : 0.075

// Convert canvas coordinates (absolute to the entire browser window)
// to normalized HGR screen coordinates.
export const canvasCoordToNormScreenCoord = (current: HTMLCanvasElement, x: number, y: number) => {
  const rect = current.getBoundingClientRect()
  // The -4 subtracts out the border on all 4 sides of the canvas.
  const xmarginPx = xmargin * (rect.width - 4)
  const ymarginPx = ymargin * (rect.height - 4)
  x = (x - rect.left - xmarginPx - 2) / (rect.width - 2 * xmarginPx - 4)
  y = (y - rect.top - ymarginPx - 2) / (rect.height - 2 * ymarginPx - 4)
  return [x, y]
}

// Convert HGR pixel screen coordinates to canvas coordinates (absolute to
// the entire browser window).
export const screenCoordToCanvasCoord = (current: HTMLCanvasElement, x: number, y: number) => {
  const rect = current.getBoundingClientRect()
  // The -4 subtracts out the border on all 4 sides of the canvas.
  const xmarginPx = xmargin * (rect.width - 4)
  const ymarginPx = ymargin * (rect.height - 4)
  x = x * (rect.width - 2 * xmarginPx - 4) / 280 + xmarginPx + 2 + rect.left
  y = y * (rect.height - 2 * ymarginPx - 4) / 192 + ymarginPx + 2 + rect.top
  return [x, y]
}

// Convert a "delta" in HGR screen bytes to a delta in canvas pixels.
// dx is in HGR bytes, with 7 pixels per byte.
// dy is in HGR lines.
export const screenBytesToCanvasPixels = (current: HTMLCanvasElement, dx: number, dy: number) => {
  const rect = current.getBoundingClientRect()
  // The -4 subtracts out the border on all 4 sides of the canvas.
  const xmarginPx = xmargin * (rect.width - 4)
  const ymarginPx = ymargin * (rect.height - 4)
  // 7 pixels per byte
  const x = dx * 7 * (rect.width - 2 * xmarginPx - 4) / 280
  const y = dy * (rect.height - 2 * ymarginPx - 4) / 192
  return [x, y]
}

// We will draw the text on both the on-screen canvas and the hidden canvas.
// This is wasteful, but we need to get text on the hidden canvas
// for mixed text/graphics mode, yet the text looks siginificantly better
// if it's drawn directly onto the on-screen canvas.
const processTextPage = (ctx: CanvasRenderingContext2D,
  hiddenContext: CanvasRenderingContext2D,
  colorMode: COLOR_MODE, width: number, height: number) => {
  const textPage = handleGetTextPage()
  if (textPage.length === 0) return false
  const doubleRes = textPage.length === 320 || textPage.length === 1920
  const mixedMode = textPage.length === 160 || textPage.length === 320
  const nchars = doubleRes ? 80 : 40
  // On-screen canvas
  const cwidth = width * (1 - 2 * xmargin) / nchars
  const cheight = height * (1 - 2 * ymargin) / 24
  const xmarginPx = xmargin * width
  const ymarginPx = ymargin * height
  ctx.font = `${cheight}px ${nchars === 80 ? "PRNumber3" : "PrintChar21"}`
  // Idealized canvas
  const hiddenWidth = 560 / nchars
  const hiddenHeight = 384 / 24
  hiddenContext.font = `${hiddenHeight}px ${nchars === 80 ? "PRNumber3" : "PrintChar21"}`
  // full text page will be more than 80 char x 4 lines
  // full text page will be more than 80 char x 4 lines
  const jstart = mixedMode ? 20 : 0
  const doFlashCycle = (Math.trunc(frameCount / 15) % 2) === 0
  const isAltCharSet = handleGetAltCharSet()
  const colorFill = ['#FFFFFF', '#FFFFFF', TEXT_GREEN, TEXT_AMBER, TEXT_WHITE, TEXT_WHITE][colorMode]

  for (let j = jstart; j < 24; j++) {
    const yoffset = ymarginPx + (j + 1)*cheight - 3
    const yoffsetHidden = (j + 1) * hiddenHeight - 3
    const joffset = (j - jstart) * nchars
    textPage.slice(joffset, joffset + nchars).forEach((value, i) => {
      let doInverse = (value <= 63)
      if (isAltCharSet) {
        doInverse = (value <= 63) || (value >= 96 && value <= 127)
      }
      const v = getPrintableChar(value, isAltCharSet)
//      const v = String.fromCharCode(v1 < 127 ? v1 : v1 === 0x83 ? 0xEBE7 : (v1 + 0xE000))
      ctx.fillStyle = colorFill
      hiddenContext.fillStyle = colorFill
      if (doInverse || colorMode == COLOR_MODE.INVERSEBLACKANDWHITE) {
        // Inverse characters
        ctx.fillRect(xmarginPx + i*cwidth, ymarginPx + j*cheight, 1.08*cwidth, 1.03*cheight)
        ctx.fillStyle = "#000000"
        hiddenContext.fillRect(i * hiddenWidth, j * hiddenHeight, 1.08 * hiddenWidth, 1.03 * hiddenHeight)
        hiddenContext.fillStyle = "#000000"
      } else if (value < 128 && !isAltCharSet) {
        if (doFlashCycle) {
          ctx.fillRect(xmarginPx + i*cwidth, ymarginPx + j*cheight, 1.08*cwidth, 1.03*cheight)
          ctx.fillStyle = "#000000"
          hiddenContext.fillRect(i * hiddenWidth, j * hiddenHeight, hiddenWidth, hiddenHeight)
          hiddenContext.fillStyle = "#000000"
        }
      }
      ctx.fillText(v, xmarginPx + i*cwidth, yoffset)
      hiddenContext.fillText(v, i * hiddenWidth, yoffsetHidden)
    });
  }
  return !mixedMode
};

const translateLoresColor = [0, 2, 4, 6, 8, 10, 12, 14, 1, 3, 5, 7, 9, 11, 13, 15]

const processLoRes = (hiddenContext: CanvasRenderingContext2D,
  colorMode: COLOR_MODE) => {
  const textPage = handleGetLores()
  if (textPage.length === 0) return;
  const doubleRes = textPage.length === 1600 || textPage.length === 1920
  const mixedMode = textPage.length === 800 || textPage.length === 1600
  const nlines = mixedMode ? 160 : 192
  const nchars = doubleRes ? 80 : 40
  const bottom = mixedMode ? 20 : 24
  const cwidth = doubleRes ? 7 : 14
  const colors = [loresColors, loresColors, loresGreen, loresAmber, loresWhite][colorMode]

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
  const hgrDataStretched = new Uint8ClampedArray(4 * 560 * nlines * 2)
  for (let j = 0; j < nlines; j++) {
    const slice = hgrRGBA.slice(4 * 560 * j, 4 * 560 * (j + 1))
    hgrDataStretched.set(slice, 4 * 560 * 2 * j)
    hgrDataStretched.set(slice, 4 * 560 * 2 * j + 4 * 560)
  }
  const imageData = new ImageData(hgrDataStretched, 560, 2 * nlines)
  hiddenContext.putImageData(imageData, 0, 0)
};

const BLACK = 0
const WHITE = 3

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

const processHiRes = (hiddenContext: CanvasRenderingContext2D,
  colorMode: COLOR_MODE) => {
  const hgrPage = handleGetHires()  // 40x160, 40x192, 80x160, 80x192
  if (hgrPage.length === 0) return;
  const mixedMode = hgrPage.length === 6400 || hgrPage.length === 12800
  const nlines = mixedMode ? 160 : 192
  const doubleRes = hgrPage.length === 12800 || hgrPage.length === 15360
  const isColor = colorMode === COLOR_MODE.COLOR || colorMode === COLOR_MODE.NOFRINGE
  const noDelayMode = handleGetNoDelayMode()
  const fillColor = colorMode === COLOR_MODE.INVERSEBLACKANDWHITE ? WHITE : BLACK
  const hgrColors = doubleRes ? getDoubleHiresColors(hgrPage, colorMode) :
    (isColor ? getHiresColors(hgrPage, nlines, colorMode, noDelayMode, false, true, fillColor) :
    getHiresGreen(hgrPage, nlines, fillColor))
  const hgrRGBA = convertColorsToRGBA(hgrColors, colorMode, doubleRes)
  const hgrDataStretched = new Uint8ClampedArray(4 * 560 * nlines * 2)
  for (let j = 0; j < nlines; j++) {
    const slice = hgrRGBA.slice(4 * 560 * j, 4 * 560 * (j + 1))
    hgrDataStretched.set(slice, 4 * 560 * 2 * j)
    hgrDataStretched.set(slice, 4 * 560 * 2 * j + 4 * 560)
  }
  const imageData = new ImageData(hgrDataStretched, 560, 2 * nlines)
  hiddenContext.putImageData(imageData, 0, 0)
};

let doOverride = false
let doPage2 = false
const border = 2

export const overrideHires = (override: boolean, page2: boolean) => {
  doOverride = override
  doPage2 = page2
  if (override) {
    //                  TEXT off, MIXED off, PAGE2 off, HIRES on, COLUMN80 off
    passSetSoftSwitches([0xC050, 0xC052, page2 ? 0xC055 : 0xC054, 0xC057, 0xC00C])
  } else {
    passSetSoftSwitches(null)
  }
}

export const handleGetOverrideHires = () => doOverride

export const getOverrideHiresPixels = (x: number, y: number) => {
  if (!doOverride) return null
  // Assume this is 40 x 192
  const hgrPage = handleGetHires()  // 40x160, 40x192, 80x160, 80x192
  if (hgrPage.length !== (40 * 192)) return null;
  const result: number[][] = new Array(nRowsHgrMagnifier)
  for (let j = y; j < (y + nRowsHgrMagnifier); j++) {
    result[j - y] = new Array(1 + nColsHgrMagnifier)
    if (j >= 0 && j < 192) {
      const addr = x + hiresLineToAddress(doPage2 ? 0x4000 : 0x2000, j)
      result[j - y][0] = addr
      for (let i = 0; i < nColsHgrMagnifier; i++) {
        result[j - y][i + 1] = hgrPage[j * 40 + x + i]
      }
    }
  }
  return result
}

const drawImage = (ctx: CanvasRenderingContext2D,
  hiddenContext: CanvasRenderingContext2D,
  width: number, height: number) => {
  const xmarginPx = xmargin * width
  const ymarginPx = ymargin * height
  const imgHeight = Math.floor(height * (1 - 2 * ymargin))
  const imgWidth = Math.floor(width * (1 - 2 * xmargin))
  ctx.drawImage(hiddenContext.canvas, 0, 0, 560, 384,
    xmarginPx, ymarginPx, imgWidth, imgHeight)
  if (doOverride) {
    ctx.strokeStyle = "#FF0000"
    ctx.lineWidth = 2
    ctx.strokeRect(xmarginPx - border, ymarginPx - border, imgWidth + 2 * border, imgHeight + 2 * border)
    ctx.fillStyle = "#FF0000"
    ctx.textAlign = "center"
    const cheight = height * (1 - 2 * ymargin) / 24
    ctx.font = `${cheight}px "PrintChar21"`
    ctx.fillText(`${'HGR Page ' + (doPage2 ? '2' : '1')}`, width / 2, height - 2)
  }
}

export const ProcessDisplay = (ctx: CanvasRenderingContext2D,
  hiddenContext: CanvasRenderingContext2D,
  width: number, height: number) => {
  frameCount++
  ctx.imageSmoothingEnabled = true
  // Clear all our drawing and let the background show through again.
  ctx.clearRect(0, 0, width, height)
  hiddenContext.imageSmoothingEnabled = false;
  hiddenContext.fillStyle = "#000000";
  hiddenContext.fillRect(0, 0, 560, 384)
  const colorMode = handleGetColorMode()
  // If we are only doing text output, we will draw directly onto our canvas,
  // and do not need to use the hidden canvas with drawImage.
  const textOnly = processTextPage(ctx, hiddenContext, colorMode, width, height)
  if (!textOnly) {
    // Otherwise, do graphics drawing, and then copy from our hidden canvas
    // over to our main canvas.
    processLoRes(hiddenContext, colorMode)
    processHiRes(hiddenContext, colorMode)
    drawImage(ctx, hiddenContext, width, height)
  }
  if (TEST_GRAPHICS) {
    const tile = [
      0x7F, 0x0, 0x40, 0x80, 0x15, 0x40, 0x80,  // 1
      0x02, 0x87, 0x40, 0x80, 0x00, 0x40, 0x80,
      0x03, 0x0E, 0x40, 0x80, 0x00, 0x40, 0x80,
      0x81, 0x8E, 0xC0, 0x00, 0x2A, 0xC0, 0x00,  // 2
      0x82, 0x1B, 0xC0, 0x00, 0x00, 0xC0, 0x00,
      0x83, 0x9B, 0xC0, 0x00, 0x00, 0xC0, 0x00,
      0x05, 0x36, 0xC0, 0x01, 0x95, 0xC0, 0x01,  // 3
      0x0A, 0xB6, 0xC0, 0x01, 0x00, 0xC0, 0x01,
      0x0F, 0x00, 0xC0, 0x01, 0x00, 0xC0, 0x01,
      0x85, 0x7F, 0xE0, 0x00, 0xAA, 0xE0, 0x00,  // 4
      0x8A, 0x00, 0xE0, 0x00, 0x00, 0xE0, 0x00,
      0x8F, 0x00, 0xE0, 0x02, 0x00, 0xE0, 0x02,
      0x07, 0x00, 0xA0, 0x01, 0x3E, 0xA0, 0x01,  // 5
      0x07, 0x00, 0xA0, 0x01, 0x00, 0xA0, 0x01,
      0x07, 0x00, 0xA0, 0x01, 0x00, 0xA0, 0x01,
      0xAC, 0x80, 0x00, 0x2C, 0, 0, 0,
      0xAC, 0x80, 0x00, 0x2C, 0, 0, 0,
      0xAC, 0x80, 0x00, 0x2C, 0, 0, 0,
      0xA7, 0x80, 0x00, 0x27, 0, 0, 0,
      0xA7, 0x80, 0x00, 0x27, 0, 0, 0,
      0xA7, 0x80, 0x00, 0x27, 0, 0, 0,
      0, 0xEE, 0xDD, 0xBB, 0xF7, 0x80, 0,
      0, 0xEE, 0xDD, 0xBB, 0xF7, 0x80, 0,
      0, 0x8E, 0xDD, 0xBB, 0xF7, 0x80, 0,
      0xEE, 0xDD, 0xBB, 0xF7, 0x80, 0, 0,
      0xEE, 0xDD, 0xBB, 0xF7, 0x80, 0, 0,
      0xEE, 0xDD, 0xBB, 0xF7, 0x80, 0, 0]
    ctx.imageSmoothingEnabled = false;
    drawHiresTile(ctx, new Uint8Array(tile), colorMode, 27, 50, 50, 8, true)
  }
}

export const getCanvasSize = (noBackgroundImage = false) => {
  noBackgroundImage = noBackgroundImage || "ontouchstart" in document.documentElement
  const screenRatio = 1.4583334 // 1.33  // (20 * 40) / (24 * 24)
  if (TEST_GRAPHICS) {
    return [659, 452]  // This will give an actual size of 560 x 384
  }
  let width = window.innerWidth ? window.innerWidth : window.outerWidth
  let height = window.innerHeight ? window.innerHeight : (window.outerHeight - 150)
  height -= noBackgroundImage ? 40 : 300
  width -= noBackgroundImage ? 0 : 40
  if (!noBackgroundImage && handleGetIsDebugging()) {
    width /= 2
  }
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
