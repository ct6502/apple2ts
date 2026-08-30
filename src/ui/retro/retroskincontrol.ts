import {
  getPreferenceRetroIIGSColor,
  getPreferenceRetroSkin,
  RETRO_IIGS_COLOR_DEFAULTS,
  RETRO_SKIN,
} from "../localstorage"
import type { RetroControlMetadata } from "./retromenucontext"
import { RETRO_IIGS_COLORS } from "./retroskincolors"
import { choiceBinding, controlsFromJson, type RetroControlBindings } from "./retrocontrolmetadata"

export { RETRO_IIGS_COLORS } from "./retroskincolors"

export const RETRO_SKINS = [RETRO_SKIN.APPLE_IIE, RETRO_SKIN.APPLE_IIGS, RETRO_SKIN.APPLE_IIPLUS] as const

const skinBindings: RetroControlBindings = {
  "options.retroSkin": {
    ...choiceBinding({
      options: () => ["Apple //e", "Apple IIGS", "Apple ][+"].map(label => ({ label })),
      currentIndex: getPreferenceRetroSkin,
      select: (context, index) => context.changeRetroSkin(RETRO_SKINS[index]),
      preview: (context, index) => context.changeRetroSkin(RETRO_SKINS[index]),
    }),
    defaultIndex: RETRO_SKIN.APPLE_IIE,
  },
  "options.retroSkin.text": {
    ...choiceBinding({
      options: context => RETRO_IIGS_COLORS.map(color => ({ label: context.t(color.key) })),
      currentIndex: () => getPreferenceRetroIIGSColor("text"),
      select: (context, index) => context.changeRetroIIGSColor("text", index),
      preview: (context, index) => context.changeRetroIIGSColor("text", index),
    }),
    defaultIndex: RETRO_IIGS_COLOR_DEFAULTS.text,
    selectable: () => getPreferenceRetroSkin() === RETRO_SKIN.APPLE_IIGS,
  },
  "options.retroSkin.background": {
    ...choiceBinding({
      options: context => RETRO_IIGS_COLORS.map(color => ({ label: context.t(color.key) })),
      currentIndex: () => getPreferenceRetroIIGSColor("background"),
      select: (context, index) => context.changeRetroIIGSColor("background", index),
      preview: (context, index) => context.changeRetroIIGSColor("background", index),
    }),
    defaultIndex: RETRO_IIGS_COLOR_DEFAULTS.background,
    selectable: () => getPreferenceRetroSkin() === RETRO_SKIN.APPLE_IIGS,
  },
  "options.retroSkin.border": {
    ...choiceBinding({
      options: context => RETRO_IIGS_COLORS.map(color => ({ label: context.t(color.key) })),
      currentIndex: () => getPreferenceRetroIIGSColor("border"),
      select: (context, index) => context.changeRetroIIGSColor("border", index),
      preview: (context, index) => context.changeRetroIIGSColor("border", index),
    }),
    defaultIndex: RETRO_IIGS_COLOR_DEFAULTS.border,
    selectable: () => getPreferenceRetroSkin() === RETRO_SKIN.APPLE_IIGS,
  },
}

const skinControls = controlsFromJson("skin", skinBindings)

export const retroSkinSeparator: RetroControlMetadata = skinControls
  .find(control => control.id === "options.retroSkinSeparator")!

export const retroSkinControl: RetroControlMetadata = skinControls
  .find(control => control.id === "options.retroSkin")!

export const retroSkinColorControls: RetroControlMetadata[] = [
  "options.retroSkin.text",
  "options.retroSkin.background",
  "options.retroSkin.border",
].map(id => skinControls.find(control => control.id === id)!)