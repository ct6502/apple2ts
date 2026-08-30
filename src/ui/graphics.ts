import { handleGetAltCharSet, handleGetTextPage,
  handleGetLores, handleGetHires, handleGetNoDelayMode, passSetSoftSwitches,
  handleGetMachineName,
  handleGetShr,
  handleGetVidhdActive,
  handleGetSoftSwitches } from "./main2worker"
import { convertTextPageValueToASCII, COLOR_MODE, TEST_GRAPHICS, hiresLineToAddress, toHex, MONITOR_MODE } from "../common/utility"
import { convertColorsToRGBA, getHiresColors, getHiresGreen } from "./graphicshgr"
import { i18n } from "../i18n"
import { TEXT_AMBER, TEXT_GREEN, TEXT_WHITE, loresAmber, loresColors, loresGreen, loresWhite, translateDHGR } from "./graphicscolors"
import { getColorMode, getCrtDistortion, getGhosting, getMonitorMode, getShowScanlines, getTheme, isCanvasOnlyTheme, isEmbedMode, isGameMode } from "./ui_settings"
import { doCRTStartup } from "./crtstartup"
import { getPreferenceRetroIIGSColor, getPreferenceRetroSkin, RETRO_SKIN } from "./localstorage"
import { RETRO_IIGS_COLORS } from "./retro/retroskincolors"
import { UI_THEME } from "../common/utility"
let frameCount = 0
let displayOverride: HTMLCanvasElement | null = null
let displayOverrideRevision = 0

export const nRowsHgrMagnifier = 16
export const nColsHgrMagnifier = 2
export let xmargin = 0
export let ymargin = 0

const doBlurring = () => {
  return getMonitorMode() !== MONITOR_MODE.RGB
}

export const setDisplayOverride = (canvas: HTMLCanvasElement | null) => {
  displayOverride = canvas
  displayOverrideRevision++
}

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
// for mixed text/graphics mode, yet the text looks significantly better
// if it's drawn directly onto the on-screen canvas.
const processTextPage = (ctx: CanvasRenderingContext2D,
  hiddenContext: CanvasRenderingContext2D,
  colorMode: COLOR_MODE, width: number, height: number, crtDistortion: boolean,
  skinForeground: string | null, skinBackground: string | null) => {
  const textPage = handleGetTextPage()
  if (textPage.length === 0) return false

  // Startup text page: Unicode codepoints stored directly — render without Apple II byte encoding
  if (textPage instanceof Uint16Array) {
    const xmarginPx = xmargin * width
    const ymarginPx = ymargin * height
    const colorFill = skinForeground ??
      ["#FFFFFF", "#FFFFFF", TEXT_GREEN, TEXT_AMBER, TEXT_WHITE, TEXT_WHITE][colorMode]
    const useSilverFont = ["ru", "zh-TW", "zh-CN", "ja", "ko"].includes(i18n.getLanguage())
    const isCyrillic = i18n.getLanguage() === "ru"
    const cwidth = width * (1 - 2 * xmargin) / 40
    const cheight = height * (1 - 2 * ymargin) / 24
    const hiddenWidth = 560 / 40
    const hiddenHeight = 384 / 24
    const isCJKIdeograph = (cp: number) => (cp >= 0x400)
    ctx.fillStyle = colorFill
    hiddenContext.fillStyle = colorFill
    // Two passes so we only switch fonts twice: CJK at normal size, everything else larger
    const passes = useSilverFont ? [true, false] : [false]
    for (const renderCJK of passes) {
      const startupFont = renderCJK ? "Silver" : "PrintChar21"
      const fontScale = renderCJK ? (isCyrillic ? 2 : 1.3) : 1
      const fontSize = cheight * fontScale
      const hiddenFontSize = hiddenHeight * fontScale
      ctx.font = `${fontSize}px ${startupFont}`
      hiddenContext.font = `${hiddenFontSize}px ${startupFont}`
      for (let j = 0; j < 24; j++) {
        const yoffset = ymarginPx + (j + 1) * cheight - 2
        const yoffsetHidden = (j + 1) * hiddenHeight - 2
        for (let i = 0; i < 40; i++) {
          const cp = textPage[40 * j + i] || 0x20
          if (useSilverFont && isCJKIdeograph(cp) !== renderCJK) continue
          const v = String.fromCodePoint(cp)
          if (!crtDistortion) {
            ctx.fillText(v, xmarginPx + i * cwidth, yoffset)
          }
          hiddenContext.fillText(v, i * hiddenWidth, yoffsetHidden)
        }
      }
    }
    return true
  }

  const switches = handleGetSoftSwitches()
  // See Video-7 RGB-SL7 manual, section 7.1, p. 35
  // https://mirrors.apple2.org.za/ftp.apple.asimov.net/documentation/hardware/video/Video-7%20RGB-SL7.pdf
  const isVideo7 = switches.DHIRES && !switches.COLUMN80 && switches.STORE80
  const doubleRes = !isVideo7 && (textPage.length === 320 || textPage.length === 1920)
  const mixedMode = textPage.length === 160 || textPage.length === 320
  const nchars = doubleRes ? 80 : 40
  const nBytesPerLine = (textPage.length === 320 || textPage.length === 1920) ? 80 : 40
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
  const machineName = handleGetMachineName()
  const isAltCharSet = machineName === "APPLE2P" ? false : handleGetAltCharSet()
  const colorFill = skinForeground ??
    ["#FFFFFF", "#FFFFFF", TEXT_GREEN, TEXT_AMBER, TEXT_WHITE, TEXT_WHITE][colorMode]
  const hasMouseText = machineName === "APPLE2EE"
  const hasLowerCase = (nchars === 80) || (machineName !== "APPLE2P")
  const useApple2PlusMap = (nchars !== 80) && (machineName === "APPLE2P")
  const colors = [loresColors, loresColors, loresGreen, loresAmber, loresWhite][colorMode]

  // First draw all the background colors. That way our background rects
  // don't obscure part of the text.
  for (let j = jstart; j < 24; j++) {
    const joffset = (j - jstart) * nBytesPerLine
    textPage.slice(joffset, joffset + nchars).forEach((value, i) => {
      let doInverse = (value <= 63)
      if (isAltCharSet) {
        // Mouse text chars are in the range 64...95, so do not make inverse.
        // If we do not have mouse text (IIe unenhanced) everything <= 127 is inverse.
        doInverse = hasMouseText ? ((value <= 63) || (value >= 96 && value <= 127)) : (value <= 127)
      }
      let cfill: string | null = null
      if (isVideo7) {
        // Color information is in the second half of each line.
        const color = textPage[joffset + 40 + i]
        // Text background color is in the low nibble, unless inverse,
        // in which case we use the high nibble.
        const c = doInverse ? colors[color >> 4] : colors[color & 15]
        cfill = `#${toHex(c[0])}${toHex(c[1])}${toHex(c[2])}`
      } else {
        if (doInverse || colorMode == COLOR_MODE.INVERSEBLACKANDWHITE ||
          (value < 128 && !isAltCharSet && doFlashCycle)) {
          cfill = colorFill
        }
      }
      if (cfill) {
        ctx.fillStyle = cfill
        hiddenContext.fillStyle = cfill
        if (!crtDistortion) {
          ctx.fillRect(xmarginPx + i * cwidth, ymarginPx + j * cheight, 1.08 * cwidth, 1.03 * cheight)
        }
        hiddenContext.fillRect(i * hiddenWidth, j * hiddenHeight, 1.08 * hiddenWidth, 1.03 * hiddenHeight)
      }
    })
  }

  // Now draw the text.
  for (let j = jstart; j < 24; j++) {
    const yoffset = ymarginPx + (j + 1)*cheight - 2
    const yoffsetHidden = (j + 1) * hiddenHeight - 2
    const joffset = (j - jstart) * nBytesPerLine
    textPage.slice(joffset, joffset + nchars).forEach((value, i) => {
      let doInverse = (value <= 63)
      if (isAltCharSet) {
        // Mouse text chars are in the range 64...95, so do not make inverse.
        // If we do not have mouse text (IIe unenhanced) everything <= 127 is inverse.
        doInverse = hasMouseText ? ((value <= 63) || (value >= 96 && value <= 127)) : (value <= 127)
      }
      const v = convertTextPageValueToASCII(
        value, isAltCharSet, hasMouseText, hasLowerCase, useApple2PlusMap
      )
      let cfill = colorFill
      if (isVideo7) {
        // Color information is in the second half of each line.
        const color = textPage[joffset + 40 + i]
        // Text foreground color is in the high nibble, unless inverse,
        // in which case we use the low nibble.
        const c = doInverse ? colors[color & 15] : colors[color >> 4]
        cfill = `#${toHex(c[0])}${toHex(c[1])}${toHex(c[2])}`
      } else {
        if (doInverse || colorMode == COLOR_MODE.INVERSEBLACKANDWHITE ||
          (value < 128 && !isAltCharSet && doFlashCycle)) {
          cfill = skinBackground ?? "#000000"
        }
      }
      ctx.fillStyle = cfill
      hiddenContext.fillStyle = cfill
      if (!crtDistortion) {
        ctx.fillText(v, xmarginPx + i*cwidth, yoffset)
      }
      hiddenContext.fillText(v, i * hiddenWidth, yoffsetHidden)
    })
  }
}

