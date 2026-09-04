import { executeCommand } from "./remotecontrol"
import { RUN_MODE } from "../../common/utility"
import { passSetRunMode } from "../main2worker"
import {
  handleGetDriveProps,
  requestEjectDisk,
  requestSetDiskFromURL,
  requestMountDiskFromBuffer,
} from "../devices/disk/driveprops"

jest.mock("../main2worker", () => ({
  handleGetBreakpoints: () => new Map(),
  handleCanGoBackward: () => false,
  handleCanGoForward: () => false,
  handleGetC800Slot: () => 0,
  handleGetExecution: () => ({
    executionSequence: 0,
    state: "paused",
    pauseReason: "idle",
    breakpoint: null,
    PC: 0,
    A: 0,
    X: 0,
    Y: 0,
    S: 0,
    PStatus: 0,
    machineName: "APPLE2EE",
    memoryConfiguration: {slot3Card: "aux", ramWorksKb: 64},
  }),
  handleGetIsDebugging: () => false,
  handleGetMachineName: () => "APPLE2EE",
  handleGetMemSize: () => 64,
  handleGetMemoryDump: () => new Uint8Array(),
  handleGetRunMode: () => 0,
  handleGetSaveState: jest.fn(),
  handleGetShowDebugTab: () => false,
  handleGetSoftSwitches: () => ({}),
  handleGetSpeedMode: () => 0,
  handleGetStackString: () => "",
  handleGetState6502: () => ({}),
  handleGetTextPageAsString: () => "",
  handleGetTempStateIndex: () => 0,
  handleGetTimeTravelThumbnails: () => [],
  passGoBackInTime: jest.fn(),
  passGoForwardInTime: jest.fn(),
  passAppleCommandKeyPress: jest.fn(),
  passAppleCommandKeyRelease: jest.fn(),
  passKeyRelease: jest.fn(),
  passKeypress: jest.fn(),
  passMouseEvent: jest.fn(),
  passPasteText: jest.fn(),
  passSetDebug: jest.fn(),
  passSetBinaryBlock: jest.fn(),
  requestSetState6502: jest.fn(),
  passSetMemory: jest.fn(),
  passSetSoftSwitches: jest.fn(),
  passStepInto: jest.fn(),
  passStepOut: jest.fn(),
  passStepOver: jest.fn(),
  passTimeTravelIndex: jest.fn(),
  passTimeTravelSnapshot: jest.fn(),
  passSetShowDebugTab: jest.fn(),
  passSetRunMode: jest.fn(),
  requestSetRunMode: jest.fn(),
  requestLoadBinary: jest.fn(),
  setExecutionStateCallback: jest.fn(),
}))

jest.mock("../localstorage", () => ({
  setPreferenceBreakpoints: jest.fn(),
  setPreferenceColorMode: jest.fn(),
  setPreferenceMachineName: jest.fn(),
  setPreferenceRamWorks: jest.fn(),
  requestPreferenceSpeedMode: jest.fn(),
}))

jest.mock("../savestate", () => ({ RestoreSaveState: jest.fn() }))
jest.mock("../ui_settings", () => ({ getUIState: () => ({}) }))
jest.mock("../devices/audio/mockingboard_audio", () => ({ getMockingboardMode: () => 0 }))
jest.mock("../devices/audio/speaker", () => ({ isAudioEnabled: () => false }))

jest.mock("../devices/disk/driveprops", () => ({
  handleGetFilename: () => null,
  handleGetDriveProps: jest.fn((index: number) => ({
    index,
    drive: index % 2 + 1,
    hardDrive: index < 2,
    filename: index === 0 ? "unrelated.hdv" : "",
    status: "",
    motorRunning: false,
    diskHasChanges: false,
    isWriteProtected: false,
    diskData: new Uint8Array(),
  })),
  handleSetDiskWriteProtected: jest.fn(),
  requestEjectDisk: jest.fn(),
  requestSetDiskFromURL: jest.fn(),
  requestMountDiskFromBuffer: jest.fn(),
}))

const mockHandleGetDriveProps = jest.mocked(handleGetDriveProps)
const mockPassSetRunMode = jest.mocked(passSetRunMode)
const mockRequestEjectDisk = jest.mocked(requestEjectDisk)
const mockRequestSetDiskFromURL = jest.mocked(requestSetDiskFromURL)
const mockRequestMountDiskFromBuffer = jest.mocked(requestMountDiskFromBuffer)

test("remote-control status includes the worker execution snapshot", async () => {
  await expect(executeCommand("getStatus", {})).resolves.toEqual(expect.objectContaining({
    machine: expect.objectContaining({
      execution: expect.objectContaining({executionSequence: 0, pauseReason: "idle"}),
    }),
  }))
})

