import {
  doSetEmuDriveNewData,
  getDriveDataByIndex,
  getDriveStateByIndex,
} from "./drivestate"
import { iwmGetSense35, iwmStepHead } from "./diskdata"
import { getFloppy35PayloadInfo } from "./floppy35"
import { doSetMachineName } from "../motherboard"
import { setIsTesting } from "../worker2main"
import * as fs from "fs"

// A 3.5" copy program (ZZ Copy) boots from the slot-5 drive, asks the firmware
// to eject the boot disk, and then polls the drive's disk-in-place status
// before it offers "Insert source". The image has to stay mounted so a later
// swap can reuse it, but the drive must report empty: a mounted image is not
// the same thing as media in the drive. Before the disk-in-place flag, selector
// 1 answered from `filename` and the program read the boot disk as its source.
const DISK_PATH = process.env.GS_FLOPPY35_DISKINPLACE_PATH || "C:\\dev\\emu\\ap2\\mcs.2mg"
// CI has no local disk fixtures; like the other fixture-backed drive suites,
// skip there instead of failing on a missing image.
const testWithDisk = fs.existsSync(DISK_PATH) ? test : test.skip

const mount35 = (filename: string) => {
  const data = new Uint8Array(fs.readFileSync(DISK_PATH))
  expect(doSetEmuDriveNewData({
    index: 4, hardDrive: false, drive: 1, filename, status: "",
    motorRunning: false, diskHasChanges: false, isWriteProtected: false,
    diskData: data, lastAppleWriteTime: 0, cloudData: null,
    writableFileHandle: null, lastLocalFileWriteTime: 0,
  } as DriveProps)).toBe(true)
}

// The four IWM head lines are the 16-way status/control selector on a 3.5"
// drive: CA0 (0x2), CA1 (0x4), CA2 (0x8) and SEL (0x1, the hdsel argument).
// LSTRB is raised separately to strobe a control function.
const setCA = (ca0: number, ca1: number, ca2: number) => {
  iwmStepHead(4, 6, true) // LSTRB low
  iwmStepHead(4, ca0 ? 1 : 0, true)
  iwmStepHead(4, ca1 ? 3 : 2, true)
  iwmStepHead(4, ca2 ? 5 : 4, true)
}

const sense = (ca0: number, ca1: number, ca2: number, hdsel: number) => {
  setCA(ca0, ca1, ca2)
  return iwmGetSense35(4, hdsel)
}

testWithDisk("ejecting the slot-5 disk leaves the image mounted but reports an empty drive", () => {
  setIsTesting()
  doSetMachineName("APPLE2GS")
  mount35("Disk 1.2mg")
  const ds = getDriveStateByIndex(4)
  expect(ds.is35).toBe(true)
  expect(ds.diskInPlace).toBe(true)
  expect(getDriveDataByIndex(4).length).toBeGreaterThan(0)

  // Selector 0x1 (CA0/CA1/CA2=0, SEL=1) is disk-in-place: 0 = present.
  expect(sense(0, 0, 0, 1)).toBe(0)

  // Control 0xE (CA0/CA1/CA2=1, SEL=0) ejects without unmounting the image.
  setCA(1, 1, 1)
  iwmStepHead(4, 7, true) // LSTRB high: run the selected control function

  expect(ds.diskInPlace).toBe(false)
  expect(ds.diskSwitched).toBe(true)
  expect(ds.filename).toBe("Disk 1.2mg")
  expect(getFloppy35PayloadInfo(getDriveDataByIndex(4)).size / 512).toBe(1600)
  // The guest now sees an empty drive and the disk-switched latch.
  expect(sense(0, 0, 0, 1)).toBe(1)
  expect(sense(1, 1, 0, 0)).toBe(1)

  // Inserting media again puts the disk back in place; the boot disk is still
  // there to be read once the program accepts it as the source.
  mount35("Disk 1.2mg")
  const restored = getDriveStateByIndex(4)
  expect(restored.diskInPlace).toBe(true)
  expect(sense(0, 0, 0, 1)).toBe(0)
})
