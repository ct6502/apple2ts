import { doSetMachineName, doSetRunMode, resetCpuSpeedForTesting } from "./motherboard"
import { getShr, isIigsAuxLinear } from "./memory"
import { SWITCHES } from "./softswitches"
import { doSetEmuDriveNewData } from "./devices/drivestate"
import { RUN_MODE } from "../common/utility"
import { setIsTesting } from "./worker2main"
import * as fs from "fs"

// GS/OS 6.0.1 on the Apple IIgs: cold boot the 65816, let the SmartPort hard
// drive in slot 7 drive 1 boot ProDOS -> START.GS.OS, and confirm GS/OS gets
// all the way to the Super Hi-Res Finder desktop.
//
// This is the end-to-end regression test for the IIgs boot path. The browser
// build used to stall on the GS/OS welcome screen because a stale
// cpu.irqPending survived between VBL windows; the emulator now re-evaluates
// the level-driven $C046 IRQ line every instruction.
const PO_PATH = process.env.GSBOOT_PO || "C:\\dev\\emu\\ap2\\GSOS601.po"
const FRAMES = Number(process.env.GSBOOT_FRAMES || 4000)
const OUT_BMP = process.env.GSBOOT_OUT || "gsos_boot.bmp"

// Super Hi-Res page 1 scan control byte table offset.
const SHR_SCB_OFFSET = 0x7D00

const saveShrToBmp = (shrData: Uint8Array, filepath: string) => {
  const width = 640, height = 200
  const palR = new Uint8Array(256), palG = new Uint8Array(256), palB = new Uint8Array(256)
  for (let p = 0; p < 16; p++) {
    const pOffset = 0x7E00 + p * 32
    for (let c = 0; c < 16; c++) {
      const idx = (p << 4) | c
      const colorWord = shrData[pOffset + c * 2] | (shrData[pOffset + c * 2 + 1] << 8)
      palR[idx] = ((colorWord >> 8) & 0x0F) * 17
      palG[idx] = ((colorWord >> 4) & 0x0F) * 17
      palB[idx] = (colorWord & 0x0F) * 17
    }
  }
  const rowSize = width * 4, pixelArraySize = rowSize * height, fileSize = 54 + pixelArraySize
  const bmp = Buffer.alloc(fileSize)
  bmp.write("BM", 0)
  bmp.writeUInt32LE(fileSize, 2)
  bmp.writeUInt32LE(54, 10)
  bmp.writeUInt32LE(40, 14)
  bmp.writeInt32LE(width, 18)
  bmp.writeInt32LE(-height, 22)
  bmp.writeUInt16LE(1, 26)
  bmp.writeUInt16LE(32, 28)
  bmp.writeUInt32LE(0, 30)
  bmp.writeUInt32LE(pixelArraySize, 34)
  for (let y = 0; y < height; y++) {
    const lineOffset = y * 160
    const scb = shrData[SHR_SCB_OFFSET + y]
    const palIdx = (scb & 0x0F) << 4
    const is640 = (scb & 0x80) !== 0
    const rowOffset = 54 + y * rowSize
    if (!is640) {
      for (let x = 0; x < 320; x++) {
        const byteVal = shrData[lineOffset + (x >> 1)]
        const color4Bit = (x & 1) ? (byteVal & 0x0F) : ((byteVal >> 4) & 0x0F)
        const c = palIdx | color4Bit
        const px1 = rowOffset + (x * 2) * 4
        bmp[px1] = palB[c]; bmp[px1 + 1] = palG[c]; bmp[px1 + 2] = palR[c]; bmp[px1 + 3] = 255
        const px2 = px1 + 4
        bmp[px2] = palB[c]; bmp[px2 + 1] = palG[c]; bmp[px2 + 2] = palR[c]; bmp[px2 + 3] = 255
      }
    } else {
      const quarterOffsets = [8, 12, 0, 4]
      for (let x = 0; x < 640; x++) {
        const byteVal = shrData[lineOffset + (x >> 2)]
        const shift = (3 - (x & 3)) * 2
        const color2Bit = (byteVal >> shift) & 0x03
        const c = palIdx | quarterOffsets[x & 3] + color2Bit
        const px = rowOffset + x * 4
        bmp[px] = palB[c]; bmp[px + 1] = palG[c]; bmp[px + 2] = palR[c]; bmp[px + 3] = 255
      }
    }
  }
  fs.writeFileSync(filepath, bmp)
  console.log(`Saved ${filepath}`)
}

