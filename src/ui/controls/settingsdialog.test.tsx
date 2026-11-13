import { act } from "react"
import { createRoot } from "react-dom/client"
import { SettingsDialog } from "./settingsdialog"
import { i18n, t } from "../../i18n"
import { setTheme } from "../ui_settings"
import { DEFAULT_SLOT_CONFIG_GS, UI_THEME } from "../../common/utility"
import { getCardShortLabels, getRamdiskValues } from "../ui_utilities"
import * as workerMessages from "../main2worker"
import { handleMidiDeviceSelect } from "../devices/audio/midiselect"
import { setVeraFmAudioEnabled } from "../devices/audio/vera_psg_audio"

jest.mock("../main2worker", () => ({
  handleGetMachineName: jest.fn(() => "APPLE2EE"),
  handleGetMemSize: jest.fn(() => 64),
  handleGetSpeedMode: jest.fn(() => 0),
  handleGetSlotConfig: jest.fn((): SlotConfig => ({ 1: "none", 2: "vera", 3: "aux", 4: "none", 5: "none", 6: "disk2", 7: "smartport" })),
  passSetMachineName: jest.fn(),
  passSetRamWorks: jest.fn(),
  passSetSlotConfig: jest.fn(),
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

test("shows the IIgs machine and its built-in slot configuration in Settings", () => {
  const language = i18n.getLanguage()
  const container = document.createElement("div")
  document.body.appendChild(container)
  const root = createRoot(container)
  const machineMock = jest.mocked(workerMessages.handleGetMachineName).mockReturnValue("APPLE2GS")
  const slotsMock = jest.mocked(workerMessages.handleGetSlotConfig).mockReturnValue(DEFAULT_SLOT_CONFIG_GS)
  try {
    i18n.setLanguage("en")
    act(() => root.render(<SettingsDialog {...({ updateDisplay: jest.fn() } as unknown as DisplayProps)} />))
    act(() => container.querySelector<HTMLButtonElement>("#tour-settings")!.click())

    const selectByName = (name: string) => {
      const select = Array.from(container.querySelectorAll("select"))
        .find(candidate => candidate.name === name)
      expect(select).toBeDefined()
      return select as HTMLSelectElement
    }

    const machine = selectByName(t("linkBuilder.machine"))
    expect(machine.value).toBe("Apple IIgs")
    expect(Array.from(machine.querySelectorAll("option")).map(option => option.value))
      .toContain("Apple IIgs")

    const expectedSlots = [
      ["Slot 1:", "Printer Port"],
      ["Slot 2:", "Modem Port"],
      ["Slot 3:", "80-Column Text"],
      ["Slot 4:", "Mouse Port"],
      ["Slot 5:", "Smart Port"],
      ["Slot 6:", "Disk Port"],
      ["Slot 7:", "SmartPort"],
    ] as const
    for (const [slotName, cardLabel] of expectedSlots) {
      expect(selectByName(slotName).value).toBe(cardLabel)
    }
  } finally {
    act(() => root.unmount())
    container.remove()
    machineMock.mockReturnValue("APPLE2EE")
    slotsMock.mockReturnValue({ 1: "none", 2: "vera", 3: "aux", 4: "none", 5: "none", 6: "disk2", 7: "smartport" })
    i18n.setLanguage(language)
  }
})

test("switching from Apple II+ to the IIgs keeps its built-in slot defaults", () => {
  const language = i18n.getLanguage()
  const savedMachine = localStorage.getItem("machineName")
  const savedSlotConfig = localStorage.getItem("slotConfig")
  const container = document.createElement("div")
  document.body.appendChild(container)
  const root = createRoot(container)
  const machineMock = jest.mocked(workerMessages.handleGetMachineName).mockReturnValue("APPLE2P")
  const slotsMock = jest.mocked(workerMessages.handleGetSlotConfig).mockReturnValue({
    1: "ssc", 2: "none", 3: "videoterm", 4: "mockingboard", 5: "mouse", 6: "disk2", 7: "smartport",
  })
  try {
    localStorage.removeItem("machineName")
    localStorage.removeItem("slotConfig")
    i18n.setLanguage("en")
    act(() => root.render(<SettingsDialog {...({ updateDisplay: jest.fn() } as unknown as DisplayProps)} />))
    act(() => container.querySelector<HTMLButtonElement>("#tour-settings")!.click())

    const machine = Array.from(container.querySelectorAll("select"))
      .find(candidate => candidate.name === t("linkBuilder.machine")) as HTMLSelectElement
    expect(machine.value).toBe("Apple II+")
    expect(Array.from(machine.querySelectorAll("option")).map(option => option.value))
      .toContain("Apple IIgs")
    act(() => {
      machine.value = "Apple IIgs"
      machine.dispatchEvent(new Event("change", { bubbles: true }))
    })

    expect(localStorage.getItem("machineName")).toBe(JSON.stringify("APPLE2GS"))
    expect(JSON.parse(localStorage.getItem("slotConfig")!)).toEqual(DEFAULT_SLOT_CONFIG_GS)
  } finally {
    act(() => root.unmount())
    container.remove()
    if (savedMachine === null) localStorage.removeItem("machineName")
    else localStorage.setItem("machineName", savedMachine)
    if (savedSlotConfig === null) localStorage.removeItem("slotConfig")
    else localStorage.setItem("slotConfig", savedSlotConfig)
    slotsMock.mockReturnValue({ 1: "none", 2: "vera", 3: "aux", 4: "none", 5: "none", 6: "disk2", 7: "smartport" })
    machineMock.mockReturnValue("APPLE2EE")
    i18n.setLanguage(language)
  }
})
