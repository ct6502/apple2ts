import { act } from "react"
import { createRoot } from "react-dom/client"
import ConfigButtons from "./configbuttons"
import { i18n, t } from "../../i18n"
import { handleGetMachineName, passIigsDeskPanel } from "../main2worker"

jest.mock("../main2worker", () => ({
  handleGetMachineName: jest.fn(() => "APPLE2GS"),
  passIigsDeskPanel: jest.fn(),
}))

jest.mock("../devices/audio/speaker", () => ({
  audioEnable: jest.fn(),
  canShowAudioControl: () => true,
  getAudioStatus: () => "muted",
  retrySpeakerAudio: jest.fn(),
  subscribeAudioStatus: () => () => {},
}))

jest.mock("./speeddropdown", () => ({ SpeedDropdown: () => null }))
jest.mock("./linkbuilder", () => ({ __esModule: true, default: () => null }))
jest.mock("./settingsdialog", () => ({ SettingsDialog: () => null }))
jest.mock("../tours/runtour", () => ({ __esModule: true, default: () => null }))

// @ts-expect-error React act environment flag
globalThis.IS_REACT_ACT_ENVIRONMENT = true

const renderConfigButtons = () => {
  const container = document.createElement("div")
  document.body.appendChild(container)
  const root = createRoot(container)
  act(() => root.render(
    <ConfigButtons {...({ updateDisplay: jest.fn() } as unknown as DisplayProps)} />,
  ))
  return { container, root }
}

test("GS mode puts the DA button immediately right of the Control Panel icon", () => {
  const language = i18n.getLanguage()
  const machineMock = jest.mocked(handleGetMachineName)
  const deskMock = jest.mocked(passIigsDeskPanel)
  machineMock.mockReturnValue("APPLE2GS")
  const { container, root } = renderConfigButtons()
  try {
    i18n.setLanguage("en")
    const buttons = Array.from(container.querySelectorAll("button"))
    const controlPanel = buttons.find(button =>
      button.title === t("config.openRetroControlPanel"))
    const daButton = container.querySelector<HTMLButtonElement>("#tour-iigs-desk-button")
    expect(controlPanel).toBeDefined()
    expect(daButton).not.toBeNull()
    expect(daButton!.title).toBe(t("machine.iigsDeskPanel"))
    expect(daButton!.getAttribute("aria-label")).toBe(t("machine.iigsDeskPanel"))
    const controlPanelIndex = buttons.indexOf(controlPanel!)
    const daIndex = buttons.indexOf(daButton!)
    expect(daIndex).toBe(controlPanelIndex + 1)

    act(() => daButton!.click())
    expect(deskMock).toHaveBeenCalledTimes(1)
  } finally {
    act(() => root.unmount())
    container.remove()
    i18n.setLanguage(language)
  }
})

test("classic mode hides the IIgs DA button", () => {
  const language = i18n.getLanguage()
  const machineMock = jest.mocked(handleGetMachineName)
  machineMock.mockReturnValue("APPLE2EE")
  const { container, root } = renderConfigButtons()
  try {
    i18n.setLanguage("en")
    expect(container.querySelector("#tour-iigs-desk-button")).toBeNull()
  } finally {
    act(() => root.unmount())
    container.remove()
    i18n.setLanguage(language)
  }
})
