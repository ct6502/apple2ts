import { BreakpointMap, BreakpointNew } from "../common/breakpoint"
import { TraceSettingsDefault } from "../common/util_disassemble"
import { COLOR_MODE, DEFAULT_SLOT_CONFIG, UI_THEME } from "../common/utility"
import { changeMockingboardMode } from "./devices/audio/mockingboard_audio"
import { passBreakpoints, passReverseYAxis, passSetMachineName, passSetProdosFloppy, passSetRamWorks, passSetShowDebugTab, passSetSlotConfig, passSetTraceSettings, passSetVeraSlot, passSiriusJoyport, passSpeedMode, } from "./main2worker"
import { getTheme, getUIState, setColorMode, setTheme, setTouchJoystickMode, setTouchJoystickSensitivity, setUIStateBoolean, BooleanKeyOf } from "./ui_settings"

const booleanUIKeys: BooleanKeyOf<UIState>[] = ["arrowKeysAsJoystick",
  "capitalizeBasic", "crtDistortion",
  "debugMode", "ghosting", "hotReload", "lowercaseMode",
  "manualNumbering", "prodosFloppy",
  "reverseYAxis", "showScanlines", "siriusJoyport",
  "tiltSensorJoystick", "useOpenAppleKey"]

export enum RETRO_SKIN {
  APPLE_IIE,
  APPLE_IIGS,
  APPLE_IIPLUS,
}

export type RETRO_IIGS_COLOR_PREFERENCE = "text" | "background" | "border"

export const RETRO_IIGS_COLOR_DEFAULTS: Record<RETRO_IIGS_COLOR_PREFERENCE, number> = {
  text: 15,
  background: 6,
  border: 6,
}

export const getPreferenceRetroIIGSColor = (preference: RETRO_IIGS_COLOR_PREFERENCE) => {
  const key = `retroIIGS.${preference}`
  const item = localStorage.getItem(key)
  if (item) {
    try {
      const color = JSON.parse(item)
      if (Number.isInteger(color) && color >= 0 && color <= 15) return color
    } catch {
      // Invalid data is cleared below.
    }
    localStorage.removeItem(key)
  }
  return RETRO_IIGS_COLOR_DEFAULTS[preference]
}

export const setPreferenceRetroIIGSColor = (
  preference: RETRO_IIGS_COLOR_PREFERENCE,
  color: number = RETRO_IIGS_COLOR_DEFAULTS[preference],
) => {
  const key = `retroIIGS.${preference}`
  if (color === RETRO_IIGS_COLOR_DEFAULTS[preference]) {
    localStorage.removeItem(key)
  } else {
    localStorage.setItem(key, JSON.stringify(color))
  }
}

export const getPreferenceRetroSkin = (): RETRO_SKIN => {
  const item = localStorage.getItem("retroSkin")
  if (item) {
    try {
      const skin = JSON.parse(item)
      if (skin === RETRO_SKIN.APPLE_IIGS || skin === RETRO_SKIN.APPLE_IIPLUS) return skin
    } catch {
      // Invalid data is cleared below.
    }
    localStorage.removeItem("retroSkin")
  }
  return RETRO_SKIN.APPLE_IIE
}

export const setPreferenceRetroSkin = (skin: RETRO_SKIN = RETRO_SKIN.APPLE_IIE) => {
  if (skin === RETRO_SKIN.APPLE_IIE) {
    localStorage.removeItem("retroSkin")
  } else {
    localStorage.setItem("retroSkin", JSON.stringify(skin))
  }
}

type BooleanKeys = typeof booleanUIKeys[number]

export const setPreferenceBoolean = (key: BooleanKeys, value: boolean) => {
  if (value) {
    localStorage.setItem(key, JSON.stringify(value))
  } else {
    localStorage.removeItem(key)
  }
  setUIStateBoolean(key as BooleanKeyOf<UIState>, value)
}

