import { useState } from "react"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import {
  faGamepad,
} from "@fortawesome/free-solid-svg-icons"
import PopupMenu from "../controls/popupmenu"
import { getPreferenceBoolean, setPreferenceBoolean } from "../localstorage"

import { useTranslation } from "../../i18n/useTranslation"
import { createControlContext } from "../retro/retromenucontext"
import { ControlRegistry } from "../controls/controlregistry"
import { controlsToPopupItems } from "../controls/controlpopup"
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
  ["keyboard.joystick.touchJoystick", "touchJoystick", isTouchDevice, false],
  ["keyboard.joystick.tiltSensorJoystick", "tiltSensorJoystick", isTouchDevice, false]
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

const gamepadControlRegistry = new ControlRegistry(retroGamepadControls)

export const GamepadConfig = () => {
  const { t, language, changeLanguage } = useTranslation()
  const [popupLocation, setPopupLocation] = useState<[number, number]>()

  const handleClick = (event: React.MouseEvent) => {
    setPopupLocation([event.clientX, event.clientY])
  }

  const controls = gamepadControlRegistry.resolve(
    createControlContext(undefined, t, language, changeLanguage),
    "keyboard.joystick",
  )

  return (
    <span>
      <button
        id="basic-button"
        className="push-button"
        title={t("config.joystick")}
        onClick={handleClick}
      >
        <FontAwesomeIcon icon={faGamepad} />
      </button>

      <PopupMenu
        location={popupLocation}
        onClose={() => { setPopupLocation(undefined) }}
        menuItems={[controlsToPopupItems(controls)]}
      />
    </span>
  )
}
