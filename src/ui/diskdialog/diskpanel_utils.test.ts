const mockHandleSetDiskFromFile = jest.fn()
const mockPassSetRunMode = jest.fn()
const mockBuildProDosHdv = jest.fn()
const mockShowGlobalProgressModal = jest.fn()

jest.mock("../../common/prodos_hdv", () => ({
  ...jest.requireActual("../../common/prodos_hdv"),
  buildProDosHdv: (...args: unknown[]) => mockBuildProDosHdv(...args),
}))

jest.mock("../devices/disk/driveprops", () => ({
  handleSetDiskFromCloudData: jest.fn(),
  handleSetDiskFromFile: (...args: unknown[]) => mockHandleSetDiskFromFile(...args),
  handleSetDiskFromURL: jest.fn(),
}))
jest.mock("../main2worker", () => ({
  passSetRunMode: (...args: unknown[]) => mockPassSetRunMode(...args),
}))
jest.mock("../ui_utilities", () => ({
  showGlobalProgressModal: (...args: unknown[]) => mockShowGlobalProgressModal(...args),
}))

import { createHdv, DISK_COLLECTION_ITEM_TYPE, getExportBadgeInfo, loadDisk, loadDiskIntoDrive } from "./diskpanel_utils"

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
})

describe("createHdv", () => {
  beforeEach(() => {
    mockBuildProDosHdv.mockReset()
    mockShowGlobalProgressModal.mockClear()
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
