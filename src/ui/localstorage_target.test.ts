jest.mock("../common/app_target", () => {
  const actual = jest.requireActual("../common/app_target") as Record<string, unknown>
  return {
    ...actual,
    APP_DEFAULT_MACHINE: "APPLE2EE",
    APP_MACHINE_NAMES: ["APPLE2P", "APPLE2EU", "APPLE2EE"],
  }
})

jest.mock("./main2worker", () => ({
  handleGetMachineName: jest.fn(() => "APPLE2EE"),
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
import { getPreferenceMachineName, loadPreferences, setPreferenceSpeedMode, SPEED_MODE_MACHINE_KEY } from "./localstorage"
import * as main2worker from "./main2worker"

describe("classic deployment machine preference", () => {
  beforeEach(() => {
    localStorage.clear()
    jest.clearAllMocks()
    jest.mocked(main2worker.handleGetMachineName).mockReturnValue("APPLE2EE")
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

  test("drops a filtered IIgs speed instead of applying it to the classic machine", () => {
    localStorage.setItem("machineName", JSON.stringify("APPLE2GS"))
    localStorage.setItem("speedMode", JSON.stringify(1))
    localStorage.setItem(SPEED_MODE_MACHINE_KEY, JSON.stringify("APPLE2GS"))

    loadPreferences()

    expect(jest.mocked(main2worker.passSetMachineName).mock.lastCall)
      .toEqual([APP_DEFAULT_MACHINE])
    expect(jest.mocked(main2worker.passSpeedMode)).not.toHaveBeenCalled()
    // The stale speed belonged to the machine this deployment no longer offers.
    expect(localStorage.getItem("speedMode")).toBeNull()
    expect(localStorage.getItem(SPEED_MODE_MACHINE_KEY)).toBeNull()
  })

  test("drops a legacy speed that has no machine context", () => {
    localStorage.setItem("speedMode", JSON.stringify(1))

    loadPreferences()

    expect(jest.mocked(main2worker.passSpeedMode)).not.toHaveBeenCalled()
    expect(localStorage.getItem("speedMode")).toBeNull()
  })

  test("applies a saved classic speed after choosing its machine", () => {
    localStorage.setItem("machineName", JSON.stringify("APPLE2EU"))
    localStorage.setItem("speedMode", JSON.stringify(-1))
    localStorage.setItem(SPEED_MODE_MACHINE_KEY, JSON.stringify("APPLE2EU"))

    loadPreferences()

    expect(jest.mocked(main2worker.passSetMachineName).mock.lastCall).toEqual(["APPLE2EU"])
    expect(jest.mocked(main2worker.passSpeedMode).mock.lastCall).toEqual([-1])
    expect(jest.mocked(main2worker.passSetMachineName).mock.invocationCallOrder[0])
      .toBeLessThan(jest.mocked(main2worker.passSpeedMode).mock.invocationCallOrder[0])
  })

  test("records the machine family when saving a speed choice", () => {
    jest.mocked(main2worker.handleGetMachineName).mockReturnValue("APPLE2EE")

    setPreferenceSpeedMode(-1)

    expect(localStorage.getItem("speedMode")).toBe(JSON.stringify(-1))
    expect(localStorage.getItem(SPEED_MODE_MACHINE_KEY)).toBe(JSON.stringify("APPLE2EE"))

    setPreferenceSpeedMode(0)
    expect(localStorage.getItem("speedMode")).toBeNull()
    expect(localStorage.getItem(SPEED_MODE_MACHINE_KEY)).toBeNull()
  })
})
