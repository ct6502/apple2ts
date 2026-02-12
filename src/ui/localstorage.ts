import { BreakpointMap, BreakpointNew } from "../common/breakpoint"
import { COLOR_MODE, UI_THEME } from "../common/utility"
import { changeMockingboardMode } from "./devices/audio/mockingboard_audio"
import { passBreakpoints, passSetMachineName, passSetRamWorks, passSetShowDebugTab, passSpeedMode, } from "./main2worker"
import { setCapsLock, setColorMode, setShowScanlines, setTheme, setHotReload, setTouchJoystickMode, setTouchJoystickSensitivity, setTiltSensorJoystick, setGhosting, setCrtDistortion, setAutoNumbering, setCapitalizeBasic } from "./ui_settings"

export const setPreferenceAutoNumbering = (mode = false) => {
  if (mode === false) {
    localStorage.removeItem("autoNumbering")
  } else {
    localStorage.setItem("autoNumbering", JSON.stringify(mode))
  }
  setAutoNumbering(mode)
}

export const setPreferenceCapitalizeBasic = (mode = false) => {
  if (mode === false) {
    localStorage.removeItem("capitalizeBasic")
  } else {
    localStorage.setItem("capitalizeBasic", JSON.stringify(mode))
  }
  setCapitalizeBasic(mode)
}

export const setPreferenceCapsLock = (mode = true) => {
  if (mode === true) {
    localStorage.removeItem("capsLock")
  } else {
    localStorage.setItem("capsLock", JSON.stringify(mode))
  }
  setCapsLock(mode)
}

export const setPreferenceColorMode = (mode: COLOR_MODE = COLOR_MODE.COLOR) => {
  if (mode === COLOR_MODE.COLOR) {
    localStorage.removeItem("colorMode")
  } else {
    localStorage.setItem("colorMode", JSON.stringify(mode))
  }
  setColorMode(mode)
}

export const setPreferenceCrtDistortion = (mode = false) => {
  if (mode) {
    localStorage.setItem("crtDistortion", JSON.stringify(mode))
  } else {
    localStorage.removeItem("crtDistortion")
  }
  setCrtDistortion(mode)
}

export const setPreferenceGhosting = (mode = false) => {
  if (mode) {
    localStorage.setItem("ghosting", JSON.stringify(mode))
  } else {
    localStorage.removeItem("ghosting")
  }
  setGhosting(mode)
}

export const setPreferenceShowScanlines = (mode = false) => {
  if (mode) {
    localStorage.setItem("showScanlines", JSON.stringify(mode))
  } else {
    localStorage.removeItem("showScanlines")
  }
  setShowScanlines(mode)
}

export const setPreferenceTheme = (theme: UI_THEME = UI_THEME.CLASSIC) => {
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

export const setPreferenceDebugMode = (mode = false) => {
  if (mode === false) {
    localStorage.removeItem("debugMode")
  } else {
    localStorage.setItem("debugMode", JSON.stringify(mode))
  }
  passSetShowDebugTab(mode)
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
  setHotReload(mode)
}

export const setPreferenceFirstRunMinimal = (mode = true) => {
  if (mode === true) {
    localStorage.removeItem("firstRunMinimal")
  } else {
    localStorage.setItem("firstRunMinimal", JSON.stringify(mode))
  }
  // UI-only setting, pass along not necessary
}

export const setPreferenceNewReleasesChecked = (lastChecked = -1) => {
  if (lastChecked == -1) {
    localStorage.removeItem("newReleasesChecked")
  } else {
    localStorage.setItem("newReleasesChecked", JSON.stringify(lastChecked))
  }
  // UI-only setting, pass along not necessary
}

export const setPreferenceTiltSensorJoystick = (mode = false) => {
  if (!mode) {
    localStorage.removeItem("tiltSensorJoystick")
  } else {
    localStorage.setItem("tiltSensorJoystick", "true")
  }
  setTiltSensorJoystick(mode)
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
        return [address, newBreakpoint]
      })
      const breakpointMap = new BreakpointMap(migratedBreakpoints)
      passBreakpoints(breakpointMap)
    } catch {
      localStorage.removeItem("breakpoints")
    }
  }
  
  const capsLock = localStorage.getItem("capsLock")
  if (capsLock) {
    try {
      setCapsLock(JSON.parse(capsLock))
    } catch {
      localStorage.removeItem("capsLock")
    }
  }

  const colorMode = localStorage.getItem("colorMode")
  if (colorMode) {
    try {
      setColorMode(JSON.parse(colorMode))
    } catch {
      localStorage.removeItem("colorMode")
    }
  }

  const crtDistortion = localStorage.getItem("crtDistortion")
  if (crtDistortion) {
    try {
      setCrtDistortion(JSON.parse(crtDistortion))
    } catch {
      localStorage.removeItem("crtDistortion")
    }
  }

  const ghosting = localStorage.getItem("ghosting")
  if (ghosting) {
    try {
      setGhosting(JSON.parse(ghosting))
    } catch {
      localStorage.removeItem("ghosting")
    }
  }

  const showScanlines = localStorage.getItem("showScanlines")
  if (showScanlines) {
    try {
      setShowScanlines(JSON.parse(showScanlines))
    } catch {
      localStorage.removeItem("showScanlines")
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

  const debugMode = localStorage.getItem("debugMode")
  if (debugMode) {
    try {
      passSetShowDebugTab(JSON.parse(debugMode))
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
      setHotReload(JSON.parse(hotReload))
    } catch {
      localStorage.removeItem("hotReload")
    }
  }

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
  setPreferenceTiltSensorJoystick()
  setPreferenceNewReleasesChecked()
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
