jest.mock("./devices/disk/driveprops", () => ({
  doSetUIDriveProps: jest.fn(),
  setDefaultBinaryAddress: jest.fn(),
  handleSetDiskFromURL: jest.fn().mockResolvedValue(true),
  handleSetDiskSwapperFromURLs: jest.fn().mockResolvedValue(true),
  resetAllDiskDrives: jest.fn(),
}))
jest.mock("./devices/disk/cloudscriptloader", () => ({
  loadOneDriveScript: jest.fn(),
}))
jest.mock("./devices/disk/onedrive_authredirect", () => ({
  isOneDriveMsalAuthCallback: jest.fn(),
}))
jest.mock("./devices/audio/speaker", () => ({
  audioEnable: jest.fn(),
  emulatorSoundEnable: jest.fn(),
  clickSpeaker: jest.fn(),
}))
jest.mock("./devices/audio/mockingboard_audio", () => ({}))
jest.mock("./panels/disassembly/disassembly_utilities", () => ({
  set6502Instructions: jest.fn(),
  setDisassemblyVisibleMode: jest.fn(),
}))
jest.mock("./devices/vera/verasdicon", () => ({
  handleSetVeraSdFromURL: jest.fn().mockResolvedValue(true),
}))

import { handleFragment, handleInputParams } from "./inputparams"
import { getPreferenceSlotConfig, getPreferenceVeraSlot } from "./localstorage"
import { getTabView, getUIStateBoolean } from "./ui_settings"
import { handleSetDiskFromURL, handleSetDiskSwapperFromURLs, resetAllDiskDrives } from "./devices/disk/driveprops"
import { handleSetVeraSdFromURL } from "./devices/vera/verasdicon"
import * as main2worker from "./main2worker"
import { RUN_MODE } from "../common/utility"

describe("handleInputParams slot configuration", () => {
  beforeEach(() => {
    localStorage.clear()
  })

  test("configures slot 2 with VERA card", () => {
    handleInputParams("slot2=vera")
    const config = getPreferenceSlotConfig()
    expect(config[2]).toBe("vera")
    expect(getPreferenceVeraSlot()).toBe(2)
  })

  test("configures slot 4 with VERA card and clears slot 2 if it had VERA", () => {
    handleInputParams("slot2=vera")
    expect(getPreferenceSlotConfig()[2]).toBe("vera")
    expect(getPreferenceVeraSlot()).toBe(2)

    handleInputParams("slot4=vera")
    const config = getPreferenceSlotConfig()
    expect(config[4]).toBe("vera")
    expect(config[2]).toBe("none")
    expect(getPreferenceVeraSlot()).toBe(4)
  })

  test("supports veraslot=2 parameter", () => {
    handleInputParams("veraslot=2")
    const config = getPreferenceSlotConfig()
    expect(config[2]).toBe("vera")
    expect(getPreferenceVeraSlot()).toBe(2)
  })

  test("supports other slot cards like slot1=ssc and slot3=vidhd", () => {
    handleInputParams("slot1=ssc&slot3=vidhd")
    const config = getPreferenceSlotConfig()
    expect(config[1]).toBe("ssc")
    expect(config[3]).toBe("vidhd")
  })

  test("supports combined slot2=vera&tab=vera", () => {
    handleInputParams("slot2=vera&tab=vera")
    expect(getPreferenceSlotConfig()[2]).toBe("vera")
    expect(getPreferenceVeraSlot()).toBe(2)
    expect(getTabView()).toBe(4)
    expect(getUIStateBoolean("infoPanel")).toBe(true)
  })
})