const translateLoresColor = [0, 2, 4, 6, 8, 10, 12, 14, 1, 3, 5, 7, 9, 11, 13, 15]

// Holds an RGBA buffer at native (un-doubled) line resolution so it can be
// scaled 2x in Y via drawImage instead of manually duplicating rows.
const rowDoubleCanvas = document.createElement("canvas")
rowDoubleCanvas.width = 560
rowDoubleCanvas.height = 192
const rowDoubleContext = rowDoubleCanvas.getContext("2d")!

const putImageDataDoubled = (hiddenContext: CanvasRenderingContext2D,
  rgba: Uint8ClampedArray, nlines: number) => {
  rowDoubleContext.putImageData(new ImageData(rgba as ImageDataArray, 560, nlines), 0, 0)
  hiddenContext.drawImage(rowDoubleCanvas, 0, 0, 560, nlines, 0, 0, 560, 2 * nlines)
}

const processLoRes = (hiddenContext: CanvasRenderingContext2D,
  colorMode: COLOR_MODE) => {
  const textPage = handleGetLores()
  if (textPage.length === 0) return false
  const switches = handleGetSoftSwitches()
  const isVideo7 = switches.DHIRES && !switches.COLUMN80 && switches.STORE80
  const doubleRes = !isVideo7 && (textPage.length === 1600 || textPage.length === 1920)
  const mixedMode = textPage.length === 800 || textPage.length === 1600
  const nlines = mixedMode ? 160 : 192
  const nchars = doubleRes ? 80 : 40
  const nBytesPerLine = (textPage.length === 1600 || textPage.length === 1920) ? 80 : 40
  const bottom = mixedMode ? 20 : 24
  const cwidth = doubleRes ? 7 : 14
  const colors = [loresColors, loresColors, loresGreen, loresAmber, loresWhite][colorMode]

  const hgrRGBA = new Uint8ClampedArray(4 * 560 * nlines).fill(255)
  for (let y = 0; y < bottom; y++) {
    textPage.slice(y * nBytesPerLine, y * nBytesPerLine + nchars).forEach((value, i) => {
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
    })
  }
  putImageDataDoubled(hiddenContext, hgrRGBA, nlines)
  return true
}

