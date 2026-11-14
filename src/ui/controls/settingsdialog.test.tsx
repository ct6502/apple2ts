import { act } from "react"
import { createRoot } from "react-dom/client"
import { SettingsDialog } from "./settingsdialog"
import { i18n, t } from "../../i18n"
import { setTheme } from "../ui_settings"
import { UI_THEME } from "../../common/utility"
import { getCardShortLabels, getRamdiskValues } from "../ui_utilities"
import * as workerMessages from "../main2worker"
import { handleMidiDeviceSelect } from "../devices/audio/midiselect"
import { setVeraFmAudioEnabled } from "../devices/audio/vera_psg_audio"

jest.mock("../main2worker", () => ({
  handleGetMachineName: () => "APPLE2EE",
  handleGetMemSize: () => 64,
  handleGetSpeedMode: () => 0,
  handleGetSlotConfig: jest.fn((): SlotConfig => ({ 1: "none", 2: "vera", 3: "aux", 4: "none", 5: "none", 6: "disk2", 7: "smartport" })),
  passSetVeraFmEnabled: jest.fn(),
}))

jest.mock("../devices/audio/midiselect", () => ({
  getMidiDeviceOptions: () => [
    { type: "built-in-synth", label: "Built-in MIDI Synthesizer" },
    { type: "enable-web-midi", label: "Enable External MIDI…" },
  ],
  isMidiDeviceSelected: (option: { type: string }) => option.type === "built-in-synth",
  handleMidiDeviceSelect: jest.fn(async () => {}),
}))

jest.mock("../devices/audio/vera_psg_audio", () => ({
  setVeraFmAudioEnabled: jest.fn(),
}))

// @ts-expect-error React act environment flag
globalThis.IS_REACT_ACT_ENVIRONMENT = true

test("settings preserves the selected dark theme in a translated UI", () => {
  const language = i18n.getLanguage()
  const container = document.createElement("div")
  document.body.appendChild(container)
  const root = createRoot(container)
  try {
    i18n.setLanguage("zh-TW")
    setTheme(UI_THEME.DARK)
    act(() => root.render(<SettingsDialog {...({ updateDisplay: jest.fn() } as unknown as DisplayProps)} />))
    act(() => container.querySelector<HTMLButtonElement>("#tour-settings")!.click())
    const theme = Array.from(container.querySelectorAll("select")).find(select => select.name === t("config.theme"))!
    expect(theme.value).toBe(t("themes.dark"))
  } finally {
    act(() => root.unmount())
    container.remove()
    setTheme(UI_THEME.CLASSIC)
    i18n.setLanguage(language)
  }
})

test("shared card and memory labels follow a language change", () => {
  const language = i18n.getLanguage()
  try {
    i18n.setLanguage("en")
    const english = getCardShortLabels(t).none
    i18n.setLanguage("zh-TW")
    expect(getCardShortLabels(t).none).toBe(t("linkBuilder.slots.cardNone"))
    expect(getCardShortLabels(t).none).not.toBe(english)
    expect(getRamdiskValues(t)[0]).toBe(t("linkBuilder.ramDiskSizes.default"))
  } finally {
    i18n.setLanguage(language)
  }
})

test("installed cards expose their own audio menus and actions", async () => {
  const language = i18n.getLanguage()
  const container = document.createElement("div")
  document.body.appendChild(container)
  const root = createRoot(container)
  const slots = jest.mocked(workerMessages.handleGetSlotConfig).mockReturnValue({
    1: "none", 2: "passport", 3: "aux", 4: "vera", 5: "mockingboard", 6: "disk2", 7: "smartport",
  })
  const fmPreference = localStorage.getItem("veraFmAudioEnabled")
  const clickMenuItem = async (label: string) => {
    const item = Array.from(container.querySelectorAll<HTMLSpanElement>(".popup-item-label"))
      .find(element => element.textContent?.trim() === label)!
    expect(item).toBeDefined()
    await act(async () => item.click())
  }
  try {
    i18n.setLanguage("en")
    jest.mocked(handleMidiDeviceSelect).mockClear()
    act(() => root.render(<SettingsDialog {...({ updateDisplay: jest.fn() } as unknown as DisplayProps)} />))
    act(() => container.querySelector<HTMLButtonElement>("#tour-settings")!.click())
    const audioButton = (card: string) => Array.from(container.querySelectorAll("button"))
      .find(button => button.title.includes(card) && button.title.includes(t("audio.configuration")))!
    expect(audioButton("Passport MIDI").parentElement?.querySelector("select")?.value).toBe("Passport")
    expect(audioButton("VERA").parentElement?.querySelector("select")?.value).toBe("VERA")
    expect(audioButton("Mockingboard")).toBeDefined()
    expect(handleMidiDeviceSelect).not.toHaveBeenCalled()

    act(() => audioButton("Passport MIDI").click())
    expect(container.textContent).toContain("Built-in MIDI Synthesizer")
    expect(container.textContent).not.toContain("Enable FM Audio")
    await clickMenuItem("Enable External MIDI…")
    expect(handleMidiDeviceSelect).toHaveBeenCalledWith({ type: "enable-web-midi", label: "Enable External MIDI…" })

    act(() => audioButton("VERA").click())
    await clickMenuItem("Disable FM Audio")
    expect(localStorage.getItem("veraFmAudioEnabled")).toBe("false")
    expect(workerMessages.passSetVeraFmEnabled).toHaveBeenLastCalledWith(false)
    expect(setVeraFmAudioEnabled).toHaveBeenLastCalledWith(false)
    act(() => audioButton("VERA").click())
    await clickMenuItem("Enable FM Audio")
    expect(localStorage.getItem("veraFmAudioEnabled")).toBeNull()
    expect(workerMessages.passSetVeraFmEnabled).toHaveBeenLastCalledWith(true)

    slots.mockReturnValue({ 1: "none", 2: "none", 3: "aux", 4: "none", 5: "none", 6: "disk2", 7: "smartport" })
    act(() => root.render(<SettingsDialog {...({ updateDisplay: jest.fn() } as unknown as DisplayProps)} />))
    expect(audioButton("Passport MIDI")).toBeUndefined()
    expect(audioButton("VERA")).toBeUndefined()
    expect(audioButton("Mockingboard")).toBeUndefined()
  } finally {
    act(() => root.unmount())
    container.remove()
    slots.mockReturnValue({ 1: "none", 2: "vera", 3: "aux", 4: "none", 5: "none", 6: "disk2", 7: "smartport" })
    if (fmPreference === null) localStorage.removeItem("veraFmAudioEnabled")
    else localStorage.setItem("veraFmAudioEnabled", fmPreference)
    i18n.setLanguage(language)
  }
})
