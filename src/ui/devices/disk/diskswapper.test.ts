import React from "react"
import { renderToStaticMarkup } from "react-dom/server"
import DiskDrive from "./diskdrive"
import * as uiUtilities from "../../ui_utilities"
import {
  appendStandbyDisks,
  doSetUIDriveProps,
  ejectAllDisks,
  getStandbyActiveIndex,
  getStandbyDisks,
  handleGetDriveProps,
  handleSetDiskData,
  setStandbyDisks,
  swapStandbyDisk,
  StandbyDisk,
} from "./driveprops"
import { MAX_DRIVES } from "../../../common/utility"

const mockPassSetDriveNewData = jest.fn()

jest.mock("../../main2worker", () => ({
  passSetDriveNewData: (...args: unknown[]) => mockPassSetDriveNewData(...args),
  requestSetDriveNewData: jest.fn(),
  passSetDriveProps: jest.fn(),
  passSetBinaryBlock: jest.fn(),
  passPasteText: jest.fn(),
  handleGetRunMode: jest.fn(() => 0),
  handleGetMachineName: jest.fn(() => "APPLE2GS"),
  handleGetSlotConfig: jest.fn(() => ({ 5: "gsSmartPort", 6: "gsDiskPort", 7: "gsSmartPort" })),
}))

// Capture real component callbacks while keeping driveprops unmocked.
const mockPopupMenus: PopupMenuItem[][][] = []
jest.mock("../../controls/popupmenu", () => ({
  __esModule: true,
  default: (props: { menuItems: PopupMenuItem[][] }) => {
    mockPopupMenus.push(props.menuItems)
    return null
  },
}))
jest.mock("./internetarchivedialog", () => ({ __esModule: true, default: () => null }))
jest.mock("./demozoodialog", () => ({ __esModule: true, default: () => null }))
jest.mock("./onedriveclouddrive", () => ({ OneDriveCloudDrive: jest.fn() }))
jest.mock("./googledrive", () => ({ GoogleDrive: jest.fn() }))
jest.mock("../../savestate", () => ({ RestoreSaveState: jest.fn() }))
jest.mock("../../../i18n/useTranslation", () => ({
  useTranslation: () => ({ t: (key: string) => key, language: "en" }),
}))

// The standby (multi-disk swapper) state used to be sized for four bays, so the
// IIgs built-in slot-5 3.5" pair - drive indices 4/5 - silently kept no list:
// S5,D1 got no badge, no swap menu and nothing to swap to, even though the URL
// layer already routed s5d1/s5d2 there.
const standby = (index: number, filename: string, marker: number): StandbyDisk => ({
  filename,
  diskData: new Uint8Array(16).fill(marker),
  diskHasChanges: false,
  isWriteProtected: false,
  writableFileHandle: null,
  cloudData: null,
  lastAppleWriteTime: -1,
  lastLocalFileWriteTime: -1,
})

// Mounting a disk is what makes it the group's active entry: the list is kept in
// step with the drive, so a group has to start from a real mount.
const mount = (index: number, filename: string, marker: number) => {
  handleSetDiskData(index, new Uint8Array(16).fill(marker), filename, null, null, -1)
}