export const getPreferenceBoolean = (key: BooleanKeys): boolean => {
  const item = localStorage.getItem(key)
  if (item) {
    try {
      return JSON.parse(item)
    } catch {
      localStorage.removeItem(key)
    }
  }
  return false
}

export const setPreferenceBasicProgram = (program: string | null) => {
  if (program === null || program === "") {
    localStorage.removeItem("basicProgram")
  } else {
    localStorage.setItem("basicProgram", program)
  }
}

export const getPreferenceBasicProgram = (): string | null => {
  return localStorage.getItem("basicProgram")
}

export const setPreferenceColorMode = (mode: COLOR_MODE = COLOR_MODE.COLOR) => {
  if (mode === COLOR_MODE.COLOR) {
    localStorage.removeItem("colorMode")
  } else {
    localStorage.setItem("colorMode", JSON.stringify(mode))
  }
  setColorMode(mode)
}

export const setPreferenceTheme = (theme: UI_THEME = UI_THEME.CLASSIC) => {
  if (theme !== getTheme()) {
    setUIStateBoolean("infoPanel", false)
  }
  if (theme === UI_THEME.CLASSIC) {
    localStorage.removeItem("theme")
  } else {
    localStorage.setItem("theme", JSON.stringify(theme))
  }
  setTheme(theme)
}

export const setPreferenceBreakpoints = (breakpoints: BreakpointMap) => {
  if (breakpoints.size === 0) {
    localStorage.removeItem("breakpoints")
  } else {
    localStorage.setItem("breakpoints", JSON.stringify([...breakpoints]))
  }
  passBreakpoints(breakpoints)
}

export const setPreferenceMachineName = (name: MACHINE_NAME = "APPLE2EE") => {
  if (name === "APPLE2EE") {
    localStorage.removeItem("machineName")
  } else {
    localStorage.setItem("machineName", JSON.stringify(name))
  }
  passSetMachineName(name)

  const slotConfig = getPreferenceSlotConfig()
  let newSlot3 = slotConfig[3]
  if (name === "APPLE2P") {
    if (newSlot3 !== "none" && newSlot3 !== "videoterm") newSlot3 = "videoterm"
  } else {
    if (newSlot3 !== "none" && newSlot3 !== "aux") newSlot3 = "aux"
  }
  if (slotConfig[3] !== newSlot3) {
    slotConfig[3] = newSlot3
    setPreferenceSlotConfig(slotConfig)
  }
}

export const setPreferenceMockingboardMode = (mode = 0) => {
  if (mode === 0) {
    localStorage.removeItem("mockingboardMode")
  } else {
    localStorage.setItem("mockingboardMode", JSON.stringify(mode))
  }
  changeMockingboardMode(mode)
}

export const setPreferenceRamWorks = (size = 64) => {
  if (size === 64) {
    localStorage.removeItem("ramWorks")
  } else {
    localStorage.setItem("ramWorks", JSON.stringify(size))
  }
  passSetRamWorks(size)
}

const isVeraSlot = (slot: number): slot is VERA_SLOT => {
  return slot === 0 || slot === 2 || slot === 4
}

export const getPreferenceVeraSlot = (): VERA_SLOT => {
  const veraSlot = localStorage.getItem("veraSlot")
  if (veraSlot) {
    try {
      const slot = JSON.parse(veraSlot)
      if (isVeraSlot(slot)) return slot
    } catch {
      // Invalid data is cleared below.
    }
    localStorage.removeItem("veraSlot")
  }
  return 0
}

export const setPreferenceVeraSlot = (slot: VERA_SLOT = 0) => {
  if (slot === 0) {
    localStorage.removeItem("veraSlot")
  } else {
    localStorage.setItem("veraSlot", JSON.stringify(slot))
  }
  passSetVeraSlot(slot)
}

