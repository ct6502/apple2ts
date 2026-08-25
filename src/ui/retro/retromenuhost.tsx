import { useState } from "react"
import { useTranslation } from "../../i18n/useTranslation"
import DemoZooDialog from "../devices/disk/demozoodialog"
import InternetArchivePopup from "../devices/disk/internetarchivedialog"
import {
  getPreferenceRetroIIGSColor,
  getPreferenceRetroSkin,
  type RETRO_IIGS_COLOR_PREFERENCE,
  RETRO_SKIN,
  setPreferenceRetroIIGSColor,
  setPreferenceRetroSkin,
} from "../localstorage"
import { getColorMode, getCrtDistortion, getGhosting, getTheme } from "../ui_settings"
import { retroMenuRegistry } from "./retromenucomposition"
import type { DiskLoadDialog, RetroMenuContext } from "./retromenucontext"
import { useGlobalContext } from "../globalcontext"
import { RETRO_IIGS_COLORS } from "./retroskincontrol"
import ImageWriter from "../devices/printer/imagewriter"

const colorModeClasses = ["color", "color", "green", "amber", "white", "inverse"]
const retroSkinClasses = ["apple-iie", "apple-iigs", "apple-iiplus"]

export const useRetroMenuHost = (displayProps: DisplayProps, close: () => void) => {
  const { t, language, changeLanguage } = useTranslation()
  const {
    returnToTourHelp,
    runTour,
    setReturnToTourHelp,
    setRunTour,
    setTourIndex,
    setTourSourceTheme,
    tourIndex,
  } = useGlobalContext()
  const [diskLoadDialog, setDiskLoadDialog] = useState<DiskLoadDialog | null>(null)
  const [retroSkin, setRetroSkin] = useState(getPreferenceRetroSkin)
  const [retroIIGSColors, setRetroIIGSColors] = useState(() => ({
    text: getPreferenceRetroIIGSColor("text"),
    background: getPreferenceRetroIIGSColor("background"),
    border: getPreferenceRetroIIGSColor("border"),
  }))
  const openDiskDialog = (dialog: DiskLoadDialog) => {
    setDiskLoadDialog(dialog)
  }
  const changeRetroSkin = (skin: RETRO_SKIN) => {
    setPreferenceRetroSkin(skin)
    setRetroSkin(skin)
  }
  const changeRetroIIGSColor = (preference: RETRO_IIGS_COLOR_PREFERENCE, color: number) => {
    setPreferenceRetroIIGSColor(preference, color)
    setRetroIIGSColors(colors => ({ ...colors, [preference]: color }))
  }
  const context: RetroMenuContext = {
    displayProps,
    close,
    openDiskDialog,
    t,
    language,
    changeLanguage,
    changeRetroSkin,
    changeRetroIIGSColor,
    retroSkin,
    retroIIGSColors,
    startTour: tour => {
      setReturnToTourHelp(false)
      setTourSourceTheme(getTheme())
      close()
      setRunTour(tour)
      setTourIndex(0)
    },
  }
  const rootMenu = retroMenuRegistry.resolve(context)
  const effects = [
    `retro-color-${colorModeClasses[getColorMode()]}`,
    `retro-skin-${retroSkinClasses[retroSkin]}`,
    getGhosting() ? "retro-effect-ghosting" : "",
    getCrtDistortion() ? "retro-effect-crt" : "",
  ].filter(Boolean).join(" ")
  const iigsStyle = retroSkin === RETRO_SKIN.APPLE_IIGS
    ? {
      "--retro-background": RETRO_IIGS_COLORS[retroIIGSColors.background].css,
      "--retro-foreground": RETRO_IIGS_COLORS[retroIIGSColors.text].css,
      "--retro-surround": RETRO_IIGS_COLORS[retroIIGSColors.border].css,
    } as React.CSSProperties
    : undefined
  const dialogs = <>
    <ImageWriter showLauncher={false} />
    <InternetArchivePopup
      driveIndex={diskLoadDialog?.driveIndex ?? 0}
      open={diskLoadDialog?.type === "internetArchive"}
      onClose={() => setDiskLoadDialog(null)}
      onLoadSuccess={close}
    />
    <DemoZooDialog
      driveIndex={diskLoadDialog?.driveIndex ?? 0}
      open={diskLoadDialog?.type === "demoZoo"}
      onClose={() => setDiskLoadDialog(null)}
      onLoadSuccess={close}
    />
  </>
  return {
    dialogs,
    effects,
    hasOpenDialog: diskLoadDialog !== null,
    iigsStyle,
    language,
    retroSkin,
    retroIIGSColors,
    returnToTourHelp,
    rootMenu,
    runTour,
    setReturnToTourHelp,
    t,
    tourIndex,
  }
}