test(`Apple IIgs boots GS/OS 6.0.1 from ${PO_PATH}`, () => {
  jest.useFakeTimers()
  setIsTesting()
  try {
    doSetMachineName("APPLE2GS")

    const data = fs.readFileSync(PO_PATH)
    const filename = PO_PATH.split("\\").pop() || "GSOS601.po"
    const props: DriveProps = {
      index: 0,
      hardDrive: true,
      drive: 1,
      filename,
      status: "",
      motorRunning: false,
      diskHasChanges: false,
      isWriteProtected: false,
      diskData: new Uint8Array(data),
      lastAppleWriteTime: 0,
      cloudData: null,
      writableFileHandle: null,
      lastLocalFileWriteTime: 0,
    }
    expect(doSetEmuDriveNewData(props)).toBe(true)

    doSetRunMode(RUN_MODE.NEED_BOOT)
    doSetRunMode(RUN_MODE.RUNNING, false)

    for (let f = 0; f < FRAMES; f++) {
      jest.advanceTimersByTime(17)
    }

    console.log(`TEXT=${SWITCHES.TEXT.isSet} HIRES=${SWITCHES.HIRES.isSet} 80COL=${SWITCHES.COLUMN80.isSet}`)

    // Read the SHR page exactly the way the renderer does. Reading megaIIAux
    // directly is wrong as soon as SHR linearizes the aux window, and that is
    // what made this test report a uniform grey screen while the emulator was
    // drawing a real desktop - and, before the linearization fix, vice versa.
    const shr = getShr()
    console.log(`getShr() length=${shr.length} isIigsAuxLinear=${isIigsAuxLinear()}`)
    // processSuperHiRes() bails out entirely on a short buffer, which is how a
    // black Super Hi-Res screen happens. Assert the length first.
    expect(shr.length).toBe(32768)

    const decode = (shrData: Uint8Array) => {
      const px = new Uint8Array(640 * 200 * 3)
      for (let y = 0; y < 200; y++) {
        const scb = shrData[SHR_SCB_OFFSET + y]
        const palIdx = (scb & 0x0f) << 4
        const is640 = (scb & 0x80) !== 0
        for (let x = 0; x < 640; x++) {
          let colorIndex: number
          if (is640) {
            const byteVal = shrData[y * 160 + (x >> 2)]
            const shift = (3 - (x & 3)) * 2
            colorIndex = palIdx | ([8, 12, 0, 4][x & 3] + (((byteVal >> shift) & 3)))
          } else {
            const byteVal = shrData[y * 160 + (x >> 1)]
            colorIndex = palIdx | ((x & 1) ? (byteVal & 0x0f) : ((byteVal >> 4) & 0x0f))
          }
          const pOff = 0x7e00 + (colorIndex >> 4) * 32 + (colorIndex & 0x0f) * 2
          const w = shrData[pOff] | (shrData[pOff + 1] << 8)
          const o = (y * 640 + x) * 3
          px[o] = ((w >> 8) & 0x0f) * 17
          px[o + 1] = ((w >> 4) & 0x0f) * 17
          px[o + 2] = (w & 0x0f) * 17
        }
      }
      return px
    }
    const px = decode(shr)
    saveShrToBmp(shr, OUT_BMP)

    // A blank or single-colour screen satisfies "non-zero bytes > 30000" and
    // "row 0 and row 199 are non-zero", which is why this test passed while the
    // emulator showed nothing but a flat field. Assert on the decoded picture.
    const colours = new Set<string>()
    for (let i = 0; i < px.length; i += 3) colours.add(`${px[i]},${px[i + 1]},${px[i + 2]}`)
    console.log(`decoded distinct colours: ${colours.size}`)
    const scanlineColours = (y: number) => {
      const s = new Set<string>()
      for (let x = 0; x < 640; x++) {
        const o = (y * 640 + x) * 3
        s.add(`${px[o]},${px[o + 1]},${px[o + 2]}`)
      }
      return s
    }
    const scbSet = new Set<number>()
    for (let y = 0; y < 200; y++) scbSet.add(shr[SHR_SCB_OFFSET + y])
    console.log(`distinct SCB values: ${scbSet.size}; menu-bar row 0 colours: ${scanlineColours(0).size}; bottom row 199 colours: ${scanlineColours(199).size}`)

    // The Finder desktop: many colours, several palettes in use, and a menu bar
    // along the top and a trash can along the bottom that are not flat fills.
    expect(colours.size).toBeGreaterThan(8)
    expect(scbSet.size).toBeGreaterThan(1)
    // The Finder leaves row 0 as the black border above its menu bar, so check
    // the whole menu-bar band rather than a single row: it must carry the
    // File/Edit/... titles, i.e. both the bar colour and ink.
    const topBandColours = new Set<string>()
    for (let y = 0; y < 16; y++) for (const c of scanlineColours(y)) topBandColours.add(c)
    console.log(`menu-bar band colours: ${topBandColours.size}`)
    expect(topBandColours.size).toBeGreaterThan(2)
    expect(scanlineColours(199).size).toBeGreaterThan(1)
    // Real ink on the screen: the menu bar titles and the disk icons are black.
    // A stalled or blanked boot has none, even though it still fills the buffer.
    let darkPixels = 0
    for (let i = 0; i < px.length; i += 3) {
      if (px[i] + px[i + 1] + px[i + 2] < 192) darkPixels++
    }
    console.log(`dark pixels: ${darkPixels}`)
    expect(darkPixels).toBeGreaterThan(500)

    // And log the band so a regression names the colours it lost.
    console.log(`top band colours: ${Array.from(topBandColours).join(" / ")}`)
  } finally {
    doSetRunMode(RUN_MODE.PAUSED, false)
    resetCpuSpeedForTesting()
    jest.useRealTimers()
  }
})
