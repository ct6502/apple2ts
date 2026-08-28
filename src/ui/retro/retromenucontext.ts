import type { Language } from "../../i18n"
import type { RETRO_IIGS_COLOR_PREFERENCE, RETRO_SKIN } from "../localstorage"
import type { SettingsChangeOrigin } from "../settingschange"
import type { ControlMetadata, ResolvedControl } from "../controls/controlregistry"
import type { DiskBookmarks } from "../devices/disk/diskbookmarks"

export type Translate = (key: string, params?: Record<string, string>) => string

export type DiskLoadDialog = {
  driveIndex: number
  type: "demoZoo" | "internetArchive"
}

export type RetroMenuContext = {
  settingsOrigin: SettingsChangeOrigin
  displayProps: DisplayProps
  close: () => void
  openDiskDialog: (dialog: DiskLoadDialog) => void
  t: Translate
  language: Language
  changeLanguage: (language: Language) => void
  changeRetroSkin: (skin: RETRO_SKIN) => void
  changeRetroIIGSColor: (preference: RETRO_IIGS_COLOR_PREFERENCE, color: number) => void
  retroSkin: RETRO_SKIN
  retroIIGSColors: Record<RETRO_IIGS_COLOR_PREFERENCE, number>
  diskCollection?: DiskCollectionItem[]
  diskBookmarks?: DiskBookmarks
  notifyCloudAuthChanged?: () => void
  startTour: (tour: string) => void
}

export const createControlContext = (
  displayProps: DisplayProps | undefined,
  t: Translate,
  language: Language,
  changeLanguage: (language: Language) => void,
): RetroMenuContext => ({
  settingsOrigin: "external",
  displayProps: displayProps ?? { updateDisplay: () => undefined } as DisplayProps,
  t,
  language,
  changeLanguage,
  close: () => undefined,
  openDiskDialog: () => undefined,
  changeRetroSkin: () => undefined,
  changeRetroIIGSColor: () => undefined,
  retroSkin: 0 as RETRO_SKIN,
  retroIIGSColors: { text: 15, background: 6, border: 6 },
  diskCollection: undefined,
  diskBookmarks: undefined,
  notifyCloudAuthChanged: undefined,
  startTour: () => undefined,
})

export type RetroControlMetadata<Payload = unknown> = ControlMetadata<RetroMenuContext, Payload>
export type RetroResolvedControl<Payload = unknown> = ResolvedControl<Payload>