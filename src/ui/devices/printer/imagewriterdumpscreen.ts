import { receiveCommData } from "../serial/serialhub"

const esc = (...cmds: (string | number)[]): Uint8Array => {
  const result: number[] = []
  for (const cmd of cmds) {
    if (typeof cmd === "string") {
      result.push(27, ...cmd.split("").map(c => c.charCodeAt(0)))
    } else {
      result.push(cmd)
    }
  }
  return new Uint8Array(result)
}

type COLOR =
{
  name: string
  color: string
  rgb: [number, number, number]
  pen1: number
  pen2: number
}

// const loresHex: string[] = [
//   "#000000", //black -> Black
//   "#DD0033", //red -> Orange+Purple
//   "#000099", //dk blue -> Black+Purple
//   "#DD22DD", //purple -> Magenta
//   "#007722", //dk green -> Green
//   "#555555", //gray -> Green+Purple
//   "#2222FF", //med blue -> Cyan+Purple
//   "#66AAFF", //lt blue -> Magenta+Cyan
//   "#885500", //brown -> Black+Orange
//   "#FF6600", //orange -> Orange
//   "#AAAAAA", //grey -> Yellow+Purple
//   "#FF9988", //pink -> Yellow+Magenta
//   "#11DD00", //lt green -> Green
//   "#FFFF00", //yellow -> Yellow
//   "#4AFDC5", //aqua -> Yellow+Cyan
//   "#FFFFFF"] //white -> Yellow+Magenta

const combinePens: Array<COLOR> = [
  {name: "White", color: "#FFFFFF", rgb: [255, 255, 255], pen1: -1, pen2: -1},
  {name: "Black", color: "#000000", rgb: [0, 0, 0], pen1: 0, pen2: 0},
  {name: "Yellow", color: "#FFFF00", rgb: [255, 255, 0], pen1: 1, pen2: -1},
  {name: "Red", color: "#DD0033", rgb: [221, 0, 51], pen1: 2, pen2: 2},
  {name: "Blue", color: "#0000CC", rgb: [0, 0, 204], pen1: 3, pen2: 3},
  {name: "Orange", color: "#FF6600", rgb: [255, 102, 0], pen1: 4, pen2: -1},
  {name: "Green", color: "#009900", rgb: [0, 153, 0], pen1: 5, pen2: -1},
  {name: "Purple", color: "#990099", rgb: [153, 0, 153], pen1: 6, pen2: -1},
  {name: "Gray", color: "#555555", rgb: [85, 85, 85], pen1: 0, pen2: -1},
  {name: "Dark Blue", color: "#000099", rgb: [0, 0, 153], pen1: 0, pen2: 3},
  {name: "Pink", color: "#FF9988", rgb: [255, 153, 136], pen1: 2, pen2: -1},
  {name: "Gray2", color: "#AAAAAA", rgb: [170, 170, 170], pen1: 0, pen2: -1},
  {name: "Light Blue", color: "#66AAFF", rgb: [102, 170, 255], pen1: 3, pen2: -1},
  {name: "Brown", color: "#773e00", rgb: [119, 62, 0], pen1: 0, pen2: 4},
  {name: "Aqua", color: "#4AFDC5", rgb: [74, 253, 197], pen1: 3, pen2: 5},
  {name: "Dark Green", color: "#007722", rgb: [0, 119, 34], pen1: 5, pen2: 5},
]
const findClosestColorIndex = (r: number, g: number, b: number, inverse = false): number => {
  let index = 0
    const brightness = (r + g + b) / 3
  // Find the closet matching color index for the pixel
  if (brightness > 240) {
    index = inverse ? 1 : 0
  } else if (brightness < 15) {
    index = inverse ? 0 : 1
  } else {
    // We need to find the closest color in the colors array
    // using simple Euclidean distance in RGB space
    let minDistance = 10000
    for (let i = 0; i < combinePens.length; i++) {
      const [cr, cg, cb] = combinePens[i].rgb
      const distance = Math.sqrt((r - cr) ** 2 + (g - cg) ** 2 + (b - cb) ** 2)
      if (distance < minDistance) {
        minDistance = distance
        index = i
      }
    }
  }
  return index
}

export const imagewriterDumpScreen = async (inverse = false) => {
  // Take the Apple II screen canvas and send it to the serial printer
  const canvas = document.getElementById("hiddenCanvas") as HTMLCanvasElement
  // get the 560 x 384 pixel data from the canvas
  const context = canvas.getContext("2d")
  if (!context) return
  const imageData = context.getImageData(0, 0, 560, 384)
  const pixels = imageData.data as Uint8ClampedArray
  // Dumping the hi-res screen to the printer:
  // divide the screen into 8-pixel-high rows, and for each row,
  // transmit the graphics control code ("ESC g070"), followed by the
  // dot-column data for the row.
  // <ESC>+n to switch to Extended Pitch (72 dpi, 576 pixels wide)
  // <ESC>+T16 to set the line spacing to 16/144 inch for 8-pixel-high rows
  // <ESC>+> to switch to unidirectional mode
  const controlSetup = esc(13, "n", "T16", ">")
  receiveCommData(controlSetup)
  const nDotsPerColor: Array<number> = new Array(combinePens.length).fill(0)

  for (let row = 0; row < 48; row++) {
    for (let pass = 0; pass < 2; pass++) {
      for (let color = 0; color < 7; color++) {
        const rowData = new Array(560).fill(0)
        let hasColor = false
        for (let bit = 0; bit < 8; bit++) {
          // For each color, create a row of indices for the 560 pixels in that row,
          // where each index is 0-6 for the color.
          for (let col = 0; col < 560; col++) {
            const pixelIndex = ((row * 8 + bit) * 560 + col) * 4
            const r = pixels[pixelIndex]
            const g = pixels[pixelIndex + 1]
            const b = pixels[pixelIndex + 2]
            const index = findClosestColorIndex(r, g, b, inverse)
            const pen = pass ? combinePens[index].pen2 : combinePens[index].pen1
            if (pen === color) {
              hasColor = true
              nDotsPerColor[index]++
              rowData[col] |=  (1 << bit)
            }
          }
        }
        if (!hasColor) continue
        // Send the control code and row data to the printer
        // Send <ESC>+g070 to set the graphics mode for 70 * 8 = 560 pixels
        const controlCode = esc(`K${String.fromCharCode(color + 48)}`, "g070")
        const rowBytes = new Uint8Array(rowData)
        const dataToSend = new Uint8Array(controlCode.length + rowBytes.length)
        dataToSend.set(controlCode, 0)
        dataToSend.set(rowBytes, controlCode.length)
        receiveCommData(dataToSend)
      }
    }
    // Send <Ctrl>+J to advance to the next line
    receiveCommData(new Uint8Array([10]))
  }
  // Print to console the number of dots printed for each color
  for (let i = 0; i < combinePens.length; i++) {
    console.log(`Dots printed for ${combinePens[i].name}: ${nDotsPerColor[i]}`)
  }
  // Send the control codes to reset the printer to default settings
  // <ESC>+E to switch back to default Elite pitch (96 dpi)
  // <ESC>+A to set the line spacing to default 24/144 inch
  // <ESC>+K0 to reset to black color
  // <ESC>+< to switch back to bidirectional mode
  const controlFinish = esc("E", "A", "K0", "<")
  receiveCommData(controlFinish)
}
