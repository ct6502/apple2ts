import { doSetMachineName, doSetRunMode, doReset, resetCpuSpeedForTesting } from "./motherboard"
import { memGet24, getTextPageAsString } from "./memory"
import { iigsADB } from "./iigs_adb"
import { doSetEmuDriveNewData } from "./devices/drivestate"
import { getIwmReadStats, resetIwmReadStats, type IwmReadStats } from "./devices/diskdata"
import { RUN_MODE } from "../common/utility"
import { setIsTesting } from "./worker2main"
import * as fs from "fs"

// Bug 3 regression: the IIgs Ctrl-Reset signature ($03F2-$03F4) is written
// twice during a cold boot. The ROM device scan initially writes the warm
// signature $00/$E0/$45 (complement-valid: $E0 ^ $A5 == $45); after the boot
// completes the startup OS writes its booted warm signature $59/$FF/$5A.
//
// Per the Apple II/IIgs Programmer's Guide, $03F2/$03F3 are the little-endian
// warm-start target and $03F4 is the checksum ($03F3 ^ $A5). A Ctrl-Reset is a
// warm reset: it must preserve $03F2-$03F4, not zero them. Only power-on is a
// cold start that invalidates the signature. The mid-boot cases below press
// Ctrl-Reset twice and check that the ADB marker survives, that the signature
// stays checksum-valid after each press, and that the machine ends on the
// Applesoft prompt the way a real Ctrl-Reset aborts a boot; repeated resets must
// not feel like a power-on cold start. With floppy media attached, Ctrl-Reset
// after boot keeps the signature and warm starts instead of replaying the cold
// device scan (gs_warm_start_signature.test pins the DOS $9DBF and ProDOS $BE00
// vectors). doBoot() remains the only path that cold-resets the ADB and clears
// the signature.
//
// The after-boot and no-media cases protect the intended paths; the two
// *_during_boot cases pin the mid-boot warm-ADB/warm-signature behavior.

const DISK_525_PATH =
  process.env.GS_RESET_SIG_525_PATH || "public/disks/A2DeskTop-VERA.po"
const DISK_35_PATH =
  process.env.GS_RESET_SIG_35_PATH || "public/disks/Tass Times.2mg"
const HAS_525 = fs.existsSync(DISK_525_PATH)
const HAS_35 = fs.existsSync(DISK_35_PATH)

const PROVISIONAL_SIGNATURE = [0x00, 0xe0, 0x45] as const
const BOOTED_SIGNATURE = [0x59, 0xff, 0x5a] as const
const TEST_TIMEOUT = 900000

const sigBytes = () => [
  memGet24(0x03f2) & 0xff,
  memGet24(0x03f3) & 0xff,
  memGet24(0x03f4) & 0xff,
]
const hex = (n: number) => n.toString(16).padStart(2, "0")
const sigText = () => sigBytes().map((b) => `$${hex(b)}`).join(" ")
const isProvisional = () => sigBytes().every((b, i) => b === PROVISIONAL_SIGNATURE[i])
const isBooted = () => sigBytes().every((b, i) => b === BOOTED_SIGNATURE[i])
// The ADB micro's uC RAM $51 holds the ROM's warm-boot marker ($A5). It is the
// only state that distinguishes a Ctrl-Reset from a power-on cold start here.
const adbWarmMarker = () =>
  (iigsADB as unknown as { ucMemory: Uint8Array }).ucMemory[0x51]
const warmComplementValid = () => {
  const sig = sigBytes()
  return sig[1] !== 0 && sig[2] !== 0 && ((sig[1] ^ 0xa5) === sig[2])
}

// Existing tests that mount the same public disk images without copying them.
const clearMedia = () => {
  for (const index of [0, 1, 2, 3, 4, 5]) {
    doSetEmuDriveNewData({
      index,
      hardDrive: index < 2,
      drive: index % 2 === 0 ? 1 : 2,
      filename: "",
      status: "",
      motorRunning: false,
      diskHasChanges: false,
      isWriteProtected: false,
      diskData: new Uint8Array(),
      lastAppleWriteTime: 0,
      cloudData: null,
      writableFileHandle: null,
      lastLocalFileWriteTime: 0,
    } as DriveProps)
  }
}

