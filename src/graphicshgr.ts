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
2110: 01 81   40 80    15   40 80
2510: 01 81   40 80    00   40 80
2910: 01 81   40 80    00   40 80
2D10: 02 82   C0 00    2A   C0 00
3110: 02 82   C0 00    00   C0 00
3510: 02 82   C0 00    00   C0 00
3910: 03 83   C0 01    95   C0 01
3D10: 03 83   C0 01    00   C0 01
2190: 03 83   C0 01    00   C0 01
2590: 06 86   E0 00    AA   E0 00
2990: 06 86   E0 00    00   E0 00
2D90: 06 86   E0 00    00   E0 00
3190: 0C 8C   A0 01    3E   A0 01
3590: 0C 8C   A0 01    00   A0 01
3990: 0C 8C   A0 01    00   A0 01
3D90: AC 80 00 2C
2210: AC 80 00 2C
2610: AC 80 00 2C
2A10: A7 80 00 27
2E10: A7 80 00 27
3210: A7 80 00 27
*/

const getHiresGreenSingleLine = (line: Uint8Array, fillColor: number) => {
  const nbytes = line.length
  // Here we scale up from 7 regular pixels to 14 fine pixels
  const hgrColors1 = new Uint8Array(14 * nbytes).fill(fillColor);
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

export const getHiresGreen = (hgrPage: Uint8Array, nlines: number, fillColor: number) => {
  const nbytes = hgrPage.length / nlines
  const hgrColors = new Uint8Array(14 * nbytes * nlines).fill(fillColor);
  for (let j = 0; j < nlines; j++) {
    const line = hgrPage.slice(j * nbytes, (j + 1) * nbytes)
    getHiresGreenSingleLine(line, fillColor)
    const hgrColors1 = getHiresGreenSingleLine(line, fillColor)
    hgrColors.set(hgrColors1, hgrColors1.length * j)
  }
  return hgrColors
}

const filterHiresSingleLine = (line: Uint8Array) => {
  const bits = new Uint8Array(line.length)
  for (let i = 0; i < line.length; i++) {
    bits[i] = (line[i] === WHITE) ? 1 : 0
  }
  // Key: W = white, - = black, ? = non-white color
  // Turn runs of 3 colors (in between white) to black
  // W???W  =>  W---W
  for (let i = 0; i < line.length - 4; i++) {
    if (bits[i] && !bits[i + 1] && !bits[i + 2] && !bits[i + 3] && bits[i + 4]) {
      bits[i + 1] = 1
      bits[i + 2] = 1
      bits[i + 3] = 1
      line[i + 1] = 0
      line[i + 2] = 0
      line[i + 3] = 0
      i += 3
    }
  }
  // Turn runs of 2 colors (in between white) to black
  // W??W  =>  W--W
  for (let i = 0; i < line.length - 3; i++) {
    if (bits[i] && !bits[i + 1] && !bits[i + 2] && bits[i + 3]) {
      bits[i + 1] = 1
      bits[i + 2] = 1
      line[i + 1] = 0
      line[i + 2] = 0
      i += 2
    }
  }
  // Turn a trailing fringe color to white
  // WW?  =>  WWW
  for (let i = 0; i < line.length - 3; i++) {
    if (bits[i] && bits[i + 1] &&
        (line[i + 2] !== BLACK && line[i + 2] !== WHITE) && line[i + 3] === 0) {
      bits[i + 2] = 1
      line[i + 2] = WHITE
      i += 3
    }
  }
  // Turn small runs of 2 colors (in between black) to white
  // -??-  =>  -WW-
  // for (let i = 0; i < line.length - 3; i++) {
  //   if (!line[i] && line[i + 1] && line[i + 2] && !line[i + 3]) {
  //     bits[i + 1] = 1
  //     bits[i + 2] = 1
  //     line[i + 1] = WHITE
  //     line[i + 2] = WHITE
  //     i += 2
  //   }
  // }
}

const getHiresLineNoFringe = (line: Uint8Array,
  noDelayMode: boolean, extendEdge: boolean, isEven: boolean) => {
  const nbytes = line.length
  const hgrColors1 = new Uint8Array(14 * nbytes).fill(BLACK);
  let skip = false
  let previousWhite = false
  const normalDelayMode = !noDelayMode
  let isEvenBit = isEven ? 1 : 0
  for (let i = 0; i < nbytes; i++) {
    // We are filling in 1 byte (7 pixels = 14 fine pixels)
    const ioffset = i * 14
    const byte1 = line[i]
    const highBit = (byte1 & 0x80 && normalDelayMode) ? 1 : 0
    const nextByte = (i < (nbytes - 1)) ? line[i + 1] : (extendEdge ? byte1 : 0)
    const highBitNext = (nextByte & 0x80 && normalDelayMode) ? 1 : 0
    const byte2bit0 = nextByte & 1
    let color1: number
    let color2: number

    for (let b = 0; b <= 6; b++) {
      if (skip) {
        skip = false
        isEvenBit = 1 - isEvenBit
        continue
      }
      // Adding the highBit produces the 14M delay (1 fine pixel)
      const istart = ioffset + 2 * b + highBit
      const bit1 = byte1 & (1 << b)
      const bit2 = (b < 6) ? (byte1 & (1 << (b + 1))) : byte2bit0
      if (bit1) {
        // We're going to process 2 bits (4 fine pixels on the 560-pixel line)
        skip = true
        const bit3 = (b < 5) ? (byte1 & (1 << (b + 2))) : (b === 5 ? byte2bit0 : (nextByte & 2))
        const highBit3 = (b < 5) ? highBit : highBitNext

        if (bit2) {
          previousWhite = true
          // Fill in a couple extra pixels
          hgrColors1[istart] = WHITE
          hgrColors1[istart + 1] = WHITE
          hgrColors1[istart + 2] = WHITE
          hgrColors1[istart + 3] = WHITE
          // If we switch from a low-bit byte to high-bit byte,
          // we will have a 1 fine pixel gap. To avoid this, fill it in.
          if (bit3 && ((istart + 4) < hgrColors1.length)) {
            hgrColors1[istart + 4] = WHITE
          }
        } else {
          // bit2 is off
          color1 = previousWhite ? WHITE : (1 + isEvenBit + 4 * highBit)
          hgrColors1[istart] = color1
          hgrColors1[istart + 1] = color1
          // How many pixels do we fill in? If both bit1 and 3 are on, then
          // we could be doing a solid color like orange, etc. In this case
          // make it wide. But if bit3 is off, make it narrow.
          if (bit3) {
            color2 = (1 + isEvenBit + 4 * highBit3)
            hgrColors1[istart + 2] = color2
            hgrColors1[istart + 3] = color2
            // If we switch from a low-bit byte to high-bit byte,
            // we will have a 1 fine pixel gap. To avoid this, fill it in.
            if ((istart + 4) < hgrColors1.length) {
              hgrColors1[istart + 4] = color2
            }
          }
          previousWhite = false
        }
      } else {
        // Fill in a gap between white colors with the previous color.
        if (bit2 && previousWhite) {
          // This is the previous bit color, not our current bit.
          color2 = (2 - isEvenBit + 4 * highBit)
          hgrColors1[istart] = color2
          hgrColors1[istart + 1] = color2
        }
        previousWhite = false
      }
      isEvenBit = 1 - isEvenBit
    }
  }
  return hgrColors1
}

const getHiresSingleLine = (line: Uint8Array, colorMode: COLOR_MODE,
  noDelayMode: boolean, extendEdge: boolean) => {
  const nbytes = line.length
  const hgrColors1 = new Uint8Array(14 * nbytes).fill(BLACK);
  let skip = false
  let previousWhite = false
  const normalDelayMode = !noDelayMode
  const noFringe = colorMode === COLOR_MODE.NOFRINGE
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
    let color1: number
    let color2: number

    for (let b = 0; b <= 6; b++) {
      if (skip) {
        skip = false
        continue
      }
      // Adding the highBit produces the 14M delay (1 fine pixel)
      const istart = ioffset + 2 * b + highBit
      const isEvenBit = isEvenByte ? (1 - (b % 2)) : (b % 2)
      const bit1 = byte1 & (1 << b)
      const bit2 = (b < 6) ? (byte1 & (1 << (b + 1))) : byte2bit0
      if (bit1) {
        // We're going to process 2 bits (4 fine pixels on the 560-pixel line)
        skip = true
        const bit3 = (b < 5) ? (byte1 & (1 << (b + 2))) : (b === 5 ? byte2bit0 : (nextByte & 2))
        // How many pixels do we fill in? If both bit1 and 3 are on, then
        // we could be doing a solid color like orange, etc. In this case
        // make it wide. But if bit3 is off, we're either doing a couple of
        // white pixels or a single color bit. In that case, make it narrow.
        let imax = istart + (bit3 ? 3 : 1)

        if (bit2) {

          // Handle interactions between adjacent bytes (Sather 8-20)
          if (!previousWhite && !lastByte && !bit3) {
            previousWhite = true
            if (b === 5) {
              if (highBit && !nextHighBit) {
                // Sather fig 8.10 row 4
                // "cut off white with black to produce lores light magenta"
                // "cut off white with black to produce lores light blue-green"
                color1 = isEvenByte ? 12 : 13
                hgrColors1.fill(color1, istart, istart + 3)
                continue
              }
            } else if (b === 6) {
              // bit2 is coming from the next byte
              if (highBit && !nextHighBit) {
                // Sather fig 8.10 row 3
                // "cut off blue with green to produce lores light blue-green"
                // "cut off orange with violet to produce lores light magenta"
                color1 = isEvenByte ? 13 : 12
                hgrColors1.fill(color1, istart, istart + 3)
                continue
              }
            }
          }

          previousWhite = true
          color1 = WHITE
          color2 = WHITE
          // Fill in a couple extra pixels
          imax += 2

        } else {
          // bit2 is off

          // Handle interactions between adjacent bytes (Sather 8-20)
          if (!previousWhite && !lastByte) {
            if (b === 5) {
              if (highBit && !nextHighBit && bit3) {
                // Sather fig 8.10 row 5
                // "cut off orange, black with green to produce bright green"
                // "cut off blue, black with violet to produce bright violet"
                color1 = isEvenByte ? 14 : 15
                hgrColors1.fill(color1, istart, istart + 3)
                continue
              }
            } else if (b === 6 && !bit3) {
              // bit2 is coming from the next byte
              if (highBit && !nextHighBit) {
                // Sather fig 8.10 row 2
                // "cut off blue with black to product lores dark blue"
                // "cut off orange with black to produce lores dark brown"
                color1 = isEvenByte ? 10 : 11
                hgrColors1[istart] = color1
                continue
              } else if (!highBit && nextHighBit) {
                // Sather fig 8.10 row 1
                // "extend violet into lores light blue"
                // "extend green into lores yellow/light brown"
                color1 = 1 + isEvenBit + 4 * highBit
                hgrColors1[istart] = color1
                color2 = isEvenByte ? 8 : 9
                hgrColors1[istart + 1] = color2
                hgrColors1[istart + 2] = color2
                continue
              }
            }
          }

          color1 = previousWhite ? WHITE : (1 + isEvenBit + 4 * highBit)
          color2 = (1 + isEvenBit + 4 * highBit)
          previousWhite = false
        }

        hgrColors1[istart] = color1
        // Don't leak onto the next line
        imax = Math.min(imax, hgrColors1.length - 1)
        for (let ix = istart + 1; ix <= imax; ix++) {
          hgrColors1[ix] = color2
        }
      } else {
        // Even though our current pixel is black, handle bleed from previous
        // white color onto new color. This handles bytes like 0xAC or 0x2C.
        if (previousWhite && bit2) {
          color1 = 2 - isEvenBit + 4 * highBit
          hgrColors1[ioffset + 2 * b + highBit] = noFringe ? color1 : 17 - isEvenBit + 2 * highBit
          hgrColors1[ioffset + 2 * b + highBit + 1] = color1
        }
        previousWhite = false
      }
    }
  }
  return hgrColors1
}


