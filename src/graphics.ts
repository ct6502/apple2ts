import { handleGetAltCharSet, handleGetTextPage,
  handleGetLores, handleGetHires } from "./main2worker"
import { getPrintableChar, COLOR_MODE } from "./emulator/utility"
const xmargin = 0.075
const ymargin = 0.075
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

const processTextPage = (ctx: CanvasRenderingContext2D, colorMode: COLOR_MODE,
  width: number, height: number) => {
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
      const v = String.fromCharCode(v1 < 127 ? v1 : v1 === 0x83 ? 0xEBE7 : (v1 + 0xE000))
      ctx.fillStyle = colorFill
      if (doInverse) {
        // Inverse characters
        ctx.fillRect(xmarginPx + i*cwidth, ymarginPx + j*cheight, 1.08*cwidth, 1.03*cheight);
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

const processLoRes = (ctx: CanvasRenderingContext2D,
  hiddenContext: CanvasRenderingContext2D,
  colorMode: COLOR_MODE, width: number, height: number) => {
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
  drawImage(ctx, hiddenContext, hgrRGBA, width, height)
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
    const joffsetMax = (j + 1) * 560 - 1
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
          // Don't leak onto the next line
          if (imax > joffsetMax) imax = joffsetMax
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

const drawImage = async (ctx: CanvasRenderingContext2D,
  hiddenContext: CanvasRenderingContext2D,
  hgrRGBA: Uint8ClampedArray, width: number, height: number) => {
  const xmarginPx = xmargin * width
  const ymarginPx = ymargin * height
  const nlines = hgrRGBA.length / (4 * 560)
  const imageData = new ImageData(hgrRGBA, 560, nlines);
  const imgHeight = height * (1 - 2 * ymargin) / 192 * nlines
  const imgWidth = width - 2 * xmarginPx
  // Use hidden canvas/context so image rescaling works in iOS < 15
  hiddenContext.putImageData(imageData, 0, 0)
  ctx.drawImage(hiddenContext.canvas, 0, 0, 560, nlines,
    xmarginPx, ymarginPx, imgWidth, imgHeight);
// New way, using createImageBitmap, available in iOS 15+
//  ctx.drawImage(await createImageBitmap(imageData), 0, 0, 560, nlines,
//    xmarginPx, ymarginPx, imgWidth, imgHeight);
}

const processHiRes = (ctx: CanvasRenderingContext2D,
  hiddenContext: CanvasRenderingContext2D,
  colorMode: COLOR_MODE, width: number, height: number) => {
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
  drawImage(ctx, hiddenContext, hgrRGBA, width, height)
};

export const processDisplay = (ctx: CanvasRenderingContext2D,
  hiddenContext: CanvasRenderingContext2D, colorMode: COLOR_MODE,
  width: number, height: number) => {
  frameCount++
  ctx.imageSmoothingEnabled = false;
  ctx.fillStyle = "#000000";
  ctx.fillRect(xmargin * width, ymargin * height - 1,
    width * (1 - 2 * xmargin) + 2, height * (1 - 2 * ymargin) + 3);
  processTextPage(ctx, colorMode, width, height)
  processLoRes(ctx, hiddenContext, colorMode, width, height)
  processHiRes(ctx, hiddenContext, colorMode, width, height)
}

