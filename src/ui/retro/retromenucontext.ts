import type { Language } from "../../i18n"
import type { RETRO_IIGS_COLOR_PREFERENCE, RETRO_SKIN } from "../localstorage"
import type { ControlMetadata, ResolvedControl } from "../controls/controlregistry"

export type Translate = (key: string, params?: Record<string, string>) => string

export type DiskLoadDialog = {
  driveIndex: number
  type: "demoZoo" | "internetArchive"
}

export type RetroMenuContext = {
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
  notifyCloudAuthChanged?: () => void
  startTour: (tour: string) => void
}

export const createControlContext = (
  displayProps: DisplayProps | undefined,
  t: Translate,
  language: Language,
  changeLanguage: (language: Language) => void,
): RetroMenuContext => ({
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
  notifyCloudAuthChanged: undefined,
  startTour: () => undefined,
})

export type RetroControlMetadata<Payload = unknown> = ControlMetadata<RetroMenuContext, Payload>
export type RetroResolvedControl<Payload = unknown> = ResolvedControl<Payload>