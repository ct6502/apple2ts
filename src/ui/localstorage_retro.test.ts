const passSiriusJoyport = jest.fn()

jest.mock("./main2worker", () => ({ passSiriusJoyport }))
jest.mock("./ui_settings", () => ({
  getTheme: jest.fn(),
  setTheme: jest.fn(),
  setUIStateBoolean: jest.fn(),
}))
jest.mock("./devices/audio/mockingboard_audio", () => ({}))

import { UI_THEME } from "../common/utility"
import {
  getPreferenceRetroIIGSColor,
  RETRO_IIGS_COLOR_DEFAULTS,
  SETTINGS_CHANGED_EVENT,
  type SettingsChangedDetail,
  setPreferenceBoolean,
  setPreferenceRetroIIGSColor,
  setPreferenceTheme,
} from "./localstorage"
import { getTheme, setUIStateBoolean } from "./ui_settings"

describe("Retro IIGS color preferences", () => {
  beforeEach(() => localStorage.clear())

  test("uses the requested default colors", () => {
    expect(getPreferenceRetroIIGSColor("text")).toBe(15)
    expect(getPreferenceRetroIIGSColor("background")).toBe(6)
    expect(getPreferenceRetroIIGSColor("border")).toBe(6)
  })

  test("persists every valid IIGS color code", () => {
    for (let color = 0; color <= 15; color += 1) {
      setPreferenceRetroIIGSColor("text", color)
      expect(getPreferenceRetroIIGSColor("text")).toBe(color)
    }
  })

  test("removes defaults and rejects invalid stored values", () => {
    setPreferenceRetroIIGSColor("background", 1)
    setPreferenceRetroIIGSColor("background", RETRO_IIGS_COLOR_DEFAULTS.background)
    expect(localStorage.getItem("retroIIGS.background")).toBeNull()

    localStorage.setItem("retroIIGS.border", "16")
    expect(getPreferenceRetroIIGSColor("border")).toBe(RETRO_IIGS_COLOR_DEFAULTS.border)
    expect(localStorage.getItem("retroIIGS.border")).toBeNull()
  })
})

describe("theme preferences", () => {
  beforeEach(() => jest.clearAllMocks())

  test("collapses the Info Panel when changing themes", () => {
    jest.mocked(getTheme).mockReturnValue(UI_THEME.DARK)

    setPreferenceTheme(UI_THEME.CLASSIC)

    expect(setUIStateBoolean).toHaveBeenCalledWith("infoPanel", false)
  })

  test("preserves the Info Panel when the theme is unchanged", () => {
    jest.mocked(getTheme).mockReturnValue(UI_THEME.CLASSIC)

    setPreferenceTheme(UI_THEME.CLASSIC)

    expect(setUIStateBoolean).not.toHaveBeenCalled()
  })
})

describe("settings change events", () => {
  test.each([true, false])("applies Sirius Joyport setting %s live", enabled => {
    setPreferenceBoolean("siriusJoyport", enabled)

    expect(passSiriusJoyport).toHaveBeenCalledWith(enabled)
  })

  test("identifies the visible control changed by the standard UI", () => {
    const listener = jest.fn<void, [Event]>()
    window.addEventListener(SETTINGS_CHANGED_EVENT, listener)

    setPreferenceBoolean("hotReload", true)

    expect(listener).toHaveBeenCalledTimes(1)
    expect((listener.mock.calls[0][0] as CustomEvent<SettingsChangedDetail>).detail)
      .toEqual({ controlIds: ["options.hotReload"] })
    window.removeEventListener(SETTINGS_CHANGED_EVENT, listener)
  })

  test("does not report Retro-origin writes as external changes", () => {
    const listener = jest.fn<void, [Event]>()
    window.addEventListener(SETTINGS_CHANGED_EVENT, listener)

    setPreferenceBoolean("hotReload", true, "retro")

    expect(listener).not.toHaveBeenCalled()
    window.removeEventListener(SETTINGS_CHANGED_EVENT, listener)
  })
})