export const getPreferenceSlotConfig = (): SlotConfig => {
  const saved = localStorage.getItem("slotConfig")
  if (saved) {
    try {
      const parsed = JSON.parse(saved)
      if (parsed && typeof parsed === "object" && parsed[1] && parsed[7]) {
        return parsed as SlotConfig
      }
    } catch {
      // Clear invalid slotConfig
    }
    localStorage.removeItem("slotConfig")
  }
  return { ...DEFAULT_SLOT_CONFIG }
}

export const setPreferenceSlotConfig = (config: SlotConfig) => {
  localStorage.setItem("slotConfig", JSON.stringify(config))
  passSetSlotConfig(config)
}

export const setPreferenceSpeedMode = (mode = 0) => {
  if (mode === 0) {
    localStorage.removeItem("speedMode")
  } else {
    localStorage.setItem("speedMode", JSON.stringify(mode))
  }
  passSpeedMode(mode)
}

export const setPreferenceNewReleasesChecked = (lastChecked = -1) => {
  if (lastChecked == -1) {
    localStorage.removeItem("newReleasesChecked")
  } else {
    localStorage.setItem("newReleasesChecked", JSON.stringify(lastChecked))
  }
  // UI-only setting, pass along not necessary
}

export type DiskCollectionSortMode = "name-asc" | "name-desc" | "date-newest" | "date-oldest"

export const getPreferenceDiskCollectionSort = (tabIndex: number): DiskCollectionSortMode | undefined => {
  const item = localStorage.getItem(`diskCollectionSort.${tabIndex}`)
  if (!item) {
    return undefined
  }

  try {
    const value = JSON.parse(item)
    if (value === "name-asc" || value === "name-desc" || value === "date-newest" || value === "date-oldest") {
      return value
    }
  } catch {
    // Invalid data is treated as unset and falls back to per-tab default.
  }

  localStorage.removeItem(`diskCollectionSort.${tabIndex}`)
  return undefined
}

export const setPreferenceDiskCollectionSort = (tabIndex: number, mode: DiskCollectionSortMode) => {
  localStorage.setItem(`diskCollectionSort.${tabIndex}`, JSON.stringify(mode))
}

export const setPreferenceTouchJoystickMode = (mode: TOUCH_JOYSTICK_MODE = "off") => {
  if (mode === "off") {
    localStorage.removeItem("touchJoystickMode")
  } else {
    localStorage.setItem("touchJoystickMode", JSON.stringify(mode))
  }
  setTouchJoystickMode(mode)
}

export const setPreferenceTouchJoystickSensitivity = (sensitivity: number = 2) => {
  if (sensitivity == 2) {
    localStorage.removeItem("touchJoystickSensitivity")
  } else {
    localStorage.setItem("touchJoystickSensitivity", JSON.stringify(sensitivity))
  }
  setTouchJoystickSensitivity(sensitivity)
}

export const setPreferenceTraceSettings = (traceSettings: TraceSettings =
  TraceSettingsDefault) => {
  const { numLines, collapseLoops, ignoreRegisters } = traceSettings
  if (numLines === TraceSettingsDefault.numLines) {
    localStorage.removeItem("traceNumLines")
  } else {
    localStorage.setItem("traceNumLines", JSON.stringify(numLines))
  }
  if (collapseLoops === TraceSettingsDefault.collapseLoops) {
    localStorage.removeItem("traceCollapseLoops")
  } else {
    localStorage.setItem("traceCollapseLoops", JSON.stringify(collapseLoops))
  }
  if (ignoreRegisters === TraceSettingsDefault.ignoreRegisters) {
    localStorage.removeItem("traceIgnoreRegisters")
  } else {
    localStorage.setItem("traceIgnoreRegisters", JSON.stringify(ignoreRegisters))
  }
  passSetTraceSettings({numLines, collapseLoops, ignoreRegisters})
}

export const setPreferenceDebugTabLeftWidth = (width: number) => {
  if (width === -1) {
    localStorage.removeItem("debugTabLeftWidth")
  } else {
    localStorage.setItem("debugTabLeftWidth", JSON.stringify(width))
  }
}

