const mockHandleSetDiskFromFile = jest.fn()
const mockPassSetRunMode = jest.fn()
const mockBuildProDosHdv = jest.fn()
const mockShowGlobalProgressModal = jest.fn()
const mockLoadAndConvertImageToHires = jest.fn()

const mockHandleSetDiskFromURL = jest.fn().mockResolvedValue(true)
const mockResetAllDiskDrives = jest.fn()
const mockHandleInputParams = jest.fn()
const mockHandleSetVeraSdFromURL = jest.fn().mockResolvedValue(true)

jest.mock("../../common/prodos_hdv", () => ({
  ...jest.requireActual("../../common/prodos_hdv"),
  buildProDosHdv: (...args: unknown[]) => mockBuildProDosHdv(...args),
}))

jest.mock("../devices/disk/driveprops", () => ({
  handleSetDiskFromCloudData: jest.fn(),
  handleSetDiskFromFile: (...args: unknown[]) => mockHandleSetDiskFromFile(...args),
  handleSetDiskFromURL: (...args: unknown[]) => mockHandleSetDiskFromURL(...args),
  resetAllDiskDrives: (...args: unknown[]) => mockResetAllDiskDrives(...args),
}))
jest.mock("../inputparams", () => ({
  handleInputParams: (...args: unknown[]) => mockHandleInputParams(...args),
}))
jest.mock("../devices/vera/verasdicon", () => ({
  handleSetVeraSdFromURL: (...args: unknown[]) => mockHandleSetVeraSdFromURL(...args),
}))
jest.mock("../main2worker", () => ({
  passSetRunMode: (...args: unknown[]) => mockPassSetRunMode(...args),
}))
jest.mock("../ui_utilities", () => ({
  showGlobalProgressModal: (...args: unknown[]) => mockShowGlobalProgressModal(...args),
}))
jest.mock("./screenshot_utils", () => ({
  loadAndConvertImageToHires: (...args: unknown[]) => mockLoadAndConvertImageToHires(...args),
}))

import { RUN_MODE } from "../../common/utility"
import { createHdv, DISK_COLLECTION_ITEM_TYPE, getExportBadgeInfo, getMultiDiskConfigFromItem, getPrimaryDiskUrl, loadDisk, loadDiskIntoDrive } from "./diskpanel_utils"

describe("loadDisk", () => {
  const disk = {
    diskUrl: "Example.po",
    title: "Example",
    type: DISK_COLLECTION_ITEM_TYPE.A2TS_ARCHIVE,
  } as DiskCollectionItem

  beforeEach(() => {
    mockHandleSetDiskFromFile.mockClear()
    mockPassSetRunMode.mockClear()
    mockBuildProDosHdv.mockReset()
    mockShowGlobalProgressModal.mockClear()
  })

  test("installs a collection disk before reporting load success", () => {
    const updateDisplay = jest.fn()
    const onLoadSuccess = jest.fn()

    loadDisk(-1, disk, updateDisplay, undefined, onLoadSuccess)

    expect(mockHandleSetDiskFromFile).toHaveBeenCalledWith(
      "Example.po",
      updateDisplay,
      -1,
      undefined,
      onLoadSuccess,
    )
  })

  test("retains fetch-only callback behavior for exports", () => {
    const callback = jest.fn()

    loadDisk(-1, disk, jest.fn(), callback)

    expect(mockHandleSetDiskFromFile).toHaveBeenCalledWith(
      "Example.po",
      expect.any(Function),
      -1,
      callback,
      undefined,
    )
  })

  test("preserves a context-menu drive selection", () => {
    const updateDisplay = jest.fn()
    const onLoadSuccess = jest.fn()

    loadDiskIntoDrive(3, disk, updateDisplay, onLoadSuccess)

    expect(mockHandleSetDiskFromFile).toHaveBeenCalledWith(
      "Example.po",
      updateDisplay,
      3,
      undefined,
      onLoadSuccess,
      true,
    )
    expect(mockPassSetRunMode).not.toHaveBeenCalled()
  })

  test("loads multiple disks when item defines disks or multi-disk params", async () => {
    const multiDisk: DiskCollectionItem = {
      type: DISK_COLLECTION_ITEM_TYPE.NEW_RELEASE,
      title: "MultiGame",
      diskUrl: "https://example.com/disk1.dsk",
      params: "s6d2=https://example.com/disk2.dsk&s2d1=https://example.com/vera.img&color=green",
      fileSize: 143360,
      lastUpdated: new Date(0),
    }

    const updateDisplay = jest.fn()
    const onLoadSuccess = jest.fn()

    loadDisk(-1, multiDisk, updateDisplay, undefined, onLoadSuccess)

    // Should reset drives and apply input params
    expect(mockResetAllDiskDrives).toHaveBeenCalled()
    expect(mockHandleInputParams).toHaveBeenCalledWith(multiDisk.params)

    // Wait for promise resolution
    await Promise.resolve()
    await Promise.resolve()

    // Should mount drive 1 (index 2) and drive 2 (index 3)
    expect(mockHandleSetDiskFromURL).toHaveBeenCalledWith(
      "https://example.com/disk1.dsk",
      updateDisplay,
      2,
      undefined,
      undefined,
      undefined,
      true,
      false,
      true,
      true,
    )
    expect(mockHandleSetDiskFromURL).toHaveBeenCalledWith(
      "https://example.com/disk2.dsk",
      updateDisplay,
      3,
      undefined,
      undefined,
      undefined,
      true,
      false,
      true,
      true,
    )
    // Should mount VERA SD
    expect(mockHandleSetVeraSdFromURL).toHaveBeenCalledWith("https://example.com/vera.img")

    // Should trigger boot
    expect(mockPassSetRunMode).toHaveBeenCalledWith(RUN_MODE.NEED_BOOT)
    expect(onLoadSuccess).toHaveBeenCalled()
  })
})

