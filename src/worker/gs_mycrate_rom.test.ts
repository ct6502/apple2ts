import { doSetMachineName, doSetRunMode, doSetSpeedMode, getCPU, resetCpuSpeedForTesting } from "./motherboard"
import { CPU65816 } from "./cpu65816"
import { getShr, setIigsRomVersion } from "./memory"
import { doSetEmuDriveNewData } from "./devices/drivestate"
import { RUN_MODE } from "../common/utility"
import { setIsTesting } from "./worker2main"
import * as fs from "fs"

// About twenty seconds after the Finder appears, ROM 03 + MYCRATE.2MG dropped
// into the monitor with "00/0001: 00 02  BRK 02". ROM 03's task glue keeps the
// current record pointer at $00:$1824 and dereferences LDA [$1824],$9C, so when
// the ROM clears that pointer to $01:$0000 it reads bank $01 page 0. Under the
// generic 0xFF power-on fill $01:$009C read $FFFF, which the gate at $FE:0FC3
// takes as "a callback is registered": it dispatches the bogus record $FFFFFF
// and the return-address patch at $FE:2FDF (`STA $02,S') pops $00:0000. Cold
// boot now zeroes bank $01 the way gssquared's and KEGS's heap-allocated fast
// RAM already is, so the gate closes.
//
// ROM 01 never enters that glue, so it is unaffected by the fill -- the second
// case pins that, because the same zeroing is what a ROM 01 regression would
// have to break to look like this bug.
const DISK_PATH = process.env.GS_MYCRATE_PATH || "C:\\dev\\emu\\ap2\\MYCRATE.2MG"
const FRAMES = Number(process.env.GS_MYCRATE03_FRAMES || 1600)

const runMycrate = (rom: "01" | "03") => {
  jest.useFakeTimers()
  setIsTesting()
  let monitorFrame = 0
  let restored: (() => void) | null = null
  try {
    setIigsRomVersion(rom)
    doSetMachineName("APPLE2GS")
    doSetSpeedMode(1)
    expect(doSetEmuDriveNewData({
      index: 0, hardDrive: true, drive: 1, filename: "MYCRATE.2MG", status: "",
      motorRunning: false, diskHasChanges: false, isWriteProtected: false,
      diskData: new Uint8Array(fs.readFileSync(DISK_PATH)), lastAppleWriteTime: 0,
      cloudData: null, writableFileHandle: null, lastLocalFileWriteTime: 0,
    } as DriveProps)).toBe(true)
    doSetRunMode(RUN_MODE.NEED_BOOT)
    doSetRunMode(RUN_MODE.RUNNING, false)

    // The monitor's BRK handler is the first thing at $00:$0000, so any landing
    // in bank $00 page 0 means the guest fell out of GS/OS.
    const cpu = getCPU() as CPU65816
    const orig = cpu.processInstruction.bind(cpu)
    cpu.processInstruction = (cb?: ((s: string) => void) | null) => {
      if (!monitorFrame && cpu.PB === 0 && cpu.PC <= 0x10) monitorFrame = -1
      return orig(cb ?? null)
    }
    restored = () => { cpu.processInstruction = orig }

    for (let f = 1; f <= FRAMES && monitorFrame >= 0; f++) {
      jest.advanceTimersByTime(17)
      if (monitorFrame === -1) monitorFrame = f
    }
    const shr = getShr()
    let lit = 0
    for (let i = 0; i < shr.length; i++) if (shr[i] !== 0) lit++
    return { monitorFrame, lit }
  } finally {
    if (restored) restored()
    doSetRunMode(RUN_MODE.PAUSED, false)
    resetCpuSpeedForTesting()
    setIigsRomVersion("01")
    jest.useRealTimers()
  }
}

test("MYCRATE keeps running on the ROM 03 Finder without dropping to the monitor", () => {
  if (!fs.existsSync(DISK_PATH)) {
    console.warn("Skipping test: " + DISK_PATH + " not found")
    return
  }
  const { monitorFrame, lit } = runMycrate("03")
  expect(monitorFrame).toBe(0)
  // ...and the Finder is still on screen, not merely silent.
  expect(lit).toBeGreaterThan(20000)
}, 900000)

test("MYCRATE keeps running on the ROM 01 Finder too", () => {
  if (!fs.existsSync(DISK_PATH)) {
    console.warn("Skipping test: " + DISK_PATH + " not found")
    return
  }
  const { monitorFrame, lit } = runMycrate("01")
  expect(monitorFrame).toBe(0)
  expect(lit).toBeGreaterThan(20000)
}, 900000)
