import { useState } from "react"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import {
  faGamepad,
} from "@fortawesome/free-solid-svg-icons"
import PopupMenu from "../controls/popupmenu"
import { getArrowKeysAsJoystick } from "../ui_settings"
import { getPreferenceBoolean, setPreferenceBoolean } from "../localstorage"

import { useTranslation } from "../../i18n/useTranslation"
import { toggleMetadata } from "../retro/retromenuhelpers"
import type { RetroControlMetadata } from "../retro/retromenucontext"
import { createControlContext } from "../retro/retromenucontext"
import { ControlRegistry } from "../controls/controlregistry"
import { controlsToPopupItems } from "../controls/controlpopup"

const joystickSettings = [
  ["keyboard.joystick.arrowKeys", "gamepad.useArrowKeys", "arrowKeysAsJoystick", getArrowKeysAsJoystick],
  ["keyboard.joystick.reverseYAxis", "gamepad.reverseYAxis", "reverseYAxis", () => getPreferenceBoolean("reverseYAxis")],
  ["keyboard.joystick.siriusJoyport", "gamepad.siriusJoyport", "siriusJoyport", () => getPreferenceBoolean("siriusJoyport")],
] as const

export const retroGamepadControls: RetroControlMetadata[] = [
  {
    id: "keyboard.joystick",
    parentId: null,
    order: 6.5,
    label: context => context.t("retroControl.joystick"),
  },
  ...joystickSettings.map(([id, labelKey, preference, getter], order) => toggleMetadata({
    id,
    parentId: "keyboard.joystick",
    order,
    label: context => context.t(labelKey),
    enabled: getter,
    setEnabled: (context, enabled) =>
      setPreferenceBoolean(preference, enabled, context.settingsOrigin),
  })),
]

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
