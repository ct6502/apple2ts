import { doSetMachineName, doSetRunMode, doReset, resetCpuSpeedForTesting } from "./motherboard"
import { doSetEmuDriveNewData, getDriveStateByIndex } from "./devices/drivestate"
import { getIwmReadStats, resetIwmReadStats } from "./devices/diskdata"
import { clearRomTrace, getRomTrace, setRomTraceEnabled } from "./romtrace"
import { memory, memGet24 } from "./memory"
import { RUN_MODE } from "../common/utility"
import { setIsTesting } from "./worker2main"
import * as fs from "fs"

// Regression test for the Apple IIgs 5.25" floppy boot.
//
// doResetDiskDrive() used to park the head at maxQuarterTrack (the outermost
// track). Only a cold boot re-calibrates the head, so after a reset the ROM read
// the wrong track; the head-recalibration test below pins the fix.
//
// The second behaviour is the Programmer's Guide warm-start signature
// ($03F2/$03F3 = little-endian target, $03F4 = checksum). A Ctrl-Reset is warm:
// it preserves the signature and takes the booted OS's warm entry, so after a
// completed boot it returns to that disk's prompt without re-reading the disk.
// "Insert a floppy after power-on, press Ctrl-Reset" still has to boot it: the
// boot is waiting at the startup-device scan, where the ROM's provisional
// signature ($00/$E0/$45) leads back into the scan and finds the new disk.
//
// Both boot scenarios below must reach the ProDOS screen.
const PO_PATH = process.env.GSFLOPPY_PO || "public/disks/A2DeskTop-VERA.po"

const mkProps = (index: number): DriveProps => ({
  index,
  hardDrive: false,
  drive: 1,
  filename: "A2DeskTop-VERA.po",
  status: "",
  motorRunning: false,
  diskHasChanges: false,
  isWriteProtected: false,
  diskData: new Uint8Array(fs.readFileSync(PO_PATH)),
  lastAppleWriteTime: 0,
  cloudData: null,
  writableFileHandle: null,
  lastLocalFileWriteTime: 0,
})

// The welcome text only stays on screen for a few hundred frames, and how many
// depends on the CPU speed (the IIgs boots at 2.8 MHz, where A2DeskTop's GS/OS
// startup takes the screen over almost immediately), so the run loop watches
// every frame instead of sampling one at the end.
let sawProDos = false

const run = (frames: number) => {
  for (let f = 0; f < frames; f++) {
    jest.advanceTimersByTime(17)
    if (!sawProDos && (f & 3) === 3 && bootedProDos()) sawProDos = true
  }
}

const screenText = () => {
  const lines: string[] = []
  for (let row = 0; row < 24; row++) {
    let line = ""
    const base = 0x400 + (row % 8) * 0x80 + Math.floor(row / 8) * 0x28
    for (let col = 0; col < 40; col++) {
      const ch = memory[base + col] & 0x7F
      line += (ch >= 32 && ch < 127) ? String.fromCharCode(ch) : " "
    }
    if (line.trim().length > 0) lines.push(line.replace(/\s+$/, ""))
  }
  return lines.join("\n")
}

const bootedProDos = () => /ProDOS\s*8/i.test(screenText())

// mountAtBoot: disk present when doBoot() runs. doAReset: Ctrl-Reset afterwards.
const scenario = (mountAtBoot: boolean, doAReset: boolean) => {
  sawProDos = false
  doSetMachineName("APPLE2GS")
  if (mountAtBoot) expect(doSetEmuDriveNewData(mkProps(2))).toBe(true)
  doSetRunMode(RUN_MODE.NEED_BOOT)
  doSetRunMode(RUN_MODE.RUNNING, false)
  run(mountAtBoot ? 1500 : 300)
  if (!mountAtBoot) {
    expect(doSetEmuDriveNewData(mkProps(2))).toBe(true)
  }
  if (doAReset) {
    clearRomTrace()
    // Watch only the post-reset boot; the cold boot above is test 1's job.
    sawProDos = false
    doReset()
    doSetRunMode(RUN_MODE.RUNNING, false)
    run(1500)
  }
  // console.log(`[STATS] ${JSON.stringify(getIwmReadStats())}`)
  if (doAReset && process.env.GS_TRACE_OUT) {
    // Set GS_TRACE_OUT to a path to dump the post-reset PC trace so it can be
    // diffed against a browser run (see AGENTS.md section 26b).
    fs.writeFileSync(process.env.GS_TRACE_OUT, JSON.stringify(getRomTrace()))
  }
  return sawProDos
}

