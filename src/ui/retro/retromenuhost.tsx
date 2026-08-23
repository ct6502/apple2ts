import { useState } from "react"
import { useTranslation } from "../../i18n/useTranslation"
import DemoZooDialog from "../devices/disk/demozoodialog"
import InternetArchivePopup from "../devices/disk/internetarchivedialog"
import {
  getPreferenceRetroSkin,
  RETRO_SKIN,
  setPreferenceRetroSkin,
} from "../localstorage"
import { getColorMode, getCrtDistortion, getGhosting } from "../ui_settings"
import { retroMenuRegistry } from "./retromenucomposition"
import type { DiskLoadDialog, RetroMenuContext } from "./retromenucontext"

const colorModeClasses = ["color", "color", "green", "amber", "white", "inverse"]
const retroSkinClasses = ["apple-iie", "apple-iigs", "apple-iiplus"]

export const useRetroMenuHost = (displayProps: DisplayProps, close: () => void) => {
  const { t, language, changeLanguage } = useTranslation()
  const [diskLoadDialog, setDiskLoadDialog] = useState<DiskLoadDialog | null>(null)
  const [retroSkin, setRetroSkin] = useState(getPreferenceRetroSkin)
  const openDiskDialog = (dialog: DiskLoadDialog) => {
    close()
    setDiskLoadDialog(dialog)
  }
  const changeRetroSkin = (skin: RETRO_SKIN) => {
    setPreferenceRetroSkin(skin)
    setRetroSkin(skin)
  }
  const context: RetroMenuContext = {
    displayProps,
    close,
    openDiskDialog,
    t,
    language,
    changeLanguage,
    changeRetroSkin,
  }
  const rootMenu = retroMenuRegistry.resolve(context)
  const effects = [
    `retro-color-${colorModeClasses[getColorMode()]}`,
    `retro-skin-${retroSkinClasses[retroSkin]}`,
    getGhosting() ? "retro-effect-ghosting" : "",
    getCrtDistortion() ? "retro-effect-crt" : "",
  ].filter(Boolean).join(" ")
  const dialogs = <>
    <InternetArchivePopup
      driveIndex={diskLoadDialog?.driveIndex ?? 0}
      open={diskLoadDialog?.type === "internetArchive"}
      onClose={() => setDiskLoadDialog(null)}
    />
    <DemoZooDialog
      driveIndex={diskLoadDialog?.driveIndex ?? 0}
      open={diskLoadDialog?.type === "demoZoo"}
      onClose={() => setDiskLoadDialog(null)}
    />
  </>
  return { dialogs, effects, language, rootMenu, t }
}