const BLACK = 0
const WHITE = 3

const getDoubleHiresColors = (hgrPage: Uint8Array, colorMode: COLOR_MODE) => {
  const nlines = hgrPage.length / 80
  const hgrColors = new Uint8Array(560 * nlines).fill(BLACK)
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

const getVideo7H160Colors = (hgrPage: Uint8Array) => {
  const nlines = hgrPage.length / 80
  const hgrColors = new Uint8Array(560 * nlines).fill(BLACK)
  for (let j = 0; j < nlines; j++) {
    const line = hgrPage.slice(j*80, j*80 + 80)
    const joffset = j * 560
    let start = 0
    for (let i = 0; i < 160; i++) {
      const off = i>>1
      const shift = (i&1)?4:0	// apparently nybble swapped?
      // since 560/160=3.5, draw alternating 4 & 3 pixel columns for now
      const count = shift ? 3 : 4
      const colorValue = (line[off] >> shift) & 0xF
      const color = translateDHGR[colorValue]
      for (let c = 0; c < count; c++) {
        hgrColors[joffset + start] = color
        start++
      }
    }
  }
  return hgrColors
}

// Apply the Video7 monochrome mode on top of the existing HGR colors.
const applyVideo7MixedMode = (hgrPage: Uint8Array, hgrColors: Uint8Array) => {
  const nlines = hgrPage.length / 80
  for (let j = 0; j < nlines; j++) {
    const line = hgrPage.slice(j*80, j*80 + 80)
    const joffset = j * 560
    for (let i = 0; i < 560; i++) {
      const byte = line[Math.floor(i / 7)]
      if (byte & 128) {
        continue
      }
      const bit = (byte >> (i % 7)) & 1
      hgrColors[joffset + i] = bit ? 15 : 0
    }
  }
  return hgrColors
}

// Video7 Foreground/Background hires mode, similar to the Video7 text mode.
// The odd bytes (from main memory) contain the bit on/off flag for each of
// the 280 pixels in a line. The even bytes (from aux mem) contain the color
// info: if a pixel is "on" then the foreground color (high nibble) is used,
// and if the pixel is "off" then the background color (low nibble) is used.
// Note that there are 280 pixels but only 40 bytes of color data per line.
const getVideo7HiresColors = (hgrPage: Uint8Array, colorMode: COLOR_MODE) => {
  const nlines = hgrPage.length / 80
  const hgrColors = new Uint8Array(560 * nlines).fill(BLACK)
  const isColor = colorMode === COLOR_MODE.COLOR || colorMode === COLOR_MODE.NOFRINGE
  for (let j = 0; j < nlines; j++) {
    const line = hgrPage.slice(j*80, j*80 + 80)
    const bits = new Uint8Array(280).fill(0)
    const joffset = j * 560
    let b = 0
    for (let i = 0; i < 279; i++) {
      bits[i] = (line[2 * Math.floor(i / 7) + 1] >> b) & 1
      b = (b + 1) % 7
    }
    if (isColor) {
      for (let i = 0; i < 279; i++) {
        const colorByte = line[2 * Math.floor(i / 7)]
        const color = bits[i] ? (colorByte >> 4) : (colorByte & 15)
        hgrColors[joffset + 2 * i] = color
        hgrColors[joffset + 2 * i + 1] = color
      }
    } else {
      for (let i = 0; i < 279; i++) {
        if (bits[i]) {
          hgrColors[joffset + 2 * i] = 15
          hgrColors[joffset + 2 * i + 1] = 15
        }
      }
    }
  }
  return hgrColors
}

const processHiRes = (hiddenContext: CanvasRenderingContext2D,
  colorMode: COLOR_MODE) => {
  const hgrPage = handleGetHires()  // 40x160, 40x192, 80x160, 80x192
  if (hgrPage.length === 0) return false
  const mixedMode = hgrPage.length === 6400 || hgrPage.length === 12800
  const nlines = mixedMode ? 160 : 192
  const switches = handleGetSoftSwitches()
  const video7foreground = switches.DHIRES && !switches.COLUMN80 && switches.STORE80
  const doubleRes = switches.COLUMN80 && (hgrPage.length === 12800 || hgrPage.length === 15360)
  const isColor = colorMode === COLOR_MODE.COLOR || colorMode === COLOR_MODE.NOFRINGE
  const noDelayMode = handleGetNoDelayMode()
  const fillColor = colorMode === COLOR_MODE.INVERSEBLACKANDWHITE ? WHITE : BLACK
  let hgrColors: Uint8Array
  if (switches.VIDEO7_160) {
    hgrColors = getVideo7H160Colors(hgrPage)
  } else if (switches.VIDEO7_MONO) {
    hgrColors = getDoubleHiresColors(hgrPage, COLOR_MODE.BLACKANDWHITE)
  } else if (video7foreground) {
    hgrColors = getVideo7HiresColors(hgrPage, colorMode)
  } else if (doubleRes) {
    hgrColors = getDoubleHiresColors(hgrPage, colorMode)
  } else if (isColor) {
    hgrColors = getHiresColors(hgrPage, nlines, colorMode, noDelayMode, false, true, fillColor)
  } else {
    hgrColors = getHiresGreen(hgrPage, nlines, fillColor)
  }
  if (switches.VIDEO7_MIXED) {
    // We should have already done the double hires colors.
    // Now apply the Video7 monochrome mode on top of the existing HGR colors.
    hgrColors = applyVideo7MixedMode(hgrPage, hgrColors)
  }
  const hgrRGBA = convertColorsToRGBA(hgrColors, colorMode, doubleRes || video7foreground)
  if (doBlurring()) {
    for (let j = 0; j < nlines; j++) {
      const row = hgrRGBA.slice(4 * 560 * j, 4 * 560 * (j + 1))
      for (let i = 1; i < 559; i++) {
        const pt2 = row.slice(4 * i, 4 * (i + 1))
        const isBlack = (pt2[0] === 0 && pt2[1] === 0 && pt2[2] === 0)
        if (isBlack) {
          const pt1 = row.slice(4 * (i - 1), 4 * i)
          const pt3 = row.slice(4 * (i + 1), 4 * (i + 2))
          pt1[0] = Math.floor((pt1[0] + 2 * pt2[0] + pt3[0]) / 4)
          pt1[1] = Math.floor((pt1[1] + 2 * pt2[1] + pt3[1]) / 4)
          pt1[2] = Math.floor((pt1[2] + 2 * pt2[2] + pt3[2]) / 4)
          hgrRGBA.set(pt1, 4 * i + 4 * 560 * j)
        }
      }
    }
  }
  putImageDataDoubled(hiddenContext, hgrRGBA, nlines)
  return true
}

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
  if (hgrPage.length !== (40 * 192)) return null
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
    ctx.fillText(`${"HGR Page " + (doPage2 ? "2" : "1")}`, width / 2, height - 2)
  }
}

