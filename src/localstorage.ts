import { changeMockingboardMode } from "./devices/mockingboard_audio";
import { COLOR_MODE } from "./emulator/utility/utility";
import { passCapsLock, passColorMode, passDarkMode, passSetDebug, passSetMachineName, passSetRamWorks, passSpeedMode } from "./main2worker";


export const setPreferenceCapsLock = (mode = true) => {
  if (mode === true) {
    localStorage.removeItem('capsLock')
  } else {
    localStorage.setItem('capsLock', JSON.stringify(mode))
  }
  passCapsLock(mode);
}

export const setPreferenceColorMode = (mode: COLOR_MODE = COLOR_MODE.COLOR) => {
  if (mode === COLOR_MODE.COLOR) {
    localStorage.removeItem('colorMode')
  } else {
    localStorage.setItem('colorMode', JSON.stringify(mode))
  }
  passColorMode(mode);
}

export const setPreferenceDarkMode = (mode = false) => {
  if (mode === false) {
    localStorage.removeItem('darkMode')
  } else {
    localStorage.setItem('darkMode', JSON.stringify(mode))
  }
  passDarkMode(mode)
}

export const setPreferenceDebugMode = (mode = false) => {
  if (mode === false) {
    localStorage.removeItem('debugMode')
  } else {
    localStorage.setItem('debugMode', JSON.stringify(mode))
  }
  passSetDebug(mode)
}

export const setPreferenceMachineName = (name: MACHINE_NAME = "APPLE2EE") => {
  if (name === "APPLE2EE") {
    localStorage.removeItem('machineName')
  } else {
    localStorage.setItem('machineName', JSON.stringify(name))
  }
  passSetMachineName(name)
}

export const setPreferenceMockingboardMode = (mode = 0) => {
  if (mode === 0) {
    localStorage.removeItem('mockingboardMode')
  } else {
    localStorage.setItem('mockingboardMode', JSON.stringify(mode))
  }
  changeMockingboardMode(mode)
}

export const setPreferenceRamWorks = (size = 64) => {
  if (size === 64) {
    localStorage.removeItem('ramWorks')
  } else {
    localStorage.setItem('ramWorks', JSON.stringify(size))
  }
  passSetRamWorks(size)
}

export const setPreferenceSpeedMode = (mode = 0) => {
  if (mode === 0) {
    localStorage.removeItem('speedMode')
  } else {
    localStorage.setItem('speedMode', JSON.stringify(mode))
  }
  passSpeedMode(mode)
}

export const loadPreferences = () => {
  const capsLock = localStorage.getItem('capsLock')
  if (capsLock) {
    try {
      passCapsLock(JSON.parse(capsLock))
    } catch (e) {
      localStorage.removeItem('capsLock')
    }
  }

  const colorMode = localStorage.getItem('colorMode')
  if (colorMode) {
    try {
      passColorMode(JSON.parse(colorMode))
    } catch (e) {
      localStorage.removeItem('colorMode')
    }
  }

  const darkMode = localStorage.getItem('darkMode')
  if (darkMode) {
    try {
      passDarkMode(JSON.parse(darkMode))
    } catch (e) {
      localStorage.removeItem('darkMode')
    }
  }

  const speedMode = localStorage.getItem('speedMode')
  if (speedMode) {
    try {
      passSpeedMode(JSON.parse(speedMode))
    } catch (e) {
      localStorage.removeItem('speedMode')
    }
  }

  const debugMode = localStorage.getItem('debugMode')
  if (debugMode) {
    try {
      passSetDebug(JSON.parse(debugMode))
    } catch (e) {
      localStorage.removeItem('debugMode')
    }
  }

  const machineName = localStorage.getItem('machineName')
  if (machineName) {
    try {
      passSetMachineName(JSON.parse(machineName))
    } catch (e) {
      localStorage.removeItem('machineName')
    }
  }

  const mockingboardMode = localStorage.getItem('mockingboardMode')
  if (mockingboardMode) {
    try {
      changeMockingboardMode(JSON.parse(mockingboardMode))
    } catch (e) {
      localStorage.removeItem('mockingboardMode')
    }
  }

  const ramWorks = localStorage.getItem('ramWorks')
  if (ramWorks) {
    try {
      passSetRamWorks(JSON.parse(ramWorks))
    } catch (e) {
      localStorage.removeItem('ramWorks')
    }
  }
}

export const resetPreferences = () => {
  setPreferenceSpeedMode()
  setPreferenceCapsLock()
  setPreferenceColorMode()
  setPreferenceDarkMode()
  setPreferenceMockingboardMode()
  setPreferenceMachineName()
  setPreferenceRamWorks()
  setPreferenceDebugMode()

  localStorage.removeItem('binaryRunAddress')
}
