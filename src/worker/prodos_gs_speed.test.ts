import {
  doSetMachineName,
  doSetRunMode,
  doSetSpeedMode,
  resetCpuSpeedForTesting,
  setGsDiskLoadAccelerationForTesting,
} from "./motherboard"
import { doSetEmuDriveNewData } from "./devices/drivestate"
import { memGet } from "./memory"
import { s6502 } from "./instructions"
import { RUN_MODE } from "../common/utility"
import { setIsTesting } from "./worker2main"
import * as fs from "fs"

// Regression for "ProDOS boots fine but disk work is much slower on the IIgs
// once ProDOS is running" (team task-14, the ProDOS half of the slot-6 report).
//
// Measured by booting the same ProDOS 2.4.3 volume (public/disks/ProDOS 2.4.3.po)
// from slot 6 drive 1 through PRODOS' own boot program until its on-screen drive
// line "S6,D1:" appears, i.e. ProDOS has taken over and is driving the disk:
//
//   machine            clock      frames (wall)   boot cycle span
//   classic II (IIe)   1.02 MHz    771             13,386,414
//   IIgs, fast mode    2.8  MHz    877             37,585,664   (before fix)
//   IIgs, slow mode    1.02 MHz    2063            35,798,596   (before fix)
//   IIgs, fast mode    2.8  MHz    393             14,548,332   (after fix)
//   IIgs, slow mode    1.02 MHz    736             12,773,283   (after fix)
//
// At the same 1.02 MHz clock the IIgs used 2.7x the classic II's cycles for the
// same disk and the same firmware, and both IIgs speed modes used about the same
// cycle count, so this was not a media-rate nor a clock-ratio effect: it was
// CPU-side firmware flow, executed identically at either clock.
//
// Where it went, from a temporary PC histogram of the IIgs slow-mode boot: 22.5M
// of the 35.8M cycles (63%) sat in PRODOS' 5.25" spin-up wait - a 0xEE-seeded
// 16-bit timeout polled by an 85-cycle delay at $D385 and entered ~40 times, each
// entry spinning 18 wraps x 256 iterations. Its caller is PRODOS' own "is the
// drive still spinning?" probe at $D4DA: read the IWM data register twice and
// compare. When the two reads differ the drive is still clocking bits, the probe
// says "spinning", and the driver skips the wait. The classic II answered
// "spinning" every time because its drive had been left enabled, so it only paid
// one spin-up wait for the whole boot (4,352 delay iterations against the IIgs'
// 184,842).
//
// The IIgs answer was "not spinning" because PRODOS releases the IWM ENABLE line
// between bursts and the emulator's 5.25" read gate used the raw ENABLE latch, so
// the data register read back the idle 0x80 for both halves of the probe. Real
// hardware does not do that: the IWM's MC14536 keeps /ENBL asserted for one
// further second of machine time (gssquared IWM2::mark_cycles_turnoff, already
// modelled by memory.ts' iwmEnblAsserted()). Honouring that holdover in the 5.25"
// read gate is the one-line fix; the numbers above are this test's baseline.
const PRODOS_PATH = "public/disks/ProDOS 2.4.3.po"
// PRODOS' boot screen prints the volume's drive/slot line once it is in control.
const MARKER = "S6,D1:"
// Frames the classic II needs for this boot; also the baseline for the IIgs bound.
const IIE_MARKER_FRAMES = 771

const mkProps = (index: number): DriveProps => ({
  index,
  hardDrive: false,
  drive: 1,
  filename: "ProDOS 2.4.3.po",
  status: "",
  motorRunning: false,
  diskHasChanges: false,
  isWriteProtected: true,
  diskData: new Uint8Array(fs.readFileSync(PRODOS_PATH)),
  lastAppleWriteTime: 0,
  cloudData: null,
  writableFileHandle: null,
  lastLocalFileWriteTime: 0,
})

// The 40x24 text page, high bit masked: the same page the emulator draws, so the
// marker check works on the classic II and the IIgs alike.
const textPage = () => {
  let text = ""
  for (let addr = 0x400; addr < 0x800; addr++) {
    const value = memGet(addr) & 0x7F
    text += (value >= 0x20 && value < 0x7F) ? String.fromCharCode(value) : " "
  }
  return text
}

interface BootResult {
  frames: number
  cycles: number
}