export const setPreferencePrinterDialogPosition = (position: { x: number, y: number }) => {
  if (position.x === -1 && position.y === -1) {
    localStorage.removeItem("printerDialogPosition")
  } else {
    localStorage.setItem("printerDialogPosition", JSON.stringify(position))
  }
}

export const setPreferencePageLength = (pageLength: number) => {
  if (pageLength === -1) {
    localStorage.removeItem("pageLength")
  } else {
    localStorage.setItem("pageLength", JSON.stringify(pageLength))
  }
}

const gameDataDrive = "GAME_DATA-DRIVE"
const gameDataData = "GAME_DATA-DATA"

export const hasDiskImageInLocalStorage = () => {
  return localStorage.getItem(gameDataDrive) !== null
}

export const getDiskImageFromLocalStorage = () => {
  const driveIndex = localStorage.getItem(gameDataDrive)
  if (driveIndex) {
    const diskImage = localStorage.getItem(gameDataData)
    if (diskImage) {
      const binary = atob(diskImage)
      const data = new Uint8Array(binary.split("").map(char => char.charCodeAt(0)))
      return {index: parseInt(driveIndex), data: data}
    }
  }
  return null
}

export const setDiskImageToLocalStorage = (index: number, data: Uint8Array | null) => {
  if (data) {
    let binary = ""
    for (let i = 0; i < data.length; i++) {
      binary += String.fromCharCode(data[i])
    }
    const diskImage = btoa(binary)
    localStorage.setItem(gameDataDrive, index.toString())
    localStorage.setItem(gameDataData, diskImage)
  } else {
    localStorage.removeItem(gameDataDrive)
    localStorage.removeItem(gameDataData)
  }
}

export const loadPreferences = () => {
  const breakpoints = localStorage.getItem("breakpoints")
  if (breakpoints) {
    try {
      const parsed = JSON.parse(breakpoints)
      // Migrate old breakpoints to include additional fields
      const migratedBreakpoints = parsed.map(([address, oldBreakpoint]: [number, unknown]) => {
        // Start with a new breakpoint that has all current fields with defaults
        const newBreakpoint = BreakpointNew()
        // Copy over any fields that exist in the stored data
        Object.assign(newBreakpoint, oldBreakpoint)
        // Skip hidden breakpoints
        if (newBreakpoint.hidden) return null
        return [address, newBreakpoint]
      })
      const breakpointMap = new BreakpointMap(migratedBreakpoints)
      passBreakpoints(breakpointMap)
    } catch {
      localStorage.removeItem("breakpoints")
    }
  }

  booleanUIKeys.forEach(key => {
    const item = localStorage.getItem(key)
    if (item) {
      try {
        setUIStateBoolean(key, JSON.parse(item))
      } catch {
        localStorage.removeItem(key)
      }
    }
  })

  // Extra processing for certain boolean prefs
  if (getUIState().debugMode) {
    passSetShowDebugTab(true)
  }
  if (getUIState().prodosFloppy) {
    passSetProdosFloppy(true)
  }
  if (getUIState().reverseYAxis) {
    passReverseYAxis(true)
  }
  if (getUIState().siriusJoyport) {
    passSiriusJoyport(true)
  }

  const colorMode = localStorage.getItem("colorMode")
  if (colorMode) {
    try {
      setColorMode(JSON.parse(colorMode))
    } catch {
      localStorage.removeItem("colorMode")
    }
  }

  // Keep for backwards-compatibility
  const darkMode = localStorage.getItem("darkMode")
  if (darkMode) {
    try {
      if (JSON.parse(darkMode)) {
        setTheme(UI_THEME.DARK)
      }
    } catch {
      localStorage.removeItem("darkMode")
    }
    localStorage.removeItem("darkMode")
  }

  const theme = localStorage.getItem("theme")
  if (theme) {
    try {
      setTheme(JSON.parse(theme))
    } catch {
      localStorage.removeItem("theme")
    }
  }

  const speedMode = localStorage.getItem("speedMode")
  if (speedMode) {
    try {
      passSpeedMode(JSON.parse(speedMode))
    } catch {
      localStorage.removeItem("speedMode")
    }
  }

  const machineName = localStorage.getItem("machineName")
  if (machineName) {
    try {
      passSetMachineName(JSON.parse(machineName))
    } catch {
      localStorage.removeItem("machineName")
    }
  }

  const mockingboardMode = localStorage.getItem("mockingboardMode")
  if (mockingboardMode) {
    try {
      changeMockingboardMode(JSON.parse(mockingboardMode))
    } catch {
      localStorage.removeItem("mockingboardMode")
    }
  }

  const ramWorks = localStorage.getItem("ramWorks")
  if (ramWorks) {
    try {
      passSetRamWorks(JSON.parse(ramWorks))
    } catch {
      localStorage.removeItem("ramWorks")
    }
  }

  passSetVeraSlot(getPreferenceVeraSlot())

  const touchJoystickMode = localStorage.getItem("touchJoystickMode")
  if (touchJoystickMode !== "off") {
    try {
      setTouchJoystickMode(JSON.parse(touchJoystickMode || ""))
    } catch {
      localStorage.removeItem("touchJoystickMode")
    }
  }

  const touchJoystickSensitivity = localStorage.getItem("touchJoystickSensitivity")
  if (touchJoystickSensitivity) {
    try {
      setTouchJoystickSensitivity(JSON.parse(touchJoystickSensitivity))
    } catch {
      localStorage.removeItem("touchJoystickSensitivity")
    }
  }

  const traceSettings = getPreferenceTraceSettings()
  if (JSON.stringify(traceSettings) !== JSON.stringify(TraceSettingsDefault)) {
    passSetTraceSettings(traceSettings)
  }
}

