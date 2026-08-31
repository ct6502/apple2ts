import { Buffer } from "buffer"
import { convertdsk2woz } from "./convertdsk2woz"
import { doSetEmuDriveNewData, getCurrentDriveData, getCurrentDriveState, getDriveSaveState,
  getHardDriveData, getHardDriveState, restoreDriveSaveState } from "./drivestate"
import { doGetSaveState, doRestoreSaveState } from "../save_restore"
import { setIsTesting } from "../worker2main"
import * as workerMessages from "../worker2main"

const largeDiskSize = 32_000_000

const emptyDriveSaveState = (): DriveSaveState => ({
  currentDrive: 2,
  driveState: [{}, {}, {}, {}],
  driveData: ["", "", "", ""]
})

const mountHardDrive = (diskData: Uint8Array, filename = "large-disk.hdv") => {
  const props: DriveProps = {
    index: 0,
    hardDrive: true,
    drive: 1,
    filename,
    status: "",
    motorRunning: false,
    diskHasChanges: false,
    isWriteProtected: false,
    diskData,
    lastAppleWriteTime: 0,
    cloudData: null,
    writableFileHandle: null,
    lastLocalFileWriteTime: 0
  }
  doSetEmuDriveNewData(props)
}

beforeAll(() => setIsTesting())
beforeEach(() => restoreDriveSaveState(emptyDriveSaveState()))
afterEach(() => jest.restoreAllMocks())

test("rejects invalid non-empty media and forces the empty canonical drive to the UI", () => {
  const passDriveProps = jest.spyOn(workerMessages, "passDriveProps")
  const result = doSetEmuDriveNewData({
    index: 2,
    hardDrive: false,
    drive: 1,
    filename: "invalid.woz",
    status: "",
    motorRunning: false,
    diskHasChanges: false,
    isWriteProtected: false,
    diskData: new Uint8Array([1, 2, 3]),
    lastAppleWriteTime: 0,
    cloudData: null,
    writableFileHandle: null,
    lastLocalFileWriteTime: 0,
  })

  expect(result).toBe(false)
  expect(passDriveProps).toHaveBeenCalledWith(expect.objectContaining({
    index: 2,
    filename: "",
    diskData: new Uint8Array(),
  }), true)
})

test("accepts valid media at a forced drive index", () => {
  const result = doSetEmuDriveNewData({
    index: 3,
    hardDrive: true,
    drive: 2,
    filename: "valid.hdv",
    status: "",
    motorRunning: false,
    diskHasChanges: false,
    isWriteProtected: false,
    diskData: new Uint8Array(16_384),
    lastAppleWriteTime: 0,
    cloudData: null,
    writableFileHandle: null,
    lastLocalFileWriteTime: 0,
  }, true)

  expect(result).toBe(true)
})

test("rejects hard-drive-sized ProDOS media forced into fd1 and publishes empty state", () => {
  const passDriveProps = jest.spyOn(workerMessages, "passDriveProps")
  const result = doSetEmuDriveNewData({
    index: 2,
    hardDrive: false,
    drive: 1,
    filename: "large.po",
    status: "",
    motorRunning: false,
    diskHasChanges: false,
    isWriteProtected: false,
    diskData: new Uint8Array(143361),
    lastAppleWriteTime: 0,
    cloudData: null,
    writableFileHandle: null,
    lastLocalFileWriteTime: 0,
  }, true)

  expect(result).toBe(false)
  expect(getCurrentDriveState()).toEqual(expect.objectContaining({
    index: 2,
    hardDrive: false,
    filename: "",
  }))
  expect(getCurrentDriveData()).toHaveLength(0)
  expect(passDriveProps).toHaveBeenCalledWith(expect.objectContaining({
    index: 2,
    hardDrive: false,
    filename: "",
    diskData: new Uint8Array(),
  }), true)
})

test("accepts the same hard-drive-sized ProDOS media forced into hd1", () => {
  const diskData = new Uint8Array(143361)
  diskData[0] = 0xA5
  const result = doSetEmuDriveNewData({
    index: 0,
    hardDrive: true,
    drive: 1,
    filename: "large.po",
    status: "",
    motorRunning: false,
    diskHasChanges: false,
    isWriteProtected: false,
    diskData,
    lastAppleWriteTime: 0,
    cloudData: null,
    writableFileHandle: null,
    lastLocalFileWriteTime: 0,
  }, true)

  expect(result).toBe(true)
  expect(getHardDriveState(1)).toEqual(expect.objectContaining({
    index: 0,
    hardDrive: true,
    filename: "large.po",
  }))
  expect(getHardDriveData(1)[0]).toBe(diskData)
})

test("accepts a standard-sized ProDOS floppy forced into fd1", () => {
  const result = doSetEmuDriveNewData({
    index: 2,
    hardDrive: false,
    drive: 1,
    filename: "standard.po",
    status: "",
    motorRunning: false,
    diskHasChanges: false,
    isWriteProtected: false,
    diskData: new Uint8Array(143360),
    lastAppleWriteTime: 0,
    cloudData: null,
    writableFileHandle: null,
    lastLocalFileWriteTime: 0,
  }, true)

  expect(result).toBe(true)
  expect(getCurrentDriveState()).toEqual(expect.objectContaining({
    index: 2,
    hardDrive: false,
    filename: "standard.woz",
  }))
  expect(getCurrentDriveData().length).toBeGreaterThan(0)
})

