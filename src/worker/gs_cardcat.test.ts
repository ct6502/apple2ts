import { doSetMachineName, doSetRunMode, doSetSpeedMode } from "./motherboard"
import { doSetEmuDriveNewData } from "./devices/drivestate"
import { getTextPage } from "./memory"
import { RUN_MODE } from "../common/utility"
import { setIsTesting } from "./worker2main"
import * as fs from "fs"

// Card Cat 1.94 is an Apple Pascal (UCSD p-System) program that scans every
// slot by asking the slot ROM for block reads. The p-machine keeps its p-stack
// pointer ($56/$57) and p-code PC ($58/$59) in direct page, and the ROM 01
// slot-5 driver's shared entry at FF:6AB6 puts its inline parameter pointer in
// DP $57-$5A *before* it saves DP $40-$6E (FF:6F4D); the exit at FF:6F70 then
// restores that copy, handing the caller firmware scratch. The p-machine
// resumed at p-code PC $009E and printed "Execution error # 1" right after
// "Checking Card Slot 5 of 7". See CPU65816.slot5DriverDirectPage.
const DISK_PATH = process.env.GS_CARDCAT_PATH || "C:\\dev\\emu\\ap2\\Card Cat 1.94.dsk"

const screen = () => {
  const tp = getTextPage()
  const cols = tp.length >= 80 * 24 ? 80 : 40
  const rows: string[] = []
  for (let r = 0; r < 24; r++) {
    let line = ""
    for (let c = 0; c < cols; c++) {
      const b = tp[r * cols + c] & 0x7f
      line += b >= 32 && b < 127 ? String.fromCharCode(b) : " "
    }
    rows.push(line.replace(/\s+$/, ""))
  }
  return rows.join("\n")
}

test("Card Cat 1.94 completes its slot scan", () => {
  jest.useFakeTimers()
  setIsTesting()
  try {
    doSetMachineName("APPLE2GS")
    doSetSpeedMode(1)
    expect(doSetEmuDriveNewData({
      index: 2, hardDrive: false, drive: 1, filename: "Card Cat 1.94.dsk", status: "",
      motorRunning: false, diskHasChanges: false, isWriteProtected: false,
      diskData: new Uint8Array(fs.readFileSync(DISK_PATH)), lastAppleWriteTime: 0,
      cloudData: null, writableFileHandle: null, lastLocalFileWriteTime: 0,
    } as DriveProps)).toBe(true)

    doSetRunMode(RUN_MODE.NEED_BOOT)
    doSetRunMode(RUN_MODE.RUNNING, false)

    let text = ""
    for (let i = 0; i < 2000; i++) {
      jest.advanceTimersByTime(17)
      text = screen()
      if (text.includes("[Q]uit")) break
    }

    expect(text).not.toContain("Execution error")
    expect(text).toContain("Card Cat 1.94")
    expect(text).toContain("Built-In 80 Column Card")
    expect(text).toContain("Apple II Mouse Card")
    expect(text).toContain("5.25 Disk Drive Controller Card")
    expect(text).toContain("Apple II Liron Drive Controller Card")
    // Slot 5 is media-driven: with no 3.5" disk in the bay the ROM's built-in
    // SmartPort firmware reports no units. Presenting a Sony mechanism there
    // shifts GS/OS's ExpressLoad buffer by 498 bytes and breaks the MYCRATE
    // boot (gs_mycrate), so the empty bay must stay inert.
    expect(text).toMatch(/5\s+Apple II Liron Drive Controller \(SP:0, no units\)/)
    // Menu line: the program is alive and waiting for a key.
    expect(text).toContain("[P]rint")
    expect(text).toContain("[Q]uit")
  } finally {
    doSetRunMode(RUN_MODE.PAUSED, false)
    jest.useRealTimers()
  }
}, 300000)
