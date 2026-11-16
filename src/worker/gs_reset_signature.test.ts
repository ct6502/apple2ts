import { doSetMachineName, doSetRunMode, doReset, resetCpuSpeedForTesting } from "./motherboard"
import { memGet24 } from "./memory"
import { doSetEmuDriveNewData } from "./devices/drivestate"
import { getIwmReadStats, resetIwmReadStats, type IwmReadStats } from "./devices/diskdata"
import { RUN_MODE } from "../common/utility"
import { setIsTesting } from "./worker2main"
import * as fs from "fs"

// Bug 3 regression: the IIgs Ctrl-Reset signature ($03F2-$03F4) is written
// twice during a cold boot. The ROM device scan initially writes the warm
// signature $00/$E0/$45 (complement-valid: $E0 ^ $A5 == $45); that signature
// points the warm reset vector at the boot/device-scan code. Only after the
// boot completes does ProDOS write its normal signature $59/$FF/$5A.
//
// Ctrl-Reset while that provisional signature is still current must not leave
// the machine stuck: the mid-boot cases below check that the boot still reaches
// the ProDOS signature (the ROM re-runs the cold device scan because floppy
// media is attached and doReset() cold-resets the ADB). Ctrl-Reset after boot
// zeroes the signature when disk media is attached, forcing the cold device
// scan; with no media the ROM's warm signature is kept and the machine lands on
// the Applesoft prompt (gs_ctrl_reset.test.ts). The ADB micro's uC RAM $51
// carries the ROM's warm-boot marker, so doReset() cold-resets the ADB only
// when floppy media is attached (see iigsADB.reset / motherboard resetMachine).
//
// The after-boot and no-media cases protect the intended paths; the two
// *_during_boot cases pin the mid-boot preservation.

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
const iwmWindow = () => {
  const bytes: string[] = []
  for (let i = 0; i < 16; i++) bytes.push(hex(memGet24(0xc0e0 + i) & 0xff))
  return bytes.join(" ")
}

const logEvidence = (label: string, stats: IwmReadStats) => {
  console.log(`[reset-sig] ${label} signature=${sigText()} ` +
    `warm=${warmComplementValid()} reads=${stats.reads} ` +
    `gapCycles=${stats.totalGapCycles} maxBits=${stats.maxBitsPerRead} ` +
    `iwm=$C0E0-$C0EF=${iwmWindow()}`)
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
  test("5.25 boot writes provisional device-scan signature then ProDOS signature", () => {
    boot(2, DISK_525_PATH)
    const transitions = signatureTimeline(180)
    expect(transitions.length).toBeGreaterThanOrEqual(2)
    expect(transitions[0].sig).toBe("$00 $e0 $45")
    expect(transitions.at(-1)!.sig).toBe("$59 $ff $5a")
    expect(transitions[0].frame).toBeLessThan(transitions.at(-1)!.frame)
    expect(transitions.at(-1)!.reads).toBeGreaterThan(1000)
    expect(isBooted()).toBe(true)
    console.log(`[reset-sig] 5.25 transitions=${JSON.stringify(transitions)}`)
  }, TEST_TIMEOUT)

  test("Ctrl-Reset during 5.25 boot preserves provisional warm signature", () => {
    boot(2, DISK_525_PATH)
    runFrames(45)
    expect(isProvisional()).toBe(true)
    expect(warmComplementValid()).toBe(true)
    const before = sigBytes()
    doReset()
    const immediate = sigBytes()
    console.log(`[reset-sig] 5.25-during before=${JSON.stringify(before)} immediate=${JSON.stringify(immediate)}`)
    // Correct ROM semantics: the provisional signature is valid and warm
    // reset must resume the in-flight boot/device scan, not zero it.
    expect(immediate).toEqual([...PROVISIONAL_SIGNATURE])
    resetStats()
    doSetRunMode(RUN_MODE.RUNNING, false)
    runFrames(180)
    expect(isBooted()).toBe(true)
    logEvidence("5.25-during post-reset", getIwmReadStats())
  }, TEST_TIMEOUT)

  test("Ctrl-Reset after 5.25 boot zeroes signature and cold-scans", () => {
    boot(2, DISK_525_PATH)
    runFrames(180)
    expect(isBooted()).toBe(true)
    const before = getIwmReadStats().reads
    doReset()
    expect(sigBytes()).toEqual([0, 0, 0])
    resetStats()
    doSetRunMode(RUN_MODE.RUNNING, false)
    runFrames(180)
    const stats = getIwmReadStats()
    expect(stats.reads).toBeGreaterThan(1000)
    logEvidence("5.25-after post-reset", stats)
    expect(isBooted()).toBe(true)
    console.log(`[reset-sig] 5.25-after boot reads=${before}`)
  }, TEST_TIMEOUT)

  test("Ctrl-Reset before signature is written remains cold", () => {
    boot(2, DISK_525_PATH)
    runFrames(30)
    expect(sigBytes()).toEqual([0, 0, 0])
    doReset()
    expect(sigBytes()).toEqual([0, 0, 0])
    resetStats()
    doSetRunMode(RUN_MODE.RUNNING, false)
    runFrames(180)
    expect(isBooted()).toBe(true)
    logEvidence("5.25-pre-signature post-reset", getIwmReadStats())
  }, TEST_TIMEOUT)
} else {
  test("5.25 reset signature scenarios skipped (set GS_RESET_SIG_525_PATH)", () => {
    console.log(`[reset-sig] missing 5.25 image ${DISK_525_PATH}`)
  })
}

