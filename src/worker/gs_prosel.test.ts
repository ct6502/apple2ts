import { doSetMachineName, doSetRunMode, resetCpuSpeedForTesting } from "./motherboard"
import { getTextPageAsString } from "./memory"
import { doSetEmuDriveNewData } from "./devices/drivestate"
import { RUN_MODE } from "../common/utility"
import { setIsTesting } from "./worker2main"
import * as fs from "fs"

// Regression test for the bank-$01 text-page shadow.
//
// ProSel-16 runs in native mode and writes its 80-column menu with DB=$01
// stores. The legacy IIgs scanner reads the Mega II pages ($E0/$E1), not the
// fast-RAM bank $01 copy, so those stores must still be mirrored into the
// Mega II through the bank latch ($C029 bit 0) and the $C035 text-page
// shadow bits. Without the mirror the right-hand half of each menu cell is
// blank (or disappears into fast RAM) and the screen looks garbled.
// gssquared's bank_shadow_write + megaiiWrite do that mirroring.
//
// The expected menu is the one ProSel leaves on screen after its startup
// sequence; the strings below are what the scanner shows from Mega II.
const DISK_PATH = process.env.PROSEL_PATH || "C:\\dev\\emu\\ap2\\DISKS\\PROSEL_V84.PO"
const hasDisk = fs.existsSync(DISK_PATH)

test("ProSel-16's bank-$01 text reaches the Mega II scanner", () => {
  if (!hasDisk) {
    console.warn(`ProSel image missing: ${DISK_PATH}`)
    return
  }

  jest.useFakeTimers()
  setIsTesting()
  try {
    doSetMachineName("APPLE2GS")
    const data = new Uint8Array(fs.readFileSync(DISK_PATH))
    expect(doSetEmuDriveNewData({
      index: 4, hardDrive: false, drive: 1, filename: "PROSEL_V84.PO", status: "",
      motorRunning: false, diskHasChanges: false, isWriteProtected: false,
      diskData: data, lastAppleWriteTime: 0, cloudData: null,
      writableFileHandle: null, lastLocalFileWriteTime: 0,
    } as DriveProps)).toBe(true)

    doSetRunMode(RUN_MODE.NEED_BOOT)
    doSetRunMode(RUN_MODE.RUNNING, false)
    for (let f = 0; f < 6000; f++) jest.advanceTimersByTime(17)

    const screen = getTextPageAsString()
    // Both halves of the 80-column menu come from Mega II. A bank-$01 store
    // that skipped the shadow leaves one half blank and breaks these strings.
    expect(screen).toContain("Information Desk")
    expect(screen).toContain("Volume repair")
    expect(screen).toContain("ProSel-16 editor")
  } finally {
    doSetRunMode(RUN_MODE.PAUSED, false)
    resetCpuSpeedForTesting()
    jest.useRealTimers()
  }
}, 300000)