// For the ghosting effect
let ghostFrame: ImageData | null = null

const replaceBlackPixels = (image: ImageData, background: string | null) => {
  if (!background) return
  const [red, green, blue] = background.match(/\d+/g)?.map(Number) ?? []
  if (red === undefined || green === undefined || blue === undefined) return
  for (let index = 0; index < image.data.length; index += 4) {
    if (image.data[index] === 0 && image.data[index + 1] === 0 && image.data[index + 2] === 0) {
      image.data[index] = red
      image.data[index + 1] = green
      image.data[index + 2] = blue
    }
  }
}

let monitorOpeningMask: HTMLImageElement | null = null
let monitorOpeningMaskLoading = false
let surroundLayerCache: { key: string, canvas: HTMLCanvasElement } | null = null
const crtDistortedCanvas = document.createElement("canvas")
const crtClippedCanvas = document.createElement("canvas")
const crtOverrideFrameCanvas = document.createElement("canvas")
const crtSourceWidth = 560
const crtSourceHeight = 384
const crtOutsideSource = 0xFFFFFFFF
let crtDistortionMap: Uint32Array | null = null
let crtDistortionWeightX: Uint16Array | null = null
let crtDistortionWeightY: Uint16Array | null = null
let crtDistortionEdgeSource: Uint32Array | null = null
let crtDistortionEdgeWeight: Uint16Array | null = null
let crtOverrideFrameCacheKey = ""

const resizeWorkCanvas = (canvas: HTMLCanvasElement, width: number, height: number) => {
  if (canvas.width !== width) canvas.width = width
  if (canvas.height !== height) canvas.height = height
}

const loadMonitorOpeningMask = () => {
  if (monitorOpeningMask || monitorOpeningMaskLoading) return
  monitorOpeningMaskLoading = true
  const image = new Image()
  image.onload = () => {
    monitorOpeningMask = image
    surroundLayerCache = null
  }
  image.src = window.assetRegistry.monitorOpeningMask
}

const getCrtDistortionMap = () => {
  if (crtDistortionMap && crtDistortionWeightX && crtDistortionWeightY &&
    crtDistortionEdgeSource && crtDistortionEdgeWeight) {
    return {
      map: crtDistortionMap,
      weightX: crtDistortionWeightX,
      weightY: crtDistortionWeightY,
      edgeSource: crtDistortionEdgeSource,
      edgeWeight: crtDistortionEdgeWeight,
    }
  }
  const map = new Uint32Array(crtSourceWidth * crtSourceHeight)
  const weightX = new Uint16Array(map.length)
  const weightY = new Uint16Array(map.length)
  const edgeSource = new Uint32Array(map.length)
  const edgeWeight = new Uint16Array(map.length)
  const centerX = crtSourceWidth / 2
  const centerY = crtSourceHeight / 2
  for (let y = 0; y < crtSourceHeight; y++) {
    const normalizedY = (y - centerY) / centerY
    for (let x = 0; x < crtSourceWidth; x++) {
      const normalizedX = (x - centerX) / centerX
      const distance = normalizedX * normalizedX + normalizedY * normalizedY
      const sourceX = centerX + normalizedX * centerX * (1 + 0.015 * distance)
      const sourceY = centerY + normalizedY * centerY * (1 + 0.04 * distance)
      const index = y * crtSourceWidth + x
      if (sourceX < 0 || sourceX >= crtSourceWidth || sourceY < 0 || sourceY >= crtSourceHeight) {
        map[index] = crtOutsideSource
        const edgeX = Math.max(0, Math.min(crtSourceWidth - 1, Math.round(sourceX)))
        const edgeY = Math.max(0, Math.min(crtSourceHeight - 1, Math.round(sourceY)))
        const coverageX = sourceX < 0
          ? Math.max(0, sourceX + 1)
          : sourceX >= crtSourceWidth ? Math.max(0, crtSourceWidth - sourceX) : 1
        const coverageY = sourceY < 0
          ? Math.max(0, sourceY + 1)
          : sourceY >= crtSourceHeight ? Math.max(0, crtSourceHeight - sourceY) : 1
        edgeSource[index] = edgeY * crtSourceWidth + edgeX
        edgeWeight[index] = Math.round(coverageX * coverageY * 256)
      } else {
        const sourceFloorX = Math.floor(sourceX)
        const sourceFloorY = Math.floor(sourceY)
        const sourceBaseX = Math.min(sourceFloorX, crtSourceWidth - 2)
        const sourceBaseY = Math.min(sourceFloorY, crtSourceHeight - 2)
        map[index] = sourceBaseY * crtSourceWidth + sourceBaseX
        weightX[index] = sourceFloorX === crtSourceWidth - 1
          ? 256
          : Math.round((sourceX - sourceFloorX) * 256)
        weightY[index] = sourceFloorY === crtSourceHeight - 1
          ? 256
          : Math.round((sourceY - sourceFloorY) * 256)
      }
    }
  }
  crtDistortionMap = map
  crtDistortionWeightX = weightX
  crtDistortionWeightY = weightY
  crtDistortionEdgeSource = edgeSource
  crtDistortionEdgeWeight = edgeWeight
  return { map, weightX, weightY, edgeSource, edgeWeight }
}

