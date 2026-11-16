import { doSetMachineName, doSetRunMode, doBoot, resetCpuSpeedForTesting } from "./motherboard"
import { memGet24 } from "./memory"
import { doSetEmuDriveNewData } from "./devices/drivestate"
import { MouseCardEvent, resetMouse } from "./devices/mouse"
import { iigsADB } from "./iigs_adb"
import { RUN_MODE } from "../common/utility"
import { setIsTesting } from "./worker2main"
import * as fs from "fs"

// Y-axis tracking of the cursor (mirror of the X-axis check in
// gs_cursor_draw.test.ts). The first MouseCardEvent per gesture only
// establishes the tracking baseline and produces no motion, so a test that
// moves the pointer once sees nothing — the baseline must always be set first.
const FRAMES = Number(process.env.GSCURY_FRAMES || 4000)
const PO_PATH = process.env.GSCURY_PO || "C:\\\\dev\\\\emu\\\\ap2\\\\GSOS601.po"

const ypos = () => memGet24(0x04fc) | (memGet24(0x05fc) << 8)

test("GSOS601: the cursor Y follows the pointer in both directions", () => {
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

    MouseCardEvent({ x: 0.50, y: 0.20, buttons: -1 })
    for (let f = 0; f < 25; f++) jest.advanceTimersByTime(17)

    const targets = [0.30, 0.70, 0.45, 0.85, 0.15, 0.95, 0.50]
    const rows: string[] = []
    const pairs: { ty: number, hy: number }[] = []
    for (const t of targets) {
      const ty = Math.round(t * 200)
      MouseCardEvent({ x: 0.50, y: t, buttons: -1 })
      for (let f = 0; f < 25; f++) jest.advanceTimersByTime(17)
      const hy = ypos()
      pairs.push({ ty, hy })
      rows.push(`   pointer y=${String(ty).padStart(3)}  cursor Y=${String(hy).padStart(3)}` +
        `  offset=${String(hy - ty).padStart(5)}`)
    }
    console.log("[CURY] cursor vs pointer Y:\\n" + rows.join("\\n"))

    // Within the closed-loop deadband: cursor converges to within +/-1 count.
    const offsets = new Set(pairs.map((p) => p.hy - p.ty))
    console.log("[CURY] offset set:", [...offsets])
    for (const o of offsets) expect(Math.abs(o)).toBeLessThanOrEqual(1)
    expect(offsets.size).toBeLessThanOrEqual(3)

    // Both directions (increasing/decreasing) track monotonically.
    for (let i = 1; i < pairs.length; i++) {
      if (pairs[i]!.ty < pairs[i - 1]!.ty) {
        expect(pairs[i]!.hy).toBeLessThan(pairs[i - 1]!.hy)
      } else {
        expect(pairs[i]!.hy).toBeGreaterThan(pairs[i - 1]!.hy)
      }
    }

    // Not the degenerate clamped case (cursor never left its origin).
    expect(new Set(pairs.map((p) => p.hy)).size).toBeGreaterThan(4)
  } finally {
    doSetRunMode(RUN_MODE.PAUSED, false)
    resetCpuSpeedForTesting()
    jest.useRealTimers()
  }
}, 900000)
