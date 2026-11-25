import {
  doSetMachineName,
  doSetRunMode,
  doSetSpeedMode,
  resetCpuSpeedForTesting,
  setGsDiskLoadAccelerationForTesting,
} from "./motherboard"
import { doSetEmuDriveNewData } from "./devices/drivestate"
import { matchGsLoaderDelayLoop } from "./devices/diskdata"
import { memGet, memGet24, memSet24 } from "./memory"
import { s6502 } from "./instructions"
import { RUN_MODE } from "../common/utility"
import { setIsTesting } from "./worker2main"
import * as fs from "fs"

// Regression for "IIgs slot 6 5.25\" floppy is far slower than the classic II"
// (team task-12).
//
// Measured on this checkout by booting the same 140 KB DOS 3.3 master from slot
// 6 drive 1 until the text page shows "DOS VERSION 3.3":
//
//   machine            clock      frames to banner   boot cycle span
//   classic II (IIe)   1.02 MHz    412-413            7,170,081
//   IIgs, fast mode    2.8  MHz    836 (accel off: 966)  42,244,000
//   IIgs, slow mode    1.02 MHz    2072 (accel off: 2437)  42,271,000
//
// At the *same* 1.02 MHz clock the IIgs burns ~5.9x the classic II's cycles
// while running the same firmware at the same addresses, so this is neither a
// media-rate nor a clock-ratio effect. Both IIgs speed modes also spend the same
// number of CPU cycles, which is what pure CPU busy work looks like.
//
// The work is DOS 3.3's RWTS motor-on delay loop ($3D9E in the boot1 copy, $BD9E
// once DOS relocates the RWTS into the $B900-$BDxx image): the IIgs enters it 21
// times during this boot, each entry costing ~1.01M cycles (18 DEY/BNE
// iterations x 256 x $47), i.e. ~21M cycles, 57% of the boot. motherboard.ts
// already fast-forwards exactly this loop, but only when the PC is *exactly*
// $BD9E, so the $3D9E copy - the one that runs before DOS takes over - was still
// executed instruction by instruction. That is the user's report verbatim:
// "slow before DOS takes over, roughly normal after".
//
// With the loop recognised at every copy (diskdata.matchGsLoaderDelayLoop) the
// IIgs reached the DOS banner in 393 fast-mode frames (0.95x the classic II) and
// 839 slow-mode frames (2.0x), so this test pins the user-visible metric against
// the classic II and pins the classic II's own timing separately.
//
// The task-14 follow-up (the 5.25" read gate honouring the IWM's MC14536 /ENBL
// holdover) removes the second IIgs-only cost these numbers carried: the real
// drive is still clocking bits for a second after ENABLE is released, so DOS'
// "are two consecutive data-register reads different?" motor-on probe answers
// "spinning" and the driver skips its 1.01M-cycle motor-on wait. Re-measured
// after that fix: 263 fast-mode frames (8,747,510 cycles) and 517 slow-mode
// frames (9,573,035 cycles) against the unchanged classic II 413 / 7,170,081.
//
// Round-2 follow-up, measured with a temporary $C08C read log: the boot1 "wait
// for two consecutive equal reads" loops at $3D25-$3D30 and $3D3C-$3D4C behave
// the same on both machines (the classic II leaves the first one on every one of
// its 26 attempts because consecutive reads differ), so the poll's verdict is
// not what differs. Where the time goes does: over the same boot the classic II
// has 7 quiet stretches between disk reads (2.58M cycles, largest 2.16M at the
// post-load idle) and never a ~1.01M-cycle one, while the IIgs has 6 quiet
// stretches totalling 5.03M cycles whose largest is exactly 1,017,927 cycles -
// one full execution of the motor-on delay loop. ProDOS 2.4.3 contains no copy
// of this loop, so it cannot be the cause of the separate report that ProDOS
// disk work is slow after ProDOS' own takeover.
const DOS33_PATH = "C:/dev/emu/ap2/Apple DOS 3.3 August 1980.dsk"
// The master disk is a local fixture (not in the repository), so skip the suite
// where it is absent instead of failing on fs.readFileSync.
const hasDos33Master = fs.existsSync(DOS33_PATH)
const describeOrSkip = hasDos33Master ? describe : describe.skip
const BANNER = "DOS VERSION 3.3"
// Frames the classic II needs for this boot; also the baseline for the IIgs bound.
const IIE_BANNER_FRAMES = 413

const mkProps = (index: number): DriveProps => ({
  index,
  hardDrive: false,
  drive: 1,
  filename: "Apple DOS 3.3 August 1980.dsk",
  status: "",
  motorRunning: false,
  diskHasChanges: false,
  isWriteProtected: true,
  diskData: new Uint8Array(fs.readFileSync(DOS33_PATH)),
  lastAppleWriteTime: 0,
  cloudData: null,
  writableFileHandle: null,
  lastLocalFileWriteTime: 0,
})

