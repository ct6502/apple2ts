// The Apple IIgs key chord, measured against GS/OS 6.0.1.
//
// A chord does not exist in an ADB key event - one event byte carries one
// keycode - it exists only in the $C025 modifier byte. Until queueKeyboard()
// drove $C025, every "modifier + key" the user typed reached the Finder as a
// bare key, so no GS/OS key equivalent could fire; and while both Alt keys
// mapped to Option ($3A = Closed Apple), the Open Apple bit ($80) was
// unreachable even in principle.
//
// Everything here goes through setKeyboardState(), the same payload and down/up
// order canvas.tsx posts, because that is the path that was broken. GS/OS 6.0.1
// consumes the legacy $C000 strobe and polls $C025 about once per frame, so the
// chord is (Closed Apple down) + (ASCII key in $C000) + (Closed Apple up).
//
// What is provable here is that the guest *takes* a Closed Apple chord: the
// Finder reads the key out of $C000 while the Closed Apple bit (6) is still held in
// $C025. The drawer itself draws nothing on the local volumes (agents.md §11.13)
// and the menu that does open is the ROM's, reached by a different sequence -
// see gs_rom_desk_panel.test.ts.

import { doSetMachineName, doSetRunMode, resetCpuSpeedForTesting } from "./motherboard"
import { getShr, memGetC000 } from "./memory"
import { doSetEmuDriveNewData } from "./devices/drivestate"
import { RUN_MODE } from "../common/utility"
import { setIsTesting } from "./worker2main"
import { setKeyboardState } from "./devices/keyboard"
import { iigsADB } from "./iigs_adb"
import * as fs from "fs"

const PO_PATH = process.env.GSBOOT_PO || "C:\\dev\\emu\\ap2\\GSOS601.po"
const BOOT_FRAMES = Number(process.env.GSBOOT_FRAMES || 4000)

// $C025 bit assignments from gssquared adb_mod_key_t (ADB_Keyboard.hpp:6):
// bit6 closed (ADB_OPTION $3A) and bit7 open (ADB_COMMAND $37).
const MOD_CLOSED = 0x40
const MOD_OPEN = 0x80

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
const openAppleDown = () =>
  setKeyboardState({ key: -1, isDown: true, repeat: false, domCode: "AltLeft" })
const openAppleUp = () =>
  setKeyboardState({ key: -1, isDown: false, repeat: false, domCode: "AltLeft" })


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

test("the guest takes the DA drawer chord while Closed Apple is held", () => {
  // Same shape as the Open Apple + W case below but through the $C000 latch,
  // because that is how the Finder reads a chord: the Closed Apple bit in $C025
  // plus the key in $C000, and the release only after the guest has taken the press.
  closedAppleDown()
  expect(iigsADB.peekModifiers() & MOD_CLOSED).toBe(MOD_CLOSED)
  keyDown("Escape", 27)
  let frames = 0
  while (memGetC000(0xC000) >= 0x80 && frames < 600) {
    pump(1)
    frames++
  }
  console.log(`[DA] Escape consumed after ${frames} frames`)
  expect(frames).toBeLessThan(600)
  // The Closed Apple bit (6) is still held while the Finder reads the Escape: that
  // coincidence is the chord, and it is what an un-driven $C025 could not make.
  expect(iigsADB.peekModifiers() & MOD_CLOSED).toBe(MOD_CLOSED)
  keyUp("Escape", 27)
  closedAppleUp()
  expect(iigsADB.peekModifiers() & MOD_CLOSED).toBe(0)
})

test("Open Apple + W reaches the Finder as a chord", () => {
  // The Finder on this desktop boot keeps the volume icons on an unframed
  // desktop, so there is no front window to close; the measurable proof is the
  // same as the Escape case above: the Finder consumes the $C000 strobe while
  // the Open Apple bit is still held in $C025, and the real key arrives as the
  // ADB's unshifted lowercase 'w' rather than the host event's uppercase text.
  openAppleDown()
  expect(iigsADB.peekModifiers() & MOD_OPEN).toBe(MOD_OPEN)

  keyDown("KeyW", 87)
  expect(memGetC000(0xC000) & 0x7f).toBe(0x77)
  let frames = 0
  while (memGetC000(0xC000) >= 0x80 && frames < 600) {
    pump(1)
    frames++
  }
  console.log(`[W] W consumed after ${frames} frames`)
  expect(frames).toBeLessThan(600)
  expect(iigsADB.peekModifiers() & MOD_OPEN).toBe(MOD_OPEN)

  keyUp("KeyW", 87)
  pump(2)
  openAppleUp()
  expect(iigsADB.peekModifiers() & MOD_OPEN).toBe(0)
})