describe("disk swapper standby groups", () => {
  beforeEach(() => mockPassSetDriveNewData.mockClear())

  test("every drive bay, slot 5 included, keeps its own group", () => {
    for (let index = 0; index < MAX_DRIVES; index++) {
      mount(index, `A${index}.2mg`, index)
      setStandbyDisks(index, [
        standby(index, `A${index}.2mg`, index),
        standby(index, `B${index}.2mg`, index + 100),
      ])
    }
    for (let index = 0; index < MAX_DRIVES; index++) {
      expect(getStandbyDisks(index).map(d => d.filename)).toEqual([`A${index}.2mg`, `B${index}.2mg`])
      expect(getStandbyActiveIndex(index)).toBe(0)
    }
    // Adding disks to the IIgs 3.5" drive extends that bay only.
    appendStandbyDisks(4, [standby(4, "C4.2mg", 44)])
    expect(getStandbyDisks(4).map(d => d.filename)).toEqual(["A4.2mg", "B4.2mg", "C4.2mg"])
    expect(getStandbyDisks(5).map(d => d.filename)).toEqual(["A5.2mg", "B5.2mg"])
  })

  test("a slot-5 swap installs that bay's own disk and re-posts its drive data", async () => {
    mount(4, "Disk 1.2mg", 1)
    setStandbyDisks(4, [standby(4, "Disk 1.2mg", 1), standby(4, "Disk 2.2mg", 2)])

    await swapStandbyDisk(4, 1)
    expect(handleGetDriveProps(4).filename).toBe("Disk 2.2mg")
    expect(getStandbyActiveIndex(4)).toBe(1)
    // forceIndex: the disk stays in the bay the user chose, whatever its size.
    expect(mockPassSetDriveNewData).toHaveBeenCalledWith(
      expect.objectContaining({ index: 4, drive: 1, hardDrive: false, filename: "Disk 2.2mg" }),
      true,
    )

    await swapStandbyDisk(4, 0)
    expect(handleGetDriveProps(4).filename).toBe("Disk 1.2mg")
    expect(getStandbyActiveIndex(4)).toBe(0)
  })

  test("emptying a slot-5 group ejects that drive", () => {
    mount(5, "Disk 1.2mg", 1)
    setStandbyDisks(5, [standby(5, "Disk 1.2mg", 1), standby(5, "Disk 2.2mg", 2)])
    ejectAllDisks(5)
    expect(getStandbyDisks(5)).toHaveLength(0)
    expect(handleGetDriveProps(5).filename).toBe("")
    expect(getStandbyActiveIndex(5)).toBe(0)
  })
})

const graphicalSwapperItem = (filename: string) => {
  mockPopupMenus.length = 0
  const html = renderToStaticMarkup(React.createElement(DiskDrive, {
    index: 4,
    renderCount: 0,
    setShowFileOpenDialog: jest.fn(),
  }))
  expect(html).toContain("disk-multidisk-badge")
  const items = mockPopupMenus.flat(2).filter(item => item.label === filename)
  expect(items).toHaveLength(1)
  expect(items[0].onClick).toEqual(expect.any(Function))
  expect(items[0].isSelected?.()).toBe(false)
  return items[0]
}