const blendPixels = (first: number, second: number, weight: number) => {
  const redBlue = ((first & 0x00FF00FF) +
    ((((second & 0x00FF00FF) - (first & 0x00FF00FF)) * weight) >> 8)) & 0x00FF00FF
  const green = ((first & 0x0000FF00) +
    ((((second & 0x0000FF00) - (first & 0x0000FF00)) * weight) >> 8)) & 0x0000FF00
  return (0xFF000000 | redBlue | green) >>> 0
}

const distortLayer = (source: HTMLCanvasElement, outsideColor: string | null) => {
  const sourceContext = source.getContext("2d", { willReadFrequently: true })!
  const sourceData = sourceContext.getImageData(0, 0, crtSourceWidth, crtSourceHeight)
  const distortedData = sourceContext.createImageData(crtSourceWidth, crtSourceHeight)
  const sourcePixels = new Uint32Array(sourceData.data.buffer)
  const distortedPixels = new Uint32Array(distortedData.data.buffer)
  const { map, weightX, weightY, edgeSource, edgeWeight } = getCrtDistortionMap()
  const [outsideRed, outsideGreen, outsideBlue] =
    outsideColor?.match(/\d+/g)?.map(Number) ?? [0, 0, 0]
  const outsidePixel = (0xFF000000 | outsideBlue << 16 |
    outsideGreen << 8 | outsideRed) >>> 0
  for (let index = 0; index < map.length; index++) {
    const sourceIndex = map[index]
    if (sourceIndex === crtOutsideSource) {
      distortedPixels[index] = blendPixels(
        outsidePixel,
        sourcePixels[edgeSource[index]],
        edgeWeight[index],
      )
    } else {
      const xWeight = weightX[index]
      const yWeight = weightY[index]
      const lowerIndex = sourceIndex + crtSourceWidth
      const top = blendPixels(sourcePixels[sourceIndex], sourcePixels[sourceIndex + 1], xWeight)
      const bottom = blendPixels(sourcePixels[lowerIndex], sourcePixels[lowerIndex + 1], xWeight)
      distortedPixels[index] = blendPixels(top, bottom, yWeight)
    }
  }
  resizeWorkCanvas(crtDistortedCanvas, crtSourceWidth, crtSourceHeight)
  crtDistortedCanvas.getContext("2d")!.putImageData(distortedData, 0, 0)
  return crtDistortedCanvas
}

const getScreenSurroundLayer = (
  width: number,
  height: number,
  color: string,
) => {
  const hasClassicMonitorFrame = getTheme() === UI_THEME.CLASSIC &&
    document.fullscreenElement === null && !isCanvasOnlyTheme()
  if (hasClassicMonitorFrame && !monitorOpeningMask) {
    loadMonitorOpeningMask()
    return null
  }
  const key = [width, height, color, hasClassicMonitorFrame].join(":")
  if (surroundLayerCache?.key === key) return surroundLayerCache.canvas

  const layer = document.createElement("canvas")
  layer.width = width
  layer.height = height
  const layerContext = layer.getContext("2d")!
  layerContext.fillStyle = color
  if (hasClassicMonitorFrame) {
    layerContext.drawImage(monitorOpeningMask!, 0, 0, width, height)
    layerContext.globalCompositeOperation = "source-in"
  }
  layerContext.fillRect(0, 0, width, height)
  layerContext.globalCompositeOperation = "source-over"

  surroundLayerCache = { key, canvas: layer }
  return layer
}

const paintScreenSurround = (
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  color: string,
  ghosting: boolean,
) => {
  const layer = getScreenSurroundLayer(width, height, color)
  if (!layer) return

  ctx.save()
  ctx.globalAlpha = ghosting ? 0.3 : 1
  ctx.drawImage(layer, 0, 0)
  ctx.restore()
}

