import { useState } from "react"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import {
  faGamepad,
} from "@fortawesome/free-solid-svg-icons"
import PopupMenu from "../controls/popupmenu"
import { getArrowKeysAsJoystick, setArrowKeysAsJoystick } from "../ui_settings"
import { getPreferenceSiriusJoyport, setPreferenceSiriusJoyport } from "../localstorage"

export const GamepadConfig = () => {
  const [popupLocation, setPopupLocation] = useState<[number, number]>()

  const handleClick = (event: React.MouseEvent) => {
    setPopupLocation([event.clientX, event.clientY])
  }

  const arrowKeysAsJoystick = getArrowKeysAsJoystick()
  const siriusJoyport = getPreferenceSiriusJoyport()

  return (
    <span>
      <button
        id="basic-button"
        className="push-button"
        title="Joystick Configuration"
        onClick={handleClick}
      >
        <FontAwesomeIcon icon={faGamepad} />
      </button>

      <PopupMenu
        location={popupLocation}
        onClose={() => { setPopupLocation(undefined) }}
        menuItems={[[
            {
              label: "Use Arrow Keys as Joystick",
              isSelected: () => {return arrowKeysAsJoystick},
              onClick: () => {
                setArrowKeysAsJoystick(!arrowKeysAsJoystick)
              }
            },
            {
              label: "Sirius Joyport Mode",
              isSelected: () => {return siriusJoyport},
              onClick: () => {
                setPreferenceSiriusJoyport(!siriusJoyport)
              }
            },
        ]]}
      />
    </span>
  )
}
