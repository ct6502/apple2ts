import { act } from "react"
import { createRoot } from "react-dom/client"
import { SettingsDialog } from "./settingsdialog"
import LinkBuilder from "./linkbuilder"
import { i18n, t } from "../../i18n"

jest.mock("../main2worker", () => ({
  handleGetIsDebugging: jest.fn(() => false),
  handleGetMachineName: jest.fn(() => "APPLE2EE"),
  handleGetMemSize: jest.fn(() => 64),
  handleGetSpeedMode: jest.fn(() => 0),
  handleGetSlotConfig: jest.fn((): SlotConfig => ({
    1: "none",
    2: "vera",
    3: "aux",
    4: "none",
    5: "none",
    6: "disk2",
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
  audioEnable: jest.fn(),
  getAudioStatus: jest.fn(() => "enabled"),
  isAudioEnabled: jest.fn(() => true),
  retrySpeakerAudio: jest.fn(),
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

test("classic deployment exposes only the non-IIgs machines", () => {
  const language = i18n.getLanguage()
  const settingsContainer = document.createElement("div")
  const linkContainer = document.createElement("div")
  document.body.append(settingsContainer, linkContainer)
  const settingsRoot = createRoot(settingsContainer)
  const linkRoot = createRoot(linkContainer)
  try {
    i18n.setLanguage("en")
    const classicOptions = [
      t("machine.models.apple2p"),
      t("machine.models.apple2eu"),
      t("machine.models.apple2ee"),
    ]

    act(() => settingsRoot.render(
      <SettingsDialog {...({ updateDisplay: jest.fn() } as unknown as DisplayProps)} />,
    ))
    act(() => settingsContainer.querySelector<HTMLButtonElement>("#tour-settings")!.click())
    expect(machineOptions(settingsContainer)).toEqual(classicOptions)

    act(() => linkRoot.render(<LinkBuilder />))
    act(() => linkContainer.querySelector("button")!.dispatchEvent(
      new MouseEvent("click", { bubbles: true }),
    ))
    expect(machineOptions(linkContainer)).toEqual(classicOptions)
  } finally {
    act(() => settingsRoot.unmount())
    act(() => linkRoot.unmount())
    settingsContainer.remove()
    linkContainer.remove()
    i18n.setLanguage(language)
  }
})
