import { handleSetDiskOrFileFromBuffer } from "./driveprops"
import { handleGetMachineName } from "../../main2worker"

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

  // The IIgs adds a third family: slot 5 is the built-in 3.5" drive, and an
  // 800 KB block image also fits a SmartPort bay, so the bay the user picked is
  // only changed when it cannot hold the media at all.
  describe("IIgs slot-5 3.5\" media", () => {
    const threeInchBuffer = new ArrayBuffer(64 + 800 * 1024)
    const wozBuffer = new ArrayBuffer(368584)
    const capture35Buffer = new ArrayBuffer(1_296_147)

    beforeEach(() => {
      ;(handleGetMachineName as jest.Mock).mockReturnValue("APPLE2GS")
    })
    afterEach(() => {
      ;(handleGetMachineName as jest.Mock).mockReturnValue("APPLE2E")
    })

    test.each([
      ["S7,D1 serves it as a block volume", 0, 0],
      ["S5,D1 keeps it as 3.5\" media", 4, 4],
      ["S5,D2 keeps it as 3.5\" media", 5, 5],
    ])("%s", (_label: string, requested: number, expected: number) => {
      const mounted = handleSetDiskOrFileFromBuffer(
        requested, threeInchBuffer, "SystemDisk.2mg", null, null,
        undefined, true, false, true,
      )
      expect(mounted).toBe(expected)
    })

    test("redirects index 2 (S6,D1), which is 5.25\" media only", () => {
      const mounted = handleSetDiskOrFileFromBuffer(
        2, threeInchBuffer, "SystemDisk.2mg", null, null,
        undefined, true, false, true,
      )
      expect(mounted).toBe(4)
    })

    test("auto-detects index -1 to index 4 (S5,D1)", () => {
      const mounted = handleSetDiskOrFileFromBuffer(
        -1, threeInchBuffer, "SystemDisk.2mg", null, null,
        undefined, false, false, true,
      )
      expect(mounted).toBe(4)
    })

    test("keeps nibble media out of the 3.5\" bay", () => {
      const mounted = handleSetDiskOrFileFromBuffer(
        4, wozBuffer, "game.woz", null, null,
        undefined, true, false, true,
      )
      expect(mounted).toBe(2)
    })

    // A capture of 3.5" media is still a capture, but it is the slot-5 drive
    // that is wired for it: it stays in the bay the user picked, and the 5.25"
    // drive has to hand it over.
    test("keeps a 3.5\" capture in the 3.5\" bay", () => {
      const mounted = handleSetDiskOrFileFromBuffer(
        4, capture35Buffer, "Cavern_Cobra_IIgs.woz", null, null,
        undefined, true, false, true,
      )
      expect(mounted).toBe(4)
    })

    test("redirects a 3.5\" capture out of the 5.25\" drive", () => {
      const mounted = handleSetDiskOrFileFromBuffer(
        2, capture35Buffer, "Cavern_Cobra_IIgs.woz", null, null,
        undefined, true, false, true,
      )
      expect(mounted).toBe(4)
    })
  })
})
