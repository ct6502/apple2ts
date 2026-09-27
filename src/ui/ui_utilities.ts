import { UI_THEME } from "../common/utility"
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