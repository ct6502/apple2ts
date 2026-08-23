import type { Language } from "../../i18n"
import type { RETRO_SKIN } from "../localstorage"
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
})

export type RetroControlMetadata<Payload = unknown> = ControlMetadata<RetroMenuContext, Payload>
export type RetroResolvedControl<Payload = unknown> = ResolvedControl<Payload>