// Boot PRODOS 2.4.3 from slot 6 drive 1 until its drive line is on screen and
// report how long that took in emulated frames (wall time in the GUI) and guest
// CPU cycles. The marker only counts once the page has been cleared, so a
// leftover screen from an earlier boot in this process cannot be mistaken for
// the boot finishing.
const bootToMarker = (machine: "APPLE2EE" | "APPLE2GS", speedMode: number): BootResult => {
  setGsDiskLoadAccelerationForTesting(true)
  doSetMachineName(machine, true, false)
  doSetSpeedMode(speedMode)
  const mounted = doSetEmuDriveNewData(mkProps(2))
  doSetRunMode(RUN_MODE.NEED_BOOT)
  doSetRunMode(RUN_MODE.RUNNING, false)
  const startCycles = s6502.cycleCount
  let frames = 0
  let cleared = false
  const limit = 4000
  while (frames < limit) {
    jest.advanceTimersByTime(17)
    frames++
    const hasMarker = textPage().includes(MARKER)
    if (!cleared) {
      cleared = !hasMarker
      continue
    }
    if (hasMarker) break
  }
  const result = { frames, cycles: s6502.cycleCount - startCycles }
  doSetRunMode(RUN_MODE.PAUSED, false)
  setGsDiskLoadAccelerationForTesting(false)
  resetCpuSpeedForTesting()
  if (!mounted) result.frames = -1
  return result
}

const results = new Map<string, BootResult>()
const measure = (machine: "APPLE2EE" | "APPLE2GS", speedMode: number): BootResult =>
  results.get(`${machine}-${speedMode}`) ?? { frames: -1, cycles: 0 }

describe("IIgs slot 6 5.25\" ProDOS disk speed once ProDOS is in control", () => {
  // One boot per machine/speed pair, in a fixed order, before any assertion:
  // each boot needs the previous one's machine fully replaced, and the classic
  // II baseline must be measured first so it is not affected by anything later.
  beforeAll(() => {
    jest.useFakeTimers()
    setIsTesting()
    for (const [machine, speedMode] of [
      ["APPLE2EE", 0],
      ["APPLE2GS", 1],
      ["APPLE2GS", 0],
    ] as ["APPLE2EE" | "APPLE2GS", number][]) {
      results.set(`${machine}-${speedMode}`, bootToMarker(machine, speedMode))
    }
  })

  afterAll(() => {
    doSetRunMode(RUN_MODE.PAUSED, false)
    setGsDiskLoadAccelerationForTesting(false)
    resetCpuSpeedForTesting()
    jest.useRealTimers()
  })

  test("records a completed boot on every machine/speed pair", () => {
    expect(measure("APPLE2EE", 0).frames).toBeGreaterThan(0)
    expect(measure("APPLE2GS", 1).frames).toBeGreaterThan(0)
    expect(measure("APPLE2GS", 0).frames).toBeGreaterThan(0)
  })

  test("the IIgs reaches PRODOS' drive line no slower than the classic II", () => {
    const iie = measure("APPLE2EE", 0)
    const gs = measure("APPLE2GS", 1)
    // Default IIgs setting (fast mode) must at least match the classic II. This
    // is the user-visible half of the report and it fails at 877 frames (1.14x)
    // when PRODOS' "is the drive spinning?" probe sees a stopped drive.
    expect(gs.frames).toBeLessThanOrEqual(iie.frames)
  })

  test("the IIgs slow mode stays within 1.2x the classic II's frames", () => {
    const iie = measure("APPLE2EE", 0)
    const gs = measure("APPLE2GS", 0)
    // At the same 1.02 MHz the guest must do comparable work: 736 frames after
    // the fix, 2063 before it, against the classic II's 771.
    expect(gs.frames).toBeLessThanOrEqual(1.2 * iie.frames)
  })

  test("spends comparable cycles at the same clock as the classic II", () => {
    // The decisive cycle-level guard: 12,773,283 (IIgs slow) against
    // 13,386,414 (classic II), i.e. 0.95x. Before the fix it was 35,798,596
    // (2.67x), the signature of a cycle-counted wait the classic II never runs.
    expect(measure("APPLE2GS", 0).cycles).toBeLessThanOrEqual(1.5 * measure("APPLE2EE", 0).cycles)
  })

  test("keeps the IIgs fast-mode boot within the same cycle scale", () => {
    // Fast mode runs 2.8 MHz, so its cycle span is not comparable one-to-one with
    // the classic II, but it must not still carry the ~22.5M-cycle spin-up waits.
    expect(measure("APPLE2GS", 1).cycles).toBeLessThanOrEqual(1.5 * measure("APPLE2EE", 0).cycles)
  })

  test("leaves the classic II boot timing byte-identical", () => {
    const iie = measure("APPLE2EE", 0)
    expect(iie.frames).toBe(IIE_MARKER_FRAMES)
    // Tight window around the measured 13,386,414-cycle span: a guard on the
    // classic (Disk II) slot 6 path, which the IIgs-only holdover fix never
    // touches.
    expect(iie.cycles).toBeGreaterThanOrEqual(13_360_000)
    expect(iie.cycles).toBeLessThanOrEqual(13_410_000)
  })
})
