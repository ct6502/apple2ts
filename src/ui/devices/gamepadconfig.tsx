import { useState } from "react"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import {
  faGamepad,
} from "@fortawesome/free-solid-svg-icons"
import PopupMenu from "../controls/popupmenu"
import { getArrowKeysAsJoystick } from "../ui_settings"
import { getPreferenceBoolean, setPreferenceBoolean } from "../localstorage"

import { useTranslation } from "../../i18n/useTranslation"

export const GamepadConfig = () => {
  const { t } = useTranslation()
  const [popupLocation, setPopupLocation] = useState<[number, number]>()

  const handleClick = (event: React.MouseEvent) => {
    setPopupLocation([event.clientX, event.clientY])
  }

  const arrowKeysAsJoystick = getArrowKeysAsJoystick()
  const reverseYAxis = getPreferenceBoolean("reverseYAxis")
  const siriusJoyport = getPreferenceBoolean("siriusJoyport")

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
        menuItems={[[
            {
              label: t("gamepad.useArrowKeys"),
              isSelected: () => {return arrowKeysAsJoystick},
              onClick: () => {
                setPreferenceBoolean("arrowKeysAsJoystick", !arrowKeysAsJoystick)
              }
            },
            {
              label: t("gamepad.reverseYAxis"),
              isSelected: () => {return reverseYAxis},
              onClick: () => {
                setPreferenceBoolean("reverseYAxis", !reverseYAxis)
              }
            },
            {
              label: t("gamepad.siriusJoyport"),
              isSelected: () => {return siriusJoyport},
              onClick: () => {
                setPreferenceBoolean("siriusJoyport", !siriusJoyport)
              }
            },
        ]]}
      />
    </span>
  )
}
