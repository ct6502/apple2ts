jest.mock("./main2worker", () => ({}))
jest.mock("./ui_settings", () => ({}))
jest.mock("./devices/audio/mockingboard_audio", () => ({}))

import {
  getPreferenceRetroIIGSColor,
  RETRO_IIGS_COLOR_DEFAULTS,
  setPreferenceRetroIIGSColor,
} from "./localstorage"

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