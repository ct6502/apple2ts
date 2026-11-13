import { doSetMachineName, doSetRunMode, doBoot, resetCpuSpeedForTesting } from "./motherboard"
import { memGet24 } from "./memory"
import { doSetEmuDriveNewData } from "./devices/drivestate"
import { MouseCardEvent, resetMouse, resetADBTracking } from "./devices/mouse"
import { iigsADB } from "./iigs_adb"
import { RUN_MODE } from "../common/utility"
import { setIsTesting } from "./worker2main"
import * as fs from "fs"

// A leftward host move must move the Apple IIgs cursor leftward.
//
// The IIgs ROM's mouse accumulator (FF:9D44-FF:9D9E) decodes the $C024 report
// like this: it masks off the button bit, uses bit 6 as the sign, pushes $FF as
// the sign-extension byte on a negative report, and adds the 16-bit pair to the
// cursor. The result is that the 7-bit displacement field is *two's
// complement*: a -63 displacement arrives as $41 and decodes to -63, a -1
// arrives as $7F.
//
// apple2ts used to encode the absolute magnitude instead, so every negative
// report decoded as (magnitude - 64): -63 arrived as $FF and decoded as -1, and
// -1 arrived as $FF and decoded as -1 too. Leftward motion was therefore
// essentially lost, and the cursor only ever climbed.
//
// gssquared agrees with the ROM: ADB_Mouse::encode_relative_motion writes
// (xrel & 0x3F) | (moved_right ? 0x40 : 0x00), and the IIgs ROM's accumulator
// turns that field into (field - 128), which is only the original delta when
// the field is already a two's complement.
const FRAMES = Number(process.env.GSNEG_FRAMES || 4000)
const PO_PATH = process.env.GSNEG_PO || "C:\\dev\\emu\\ap2\\GSOS601.po"

const hex = (v: number, n = 2) => "$" + (v >>> 0).toString(16).toUpperCase().padStart(n, "0")
const xpos = () => memGet24(0x047c) | (memGet24(0x057c) << 8)

// The X byte carries the RIGHT button in bit 7 and the Y byte the LEFT one
// (gssquared's ADB_Mouse), so with both buttons up the X byte is $80 plus the
// seven-bit displacement.
test("the ADB encodes a displacement as a seven-bit two's complement", () => {
  const adb = iigsADB as any
  const cases: [number, number][] = [
    [63, 0x3f], [-63, 0x41], [33, 0x21], [-33, 0x5f], [1, 0x01], [-1, 0x7f],
  ]
  for (const [delta, want] of cases) {
    adb.reset()
    adb.queueMouse(delta, 0)
    const x = adb.readMouseData()
    const y = adb.readMouseData()
    expect(`${hex(x)}/${hex(y)}`).toBe(`${hex(want | 0x80)}/${hex(0x80)}`)
  }
})

test("GSOS601: a leftward move delivers negative reports and moves the cursor left", () => {
  jest.useFakeTimers()
  setIsTesting()
  try {
    doSetMachineName("APPLE2GS")
    resetMouse()
    resetADBTracking()
    iigsADB.reset()
    const data = fs.readFileSync(PO_PATH)
    expect(doSetEmuDriveNewData({
      index: 0, hardDrive: true, drive: 1, filename: "GSOS601.po", status: "",
      motorRunning: false, diskHasChanges: false, isWriteProtected: false,
      diskData: new Uint8Array(data), lastAppleWriteTime: 0, cloudData: null,
      writableFileHandle: null, lastLocalFileWriteTime: 0,
    } as DriveProps)).toBe(true)

    doBoot()
    doSetRunMode(RUN_MODE.RUNNING, false)
    for (let f = 0; f < FRAMES; f++) jest.advanceTimersByTime(17)

    // The bytes the guest actually reads out of $C024. The ROM's ADB task
    // (FF:C4D2) reads the X byte first and the Y byte on the following read,
    // so the stream comes in pairs.
    const adb = iigsADB as any
    const reports: number[] = []
    const origRead = adb.readMouseData.bind(adb)
    adb.readMouseData = () => {
      const v = origRead()
      reports.push(v)
      return v
    }
    try {
      // The X bytes of every report the guest read.
      const xbytes = () => reports.filter((_, i) => i % 2 === 0)

      // Park the cursor in the middle of the screen.
      MouseCardEvent({ x: 0.50, y: 0.50, buttons: -1 })
      for (let f = 0; f < 60; f++) jest.advanceTimersByTime(17)
      const midX = xpos()

      // A big step to the right. The closed loop has to break the distance
      // into chunks of at most 63, so the guest sees several +63 reports.
      reports.length = 0
      MouseCardEvent({ x: 0.90, y: 0.50, buttons: -1 })
      for (let f = 0; f < 150; f++) jest.advanceTimersByTime(17)
      const rightX = xpos()
      const rightReports = xbytes()

      // And back to the left. This is the assertion that used to fail: the
      // report byte said $FF and decoded as -1, so the cursor stayed put.
      reports.length = 0
      MouseCardEvent({ x: 0.10, y: 0.50, buttons: -1 })
      for (let f = 0; f < 150; f++) jest.advanceTimersByTime(17)
      const leftX = xpos()
      const leftReports = xbytes()

      console.log(`[MOVE] right reports ${rightReports.map((b) => hex(b)).join(" ")}` +
        `  cursor ${midX} -> ${rightX}`)
      console.log(`[MOVE] left  reports ${leftReports.map((b) => hex(b)).join(" ")}` +
        `  cursor ${rightX} -> ${leftX}`)

      // The rightward move: positive displacements only, and the cursor moved
      // right.
      expect(rightReports.length).toBeGreaterThan(0)
      expect(rightReports.every((b) => (b & 0x40) === 0)).toBe(true)
      expect(rightReports.some((b) => (b & 0x7f) === 0x3f)).toBe(true)
      expect(rightX).toBeGreaterThan(midX)

      // The leftward move: negative displacements only (bit 6 set), the exact
      // -63 encoding the ROM expects, and the cursor moved left.
      expect(leftReports.length).toBeGreaterThan(0)
      expect(leftReports.every((b) => (b & 0x40) !== 0)).toBe(true)
      expect(leftReports.some((b) => (b & 0x7f) === 0x41)).toBe(true)
      expect(leftX).toBeLessThan(rightX)
      // The cursor lands where the pointer is, not short of it.
      expect(Math.abs(leftX - Math.round(0.10 * 639))).toBeLessThanOrEqual(2)
    } finally {
      adb.readMouseData = origRead
    }
  } finally {
    doSetRunMode(RUN_MODE.PAUSED, false)
    resetCpuSpeedForTesting()
    jest.useRealTimers()
  }
}, 900000)
