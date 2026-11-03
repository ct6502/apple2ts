// The Apple IIgs key chord, measured against GS/OS 6.0.1.
//
// A chord does not exist in an ADB key event - one event byte carries one
// keycode - it exists only in the $C025 modifier byte. Until queueKeyboard()
// drove $C025, every "modifier + key" the user typed reached the Finder as a
// bare key, so no GS/OS key equivalent could fire; and while both Alt keys
// mapped to Option ($3A), the Command bit ($80) was unreachable even in
// principle.
//
// Everything here goes through setKeyboardState(), the same payload and down/up
// order canvas.tsx posts, because that is the path that was broken. GS/OS 6.0.1
// consumes the legacy $C000 strobe and polls $C025 about once per frame, so the
// chord is (Command down) + (ASCII key in $C000) + (Command up).
//
// The DA drawer itself cannot be shown: none of the available images ships a
// Desk Accs folder, so the drawer has nothing to pull out. What is provable is
// that the guest *takes* the Closed Apple + Escape chord - the closed-loop
// sequence completes, which only happens once the Finder has read and cleared
// the Escape while the Command bit was still held.

import { doSetMachineName, doSetRunMode, resetCpuSpeedForTesting } from "./motherboard"
import { getShr } from "./memory"
import { doSetEmuDriveNewData } from "./devices/drivestate"
import { RUN_MODE } from "../common/utility"
import { setIsTesting } from "./worker2main"
import { isKeyboardInputBusy, openIigsDaDrawer, setKeyboardState } from "./devices/keyboard"
import { iigsADB } from "./iigs_adb"
import * as fs from "fs"

const PO_PATH = process.env.GSBOOT_PO || "C:\\dev\\emu\\ap2\\GSOS601.po"
const BOOT_FRAMES = Number(process.env.GSBOOT_FRAMES || 4000)

const MOD_CLOSED = 0x80
const SHR_SCB_OFFSET = 0x7D00

const pump = (frames: number) => {
  for (let f = 0; f < frames; f++) jest.advanceTimersByTime(17)
}

const keyDown = (domCode: string, ascii: number) =>
  setKeyboardState({ key: ascii, isDown: true, repeat: false, domCode })
const keyUp = (domCode: string, ascii: number) =>
  setKeyboardState({ key: ascii, isDown: false, repeat: false, domCode })
const closedAppleDown = () =>
  setKeyboardState({ key: -1, isDown: true, repeat: false, domCode: "AltRight" })
const closedAppleUp = () =>
  setKeyboardState({ key: -1, isDown: false, repeat: false, domCode: "AltRight" })

// Super Hi-Res decoded to one grey value per pixel, the way the renderer sees it.
const decodeGrey = () => {
  const shr = getShr()
  const grey = new Uint16Array(640 * 200)
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
      grey[y * 640 + x] = ((((w >> 8) & 0x0f) + ((w >> 4) & 0x0f) + (w & 0x0f)) * 17) / 3
    }
  }
  return grey
}

// Rows with real ink movement. The Finder's clock ticks and its desktop dithers,
// so a row counts only once eight pixels of it move by more than a visible step:
// a clock tick is a handful of rows, a window closing is over a hundred.
const changedRows = (a: Uint16Array, b: Uint16Array) => {
  let rows = 0
  for (let y = 0; y < 200; y++) {
    let moved = 0
    for (let x = 0; x < 640; x++) {
      const o = y * 640 + x
      if (Math.abs(a[o] - b[o]) > 40) moved++
    }
    if (moved > 8) rows++
  }
  return rows
}

beforeAll(() => {
  jest.useFakeTimers()
  setIsTesting()
  doSetMachineName("APPLE2GS")

  const data = fs.readFileSync(PO_PATH)
  const props: DriveProps = {
    index: 0,
    hardDrive: true,
    drive: 1,
    filename: PO_PATH.split("\\").pop() || "GSOS601.po",
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
  pump(BOOT_FRAMES)
})

afterAll(() => {
  doSetRunMode(RUN_MODE.PAUSED, false)
  resetCpuSpeedForTesting()
  jest.useRealTimers()
})

test("GS/OS is up on the Super Hi-Res desktop", () => {
  expect(getShr().length).toBe(32768)
  expect(iigsADB.peekModifiers() & MOD_CLOSED).toBe(0)
})

test("the guest takes the DA drawer chord while Command is held", async () => {
  const pending = openIigsDaDrawer()
  expect(iigsADB.peekModifiers() & MOD_CLOSED).toBe(MOD_CLOSED)
  let frames = 0
  while (isKeyboardInputBusy() && frames < 600) {
    pump(1)
    frames++
    // Let the promise the run loop resolves reach the microtask queue.
    await Promise.resolve()
  }
  const result = await pending
  console.log(`[DA] outcome=${result.outcome} after ${frames} frames`)
  expect(result.outcome).toBe("completed")
  expect(iigsADB.peekModifiers() & MOD_CLOSED).toBe(0)
})

test("a bare W is not a chord, but Closed Apple + W closes the front window", () => {
  // Self-calibrating: the Finder repaints on its own (the volume window's
  // selected title blinks, its desktop dithers), so the same frame budget is
  // measured with no key at all before the two keystrokes are compared against
  // it. Only a chord has to move the picture far more than that.
  const measure = (tap: () => void, frames: number) => {
    const before = decodeGrey()
    tap()
    pump(frames)
    return changedRows(before, decodeGrey())
  }

  const idle = measure(() => {}, 140)
  const bare = measure(() => {
    keyDown("KeyW", 87)
    pump(10)
    keyUp("KeyW", 87)
  }, 130)
  const chord = measure(() => {
    closedAppleDown()
    pump(10)
    expect(iigsADB.peekModifiers() & MOD_CLOSED).toBe(MOD_CLOSED)
    keyDown("KeyW", 87)
    pump(10)
    keyUp("KeyW", 87)
    pump(10)
    closedAppleUp()
  }, 110)
  console.log(`[W] idle=${idle} bare=${bare} chord=${chord} changed rows`)

  expect(bare).toBeLessThanOrEqual(idle + 20)
  expect(chord).toBeGreaterThan(80)
  expect(chord).toBeGreaterThan(4 * Math.max(idle, bare))
  expect(iigsADB.peekModifiers() & MOD_CLOSED).toBe(0)
})
