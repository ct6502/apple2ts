import {
  appendStandbyDisks,
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
  handleGetSlotConfig: jest.fn(() => 0),
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
