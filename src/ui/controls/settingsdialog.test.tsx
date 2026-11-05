import { act } from "react"
import { createRoot } from "react-dom/client"
import { SettingsDialog } from "./settingsdialog"
import { i18n, t } from "../../i18n"
import { setTheme } from "../ui_settings"
import { UI_THEME } from "../../common/utility"
import { getCardShortLabels, getRamdiskValues } from "../ui_utilities"

jest.mock("../main2worker", () => ({
  handleGetMachineName: () => "APPLE2EE",
  handleGetMemSize: () => 64,
  handleGetSpeedMode: () => 0,
  handleGetSlotConfig: () => ({ 1: "none", 2: "vera", 3: "aux", 4: "none", 5: "none", 6: "disk2", 7: "smartport" }),
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
