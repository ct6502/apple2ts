import { doSetMachineName, doSetRunMode, doSetSpeedMode, getCPU } from "./motherboard"
import { getShr, memGet24, iigsEventManagerActive } from "./memory"
import { doSetEmuDriveNewData } from "./devices/drivestate"
import { MouseCardEvent, resetMouse, resetADBTracking } from "./devices/mouse"
import { iigsADB } from "./iigs_adb"
import { RUN_MODE } from "../common/utility"
import { setIsTesting } from "./worker2main"
import * as fs from "fs"

// freegemas.2mg is a self-booting GS/OS match-3 port. It keeps its own cursor
// and reads the ADB report bytes ($C024) directly, so the Event Manager never
// publishes a position: the text-page holes stay at (0,0) while the game runs.
// The closed-loop cursor sync used to steer against that origin, which applied
// motion the game followed toward a phantom target and pinned its pointer in a
// screen corner - the mouse looked dead. The fix requires live feedback before
// the loop engages (devices/mouse.ts iigsClosedLoopActive) and falls back to
// dead reckoning for guests that keep their own cursor.
const FREEGEMAS = process.env.FREEGEMAS_IMG || "C:\\dev\\emu\\ap2\\freegemas.2mg"
const BOOT_FRAMES = Number(process.env.FREEGEMAS_BOOT_FRAMES || 2600)

const mount = (p: string, index: number, name: string) =>
  doSetEmuDriveNewData({
    index, hardDrive: true, drive: index + 1, filename: name, status: "",
    motorRunning: false, diskHasChanges: false, isWriteProtected: false,
    diskData: new Uint8Array(fs.readFileSync(p)), lastAppleWriteTime: 0,
    cloudData: null, writableFileHandle: null, lastLocalFileWriteTime: 0,
  } as DriveProps)

const advance = (n: number) => { for (let i = 0; i < n; i++) jest.advanceTimersByTime(17) }
const nonZero = (buf: Uint8Array) => {
  let n = 0
  for (let i = 0; i < buf.length; i++) if (buf[i] !== 0) n++
  return n
}
const diffCount = (a: Uint8Array, b: Uint8Array) => {
  let n = 0
  for (let i = 0; i < a.length; i++) if (a[i] !== b[i]) n++
  return n
}

test("freegemas: pointer moves with the host and a click starts the game", () => {
  jest.useFakeTimers()
  setIsTesting()
  try {
    doSetMachineName("APPLE2GS")
    resetMouse()
    resetADBTracking()
    iigsADB.reset()
    doSetSpeedMode(1)
    expect(mount(FREEGEMAS, 0, "freegemas.2mg")).toBe(true)
    doSetRunMode(RUN_MODE.NEED_BOOT)
    doSetRunMode(RUN_MODE.RUNNING, false)
    advance(BOOT_FRAMES)

    const cpu = getCPU() as any
    expect(cpu.PB).toBe(0x09)          // the game is running out of bank $09
    const menu = getShr().slice()
    expect(nonZero(menu)).toBeGreaterThan(10000)

    // The guest never publishes a cursor, so the closed loop must not engage.
    expect(iigsEventManagerActive()).toBe(true)
    expect(memGet24(0x00047c) | memGet24(0x0004fc)).toBe(0)

    // Seed the dead-reckoning baseline, then drive the pointer into the
    // top-left corner. The game clamps there, which gives a known origin.
    MouseCardEvent({ x: 0.5, y: 0.5, buttons: -1 }); advance(4)
    MouseCardEvent({ x: 0.0, y: 0.0, buttons: -1 }); advance(40)
    const corner = getShr()

    // A small relative move must move the guest pointer rather than jam it in
    // a corner: the game redraws its sprite somewhere else.
    MouseCardEvent({ x: 0.25, y: 0.3125, buttons: -1 }); advance(40)
    expect(diffCount(corner, getShr())).toBeGreaterThan(0)

    // (0,0) -> (160,125) in the game's 320x200 space lands on "Timetrial mode".
    MouseCardEvent({ x: 0.50, y: 0.625, buttons: -1 }); advance(40)
    const onItem = getShr().slice()

    // Left click: byte 1 bit 7 of ADB register 0 is the left button.
    MouseCardEvent({ x: 0.50, y: 0.625, buttons: 0x10 })
    advance(8)
    expect(iigsADB.getMouseRegisters().y & 0x80).toBe(0x00)
    MouseCardEvent({ x: 0.50, y: 0.625, buttons: 0x00 })
    advance(120)
    expect(iigsADB.getMouseRegisters().y & 0x80).toBe(0x80)

    // The menu gives way to the match-3 board.
    expect(diffCount(onItem, getShr())).toBeGreaterThan(5000)
  } finally {
    doSetRunMode(RUN_MODE.PAUSED, false)
    jest.useRealTimers()
  }
}, 600000)
