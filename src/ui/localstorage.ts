import { COLOR_MODE, UI_THEME } from "../common/utility"
import { changeMockingboardMode } from "./devices/audio/mockingboard_audio"
import { passCapsLock, passColorMode, passShowScanlines, passTheme, passSetDebug, passSetMachineName, passSetRamWorks, passSpeedMode, passHotReload, passTouchJoystickMode, passTouchJoystickSensitivity } from "./main2worker"

export const setPreferenceCapsLock = (mode = true) => {
  if (mode === true) {
    localStorage.removeItem("capsLock")
  } else {
    localStorage.setItem("capsLock", JSON.stringify(mode))
  }
  passCapsLock(mode)
}

export const setPreferenceColorMode = (mode: COLOR_MODE = COLOR_MODE.COLOR) => {
  if (mode === COLOR_MODE.COLOR) {
    localStorage.removeItem("colorMode")
  } else {
    localStorage.setItem("colorMode", JSON.stringify(mode))
  }
  passColorMode(mode)
}

export const setPreferenceShowScanlines = (mode = true) => {
  if (mode) {
    localStorage.setItem("showScanlines", JSON.stringify(mode))
  } else {
    localStorage.removeItem("showScanlines")
  }
  passShowScanlines(mode)
}

export const setPreferenceTheme = (theme: UI_THEME = UI_THEME.CLASSIC) => {
  if (theme === UI_THEME.CLASSIC) {
    localStorage.removeItem("theme")
  } else {
    localStorage.setItem("theme", JSON.stringify(theme))
  }
  passTheme(theme)
}

export const setPreferenceDebugMode = (mode = false) => {
  if (mode === false) {
    localStorage.removeItem("debugMode")
  } else {
    localStorage.setItem("debugMode", JSON.stringify(mode))
  }
  passSetDebug(mode)
}

export const setPreferenceMachineName = (name: MACHINE_NAME = "APPLE2EE") => {
  if (name === "APPLE2EE") {
    localStorage.removeItem("machineName")
  } else {
    localStorage.setItem("machineName", JSON.stringify(name))
  }
  passSetMachineName(name)
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

export const setPreferenceSpeedMode = (mode = 0) => {
  if (mode === 0) {
    localStorage.removeItem("speedMode")
  } else {
    localStorage.setItem("speedMode", JSON.stringify(mode))
  }
  passSpeedMode(mode)
}

export const setPreferenceHotReload = (mode = false) => {
  if (mode === false) {
    localStorage.removeItem("hotReload")
  } else {
    localStorage.setItem("hotReload", JSON.stringify(mode))
  }
  passHotReload(mode)
}

export const setPreferenceFirstRunMinimal = (mode = true) => {
  if (mode === true) {
    localStorage.removeItem("firstRunMinimal")
  } else {
    localStorage.setItem("firstRunMinimal", JSON.stringify(mode))
  }
  // UI-only setting, pass along not necessary
}

export const setPreferenceTouchJoystickMode = (mode: TOUCH_JOYSTICK_MODE = "off") => {
  if (mode === "off") {
    localStorage.removeItem("touchJoystickMode")
  } else {
    localStorage.setItem("touchJoystickMode", JSON.stringify(mode))
  }
  passTouchJoystickMode(mode)
}

export const setPreferenceTouchJoystickSensitivity = (sensitivity: number = 2) => {
  if (sensitivity == 2) {
    localStorage.removeItem("touchJoystickSensitivity")
  } else {
    localStorage.setItem("touchJoystickSensitivity", JSON.stringify(sensitivity))
  }
  passTouchJoystickSensitivity(sensitivity)
}

export const loadPreferences = () => {
  const capsLock = localStorage.getItem("capsLock")
  if (capsLock) {
    try {
      passCapsLock(JSON.parse(capsLock))
    } catch {
      localStorage.removeItem("capsLock")
    }
  }

  const colorMode = localStorage.getItem("colorMode")
  if (colorMode) {
    try {
      passColorMode(JSON.parse(colorMode))
    } catch {
      localStorage.removeItem("colorMode")
    }
  }

  const showScanlines = localStorage.getItem("showScanlines")
  if (showScanlines) {
    try {
      passShowScanlines(JSON.parse(showScanlines))
    } catch {
      localStorage.removeItem("showScanlines")
    }
  }

  // Keep for backwards-compatibility
  const darkMode = localStorage.getItem("darkMode")
  if (darkMode) {
    try {
      if (JSON.parse(darkMode)) {
        passTheme(UI_THEME.DARK)
      }
    } catch {
      localStorage.removeItem("darkMode")
    }
    localStorage.removeItem("darkMode")
  }

  const theme = localStorage.getItem("theme")
  if (theme) {
    try {
      passTheme(JSON.parse(theme))
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

  const debugMode = localStorage.getItem("debugMode")
  if (debugMode) {
    try {
      passSetDebug(JSON.parse(debugMode))
    } catch {
      localStorage.removeItem("debugMode")
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

  const hotReload = localStorage.getItem("hotReload")
  if (hotReload) {
    try {
      passHotReload(JSON.parse(hotReload))
    } catch {
      localStorage.removeItem("hotReload")
    }
  }

  const touchJoystickMode = localStorage.getItem("touchJoystickMode")
  if (touchJoystickMode !== "off") {
    try {
      passTouchJoystickMode(JSON.parse(touchJoystickMode || ""))
    } catch {
      localStorage.removeItem("touchJoystickMode")
    }
  }

  const touchJoystickSensitivity = localStorage.getItem("touchJoystickSensitivity")
  if (touchJoystickSensitivity) {
    try {
      passTouchJoystickSensitivity(JSON.parse(touchJoystickSensitivity))
    } catch {
      localStorage.removeItem("touchJoystickSensitivity")
    }
  }
}

export const resetPreferences = () => {
  setPreferenceSpeedMode()
  setPreferenceCapsLock()
  setPreferenceColorMode()
  setPreferenceShowScanlines()
  setPreferenceTheme()
  setPreferenceMockingboardMode()
  setPreferenceMachineName()
  setPreferenceRamWorks()
  setPreferenceDebugMode()
  setPreferenceHotReload()
  setPreferenceTouchJoystickMode()
  setPreferenceTouchJoystickSensitivity()

  localStorage.removeItem("binaryRunAddress")
}

export const getPreferenceFirstRunMinimal = () => {
  let value: boolean = true

  const item = localStorage.getItem("firstRunMinimal")
  if (item) {
    try {
      value = JSON.parse(item)
    } catch { /* empty */ }
  }

  return value
}