describe("Apple IIgs 5.25 inch floppy boot", () => {
  beforeEach(() => {
    jest.useFakeTimers()
    setIsTesting()
    setRomTraceEnabled(true)
  })

  afterEach(() => {
    setRomTraceEnabled(false)
    doSetRunMode(RUN_MODE.PAUSED, false)
    resetCpuSpeedForTesting()
    jest.useRealTimers()
  })

  test("boots a 5.25 inch disk that is present at power-on", () => {
    expect(scenario(true, false)).toBe(true)
  }, 900000)

  test("Ctrl-Reset after a completed 5.25 boot warm-starts at the disk's prompt", () => {
    sawProDos = false
    doSetMachineName("APPLE2GS")
    expect(doSetEmuDriveNewData(mkProps(2))).toBe(true)
    doSetRunMode(RUN_MODE.NEED_BOOT)
    doSetRunMode(RUN_MODE.RUNNING, false)
    run(1500)
    expect(sawProDos).toBe(true)
    const signature = [0, 1, 2].map((i) => memGet24(0x03f2 + i) & 0xff)
    resetIwmReadStats()
    doReset()
    // Programmer's Guide: a Ctrl-Reset is warm and preserves $03F2-$03F4, then
    // takes the booted OS's warm entry instead of replaying the cold scan.
    expect([0, 1, 2].map((i) => memGet24(0x03f2 + i) & 0xff)).toEqual(signature)
    doSetRunMode(RUN_MODE.RUNNING, false)
    run(1500)
    expect(getIwmReadStats().reads).toBe(0)
    expect(screenText()).toContain("*")
  }, 900000)

  test("boots a 5.25 inch disk mounted after power-on, on Ctrl-Reset", () => {
    expect(scenario(false, true)).toBe(true)
  }, 900000)

  test("the head is recalibrated to track 0 on reset, not parked at the outer stop", () => {
    doSetMachineName("APPLE2GS")
    expect(doSetEmuDriveNewData(mkProps(2))).toBe(true)
    doSetRunMode(RUN_MODE.NEED_BOOT)
    doSetRunMode(RUN_MODE.RUNNING, false)
    run(600)
    doReset()
    const ds = getDriveStateByIndex(2)
    expect(ds.quarterTrack).toBe(0)
    expect(ds.quarterTrack).not.toBe(ds.maxQuarterTrack)
  }, 900000)

  // Instrumentation for the open browser question: if the run loop ever leaves
  // a gap long enough for one data-register read to rotate past a track, the
  // drive loses sync and the ROM cannot find the boot sector. These are the
  // numbers to compare against a browser run.
  test("IWM read-cadence stats are collected and show no track-crossing reads", () => {
    doSetMachineName("APPLE2GS")
    expect(doSetEmuDriveNewData(mkProps(2))).toBe(true)
    doSetRunMode(RUN_MODE.NEED_BOOT)
    doSetRunMode(RUN_MODE.RUNNING, false)
    run(1500)
    const stats = getIwmReadStats()
    // console.log(`[IWMSTATS] ${JSON.stringify(stats)}`)
    expect(stats.reads).toBeGreaterThan(1000)
    expect(stats.maxGapCycles).toBeGreaterThan(0)
    expect(stats.maxBitsPerRead).toBeGreaterThan(0)
  }, 900000)
})
