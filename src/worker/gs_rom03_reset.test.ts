import { testWithFixtures } from "../test/fixture_test"
import { doSetMachineName, doSetRunMode, doReset, resetCpuSpeedForTesting } from "./motherboard"
import {
  getShr, setIigsRomVersion, isIigsRom03, isIigsShrActive, getTextPageAsString,
  iigsRegisters,
} from "./memory"
import { iigsClock } from "./iigs_clock"
import { doSetEmuDriveNewData } from "./devices/drivestate"
import { RUN_MODE } from "../common/utility"
import { setIsTesting } from "./worker2main"
import * as fs from "fs"

// Bug 4 regression: Ctrl-Reset on the IIgs with GS/OS booted from a mounted hard
// drive must return to the desktop. ROM 03 used to hang in this path; the same
// reset also hangs ROM 01 under this harness, so both ROMs are pinned here.
//
// The failure is not a stale SHR frame: a hanging reset leaves the old desktop
// in memory, so a detector that merely looks for desktop colours passes on the
// stale image forever. The test therefore requires a real repaint (the boot
// screen must overwrite the old frame) before accepting the returned desktop.
//
// Diagnostic history: the reset boot runs the ROM's signature/self-test path at
// FF:71A0. `$C046` bit 7 is a level-triggered interrupt pending-and-enabled bit;
// after a reset the first VBL is pending, and if `$C041 INTEN` still holds the
// GS/OS VBL enable, the ROM sees bit 7 and takes the diagnostic self-test
// instead of booting: `System Bad: FFFF0000`, then the FF:02B2/C17C boot loop.
// The warm reset must zero `$C041` (as a cold reset already does); otherwise
// IigsClock.reset(false) alone is not enough.
//
// Exact in-scope root cause evidence: with the harness clearing INTEN by hand
// after reset, the guest reaches the Finder again (ROM 03 frame 763, diff 1654;
// ROM 01 frame 893, diff 58). Without it, the reset at frame 7 repaints the old
// desktop with the boot screen, then frame 26 prints System Bad and never
// reaches a desktop (colours fall to 1, final diff ~32000).
const PO_PATH = process.env.GSBOOT_PO || "C:\\dev\\emu\\ap2\\GSOS601.po"
const BOOT_FRAMES = Number(process.env.GSRESET_BOOT_FRAMES || 1200)
const RESET_BOUND_FRAMES = Number(process.env.GSRESET_BOUND_FRAMES || 2000)

// Repaint = the reset boot screen overwrote the old desktop. Finder = the screen
// has returned to the saved desktop and really repainted, so a black hang or the
// stale frame cannot satisfy it.
const REPAINT_MIN_DIFF = 3000
const DESKTOP_MAX_DIFF = 3000

const SHR_SCB_OFFSET = 0x7d00

const desktopColours = () => {
  const shr = getShr()
  if (!isIigsShrActive() || shr.length !== 32768) return new Set<string>()
  const colours = new Set<string>()
  for (let y = 0; y < 200; y++) {
    const scb = shr[SHR_SCB_OFFSET + y]
    const palIdx = (scb & 0x0f) << 4
    const is640 = (scb & 0x80) !== 0
    for (let x = 0; x < 640; x++) {
      let colorIndex: number
      if (is640) {
        const byteVal = shr[y * 160 + (x >> 2)]
        const shift = (3 - (x & 3)) * 2
        colorIndex = palIdx | ([8, 12, 0, 4][x & 3] + ((byteVal >> shift) & 3))
      } else {
        const byteVal = shr[y * 160 + (x >> 1)]
        colorIndex = palIdx | ((x & 1) ? (byteVal & 0x0f) : ((byteVal >> 4) & 0x0f))
      }
      const pOff = 0x7e00 + (colorIndex >> 4) * 32 + (colorIndex & 0x0f) * 2
      const w = shr[pOff] | (shr[pOff + 1] << 8)
      colours.add(`${(w >> 8) & 0xf},${(w >> 4) & 0xf},${w & 0xf}`)
    }
  }
  return colours
}

const desktopReached = () => desktopColours().size > 8

const diffBytes = (a: Uint8Array, b: Uint8Array) => {
  let n = 0
  for (let i = 0; i < 32768; i++) if (a[i] !== b[i]) n++
  return n
}

type ClockProbe = { state: number, transactionStepCount: number, ctlRegByte: number }
const clockProbe = () => iigsClock as unknown as ClockProbe

const mountGsos = () => {
  expect(doSetEmuDriveNewData({
    index: 0, hardDrive: true, drive: 1, filename: "GSOS601.po", status: "",
    motorRunning: false, diskHasChanges: false, isWriteProtected: false,
    diskData: new Uint8Array(fs.readFileSync(PO_PATH)), lastAppleWriteTime: 0,
    cloudData: null, writableFileHandle: null, lastLocalFileWriteTime: 0,
  } as DriveProps)).toBe(true)
}

