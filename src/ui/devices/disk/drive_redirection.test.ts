import { handleSetDiskOrFileFromBuffer } from "./driveprops"

jest.mock("../../main2worker", () => ({
  passSetDriveNewData: jest.fn(),
  requestSetDriveNewData: jest.fn(),
  passSetDriveProps: jest.fn(),
  passSetBinaryBlock: jest.fn(),
  passPasteText: jest.fn(),
  handleGetRunMode: jest.fn(() => 0), // RUN_MODE.IDLE
  passSetRunMode: jest.fn(),
}))

describe("handleSetDiskOrFileFromBuffer drive index redirection", () => {
  const floppyBuffer = new ArrayBuffer(143360) // 140KB standard floppy
  const hdBuffer = new ArrayBuffer(32 * 1024 * 1024) // 32MB hard drive

  describe("Floppy media (140KB .dsk)", () => {
    test("redirects index 0 (S7,D1) to index 2 (S6,D1) even if preserveDriveIndex is true", () => {
      const mounted = handleSetDiskOrFileFromBuffer(
        0,
        floppyBuffer,
        "game.dsk",
        null,
        null,
        undefined,
        true, // preserveDriveIndex
        false,
        true, // noReset
      )
      expect(mounted).toBe(2)
    })

    test("redirects index 1 (S7,D2) to index 2 (S6,D1)", () => {
      const mounted = handleSetDiskOrFileFromBuffer(
        1,
        floppyBuffer,
        "game.dsk",
        null,
        null,
        undefined,
        true,
        false,
        true,
      )
      expect(mounted).toBe(2)
    })

    test("preserves index 2 (S6,D1)", () => {
      const mounted = handleSetDiskOrFileFromBuffer(
        2,
        floppyBuffer,
        "game.dsk",
        null,
        null,
        undefined,
        true,
        false,
        true,
      )
      expect(mounted).toBe(2)
    })

    test("preserves index 3 (S6,D2)", () => {
      const mounted = handleSetDiskOrFileFromBuffer(
        3,
        floppyBuffer,
        "game_disk2.dsk",
        null,
        null,
        undefined,
        true,
        false,
        true,
      )
      expect(mounted).toBe(3)
    })

    test("auto-detects index -1 to index 2 (S6,D1)", () => {
      const mounted = handleSetDiskOrFileFromBuffer(
        -1,
        floppyBuffer,
        "game.dsk",
        null,
        null,
        undefined,
        false,
        false,
        true,
      )
      expect(mounted).toBe(2)
    })
  })

  describe("Hard drive media (32MB .hdv / .po)", () => {
    test("redirects index 2 (S6,D1) to index 0 (S7,D1) even if preserveDriveIndex is true", () => {
      const mounted = handleSetDiskOrFileFromBuffer(
        2,
        hdBuffer,
        "system.hdv",
        null,
        null,
        undefined,
        true,
        false,
        true,
      )
      expect(mounted).toBe(0)
    })

    test("redirects index 3 (S6,D2) to index 0 (S7,D1)", () => {
      const mounted = handleSetDiskOrFileFromBuffer(
        3,
        hdBuffer,
        "system.hdv",
        null,
        null,
        undefined,
        true,
        false,
        true,
      )
      expect(mounted).toBe(0)
    })

    test("preserves index 0 (S7,D1)", () => {
      const mounted = handleSetDiskOrFileFromBuffer(
        0,
        hdBuffer,
        "system.hdv",
        null,
        null,
        undefined,
        true,
        false,
        true,
      )
      expect(mounted).toBe(0)
    })

    test("preserves index 1 (S7,D2)", () => {
      const mounted = handleSetDiskOrFileFromBuffer(
        1,
        hdBuffer,
        "system2.hdv",
        null,
        null,
        undefined,
        true,
        false,
        true,
      )
      expect(mounted).toBe(1)
    })

    test("auto-detects index -1 to index 0 (S7,D1)", () => {
      const mounted = handleSetDiskOrFileFromBuffer(
        -1,
        hdBuffer,
        "system.hdv",
        null,
        null,
        undefined,
        false,
        false,
        true,
      )
      expect(mounted).toBe(0)
    })
  })
})
