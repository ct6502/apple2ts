import { handleSetDiskOrFileFromBuffer, prepWritableFile } from "./driveprops"
import { passSetRunMode } from "../../main2worker"
import { RUN_MODE } from "../../../common/utility"

jest.mock("../../main2worker", () => ({
  passSetDriveNewData: jest.fn(),
  requestSetDriveNewData: jest.fn(),
  passSetDriveProps: jest.fn(),
  passSetBinaryBlock: jest.fn(),
  passPasteText: jest.fn(),
  handleGetRunMode: jest.fn(() => 0), // RUN_MODE.IDLE
  handleGetMachineName: jest.fn(() => "APPLE2E"),
  passSetRunMode: jest.fn(),
}))

// A FileSystemFileHandle whose file timestamp the test controls
const makeHandle = (lastModified: number) => {
  const state = { lastModified }
  const handle = {
    getFile: async () => ({
      name: "game.dsk",
      lastModified: state.lastModified,
      arrayBuffer: async () => new ArrayBuffer(143360),
    }),
  }
  return { state, handle: handle as unknown as FileSystemFileHandle }
}

const rebooted = () => (passSetRunMode as jest.Mock).mock.calls.some(c => c[0] === RUN_MODE.NEED_BOOT)

describe("prepWritableFile hot reload", () => {
  let stop: (() => void) | undefined

  beforeEach(() => {
    jest.useFakeTimers()
    ;(passSetRunMode as jest.Mock).mockClear()
  })

  afterEach(() => {
    stop?.()
    jest.useRealTimers()
  })

  test("a file dated in the future is not reloaded (and the machine not rebooted) every 3 seconds", async () => {
    // e.g. a disk image written today in a time zone ahead of ours
    const { handle } = makeHandle(Date.now() + 5 * 60 * 60 * 1000)
    const drive = handleSetDiskOrFileFromBuffer(2, new ArrayBuffer(143360), "game.dsk", null, handle,
      undefined, true, false, true, true)
    ;(passSetRunMode as jest.Mock).mockClear()
    stop = await prepWritableFile(drive, handle)
    await jest.advanceTimersByTimeAsync(10 * 1000)
    expect(rebooted()).toBe(false)
  })

  test("a file changed outside the emulator is still hot reloaded", async () => {
    const { state, handle } = makeHandle(Date.now() + 5 * 60 * 60 * 1000)
    const drive = handleSetDiskOrFileFromBuffer(2, new ArrayBuffer(143360), "game.dsk", null, handle,
      undefined, true, false, true, true)
    ;(passSetRunMode as jest.Mock).mockClear()
    stop = await prepWritableFile(drive, handle)
    await jest.advanceTimersByTimeAsync(4 * 1000)
    expect(rebooted()).toBe(false)
    state.lastModified += 1000 // someone saved the file from outside
    await jest.advanceTimersByTimeAsync(4 * 1000)
    expect(rebooted()).toBe(true)
  })
})
