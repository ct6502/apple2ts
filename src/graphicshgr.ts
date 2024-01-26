import { COLOR_MODE } from "./emulator/utility/utility";
import { hgrAmberScreen, hgrGreenScreen, hgrRGBcolors, hgrWhiteScreen, loresAmber, loresColors, loresGreen, loresWhite } from "./graphicscolors";

const BLACK = 0
const WHITE = 3

/*
Reference: Sather, Understanding the Apple II, p. 8-20 - 8-21
Definitions: Screen is 280 pixels wide, or 560 "fine" pixels.
A fine pixel takes into account the half-position shift due to the 14 MHz
delay needed to produce the Blue and Orange colors.
Undelayed pattern = byte with high bit clear
Delayed pattern = byte with high bit set, produces a 14 MHz delay

Test pattern:
     normal  even/odd skip odd/even
HGR
CALL-151
2110: 01 81   40 80    00   40 80
2510: 01 81   40 80    00   40 80
2910: 01 81   40 80    00   40 80
2190: 02 82   C0 00    00   C0 00
2590: 02 82   C0 00    00   C0 00
2990: 02 82   C0 00    00   C0 00
2210: 03 83   C0 01    00   C0 01
2610: 03 83   C0 01    00   C0 01
2A10: 03 83   C0 01    00   C0 01
2290: 06 86   E0 00    00   E0 00
2690: 06 86   E0 00    00   E0 00
2A90: 06 86   E0 00    00   E0 00
2310: 0C 8C   A0 01    00   A0 01
2710: 0C 8C   A0 01    00   A0 01
2B10: 0C 8C   A0 01    00   A0 01
2390: AC 80 00 2C
2790: AC 80 00 2C
2B90: AC 80 00 2C
2038: A7 80 00 27
2438: A7 80 00 27
2838: A7 80 00 27
*/