describe("graphical slot-5 disk swapper", () => {
  const disk1 = "Excalibur Disk 1.2mg"
  const disk2 = "Excalibur Disk 2.2mg"
  const changedData = new Uint8Array(16).fill(0x7e)
  const showSaveFilePicker = jest.fn()
  let originalPicker: PropertyDescriptor | undefined
  let originalAssets: PropertyDescriptor | undefined

  beforeEach(() => {
    jest.useFakeTimers()
    originalPicker = Object.getOwnPropertyDescriptor(window, "showSaveFilePicker")
    originalAssets = Object.getOwnPropertyDescriptor(window, "assetRegistry")
    Object.defineProperty(window, "showSaveFilePicker", {
      configurable: true,
      value: showSaveFilePicker.mockReset().mockRejectedValue(new DOMException("Cancelled", "AbortError")),
    })
    Object.defineProperty(window, "assetRegistry", {
      configurable: true,
      value: { ...window.assetRegistry, floppy35off: "floppy35-off.png" },
    })
    jest.spyOn(uiUtilities, "isFileSystemApiSupported").mockReturnValue(true)
    ejectAllDisks(4)
    mount(4, disk1, 1)
    setStandbyDisks(4, [standby(4, disk1, 1), standby(4, disk2, 2)])
    // The worker's modified bytes have not yet been synced to the standby entry.
    doSetUIDriveProps({
      ...handleGetDriveProps(4),
      diskData: changedData.slice(),
      diskHasChanges: true,
      lastAppleWriteTime: 1234,
    })
    mockPassSetDriveNewData.mockClear()
  })

  afterEach(() => {
    ejectAllDisks(4)
    jest.clearAllTimers()
    jest.useRealTimers()
    jest.restoreAllMocks()
    if (originalPicker) Object.defineProperty(window, "showSaveFilePicker", originalPicker)
    else Reflect.deleteProperty(window, "showSaveFilePicker")
    if (originalAssets) Object.defineProperty(window, "assetRegistry", originalAssets)
    else Reflect.deleteProperty(window, "assetRegistry")
  })

  test.each([true, false])("dirty URL media swaps without Save As and survives a round trip (FileSystem API: %s)", async supported => {
    jest.mocked(uiUtilities.isFileSystemApiSupported).mockReturnValue(supported)
    expect(handleGetDriveProps(4).writableFileHandle).toBeNull()
    expect(handleGetDriveProps(4).cloudData).toBeNull()

    await graphicalSwapperItem(disk2).onClick!()
    expect({
      pickerCalls: showSaveFilePicker.mock.calls.length,
      filename: handleGetDriveProps(4).filename,
      activeIndex: getStandbyActiveIndex(4),
    }).toEqual({ pickerCalls: 0, filename: disk2, activeIndex: 1 })
    expect(handleGetDriveProps(4).diskData).toEqual(new Uint8Array(16).fill(2))
    expect(handleGetDriveProps(4).diskHasChanges).toBe(false)
    expect(mockPassSetDriveNewData).toHaveBeenCalledTimes(1)
    expect(mockPassSetDriveNewData).toHaveBeenLastCalledWith(
      expect.objectContaining({ index: 4, filename: disk2 }), true,
    )
    expect(getStandbyDisks(4)[0]).toEqual(expect.objectContaining({
      filename: disk1,
      diskData: changedData,
      diskHasChanges: true,
      writableFileHandle: null,
      lastAppleWriteTime: 1234,
    }))

    await graphicalSwapperItem(disk1).onClick!()
    expect(showSaveFilePicker).not.toHaveBeenCalled()
    expect(getStandbyActiveIndex(4)).toBe(0)
    expect(handleGetDriveProps(4)).toEqual(expect.objectContaining({
      filename: disk1,
      diskData: changedData,
      diskHasChanges: true,
      writableFileHandle: null,
      lastAppleWriteTime: 1234,
    }))
    expect(mockPassSetDriveNewData).toHaveBeenCalledTimes(2)
    expect(mockPassSetDriveNewData).toHaveBeenLastCalledWith(
      expect.objectContaining({ index: 4, filename: disk1, diskData: changedData, diskHasChanges: true }), true,
    )
  })

  test("dirty media with an existing writable handle finishes saving before swapping", async () => {
    let finishSave!: () => void
    let reportCloseStarted!: () => void
    const saveFinished = new Promise<void>(resolve => { finishSave = resolve })
    const closeStarted = new Promise<void>(resolve => { reportCloseStarted = resolve })
    const write = jest.fn().mockResolvedValue(undefined)
    const close = jest.fn(() => {
      reportCloseStarted()
      return saveFinished
    })
    const handle: CustomWritableHandler = {
      requestPermission: jest.fn().mockResolvedValue({ state: "granted" }),
      createWritable: jest.fn().mockResolvedValue({ write, close }),
    }
    doSetUIDriveProps({ ...handleGetDriveProps(4), writableFileHandle: handle })
    const click = graphicalSwapperItem(disk2).onClick!()
    try {
      await closeStarted
      expect(handle.createWritable).toHaveBeenCalledTimes(1)
      expect(write).toHaveBeenCalledWith(expect.any(Blob))
      expect((write.mock.calls[0][0] as Blob).size).toBe(changedData.length)
      expect(close).toHaveBeenCalledTimes(1)
      expect(handleGetDriveProps(4).filename).toBe(disk1)
      expect(getStandbyActiveIndex(4)).toBe(0)
      expect(mockPassSetDriveNewData).not.toHaveBeenCalled()
    } finally {
      finishSave()
      await click
    }
    expect(showSaveFilePicker).not.toHaveBeenCalled()
    expect(handleGetDriveProps(4).filename).toBe(disk2)
    expect(handleGetDriveProps(4).writableFileHandle).toBeNull()
    expect(getStandbyActiveIndex(4)).toBe(1)
    expect(mockPassSetDriveNewData).toHaveBeenCalledTimes(1)
    expect(getStandbyDisks(4)[0].writableFileHandle).toBe(handle)
  })
})
