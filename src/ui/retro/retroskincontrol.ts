import {
  getPreferenceRetroIIGSColor,
  getPreferenceRetroSkin,
  type RETRO_IIGS_COLOR_PREFERENCE,
  RETRO_IIGS_COLOR_DEFAULTS,
  RETRO_SKIN,
} from "../localstorage"
import { choiceMetadata } from "./retromenuhelpers"
import type { RetroControlMetadata } from "./retromenucontext"
import { RETRO_IIGS_COLORS } from "./retroskincolors"

export { RETRO_IIGS_COLORS } from "./retroskincolors"

export const RETRO_SKINS = [RETRO_SKIN.APPLE_IIE, RETRO_SKIN.APPLE_IIGS, RETRO_SKIN.APPLE_IIPLUS] as const

export const retroSkinSeparator: RetroControlMetadata = {
  id: "options.retroSkinSeparator",
  order: 3.9,
  label: context => context.t("retroControl.personalization"),
  separator: true,
  selectable: false,
}

export const retroSkinControl: RetroControlMetadata = choiceMetadata({
  id: "options.retroSkin",
  order: 5,
  label: context => context.t("retroControl.skin"),
  labels: () => ["Apple //e", "Apple IIGS", "Apple ][+"],
  currentIndex: getPreferenceRetroSkin,
  select: (context, index) => context.changeRetroSkin(RETRO_SKINS[index]),
  preview: (context, index) => context.changeRetroSkin(RETRO_SKINS[index]),
  defaultIndex: RETRO_SKIN.APPLE_IIE,
})

retroSkinControl.refreshParentOnOption = true

const colorControl = (
  preference: RETRO_IIGS_COLOR_PREFERENCE,
  order: number,
  labelKey: string,
): RetroControlMetadata => choiceMetadata({
  id: `options.retroSkin.${preference}`,
  order,
  label: context => context.t(labelKey),
  labels: context => RETRO_IIGS_COLORS.map(color => context.t(color.key)),
  currentIndex: () => getPreferenceRetroIIGSColor(preference),
  select: (context, index) => context.changeRetroIIGSColor(preference, index),
  preview: (context, index) => context.changeRetroIIGSColor(preference, index),
  defaultIndex: RETRO_IIGS_COLOR_DEFAULTS[preference],
  selectable: () => getPreferenceRetroSkin() === RETRO_SKIN.APPLE_IIGS,
})

export const retroSkinColorControls: RetroControlMetadata[] = [
  colorControl("text", 5.1, "retroControl.text"),
  colorControl("background", 5.2, "retroControl.background"),
  colorControl("border", 5.3, "retroControl.border"),
]