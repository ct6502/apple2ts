import { doSetMachineName, doSetRunMode, doSetSpeedMode, resetCpuSpeedForTesting } from "./motherboard"
import { getShr, getTextPage } from "./memory"
import { doSetEmuDriveNewData } from "./devices/drivestate"
import { RUN_MODE } from "../common/utility"
import { setIsTesting } from "./worker2main"
import * as fs from "fs"

// MYCRATE.2MG is a GS/OS 6.0.1 volume that loads several desk accessories
// (including NIFTYLIST.CDA) before the Finder comes up. Making the empty
// slot-5 bay answer the Sony status lines shifted GS/OS's ExpressLoad buffer by
// 498 bytes, which parked a relocation record on a bank boundary - a record the
// 6.0.1 loader cannot read across banks - and the boot died with
// "Sorry, system error $0201 occurred while loading the desk accessory
// NIFTYLIST.CDA." The bay is media-driven again; this test keeps that boot
// working.
const DISK_PATH = process.env.GS_MYCRATE_PATH || "C:\\dev\\emu\\ap2\\MYCRATE.2MG"
const FRAMES = Number(process.env.GS_MYCRATE_FRAMES || 3000)
const SHR_SCB_OFFSET = 0x7D00

const pageText = () => {
  const tp = getTextPage() as unknown as number[]
  let s = ""
  for (let i = 0; i < tp.length; i++) s += String.fromCharCode(tp[i] & 0x7F)
  return s
}

test("MYCRATE boots past the desk accessories to the Finder", () => {
  if (!fs.existsSync(DISK_PATH)) {
    console.warn("Skipping test: " + DISK_PATH + " not found")
    return
  }
  jest.useFakeTimers()
  setIsTesting()
  try {
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
    let sorryFrame = -1
    for (let f = 1; f <= FRAMES; f++) {
      jest.advanceTimersByTime(17)
      if (sorryFrame < 0 && pageText().includes("Sorry")) sorryFrame = f
    }

    expect(sorryFrame).toBe(-1)
    // The Finder desktop is in SHR with several palettes; the boot splash holds
    // a single SCB value until GS/OS takes over.
    const shr = getShr()
    const scbs = new Set<number>()
    for (let y = 0; y < 200; y++) scbs.add(shr[SHR_SCB_OFFSET + y])
    expect(scbs.size).toBeGreaterThanOrEqual(5)
    let lit = 0
    for (let i = 0; i < shr.length; i++) if (shr[i] !== 0) lit++
    expect(lit).toBeGreaterThan(20000)
  } finally {
    doSetRunMode(RUN_MODE.PAUSED, false)
    resetCpuSpeedForTesting()
    jest.useRealTimers()
  }
}, 900000)