export const resetPreferences = () => {
  booleanUIKeys.forEach(key => {
    localStorage.removeItem(key)
    setUIStateBoolean(key, false)
  })
  // Extra processing for certain boolean prefs
  passSetProdosFloppy(false)
  passReverseYAxis(false)
  passSiriusJoyport(false)
  passSetShowDebugTab(false)
  
  setPreferenceSpeedMode()
  setPreferenceColorMode()
  setPreferenceTheme()
  setPreferenceRetroSkin()
  setPreferenceRetroIIGSColor("text")
  setPreferenceRetroIIGSColor("background")
  setPreferenceRetroIIGSColor("border")
  setPreferenceMockingboardMode()
  setPreferenceMachineName()
  setPreferenceRamWorks()
  setPreferenceTouchJoystickMode()
  setPreferenceTouchJoystickSensitivity()
  setPreferenceNewReleasesChecked()
  localStorage.removeItem("binaryRunAddress")
  setPreferenceTraceSettings()
  setPreferenceDebugTabLeftWidth(-1)
  setPreferencePrinterDialogPosition({ x: -1, y: -1 })
  setPreferencePageLength(-1)
}

export const getPreferencePageLength = (): number => {
  let value = 11
  const item = localStorage.getItem("pageLength")
  if (item) {
    try {
      value = JSON.parse(item)
    } catch {
      localStorage.removeItem("pageLength")
    }
  }
  return value
}

export const getPreferenceNewReleasesChecked = () => {
  let value: number = -1

  const item = localStorage.getItem("newReleasesChecked")
  if (item) {
    try {
      value = JSON.parse(item)
    } catch { /* empty */ }
  }

  return value
}

// A disk's VTOC type is determined once from its bytes and cached in local
// storage keyed by the disk URL. When new detection logic is introduced (see
// VTOC_REFRESH in prodos_hdv.ts), entries with a stale or missing version are
// treated as undetermined so they are re-evaluated by the background VTOC pass.
type VtocCacheEntry = { type: VtocType; version: number }
const getVtocTypeCache = (): { [diskUrl: string]: VtocType | VtocCacheEntry } => {
  const item = localStorage.getItem("vtocTypeCache")
  if (item) {
    try {
      return JSON.parse(item)
    } catch { /* empty */ }
  }
  return {}
}

