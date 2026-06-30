import { COLOR_MODE, UI_THEME } from "../common/utility"
import { handleGetMachineName } from "./main2worker"

const uiState: UIState = {
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
  reverseYAxis: false,
  showScanlines: false,
  siriusJoyport: false,
  tabView: 0,
  theme: UI_THEME.CLASSIC,
  tiltSensorJoystick: false,
  touchJoystickMode: "off",
  touchJoystickSensitivity: 2,
  useOpenAppleKey: false,
}

export const getUIState = () => {
  return {...uiState}
}

export const setUIState = (state: UIState) => {
  uiState.appMode = state?.appMode ?? ""
  uiState.arrowKeysAsJoystick = state?.arrowKeysAsJoystick ?? false
  uiState.lowercaseMode = state?.lowercaseMode ?? false
  uiState.colorMode = state?.colorMode ?? COLOR_MODE.COLOR
  uiState.crtDistortion = state?.crtDistortion ?? false
  uiState.helpText = state?.helpText ?? ""
  uiState.hotReload = state?.hotReload ?? false
  uiState.showScanlines = state?.showScanlines ?? false
  uiState.theme = state?.theme ?? UI_THEME.CLASSIC
  uiState.touchJoystickMode = state?.touchJoystickMode ?? "off"
  uiState.touchJoystickSensitivity = state?.touchJoystickSensitivity ?? 2
  uiState.useOpenAppleKey = state?.useOpenAppleKey ?? false
}

//------------------------------------------------------

export type BooleanKeyOf<T> = {
  [K in keyof T]: T[K] extends boolean ? K : never
}[keyof T]

export const setArrowKeysAsJoystick = (joystick: boolean) => {
  uiState.arrowKeysAsJoystick = joystick
}

export const setUIStateBoolean = (key: BooleanKeyOf<UIState>, value: boolean) => {
  uiState[key] = value
}

export const setAppMode = (mode: string) => {
  uiState.appMode = mode
}

export const setColorMode = (mode: COLOR_MODE) => {
  uiState.colorMode = mode
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

export const setTouchJoystickMode = (mode: TOUCH_JOYSTICK_MODE) => {
  uiState.touchJoystickMode = mode
}

export const setTouchJoystickSensitivity = (sensitivity: number) => {
  uiState.touchJoystickSensitivity = sensitivity
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

export const getShowScanlines = () => {
  return uiState.showScanlines
}

export const getTabView = () => {
  return uiState.tabView
}

export const getTouchJoyStickMode = () => {
  return uiState.touchJoystickMode
}

export const getTheme = () => {
  return uiState.theme
}

export const isMinimalTheme = () => {
  return (uiState.theme == UI_THEME.MINIMAL && !isGameMode()) || isEmbedMode()
}

export const getTiltSensorJoystick = () => {
  return uiState.tiltSensorJoystick
}

export const getTouchJoystickSensitivity = () => {
  return uiState.touchJoystickSensitivity
}

export const getUseOpenAppleKey = () => {
  return uiState.useOpenAppleKey
}

