import { useState } from "react"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import {
  faGamepad,
} from "@fortawesome/free-solid-svg-icons"
import PopupMenu from "../controls/popupmenu"
import { getArrowKeysAsJoystick } from "../ui_settings"
import { getPreferenceBoolean, setPreferenceBoolean } from "../localstorage"

import { useTranslation } from "../../i18n/useTranslation"
import { createControlContext } from "../retro/retromenucontext"
import { ControlRegistry } from "../controls/controlregistry"
import { controlsToPopupItems } from "../controls/controlpopup"
import { controlsFromJson, toggleBinding, type RetroControlBindings } from "../retro/retrocontrolmetadata"

const joystickSettings = [
  ["keyboard.joystick.arrowKeys", "arrowKeysAsJoystick", getArrowKeysAsJoystick],
  ["keyboard.joystick.reverseYAxis", "reverseYAxis", () => getPreferenceBoolean("reverseYAxis")],
  ["keyboard.joystick.siriusJoyport", "siriusJoyport", () => getPreferenceBoolean("siriusJoyport")],
] as const

const gamepadBindings: RetroControlBindings = Object.fromEntries(
  joystickSettings.map(([id, preference, getter]) => [id, toggleBinding({
    enabled: getter,
    setEnabled: (context, enabled) =>
      setPreferenceBoolean(preference, enabled, context.settingsOrigin),
  })]),
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