describe("handleFragment multi-disk loading", () => {
  let passSetRunModeSpy: jest.SpyInstance

  beforeEach(() => {
    jest.clearAllMocks()
    passSetRunModeSpy = jest.spyOn(main2worker, "passSetRunMode").mockImplementation(() => {})
  })

  afterEach(() => {
    passSetRunModeSpy.mockRestore()
  })

  test("loads multiple disks into s7d1 and s6d1 and triggers boot", async () => {
    await handleFragment(
      undefined,
      false,
      "?s7d1=TotalReplay&s6d1=https://example.com/game.dsk",
      "",
    )

    expect(resetAllDiskDrives).toHaveBeenCalledTimes(1)
    expect(handleSetDiskFromURL).toHaveBeenCalledWith(
      "TotalReplay",
      undefined,
      0, // s7d1 -> index 0
      undefined,
      undefined,
      undefined,
      true,
      false,
      true,
      true,
    )
    expect(handleSetDiskFromURL).toHaveBeenCalledWith(
      "https://example.com/game.dsk",
      undefined,
      2, // s6d1 -> index 2
      undefined,
      undefined,
      undefined,
      true,
      false,
      true,
      true,
    )
    expect(passSetRunModeSpy).toHaveBeenCalledWith(RUN_MODE.NEED_BOOT)
  })

  test("supports aliases hd1, hd2, d1, d2", async () => {
    await handleFragment(
      undefined,
      false,
      "?hd1=hd.hdv&d1=floppy1.dsk&d2=floppy2.dsk",
      "",
    )

    expect(resetAllDiskDrives).toHaveBeenCalledTimes(1)
    expect(handleSetDiskFromURL).toHaveBeenCalledWith(
      "hd.hdv",
      undefined,
      0,
      undefined,
      undefined,
      undefined,
      true,
      false,
      true,
      true,
    )
    expect(handleSetDiskFromURL).toHaveBeenCalledWith(
      "floppy1.dsk",
      undefined,
      2,
      undefined,
      undefined,
      undefined,
      true,
      false,
      true,
      true,
    )
    expect(handleSetDiskFromURL).toHaveBeenCalledWith(
      "floppy2.dsk",
      undefined,
      3,
      undefined,
      undefined,
      undefined,
      true,
      false,
      true,
      true,
    )
    expect(passSetRunModeSpy).toHaveBeenCalledWith(RUN_MODE.NEED_BOOT)
  })

  test("falls back to hash fragment when no multi-drive parameters exist", async () => {
    await handleFragment(
      undefined,
      false,
      "",
      "#https://example.com/single.woz",
    )

    expect(handleSetDiskFromURL).toHaveBeenCalledWith(
      "https://example.com/single.woz",
      undefined,
    )
  })

  test("loads VERA SD image via s2d1 and auto-configures slot 2", async () => {
    handleInputParams("s2d1=https://example.com/sd.img")
    expect(getPreferenceSlotConfig()[2]).toBe("vera")
    expect(getPreferenceVeraSlot()).toBe(2)

    await handleFragment(
      undefined,
      false,
      "?s2d1=https://example.com/sd.img",
      "",
    )

    expect(handleSetVeraSdFromURL).toHaveBeenCalledWith("https://example.com/sd.img")
    expect(passSetRunModeSpy).toHaveBeenCalledWith(RUN_MODE.NEED_BOOT)
  })

  test("loads both floppy and VERA SD image via s6d1 and s4d1", async () => {
    handleInputParams("s6d1=disk1.dsk&s4d1=https://example.com/game.img")
    expect(getPreferenceSlotConfig()[4]).toBe("vera")
    expect(getPreferenceVeraSlot()).toBe(4)

    await handleFragment(
      undefined,
      false,
      "?s6d1=disk1.dsk&s4d1=https://example.com/game.img",
      "",
    )

    expect(resetAllDiskDrives).toHaveBeenCalledTimes(1)
    expect(handleSetDiskFromURL).toHaveBeenCalledWith(
      "disk1.dsk",
      undefined,
      2,
      undefined,
      undefined,
      undefined,
      true,
      false,
      true,
      true,
    )
    expect(handleSetVeraSdFromURL).toHaveBeenCalledWith("https://example.com/game.img")
    expect(passSetRunModeSpy).toHaveBeenCalledWith(RUN_MODE.NEED_BOOT)
  })

  test("loads multi-drive parameter together with startup disk hash fragment", async () => {
    await handleFragment(
      undefined,
      false,
      "?s6d2=SaveDisk.dsk",
      "#Wizardry",
    )

    expect(resetAllDiskDrives).toHaveBeenCalledTimes(1)
    expect(handleSetDiskFromURL).toHaveBeenCalledWith(
      "SaveDisk.dsk",
      undefined,
      3,
      undefined,
      undefined,
      undefined,
      true,
      false,
      true,
      true,
    )
    expect(handleSetDiskFromURL).toHaveBeenCalledWith(
      "Wizardry",
      undefined,
      -1,
      undefined,
      undefined,
      undefined,
      true,
      false,
      true,
      true,
    )
    expect(passSetRunModeSpy).toHaveBeenCalledWith(RUN_MODE.NEED_BOOT)
  })

  test("loads multi-disk swapper parameter on slot 6 drive 1", async () => {
    await handleFragment(
      undefined,
      false,
      "?s6d1=%7Bdisk1.dsk%2Cdisk2.dsk%7D",
      "",
    )

    expect(resetAllDiskDrives).toHaveBeenCalledTimes(1)
    expect(handleSetDiskSwapperFromURLs).toHaveBeenCalledWith(
      ["disk1.dsk", "disk2.dsk"],
      undefined,
      2,
      true,
      true,
      true,
    )
    expect(passSetRunModeSpy).toHaveBeenCalledWith(RUN_MODE.NEED_BOOT)
  })

  test("does not overwrite explicit s6d1 boot drive with startup disk hash fragment", async () => {
    await handleFragment(
      undefined,
      false,
      "?s6d1=disk1.dsk&s6d2=disk2.dsk",
      "#Wizardry",
    )

    expect(resetAllDiskDrives).toHaveBeenCalledTimes(1)
    expect(handleSetDiskFromURL).toHaveBeenCalledWith(
      "disk1.dsk",
      undefined,
      2,
      undefined,
      undefined,
      undefined,
      true,
      false,
      true,
      true,
    )
    expect(handleSetDiskFromURL).toHaveBeenCalledWith(
      "disk2.dsk",
      undefined,
      3,
      undefined,
      undefined,
      undefined,
      true,
      false,
      true,
      true,
    )
    expect(handleSetDiskFromURL).not.toHaveBeenCalledWith(
      "Wizardry",
      expect.anything(),
      expect.anything(),
      expect.anything(),
      expect.anything(),
      expect.anything(),
      expect.anything(),
      expect.anything(),
      expect.anything(),
      expect.anything(),
    )
    expect(passSetRunModeSpy).toHaveBeenCalledWith(RUN_MODE.NEED_BOOT)
  })
})