const applyCrtDistortion = (ctx: CanvasRenderingContext2D,
  hiddenContext: CanvasRenderingContext2D,
  colorMode: COLOR_MODE, width: number, height: number,
  foreground: string | null, background: string | null, borderColor: string | null,
  renderText = true) => {
  // Draw text before distortion
  if (renderText) {
    processTextPage(ctx, hiddenContext, colorMode, width, height, true, foreground, background)
  }

  const hiddenData = hiddenContext.getImageData(0, 0, crtSourceWidth, crtSourceHeight)
  replaceBlackPixels(hiddenData, background)
  hiddenContext.putImageData(hiddenData, 0, 0)

  const distorted = distortLayer(hiddenContext.canvas, borderColor ?? background)

  const hasClassicMonitorFrame = getTheme() === UI_THEME.CLASSIC &&
    document.fullscreenElement === null && !isCanvasOnlyTheme()
  if (hasClassicMonitorFrame && !monitorOpeningMask) {
    loadMonitorOpeningMask()
    return false
  }
  paintScreenSurround(ctx, width, height, borderColor ?? background ?? "#000000", false)

  const screenX = xmargin * width
  const screenY = ymargin * height
  const screenWidth = width * (1 - 2 * xmargin)
  const screenHeight = height * (1 - 2 * ymargin)
  ctx.save()
  if (hasClassicMonitorFrame && monitorOpeningMask) {
    resizeWorkCanvas(crtClippedCanvas, width, height)
    const clippedContext = crtClippedCanvas.getContext("2d")!
    clippedContext.clearRect(0, 0, width, height)
    clippedContext.drawImage(distorted, screenX, screenY, screenWidth, screenHeight)
    clippedContext.globalCompositeOperation = "destination-in"
    clippedContext.drawImage(monitorOpeningMask, 0, 0, width, height)
    clippedContext.globalCompositeOperation = "source-over"
    ctx.drawImage(crtClippedCanvas, 0, 0)
  } else {
    ctx.drawImage(distorted, screenX, screenY, screenWidth, screenHeight)
  }
  ctx.restore()
  return true
}

const shrRgbaBuffer = new Uint8ClampedArray(560 * 384 * 4)

const processSuperHiRes = (hiddenContext: CanvasRenderingContext2D, colorMode: COLOR_MODE): boolean => {
  const shrData = handleGetShr()
  if (shrData.length < 0x8000) return false

  const outWidth = 560
  const outHeight = 384

  // Decode 16 palettes (each has 16 colors, 2 bytes 0x0RGB)
  const palR = new Uint8Array(256)
  const palG = new Uint8Array(256)
  const palB = new Uint8Array(256)

  const isColor = (colorMode === COLOR_MODE.COLOR || colorMode === COLOR_MODE.NOFRINGE)
  const isGreen = colorMode === COLOR_MODE.GREEN
  const isAmber = colorMode === COLOR_MODE.AMBER

  for (let p = 0; p < 16; p++) {
    const pOffset = 0x7E00 + p * 32
    for (let c = 0; c < 16; c++) {
      const idx = (p << 4) | c
      const colorLo = shrData[pOffset + c * 2]
      const colorHi = shrData[pOffset + c * 2 + 1]
      const colorWord = colorLo | (colorHi << 8)

      let r = ((colorWord >> 8) & 0x0F) * 17
      let g = ((colorWord >> 4) & 0x0F) * 17
      let b = (colorWord & 0x0F) * 17

      if (!isColor) {
        // Monochrome / Green / Amber / B&W conversion
        const lum = Math.round(0.299 * r + 0.587 * g + 0.114 * b)
        if (isGreen) {
          r = 0
          g = lum
          b = 0
        } else if (isAmber) {
          r = lum
          g = Math.round(lum * 0.7)
          b = 0
        } else {
          r = lum
          g = lum
          b = lum
        }
      }

      palR[idx] = r
      palG[idx] = g
      palB[idx] = b
    }
  }

    // Destination-driven sampling for 560x384 canvas
    for (let ty = 0; ty < outHeight; ty++) {
      const srcY = Math.min(199, Math.floor((ty * 200) / outHeight))
      const lineOffset = srcY * 160
      const scb = shrData[0x7D00 + srcY]
      const palIdx = (scb & 0x0F) << 4
      const is640 = (scb & 0x80) !== 0
      const rowOffset = ty * outWidth * 4

      if (!is640) {
        // 320 mode
        for (let x = 0; x < outWidth; x++) {
          const srcX = Math.min(319, Math.floor((x * 320) / outWidth))
          const byteVal = shrData[lineOffset + (srcX >> 1)]
          const color4Bit = (srcX & 1) ? (byteVal & 0x0F) : ((byteVal >> 4) & 0x0F)
          const c = palIdx | color4Bit

          const px = rowOffset + x * 4
          shrRgbaBuffer[px] = palR[c]
          shrRgbaBuffer[px + 1] = palG[c]
          shrRgbaBuffer[px + 2] = palB[c]
          shrRgbaBuffer[px + 3] = 255
        }
      } else {
        // 640 mode
        for (let x = 0; x < outWidth; x++) {
          const srcX = Math.min(639, Math.floor((x * 640) / outWidth))
          const byteVal = shrData[lineOffset + (srcX >> 2)]
          const shift = (3 - (srcX & 3)) * 2
          const color2Bit = (byteVal >> shift) & 0x03
          const colorIndex = (srcX % 4) * 4 + color2Bit
          const c = palIdx | colorIndex

          const px = rowOffset + x * 4
          shrRgbaBuffer[px] = palR[c]
          shrRgbaBuffer[px + 1] = palG[c]
          shrRgbaBuffer[px + 2] = palB[c]
          shrRgbaBuffer[px + 3] = 255
        }
      }
    }

    const imageData = new ImageData(shrRgbaBuffer, outWidth, outHeight)
    hiddenContext.putImageData(imageData, 0, 0)
    return true
}

