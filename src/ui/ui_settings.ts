import { COLOR_MODE, UI_THEME } from "../common/utility"

const uiState: UIState = {
  arrowKeysAsJoystick: true,
  capsLock: true,
  colorMode: COLOR_MODE.COLOR,
  helpText: "",
  hotReload: false,
  showScanlines: false,
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
  uiState.arrowKeysAsJoystick = state?.arrowKeysAsJoystick ?? false
  uiState.capsLock = state?.capsLock ?? false
  uiState.colorMode = state?.colorMode ?? COLOR_MODE.COLOR
  uiState.helpText = state?.helpText ?? ""
  uiState.hotReload = state?.hotReload ?? false
  uiState.showScanlines = state?.showScanlines ?? false
  uiState.theme = state?.theme ?? UI_THEME.CLASSIC
  uiState.touchJoystickMode = state?.touchJoystickMode ?? "off"
  uiState.touchJoystickSensitivity = state?.touchJoystickSensitivity ?? 2
  uiState.useOpenAppleKey = state?.useOpenAppleKey ?? false
}

//------------------------------------------------------

export const setArrowKeysAsJoystick = (joystick: boolean) => {
  uiState.arrowKeysAsJoystick = joystick
}

export const setCapsLock = (lock: boolean) => {
  uiState.capsLock = lock
}

export const setColorMode = (mode: COLOR_MODE) => {
  uiState.colorMode = mode
}

export const setHelpText = (helptext: string) => {
  uiState.helpText = helptext
}

export const setHotReload = (mode: boolean) => {
  uiState.hotReload = mode
}

export const setShowScanlines = (mode: boolean) => {
  uiState.showScanlines = mode
}

export const setTheme = (theme: UI_THEME) => {
  uiState.theme = theme
}

export const setTiltSensorJoystick = (mode: boolean) => {
  uiState.tiltSensorJoystick = mode
}

export const setTouchJoystickMode = (mode: TOUCH_JOYSTICK_MODE) => {
  uiState.touchJoystickMode = mode
}

export const setTouchJoystickSensitivity = (sensitivity: number) => {
  uiState.touchJoystickSensitivity = sensitivity
}

export const setUseOpenAppleKey = (openApple: boolean) => {
  uiState.useOpenAppleKey = openApple
}

//------------------------------------------------------

export const getArrowKeysAsJoystick = () => {
  return uiState.arrowKeysAsJoystick
}

export const getCapsLock = () => {
  return uiState.capsLock
}

export const getColorMode = () => {
  return uiState.colorMode
}

export const getHelpText = () => {
  return uiState.helpText
}

export const getHotReload = () => {
  return uiState.hotReload
}

export const getShowScanlines = () => {
  return uiState.showScanlines
}

export const getTouchJoyStickMode = () => {
  return uiState.touchJoystickMode
}

export const getTheme = () => {
  return uiState.theme
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

