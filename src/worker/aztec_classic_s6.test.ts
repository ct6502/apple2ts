import {
  doSetMachineName,
  doSetRunMode,
  doSetSpeedMode,
  resetCpuSpeedForTesting,
} from "./motherboard"
import { doSetEmuDriveNewData } from "./devices/drivestate"
import { getHires } from "./memory"
import { resetIwmReadStats } from "./devices/diskdata"
import { RUN_MODE } from "../common/utility"
import { setIsTesting } from "./worker2main"
import * as fs from "fs"

// Permanent classic-path regression for the GS-only Aztec acceleration: the
// classic II never executes the $BD9E copy-protection delay loop that the IIgs
// reaches, so this boot must stay untouched. It must not regress into using the
// GS fast-forward state or change the Settings speed budget.
const DISK_PATH = "public/disks/Aztec.woz"

const nzCount = () => {
  const hires = getHires()
  let n = 0
  for (let i = 0; i < hires.length; i++) if (hires[i] !== 0) n++
  return n
}

test("classic II S6 Aztec title still loads at its Settings speed", () => {
  jest.useFakeTimers()
  setIsTesting()
  try {
    doSetMachineName("APPLE2EE")
    doSetSpeedMode(0)
    resetIwmReadStats()
    expect(doSetEmuDriveNewData({
      index: 2,
      hardDrive: false,
      drive: 1,
      filename: "Aztec.woz",
      status: "",
      motorRunning: false,
      diskHasChanges: false,
      isWriteProtected: false,
      diskData: new Uint8Array(fs.readFileSync(DISK_PATH)),
      lastAppleWriteTime: 0,
      cloudData: null,
      writableFileHandle: null,
      lastLocalFileWriteTime: 0,
    } as DriveProps)).toBe(true)
    doSetRunMode(RUN_MODE.NEED_BOOT)
    doSetRunMode(RUN_MODE.RUNNING, false)

    let titleFrame = -1
    for (let f = 0; f < 5000; f++) {
      jest.advanceTimersByTime(17)
      if (titleFrame < 0 && getHires().length > 0 && nzCount() > 2000) {
        titleFrame = f
        break
      }
    }
    expect(titleFrame).toBeGreaterThanOrEqual(0)
    expect(titleFrame).toBeLessThan(1000)
  } finally {
    doSetRunMode(RUN_MODE.PAUSED, false)
    resetCpuSpeedForTesting()
    jest.useRealTimers()
  }
})
