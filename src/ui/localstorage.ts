import { COLOR_MODE, UI_THEME } from "../common/utility"
import { changeMockingboardMode } from "./devices/audio/mockingboard_audio"
import { passMachineState } from "./main2worker"

export enum EMULATOR_PREFERENCE {
  CAPS_LOCK,
  COLOR_MODE,
  DARK_MODE,
  DEBUG_MODE,
  FIRST_RUN_MINIMAL,
  HOT_RELOAD,
  MACHINE_NAME,
  MOCKINGBOARD_MODE,
  NEW_RELEASES_CHECKED,
  RAMWORKS,
  SHOW_SCANLINES,
  SPEED_MODE,
  TILT_SENSOR_JOYSTICK,
  TOUCH_JOYSTICK_MODE,
  TOUCH_JOYSTICK_MODEL,
  TOUCH_JOYSTICK_SENSITIVITY,
  UI_THEME
}

export type EmulatorPreference<T> = {
  name: string,
  defaultValue: T,
  machineStateKey?: keyof MachineState,
  callback?: (value: T) => void
}

export const emulatorPreferences:Map<EMULATOR_PREFERENCE, EmulatorPreference<any>> = new Map([
  [EMULATOR_PREFERENCE.CAPS_LOCK, {
    name: "capsLock",
    defaultValue: true,
    machineStateKey: "capsLock"
  }],
  [EMULATOR_PREFERENCE.COLOR_MODE, {
    name: "colorMode",
    defaultValue: COLOR_MODE.COLOR,
    machineStateKey: "colorMode"
  }],
  [EMULATOR_PREFERENCE.DARK_MODE, {
    name: "darkMode",
    defaultValue: UI_THEME.DARK
  }],
  [EMULATOR_PREFERENCE.DEBUG_MODE, {
    name: "debugMode",
    defaultValue: false,
    machineStateKey: "isDebugging"
  }],
  [EMULATOR_PREFERENCE.FIRST_RUN_MINIMAL, {
    name: "firstRunMinimal",
    defaultValue: true
  }],
  [EMULATOR_PREFERENCE.HOT_RELOAD, {
    name: "hotReload",
    defaultValue: false,
    machineStateKey: "hotReload"
  }],
  [EMULATOR_PREFERENCE.MACHINE_NAME, {
    name: "machineName",
    defaultValue: "APPLE2EE",
    machineStateKey: "machineName"
  }],
  [EMULATOR_PREFERENCE.MOCKINGBOARD_MODE, {
    name: "mockingboardMode",
    defaultValue: 0,
    callback: changeMockingboardMode
  }],
  [EMULATOR_PREFERENCE.NEW_RELEASES_CHECKED, {
    name: "newReleasesChecked",
    defaultValue: -1
  }],
  [EMULATOR_PREFERENCE.RAMWORKS, {
    name: "ramWorks",
    defaultValue: 64,
    machineStateKey: "extraRamSize"
  }],
  [EMULATOR_PREFERENCE.SHOW_SCANLINES, {
    name: "showScanlines",
    defaultValue: false,
    machineStateKey: "showScanlines"
  }],
  [EMULATOR_PREFERENCE.SPEED_MODE, {
    name: "speedMode",
    defaultValue: 0,
    machineStateKey: "speedMode"
  }],
  [EMULATOR_PREFERENCE.TILT_SENSOR_JOYSTICK, {
    name: "tiltSensorJoystick",
    defaultValue: false
  }],
  [EMULATOR_PREFERENCE.TOUCH_JOYSTICK_MODE, {
    name: "touchJoystickMode",
    defaultValue: "off",
    machineStateKey: "touchJoystickMode"
  }],
  [EMULATOR_PREFERENCE.TOUCH_JOYSTICK_MODEL, {
    name: "touchJoystickModel",
    defaultValue: 0
  }],
  [EMULATOR_PREFERENCE.TOUCH_JOYSTICK_SENSITIVITY, {
    name: "touchJoystickSensitivity",
    defaultValue: 2,
    machineStateKey: "touchJoystickSensitivity"
  }],
  [EMULATOR_PREFERENCE.UI_THEME, {
    name: "theme",
    defaultValue: UI_THEME.CLASSIC,
    machineStateKey: "theme"
  }]
])

export const getEmulatorPreference = <T>(id: EMULATOR_PREFERENCE): T => {
  const preference = emulatorPreferences.get(id)

  if (preference) {
    const value = localStorage.getItem(preference.name)

    if (value) {
      try {
        const parsedValue = JSON.parse(value)

        if (preference.machineStateKey) {
          passMachineState(preference.machineStateKey, parsedValue)
        }

        return parsedValue
      } catch {
        localStorage.removeItem(preference.name)
      }
    }
  } else {
    console.error(`${id}: preference not recognized`)
  }

  return preference?.defaultValue
}

export const setEmulatorPreference = <T>(id: EMULATOR_PREFERENCE, value: T | undefined = undefined) => {
  const preference = emulatorPreferences.get(id)

  if (preference) {
    if (value == undefined || value === preference.defaultValue) {
      localStorage.removeItem(preference.name)
      value = preference.defaultValue
    } else {
      localStorage.setItem(preference.name, JSON.stringify(value))
    }

    if (preference.machineStateKey) {
      passMachineState(preference.machineStateKey, value)
    }

    if (preference.callback) {
      preference.callback(value)
    }
  } else {
    console.error(`${id}: preference not recognized`)
  }
}

export const loadPreferences = () => {
  emulatorPreferences.keys().forEach((id) => {
    getEmulatorPreference(id)
  })
}

export const resetPreferences = () => {
  emulatorPreferences.keys().forEach((preferenceId) => {
    setEmulatorPreference(preferenceId)
  })

  localStorage.removeItem("binaryRunAddress")
}