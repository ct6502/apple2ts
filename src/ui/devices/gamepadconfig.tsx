import { getPreferenceBoolean, setPreferenceBoolean } from "../localstorage"

import { controlsFromJson, toggleBinding, type RetroControlBindings } from "../retro/retrocontrolmetadata"

const isTouchDevice = "ontouchstart" in document.documentElement

// [controlId, preferenceKey, selectable, inverted]
// "Caps Lock" is the inverse of lowercaseMode: caps lock on means lowercase
// input is off. Without `inverted` the toggle would display and apply backwards.
const joystickSettings = [
  ["keyboard.capsLock", "lowercaseMode", true, true],
  ["keyboard.useOpenAppleKey", "useOpenAppleKey", true, false],
  ["keyboard.joystick.arrowKeys", "arrowKeysAsJoystick", true, false],
  ["keyboard.joystick.reverseYAxis", "reverseYAxis", true, false],
  ["keyboard.joystick.siriusJoyport", "siriusJoyport", true, false],
  ["keyboard.enableGamePatches", "enableGamePatches", true, false],
  ["keyboard.joystick.touchJoystick", "touchJoystick", isTouchDevice, false],
  ["keyboard.joystick.tiltSensorJoystick", "tiltSensorJoystick", isTouchDevice, false],
] as const

const gamepadBindings: RetroControlBindings = Object.fromEntries(
  joystickSettings.map(([id, preference, selectable, inverted]) => [id, {...toggleBinding({
    enabled: () => {
      const value = getPreferenceBoolean(preference)
      return inverted ? !value : value
    },
    setEnabled: (context, enabled) =>
      setPreferenceBoolean(preference, inverted ? !enabled : enabled, context.settingsOrigin),
  }),
  selectable: selectable,
  },
  ]),
)

export const retroGamepadControls = controlsFromJson("gamepad", gamepadBindings)
