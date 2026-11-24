import {
  doSetMachineName,
  doSetRunMode,
  doSetSpeedMode,
  gsSlot5EnblReleaseCountForTesting,
  gsSlot5SettleSkipCountForTesting,
  resetCpuSpeedForTesting,
  resetGsSlot5EnblReleaseCountForTesting,
  setGsDiskLoadAccelerationForTesting,
} from "./motherboard"
import { doSetEmuDriveNewData, getDriveStateByIndex } from "./devices/drivestate"
import { getTextPage } from "./memory"
import { s6502 } from "./instructions"
import { RUN_MODE } from "../common/utility"
import { setIsTesting } from "./worker2main"
import * as fs from "fs"

// Regression for "the built-in 3.5" drive also feels a bit slow" (team task-15,
// the slot-5 half; the slot-6 5.25" half landed as gs_slot6_speed.test.ts).
//
// Measured on this checkout by booting public/disks/Eamon 1.po (ProDOS 8, a
// 1600-block / 800 KB volume) in the slot-5 bay until the Eamon banner page
// appears on the text screen:
//
//   acceleration        frames   cycles      revolutions  head position
//   off                 747      30,633,792  47           quarter track 54 (~track 14)
//   on: /ENBL only      688      27,830,143  47           quarter track 54 (~track 14)
//   on: + settle skip   654      27,389,351  47           quarter track 54 (~track 14)
//
// The boot is media-bound, not defect-bound: 47 revolutions of a 77,776-cell
// track at the 2 us 3.5" cell is 7.3 s of a 12.7 s boot (a real 800K track holds
// 77,047 cells - Cavern_Cobra_IIgs.woz track 0 - so the emulated geometry is
// within 1% of the media), and it only ever seeks out to track 14. There is no
// whole-volume scan and no per-access track decode: buildFloppy35Bitstream runs
// once at mount and the read path is a latch over the bit stream. Forcing the
// bit-cell rate to 0.5x during this investigation *broke* the boot - 13
// revolutions, the head never left track 0 - because the ROM's byte-serial
// reader cannot outrun the media, so the pacing is load-bearing. A separate
// measurement put the usable range at 0.75x-0.9x: 645/603/589 frames with the
// correct banner at 0.9/0.8/0.75, still 47 revolutions and the same head
// position, so the media clock is not free headroom for this bug either.
//
// The two emulator-side costs left are both pure waits. The MC14536 /ENBL
// holdover: the ROM's 3.5" nibble reader ($6A6E in the bank $E1 ROM image) runs
// the SELIWM sequence $C0EE/$C0ED/$C0EE and polls status bit 5 until /ENBL
// drops; the boot starts by probing the 5.25" bay, and its ENABLE release arms
// the full one-second holdover, so the first 3.5" byte waits 2,808,604 cycles
// (59 frames, 0.98 s) doing nothing at all - no media is moving and no read is
// in flight. And the driver's slow-mode settle wait at FF:$5E89: its nested
// DEC $68/$69 loop burns ~55k cycles on each of the 8 calls this boot makes
// (440,804 cycles, 34 frames), and it is skipped at the loop head so the
// routine's own $C036 slow/fast writes still run in order. motherboard.ts now
// retires both, which is the same trade the classic II loader already gets:
// the browser's load acceleration may skip pure CPU waits. The media work is
// unchanged - every run consumes the same 47 revolutions and stops at the same
// quarter track - and the unaccelerated boot keeps its original 747 frames,
// which is what pins the change to the waits and not to the drive model.
const DISK_PATH = "public/disks/Eamon 1.po"
const DISK_INDEX = 4 // slot 5, drive 1
const BANNER = /Eamon Adventurer's Guild|Hawkhaven Drive/i
// The banner page is reached, not the finished program: the boot is what the
// slot-5 media rate governs.
const FRAME_LIMIT = 3000

const hasDisk = fs.existsSync(DISK_PATH)
const describeOrSkip = hasDisk ? describe : describe.skip

const textPage = () => {
  const tp = getTextPage()
  const cols = tp.length >= 80 * 24 ? 80 : 40
  let out = ""
  for (let r = 0; r < 24; r++) {
    let line = ""
    for (let c = 0; c < cols; c++) {
      const b = tp[r * cols + c] & 0x7F
      line += b >= 32 && b < 127 ? String.fromCharCode(b) : " "
    }
    out += line.replace(/\s+$/, "") + "\n"
  }
  return out
}

interface BootResult {
  frames: number
  cycles: number
  revolutions: number
  quarterTracks: number
  // Bit offset the head reached on the current quarter track: one revolution is
  // 77,776 cells, so a healthy boot walks the whole track.
  maxBitOffset: number
  enblReleases: number
  settleSkips: number
  screen: string
}

