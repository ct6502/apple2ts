import { COLOR_MODE, MONITOR_MODE, UI_THEME } from "../common/utility"
import { handleGetMachineName } from "./main2worker"

export const INFO_PANEL_COLLAPSED_EVENT = "apple2ts-info-panel-collapsed"
export const DISK_LOAD_SUCCESS_EVENT = "apple2ts-disk-load-success"

// Unmodifiable initial UI state
const initialUIState: Readonly<UIState> = Object.freeze({
  appMode: "",
  arrowKeysAsJoystick: true,
  manualNumbering: true,
  capitalizeBasic: true,
  lowercaseMode: false,
  colorMode: COLOR_MODE.COLOR,
  crtDistortion: false,
  debugMode: false,
  ghosting: false,
  helpText: "",
  hotReload: false,
  infoPanel: false,
  monitorMode: MONITOR_MODE.NTSC,
  reverseYAxis: false,
  showScanlines: false,
  siriusJoyport: false,
  tabView: 0,
  theme: UI_THEME.CLASSIC,
  tiltSensorJoystick: false,
  touchJoystick: true,
  useOpenAppleKey: false,
})

// This is the copy that gets modified during runtime
const uiState: UIState = { ...initialUIState }

export const getUIState = () => {
  return {...uiState}
}

// Auto generate the list of boolean keys
export const initialBooleanUIKeys: BooleanKeyOf<UIState>[] = Object.keys(initialUIState).filter(key =>
  typeof initialUIState[key as keyof UIState] === "boolean"
) as BooleanKeyOf<UIState>[]

// Auto generate the list of "initial true" boolean keys
export const isDefaultTrueBooleanKey = (key: string) => {
  return Object.prototype.hasOwnProperty.call(initialUIState, key) &&
    initialUIState[key as keyof UIState] === true
}

export const setUIState = (state: Partial<UIState> = {}) => {
  for (const key of Object.keys(uiState) as Array<keyof UIState>) {
    if (key in state) {
      Object.assign(uiState, { [key]: state[key] })
    }
  }
}

//------------------------------------------------------

export type BooleanKeyOf<T> = {
  [K in keyof T]: T[K] extends boolean ? K : never
}[keyof T]

export const setUIStateBoolean = (key: BooleanKeyOf<UIState>, value: boolean) => {
  uiState[key] = value
}

export const getUIStateBoolean = (key: BooleanKeyOf<UIState>) => {
  return uiState[key]
}

export const setAppMode = (mode: string) => {
  uiState.appMode = mode
}

export const setColorMode = (mode: COLOR_MODE) => {
  uiState.colorMode = mode
}

export const setMonitorMode = (mode: MONITOR_MODE) => {
  uiState.monitorMode = mode
}

export const setHelpText = (helptext: string) => {
  uiState.helpText = helptext
}

export const setTabView = (tabView: number) => {
  uiState.tabView = tabView
}

export const setTheme = (theme: UI_THEME) => {
  uiState.theme = theme
}

//------------------------------------------------------

export const isEmbedMode = () => {
  return uiState.appMode === "embed"
}

export const isGameMode = () => {
  return uiState.appMode === "game"
}

export const getArrowKeysAsJoystick = () => {
  return uiState.arrowKeysAsJoystick
}

export const handleGetManualNumbering = () => {
  return uiState.manualNumbering
}

export const handleGetCapitalizeBasic = () => {
  return uiState.capitalizeBasic
}

export const getLowercaseMode = () => {
  return uiState.lowercaseMode && (handleGetMachineName() !== "APPLE2P")
}

export const getColorMode = () => {
  return uiState.colorMode
}

export const getMonitorMode = () => {
  return uiState.monitorMode
}

export const getCrtDistortion = () => {
  return uiState.crtDistortion
}

export const getGhosting = () => {
  return uiState.ghosting
}

export const getHelpText = () => {
  return uiState.helpText
}

export const getHotReload = () => {
  return uiState.hotReload || isGameMode()
}

export const getInfoPanel = () => {
  return uiState.infoPanel
}

export const getShowScanlines = () => {
  return uiState.showScanlines
}

export const getTabView = () => {
  return uiState.tabView
}

export const getTheme = () => {
  return uiState.theme
}

export const isMinimalTheme = () => {
  return (uiState.theme == UI_THEME.MINIMAL && !isGameMode()) || isEmbedMode()
}
export const isCanvasOnlyTheme = () => {
  return isMinimalTheme()
}
