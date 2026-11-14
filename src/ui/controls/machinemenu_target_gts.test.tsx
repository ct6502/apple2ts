import { act } from "react"
import { createRoot } from "react-dom/client"
import { SettingsDialog } from "./settingsdialog"
import LinkBuilder from "./linkbuilder"
import { i18n, t } from "../../i18n"

jest.mock("../../common/app_target", () => ({
  APP_DEFAULT_MACHINE: "APPLE2GS",
  APP_MACHINE_NAMES: ["APPLE2GS"],
}))

jest.mock("../main2worker", () => ({
  handleGetIsDebugging: jest.fn(() => false),
  handleGetMachineName: jest.fn(() => "APPLE2GS"),
  handleGetMemSize: jest.fn(() => 8192),
  handleGetSpeedMode: jest.fn(() => 1),
  handleGetSlotConfig: jest.fn((): SlotConfig => ({
    1: "ssc",
    2: "gsModem",
    3: "gsText80",
    4: "gsMouse",
    5: "gsSmartPort",
    6: "gsDiskPort",
    7: "smartport",
  })),
  passSetMachineName: jest.fn(),
  passSetRamWorks: jest.fn(),
  passSetSlotConfig: jest.fn(),
  passSetIigsRomVersion: jest.fn(),
  passSetVeraSlot: jest.fn(),
  passSetVeraFmEnabled: jest.fn(),
}))

jest.mock("../devices/audio/speaker", () => ({
  isAudioEnabled: jest.fn(() => true),
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

// @ts-expect-error set act environment flag for React 18+
globalThis.IS_REACT_ACT_ENVIRONMENT = true

const machineOptions = (container: HTMLElement) => {
  const select = Array.from(container.querySelectorAll("select"))
    .find(candidate => candidate.name === t("linkBuilder.machine")) as HTMLSelectElement
  expect(select).not.toBeNull()
  return Array.from(select.querySelectorAll("option")).map(option => option.value)
}

test("IIgs deployment keeps Settings GS-only but lets Link Builder cross to the classic machines", () => {
  const language = i18n.getLanguage()
  const settingsContainer = document.createElement("div")
  const linkContainer = document.createElement("div")
  document.body.append(settingsContainer, linkContainer)
  const settingsRoot = createRoot(settingsContainer)
  const linkRoot = createRoot(linkContainer)
  try {
    i18n.setLanguage("en")
    const gsOptions = ["Apple IIgs"]
    const classicOptions = [
      t("machine.models.apple2p"),
      t("machine.models.apple2eu"),
      t("machine.models.apple2ee"),
    ]
    const allOptions = [...classicOptions, "Apple IIgs"]

    act(() => settingsRoot.render(
      <SettingsDialog {...({ updateDisplay: jest.fn() } as unknown as DisplayProps)} />,
    ))
    act(() => settingsContainer.querySelector<HTMLButtonElement>("#tour-settings")!.click())
    expect(machineOptions(settingsContainer)).toEqual(gsOptions)

    // apple2gts.com can still build a classic title link even though its
    // Settings custom machine droplist is GS-only.
    act(() => linkRoot.render(<LinkBuilder />))
    act(() => linkContainer.querySelector("button")!.dispatchEvent(
      new MouseEvent("click", { bubbles: true }),
    ))
    expect(machineOptions(linkContainer)).toEqual(allOptions)
  } finally {
    act(() => settingsRoot.unmount())
    act(() => linkRoot.unmount())
    settingsContainer.remove()
    linkContainer.remove()
    i18n.setLanguage(language)
  }
})
