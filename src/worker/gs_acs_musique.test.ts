import { doSetMachineName, doSetRunMode, doSetSpeedMode } from "./motherboard"
import { getTextPage, setIigsRomVersion, memGet24 } from "./memory"
import { doSetEmuDriveNewData } from "./devices/drivestate"
import { RUN_MODE } from "../common/utility"
import { setIsTesting } from "./worker2main"
import * as fs from "fs"

// ACS Musique Disk (1989) boots a patched ProDOS carrying Diversi-Cache 1.0b,
// an 8-bit ProDOS 8 accelerator. Diversi-Cache patches the GS/OS slot-5 fast
// driver dispatch table ($E1:0F6D) so unit 1 goes through its own read path,
// and that driver keeps a sync-byte compare buffer in direct page $65-$67.
// ROM 03's shared block driver only saves/restores DP $40-$62 around a block
// access, so Diversi-Cache's scratch leaked into the caller's direct page and
// stamped over Applesoft's TXTTAB ($0801 -> $0840): `?SYNTAX ERROR` as soon
// as BASIC.SYSTEM loads. ROM 01 preserves $40-$6E. doSetRom widens ROM 03's
// four MVN copies to match ROM 01.
const DISK_PATH = process.env.GS_ACS_PATH ||
  "C:\\dev\\emu\\ap2\\acs musique disk (1989)(apple chemical software).2mg"

const screen = () => Array.from(getTextPage() as unknown as number[])
  .map((v) => String.fromCharCode((v as number) & 0x7f)).join("")

const runBoot = (rom: "01" | "03", frames: number) => {
  setIigsRomVersion(rom)
  doSetMachineName("APPLE2GS")
  doSetSpeedMode(1)
  for (const idx of [0, 1, 2, 3, 4, 5]) {
    doSetEmuDriveNewData({
      index: idx, hardDrive: idx <= 1, drive: 1, filename: "", status: "",
      motorRunning: false, diskHasChanges: false, isWriteProtected: false,
      diskData: new Uint8Array(0), lastAppleWriteTime: 0,
      cloudData: null, writableFileHandle: null, lastLocalFileWriteTime: 0,
    } as DriveProps)
  }
  doSetEmuDriveNewData({
    index: 4, hardDrive: false, drive: 1, filename: "acs.2mg", status: "",
    motorRunning: false, diskHasChanges: false, isWriteProtected: false,
    diskData: new Uint8Array(fs.readFileSync(DISK_PATH)), lastAppleWriteTime: 0,
    cloudData: null, writableFileHandle: null, lastLocalFileWriteTime: 0,
  } as DriveProps)
  doSetRunMode(RUN_MODE.NEED_BOOT)
  doSetRunMode(RUN_MODE.RUNNING, false)

  let menuFrame = -1
  let errorFrame = -1
  let lastScreen = ""
  for (let f = 1; f <= frames; f++) {
    jest.advanceTimersByTime(17)
    const s = screen()
    if (s === lastScreen) continue
    lastScreen = s
    if (errorFrame < 0 && /SYNTAX|ERROR/i.test(s)) errorFrame = f
    if (menuFrame < 0 && s.includes("Your Choice")) menuFrame = f
  }
  const txttab = memGet24(0x67) | (memGet24(0x68) << 8)
  return { menuFrame, errorFrame, txttab, text: screen() }
}

describe("ACS Musique Disk boots from S5D1", () => {
  jest.useFakeTimers()
  setIsTesting()

  for (const rom of ["03", "01"] as const) {
    test(`ROM ${rom}: Diversi-Cache does not clobber TXTTAB`, () => {
      const { menuFrame, errorFrame, txttab, text } = runBoot(rom, 560)
      expect(errorFrame).toBe(-1)
      expect(txttab).toBe(0x0801)
      expect(menuFrame).toBeGreaterThan(0)
      expect(text).toContain("Your Choice")
    })
  }
})
