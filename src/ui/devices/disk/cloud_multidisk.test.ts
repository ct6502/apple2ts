import * as fflate from "fflate"
import { loadDiskFromCloudDrive } from "./diskdrive"
import * as driveprops from "./driveprops"
import * as savestate from "../../savestate"

jest.mock("../../main2worker", () => ({
  passSetDriveProps: jest.fn(),
  handleGetSlotConfig: jest.fn(() => 0),
  handleGetRunMode: jest.fn(() => 0), // RUN_MODE.IDLE
}))

jest.mock("./onedriveclouddrive", () => ({
  OneDriveCloudDrive: jest.fn(),
}))

jest.mock("./googledrive", () => ({
  GoogleDrive: jest.fn(),
}))

jest.mock("./demozoodialog", () => ({
  default: () => null,
}))

jest.mock("../../ui_utilities", () => ({
  isFileSystemApiSupported: () => true,
  showGlobalProgressModal: jest.fn(),
}))

describe("loadDiskFromCloudDrive multi-disk & archive support", () => {
  let mockHandleSetDiskOrFileFromBuffer: jest.SpyInstance
  let mockSetStandbyDisks: jest.SpyInstance
  let mockRestoreSaveState: jest.SpyInstance

  beforeEach(() => {
    jest.clearAllMocks()
    mockHandleSetDiskOrFileFromBuffer = jest.spyOn(driveprops, "handleSetDiskOrFileFromBuffer").mockReturnValue(2)
    mockSetStandbyDisks = jest.spyOn(driveprops, "setStandbyDisks").mockImplementation(() => undefined)
    mockRestoreSaveState = jest.spyOn(savestate, "RestoreSaveState").mockImplementation(() => undefined)
  })

  afterEach(() => {
    mockHandleSetDiskOrFileFromBuffer.mockRestore()
    mockSetStandbyDisks.mockRestore()
    mockRestoreSaveState.mockRestore()
  })

  test("loads a single disk file from cloud provider into drive", async () => {
    const diskBytes = new Uint8Array([0x01, 0x02, 0x03])
    const blob = new Blob([diskBytes])
    const cloudData: CloudData = {
      providerName: "OneDrive",
      syncStatus: 1,
      syncInterval: 60000,
      lastSyncTime: Date.now(),
      fileName: "SingleDisk.dsk",
      parentId: "root",
      itemId: "item1",
      apiEndpoint: "",
      downloadUrl: "",
      detailsUrl: "",
      fileSize: 3,
    }

    const mockProvider: CloudProvider = {
      download: jest.fn().mockResolvedValue([blob, cloudData]),
      upload: jest.fn(),
      sync: jest.fn(),
      requestAuthToken: jest.fn(),
      hasAuthToken: () => true,
    }

    const success = await loadDiskFromCloudDrive(mockProvider, 2)
    expect(success).toBe(true)
    expect(mockHandleSetDiskOrFileFromBuffer).toHaveBeenCalledWith(
      2,
      expect.any(ArrayBuffer),
      "SingleDisk.dsk",
      cloudData,
      null,
      undefined,
      true,
      false,
      true,
      false, // idle boots
    )
    expect(mockSetStandbyDisks).toHaveBeenCalledWith(
      2,
      expect.arrayContaining([
        expect.objectContaining({ filename: "SingleDisk.dsk" }),
      ]),
      0,
    )
  })

  test("loads multiple selected disk files from cloud provider and sets up swapper", async () => {
    const disk1Bytes = new Uint8Array([0x11, 0x11])
    const disk2Bytes = new Uint8Array([0x22, 0x22])
    const blob1 = new Blob([disk1Bytes])
    const blob2 = new Blob([disk2Bytes])

    const cloudData1: CloudData = {
      providerName: "GoogleDrive",
      syncStatus: 1,
      syncInterval: 60000,
      lastSyncTime: Date.now(),
      fileName: "Adventure_Disk2.dsk", // disk 2
      parentId: "root",
      itemId: "id2",
      apiEndpoint: "",
      downloadUrl: "",
      detailsUrl: "",
      fileSize: 2,
    }
    const cloudData2: CloudData = {
      providerName: "GoogleDrive",
      syncStatus: 1,
      syncInterval: 60000,
      lastSyncTime: Date.now(),
      fileName: "Adventure_Boot.dsk", // boot disk
      parentId: "root",
      itemId: "id1",
      apiEndpoint: "",
      downloadUrl: "",
      detailsUrl: "",
      fileSize: 2,
    }

    const mockProvider: CloudProvider = {
      download: jest.fn().mockResolvedValue([[blob1, cloudData1], [blob2, cloudData2]]),
      upload: jest.fn(),
      sync: jest.fn(),
      requestAuthToken: jest.fn(),
      hasAuthToken: () => true,
    }

    const success = await loadDiskFromCloudDrive(mockProvider, 2)
    expect(success).toBe(true)
    // Adventure_Boot.dsk should be sorted first
    expect(mockHandleSetDiskOrFileFromBuffer).toHaveBeenCalledWith(
      2,
      expect.any(ArrayBuffer),
      "Adventure_Boot.dsk",
      cloudData2,
      null,
      undefined,
      true,
      false,
      true,
      false,
    )
    // Swapper standby disks should contain both in proper order
    expect(mockSetStandbyDisks).toHaveBeenCalledWith(
      2,
      [
        expect.objectContaining({ filename: "Adventure_Boot.dsk" }),
        expect.objectContaining({ filename: "Adventure_Disk2.dsk" }),
      ],
      0,
    )
  })

  test("unpacks a multi-disk zip archive and registers all disks in swapper", async () => {
    const diskA = new Uint8Array(2048).fill(0xaa)
    const diskB = new Uint8Array(2048).fill(0xbb)
    const zipped = fflate.zipSync({
      "Side2.dsk": diskB,
      "Side1_Boot.dsk": diskA,
    })
    const blob = new Blob([zipped])
    const cloudData: CloudData = {
      providerName: "OneDrive",
      syncStatus: 1,
      syncInterval: 60000,
      lastSyncTime: Date.now(),
      fileName: "TwoSides.zip",
      parentId: "root",
      itemId: "zip1",
      apiEndpoint: "",
      downloadUrl: "",
      detailsUrl: "",
      fileSize: zipped.length,
    }

    const mockProvider: CloudProvider = {
      download: jest.fn().mockResolvedValue([blob, cloudData]),
      upload: jest.fn(),
      sync: jest.fn(),
      requestAuthToken: jest.fn(),
      hasAuthToken: () => true,
    }

    const success = await loadDiskFromCloudDrive(mockProvider, 2)
    expect(success).toBe(true)
    expect(mockHandleSetDiskOrFileFromBuffer).toHaveBeenCalledWith(
      2,
      expect.any(ArrayBuffer),
      "Side1_Boot.dsk",
      expect.objectContaining({ isArchive: true, syncStatus: 0 }), // CLOUD_SYNC.INACTIVE so icon is initially hidden
      null,
      undefined,
      true,
      false,
      true,
      false,
    )
    expect(mockSetStandbyDisks).toHaveBeenCalledWith(
      2,
      [
        expect.objectContaining({ filename: "Side1_Boot.dsk", cloudData: expect.objectContaining({ isArchive: true, syncStatus: 0 }) }),
        expect.objectContaining({ filename: "Side2.dsk", cloudData: expect.objectContaining({ isArchive: true, syncStatus: 0 }) }),
      ],
      0,
    )
  })

  test("restores save state when a single .a2ts file is loaded from cloud", async () => {
    const saveStateText = JSON.stringify({ version: 2, machine: "Apple IIe" })
    const blob = new Blob([saveStateText], { type: "text/plain" })
    const cloudData: CloudData = {
      providerName: "GoogleDrive",
      syncStatus: 1,
      syncInterval: 60000,
      lastSyncTime: Date.now(),
      fileName: "MySave.a2ts",
      parentId: "root",
      itemId: "save1",
      apiEndpoint: "",
      downloadUrl: "",
      detailsUrl: "",
      fileSize: saveStateText.length,
    }

    const mockProvider: CloudProvider = {
      download: jest.fn().mockResolvedValue([blob, cloudData]),
      upload: jest.fn(),
      sync: jest.fn(),
      requestAuthToken: jest.fn(),
      hasAuthToken: () => true,
    }

    const success = await loadDiskFromCloudDrive(mockProvider, 2)
    expect(success).toBe(true)
    expect(mockRestoreSaveState).toHaveBeenCalledWith(saveStateText)
    expect(mockHandleSetDiskOrFileFromBuffer).not.toHaveBeenCalled()
  })
})
