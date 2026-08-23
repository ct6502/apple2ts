import { getPreferenceRetroSkin, RETRO_SKIN } from "../localstorage"
import { choiceMetadata } from "./retromenuhelpers"
import type { RetroControlMetadata } from "./retromenucontext"

export const RETRO_SKINS = [RETRO_SKIN.APPLE_IIE, RETRO_SKIN.APPLE_IIGS, RETRO_SKIN.APPLE_IIPLUS] as const

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