if (HAS_35) {
  test("3.5 boot writes provisional device-scan signature then ProDOS signature", () => {
    boot(4, DISK_35_PATH)
    const transitions = signatureTimeline(300)
    expect(transitions.length).toBeGreaterThanOrEqual(2)
    expect(transitions[0].sig).toBe("$00 $e0 $45")
    expect(transitions.at(-1)!.sig).toBe("$59 $ff $5a")
    expect(isBooted()).toBe(true)
    console.log(`[reset-sig] 3.5 transitions=${JSON.stringify(transitions)}`)
  }, TEST_TIMEOUT)

  test("Ctrl-Reset during 3.5 boot preserves provisional warm signature", () => {
    boot(4, DISK_35_PATH)
    runFrames(60)
    expect(isProvisional()).toBe(true)
    expect(warmComplementValid()).toBe(true)
    const before = sigBytes()
    doReset()
    const immediate = sigBytes()
    console.log(`[reset-sig] 3.5-during before=${JSON.stringify(before)} immediate=${JSON.stringify(immediate)}`)
    expect(immediate).toEqual([...PROVISIONAL_SIGNATURE])
    resetStats()
    doSetRunMode(RUN_MODE.RUNNING, false)
    runFrames(300)
    expect(isBooted()).toBe(true)
    logEvidence("3.5-during post-reset", getIwmReadStats())
  }, TEST_TIMEOUT)

  test("Ctrl-Reset after 3.5 boot zeroes signature and cold-scans", () => {
    boot(4, DISK_35_PATH)
    runFrames(300)
    expect(isBooted()).toBe(true)
    doReset()
    expect(sigBytes()).toEqual([0, 0, 0])
    resetStats()
    doSetRunMode(RUN_MODE.RUNNING, false)
    runFrames(300)
    const stats = getIwmReadStats()
    expect(stats.reads).toBeGreaterThan(1000)
    logEvidence("3.5-after post-reset", stats)
    expect(isBooted()).toBe(true)
  }, TEST_TIMEOUT)
} else {
  test("3.5 reset signature scenarios skipped (set GS_RESET_SIG_35_PATH)", () => {
    console.log(`[reset-sig] missing 3.5 image ${DISK_35_PATH}`)
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
