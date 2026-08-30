jest.mock("./devices/disk/driveprops", () => ({
  doSetUIDriveProps: jest.fn(),
  setDefaultBinaryAddress: jest.fn(),
  handleSetDiskFromURL: jest.fn(),
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

import { handleInputParams } from "./inputparams"
import { getPreferenceSlotConfig, getPreferenceVeraSlot } from "./localstorage"
import { getTabView, getUIStateBoolean } from "./ui_settings"

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
