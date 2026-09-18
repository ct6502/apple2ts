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

const joystickSettings = [
  ["keyboard.joystick.arrowKeys", "arrowKeysAsJoystick", true],
  ["keyboard.joystick.reverseYAxis", "reverseYAxis", true],
  ["keyboard.joystick.siriusJoyport", "siriusJoyport", true],
  ["keyboard.joystick.touchJoystick", "touchJoystick", isTouchDevice],
  ["keyboard.joystick.tiltSensorJoystick", "tiltSensorJoystick", isTouchDevice]
] as const

const gamepadBindings: RetroControlBindings = Object.fromEntries(
  joystickSettings.map(([id, preference, selectable]) => [id, {...toggleBinding({
    enabled: () => getPreferenceBoolean(preference),
    setEnabled: (context, enabled) =>
      setPreferenceBoolean(preference, enabled, context.settingsOrigin),
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