export const getPreferenceVtocType = (diskUrl: string, requiredVersion: number): { type: VtocType; version: number } | undefined => {
  if (!diskUrl) {
    return undefined
  }
  const entry = getVtocTypeCache()[diskUrl]
  if (!entry) return undefined
  // Legacy entries are bare strings (pre-versioned cache).
  if (typeof entry === "string") return undefined
  if (entry.version < requiredVersion) return undefined
  return entry
}

export const setPreferenceVtocType = (diskUrl: string, vtocType: VtocType, version: number) => {
  if (!diskUrl) {
    return
  }
  const cache = getVtocTypeCache()
  cache[diskUrl] = { type: vtocType, version }
  localStorage.setItem("vtocTypeCache", JSON.stringify(cache))
}

// A disk whose VTOC can't be determined because its bytes fail to download
// (CORS/network) is remembered for the current browser session in sessionStorage
// so we don't re-attempt the download on every page reload. Unlike the VTOC type
// cache (which is permanent), these failures intentionally clear when the browser
// session ends, so a temporarily unreachable disk is retried in a new session.
const getVtocFailureSet = (): Set<string> => {
  const item = sessionStorage.getItem("vtocFailedUrls")
  if (item) {
    try {
      return new Set(JSON.parse(item))
    } catch { /* empty */ }
  }
  return new Set()
}

export const hasSessionVtocFailure = (diskUrl: string): boolean => {
  if (!diskUrl) {
    return false
  }
  return getVtocFailureSet().has(diskUrl)
}

export const addSessionVtocFailure = (diskUrl: string) => {
  if (!diskUrl) {
    return
  }
  const failures = getVtocFailureSet()
  failures.add(diskUrl)
  sessionStorage.setItem("vtocFailedUrls", JSON.stringify([...failures]))
}

export const removeSessionVtocFailure = (diskUrl: string) => {
  if (!diskUrl) {
    return
  }
  const failures = getVtocFailureSet()
  if (failures.delete(diskUrl)) {
    sessionStorage.setItem("vtocFailedUrls", JSON.stringify([...failures]))
  }
}

export const getPreferenceDebugTabLeftWidth = (): number => {
  let value = -1
  const item = localStorage.getItem("debugTabLeftWidth")
  if (item) {
    try {
      value = JSON.parse(item)
    } catch {
      localStorage.removeItem("debugTabLeftWidth")
    }
  }
  return value
}

export const getPreferencePrinterDialogPosition = (): { x: number, y: number } => {
  let position = { x: -1, y: -1 }
  const item = localStorage.getItem("printerDialogPosition")
  if (item) {
    try {
      position = JSON.parse(item)
    } catch {
      localStorage.removeItem("printerDialogPosition")
    }
  }
  return position
}

export const getPreferenceTraceSettings = (): TraceSettings => {
  let numLines = TraceSettingsDefault.numLines
  const traceNumLines = localStorage.getItem("traceNumLines")
  if (traceNumLines) {
    try {
      numLines = JSON.parse(traceNumLines)
    } catch {
      localStorage.removeItem("traceNumLines")
    }
  }
  let collapseLoops = TraceSettingsDefault.collapseLoops
  const traceCollapseLoops = localStorage.getItem("traceCollapseLoops")
  if (traceCollapseLoops) {
    try {
      collapseLoops = JSON.parse(traceCollapseLoops)
    } catch {
      localStorage.removeItem("traceCollapseLoops")
    }
  }
  let ignoreRegisters = TraceSettingsDefault.ignoreRegisters
  const traceIgnoreRegisters = localStorage.getItem("traceIgnoreRegisters")
  if (traceIgnoreRegisters) {
    try {
      ignoreRegisters = JSON.parse(traceIgnoreRegisters)
    } catch {
      localStorage.removeItem("traceIgnoreRegisters")
    }
  }

  return { numLines, collapseLoops, ignoreRegisters }
}
