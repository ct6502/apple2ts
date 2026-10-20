import { convertdsk2woz } from "../../common/convertdsk2woz"
import { crc32, isWozData, updateWozCrc } from "../../common/utility"
import { decodeDiskData } from "./decodedisk"
import { doSetEmuDriveNewData, getCurrentDriveData, getCurrentDriveState, passDriveData } from "./drivestate"
import { setIsTesting } from "../worker2main"
import * as workerMessages from "../worker2main"

beforeAll(() => setIsTesting())
afterEach(() => jest.restoreAllMocks())

describe("WOZ CRC handling", () => {
  test("convertdsk2woz creates a valid WOZ with matching non-zero CRC", () => {
    const dsk = new Uint8Array(143360)
    const woz = convertdsk2woz(dsk, false)
    expect(isWozData(woz)).toBe(true)

    const storedCRC = woz[8] + (woz[9] << 8) + (woz[10] << 16) + woz[11] * (2 ** 24)
    const actualCRC = crc32(woz, 12)
    expect(storedCRC).not.toBe(0)
    expect(storedCRC).toBe(actualCRC)
  })

  test("modified WOZ disk gets CRC updated when published and reloaded without error", () => {
    const passDriveProps = jest.spyOn(workerMessages, "passDriveProps")
    const passErrorMsg = jest.spyOn(workerMessages, "passErrorMsg")

    const dsk = new Uint8Array(143360)
    const woz = convertdsk2woz(dsk, false)

    // Mount disk into drive 2 (floppy 1)
    doSetEmuDriveNewData({
      index: 2,
      hardDrive: false,
      drive: 1,
      filename: "test.woz",
      status: "",
      motorRunning: false,
      diskHasChanges: false,
      isWriteProtected: false,
      diskData: woz,
      lastAppleWriteTime: 0,
      cloudData: null,
      writableFileHandle: null,
      lastLocalFileWriteTime: 0,
    }, true)

    const ds = getCurrentDriveState()
    const dd = getCurrentDriveData()

    // Simulate Apple II writing to track:
    dd[1536] = 0xAA
    dd[1537] = 0xBB
    ds.diskHasChanges = true
    ds.motorRunning = false

    // Publish drive data
    passDriveData(2, true)

    const lastCall = passDriveProps.mock.calls.at(-1)
    expect(lastCall).toBeDefined()
    const publishedData: Uint8Array = lastCall![0].diskData
    expect(publishedData.length).toBeGreaterThan(0)

    // Verify CRC in publishedData is up-to-date
    const storedCRC = publishedData[8] + (publishedData[9] << 8) + (publishedData[10] << 16) + publishedData[11] * (2 ** 24)
    const actualCRC = crc32(publishedData, 12)
    expect(storedCRC).toBe(actualCRC)

    // Next load: decodeDiskData must succeed and NOT report CRC error
    passErrorMsg.mockClear()
    const decoded = decodeDiskData(ds, publishedData, true)
    expect(decoded.length).toBeGreaterThan(0)
    expect(passErrorMsg).not.toHaveBeenCalled()
  })

  test("swapping between disks after modification does not cause CRC error", () => {
    const passErrorMsg = jest.spyOn(workerMessages, "passErrorMsg")

    const dsk1 = new Uint8Array(143360)
    dsk1[100] = 1
    const woz1 = convertdsk2woz(dsk1, false)

    const dsk2 = new Uint8Array(143360)
    dsk2[100] = 2
    const woz2 = convertdsk2woz(dsk2, false)

    // Mount disk 1
    doSetEmuDriveNewData({
      index: 2,
      hardDrive: false,
      drive: 1,
      filename: "disk1.woz",
      status: "",
      motorRunning: false,
      diskHasChanges: false,
      isWriteProtected: false,
      diskData: woz1,
      lastAppleWriteTime: 0,
      cloudData: null,
      writableFileHandle: null,
      lastLocalFileWriteTime: 0,
    }, true)

    const ds = getCurrentDriveState()
    const dd = getCurrentDriveData()

    // Write to disk 1
    dd[1536] = 0x55
    ds.diskHasChanges = true
    ds.motorRunning = false
    passDriveData(2, true)

    // Ensure updateWozCrc updates disk 1
    updateWozCrc(dd)

    // Now swap to disk 2
    doSetEmuDriveNewData({
      index: 2,
      hardDrive: false,
      drive: 1,
      filename: "disk2.woz",
      status: "",
      motorRunning: false,
      diskHasChanges: false,
      isWriteProtected: false,
      diskData: woz2,
      lastAppleWriteTime: 0,
      cloudData: null,
      writableFileHandle: null,
      lastLocalFileWriteTime: 0,
    }, true)

    // Now swap back to disk 1 with the modified data
    passErrorMsg.mockClear()
    const swapResult = doSetEmuDriveNewData({
      index: 2,
      hardDrive: false,
      drive: 1,
      filename: "disk1.woz",
      status: "",
      motorRunning: false,
      diskHasChanges: true,
      isWriteProtected: false,
      diskData: dd,
      lastAppleWriteTime: 0,
      cloudData: null,
      writableFileHandle: null,
      lastLocalFileWriteTime: 0,
    }, true)

    expect(swapResult).toBe(true)
    expect(passErrorMsg).not.toHaveBeenCalled()
  })
})