// The 40x24 text page, high bit masked: the same page the emulator draws, so the
// banner check works on the classic II and the IIgs alike.
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

// Boot the DOS 3.3 master until the banner is on screen and report how long it
// took in emulated frames (wall time in the GUI) and in guest CPU cycles.
// The banner only counts once the loader has cleared the page, so a leftover
// DOS screen from an earlier boot in this process cannot be mistaken for the
// boot finishing.
const bootToBanner = (machine: "APPLE2EE" | "APPLE2GS", speedMode: number): BootResult => {
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
    const hasBanner = textPage().includes(BANNER)
    if (!cleared) {
      cleared = !hasBanner
      continue
    }
    if (hasBanner) break
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

describeOrSkip("IIgs slot 6 5.25\" boot speed versus the classic II", () => {
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
      results.set(`${machine}-${speedMode}`, bootToBanner(machine, speedMode))
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

  test("the IIgs loads the DOS 3.3 master within 1.5x the classic II's frames", () => {
    const iie = measure("APPLE2EE", 0)
    const gs = measure("APPLE2GS", 1)
    // Default IIgs setting (fast mode) against the classic II profile.
    expect(gs.frames).toBeLessThanOrEqual(1.5 * iie.frames)
  })

  test("spends the same cycles per DOS 3.3 boot in both IIgs speed modes", () => {
    // A media-rate or clock-ratio problem would scale with the clock; the
    // observed cost is cycle-counted busy work, so the two modes must agree.
    // This is what identifies the defect as CPU-side firmware flow rather than
    // the IWM bit-cell rate (which the 3.5" path scales and the 5.25" path does
    // not).
    //
    // After the task-14 fix (the 5.25" read gate now honours the IWM's MC14536
    // /ENBL holdover, see memory.ts), part of the motor-on wait is legitimately
    // skipped in one mode but not the other: the holdover is one *second* of
    // machine time, so at 2.8 MHz it spans 2.8x more CPU cycles than at
    // 1.02 MHz. Measured 8,747,510 (fast) vs 9,573,035 (slow) cycles after the
    // fix, so the two modes agree to ~9% while both remain far under the
    // classic II's cycle count.
    const slow = measure("APPLE2GS", 0)
    const fast = measure("APPLE2GS", 1)
    expect(Math.abs(slow.cycles - fast.cycles)).toBeLessThan(0.12 * fast.cycles)
  })

  test("leaves the classic II boot timing byte-identical", () => {
    const iie = measure("APPLE2EE", 0)
    expect(iie.frames).toBe(IIE_BANNER_FRAMES)
    // Tight window around the measured 7,170,081-cycle span: this is a guard on
    // the classic (Disk II) slot 6 path, which the IIgs-only loader-delay
    // acceleration never touches.
    expect(iie.cycles).toBeGreaterThanOrEqual(7_150_000)
    expect(iie.cycles).toBeLessThanOrEqual(7_190_000)
  })

  test("recognises the DOS 3.3 motor-on delay loop at every copy, not just $BD9E", () => {
    doSetMachineName("APPLE2GS")
    const signature = [
      0xA0, 0x12, 0x88, 0xD0, 0xFD, 0xE6, 0x46, 0xD0, 0xF7, 0xE6, 0x47, 0xD0, 0xF3,
    ]
    // The boot1 copy that runs before DOS relocates the RWTS into the language card.
    for (let i = 0; i < signature.length; i++) memSet24(0x3D9E + i, signature[i])
    expect(matchGsLoaderDelayLoop(0x3D9E, 0, memGet24)).toBe(0x3DAB)
    // The copy DOS' relocation patches into the $B900-$BDxx image.
    for (let i = 0; i < signature.length; i++) memSet24(0xBD9E + i, signature[i])
    expect(matchGsLoaderDelayLoop(0xBD9E, 0, memGet24)).toBe(0xBDAB)
    // Anything that is not the exact loop is left alone: a corrupted counter
    // compare, a non-bank-0 address, and an address inside the loop body.
    memSet24(0x3DA0, 0x00)
    expect(matchGsLoaderDelayLoop(0x3D9E, 0, memGet24)).toBe(-1)
    memSet24(0x3DA0, 0x88)
    expect(matchGsLoaderDelayLoop(0x3D9E, 1, memGet24)).toBe(-1)
    expect(matchGsLoaderDelayLoop(0x3DB0, 0, memGet24)).toBe(-1)
  })
})