describe("getMultiDiskConfigFromItem", () => {
  test("identifies single disk items correctly", () => {
    const item: DiskCollectionItem = {
      type: DISK_COLLECTION_ITEM_TYPE.A2TS_ARCHIVE,
      title: "Solo",
      diskUrl: "solo.dsk",
      fileSize: 143360,
      lastUpdated: new Date(0),
    }
    const config = getMultiDiskConfigFromItem(item)
    expect(config.isMultiDisk).toBe(false)
    expect(config.drives).toEqual([{ index: 2, url: "solo.dsk" }])
    expect(config.veraSdUrl).toBeUndefined()
  })

  test("parses diskUrl as multi-disk object dictionary", () => {
    const item: DiskCollectionItem = {
      type: DISK_COLLECTION_ITEM_TYPE.NEW_RELEASE,
      title: "DiskUrlObject",
      diskUrl: {
        s6d1: "sideA.dsk",
        s6d2: "sideB.dsk",
      },
      fileSize: 143360,
      lastUpdated: new Date(0),
    }
    const config = getMultiDiskConfigFromItem(item)
    expect(config.isMultiDisk).toBe(true)
    expect(config.drives).toEqual([
      { index: 2, url: "sideA.dsk" },
      { index: 3, url: "sideB.dsk" },
    ])
    expect(getPrimaryDiskUrl(item)).toBe("sideA.dsk")
  })

  test("parses diskUrl as array", () => {
    const item: DiskCollectionItem = {
      type: DISK_COLLECTION_ITEM_TYPE.NEW_RELEASE,
      title: "ArrayDisks",
      diskUrl: ["boot.dsk", "data.dsk"],
      fileSize: 143360,
      lastUpdated: new Date(0),
    }
    const config = getMultiDiskConfigFromItem(item)
    expect(config.isMultiDisk).toBe(true)
    expect(config.drives).toEqual([
      { index: 2, url: "boot.dsk" },
      { index: 3, url: "data.dsk" },
    ])
    expect(getPrimaryDiskUrl(item)).toBe("boot.dsk")
  })

  test("parses multi-disk and VERA SD from params", () => {
    const item: DiskCollectionItem = {
      type: DISK_COLLECTION_ITEM_TYPE.NEW_RELEASE,
      title: "VeraGame",
      diskUrl: "game.hdv",
      params: "slot2=vera&s2d1=sdcard.img",
      fileSize: 819200,
      lastUpdated: new Date(0),
    }
    const config = getMultiDiskConfigFromItem(item)
    expect(config.isMultiDisk).toBe(true)
    expect(config.drives).toEqual([{ index: 0, url: "game.hdv" }])
    expect(config.veraSdUrl).toBe("sdcard.img")
  })
})

