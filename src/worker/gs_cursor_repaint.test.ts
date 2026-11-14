import { doSetMachineName, doSetRunMode, doBoot, resetCpuSpeedForTesting } from "./motherboard"
import { memGet24 } from "./memory"
import { doSetEmuDriveNewData } from "./devices/drivestate"
import { MouseCardEvent, resetMouse } from "./devices/mouse"
import { iigsADB } from "./iigs_adb"
import { RUN_MODE } from "../common/utility"
import { setIsTesting } from "./worker2main"
import * as fs from "fs"

// The guest paints its own pointer again.
//
// GS/OS's Event Manager times the cursor draw/erase to the cursor's own scan
// line: it sets SCB bit 6 on that row and lets the VGC's scanline interrupt run
// the blitter. The emulator never raised that interrupt, so the Event Manager
// never repainted anything and the factory cursor stayed exactly where it was
// first shown, in the top-left corner, no matter where the host pointer went.
//
// This asserts the user-visible result: after a pointer move the SHR framebuffer
// changes around BOTH the old and the new cursor row, which can only happen if
// the guest erased its arrow in one place and drew it in the other.
const FRAMES = Number(process.env.GSCUR_FRAMES || 4000)
const PO_PATH = process.env.GSCUR_PO || "C:\\dev\\emu\\ap2\\GSOS601.po"

const getShr = (require("./memory") as any).getShr as () => Uint8Array

const xpos = () => memGet24(0x047c) | (memGet24(0x057c) << 8)
const ypos = () => memGet24(0x04fc) | (memGet24(0x05fc) << 8)

const changedRows = (a: Uint8Array, b: Uint8Array): number[] => {
  const rows: number[] = []
  for (let y = 0; y < 200; y++) {
    for (let i = 0; i < 160; i++) {
      if (a[y * 160 + i] !== b[y * 160 + i]) { rows.push(y); break }
    }
  }
  return rows
}

test("GSOS601: the guest redraws its cursor when the pointer moves", () => {
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
    const pump = (n: number) => { for (let f = 0; f < n; f++) jest.advanceTimersByTime(17) }
    pump(FRAMES)

    // The cursor was painted once during boot, near the top-left corner.
    const oldX = xpos()
    const oldY = ypos()
    const before = Uint8Array.from(getShr())
    expect(before.length).toBe(0x8000)

    // First event only establishes the tracking baseline.
    MouseCardEvent({ x: 0.20, y: 0.10, buttons: -1 })
    pump(10)
    MouseCardEvent({ x: 0.62, y: 0.55, buttons: -1 })
    pump(60)

    const newX = xpos()
    const newY = ypos()
    expect(Math.abs(newX - oldX)).toBeGreaterThan(100)
    expect(Math.abs(newY - oldY)).toBeGreaterThan(50)

    const rows = changedRows(before, Uint8Array.from(getShr()))
    console.log(`[CURREPAINT] old=${oldX},${oldY} new=${newX},${newY} changed rows=${rows.join(",")}`)

    // A cursor is 15 rows tall, so the erase must touch the old row and the
    // draw must touch the new one. The menu-bar clock only changes rows 3-9,
    // which overlaps neither when the cursor sits lower on the screen.
    const touches = (y: number) => rows.some((r) => r >= y && r <= y + 15)
    expect(touches(oldY)).toBe(true)
    expect(touches(newY)).toBe(true)
  } finally {
    doSetRunMode(RUN_MODE.PAUSED, false)
    resetCpuSpeedForTesting()
    jest.useRealTimers()
  }
}, 900000)
