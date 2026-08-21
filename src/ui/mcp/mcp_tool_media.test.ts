const passRunBinary = jest.fn()
const passLoadBinary = jest.fn()

jest.mock("../main2worker", () => ({
  passAppleCommandKeyPress: jest.fn(),
  passAppleCommandKeyRelease: jest.fn(),
  passKeypress: jest.fn(),
  passKeyRelease: jest.fn(),
  passPasteText: jest.fn(),
  passLoadBinary,
  passRunBinary,
}))
jest.mock("../devices/disk/driveprops", () => ({
  handleEjectDisk: jest.fn(),
  handleSetDiskFromURL: jest.fn(),
  handleSetDiskOrFileFromBuffer: jest.fn(),
}))
jest.mock("../devices/gamepad", () => ({
  handleArrowKey: jest.fn(),
}))

import { toolLoadBinary } from "./mcp_tool_media"

describe("toolLoadBinary", () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it("loads bytes without resetting when run is false", () => {
    expect(toolLoadBinary([0xEA, 0x60], 0x6000, false)).toMatchObject({
      success: true,
      data: {address: 0x6000, entryAddress: null, size: 2, run: false},
    })

    expect(passLoadBinary).toHaveBeenCalledWith(
      0x6000,
      new Uint8Array([0xEA, 0x60]),
    )
    expect(passRunBinary).not.toHaveBeenCalled()
  })

  it("uses the clean run operation and a distinct entry address", () => {
    expect(toolLoadBinary([0xEA, 0x60], 0x6000, true, 0x6001)).toMatchObject({
      success: true,
      data: {address: 0x6000, entryAddress: 0x6001, size: 2, run: true},
    })

    expect(passRunBinary).toHaveBeenCalledWith(
      0x6000,
      new Uint8Array([0xEA, 0x60]),
      0x6001,
    )
    expect(passLoadBinary).not.toHaveBeenCalled()
  })

  it("accepts a one-byte load at the end of writable RAM", () => {
    expect(toolLoadBinary([0x60], 0xBFFF)).toMatchObject({
      success: true,
      data: {address: 0xBFFF, size: 1, run: false},
    })
    expect(passLoadBinary).toHaveBeenCalledWith(
      0xBFFF,
      new Uint8Array([0x60]),
    )
  })

  it("rejects malformed bytes and blocks outside contiguous writable RAM", () => {
    expect(toolLoadBinary([256], 0x6000)).toEqual({
      success: false,
      error: "Binary data values must be integers from 0 to 255",
    })
    expect(toolLoadBinary([0xEA, 0x60], 0xBFFF, true)).toEqual({
      success: false,
      error: "Binary data extends beyond writable RAM at $BFFF",
    })
    expect(toolLoadBinary([0x60], 0xC000, true)).toEqual({
      success: false,
      error: "Binary data extends beyond writable RAM at $BFFF",
    })
    expect(toolLoadBinary([0x60], 0xC000, false)).toEqual({
      success: false,
      error: "Binary data extends beyond writable RAM at $BFFF",
    })
    expect(toolLoadBinary([0xEA, 0x60], 0xFFFF, false)).toEqual({
      success: false,
      error: "Binary data extends beyond address 65535",
    })

    expect(passRunBinary).not.toHaveBeenCalled()
    expect(passLoadBinary).not.toHaveBeenCalled()
  })
})
