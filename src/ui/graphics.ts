import { handleGetAltCharSet, handleGetTextPage,
  handleGetLores, handleGetHires, handleGetNoDelayMode, passSetSoftSwitches,
  handleGetMachineName,
  handleGetSoftSwitches} from "./main2worker"
import { convertTextPageValueToASCII, COLOR_MODE, TEST_GRAPHICS, hiresLineToAddress, toHex } from "../common/utility"
import { convertColorsToRGBA, getHiresColors, getHiresGreen } from "./graphicshgr"
import { TEXT_AMBER, TEXT_GREEN, TEXT_WHITE, loresAmber, loresColors, loresGreen, loresWhite, translateDHGR } from "./graphicscolors"
import { getColorMode, getCrtDistortion, getGhosting, isEmbedMode, isGameMode, isMinimalTheme } from "./ui_settings"
import { doCRTStartup } from "./crtstartup"
let frameCount = 0

export const nRowsHgrMagnifier = 16
export const nColsHgrMagnifier = 2
export let xmargin = 0.075
export let ymargin = 0.075

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
  colorMode: COLOR_MODE, width: number, height: number, crtDistortion: boolean) => {
  const textPage = handleGetTextPage()
  if (textPage.length === 0) return false
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
  const isAltCharSet = handleGetAltCharSet()
  const colorFill = ["#FFFFFF", "#FFFFFF", TEXT_GREEN, TEXT_AMBER, TEXT_WHITE, TEXT_WHITE][colorMode]
  const hasMouseText = handleGetMachineName() === "APPLE2EE"
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
    const yoffset = ymarginPx + (j + 1)*cheight - 3
    const yoffsetHidden = (j + 1) * hiddenHeight - 3
    const joffset = (j - jstart) * nBytesPerLine
    textPage.slice(joffset, joffset + nchars).forEach((value, i) => {
      let doInverse = (value <= 63)
      if (isAltCharSet) {
        // Mouse text chars are in the range 64...95, so do not make inverse.
        // If we do not have mouse text (IIe unenhanced) everything <= 127 is inverse.
        doInverse = hasMouseText ? ((value <= 63) || (value >= 96 && value <= 127)) : (value <= 127)
      }
      const v = convertTextPageValueToASCII(value, isAltCharSet, hasMouseText)
//      const v = String.fromCharCode(v1 < 127 ? v1 : v1 === 0x83 ? 0xEBE7 : (v1 + 0xE000))
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
          cfill = "#000000"
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
  const hgrDataStretched = new Uint8ClampedArray(4 * 560 * nlines * 2)
  for (let j = 0; j < nlines; j++) {
    const slice = hgrRGBA.slice(4 * 560 * j, 4 * 560 * (j + 1))
    hgrDataStretched.set(slice, 4 * 560 * 2 * j)
    hgrDataStretched.set(slice, 4 * 560 * 2 * j + 4 * 560)
  }
  const imageData = new ImageData(hgrDataStretched, 560, 2 * nlines)
  hiddenContext.putImageData(imageData, 0, 0)
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
  const hgrDataStretched = new Uint8ClampedArray(4 * 560 * nlines * 2)
  for (let j = 0; j < nlines; j++) {
    const slice = hgrRGBA.slice(4 * 560 * j, 4 * 560 * (j + 1))
    hgrDataStretched.set(slice, 4 * 560 * 2 * j)
    hgrDataStretched.set(slice, 4 * 560 * 2 * j + 4 * 560)
  }
  const imageData = new ImageData(hgrDataStretched, 560, 2 * nlines)
  hiddenContext.putImageData(imageData, 0, 0)
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

const applyCrtDistortion = (ctx: CanvasRenderingContext2D,
  hiddenContext: CanvasRenderingContext2D,
  colorMode: COLOR_MODE, width: number, height: number) => {
  // Draw text before distortion
  processTextPage(ctx, hiddenContext, colorMode, width, height, true)

  // Apply CRT barrel distortion effect (curved edges like a CRT monitor)
  const nx = 560
  const ny = 384
  const hiddenData = hiddenContext.getImageData(0, 0, nx, ny)
  const distortedData = new ImageData(nx * 2, ny * 2)
  
  // Barrel distortion parameters
  const distortionStrengthX = 0.015  // Horizontal distortion (left/right edges)
  const distortionStrengthY = 0.04  // Vertical distortion (top/bottom edges)
  const centerX = nx / 2
  const centerY = ny / 2
  
  // Apply barrel distortion by warping coordinates based on distance from center
  for (let j = 0; j < ny * 2; j++) {
    for (let i = 0; i < nx * 2; i++) {
      // Map destination coordinates back to original coordinate space
      const origX = i / 2
      const origY = j / 2
      
      // Normalize coordinates to range [-1, 1] from center
      const normX = (origX - centerX) / centerX
      const normY = (origY - centerY) / centerY
      
      // Calculate distance from center with separate strengths per axis
      const distanceX = normX * normX
      const distanceY = normY * normY
      
      // Apply barrel distortion (quadratic function) with different strengths per axis
      // Multiply to push edges outward (CRT bulge effect)
      const distortionX = 1 + distortionStrengthX * (distanceX + distanceY)
      const distortionY = 1 + distortionStrengthY * (distanceX + distanceY)
      
      // Calculate source coordinates (sample from farther out for barrel distortion)
      const srcX = centerX + normX * centerX * distortionX
      const srcY = centerY + normY * centerY * distortionY
      
      // Nearest neighbor sampling for sharper image
      const x0 = Math.round(srcX)
      const y0 = Math.round(srcY)
      
      // Only sample if within bounds of original image
      if (x0 >= 0 && x0 < nx && y0 >= 0 && y0 < ny) {
        const srcIndex = 4 * (y0 * nx + x0)
        const dstIndex = 4 * (j * nx * 2 + i)
        
        // Nearest neighbor - copy pixel directly
        distortedData.data[dstIndex] = hiddenData.data[srcIndex]
        distortedData.data[dstIndex + 1] = hiddenData.data[srcIndex + 1]
        distortedData.data[dstIndex + 2] = hiddenData.data[srcIndex + 2]
        distortedData.data[dstIndex + 3] = hiddenData.data[srcIndex + 3]
      }
    }
  }
  
  // Create a temporary canvas for the distorted image
  const tempCanvas = document.createElement("canvas")
  tempCanvas.width = nx * 2
  tempCanvas.height = ny * 2
  const tempCtx = tempCanvas.getContext("2d")!
  tempCtx.putImageData(distortedData, 0, 0)
  
  // Draw the distorted image scaled and positioned with margins
  const fudge = 1.25
  const xmarginPx = xmargin * width / fudge
  const ymarginPx = ymargin * height / fudge
  const imgHeight = Math.floor(height * (1 - 2 * ymargin / fudge))
  const imgWidth = Math.floor(width * (1 - 2 * xmargin / fudge))
  ctx.drawImage(tempCanvas, 0, 0, nx * 2, ny * 2,
    xmarginPx, ymarginPx, imgWidth, imgHeight)
}

export const ProcessDisplay = (ctx: CanvasRenderingContext2D,
  hiddenContext: CanvasRenderingContext2D,
  width: number, height: number) => {
  frameCount++
  ctx.imageSmoothingEnabled = true
  if (getGhosting()) {
    // Make a copy of the current canvas contents.
    const dx = xmargin * width
    const dy = ymargin * height
    ghostFrame = ctx.getImageData(dx, dy, width - 2 * dx, height - 2 * dy)
    ctx.clearRect(0, 0, width, height)
    // Draw the single previous frame with transparency
    ctx.putImageData(ghostFrame, dx, dy)
    const alpha = 0.3
    ctx.fillStyle = `rgba(0, 0, 0, ${alpha})`
    ctx.fillRect(dx, dy, width - 2 * dx, height - 2 * dy)
  } else {
    // Clear all our drawing and let the background show through again.
    ctx.clearRect(0, 0, width, height)
  }
  hiddenContext.imageSmoothingEnabled = false
  hiddenContext.fillStyle = "#000000"
  hiddenContext.fillRect(0, 0, 560, 384)
  const colorMode = getColorMode()
  let didDraw = processLoRes(hiddenContext, colorMode)
  didDraw = processHiRes(hiddenContext, colorMode) || didDraw
  if (getCrtDistortion()) {
    applyCrtDistortion(ctx, hiddenContext, colorMode, width, height)
  } else {
    if (didDraw) {
      drawImage(ctx, hiddenContext, width, height)
    }
    // The hidden canvas was causing overlay issues with the text page.
    // So instead, draw the graphics first and then overlay the text chars.
    processTextPage(ctx, hiddenContext, colorMode, width, height, false)
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
  const noBackgroundImage = isTouchDevice || isCanvasFullScreen || isMinimalTheme()
  xmargin = (isEmbedMode() && noBackgroundImage) ? 0.0 : (isTouchDevice ? 0.01 : 0.075)
  ymargin = (isEmbedMode() && noBackgroundImage) ? 0.0 : (isTouchDevice ? 0.01 : 0.075)
  const screenRatio = 1.4583334 // 1.33  // (20 * 40) / (24 * 24)
  if (TEST_GRAPHICS) {
    return [659, 452]  // This will give an actual size of 560 x 384
  }
  let width = window.innerWidth ? window.innerWidth : window.outerWidth
  let height = window.innerHeight ? window.innerHeight : (window.outerHeight - 150)
  if (isEmbedMode()) {
    height -= noBackgroundImage ? 60 : 25
    width -= noBackgroundImage ? 60 : 25
  } else if (isMinimalTheme()) {
    const isTouchDevice = "ontouchstart" in document.documentElement
    const isLandscape = isTouchDevice && (window.innerWidth > window.innerHeight)
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
      height -= noBackgroundImage ? 40 : 300
      width -= noBackgroundImage ? 0 : 40
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