test("rejects a standard-sized ProDOS floppy forced into hd1", () => {
  const result = doSetEmuDriveNewData({
    index: 0,
    hardDrive: true,
    drive: 1,
    filename: "standard.po",
    status: "",
    motorRunning: false,
    diskHasChanges: false,
    isWriteProtected: false,
    diskData: new Uint8Array(143360),
    lastAppleWriteTime: 0,
    cloudData: null,
    writableFileHandle: null,
    lastLocalFileWriteTime: 0,
  }, true)

  expect(result).toBe(false)
  expect(getHardDriveState(1)).toEqual(expect.objectContaining({
    index: 0,
    hardDrive: true,
    filename: "",
  }))
  expect(getHardDriveData(1)[0]).toHaveLength(0)
})

test.each([
  ["valid.woz", convertdsk2woz(new Uint8Array(143360), false)],
  ["valid.dsk", new Uint8Array(143360)],
])("rejects floppy-only %s media forced into hd1", (filename, diskData) => {
  const result = doSetEmuDriveNewData({
    index: 0,
    hardDrive: true,
    drive: 1,
    filename,
    status: "",
    motorRunning: false,
    diskHasChanges: false,
    isWriteProtected: false,
    diskData,
    lastAppleWriteTime: 0,
    cloudData: null,
    writableFileHandle: null,
    lastLocalFileWriteTime: 0,
  }, true)

  expect(result).toBe(false)
  expect(getHardDriveState(1)).toEqual(expect.objectContaining({
    index: 0,
    hardDrive: true,
    filename: "",
  }))
  expect(getHardDriveData(1)[0]).toHaveLength(0)
})

test("accepts an empty drive as an eject operation", () => {
  const result = doSetEmuDriveNewData({
    index: 2,
    hardDrive: false,
    drive: 1,
    filename: "",
    status: "",
    motorRunning: false,
    diskHasChanges: false,
    isWriteProtected: false,
    diskData: new Uint8Array(),
    lastAppleWriteTime: -1,
    cloudData: null,
    writableFileHandle: null,
    lastLocalFileWriteTime: -1,
  })

  expect(result).toBe(true)
})

test("a time-travel snapshot omits large-disk data without losing the disk on restore", () => {
  const diskData = new Uint8Array(largeDiskSize)
  diskData[0] = 0xA5
  diskData[largeDiskSize - 1] = 0x5A
  mountHardDrive(diskData)
  const bufferFrom = jest.spyOn(Buffer, "from")

  const state = doGetSaveState(false)
  expect(state.driveState.driveData[0]).toBe("")
  expect(bufferFrom.mock.calls.some(([value]) => value === diskData)).toBe(false)

  doRestoreSaveState(state)
  const [restoredData,, restoredLength] = getHardDriveData(1)
  expect(restoredLength).toBe(largeDiskSize)
  expect(restoredData[0]).toBe(0xA5)
  expect(restoredData[largeDiskSize - 1]).toBe(0x5A)
})

test("restoring a time-travel snapshot preserves current large-disk data and metadata", () => {
  const diskData = new Uint8Array(largeDiskSize)
  diskData[0] = 0xA5
  mountHardDrive(diskData)
  const state = doGetSaveState(false)

  diskData[0] = 0x5A
  const currentDriveState = getHardDriveState(1)
  currentDriveState.diskHasChanges = true
  currentDriveState.lastAppleWriteTime = 123
  doRestoreSaveState(state)

  const [restoredData] = getHardDriveData(1)
  expect(restoredData[0]).toBe(0x5A)
  expect(getHardDriveState(1).diskHasChanges).toBe(true)
  expect(getHardDriveState(1).lastAppleWriteTime).toBe(123)
})

test("a portable save state includes large-disk data", () => {
  const diskData = new Uint8Array(largeDiskSize)
  mountHardDrive(diskData)

  const state = getDriveSaveState(true)
  expect(state.driveData[0]).toHaveLength(4 * Math.ceil(largeDiskSize / 3))
})

test("a time-travel snapshot includes disk data below the size threshold", () => {
  const diskSize = largeDiskSize - 1
  const diskData = new Uint8Array(diskSize)
  mountHardDrive(diskData)

  const state = getDriveSaveState(false)
  expect(state.driveData[0]).toHaveLength(4 * Math.ceil(diskSize / 3))
})

test("restoring a time-travel snapshot preserves a replacement large disk", () => {
  const firstDisk = new Uint8Array(largeDiskSize)
  firstDisk[0] = 0xA5
  mountHardDrive(firstDisk, "first.hdv")
  const firstState = getDriveSaveState(false)

  const secondDisk = new Uint8Array(largeDiskSize)
  secondDisk[0] = 0x5A
  mountHardDrive(secondDisk, "second.hdv")
  restoreDriveSaveState(firstState)

  const [restoredData,, restoredLength] = getHardDriveData(1)
  expect(restoredLength).toBe(largeDiskSize)
  expect(restoredData[0]).toBe(0x5A)
  expect(getHardDriveState(1).filename).toBe("second.hdv")
})

test("restoring a time-travel snapshot replaces current small-disk data with snapshot data", () => {
  const firstDisk = new Uint8Array(16_384)
  firstDisk[0] = 0xA5
  mountHardDrive(firstDisk, "small.hdv")
  const firstState = getDriveSaveState(false)

  const replacementDisk = new Uint8Array(16_384)
  replacementDisk[0] = 0x5A
  mountHardDrive(replacementDisk, "small.hdv")
  restoreDriveSaveState(firstState)

  const [restoredData,, restoredLength] = getHardDriveData(1)
  expect(restoredLength).toBe(16_384)
  expect(restoredData[0]).toBe(0xA5)
})
