const mockHandleSetDiskFromFile = jest.fn()
const mockPassSetRunMode = jest.fn()

jest.mock("../devices/disk/driveprops", () => ({
  handleSetDiskFromCloudData: jest.fn(),
  handleSetDiskFromFile: (...args: unknown[]) => mockHandleSetDiskFromFile(...args),
  handleSetDiskFromURL: jest.fn(),
}))
jest.mock("../main2worker", () => ({
  passSetRunMode: (...args: unknown[]) => mockPassSetRunMode(...args),
}))

import { DISK_COLLECTION_ITEM_TYPE, loadDisk, loadDiskIntoDrive } from "./diskpanel_utils"

describe("loadDisk", () => {
  const disk = {
    diskUrl: "Example.po",
    title: "Example",
    type: DISK_COLLECTION_ITEM_TYPE.A2TS_ARCHIVE,
  } as DiskCollectionItem

  beforeEach(() => {
    mockHandleSetDiskFromFile.mockClear()
    mockPassSetRunMode.mockClear()
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