const getHiresGreenSingleLine = (line: Uint8Array) => {
  const nbytes = line.length
  // Here we scale up from 7 regular pixels to 14 fine pixels
  const hgrColors1 = new Uint8Array(14 * nbytes).fill(BLACK);
  let bitSet = 0
  let prevHighBit = 1
  for (let i = 0; i < nbytes; i++) {
    const ioffset = i * 14
    const byte1 = line[i]
    const highBit = (byte1 & 128) ? 1 : 0
    for (let b = 0; b <= 6; b++) {
      // Adding the highBit produces the 14M delay (1 fine pixel)
      const ioff1 = ioffset + 2 * b + highBit
      // Sather p. 8-20: A delayed pattern (high bit set) extends the last dot
      // of a preceding undelayed pattern (no high bit) by a 14M period,
      // equivalent to 1 fine pixel.
      if (b === 0 && bitSet && highBit && !prevHighBit) hgrColors1[ioff1 - 1] = 1
      bitSet = (byte1 & (1 << b)) ? 1 : 0
      hgrColors1[ioff1] = bitSet
      // This fine pixel will definitely stay set if highBit = 0 (undelayed).
      // If highBit = 1, then this fine pixel might get unset (cut off) if the
      // next byte is undelayed.
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
  let skip = false
  let previousWhite = false
  const normalDelayMode = !noDelayMode
  for (let i = 0; i < nbytes; i++) {
    // We are filling in 1 byte (7 pixels = 14 fine pixels)
    const ioffset = i * 14
    const byte1 = line[i]
    const highBit = (byte1 & 0x80 && normalDelayMode) ? 1 : 0
    const nextByte = (i < (nbytes - 1)) ? line[i + 1] : (extendEdge ? byte1 : 0)
    const byte2bit0 = nextByte & 1
    const nextHighBit = nextByte & 0x80 && normalDelayMode
    const isEvenByte = 1 - (i % 2)
    const lastByte = (i === nbytes - 1)
    for (let b = 0; b <= 6; b++) {
      if (skip) {
        skip = false
        continue
      }
      const isEvenBit = isEvenByte ? (1 - (b % 2)) : (b % 2)
      const bit1 = byte1 & (1 << b)
      const bit2 = (b < 6) ? (byte1 & (1 << (b + 1))) : byte2bit0
      if (bit1) {
        const bit3 = (b < 5) ? (byte1 & (1 << (b + 2))) : (b === 5 ? byte2bit0 : (nextByte & 2))
        // Adding the highBit produces the 14M delay (1 fine pixel)
        const istart = ioffset + 2 * b + highBit
        // How many pixels do we fill in? If both bit1 and 3 are on, then
        // we could be doing a solid color like orange, etc. In this case
        // make it wide. But if bit3 is off, we're either doing a couple of
        // white pixels or a single color bit. In that case, make it narrow.
        let imax = istart + (bit3 ? 3 : 2)
        // If we're already doing white, first pixel is also white.
        // Otherwise, white starts with one pixel of the current bit's color
        // GREEN=1, VIOLET=2, ORANGE=5, BLUE=6
        let color1 = previousWhite ? WHITE : (1 + isEvenBit + 4 * highBit)
        let color2 = color1
        let color3 = 0
        if (bit2) {
          color2 = WHITE
          if (colorMode === COLOR_MODE.NOFRINGE && !previousWhite) color1 = BLACK
          // Fill in a couple extra pixels
          imax += 2
          color3 = 16 + isEvenBit + 2 * highBit
          previousWhite = true

          // Handle interactions between adjacent bytes (Sather 8-20)
          if (!lastByte && !bit3) {
            if (b === 5) {
              if (highBit && !nextHighBit) {
                // "cut off white with black to produce lores light magenta"
                // "cut off white with black to produce lores light blue-green"
                imax--
                color1 = isEvenByte ? 12 : 13
                color2 = color1
              }
            } else if (b === 6) {
              // bit2 is coming from the next byte
              if (highBit && !nextHighBit) {
                // Sather fig 8.10
                // "cut off blue with green to produce lores light blue-green"
                // "cut off orange with violet to produce lores light magenta"
                imax--
                color1 = isEvenByte ? 13 : 12
                color2 = color1
              }
            }
          }
        } else {
          // bit2 is off
          if (previousWhite) {
            color3 = 1 + isEvenBit + 4 * highBit
            imax--
          }
          previousWhite = false
          // Handle interactions between adjacent bytes (Sather 8-20)
          if (!lastByte && !bit3) {
            if (b === 5) {
              if (highBit && !nextHighBit && byte2bit0) {
                // Sather fig 8.10
                // "cut off orange, black with green to produce bright green"
                // "cut off blue, black with violet to produce bright violet"
                color2 = isEvenByte ? 14 : 15
                imax--
              }
            } else if (b === 6) {
              // bit2 is coming from the next byte
              if (highBit && !nextHighBit) {
                // Sather fig 8.10
                // "cut off blue with black to product lores dark blue"
                // "cut off orange with black to produce lores dark brown"
                color1 = isEvenByte ? 10 : 11
                color2 = color1
                imax--
              } else if (!highBit && nextHighBit) {
                // Sather fig 8.10, top row
                // "extend violet into lores light blue"
                // "extend green into lores yellow/light brown"
                imax -= 2
                hgrColors1[imax + 1] = isEvenByte ? 8 : 9
                hgrColors1[imax + 2] = hgrColors1[imax + 1]
                hgrColors1[imax + 3] = hgrColors1[imax + 1]
              }
            }
          }
        }
        hgrColors1[istart] = color1
        // Don't leak onto the next line
        imax = Math.min(imax, hgrColors1.length - 1)
        for (let ix = istart + 1; ix <= imax; ix++) {
          hgrColors1[ix] = color2
        }
        if (color2 === WHITE && color3 && imax < hgrColors1.length - 1) {
          hgrColors1[imax + 1] = color3
        }
        // We just processed 2 bits (4 fine pixels on the 560-pixel line)
        skip = true
      } else {
        // Even though our current pixel is black, handle bleed from previous
        // white color onto new color. This handles bytes like 0xAC or 0x2C.
        // if (previousWhite && bit2) {
        //   const color1 = 2 - isEvenBit + 4 * highBit
        //   hgrColors1[ioffset + 2 * b + highBit] = WHITE
        //   hgrColors1[ioffset + 2 * b + highBit + 1] = color1
        // }
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

const drawHiresImage = async (ctx: CanvasRenderingContext2D,
  hgrRGBA: Uint8ClampedArray, nlines: number, xpos: number, ypos: number, scale: number) => {
  const npixels = hgrRGBA.length / (4 * nlines)
  const imageData = new ImageData(hgrRGBA, npixels, nlines);
  // Use hidden canvas/context so we can change the canvas size and not
  // mess up our actual canvas.
  const hiddenCanvas = document.createElement('canvas')
  hiddenCanvas.width = npixels
  hiddenCanvas.height = nlines
  const hiddenContext = hiddenCanvas.getContext('2d')
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