export const ProcessDisplay = (ctx: CanvasRenderingContext2D,
  hiddenContext: CanvasRenderingContext2D,
  width: number, height: number) => {
  frameCount++
  const colorMode = getColorMode()
  ctx.imageSmoothingEnabled = doBlurring()
  ctx.imageSmoothingQuality = "high"
  hiddenContext.imageSmoothingEnabled = doBlurring()
  hiddenContext.imageSmoothingQuality = "high"
  const iigsSkin = getPreferenceRetroSkin() === RETRO_SKIN.APPLE_IIGS
  const foreground = iigsSkin
    ? RETRO_IIGS_COLORS[getPreferenceRetroIIGSColor("text")].css
    : null
  const effectBackground = iigsSkin
    ? RETRO_IIGS_COLORS[getPreferenceRetroIIGSColor("background")].css
    : null
  const borderColor = iigsSkin
    ? RETRO_IIGS_COLORS[getPreferenceRetroIIGSColor("border")].css
    : null
  const ghosting = getGhosting()
  const crtDistortion = getCrtDistortion()
  if (ghosting) {
    // Make a copy of the current canvas contents.
    const dx = xmargin * width
    const dy = ymargin * height
    ghostFrame = ctx.getImageData(0, 0, width, height)
    ctx.clearRect(0, 0, width, height)
    // Draw the single previous frame with transparency
    ctx.putImageData(ghostFrame, 0, 0)
    const alpha = 0.3
    ctx.globalAlpha = alpha
    ctx.fillStyle = effectBackground ?? "#000000"
    ctx.fillRect(dx, dy, width - 2 * dx, height - 2 * dy)
    ctx.globalAlpha = 1
  } else {
    // Clear all our drawing and let the background show through again.
    ctx.clearRect(0, 0, width, height)
  }

  if (borderColor) {
    if (!crtDistortion) paintScreenSurround(ctx, width, height, borderColor, ghosting)
  }
  if (effectBackground && !ghosting) {
    ctx.fillStyle = effectBackground
    ctx.fillRect(
      xmargin * width,
      ymargin * height,
      width * (1 - 2 * xmargin),
      height * (1 - 2 * ymargin),
    )
  }

  let overrideFrameKey = ""
  if (displayOverride) {
    if (crtDistortion) {
      overrideFrameKey = [
        displayOverrideRevision,
        width,
        height,
        xmargin,
        ymargin,
        colorMode,
        getMonitorMode(),
        foreground,
        effectBackground,
        borderColor,
        getShowScanlines(),
        getTheme(),
        document.fullscreenElement !== null,
        isCanvasOnlyTheme(),
      ].join(":")
      if (crtOverrideFrameCacheKey === overrideFrameKey) {
        ctx.drawImage(crtOverrideFrameCanvas, 0, 0)
        return
      }
    }
    if (!crtDistortion && (displayOverride.width !== 560 || displayOverride.height !== 384)) {
      const imageWidth = Math.floor(width * (1 - 2 * xmargin))
      const imageHeight = Math.floor(height * (1 - 2 * ymargin))
      ctx.drawImage(
        displayOverride,
        xmargin * width,
        ymargin * height,
        imageWidth,
        imageHeight,
      )
      return
    }
  }

  hiddenContext.fillStyle = effectBackground ?? "#000000"
  hiddenContext.fillRect(0, 0, 560, 384)

  if (displayOverride) {
    hiddenContext.drawImage(displayOverride, 0, 0, 560, 384)
    if (crtDistortion) {
      resizeWorkCanvas(crtOverrideFrameCanvas, width, height)
      const overrideContext = crtOverrideFrameCanvas.getContext("2d")!
      overrideContext.imageSmoothingEnabled = ctx.imageSmoothingEnabled
      overrideContext.imageSmoothingQuality = ctx.imageSmoothingQuality
      overrideContext.clearRect(0, 0, width, height)
      const rendered = applyCrtDistortion(
        overrideContext,
        hiddenContext,
        colorMode,
        width,
        height,
        foreground,
        effectBackground,
        borderColor,
        false,
      )
      if (rendered) {
        crtOverrideFrameCacheKey = overrideFrameKey
        ctx.drawImage(crtOverrideFrameCanvas, 0, 0)
      }
    } else {
      drawImage(ctx, hiddenContext, width, height)
    }
    return
  }

  if (effectBackground) {
    const hiddenData = hiddenContext.getImageData(0, 0, 560, 384)
    replaceBlackPixels(hiddenData, effectBackground)
    hiddenContext.putImageData(hiddenData, 0, 0)
  }

  const isVidhdActive = handleGetVidhdActive()
  let didDraw = false
  if (isVidhdActive) {
    didDraw = processSuperHiRes(hiddenContext, colorMode)
  }
  if (!didDraw) {
    didDraw = processLoRes(hiddenContext, colorMode)
    didDraw = processHiRes(hiddenContext, colorMode) || didDraw
  }

  if (crtDistortion) {
    applyCrtDistortion(ctx, hiddenContext, colorMode, width, height, foreground, effectBackground, borderColor)
  } else {
    if (didDraw) {
      drawImage(ctx, hiddenContext, width, height)
    }
    // The hidden canvas was causing overlay issues with the text page.
    // So instead, draw the graphics first and then overlay the text chars.
    if (!isVidhdActive) {
      processTextPage(ctx, hiddenContext, colorMode, width, height, false, foreground, effectBackground)
      // If we are doing regular NTSC color, then we need to draw the text again.
      // This will cause a subtle smoothing.
      if (colorMode !== COLOR_MODE.NOFRINGE) {
        drawImage(ctx, hiddenContext, width, height)
      }
    }
  }
  // if (TEST_GRAPHICS) {
  //   const tile = [
  //     0x7F, 0x0, 0x40, 0x80, 0x15, 0x40, 0x80,  // 1
  //     0x02, 0x87, 0x40, 0x80, 0x00, 0x40, 0x80,
  //     0x03, 0x0E, 0x40, 0x80, 0x00, 0x40, 0x80,
  //     0x81, 0x8E, 0xC0, 0x00, 0x2A, 0xC0, 0x00,  // 2
  //     0x82, 0x1B, 0xC0, 0x00, 0x00, 0xC0, 0x00,
  //     0x83, 0x9B, 0xC0, 0x00, 0x00, 0xC0, 0x00,
  //     0x05, 0x36, 0xC0, 0x01, 0x95, 0xC0, 0x01,  // 3
  //     0x0A, 0xB6, 0xC0, 0x01, 0x00, 0xC0, 0x01,
  //     0x0F, 0x00, 0xC0, 0x01, 0x00, 0xC0, 0x01,
  //     0x85, 0x7F, 0xE0, 0x00, 0xAA, 0xE0, 0x00,  // 4
  //     0x8A, 0x00, 0xE0, 0x00, 0x00, 0xE0, 0x00,
  //     0x8F, 0x00, 0xE0, 0x02, 0x00, 0xE0, 0x02,
  //     0x07, 0x00, 0xA0, 0x01, 0x3E, 0xA0, 0x01,  // 5
  //     0x07, 0x00, 0xA0, 0x01, 0x00, 0xA0, 0x01,
  //     0x07, 0x00, 0xA0, 0x01, 0x00, 0xA0, 0x01,
  //     0xAC, 0x80, 0x00, 0x2C, 0, 0, 0,
  //     0xAC, 0x80, 0x00, 0x2C, 0, 0, 0,
  //     0xAC, 0x80, 0x00, 0x2C, 0, 0, 0,
  //     0xA7, 0x80, 0x00, 0x27, 0, 0, 0,
  //     0xA7, 0x80, 0x00, 0x27, 0, 0, 0,
  //     0xA7, 0x80, 0x00, 0x27, 0, 0, 0,
  //     0, 0xEE, 0xDD, 0xBB, 0xF7, 0x80, 0,
  //     0, 0xEE, 0xDD, 0xBB, 0xF7, 0x80, 0,
  //     0, 0x8E, 0xDD, 0xBB, 0xF7, 0x80, 0,
  //     0xEE, 0xDD, 0xBB, 0xF7, 0x80, 0, 0,
  //     0xEE, 0xDD, 0xBB, 0xF7, 0x80, 0, 0,
  //     0xEE, 0xDD, 0xBB, 0xF7, 0x80, 0, 0]
  //   ctx.imageSmoothingEnabled = false
  //   drawHiresTile(ctx, new Uint8Array(tile), colorMode, 27, 50, 50, 8, true)
  // }
}

