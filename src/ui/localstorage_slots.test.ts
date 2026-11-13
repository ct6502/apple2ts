jest.mock("./main2worker", () => ({
  passSetVeraFmEnabled: jest.fn(),
  passSetIigsRomVersion: jest.fn(),
  passAutoSnapshot: jest.fn(),
  passBreakpoints: jest.fn(),
  passEnableGamePatches: jest.fn(),
  passReverseYAxis: jest.fn(),
  passSetMachineName: jest.fn(),
  passSetRamWorks: jest.fn(),
  passSetShowDebugTab: jest.fn(),
  passSetSlotConfig: jest.fn(),
  passSetTraceSettings: jest.fn(),
  passSetVeraSlot: jest.fn(),
  passSiriusJoyport: jest.fn(),
  passSpeedMode: jest.fn(),
  requestSpeedMode: jest.fn(),
}))

jest.mock("./devices/audio/mockingboard_audio", () => ({
  changeMockingboardMode: jest.fn(),
}))

jest.mock("./save_restore_ui", () => ({
  handleSaveStateToLocalStorage: jest.fn(),
  RestoreSaveState: jest.fn(),
}))

import { APP_DEFAULT_MACHINE } from "../common/app_target"
import { DEFAULT_SLOT_CONFIG } from "../common/utility"
import {
  getPreferenceIigsRomVersion,
  getPreferenceMachineName,
  getPreferenceSlotConfig,
  PREFERENCE_SLOT_CONFIG_CLASSIC_KEY,
  PREFERENCE_SLOT_CONFIG_GS_KEY,
  resetPreferences,
  setPreferenceIigsRomVersion,
  setPreferenceMachineName,
  setPreferenceSlotConfig,
} from "./localstorage"
import * as main2worker from "./main2worker"

describe("slot preference reset", () => {
  beforeEach(() => {
    localStorage.clear()
    jest.clearAllMocks()
  })

  test("clears custom classic slots and restores the default worker layout", () => {
    const custom: SlotConfig = {
      1: "ssc",
      2: "vera",
      3: "aux",
      4: "mockingboard",
      5: "mouse",
      6: "disk2",
      7: "smartport",
    }
    setPreferenceMachineName("APPLE2EE")
    setPreferenceSlotConfig(custom, "external", "APPLE2EE")
    expect(JSON.parse(localStorage.getItem(PREFERENCE_SLOT_CONFIG_CLASSIC_KEY)!)).toEqual(custom)

    resetPreferences()

    expect(localStorage.getItem(PREFERENCE_SLOT_CONFIG_CLASSIC_KEY)).toBeNull()
    expect(localStorage.getItem(PREFERENCE_SLOT_CONFIG_GS_KEY)).toBeNull()
    expect(localStorage.getItem("slotConfig")).toBeNull()
    expect(getPreferenceSlotConfig()).toEqual(DEFAULT_SLOT_CONFIG)
    expect(getPreferenceMachineName()).toBe(APP_DEFAULT_MACHINE)
    expect(jest.mocked(main2worker.passSetSlotConfig).mock.lastCall).toEqual([DEFAULT_SLOT_CONFIG])
  })

  test("clears custom GS slots during reset too", () => {
    setPreferenceMachineName("APPLE2GS")
    setPreferenceSlotConfig({
      1: "ssc",
      2: "gsModem",
      3: "gsText80",
      4: "mockingboard",
      5: "gsSmartPort",
      6: "gsDiskPort",
      7: "smartport",
    }, "external", "APPLE2GS")
    setPreferenceIigsRomVersion("03")

    resetPreferences()

    expect(localStorage.getItem(PREFERENCE_SLOT_CONFIG_CLASSIC_KEY)).toBeNull()
    expect(localStorage.getItem(PREFERENCE_SLOT_CONFIG_GS_KEY)).toBeNull()
    expect(getPreferenceSlotConfig()).toEqual(DEFAULT_SLOT_CONFIG)
    expect(localStorage.getItem("iigsRom")).toBeNull()
    expect(getPreferenceIigsRomVersion()).toBe("01")
    expect(jest.mocked(main2worker.passSetIigsRomVersion).mock.lastCall).toEqual(["01"])
  })
})
