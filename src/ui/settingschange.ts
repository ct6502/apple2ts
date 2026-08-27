export const SETTINGS_CHANGED_EVENT = "apple2ts-settings-changed"

export type SettingsChangeOrigin = "external" | "retro"
export type SettingsChangedDetail = { controlIds: readonly string[] }

export const notifySettingsChanged = (
  controlIds: readonly string[],
  origin: SettingsChangeOrigin,
) => {
  if (origin === "retro") return
  window.dispatchEvent(new CustomEvent<SettingsChangedDetail>(SETTINGS_CHANGED_EVENT, {
    detail: { controlIds },
  }))
}