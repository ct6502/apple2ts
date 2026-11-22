import {
  doSetMachineName, doSetRunMode, doBoot, doReset, resetCpuSpeedForTesting, getCPU,
} from "./motherboard"
import {
  memGet24, memSet24, getTextPageAsString, setIigsRomVersion,
} from "./memory"
import { doSetEmuDriveNewData } from "./devices/drivestate"
import { RUN_MODE } from "../common/utility"
import { setIsTesting, getSpeakerClickCount, resetSpeakerClickCount } from "./worker2main"
import type { CPU65816 } from "./cpu65816"
import * as fs from "fs"

// Bug 4 regression: the Apple II/IIgs Programmer's Guide defines the warm-start
// signature at $03F2-$03F4. $03F2/$03F3 are the little-endian warm target and
// $03F4 is the checksum ($03F3 ^ $A5). A Ctrl-Reset is warm and must preserve
// the signature; only power-on is a cold start that invalidates it. GS-mode
// reset must then jump the guide's warm target: DOS 3.3 writes $BF/$9D/$38 and
// lands on $9DBF with the Applesoft prompt; ProDOS writes $00/$BE/$1B and lands
// on $BE00. Classic machines keep their classic reset path untouched.
//
// Bug 4 also requires reset during the GS boot/slot-scan to behave like
// Ctrl-Reset, not a complete power-on reboot. The provisional ROM signature
// $00/$E0/$45 is checksum-valid, but its zero low byte is not the guide's
// generic JMP ($03F2) target ($E000): the ROM handles it through its provisional
// warm path (FF:FADB LDY #3 / JMP FEE6), so doReset leaves it to the ROM. The
// reset beep is part of that same skipped ROM handler, so a warm start must
// replay the ROM's tone itself.
const PRODOS_DISK = "public/disks/Eamon 1.po"
const DOS33_DISK = process.env.GS_DOS33_PATH
  || "C:\\dev\\emu\\ap2\\Apple DOS 3.3 August 1980.dsk"
const HAS_PRODOS = fs.existsSync(PRODOS_DISK)
const HAS_DOS33 = fs.existsSync(DOS33_DISK)
const TEST_TIMEOUT = 900000

const hex = (n: number) => n.toString(16).padStart(2, "0")
const sigBytes = () => [
  memGet24(0x03f2) & 0xff,
  memGet24(0x03f3) & 0xff,
  memGet24(0x03f4) & 0xff,
]
const sigText = () => sigBytes().map((b) => `$${hex(b)}`).join(" ")
const checksumValid = () => {
  const sig = sigBytes()
  return ((sig[1] ^ 0xa5) & 0xff) === sig[2]
}
const runFrames = (count: number) => {
  for (let f = 0; f < count; f++) jest.advanceTimersByTime(17)
}
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
const seed = (low: number, high: number, checksum: number) => {
  memSet24(0x03f2, low)
  memSet24(0x03f3, high)
  memSet24(0x03f4, checksum)
}
const cpuPC = () => (getCPU() as CPU65816).PC
const setup = (name: "APPLE2GS" | "APPLE2EE") => {
  jest.useFakeTimers()
  setIsTesting()
  setIigsRomVersion("03")
  clearMedia()
  doSetMachineName(name)
}
const teardown = () => {
  doSetRunMode(RUN_MODE.PAUSED, false)
  resetCpuSpeedForTesting()
  jest.useRealTimers()
}
const bootDisk = (index: number, filename: string, frames = 1800) => {
  mount(index, filename)
  doSetRunMode(RUN_MODE.NEED_BOOT)
  doSetRunMode(RUN_MODE.RUNNING, false)
  runFrames(frames)
}

// Manual signature tests always run: they pin the guide vector independently of
// which external DOS 3.3 image is available locally.
test("GS Ctrl-Reset honours DOS 3.3 Bf/9d/38 warm signature -> $9DBF", () => {
  setup("APPLE2GS")
  try {
    doBoot()
    doSetRunMode(RUN_MODE.RUNNING, false)
    runFrames(60)
    seed(0xbf, 0x9d, 0x38)
    expect(sigBytes()).toEqual([0xbf, 0x9d, 0x38])
    expect(checksumValid()).toBe(true)
    doReset()
    expect(sigBytes()).toEqual([0xbf, 0x9d, 0x38])
    const cpu = getCPU() as CPU65816
    expect(cpu.PB).toBe(0)
    expect(cpu.PC).toBe(0x9dbf)
  } finally {
    teardown()
  }
}, TEST_TIMEOUT)

test("GS Ctrl-Reset honours ProDOS 00/BE/1B warm signature -> $BE00", () => {
  setup("APPLE2GS")
  try {
    doBoot()
    doSetRunMode(RUN_MODE.RUNNING, false)
    runFrames(60)
    seed(0x00, 0xbe, 0x1b)
    expect(sigBytes()).toEqual([0x00, 0xbe, 0x1b])
    expect(checksumValid()).toBe(true)
    doReset()
    expect(sigBytes()).toEqual([0x00, 0xbe, 0x1b])
    const cpu = getCPU() as CPU65816
    expect(cpu.PB).toBe(0)
    expect(cpu.PC).toBe(0xbe00)
  } finally {
    teardown()
  }
}, TEST_TIMEOUT)

test("GS Ctrl-Reset derives the target from $03F2/$03F3, not a fixed address", () => {
  // Other OSes put their own reset entry in the signature (ProDOS BASIC,
  // Pascal, CPM, ...), so the target has to be computed from the two low bytes.
  // This arbitrary vector pins that: the same code path must land on $1234.
  setup("APPLE2GS")
  try {
    doBoot()
    doSetRunMode(RUN_MODE.RUNNING, false)
    runFrames(60)
    seed(0x34, 0x12, (0x12 ^ 0xa5) & 0xff)
    expect(sigBytes()).toEqual([0x34, 0x12, 0xb7])
    expect(checksumValid()).toBe(true)
    doReset()
    const cpu = getCPU() as CPU65816
    expect(cpu.PB).toBe(0)
    expect(cpu.PC).toBe(0x1234)
  } finally {
    teardown()
  }
}, TEST_TIMEOUT)