describe("remote-control media confirmation", () => {
  beforeEach(() => jest.clearAllMocks())

  test("collects mount status only after the worker applies the disk", async () => {
    let confirmMount!: (drive: number) => void
    mockRequestMountDiskFromBuffer.mockReturnValue(new Promise((resolve) => {
      confirmMount = resolve
    }))

    const command = executeCommand("mountDisk", {
      driveIndex: 2,
      filename: "remote.woz",
      dataBase64: "AQID",
    })
    await Promise.resolve()
    expect(mockHandleGetDriveProps).not.toHaveBeenCalled()
    expect(mockPassSetRunMode).not.toHaveBeenCalled()

    confirmMount(2)
    await expect(command).resolves.toEqual(expect.objectContaining({
      mountedDrive: 2,
      mountedDriveState: expect.objectContaining({index: 2}),
      status: expect.objectContaining({
        drives: expect.arrayContaining([
          expect.objectContaining({index: 0, filename: "unrelated.hdv"}),
        ]),
      }),
    }))
    expect(mockRequestMountDiskFromBuffer).toHaveBeenCalledWith(
      2,
      expect.any(ArrayBuffer),
      "remote.woz",
      null,
      null,
      undefined,
      true,
    )
    expect(mockHandleGetDriveProps).toHaveBeenCalledTimes(4)
    expect(mockPassSetRunMode).not.toHaveBeenCalled()
  })

  test("treats a false URL loader result as a mount failure", async () => {
    mockRequestSetDiskFromURL.mockResolvedValue(false)

    await expect(executeCommand("mountDiskFromUrl", {
      driveIndex: 2,
      url: "https://example.test/bad.woz",
    })).rejects.toThrow("Unable to mount disk from URL")
    expect(mockHandleGetDriveProps).not.toHaveBeenCalled()
    expect(mockPassSetRunMode).not.toHaveBeenCalled()
  })

  test("preserves the requested URL drive and reports its post-ack state", async () => {
    let confirmMount!: (drive: number | false) => void
    mockRequestSetDiskFromURL.mockReturnValue(new Promise((resolve) => {
      confirmMount = resolve
    }))

    const command = executeCommand("mountDiskFromUrl", {
      driveIndex: 3,
      url: "https://example.test/disk.hdv",
    })
    await Promise.resolve()
    expect(mockHandleGetDriveProps).not.toHaveBeenCalled()
    expect(mockPassSetRunMode).not.toHaveBeenCalled()

    confirmMount(3)
    await expect(command).resolves.toEqual(expect.objectContaining({
      mountedDrive: 3,
      mountedDriveState: expect.objectContaining({index: 3}),
    }))
    expect(mockRequestSetDiskFromURL).toHaveBeenCalledWith(
      "https://example.test/disk.hdv",
      undefined,
      3,
    )
    expect(mockPassSetRunMode).toHaveBeenCalledWith(RUN_MODE.NEED_BOOT)
    expect(mockPassSetRunMode).toHaveBeenCalledTimes(1)
    expect(mockHandleGetDriveProps).toHaveBeenCalledTimes(4)
  })

  test("does not report an invalid worker-rejected disk as mounted", async () => {
    mockRequestMountDiskFromBuffer.mockImplementation(async (_index, buffer) => {
      expect(Array.from(new Uint8Array(buffer))).toEqual([1, 2, 3])
      throw new Error("Worker rejected disk image")
    })

    await expect(executeCommand("mountDisk", {
      driveIndex: 3,
      filename: "invalid.woz",
      dataBase64: "AQID",
    })).rejects.toThrow("Worker rejected disk image")
    expect(mockHandleGetDriveProps).not.toHaveBeenCalled()
    expect(mockPassSetRunMode).not.toHaveBeenCalled()
  })

  test("does not route remote disk mounts through generic binary handling", async () => {
    mockRequestMountDiskFromBuffer.mockRejectedValue(
      new Error("Remote disk mount requires disk media"),
    )

    await expect(executeCommand("mountDisk", {
      driveIndex: 1,
      filename: "program.bin",
      dataBase64: "AQID",
    })).rejects.toThrow("Remote disk mount requires disk media")
    expect(mockRequestMountDiskFromBuffer).toHaveBeenCalledWith(
      1,
      expect.any(ArrayBuffer),
      "program.bin",
      null,
      null,
      undefined,
      true,
    )
    expect(mockHandleGetDriveProps).not.toHaveBeenCalled()
  })

  test("collects eject status only after the worker applies the empty drive", async () => {
    let confirmEject!: () => void
    mockRequestEjectDisk.mockReturnValue(new Promise((resolve) => {
      confirmEject = resolve
    }))

    const command = executeCommand("ejectDisk", {driveIndex: 2})
    await Promise.resolve()
    expect(mockHandleGetDriveProps).not.toHaveBeenCalled()

    confirmEject()
    await expect(command).resolves.toEqual(expect.objectContaining({status: expect.any(Object)}))
    expect(mockHandleGetDriveProps).toHaveBeenCalledTimes(4)
  })
})