describe("createHdv", () => {
  beforeEach(() => {
    mockBuildProDosHdv.mockReset()
    mockLoadAndConvertImageToHires.mockReset()
    mockShowGlobalProgressModal.mockClear()
  })

  test("keeps each exported file paired with its menu metadata", async () => {
    Object.defineProperty(URL, "createObjectURL", { configurable: true, value: jest.fn(() => "blob:test") })
    Object.defineProperty(URL, "revokeObjectURL", { configurable: true, value: jest.fn() })
    mockBuildProDosHdv.mockResolvedValue(new Uint8Array([1]))
    mockLoadAndConvertImageToHires.mockImplementation(async (_url, _logo, index) => ({
      plain: new Uint8Array([index]),
      keyboard: new Uint8Array([index + 10]),
    }))
    const disks = ["Alpha", "Bravo", "Charlie"].map((title, index) => ({
      item: { title, imageUrl: `${title}.png` } as DiskCollectionItem,
      buffer: new Uint8Array([index + 1]),
      filename: `${title}.TXT`,
    }))

    await createHdv(disks)

    const [files, , , menuEntries] = mockBuildProDosHdv.mock.calls[0]
    expect(files.map((file: { name: string; data: Uint8Array }) => [file.name, ...file.data])).toEqual([
      ["Alpha", 1],
      ["Bravo", 2],
      ["Charlie", 3],
    ])
    expect(menuEntries.map((entry: {
      displayName?: string
      screenshotData?: Uint8Array
      keyboardScreenshotData?: Uint8Array
    }) => [
      entry.displayName,
      entry.screenshotData?.[0],
      entry.keyboardScreenshotData?.[0],
    ])).toEqual([
      ["Alpha", 1, 11],
      ["Bravo", 2, 12],
      ["Charlie", 3, 13],
    ])
  })

  test("continues after confirmation and summarizes omitted titles", async () => {
    const alert = jest.spyOn(window, "alert").mockImplementation(() => undefined)
    const confirm = jest.spyOn(window, "confirm").mockReturnValue(true)
    const createElement = jest.spyOn(document, "createElement")
    const createObjectURL = jest.fn(() => "blob:test")
    const revokeObjectURL = jest.fn()
    Object.defineProperty(URL, "createObjectURL", { configurable: true, value: createObjectURL })
    Object.defineProperty(URL, "revokeObjectURL", { configurable: true, value: revokeObjectURL })
    mockBuildProDosHdv.mockImplementation(async (...args: unknown[]) => {
      const reportFailure = args[5] as (failure: { title: string; reason: string }) => boolean
      expect(reportFailure({ title: "Aztec", reason: "no usable binary" })).toBe(true)
      expect(reportFailure({ title: "Chivalry", reason: "download failed" })).toBe(true)
      return new Uint8Array([1])
    })

    await createHdv([])

    expect(confirm).toHaveBeenCalledTimes(1)
    expect(confirm).toHaveBeenCalledWith(
      "Apple2TS could not include \"Aztec\" in the HDV.\n\n" +
      "Continue creating the HDV and skip unavailable titles?",
    )
    expect(alert).toHaveBeenCalledWith(
      "Apple2TS created the HDV with some titles omitted:\n\n" +
      "\"Aztec\": no usable binary\n\"Chivalry\": download failed",
    )
    expect(createElement).toHaveBeenCalledWith("a")
    expect(mockShowGlobalProgressModal).toHaveBeenNthCalledWith(1, true, "Creating the HDV image")
    expect(mockShowGlobalProgressModal).toHaveBeenLastCalledWith(false)

    alert.mockRestore()
    confirm.mockRestore()
    createElement.mockRestore()
  })

  test("cancels the export when continuation is declined", async () => {
    const alert = jest.spyOn(window, "alert").mockImplementation(() => undefined)
    const confirm = jest.spyOn(window, "confirm").mockReturnValue(false)
    const createElement = jest.spyOn(document, "createElement")
    mockBuildProDosHdv.mockImplementation(async (...args: unknown[]) => {
      const reportFailure = args[5] as (failure: { title: string; reason: string }) => boolean
      if (!reportFailure({ title: "Aztec", reason: "no usable binary" })) {
        throw new Error("Could not export \"Aztec\": no usable binary")
      }
      return new Uint8Array([1])
    })

    await createHdv([])

    expect(alert).toHaveBeenCalledWith(
      "Apple2TS could not create the HDV: Could not export \"Aztec\": no usable binary",
    )
    expect(createElement).not.toHaveBeenCalledWith("a")
    expect(mockShowGlobalProgressModal).toHaveBeenLastCalledWith(false)

    alert.mockRestore()
    confirm.mockRestore()
    createElement.mockRestore()
  })
})

describe("getExportBadgeInfo", () => {
  const disk = {
    fileSize: 143360,
    title: "Example",
    type: DISK_COLLECTION_ITEM_TYPE.A2TS_ARCHIVE,
  } as DiskCollectionItem

  test.each([
    [{ ...disk, exportDisabled: true }, "blocked", "This disk cannot be exported"],
    [{ ...disk, fileSize: 33554432 }, "blocked", "This disk is too large to export"],
    [{ ...disk, vtocType: "other" }, "blocked", "Copy protection prevents exporting this disk"],
    [{ ...disk, vtocType: "dosup" }, "blocked", "This disk is incompatible with DOS.MASTER"],
    [{ ...disk, vtocType: undefined }, "pending", "Checking whether this disk can be exported"],
    [{ ...disk, vtocType: "prodos" }, "exportable", "This disk can be exported"],
  ])("returns localized export status", (item, state, title) => {
    expect(getExportBadgeInfo(item as DiskCollectionItem)).toEqual({ state, title })
  })
})
