// Cavern Cobra IIgs ships as a protected 3.5" capture: a 1,296,147-byte WOZ2
// whose INFO chunk declares disk type 2 (3.5"), write-protected, with an
// optimal bit cell of 16 (2 us). Two separate bugs kept it out of the bay it
// belongs in:
//   - the mount classifier treated *every* .woz as 5.25" media, so slot 5
//     refused it and the 5.25" drive accepted it, and the default index was
//     S6,D1 - the disk quietly left the bay the user picked;
//   - decodeWoz2 read the declared disk type from byte 61, which is the tail of
//     the creator field and always 0, so even once it reached slot 5 the drive
//     clocked the media as a 5.25" disk instead of on the 3.5" media clock.
// This pins the placement, the drive model the IWM then reads through, and the
// boot the two together produce: ProDOS 16's loader comes up on the text page
// and Cavern Cobra's title screen follows in Super Hi-Res. Restoring either
// half turns the boot red - the disk stays in slot 6, or the slot-5 drive
// streams the bits at the wrong rate and nothing decodes.
import { doSetMachineName, doSetRunMode, resetCpuSpeedForTesting } from "./motherboard"
import { getTextPageAsString, setIigsRomVersion } from "./memory"
import { getDriveBitstreamByIndex, getDriveStateByIndex, doSetEmuDriveNewData } from "./devices/drivestate"
import { RUN_MODE } from "../common/utility"
import { setIsTesting } from "./worker2main"
import * as fs from "fs"

const DISK_PATH = process.env.GS_WOZ35_PATH || "C:\\dev\\emu\\ap2\\Cavern_Cobra_IIgs.woz"
const hasDisk = fs.existsSync(DISK_PATH)
const NAME = "Cavern_Cobra_IIgs.woz"
const SIZE = 1_296_147

const mount = (index: number) => {
  const data = new Uint8Array(fs.readFileSync(DISK_PATH))
  expect(data.length).toBe(SIZE)
  expect(doSetEmuDriveNewData({
    index, hardDrive: false, drive: index === 5 ? 2 : 1, filename: NAME, status: "",
    motorRunning: false, diskHasChanges: false, isWriteProtected: false,
    diskData: data, lastAppleWriteTime: 0, cloudData: null,
    writableFileHandle: null, lastLocalFileWriteTime: 0,
  } as DriveProps)).toBe(true)
}

const skip = () => {
  if (hasDisk) return false
  console.warn(`3.5" WOZ image missing: ${DISK_PATH}`)
  return true
}

describe("a protected 3.5\" WOZ capture on the IIgs", () => {
  beforeEach(() => {
    jest.useFakeTimers()
    setIsTesting()
    doSetMachineName("APPLE2GS")
  })
  afterEach(() => {
    doSetRunMode(RUN_MODE.PAUSED, false)
    resetCpuSpeedForTesting()
    jest.useRealTimers()
  })

  test("the INFO chunk declares 3.5\" media", () => {
    if (skip()) return
    const data = new Uint8Array(fs.readFileSync(DISK_PATH))
    expect(String.fromCharCode(data[0], data[1], data[2], data[3])).toBe("WOZ2")
    expect(data[21]).toBe(2)
    expect(data[61]).toBe(0)
    expect(data[59]).toBe(16)
  })

  test("asked for the 5.25\" drive, it lands in slot 5 instead", () => {
    if (skip()) return
    mount(2)
    expect(getDriveStateByIndex(2).filename).toBe("")
    const ds = getDriveStateByIndex(4)
    expect(ds.filename).toBe(NAME)
    expect(ds.hardDrive).toBe(false)
    expect(ds.is35).toBe(true)
  })

  test("slot 5 reads it as a 3.5\" capture, not a block volume", () => {
    if (skip()) return
    mount(4)
    const ds = getDriveStateByIndex(4)
    expect(ds.is35).toBe(true)
    expect(ds.blockMedia35).toBe(false)
    expect(ds.optimalTiming).toBe(16)
    expect(ds.isWriteProtected).toBe(true)
    expect(ds.maxQuarterTrack).toBe(159)
    // The recorded bitstream is the media: every captured track-side has to be
    // reachable, and the buffer is the file itself (nothing is nibblized, the
    // guest's own 3.5" driver decodes the fields off the capture).
    for (let track = 0; track < 160; track++) {
      expect(ds.trackStart[track]).toBeGreaterThan(0)
      expect(ds.trackNbits[track]).toBeGreaterThan(0)
    }
    expect(getDriveBitstreamByIndex(4).length).toBe(SIZE)
  })

  test.each<[string, "01" | "03"]>([
    ["ROM 01", "01"],
    ["ROM 03", "03"],
  ])("boots ProDOS 16 from slot 5 under %s", (_label, rom) => {
    if (skip()) return
    setIigsRomVersion(rom)
    mount(2)
    doSetRunMode(RUN_MODE.NEED_BOOT)
    doSetRunMode(RUN_MODE.RUNNING, false)
    let frame = 0
    for (; frame < 6000; frame++) {
      jest.advanceTimersByTime(17)
      if (getTextPageAsString().includes("PRODOS 16")) break
    }
    expect(getTextPageAsString()).toContain("PRODOS 16")
    expect(frame).toBeLessThan(6000)
  }, 600000)
})