const mount = (index: number, filename: string) => {
  const diskData = new Uint8Array(fs.readFileSync(filename))
  expect(doSetEmuDriveNewData({
    index,
    hardDrive: false,
    drive: index % 2 === 0 ? 1 : 2,
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

const runFrames = (count: number) => {
  for (let f = 0; f < count; f++) jest.advanceTimersByTime(17)
}

const boot = (index: number, filename: string) => {
  mount(index, filename)
  doSetRunMode(RUN_MODE.NEED_BOOT)
  doSetRunMode(RUN_MODE.RUNNING, false)
}

const resetStats = () => resetIwmReadStats()

// Capture device evidence from the IWM registers used by the boot/device scan.
// These reads are part of the measured behavior, not just a comment.

const logEvidence = (label: string, stats: IwmReadStats) => {
  // console.log(`[reset-sig] ${label} signature=${sigText()} ` +
    // `warm=${warmComplementValid()} reads=${stats.reads} ` +
    // `gapCycles=${stats.totalGapCycles} maxBits=${stats.maxBitsPerRead} ` +
    // `iwm=$C0E0-$C0EF=${iwmWindow()}`)
}

const signatureTimeline = (frames: number) => {
  resetStats()
  let previous = sigText()
  const transitions: { frame: number, sig: string, reads: number }[] = []
  for (let frame = 0; frame < frames; frame++) {
    runFrames(1)
    const current = sigText()
    if (current !== previous) {
      transitions.push({ frame, sig: current, reads: getIwmReadStats().reads })
      previous = current
    }
  }
  return transitions
}

beforeEach(() => {
  jest.useFakeTimers()
  setIsTesting()
  doSetMachineName("APPLE2GS")
  clearMedia()
})

afterEach(() => {
  doSetRunMode(RUN_MODE.PAUSED, false)
  resetCpuSpeedForTesting()
  jest.useRealTimers()
})

if (HAS_525) {
  test("5.25 boot writes provisional device-scan signature then booted warm signature", () => {
    boot(2, DISK_525_PATH)
    // Frame budgets are measured under the honoured $C036 slow clock: the boot's 1 MHz phases execute less guest code per refresh, so the same boot needs more frames (provisional at f=62, booted at f=227 for A2DeskTop-VERA).
    const transitions = signatureTimeline(260)
    expect(transitions.length).toBeGreaterThanOrEqual(2)
    expect(transitions[0].sig).toBe("$00 $e0 $45")
    expect(transitions.at(-1)!.sig).toBe("$59 $ff $5a")
    expect(transitions[0].frame).toBeLessThan(transitions.at(-1)!.frame)
    expect(transitions.at(-1)!.reads).toBeGreaterThan(1000)
    expect(isBooted()).toBe(true)
    // console.log(`[reset-sig] 5.25 transitions=${JSON.stringify(transitions)}`)
  }, TEST_TIMEOUT)

  test("Ctrl-Reset during 5.25 boot stays warm and lands at the prompt", () => {
    boot(2, DISK_525_PATH)
    runFrames(120)
    expect(isProvisional()).toBe(true)
    expect(warmComplementValid()).toBe(true)
    const warmAdb = adbWarmMarker()
    expect(warmAdb).toBe(0xa5)
    doReset()
    const immediate = sigBytes()
    // A real Ctrl-Reset keeps the ADB micro's RAM and the Programmer's Guide
    // signature: the provisional $00/$E0/$45 is still checksum-valid, so the
    // warm reset must preserve it rather than zero it into the cold scan path.
    expect(immediate).toEqual([...PROVISIONAL_SIGNATURE])
    expect(adbWarmMarker()).toBe(warmAdb)
    // Press Ctrl-Reset a second time while the provisional warm entry is still
    // in flight: the warm marker must survive. This is the "holding Reset does
    // not feel like a full cold start every time" case.
    resetStats()
    doSetRunMode(RUN_MODE.RUNNING, false)
    runFrames(30)
    doReset()
    expect(adbWarmMarker()).toBe(warmAdb)
    // The ROM's provisional warm path stores the startup slot in $03F2
    // (FF:FEE6 with Y=3), so the low byte becomes 3 while the checksum-valid
    // $E0/$45 tail survives. The signature is still warm, not cold-zeroed.
    expect(sigBytes()[1]).toBe(0xe0)
    expect(sigBytes()[2]).toBe(0x45)
    expect(warmComplementValid()).toBe(true)
    // A Ctrl-Reset during boot aborts the boot the way real hardware does: the
    // ROM enters the provisional warm path (startup slot 3 is the text card) and
    // lands on the Applesoft prompt instead of replaying the cold device scan.
    doSetRunMode(RUN_MODE.RUNNING, false)
    runFrames(420)
    expect(getTextPageAsString()).toContain("]")
    logEvidence("5.25-during post-reset", getIwmReadStats())
  }, TEST_TIMEOUT)

  test("Ctrl-Reset after 5.25 boot keeps signature and warm-starts", () => {
    boot(2, DISK_525_PATH)
    runFrames(260)
    expect(isBooted()).toBe(true)
    doReset()
    expect(sigBytes()).toEqual([0x59, 0xff, 0x5a])
    expect(adbWarmMarker()).toBe(0xa5)
    resetStats()
    doSetRunMode(RUN_MODE.RUNNING, false)
    runFrames(240)
    const stats = getIwmReadStats()
    // The guide's warm vector ($59/$FF/$5A -> $FF59) resumes the booted OS
    // without the cold device scan.
    expect(stats.reads).toBe(0)
    logEvidence("5.25-after post-reset", stats)
    expect(isBooted()).toBe(true)
    // console.log(`[reset-sig] 5.25-after boot reads=${before}`)
  }, TEST_TIMEOUT)

  test("Ctrl-Reset before signature is written rescans and boots", () => {
    boot(2, DISK_525_PATH)
    runFrames(30)
    expect(sigBytes()).toEqual([0, 0, 0])
    const warmAdb = adbWarmMarker()
    doReset()
    expect(sigBytes()).toEqual([0, 0, 0])
    expect(adbWarmMarker()).toBe(warmAdb)
    resetStats()
    doSetRunMode(RUN_MODE.RUNNING, false)
    runFrames(320)
    expect(isBooted()).toBe(true)
    logEvidence("5.25-pre-signature post-reset", getIwmReadStats())
  }, TEST_TIMEOUT)
} else {
  test("5.25 reset signature scenarios skipped (set GS_RESET_SIG_525_PATH)", () => {
    // console.log(`[reset-sig] missing 5.25 image ${DISK_525_PATH}`)
  })
}

if (HAS_35) {
  test("3.5 boot writes provisional device-scan signature then booted warm signature", () => {
    boot(4, DISK_35_PATH)
    // Measured under the honoured slow clock: provisional at f=95, booted at f=352 for Tass Times.2mg; the title later reuses $03F2-$03F4 for its own warm-start vector (f=535), so stop the timeline before that.
    // Our IWM /ENBL latch and Sony spin-down model make the 3.5-inch boot about a second longer than the forced fast clock did: the booted signature lands near frame 411, so budget past it.
    const transitions = signatureTimeline(470)
    expect(transitions.length).toBeGreaterThanOrEqual(2)
    expect(transitions[0].sig).toBe("$00 $e0 $45")
    expect(transitions.at(-1)!.sig).toBe("$59 $ff $5a")
    expect(isBooted()).toBe(true)
    // console.log(`[reset-sig] 3.5 transitions=${JSON.stringify(transitions)}`)
  }, TEST_TIMEOUT)

  test("Ctrl-Reset during 3.5 boot stays warm and lands at the prompt", () => {
    boot(4, DISK_35_PATH)
    runFrames(150)
    expect(isProvisional()).toBe(true)
    expect(warmComplementValid()).toBe(true)
    const warmAdb = adbWarmMarker()
    expect(warmAdb).toBe(0xa5)
    doReset()
    const immediate = sigBytes()
    expect(immediate).toEqual([...PROVISIONAL_SIGNATURE])
    expect(adbWarmMarker()).toBe(warmAdb)
    resetStats()
    doSetRunMode(RUN_MODE.RUNNING, false)
    runFrames(20)
    doReset()
    expect(adbWarmMarker()).toBe(warmAdb)
    // Same provisional ROM warm path as the 5.25 case: startup slot goes into
    // $03F2 while $E0/$45 stay warm, never zeroed into the cold scan.
    expect(sigBytes()[1]).toBe(0xe0)
    expect(sigBytes()[2]).toBe(0x45)
    expect(warmComplementValid()).toBe(true)
    // Ctrl-Reset during boot aborts the boot into the Applesoft prompt instead
    // of replaying the cold device scan, matching real Ctrl-Reset behavior.
    doSetRunMode(RUN_MODE.RUNNING, false)
    runFrames(420)
    expect(getTextPageAsString()).toContain("]")
    logEvidence("3.5-during post-reset", getIwmReadStats())
  }, TEST_TIMEOUT)

  test("Ctrl-Reset after 3.5 boot keeps signature and warm-starts", () => {
    boot(4, DISK_35_PATH)
    runFrames(470)
    expect(isBooted()).toBe(true)
    doReset()
    expect(sigBytes()).toEqual([0x59, 0xff, 0x5a])
    expect(adbWarmMarker()).toBe(0xa5)
    resetStats()
    doSetRunMode(RUN_MODE.RUNNING, false)
    runFrames(320)
    const stats = getIwmReadStats()
    // The guide's warm vector ($59/$FF/$5A -> $FF59) resumes the booted OS
    // without a cold device scan, so this count is zero.
    expect(stats.reads).toBe(0)
    logEvidence("3.5-after post-reset", stats)
    expect(isBooted()).toBe(true)
  }, TEST_TIMEOUT)
} else {
  test("3.5 reset signature scenarios skipped (set GS_RESET_SIG_35_PATH)", () => {
    // console.log(`[reset-sig] missing 3.5 image ${DISK_35_PATH}`)
  })
}

test("Ctrl-Reset with no media keeps the warm signature and does no IWM scan", () => {
  // No media: start the cold boot directly after beforeEach cleared the drives.
  doSetRunMode(RUN_MODE.NEED_BOOT)
  doSetRunMode(RUN_MODE.RUNNING, false)
  runFrames(600)
  expect(isProvisional()).toBe(true)
  expect(warmComplementValid()).toBe(true)
  doReset()
  expect(isProvisional()).toBe(true)
  resetStats()
  doSetRunMode(RUN_MODE.RUNNING, false)
  runFrames(600)
  const stats = getIwmReadStats()
  expect(stats.reads).toBe(0)
  // The warm path keeps $03F3/$03F4 (so a second Ctrl-Reset is still warm) but
  // records the startup slot in $03F2 (FF:FEE6 STY $03F2 with Y=3), which is why
  // the low byte is no longer the provisional $00. The cold path instead zeroes
  // $03F3/$03F4 (FF:85B2), so asserting the high byte and its complement is
  // what proves the ROM took the warm branch. gs_ctrl_reset.test.ts checks that
  // this branch reaches the Applesoft prompt.
  const sig = sigBytes()
  expect(sig[1]).toBe(0xe0)
  expect(sig[2]).toBe(0x45)
  expect(warmComplementValid()).toBe(true)
  logEvidence("no-media post-reset", stats)
}, TEST_TIMEOUT)
