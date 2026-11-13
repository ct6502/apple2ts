jest.mock("../common/app_target", () => {
  const actual = jest.requireActual("../common/app_target") as Record<string, unknown>
  return {
    ...actual,
    APP_DEFAULT_MACHINE: "APPLE2EE",
    APP_MACHINE_NAMES: ["APPLE2P", "APPLE2EU", "APPLE2EE"],
  }
})

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
import { getPreferenceMachineName } from "./localstorage"

describe("classic deployment machine preference", () => {
  beforeEach(() => {
    localStorage.clear()
  })

  test("rejects a saved IIgs and falls back to the enhanced IIe", () => {
    localStorage.setItem("machineName", JSON.stringify("APPLE2GS"))

    expect(getPreferenceMachineName()).toBe(APP_DEFAULT_MACHINE)
    expect(localStorage.getItem("machineName")).toBeNull()
  })

  test("keeps a saved classic machine the site offers", () => {
    localStorage.setItem("machineName", JSON.stringify("APPLE2EU"))

    expect(getPreferenceMachineName()).toBe("APPLE2EU")
    expect(localStorage.getItem("machineName")).toBe(JSON.stringify("APPLE2EU"))
  })
})
