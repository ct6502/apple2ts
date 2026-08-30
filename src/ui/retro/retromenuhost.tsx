import { useEffect, useState } from "react"
import { useTranslation } from "../../i18n/useTranslation"
import DemoZooDialog from "../devices/disk/demozoodialog"
import InternetArchivePopup from "../devices/disk/internetarchivedialog"
import {
  getPreferenceRetroIIGSColor,
  getPreferenceRetroSkin,
  PREFERENCES_RESET_EVENT,
  type RETRO_IIGS_COLOR_PREFERENCE,
  RETRO_SKIN,
  setPreferenceRetroIIGSColor,
  setPreferenceRetroSkin,
} from "../localstorage"
import { getColorMode, getGhosting, getShowScanlines, getTheme, isMinimalTheme } from "../ui_settings"
import { retroMenuRegistry } from "./retromenucomposition"
import type { DiskLoadDialog, RetroMenuContext } from "./retromenucontext"
import { useGlobalContext } from "../globalcontext"
import { RETRO_IIGS_COLORS } from "./retroskincolors"
import ImageWriter from "../devices/printer/imagewriter"
import { getDiskCollection } from "../diskdialog/diskpanel_utils"
import { DISK_BOOKMARKS_CHANGED_EVENT, DiskBookmarks } from "../devices/disk/diskbookmarks"
import { newReleases } from "../devices/disk/newreleases"

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
  const [diskBookmarks] = useState(() => new DiskBookmarks())
  const [diskCollection, setDiskCollection] = useState(() => getDiskCollection(diskBookmarks, newReleases))
  const [authRefresh, setAuthRefresh] = useState(0)
  const [activeVtocCheckKey, setActiveVtocCheckKey] = useState<string | null>(null)
  const [retroSkin, setRetroSkin] = useState(getPreferenceRetroSkin)
  const [retroIIGSColors, setRetroIIGSColors] = useState(() => ({
    text: getPreferenceRetroIIGSColor("text"),
    background: getPreferenceRetroIIGSColor("background"),
    border: getPreferenceRetroIIGSColor("border"),
  }))
  const showScanlines = getShowScanlines()
  const ghosting = getGhosting()
  useEffect(() => {
    const handleBookmarksChanged = () => {
      diskBookmarks.reload()
      setDiskCollection(getDiskCollection(diskBookmarks, newReleases))
    }
    window.addEventListener(DISK_BOOKMARKS_CHANGED_EVENT, handleBookmarksChanged)
    return () => window.removeEventListener(DISK_BOOKMARKS_CHANGED_EVENT, handleBookmarksChanged)
  }, [diskBookmarks])
  useEffect(() => {
    const handlePreferencesReset = () => {
      setRetroSkin(getPreferenceRetroSkin())
      setRetroIIGSColors({
        text: getPreferenceRetroIIGSColor("text"),
        background: getPreferenceRetroIIGSColor("background"),
        border: getPreferenceRetroIIGSColor("border"),
      })
    }
    window.addEventListener(PREFERENCES_RESET_EVENT, handlePreferencesReset)
    return () => window.removeEventListener(PREFERENCES_RESET_EVENT, handlePreferencesReset)
  }, [])
  useEffect(() => {
    const surround = retroSkin === RETRO_SKIN.APPLE_IIGS
      ? RETRO_IIGS_COLORS[retroIIGSColors.border].css
      : "#000000"
    document.body.style.setProperty("--canvas-surround", surround)
    document.body.classList.toggle("iigs-skin-active", retroSkin === RETRO_SKIN.APPLE_IIGS)
    document.body.classList.toggle("iigs-minimal-surround",
      retroSkin === RETRO_SKIN.APPLE_IIGS && isMinimalTheme())
    document.body.classList.toggle("iigs-minimal-scanlines",
      retroSkin === RETRO_SKIN.APPLE_IIGS && isMinimalTheme() && showScanlines)
    document.body.classList.toggle("iigs-minimal-ghosting",
      retroSkin === RETRO_SKIN.APPLE_IIGS && isMinimalTheme() && ghosting)
    return () => {
      document.body.style.removeProperty("--canvas-surround")
      document.body.classList.remove(
        "iigs-skin-active",
        "iigs-minimal-surround",
        "iigs-minimal-scanlines",
        "iigs-minimal-ghosting",
      )
    }
  }, [ghosting, retroIIGSColors.border, retroSkin, showScanlines])
  const openDiskDialog = (dialog: DiskLoadDialog) => {
    setDiskLoadDialog(dialog)
  }
  const handleDiskLoadSuccess = () => {
    setDiskLoadDialog(null)
    close()
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
    settingsOrigin: "retro",
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
    diskCollection,
    diskBookmarks,
    notifyCloudAuthChanged: () => setAuthRefresh(refresh => refresh + 1),
    startTour: tour => {
      setReturnToTourHelp(false)
      setTourSourceTheme(getTheme())
      close()
      setRunTour(tour)
      setTourIndex(0)
    },
  }
  const rootMenu = retroMenuRegistry.resolve(context)
  const resolveMenu = (parentId: string) => retroMenuRegistry.resolve(context, parentId)
  const panelClasses = [
    `retro-color-${colorModeClasses[getColorMode()]}`,
    `retro-skin-${retroSkinClasses[retroSkin]}`,
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
      onLoadSuccess={handleDiskLoadSuccess}
    />
    <DemoZooDialog
      driveIndex={diskLoadDialog?.driveIndex ?? 0}
      open={diskLoadDialog?.type === "demoZoo"}
      onClose={() => setDiskLoadDialog(null)}
      onLoadSuccess={handleDiskLoadSuccess}
    />
  </>
  return {
    activeVtocCheckKey,
    authRefresh,
    dialogs,
    diskBookmarks,
    diskCollection,
    panelClasses,
    hasOpenDialog: diskLoadDialog !== null,
    iigsStyle,
    language,
    retroSkin,
    retroIIGSColors,
    resolveMenu,
    returnToTourHelp,
    rootMenu,
    runTour,
    setActiveVtocCheckKey,
    setDiskCollection,
    setReturnToTourHelp,
    t,
    tourIndex,
  }
}