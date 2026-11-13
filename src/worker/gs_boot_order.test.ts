import { doSetMachineName, doSetRunMode, doSetSlotConfig, resetCpuSpeedForTesting } from "./motherboard"
import { getShr } from "./memory"
import { doSetEmuDriveNewData } from "./devices/drivestate"
import { DEFAULT_SLOT_CONFIG, RUN_MODE } from "../common/utility"
import { setIsTesting } from "./worker2main"
import * as fs from "fs"

// The browser starts a fresh profile (no stored machine) in this order:
//   loadPreferences()   -> SLOT_CONFIG with the classic IIe defaults
//   handleInputParams() -> MACHINE_NAME "APPLE2GS" from ?machine=
//   handleFragment()    -> the disk image, then NEED_BOOT
// So the IIgs is configured right after a configure pass taken for another
// machine, which had switched on the SoftCard bookkeeping and the slot-7 hard
// drive. doBoot() used to read softCard.enabled to decide whether to present
// the SmartPort driver, and a IIgs never restored that flag: with an empty
// hard-drive bay the card came up enabled and a timer re-enabled it 200 ms
// later, while the ROM was still walking the slots. The scan then treated slot
// 7 as the startup device, executed the $C700 stub as firmware and ran off into
// $00:E000 instead of loading the 3.5" system disk.
const DISK_PATH = process.env.GS_BOOT_ORDER_PATH || "C:\\dev\\emu\\ap2\\SystemDisk.2mg"
const FRAMES = Number(process.env.GS_BOOT_ORDER_FRAMES || 4200)
const SHR_SCB_OFFSET = 0x7D00

test(`slot config for another machine cannot poison the IIgs boot (${DISK_PATH})`, () => {
  jest.useFakeTimers()
  setIsTesting()
  try {
    doSetSlotConfig({ ...DEFAULT_SLOT_CONFIG })
    doSetMachineName("APPLE2GS")

    expect(doSetEmuDriveNewData({
      index: 4, hardDrive: false, drive: 1, filename: "SystemDisk.2mg", status: "",
      motorRunning: false, diskHasChanges: false, isWriteProtected: false,
      diskData: new Uint8Array(fs.readFileSync(DISK_PATH)), lastAppleWriteTime: 0,
      cloudData: null, writableFileHandle: null, lastLocalFileWriteTime: 0,
    } as DriveProps)).toBe(true)

    doSetRunMode(RUN_MODE.NEED_BOOT)
    doSetRunMode(RUN_MODE.RUNNING, false)
    for (let f = 0; f < FRAMES; f++) jest.advanceTimersByTime(17)

    // Same evidence as gs_floppy35_boot: the boot splash holds one SCB value
    // until GS/OS takes over, then the Finder desktop shows several palettes.
    const shr = getShr()
    const scbs = new Set<number>()
    for (let y = 0; y < 200; y++) scbs.add(shr[SHR_SCB_OFFSET + y])
    expect(scbs.size).toBeGreaterThanOrEqual(5)
    let shrNonZero = 0
    for (let i = 0; i < shr.length; i++) if (shr[i] !== 0) shrNonZero++
    expect(shrNonZero).toBeGreaterThan(20000)
  } finally {
    doSetRunMode(RUN_MODE.PAUSED, false)
    resetCpuSpeedForTesting()
    jest.useRealTimers()
  }
}, 900000)
