import { COLOR_MODE, MONITOR_MODE, UI_THEME } from "../common/utility"
import { t } from "../i18n"
import { getPreferenceRetroSkin, RETRO_SKIN } from "./localstorage"
import { isMinimalTheme } from "./ui_settings"
import { Color, Palette } from "viridis"
import type { PaletteName } from "viridis"

export const handleSetTheme = (theme: UI_THEME) => {
  if (theme == UI_THEME.DARK || theme == UI_THEME.MINIMAL) {
    document.body.classList.add("dark-mode")
  } else {
    document.body.classList.remove("dark-mode")
  }
}

export const isFileSystemApiSupported = () => {
  return "showOpenFilePicker" in window && "showSaveFilePicker" in window
}

export const showGlobalProgressModal = (show: boolean = true, message: string = "") => {
  const messageElement = document.getElementsByClassName("global-progress-message")[0] as HTMLElement

  if (messageElement) {
    messageElement.innerText = show && message ? message : ""
  }

  document.body.style.setProperty("--global-progress-visibility", show ? "visible" : "hidden")
}

export const toggleScanlines = (enabled: boolean) => {
  // I wish we didn't have to have two scanline css blocks, but in the minimal theme,
  // the IIGS skin extends outide of the regular canvas.
  const useIIGSscanlines = getPreferenceRetroSkin() === RETRO_SKIN.APPLE_IIGS && isMinimalTheme()
  document.body.style.setProperty("--iigs-scanlines-display", (enabled && useIIGSscanlines) ? "block" : "none")
  document.body.style.setProperty("--scanlines-display", (enabled && !useIIGSscanlines) ? "block" : "none")
}

// Color tables offered by the heat map picker. The order drives the picker menu.
export const HEATMAP_PALETTES = ["Spectral", "Plasma", "Sunset", "Warm", "Cool", "Parula", "Viridis", "Grayscale"] as const

export const getViridisColorsRGB = (colorTable: PaletteName, count: number): [number, number, number][] => {
  const gradient = Palette[colorTable]
  const rgbColors: [number, number, number][] = []
  // Sample 'count' points evenly distributed between 1/count and 1
  for (let i = 0; i < count; i++) {
    const ratio = 1 - i / count
    const colorObj: Color = gradient.getColor(ratio)
    rgbColors.push([colorObj.red, colorObj.green, colorObj.blue])
  }
  return rgbColors
}

export const getHeatMapRGBValues = (heatMapValue: number, heatMapMax: number,
  colorTable: [number, number, number][]) => {
  const logHeatMax = Math.log10(Math.max(1, 0.9 * heatMapMax))
  const logscale = Math.log10(Math.max(1, heatMapValue)) / logHeatMax
  // Math.log10(1) is exactly 0, so a cell touched exactly once always
  // computed value === -1 here, same as a cell never touched at all --
  // e.g. code copied into place by a single denibblizing pass and never
  // rewritten was indistinguishable from memory nothing ever wrote to.
  // Floor any actually-touched cell at bucket 0 instead of letting it
  // fall through.
  const value = heatMapValue > 0 ? Math.max(0, Math.floor(16 * logscale) - 1) : -1
  if (value >= 0) {
    const [r, g, b] = colorTable[value]
    return [r, g, b, 255]
  } else {
    return [0, 0, 0, 255]
  }
}

export const linearizeColor = (val: number) => {
  const value = val / 255
  return value <= 0.04045
    ? value / 12.92
    : ((value + 0.055) / 1.055) ** 2.4
}

let dialogMessageContext: DialogMessageContext = {
  title: "",
  message: "",
  code: 0,
  actionCancel: () => {},
  actionConfirm: () => {},
}

export const clearDialogMessageContext = () => {
  dialogMessageContext = {
    title: "",
    message: "",
    code: 0,
    actionCancel: () => {},
    actionConfirm: () => {},
  }
}

export const hasDialogMessageContext = () => {
  return dialogMessageContext.message !== ""
}

export const getDialogMessageContext = () => {
  return dialogMessageContext
}

export const setDialogMessageContext = (context: DialogMessageContext) => {
  dialogMessageContext = context
}

// Short display labels for cards in the Link Builder slot dropdowns
export const cardShortLabels: Record<SLOT_CARD_ID, string> = {
    none: t("linkBuilder.slots.cardNone"),
    ssc: "Super Serial Card",
    softcard: "SoftCard (Z80)",
    aux: "Aux/80Col",
    videoterm: "VideoTerm",
    vidhd: "VidHD",
    mockingboard: "Mockingboard",
    mouse: "Mouse",
    vera: "VERA",
    passport: "Passport",
    disk2: "Disk II",
    smartport: "SmartPort",
  }

export const ramdiskValues = [
      t("linkBuilder.ramDiskSizes.default"),
      t("linkBuilder.ramDiskSizes.512"),
      t("linkBuilder.ramDiskSizes.1024"),
      t("linkBuilder.ramDiskSizes.4096"),
      t("linkBuilder.ramDiskSizes.8192")
    ]
export const ramdiskParams = ["64", "512", "1024", "4096", "8192"]

export const COLOR_MODES = Object.values(COLOR_MODE).filter(
  (value): value is COLOR_MODE => typeof value === "number",
)

export const colorLabels = (t: (key: string) => string) => [
  t("retroControl.color"),
  t("retroControl.colorNoFringe"),
  t("retroControl.green"),
  t("retroControl.amber"),
  t("retroControl.white"),
  t("retroControl.inverse"),
]

export const MONITOR_MODES = Object.values(MONITOR_MODE).filter(
  (value): value is MONITOR_MODE => typeof value === "number",
)

export const monitorModeLabels = (t: (key: string) => string) => [
  t("retroControl.monitorModeChoice.ntsc"),
  t("retroControl.monitorModeChoice.rgb"),
]

export const themeLabels = (t: (key: string) => string) => [
  t("themes.classic"),
  t("themes.dark"),
  t("themes.minimal"),
]