export const getCanvasSize = () => {
  const isTouchDevice = "ontouchstart" in document.documentElement
  const isCanvasFullScreen = document.fullscreenElement !== null
  const noBackgroundImage = isTouchDevice || isCanvasFullScreen || isCanvasOnlyTheme()
  const margin = (handleGetMachineName() === "APPLE2P" && !isCanvasFullScreen) ? 0.12 : 0.075
  xmargin = (isEmbedMode() && noBackgroundImage) ? 0.0 : (isTouchDevice ? 0.01 : margin)
  ymargin = (isEmbedMode() && noBackgroundImage) ? 0.0 : (isTouchDevice ? 0.01 : margin)
  const screenRatio = 1.4583334 // 1.33  // (20 * 40) / (24 * 24)
  if (TEST_GRAPHICS) {
    return [659, 452]  // This will give an actual size of 560 x 384
  }
  let width = window.innerWidth ? window.innerWidth : window.outerWidth
  let height = window.innerHeight ? window.innerHeight : (window.outerHeight - 150)
  if (isCanvasFullScreen) {
    const screenWidth = height * (1 - 2 * ymargin) * screenRatio
    if (screenWidth <= width) {
      xmargin = (width - screenWidth) / (2 * width)
    } else {
      const screenHeight = width * (1 - 2 * xmargin) / screenRatio
      ymargin = (height - screenHeight) / (2 * height)
    }
    return [Math.floor(width), Math.floor(height)]
  }
  const isLandscape = isTouchDevice && (window.innerWidth > window.innerHeight)
  if (isEmbedMode()) {
    height -= noBackgroundImage ? 60 : 25
    width -= noBackgroundImage ? 60 : 25
  } else if (isCanvasOnlyTheme()) {
    if (isLandscape) {
      height -= 150
    } else {
      height -= 45
    }
  } else {
    if (isGameMode())
    {
      height -= 70
      width -= 25
    } else {
      height -= noBackgroundImage ? (isTouchDevice ? 0 : 40) : 160
      width -= isLandscape ? 320 : (isTouchDevice ? 0 : 40)
    }
  }
  if (!noBackgroundImage) {
    const debugSection = document.getElementById("debug-section") as HTMLElement
    if (debugSection && debugSection.offsetWidth > 0) {
      width = Math.max(400, width - debugSection.offsetWidth + 40)
    }
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

// Animate a CRT turning on effect using canvas
export const CRTStartup = (ctx: CanvasRenderingContext2D, colorMode: COLOR_MODE) => {
  doCRTStartup(ctx, colorMode, xmargin, ymargin)
}