// const filterHiresSingleLine = (line: Uint8Array) => {
//   const bits = new Uint8Array(line.length)
//   for (let i = 0; i < line.length; i++) {
//     bits[i] = (line[i] === WHITE) ? 1 : 0
//   }
//   // Key: W = white, - = black, ? = non-white color
//   // Turn runs of 3 colors (in between white) to black
//   // W???W  =>  W---W
//   for (let i = 0; i < line.length - 4; i++) {
//     if (bits[i] && !bits[i + 1] && !bits[i + 2] && !bits[i + 3] && bits[i + 4]) {
//       bits[i + 1] = 1
//       bits[i + 2] = 1
//       bits[i + 3] = 1
//       line[i + 1] = 0
//       line[i + 2] = 0
//       line[i + 3] = 0
//       i += 3
//     }
//   }
//   // Turn runs of 2 colors (in between white) to black
//   // W??W  =>  W--W
//   for (let i = 0; i < line.length - 3; i++) {
//     if (bits[i] && !bits[i + 1] && !bits[i + 2] && bits[i + 3]) {
//       bits[i + 1] = 1
//       bits[i + 2] = 1
//       line[i + 1] = 0
//       line[i + 2] = 0
//       i += 2
//     }
//   }
//   // Turn a trailing fringe color to white
//   // WW?  =>  WWW
//   for (let i = 0; i < line.length - 3; i++) {
//     if (bits[i] && bits[i + 1] &&
//         (line[i + 2] !== BLACK && line[i + 2] !== WHITE) && line[i + 3] === 0) {
//       bits[i + 2] = 1
//       line[i + 2] = WHITE
//       i += 3
//     }
//   }
//   // Turn small runs of 2 colors (in between black) to white
//   // -??-  =>  -WW-
//   // for (let i = 0; i < line.length - 3; i++) {
//   //   if (!line[i] && line[i + 1] && line[i + 2] && !line[i + 3]) {
//   //     bits[i + 1] = 1
//   //     bits[i + 2] = 1
//   //     line[i + 1] = WHITE
//   //     line[i + 2] = WHITE
//   //     i += 2
//   //   }
//   // }
// }


