import { BreakpointMap } from "../common/breakpoint"
import { COLOR_MODE, UI_THEME } from "../common/utility"
import { changeMockingboardMode } from "./devices/audio/mockingboard_audio"
import { passBreakpoints, passSetMachineName, passSetRamWorks, passSetShowDebugTab, passSpeedMode, } from "./main2worker"
import { setCapsLock, setColorMode, setShowScanlines, setTheme, setHotReload, setTouchJoystickMode, setTouchJoystickSensitivity, setTiltSensorJoystick } from "./ui_settings"

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

// Disk images are stored in localStorage with a key derived from the URL.
// The derived key is the filename without extension, no file suffix,
// removed version patterns ("_v1.2.3", " v1.2.3", "_1_2_3", etc),
// removed underscores, dashes, spaces, converted to uppercase.
// localStorage["URLKEY"] = drive index
// localStorage["URLKEY-data"] = disk image data as base64 string
// where URLKEY is the derived key.
const convertDiskImageURLToKey = (url: string) => {
  const filename = url.split("/").pop() || url
  const withoutExtension = filename.replace(/\.[^.]*$/, "")
  // Remove version patterns from the end
  let urlkey = withoutExtension.replace(/[_\s]+v?\d+([._]\d+)*$/i, "")
  urlkey = urlkey.replace(/[_-\s]+/g, "")
  return urlkey.toUpperCase()
}

export const hasDiskImageInLocalStorage = (url: string) => {
  url = convertDiskImageURLToKey(url)
  return localStorage.getItem(url) !== null
}

export const getDiskImageFromLocalStorage = (url: string) => {
  url = convertDiskImageURLToKey(url)
  const driveIndex = localStorage.getItem(url)
  if (driveIndex) {
    const diskImage = localStorage.getItem(url + "-data")
    if (diskImage) {
      const binary = atob(diskImage)
      const data = new Uint8Array(binary.split("").map(char => char.charCodeAt(0)))
      return {index: parseInt(driveIndex), data: data}
    }
  }
  return null
}

export const setDiskImageToLocalStorage = (url: string, index: number, data: Uint8Array | null) => {
  url = convertDiskImageURLToKey(url)
  if (data) {
    let binary = ""
    for (let i = 0; i < data.length; i++) {
      binary += String.fromCharCode(data[i])
    }
    const diskImage = btoa(binary)
    localStorage.setItem(url, index.toString())
    localStorage.setItem(url + "-data", diskImage)
  } else {
    localStorage.removeItem(url)
    localStorage.removeItem(url + "-data")
  }
}

export const loadPreferences = () => {
  const breakpoints = localStorage.getItem("breakpoints")
  if (breakpoints) {
    try {
      const parsed = JSON.parse(breakpoints)
      const breakpointMap = new BreakpointMap(parsed)
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
