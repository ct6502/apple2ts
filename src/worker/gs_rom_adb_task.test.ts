// The IIgs pointer overlay (src/ui/graphics.ts drawIigsCursor) must appear for
// GS/OS, which leaves the guest cursor to its Event Manager, and must NOT
// appear for a program that drives the mouse itself and draws its own arrow
// (Tass Times in Tonetown).
//
// The signal is the classic ROM ADB micro-controller task at FF:C4D0-FF:C560.
// A program that manages its own cursor *polls* it: it reads $C027 again and
// again with nothing to report, waiting for the mouse. A guest that only wants
// a report lets the task wake up when one is latched and reads it straight
// away, so it never polls.
//
// Measured (2026-10-23):
//   Tass Times, title screen : 8025 ROM-task $C027 reads, 8025 of them polls
//   GS/OS 6.0.1, pointer moving:   54 ROM-task $C027 reads,    0 of them polls
//
// The older discriminator - "the ROM task read $C027 recently" - cannot tell
// the two apart: GS/OS's task wakes up for every report it consumes, so the
// overlay used to disappear for half of the frames while the pointer moved.
import { doSetMachineName, doSetRunMode, doSetSpeedMode, resetCpuSpeedForTesting } from "./motherboard"
import { doSetEmuDriveNewData } from "./devices/drivestate"
import { MouseCardEvent } from "./devices/mouse"
import { iigsADB } from "./iigs_adb"
import { RUN_MODE } from "../common/utility"
import { setIsTesting } from "./worker2main"
import * as fs from "fs"

const GSOS_PATH = process.env.GSBOOT_PO || "C:\\dev\\emu\\ap2\\GSOS601.po"
const TASS_PATH = process.env.GS_TASS_PATH || "C:\\dev\\emu\\ap2\\Tass Times in Tonetown.2mg"

const mount = (filename: string, path: string, writeProtected = false) => {
  expect(doSetEmuDriveNewData({
    index: 0, hardDrive: true, drive: 1, filename,
    status: "", motorRunning: false, diskHasChanges: false,
    isWriteProtected: writeProtected,
    diskData: new Uint8Array(fs.readFileSync(path)),
    lastAppleWriteTime: 0, cloudData: null, writableFileHandle: null,
    lastLocalFileWriteTime: 0,
  } as unknown as any as DriveProps)).toBe(true)
}

test("GS/OS 6.0.1: the ROM ADB task never polls, so the pointer overlay stays on", () => {
  jest.useFakeTimers()
  setIsTesting()
  try {
    doSetMachineName("APPLE2GS")
    iigsADB.reset()
    mount("GSOS601.po", GSOS_PATH)
    doSetRunMode(RUN_MODE.NEED_BOOT)
    doSetRunMode(RUN_MODE.RUNNING, false)
    for (let f = 0; f < 4200; f++) jest.advanceTimersByTime(17)

    // Idle: nothing is polling.
    let active = 0
    for (let f = 0; f < 60; f++) {
      jest.advanceTimersByTime(17)
      if (iigsADB.romAdbTaskActive()) active++
    }
    expect(active).toBe(0)

    // Moving the pointer is what used to trip the gate, because the ROM task
    // wakes up to consume each report.
    active = 0
    for (let f = 0; f < 120; f++) {
      if (f % 12 === 0) MouseCardEvent({ x: 0.3 + 0.002 * f, y: 0.5, buttons: -1 })
      jest.advanceTimersByTime(17)
      if (iigsADB.romAdbTaskActive()) active++
    }
    expect(active).toBe(0)

    // And a click must not trip it either.
    MouseCardEvent({ x: 0.55, y: 0.45, buttons: 0x10 })
    active = 0
    for (let f = 0; f < 60; f++) {
      jest.advanceTimersByTime(17)
      if (iigsADB.romAdbTaskActive()) active++
    }
    expect(active).toBe(0)
  } finally {
    doSetRunMode(RUN_MODE.PAUSED, false)
    resetCpuSpeedForTesting()
    jest.useRealTimers()
  }
}, 900000)

test("Tass Times: the ROM ADB task polls continuously, so the overlay stays off", () => {
  jest.useFakeTimers()
  setIsTesting()
  try {
    doSetMachineName("APPLE2GS")
    doSetSpeedMode(1)
    iigsADB.reset()
    mount("tass.2mg", TASS_PATH, true)
    doSetRunMode(RUN_MODE.NEED_BOOT)
    doSetRunMode(RUN_MODE.RUNNING, false)
    for (let f = 0; f < 1500; f++) jest.advanceTimersByTime(17)

    let active = 0
    for (let f = 0; f < 120; f++) {
      jest.advanceTimersByTime(17)
      if (iigsADB.romAdbTaskActive()) active++
    }
    expect(active).toBe(120)

    // Still polling while the mouse moves.
    active = 0
    for (let f = 0; f < 120; f++) {
      if (f % 6 === 0) MouseCardEvent({ x: 0.3 + 0.003 * f, y: 0.5, buttons: -1 })
      jest.advanceTimersByTime(17)
      if (iigsADB.romAdbTaskActive()) active++
    }
    expect(active).toBe(120)
  } finally {
    doSetRunMode(RUN_MODE.PAUSED, false)
    resetCpuSpeedForTesting()
    jest.useRealTimers()
  }
}, 900000)
