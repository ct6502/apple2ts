import { doSetMachineName, doSetRunMode, doSetSpeedMode, resetCpuSpeedForTesting } from "./motherboard"
import { doSetEmuDriveNewData } from "./devices/drivestate"
import { memory } from "./memory"
import { RUN_MODE } from "../common/utility"
import { setIsTesting } from "./worker2main"
import * as fs from "fs"

// The classic machines run the 6502 at 1.02 MHz in Normal speed. The run loop
// used to add cpu6502.processInstruction()'s returned cycles to s6502.cycleCount
// even though the classic core had already advanced it, doubling the published
// clock and starving the floppy's cycle-based bit timing. This image boots from
// the built-in S6 bay only after that accounting is fixed: with the doubled clock
// the 5.25" read never completes enough of a sector for ProDOS to catalog.
const DISK_PATH = "public/disks/CT_SPEEDTEST.DSK"
const FRAMES = 600

const screenText = () => {
  const lines: string[] = []
  for (let row = 0; row < 24; row++) {
    let line = ""
    const base = 0x400 + (row % 8) * 0x80 + Math.floor(row / 8) * 0x28
    for (let col = 0; col < 40; col++) {
      const ch = memory[base + col] & 0x7F
      line += (ch >= 32 && ch < 127) ? String.fromCharCode(ch) : " "
    }
    if (line.trim().length > 0) lines.push(line.replace(/\s+$/, ""))
  }
  return lines.join("\n")
}

test("classic IIe boots a 5.25\" S6 floppy at the 1 MHz profile clock", () => {
  jest.useFakeTimers()
  setIsTesting()
  try {
    doSetMachineName("APPLE2EE")
    doSetSpeedMode(0) // Classic Normal: 17030 cycles per refresh, ~1.02 MHz.
    expect(doSetEmuDriveNewData({
      index: 2,
      hardDrive: false,
      drive: 1,
      filename: "CT_SPEEDTEST.DSK",
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
    for (let f = 0; f < FRAMES; f++) {
      jest.advanceTimersByTime(17)
    }
    expect(screenText()).toContain("S6,D1:/SPEEDTEST")
    expect(screenText()).toContain("QUIT.SYSTEM")
  } finally {
    doSetRunMode(RUN_MODE.PAUSED, false)
    resetCpuSpeedForTesting()
    jest.useRealTimers()
  }
}, 120000)
