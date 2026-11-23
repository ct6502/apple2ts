// IIgs ADB keyboard auto-repeat cadence.
//
// The ADB micro-controller's repeat delay/rate are counted in 60 Hz frames
// (gssquared ADB_Micro.hpp:185-210, frame_handler). The motherboard must tick it
// exactly once per emulated refresh: a per-run-loop-call counter halved the
// delay and doubled the rate whenever the 65816 was waiting in WAI (an idle
// prompt), because one timer callback can enter doAdvance6502 more than once per
// emulated frame. The ROM's configured 45-frame delay then fired after ~21
// frames (0.36 s instead of 0.75 s) and the 4-frame rate repeated every 2
// frames, which is the "one tap types two characters" report.

import { doSetMachineName, doSetRunMode, doSetSpeedMode, resetCpuSpeedForTesting } from "./motherboard"
import { doSetEmuDriveNewData } from "./devices/drivestate"
import { iigsADB } from "./iigs_adb"
import { setKeyboardState } from "./devices/keyboard"
import { RUN_MODE } from "../common/utility"
import { setIsTesting } from "./worker2main"
import * as fs from "fs"

const BOOT_FRAMES = 900
const HOLD_FRAMES = 120

const mountProDOS = () => {
  const filename = "public/disks/ProDOS 2.4.3.po"
  const diskData = new Uint8Array(fs.readFileSync(filename))
  expect(doSetEmuDriveNewData({
    index: 4,
    hardDrive: false,
    drive: 1,
    filename: filename.replace(/^.*[\\/]/, ""),
    status: "",
    motorRunning: false,
    diskHasChanges: false,
    isWriteProtected: false,
    diskData,
    lastAppleWriteTime: 0,
    cloudData: null,
    writableFileHandle: null,
    lastLocalFileWriteTime: 0,
  } as DriveProps)).toBe(true)
}

test("IIgs ADB repeat ticks once per emulated frame, not once per run-loop call", () => {
  jest.useFakeTimers()
  setIsTesting()
  const repeatFrames: number[] = []
  let frame = 0
  const original = iigsADB.repeatTick
  try {
    doSetMachineName("APPLE2GS")
    doSetSpeedMode(0)
    mountProDOS()
    doSetRunMode(RUN_MODE.NEED_BOOT)
    doSetRunMode(RUN_MODE.RUNNING, false)
    for (frame = 0; frame < BOOT_FRAMES; frame++) jest.advanceTimersByTime(17)

    // The ROM programs the ADB configuration during boot (0x24: 45-frame delay,
    // 4-frame rate on ROM 01). Pin that the cadence test measures the ROM's
    // values instead of the micro's power-on defaults.
    expect(iigsADB.delayFrames()).toBe(45)
    expect(iigsADB.repeatFrames()).toBe(4)

    ;(iigsADB as unknown as { repeatTick: () => number | null }).repeatTick = function () {
      const result = original.call(iigsADB)
      if (result !== null) repeatFrames.push(frame)
      return result
    }

    const pressFrame = frame
    setKeyboardState({ key: 0x41, isDown: true, repeat: false, domCode: "KeyA" })
    for (frame = pressFrame; frame < pressFrame + HOLD_FRAMES; frame++) {
      jest.advanceTimersByTime(17)
    }

    expect(repeatFrames.length).toBeGreaterThanOrEqual(3)
    // One tick per emulated frame: the first repeat lands on the 45th frame
    // after the key went down. Allow one frame of slack for where the press
    // falls relative to the refresh boundary.
    const firstDelay = repeatFrames[0] - pressFrame
    expect(Math.abs(firstDelay - iigsADB.delayFrames())).toBeLessThanOrEqual(2)
    // The ROM's 4-frame rate must stay 4 frames, not collapse to 2.
    for (let i = 1; i < 3; i++) {
      expect(repeatFrames[i] - repeatFrames[i - 1]).toBe(iigsADB.repeatFrames())
    }

    // Key-up cancels the pending repeat, as gssquared's stop_repeat does.
    setKeyboardState({ key: 0x41, isDown: false, repeat: false, domCode: "KeyA" })
    const atRelease = repeatFrames.length
    for (let i = 0; i < 60; i++) {
      frame++
      jest.advanceTimersByTime(17)
    }
    expect(repeatFrames.length).toBe(atRelease)
  } finally {
    ;(iigsADB as unknown as { repeatTick: () => number | null }).repeatTick = original
    doSetRunMode(RUN_MODE.PAUSED, false)
    resetCpuSpeedForTesting()
    jest.useRealTimers()
  }
}, 600000)