export const getHiresColors = (
  hgrPage: Uint8Array,
  nlines: number,
  colorMode: COLOR_MODE,
  noDelayMode: boolean,
  extendEdge: boolean,
  isEven: boolean,
  fillColor: number) => {
  const nbytes = hgrPage.length / nlines
  const hgrColors = new Uint8Array(14 * nlines * nbytes).fill(fillColor)
  for (let j = 0; j < nlines; j++) {
    const line = hgrPage.slice(j * nbytes, (j + 1) * nbytes)
    let hgrColors1: Uint8Array = new Uint8Array()
    if (colorMode === COLOR_MODE.NOFRINGE) {
      hgrColors1 = getHiresLineNoFringe(line, noDelayMode, extendEdge, isEven)
      filterHiresSingleLine(hgrColors1)
    } else {
      hgrColors1 = getHiresSingleLine(line, colorMode, noDelayMode, extendEdge)
    }
    hgrColors.set(hgrColors1, hgrColors1.length * j)
  }
  return hgrColors
}

export const convertColorsToRGBA = (hgrColors: Uint8Array, colorMode: COLOR_MODE, doubleRes: boolean) => {
  const hgrRGBA = new Uint8ClampedArray(4 * hgrColors.length).fill(255);
  const colors = doubleRes ?
    [loresColors, loresColors, loresGreen, loresAmber, loresWhite, loresWhite][colorMode] :
    [hgrRGBcolors, hgrRGBcolors, hgrGreenScreen, hgrAmberScreen, hgrWhiteScreen, hgrWhiteScreen][colorMode]
  for (let i = 0; i < hgrColors.length; i++) {
    const colorBit = colorMode == COLOR_MODE.INVERSEBLACKANDWHITE ? hgrColors[i] == 0 ? 1 : 0 : hgrColors[i]
    hgrRGBA[4 * i] = colors[colorBit][0]
    hgrRGBA[4 * i + 1] = colors[colorBit][1]
    hgrRGBA[4 * i + 2] = colors[colorBit][2]
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
  xpos: number, ypos: number, scale: number, isEven: boolean) => {
  if (pixels.length === 0) return;
  const isColor = colorMode === COLOR_MODE.COLOR || colorMode === COLOR_MODE.NOFRINGE
  const fillColor = colorMode === COLOR_MODE.INVERSEBLACKANDWHITE ? WHITE : BLACK
  const hgrColors = isColor ? getHiresColors(pixels, nlines, colorMode, false, true, isEven, fillColor) :
    getHiresGreen(pixels, nlines, fillColor)
  const hgrRGBA = convertColorsToRGBA(hgrColors, colorMode, false)
  drawHiresImage(ctx, hgrRGBA, nlines, xpos, ypos, scale)
}