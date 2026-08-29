import { executeCommand } from "./remotecontrol"
import {
  handleGetDriveProps,
  requestEjectDisk,
  requestSetDiskFromURL,
  requestSetDiskOrFileFromBuffer,
} from "../devices/disk/driveprops"

jest.mock("../main2worker", () => ({
  handleGetBreakpoints: () => new Map(),
  handleCanGoBackward: () => false,
  handleCanGoForward: () => false,
  handleGetC800Slot: () => 0,
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
  requestSetRunMode: jest.fn(),
  requestLoadBinary: jest.fn(),
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
    filename: "",
    status: "",
    motorRunning: false,
    diskHasChanges: false,
    isWriteProtected: false,
    diskData: new Uint8Array(),
  })),
  handleSetDiskWriteProtected: jest.fn(),
  requestEjectDisk: jest.fn(),
  requestSetDiskFromURL: jest.fn(),
  requestSetDiskOrFileFromBuffer: jest.fn(),
}))

const mockHandleGetDriveProps = jest.mocked(handleGetDriveProps)
const mockRequestEjectDisk = jest.mocked(requestEjectDisk)
const mockRequestSetDiskFromURL = jest.mocked(requestSetDiskFromURL)
const mockRequestSetDiskOrFileFromBuffer = jest.mocked(requestSetDiskOrFileFromBuffer)

describe("remote-control media confirmation", () => {
  beforeEach(() => jest.clearAllMocks())

  test("collects mount status only after the worker applies the disk", async () => {
    let confirmMount!: (drive: number) => void
    mockRequestSetDiskOrFileFromBuffer.mockReturnValue(new Promise((resolve) => {
      confirmMount = resolve
    }))

    const command = executeCommand("mountDisk", {
      driveIndex: 2,
      filename: "remote.woz",
      dataBase64: "AQID",
    })
    await Promise.resolve()
    expect(mockHandleGetDriveProps).not.toHaveBeenCalled()

    confirmMount(2)
    await expect(command).resolves.toEqual(expect.objectContaining({mountedDrive: 2}))
    expect(mockHandleGetDriveProps).toHaveBeenCalledTimes(4)
  })

  test("treats a false URL loader result as a mount failure", async () => {
    mockRequestSetDiskFromURL.mockResolvedValue(false)

    await expect(executeCommand("mountDiskFromUrl", {
      driveIndex: 2,
      url: "https://example.test/bad.woz",
    })).rejects.toThrow("Unable to mount disk from URL")
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