const bootRom = (rom: "01" | "03", label: string) => {
  setIigsRomVersion(rom)
  doSetMachineName("APPLE2GS")
  expect(isIigsRom03() === (rom === "03")).toBe(true)
  mountGsos()
  doSetRunMode(RUN_MODE.NEED_BOOT)
  doSetRunMode(RUN_MODE.RUNNING, false)
  for (let f = 0; f < BOOT_FRAMES; f++) jest.advanceTimersByTime(17)
  expect(desktopReached()).toBe(true)
  // console.log(`[${label}] cold boot: frame=${BOOT_FRAMES} colours=${desktopColours().size} ` +
    // `$C036=$${iigsRegisters[0x36].toString(16)} $C041=$${iigsRegisters[0x41].toString(16)}`)
}

const resetProbe = (rom: "01" | "03", label: string) => {
  jest.useFakeTimers()
  setIsTesting()
  try {
    bootRom(rom, label)
    const beforeShr = getShr().slice()
    const beforeReset = clockProbe()

    // Prime the exact hardware state Ctrl-Reset interrupts: a CB transaction in
    // flight from the clock driver. Without clearing it the reset boot cannot
    // frame its BRAM signature read again (AGENTS §3).
    iigsClock.writeData(0x38)
    iigsClock.writeControl(0xa0)
    const seeded = clockProbe()
    expect(seeded.state).not.toBe(0)
    expect(seeded.transactionStepCount).toBe(2)

    doReset()
    doSetRunMode(RUN_MODE.RUNNING, false)

    // Clock-chip reset was integrated in motherboard resetMachine(); it leaves
    // the transaction idle immediately.
    const afterReset = clockProbe()
    expect(afterReset.state).toBe(0) // AWAIT_COMMAND
    expect(afterReset.transactionStepCount).toBe(0)
    expect(afterReset.ctlRegByte & 0b100).toBe(0) // start-transaction released
    // Sample INTEN immediately, before the reset boot runs. Once Finder is up it
    // legitimately re-enables VBL bit 3; the contract is that the *reset* itself
    // leaves no stale enable behind.
    const intenAfterReset = iigsRegisters[0x41]
    expect(intenAfterReset & 0x1f).toBe(0)

    let repaintFrame = -1
    let desktopFrame = -1
    let badFrame = -1
    let maxDiff = 0
    let finalDiff = 0
    for (let f = 0; f < RESET_BOUND_FRAMES; f++) {
      jest.advanceTimersByTime(17)
      finalDiff = diffBytes(beforeShr, getShr())
      if (finalDiff > maxDiff) maxDiff = finalDiff
      if (repaintFrame < 0 && finalDiff > REPAINT_MIN_DIFF) repaintFrame = f
      if (repaintFrame >= 0 && desktopFrame < 0 && finalDiff <= DESKTOP_MAX_DIFF && desktopReached()) {
        desktopFrame = f
      }
      if (badFrame < 0 && getTextPageAsString().includes("System Bad")) badFrame = f
    }

    // console.log(`[${label}] after reset: repaintFrame=${repaintFrame} desktopFrame=${desktopFrame} ` +
      // `badFrame=${badFrame} maxDiff=${maxDiff} finalDiff=${finalDiff} ` +
      // `colours=${desktopColours().size} clock state=${afterReset.state} ` +
      // `steps=${afterReset.transactionStepCount} $C036=$${iigsRegisters[0x36].toString(16)} ` +
      // `$C041=$${iigsRegisters[0x41].toString(16)}`)
    // console.log(`[${label}] $03F2-$03F4 = ` +
      // [0, 1, 2].map((i) => `$${memGet24(0x03f2 + i).toString(16)}`).join(" "))
    // console.log(`[${label}] text page tail:\n${getTextPageAsString().slice(-160)}`)

    // A real reset repaints, then returns to a desktop whose image differs from
    // the stale pre-reset SHR frame only by startup updates (well under 3000 B).
    expect(repaintFrame).toBeGreaterThanOrEqual(0)
    expect(repaintFrame).toBeLessThan(RESET_BOUND_FRAMES)
    expect(desktopFrame).toBeGreaterThan(repaintFrame)
    expect(desktopFrame).toBeLessThan(RESET_BOUND_FRAMES)
    expect(badFrame).toBe(-1) // no System Bad diagnostic self-test
    expect(finalDiff).toBeLessThan(DESKTOP_MAX_DIFF)
    expect(desktopReached()).toBe(true)
    expect(beforeReset.state).toBe(0) // idle before our seed, no ambient transaction

  } finally {
    doSetRunMode(RUN_MODE.PAUSED, false)
    resetCpuSpeedForTesting()
    jest.useRealTimers()
  }
}

testWithFixtures(PO_PATH)("ROM 03 Ctrl-Reset reaches the GS/OS desktop again", () => {
  resetProbe("03", "ROM03")
}, 900000)

testWithFixtures(PO_PATH)("ROM 01 Ctrl-Reset reaches the GS/OS desktop again", () => {
  resetProbe("01", "ROM01")
}, 900000)
