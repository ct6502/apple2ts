import { doSetMachineName, doSetRunMode, resetCpuSpeedForTesting } from "./motherboard"
import {
  doSetRom, getShr, getIigsMousePos, gsSystemROM, isIigsRom03, isIigsShrActive,
  memGet24, setIigsRomVersion,
} from "./memory"
import { doSetEmuDriveNewData } from "./devices/drivestate"
import { MouseCardEvent, resetMouse, resetADBTracking, iigsMouseStep } from "./devices/mouse"
import { RUN_MODE } from "../common/utility"
import { setIsTesting } from "./worker2main"
import * as fs from "fs"

// Apple IIgs ROM 03 (256 KB, banks $FC-$FF). The second system ROM the ROM 01
// machine never exercised: four banks instead of two, a different cold-start
// value in $C036, an IWM power-on self-test that probes the 5.25" sense lines,
// and a different place for the live cursor. The last bank is the
// IIe-compatibility image the language-card window reads.
const PO_PATH = process.env.GSBOOT_PO || "C:\\dev\\emu\\ap2\\GSOS601.po"
const FRAMES = Number(process.env.GSBOOT_FRAMES || 4000)

const SHR_SCB_OFFSET = 0x7D00

const bootGsos = () => {
  doSetEmuDriveNewData({
    index: 0, hardDrive: true, drive: 1, filename: "GSOS601.po",
    status: "", motorRunning: false, diskHasChanges: false,
    isWriteProtected: false, diskData: new Uint8Array(fs.readFileSync(PO_PATH)),
    lastAppleWriteTime: 0, cloudData: null, writableFileHandle: null,
    lastLocalFileWriteTime: 0,
  } as DriveProps)
  doSetRunMode(RUN_MODE.NEED_BOOT)
  doSetRunMode(RUN_MODE.RUNNING, false)
  for (let f = 0; f < FRAMES; f++) jest.advanceTimersByTime(17)
}

test("ROM 03 maps four ROM banks and resets through the last bank's vector", () => {
  try {
    setIigsRomVersion("03")
    doSetRom("APPLE2GS")
    expect(isIigsRom03()).toBe(true)
    expect(gsSystemROM.length).toBe(0x40000)

    // Every bank answers from its own 64 KB slice of the image.
    for (let bank = 0xFC; bank <= 0xFF; bank++) {
      expect(memGet24((bank << 16) | 0x1234)).toBe(gsSystemROM[((bank - 0xFC) << 16) | 0x1234])
    }
    // $FF:FFFC is the reset vector; ROM 03's image holds $FA62 little-endian.
    expect(memGet24(0xFFFFFC) | (memGet24(0xFFFFFD) << 8)).toBe(0xFA62)
    // The language-card window $C000-$FFFF is the ROM's own last bank.
    expect(memGet24(0x00FF00)).toBe(gsSystemROM[0x30000 + 0xFF00])
  } finally {
    setIigsRomVersion("01")
  }
})

test(`ROM 03 boots GS/OS 6.0.1 from ${PO_PATH}`, () => {
  jest.useFakeTimers()
  setIsTesting()
  try {
    setIigsRomVersion("03")
    doSetMachineName("APPLE2GS")
    bootGsos()

    const shr = getShr()
    expect(shr.length).toBe(32768)

    const colours = new Set<string>()
    for (let y = 0; y < 200; y++) {
      const scb = shr[SHR_SCB_OFFSET + y]
      const palIdx = (scb & 0x0f) << 4
      const is640 = (scb & 0x80) !== 0
      for (let x = 0; x < 640; x++) {
        let colorIndex: number
        if (is640) {
          const byteVal = shr[y * 160 + (x >> 2)]
          const shift = (3 - (x & 3)) * 2
          colorIndex = palIdx | ([8, 12, 0, 4][x & 3] + ((byteVal >> shift) & 3))
        } else {
          const byteVal = shr[y * 160 + (x >> 1)]
          colorIndex = palIdx | ((x & 1) ? (byteVal & 0x0f) : ((byteVal >> 4) & 0x0f))
        }
        const pOff = 0x7e00 + (colorIndex >> 4) * 32 + (colorIndex & 0x0f) * 2
        const w = shr[pOff] | (shr[pOff + 1] << 8)
        colours.add(`${(w >> 8) & 0xf},${(w >> 4) & 0xf},${w & 0xf}`)
      }
    }
    console.log(`[ROM03] decoded distinct colours: ${colours.size}`)
    expect(colours.size).toBeGreaterThan(8)
  } finally {
    setIigsRomVersion("01")
    doSetRunMode(RUN_MODE.PAUSED, false)
    resetCpuSpeedForTesting()
    jest.useRealTimers()
  }
})

test("ROM 03: closed-loop ADB sync converges the guest cursor", () => {
  jest.useFakeTimers()
  setIsTesting()
  try {
    setIigsRomVersion("03")
    doSetMachineName("APPLE2GS")
    resetMouse()
    resetADBTracking()
    bootGsos()

    expect(isIigsShrActive()).toBe(true)
    // ROM 03 publishes the cursor in the $E1:0190-0193 bank globals, not the
    // text-page holes, so the closed loop has to read those to stay on target.
    MouseCardEvent({ x: 0.10, y: 0.10, buttons: -1 })
    for (let f = 0; f < 6; f++) jest.advanceTimersByTime(17)
    MouseCardEvent({ x: 0.60, y: 0.50, buttons: -1 })
    for (let f = 0; f < 120; f++) {
      jest.advanceTimersByTime(17)
      iigsMouseStep()
    }
    const { x, y } = getIigsMousePos()
    const wantX = Math.round(0.60 * 639)
    const wantY = Math.round(0.50 * 399) >> 1
    console.log(`[ROM03] guest=${x},${y} want=${wantX},${wantY}`)
    expect(Math.abs(x - wantX)).toBeLessThanOrEqual(2)
    expect(Math.abs(y - wantY)).toBeLessThanOrEqual(2)
  } finally {
    setIigsRomVersion("01")
    doSetRunMode(RUN_MODE.PAUSED, false)
    resetCpuSpeedForTesting()
    jest.useRealTimers()
  }
})
