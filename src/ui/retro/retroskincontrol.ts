import {
  getPreferenceRetroIIGSColor,
  getPreferenceRetroSkin,
  type RETRO_IIGS_COLOR_PREFERENCE,
  RETRO_IIGS_COLOR_DEFAULTS,
  RETRO_SKIN,
} from "../localstorage"
import { choiceMetadata } from "./retromenuhelpers"
import type { RetroControlMetadata } from "./retromenucontext"

export const RETRO_SKINS = [RETRO_SKIN.APPLE_IIE, RETRO_SKIN.APPLE_IIGS, RETRO_SKIN.APPLE_IIPLUS] as const

export const RETRO_IIGS_COLORS = [
  { name: "Black", key: "retroControl.iigsColor.black", css: "rgb(0, 0, 0)" },
  { name: "Red", key: "retroControl.iigsColor.red", css: "rgb(221, 0, 51)" },
  { name: "Dark Blue", key: "retroControl.iigsColor.darkBlue", css: "rgb(0, 0, 153)" },
  { name: "Purple", key: "retroControl.iigsColor.purple", css: "rgb(221, 34, 221)" },
  { name: "Dark Green", key: "retroControl.iigsColor.darkGreen", css: "rgb(0, 119, 34)" },
  { name: "Dark Gray", key: "retroControl.iigsColor.darkGray", css: "rgb(85, 85, 85)" },
  { name: "Medium Blue", key: "retroControl.iigsColor.mediumBlue", css: "rgb(34, 34, 255)" },
  { name: "Light Blue", key: "retroControl.iigsColor.lightBlue", css: "rgb(102, 170, 255)" },
  { name: "Brown", key: "retroControl.iigsColor.brown", css: "rgb(136, 85, 0)" },
  { name: "Orange", key: "retroControl.iigsColor.orange", css: "rgb(255, 102, 0)" },
  { name: "Light Gray", key: "retroControl.iigsColor.lightGray", css: "rgb(170, 170, 170)" },
  { name: "Pink", key: "retroControl.iigsColor.pink", css: "rgb(255, 153, 136)" },
  { name: "Light Green", key: "retroControl.iigsColor.lightGreen", css: "rgb(17, 221, 0)" },
  { name: "Yellow", key: "retroControl.iigsColor.yellow", css: "rgb(255, 255, 0)" },
  { name: "Aquamarine", key: "retroControl.iigsColor.aquamarine", css: "rgb(68, 255, 153)" },
  { name: "White", key: "retroControl.iigsColor.white", css: "rgb(255, 255, 255)" },
] as const

export const retroSkinSeparator: RetroControlMetadata = {
  id: "options.retroSkinSeparator",
  order: 4.9,
  label: context => context.t("retroControl.retroSkin"),
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