// A real IIgs beeps on Ctrl-Reset: the ROM's reset handler sounds the speaker
// (FF:FA87 JSR $F89A) and only then tests the warm-start signature (FF:FA8A).
// Jumping the valid signature through $03F2 skips that handler, so doReset has
// to replay the ROM's tone itself or the warm reset is silent.
test("GS Ctrl-Reset beeps when it warm-starts through $03F2", () => {
  setup("APPLE2GS")
  try {
    doBoot()
    doSetRunMode(RUN_MODE.RUNNING, false)
    runFrames(60)
    seed(0xbf, 0x9d, 0x38)
    resetSpeakerClickCount()
    doReset()
    expect(cpuPC()).toBe(0x9dbf)
    // The tone is delivered in per-frame batches so the UI speaker worklet can
    // rebuild after the reset's AUDIO_RESET; flush those worker timers with the
    // machine paused so no CPU instructions add speaker clicks of their own.
    doSetRunMode(RUN_MODE.PAUSED, false)
    jest.advanceTimersByTime(70)
    // One 93-toggle burst is the ROM's beep cadence; the clicks are posted
    // through the speaker path, so the count proves the sound was emitted.
    expect(getSpeakerClickCount()).toBe(93)
  } finally {
    teardown()
  }
}, TEST_TIMEOUT)

test("GS Ctrl-Reset with invalid checksum takes the cold reset vector $FA62", () => {
  setup("APPLE2GS")
  try {
    doBoot()
    doSetRunMode(RUN_MODE.RUNNING, false)
    runFrames(60)
    seed(0xbf, 0x9d, 0x00)
    expect(checksumValid()).toBe(false)
    doReset()
    // Invalid signature must not jump to $9DBF; the CPU takes ROM reset vector
    // FF:FFFC = $FA62 as a cold reset.
    expect(cpuPC()).toBe(0xfa62)
  } finally {
    teardown()
  }
}, TEST_TIMEOUT)

test("GS power-on invalidates the signature while Ctrl-Reset preserves it", () => {
  setup("APPLE2GS")
  try {
    seed(0xbf, 0x9d, 0x38)
    expect(sigBytes()).toEqual([0xbf, 0x9d, 0x38])
    doBoot()
    // The Programmer's Guide cold start invalidates $03F2-$03F4; gssquared's
    // computer_t::reset(cold_start) does the same only on a cold start.
    expect(sigBytes()).toEqual([0, 0, 0])
    doSetRunMode(RUN_MODE.RUNNING, false)
    runFrames(60)
    seed(0xbf, 0x9d, 0x38)
    doReset()
    expect(sigBytes()).toEqual([0xbf, 0x9d, 0x38])
  } finally {
    teardown()
  }
}, TEST_TIMEOUT)

test("classic II reset keeps classic behavior and does not jump the GS signature", () => {
  setup("APPLE2EE")
  try {
    doBoot()
    doSetRunMode(RUN_MODE.RUNNING, false)
    runFrames(60)
    seed(0xbf, 0x9d, 0x38)
    const before = sigBytes()
    resetSpeakerClickCount()
    doReset()
    // A classic machine does not consume the GS warm signature: its reset is the
    // classic reset vector path, and $03F2-$03F4 remain untouched.
    expect(sigBytes()).toEqual(before)
    expect(cpuPC()).not.toBe(0x9dbf)
    // The synthesized beep belongs to the IIgs warm-start path only; classic
    // resets keep beeping through their own ROM routine when frames run.
    expect(getSpeakerClickCount()).toBe(0)
  } finally {
    teardown()
  }
}, TEST_TIMEOUT)

if (HAS_PRODOS) {
  test("ProDOS boot writes 00/Be/1b and Ctrl-Reset lands on $BE00 with prompt", () => {
    setup("APPLE2GS")
    try {
      bootDisk(2, PRODOS_DISK)
      expect(sigBytes()).toEqual([0x00, 0xbe, 0x1b])
      doReset()
      expect(sigBytes()).toEqual([0x00, 0xbe, 0x1b])
      expect(cpuPC()).toBe(0xbe00)
      runFrames(600)
      expect(getTextPageAsString()).toContain("]")
    } finally {
      teardown()
    }
  }, TEST_TIMEOUT)
} else {
  test("ProDOS reset regression skipped (missing Eamon 1.po)", () => {
    console.log(`[warm-start] missing ${PRODOS_DISK}; ProDOS signature ${sigText()}`)
  })
}

if (HAS_DOS33) {
  test("DOS 3.3 boot writes Bf/9d/38 and Ctrl-Reset lands on $9DBF with prompt", () => {
    setup("APPLE2GS")
    try {
      bootDisk(2, DOS33_DISK)
      expect(sigBytes()).toEqual([0xbf, 0x9d, 0x38])
      doReset()
      expect(sigBytes()).toEqual([0xbf, 0x9d, 0x38])
      expect(cpuPC()).toBe(0x9dbf)
      runFrames(600)
      expect(getTextPageAsString()).toContain("]")
    } finally {
      teardown()
    }
  }, TEST_TIMEOUT)
} else {
  test("DOS 3.3 reset regression skipped (missing external image)", () => {
    console.log(`[warm-start] missing ${DOS33_DISK}; DOS signature ${sigText()}`)
  })
}
