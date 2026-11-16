import { doSetMachineName, doSetRunMode, doBoot, resetCpuSpeedForTesting } from "./motherboard"
import { memGet24 } from "./memory"
import { doSetEmuDriveNewData } from "./devices/drivestate"
import { MouseCardEvent, resetMouse } from "./devices/mouse"
import { iigsADB } from "./iigs_adb"
import { RUN_MODE } from "../common/utility"
import { setIsTesting } from "./worker2main"
import * as fs from "fs"

// The Apple IIgs cursor follows the pointer, in both directions.
//
// This is the end-to-end check for the two faults that together made the cursor
// unusable (sections 42 and 43):
//   - the ADB report encoded the absolute magnitude instead of a seven-bit two's
//     complement, so every leftward report decoded as roughly -1;
//   - the 65816 ADC overflow flag was computed with `(!x && y) !== 0`, which is
//     `true` for `false`, so V was set for every add whose operands had
//     different signs. The ROM's cursor accumulator adds the signed delta with
//     two 8-bit ADCs and the routine it then calls branches on V to detect the
//     cursor leaving the screen, so V stuck on meant every leftward move was
//     judged out of bounds and the cursor was clamped to the screen maximum.
//
// The cursor position must be an exact affine function of the pointer: the same
// constant offset for every position, in both directions, with no clamping.
const FRAMES = Number(process.env.GSCUR_FRAMES || 4000)
const PO_PATH = process.env.GSCUR_PO || "C:\\dev\\emu\\ap2\\GSOS601.po"

const xpos = () => memGet24(0x047c) | (memGet24(0x057c) << 8)
const ypos = () => memGet24(0x04fc) | (memGet24(0x05fc) << 8)

test("GSOS601: the cursor position is an exact affine function of the pointer", () => {
  jest.useFakeTimers()
  setIsTesting()
  try {
    doSetMachineName("APPLE2GS")
    resetMouse()
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
    for (let f = 0; f < 40; f++) jest.advanceTimersByTime(17)

    // The first MouseCardEvent only establishes the tracking baseline and
    // produces no motion, so a test that moves the pointer once sees nothing.
    MouseCardEvent({ x: 0.20, y: 0.30, buttons: -1 })
    for (let f = 0; f < 25; f++) jest.advanceTimersByTime(17)

    // Deliberately interleaved left and right, and including a sweep to both
    // edges, so a cursor that only ever climbs cannot pass.
    const targets = [0.30, 0.60, 0.45, 0.75, 0.35, 0.20, 0.90, 0.50]
    const rows: string[] = []
    const pairs: { tx: number, hx: number }[] = []
    for (const t of targets) {
      const tx = Math.round(t * 640)
      MouseCardEvent({ x: t, y: 0.30, buttons: -1 })
      for (let f = 0; f < 25; f++) jest.advanceTimersByTime(17)
      const hx = xpos()
      pairs.push({ tx, hx })
      rows.push(`   pointer x=${String(tx).padStart(3)}  cursor X=${String(hx).padStart(3)}` +
        `  offset=${String(hx - tx).padStart(5)}  Y=${ypos()}`)
    }
    console.log("[CUR] cursor vs pointer:\n" + rows.join("\n"))

    // Every position shares one constant offset within the closed-loop deadband:
    // the cursor converges to within +/-1 count of the pointer, so the offset
    // is either -1, 0 or +1 - never the large systematic drift the old
    // dead-reckoning path produced.
    const offsets = new Set(pairs.map((p) => p.hx - p.tx))
    for (const o of offsets) expect(Math.abs(o)).toBeLessThanOrEqual(1)
    expect(offsets.size).toBeLessThanOrEqual(3)

    // Not the degenerate case where every position clamps to the same value.
    expect(new Set(pairs.map((p) => p.hx)).size).toBeGreaterThan(4)

    // Both directions: a leftward move must decrease the cursor.
    for (let i = 1; i < pairs.length; i++) {
      if (pairs[i]!.tx < pairs[i - 1]!.tx) {
        expect(pairs[i]!.hx).toBeLessThan(pairs[i - 1]!.hx)
      } else {
        expect(pairs[i]!.hx).toBeGreaterThan(pairs[i - 1]!.hx)
      }
    }

    // The cursor stays on screen rather than at either extreme.
    const maxX = Math.max(...pairs.map((p) => p.hx))
    expect(maxX).toBeLessThan(639)
  } finally {
    doSetRunMode(RUN_MODE.PAUSED, false)
    resetCpuSpeedForTesting()
    jest.useRealTimers()
  }
}, 900000)