const boot = (accelerated: boolean): BootResult => {
  setGsDiskLoadAccelerationForTesting(accelerated)
  resetGsSlot5EnblReleaseCountForTesting()
  doSetMachineName("APPLE2GS")
  // The ROM's 3.5" driver runs at 2.8 MHz fast mode; slow mode cannot keep up
  // with the media (see gs_floppy35_boot.test.ts). The speed only sets the
  // cycle budget, so the frames stay comparable between the two runs.
  doSetSpeedMode(1)
  const mounted = doSetEmuDriveNewData({
    index: DISK_INDEX,
    hardDrive: false,
    drive: 1,
    filename: "Eamon 1.po",
    status: "",
    motorRunning: false,
    diskHasChanges: false,
    isWriteProtected: false,
    diskData: new Uint8Array(fs.readFileSync(DISK_PATH)),
    lastAppleWriteTime: 0,
    cloudData: null,
    writableFileHandle: null,
    lastLocalFileWriteTime: 0,
  } as DriveProps)
  doSetRunMode(RUN_MODE.NEED_BOOT)
  doSetRunMode(RUN_MODE.RUNNING, false)
  const startCycles = s6502.cycleCount
  const ds = getDriveStateByIndex(DISK_INDEX)
  let frames = 0
  let revolutions = 0
  let lastLocation = ds.trackLocation
  let quarterTracks = 0
  let maxBitOffset = 0
  let screen = ""
  while (frames < FRAME_LIMIT) {
    jest.advanceTimersByTime(17)
    frames++
    const location = ds.trackLocation
    // The bit stream is linear in quarter tracks, so a wrapped location is one
    // revolution of the track the head is on.
    if (location < lastLocation) revolutions++
    lastLocation = location
    quarterTracks = Math.max(quarterTracks, ds.quarterTrack)
    maxBitOffset = Math.max(maxBitOffset, location)
    screen = textPage()
    if (BANNER.test(screen)) break
  }
  const result: BootResult = {
    frames,
    cycles: s6502.cycleCount - startCycles,
    revolutions,
    quarterTracks,
    maxBitOffset,
    enblReleases: gsSlot5EnblReleaseCountForTesting(),
    settleSkips: gsSlot5SettleSkipCountForTesting(),
    screen,
  }
  doSetRunMode(RUN_MODE.PAUSED, false)
  setGsDiskLoadAccelerationForTesting(false)
  resetCpuSpeedForTesting()
  if (!mounted) result.frames = -1
  return result
}

const results = new Map<boolean, BootResult>()
const measure = (accelerated: boolean): BootResult =>
  results.get(accelerated) ?? { frames: -1, cycles: 0, revolutions: 0, quarterTracks: 0, maxBitOffset: 0, enblReleases: 0, settleSkips: 0, screen: "" }

describeOrSkip("IIgs slot 5 3.5\" boot speed", () => {
  // One boot per acceleration mode, in a fixed order, before any assertion: the
  // unaccelerated run is the baseline and must be measured before the
  // accelerated one can touch any shared timer state.
  beforeAll(() => {
    jest.useFakeTimers()
    setIsTesting()
    results.set(false, boot(false))
    results.set(true, boot(true))
  })

  afterAll(() => {
    doSetRunMode(RUN_MODE.PAUSED, false)
    setGsDiskLoadAccelerationForTesting(false)
    resetCpuSpeedForTesting()
    jest.useRealTimers()
  })

  test("boots the Eamon 1.po volume from slot 5 in both acceleration modes", () => {
    expect(measure(false).frames).toBeGreaterThan(0)
    expect(measure(true).frames).toBeGreaterThan(0)
    expect(BANNER.test(measure(false).screen)).toBe(true)
    expect(BANNER.test(measure(true).screen)).toBe(true)
  })

  test("the unaccelerated slot-5 boot still costs what it did (747 frames, 47 revolutions)", () => {
    const slow = measure(false)
    // Media-bound budget: a whole-volume read of this 1600-block / 160-track
    // volume would need several hundred revolutions, so anything near that is
    // the regression this test exists to catch.
    expect(slow.revolutions).toBeGreaterThanOrEqual(40)
    expect(slow.revolutions).toBeLessThanOrEqual(60)
    expect(slow.quarterTracks).toBeGreaterThanOrEqual(40)
    expect(slow.quarterTracks).toBeLessThanOrEqual(60)
    // One revolution is 77,776 bit cells at 2 us; the head must actually walk a
    // full track, not get stuck at a sync byte.
    expect(slow.maxBitOffset).toBeGreaterThan(70_000)
    expect(slow.frames).toBeGreaterThanOrEqual(700)
    expect(slow.frames).toBeLessThanOrEqual(800)
    // The whole boot at 2.8 MHz; the media alone is 47 x 426,990 = 20.1M cycles.
    expect(slow.cycles).toBeGreaterThan(29_500_000)
    expect(slow.cycles).toBeLessThan(31_500_000)
  })

  test("the acceleration retires the /ENBL holdover and the ROM settle waits", () => {
    const slow = measure(false)
    const fast = measure(true)
    // Holdover: 2,808,604 cycles / 47,052 cycles per frame = 59 frames, one second
    // of the MC14536 tail. Settle waits: 8 calls x ~55k slow-mode cycles = 440,804
    // cycles, 34 frames. Together 93 frames; before either fix the accelerated run
    // was identical to the unaccelerated one (747 frames) and this bound failed.
    expect(fast.frames).toBeLessThanOrEqual(slow.frames - 85)
    expect(fast.cycles).toBeLessThan(slow.cycles - 2_800_000)
    expect(slow.enblReleases).toBe(0)
    expect(slow.settleSkips).toBe(0)
    expect(fast.enblReleases).toBe(1)
    expect(fast.settleSkips).toBe(8)
  })

  test("leaves the slot-5 media work identical in both modes", () => {
    // The acceleration may only move the CPU clock through a wait the guest does
    // anyway: the number of revolutions and the tracks the head reaches must stay
    // put, or the drive model itself was fast-forwarded.
    const slow = measure(false)
    const fast = measure(true)
    expect(Math.abs(fast.revolutions - slow.revolutions)).toBeLessThanOrEqual(2)
    expect(Math.abs(fast.quarterTracks - slow.quarterTracks)).toBeLessThanOrEqual(2)
    // Neither run rescans the volume: a ProDOS 8 boot of this disk only seeks out
    // to track ~14 of 160, nowhere near a whole-volume read (which would push the
    // quarter track past 600).
    expect(slow.quarterTracks).toBeLessThan(160)
  })
})
