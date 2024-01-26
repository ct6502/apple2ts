import { handleGetAltCharSet, handleGetTextPage,
  handleGetLores, handleGetHires, handleGetNoDelayMode } from "./main2worker"
import { getPrintableChar, COLOR_MODE } from "./emulator/utility/utility"
import { convertColorsToRGBA, drawHiresTile, getHiresColors, getHiresGreen } from "./graphicshgr"
import { TEXT_AMBER, TEXT_GREEN, TEXT_WHITE, loresAmber, loresColors, loresGreen, loresWhite, translateDHGR } from "./graphicscolors"
const xmargin = 0.075
const ymargin = 0.075
let frameCount = 0

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
  const doFlashCycle = (Math.trunc(frameCount / 24) % 2) === 0
  const isAltCharSet = handleGetAltCharSet()
  const colorFill = ['#FFFFFF', '#FFFFFF', TEXT_GREEN, TEXT_AMBER, TEXT_WHITE][colorMode]

  for (let j = jstart; j < 24; j++) {
    const yoffset = ymarginPx + (j + 1)*cheight - 3
    const yoffsetHidden = (j + 1) * hiddenHeight - 3
    const joffset = (j - jstart) * nchars
    textPage.slice(joffset, joffset + nchars).forEach((value, i) => {
      let doInverse = (value <= 63)
      if (isAltCharSet) {
        doInverse = (value <= 63) || (value >= 96 && value <= 127)
      }
      const v1 = getPrintableChar(value, isAltCharSet)
      const v = String.fromCharCode(v1 < 127 ? v1 : v1 === 0x83 ? 0xEBE7 : (v1 + 0xE000))
      ctx.fillStyle = colorFill
      hiddenContext.fillStyle = colorFill
      if (doInverse) {
        // Inverse characters
        ctx.fillRect(xmarginPx + i*cwidth, ymarginPx + j*cheight, 1.08*cwidth, 1.03*cheight);
        ctx.fillStyle = "#000000";
        hiddenContext.fillRect(i * hiddenWidth, j * hiddenHeight, 1.08 * hiddenWidth, 1.03 * hiddenHeight);
        hiddenContext.fillStyle = "#000000";
      } else if (value < 128 && !isAltCharSet) {
        if (doFlashCycle) {
          hiddenContext.fillRect(i * hiddenWidth, j * hiddenHeight, hiddenWidth, hiddenHeight);
          hiddenContext.fillStyle = "#000000";
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
  const hgrColors = doubleRes ? getDoubleHiresColors(hgrPage, colorMode) :
    (isColor ? getHiresColors(hgrPage, nlines, colorMode, noDelayMode, false) : getHiresGreen(hgrPage, nlines))
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

const drawImage = (ctx: CanvasRenderingContext2D,
  hiddenContext: CanvasRenderingContext2D,
  width: number, height: number) => {
  const xmarginPx = xmargin * width
  const ymarginPx = ymargin * height
  const imgHeight = height * (1 - 2 * ymargin)
  const imgWidth = width - 2 * xmarginPx
  ctx.drawImage(hiddenContext.canvas, 0, 0, 560, 384,
    xmarginPx, ymarginPx, imgWidth, imgHeight)
}

export const processDisplay = (ctx: CanvasRenderingContext2D,
  hiddenContext: CanvasRenderingContext2D, colorMode: COLOR_MODE,
  width: number, height: number) => {
  frameCount++
  ctx.imageSmoothingEnabled = false;
  ctx.fillStyle = "#000000";
  ctx.fillRect(xmargin * width, ymargin * height - 2,
    width * (1 - 2 * xmargin) + 2, height * (1 - 2 * ymargin) + 4)
  hiddenContext.imageSmoothingEnabled = false;
  hiddenContext.fillStyle = "#000000";
  hiddenContext.fillRect(0, 0, 560, 384)
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
  const tile = [
    0x01, 0x81, 0x40, 0x80, 0x15, 0x40, 0x80,
    0x01, 0x81, 0x40, 0x80, 0x00, 0x40, 0x80,
    0x01, 0x81, 0x40, 0x80, 0x00, 0x40, 0x80,
    0x02, 0x82, 0xC0, 0x00, 0x2A, 0xC0, 0x00,
    0x02, 0x82, 0xC0, 0x00, 0x00, 0xC0, 0x00,
    0x02, 0x82, 0xC0, 0x00, 0x00, 0xC0, 0x00,
    0x03, 0x83, 0xC0, 0x01, 0x95, 0xC0, 0x01,
    0x03, 0x83, 0xC0, 0x01, 0x00, 0xC0, 0x01,
    0x03, 0x83, 0xC0, 0x01, 0x00, 0xC0, 0x01,
    0x06, 0x86, 0xE0, 0x00, 0xAA, 0xE0, 0x00,
    0x06, 0x86, 0xE0, 0x00, 0x00, 0xE0, 0x00,
    0x06, 0x86, 0xE0, 0x00, 0x00, 0xE0, 0x00,
    0x0C, 0x8C, 0xA0, 0x01, 0x3E, 0xA0, 0x01,
    0x0C, 0x8C, 0xA0, 0x01, 0x00, 0xA0, 0x01,
    0x0C, 0x8C, 0xA0, 0x01, 0x00, 0xA0, 0x01,
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
    // const tile = [0, 0x84, 0x1C, 0x90, 0x38, 0x94, 0x78, 0x91,
    //   0x70, 0x1C, 0x78, 0x08, 0x73, 0x08, 0x7F, 0x0F,
    //   0x7E, 0x0F, 0x70, 0x0C, 0x50, 0x08, 0x70, 0x09,
    //   0x70, 0x09, 0x78, 0x09, 0x7C, 0x09, 0x7E, 0x0B]
    // const tile = [0x80, 0x0A, 0xCC, 0x83, 0xE6, 0x83, 0xE2, 0x81,
  //   0xAB, 0x8F, 0xFF, 0x8F, 0xFE, 0x87, 0xC2, 0x86,
  //   0xC6, 0xE2, 0xCC, 0xC3, 0xC0, 0xC7, 0xE0, 0xCF,
  //   0xF0, 0xCC, 0xB0, 0xCC, 0xB0, 0xCC, 0x98, 0x98]
  drawHiresTile(ctx, new Uint8Array(tile), colorMode, 27, 100, 100, 10)
}

