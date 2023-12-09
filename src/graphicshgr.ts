import { COLOR_MODE } from "./emulator/utility/utility";
import { hgrAmberScreen, hgrGreenScreen, hgrRGBcolors, hgrWhiteScreen, loresAmber, loresColors, loresGreen, loresWhite } from "./graphicscolors";

const BLACK = 0
const WHITE = 3

const getHiresGreenSingleLine = (line: Uint8Array) => {
  const nbytes = line.length
  const hgrColors1 = new Uint8Array(14 * nbytes).fill(BLACK);
  let bitSet = 0
  let prevHighBit = 1
  for (let i = 0; i < nbytes; i++) {
    const ioffset = i * 14
    const byte1 = line[i]
    const highBit = (byte1 & 128) ? 1 : 0
    for (let b = 0; b <= 6; b++) {
      const ioff1 = ioffset + 2 * b + highBit
      if (b === 0 && bitSet && highBit && !prevHighBit) hgrColors1[ioff1 - 1] = 1
      bitSet = (byte1 & (1 << b)) ? 1 : 0
      hgrColors1[ioff1] = bitSet
      hgrColors1[ioff1 + 1] = bitSet
    }
    prevHighBit = highBit
  }
  return hgrColors1
}

export const getHiresGreen = (hgrPage: Uint8Array, nlines: number) => {
  const nbytes = hgrPage.length / nlines
  const hgrColors = new Uint8Array(14 * nbytes * nlines).fill(BLACK);
  for (let j = 0; j < nlines; j++) {
    const line = hgrPage.slice(j * nbytes, (j + 1) * nbytes)
    getHiresGreenSingleLine(line)
    const hgrColors1 = getHiresGreenSingleLine(line)
    hgrColors.set(hgrColors1, hgrColors1.length * j)
  }
  return hgrColors
}

const getHiresSingleLine = (line: Uint8Array, colorMode: COLOR_MODE,
  noDelayMode: boolean, extendEdge: boolean) => {
  const nbytes = line.length
  const hgrColors1 = new Uint8Array(14 * nbytes).fill(BLACK);
  let isEven = 1
  let skip = false
  let previousWhite = false
  for (let i = 0; i < nbytes; i++) {
    const ioffset = i * 14
    const byte1 = line[i]
    const highBit = (byte1 & 0x80 && !noDelayMode) ? 1 : 0
    const nextByte = (i < (nbytes - 1)) ? line[i + 1] : (extendEdge ? byte1 : 0)
    const byte2bit0 = nextByte & 1
    const nextHighBit = nextByte & 0x80 && !noDelayMode
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
              hgrColors1[imax + 1] = 9 - isEven
              hgrColors1[imax + 2] = 9 - isEven
            } else if (highBit && !nextHighBit) {
              imax--
              color2 = 13 - isEven
              hgrColors1[istart++] = color1
              hgrColors1[istart++] = color1
            }
          }
        } else {
          previousWhite = false
          // Handle interactions between adjacent bytes (ALCB p. 208)
          if (b === 6) {
            if (!highBit && nextHighBit) {
              imax -= 2
              hgrColors1[imax + 1] = isEven + 8
              hgrColors1[imax + 2] = isEven + 8
              hgrColors1[imax + 3] = isEven + 8
            } else if (highBit && !nextHighBit) {
              color1 = isEven + 12
              color2 = color1
              imax--
            }
          }
        }
        hgrColors1[istart] = color1
        // Don't leak onto the next line
        imax = Math.min(imax, hgrColors1.length - 1)
        for (let ix = istart + 1; ix <= imax; ix++) {
          hgrColors1[ix] = color2
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
  return hgrColors1
}

export const getHiresColors = (hgrPage: Uint8Array, nlines: number,
  colorMode: COLOR_MODE, noDelayMode: boolean, extendEdge: boolean) => {
  const nbytes = hgrPage.length / nlines
  const hgrColors = new Uint8Array(14 * nlines * nbytes).fill(BLACK)
  for (let j = 0; j < nlines; j++) {
    const line = hgrPage.slice(j * nbytes, (j + 1) * nbytes)
    const hgrColors1 = getHiresSingleLine(line, colorMode, noDelayMode, extendEdge)
    hgrColors.set(hgrColors1, hgrColors1.length * j)
  }
  return hgrColors
}

export const convertColorsToRGBA = (hgrColors: Uint8Array, colorMode: COLOR_MODE, doubleRes: boolean) => {
  const hgrRGBA = new Uint8ClampedArray(4 * hgrColors.length).fill(255);
  const colors = doubleRes ?
    [loresColors, loresColors, loresGreen, loresAmber, loresWhite][colorMode] :
    [hgrRGBcolors, hgrRGBcolors, hgrGreenScreen, hgrAmberScreen, hgrWhiteScreen][colorMode]
  for (let i = 0; i < hgrColors.length; i++) {
    hgrRGBA[4 * i] = colors[hgrColors[i]][0]
    hgrRGBA[4 * i + 1] = colors[hgrColors[i]][1]
    hgrRGBA[4 * i + 2] = colors[hgrColors[i]][2]
  }
  return hgrRGBA
}

let hiddenContext: CanvasRenderingContext2D | null = null

const drawHiresImage = async (ctx: CanvasRenderingContext2D,
  hgrRGBA: Uint8ClampedArray, nlines: number, xpos: number, ypos: number, scale: number) => {
  const npixels = hgrRGBA.length / (4 * nlines)
  const imageData = new ImageData(hgrRGBA, npixels, nlines);
  // Use hidden canvas/context so image rescaling works in iOS < 15
  if (!hiddenContext) {
    const hiddenCanvas = document.createElement('canvas')
    // If we ever have more than a 2x2 tile grid we will need to increase this.
    hiddenCanvas.width = 56
    hiddenCanvas.height = 32
    hiddenContext = hiddenCanvas.getContext('2d')
  }
  if (hiddenContext) {
    hiddenContext.putImageData(imageData, 0, 0)
    ctx.drawImage(hiddenContext.canvas, 0, 0, npixels, nlines,
      xpos, ypos, npixels * scale / 2, nlines * scale);
  }
}

export const drawHiresTile = (ctx: CanvasRenderingContext2D,
  pixels: Uint8Array, colorMode: COLOR_MODE, nlines: number,
  xpos: number, ypos: number, scale: number) => {
  if (pixels.length === 0) return;
  const isColor = colorMode === COLOR_MODE.COLOR || colorMode === COLOR_MODE.NOFRINGE
  const hgrColors = isColor ? getHiresColors(pixels, nlines, colorMode, false, true) :
    getHiresGreen(pixels, nlines)
  const hgrRGBA = convertColorsToRGBA(hgrColors, colorMode, false)
  drawHiresImage(ctx, hgrRGBA, nlines, xpos, ypos, scale)
}