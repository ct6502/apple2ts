import { doSetMachineName, doSetRunMode, resetCpuSpeedForTesting, getCPU } from "./motherboard"
import { memGet24, getShr } from "./memory"
import { RUN_MODE, RamWorksMemoryStart } from "../common/utility"
import { doSetEmuDriveNewData } from "./devices/drivestate"
import { setIsTesting } from "./worker2main"
import * as fs from "fs"

// Music Construction Set, no keypress at the ProDOS 8 splash.
//
// The splash waits ~10 s at 01:33C8, loads the demo song /MUSICGS/LEROY, then
// relocates its SHR music driver: it sets $C035 = $5F (SHADOW_INH_IOLC, bit 6)
// and block-copies $1E00 bytes from $00:2512 to $01:C000-Y. With the inhibit
// set, banks $00/$01 expose fast RAM across $C000-$CFFF (gssquared
// bank_shadow_read/write); routing those stores to the Mega II soft switches
// instead corrupted machine state and the guest ran off into $00:E03B. The
// fix lives in memGet24/memSet24 (see isIigsIolcShadowed).
const MCS_PATH = process.env.GS_MCS_PATH || "C:\\dev\\emu\\ap2\\mcs.2mg"
const auxRam = require("./memory").memory as Uint8Array

test("MCS: with no keypress the splash timeout loads the demo and reaches the editor", () => {
  jest.useFakeTimers()
  setIsTesting()
  try {
    doSetMachineName("APPLE2GS")
    const data = fs.readFileSync(MCS_PATH)
    expect(doSetEmuDriveNewData({
      index: 0, hardDrive: true, drive: 1, filename: "mcs.2mg", status: "",
      motorRunning: false, diskHasChanges: false, isWriteProtected: false,
      diskData: new Uint8Array(data), lastAppleWriteTime: 0, cloudData: null,
      writableFileHandle: null, lastLocalFileWriteTime: 0,
    } as DriveProps)).toBe(true)

    const cpu = getCPU() as any
    const origPI = cpu.processInstruction.bind(cpu)
    let fatalHits = 0
    let copiedDriver = false
    cpu.processInstruction = (cb?: any) => {
      if (cpu.PB === 0x00 && cpu.PC === 0xe03b) fatalHits++
      // At 01:aa16 the copy is done and $C035 has been restored, so $01:C000 is
      // I/O again; the relocated driver only lives in the physical aux bank.
      if (!copiedDriver && cpu.PB === 0x01 && cpu.PC === 0xaa16) {
        copiedDriver = auxRam[RamWorksMemoryStart + 0xc000] === memGet24(0x002512)
      }
      return origPI(cb)
    }

    doSetRunMode(RUN_MODE.NEED_BOOT)
    doSetRunMode(RUN_MODE.RUNNING, false)
    // At the default 1.02 MHz the two ~9.6 s splash waits span ~3200 frames.
    for (let f = 0; f < 5200; f++) jest.advanceTimersByTime(17)

    const shr = getShr()
    let shrNonZero = 0
    for (let i = 0; i < shr.length; i++) if (shr[i] !== 0) shrNonZero++

    expect(fatalHits).toBe(0)
    expect(copiedDriver).toBe(true)
    expect((memGet24(0xe0c029) & 0x80) !== 0).toBe(true)
    expect(shrNonZero).toBeGreaterThan(1000)
    expect(cpu.PB).toBe(0x01)
  } finally {
    doSetRunMode(RUN_MODE.PAUSED, false)
    resetCpuSpeedForTesting()
    jest.useRealTimers()
  }
}, 1800000)
