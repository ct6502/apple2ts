import { handleGetLeftButton, handleGetRightButton, handleGetTheme, handleGetTouchJoyStickMode, passAppleCommandKeyPress, passAppleCommandKeyRelease, passKeypress } from "../main2worker"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import {
  faArrowRight,
  faArrowLeft,
  faArrowDown,
  faArrowUp,
} from "@fortawesome/free-solid-svg-icons"
import { lockedKeyStyle, UI_THEME } from "../../common/utility"
import { handleArrowKey } from "../devices/gamepad"
import { appleOutline } from "../img/icon_appleoutline"
import { appleSolid } from "../img/icon_applesolid"
import { joystick } from "../img/icon_joystick"
import PopupMenu from "./popupmenu"
import { useState } from "react"
import { setPreferenceTouchJoystickMode } from "../localstorage"

const KeyboardButtons = (props: DisplayProps) => {
  const [popupLocation, setPopupLocation] = useState<[number, number]>()

  const arrowKeys = [
    { name: "Left", icon: faArrowLeft },
    { name: "Right", icon: faArrowRight },
    { name: "Up", icon: faArrowUp },
    { name: "Down", icon: faArrowDown },
  ]
  const isTouchDevice = "ontouchstart" in document.documentElement
  const tryButtonPressRelease = (doTouch: boolean, key: string, press: boolean) => {
    if (doTouch !== isTouchDevice) return
    // If one of our Apple keys is locked, ignore the button press.
    if (key === "left") {
      if (props.openAppleKeyMode > 0) return
    } else {
      if (props.closedAppleKeyMode > 0) return
    }
    if (press) {
      passAppleCommandKeyPress(key === "left")
    } else {
      passAppleCommandKeyRelease(key === "left")
    }
  }
  return <span>{isTouchDevice && <span className="flex-row">
    {arrowKeys.map((key, i) => (
      <button className="push-button key-button" title={key.name}
        key={key.name}
        onTouchStart={() => handleArrowKey(i, false)}
        onTouchEnd={() => handleArrowKey(i, true)}
      >
        <FontAwesomeIcon icon={key.icon} />
      </button>
    ))}
    <button className="push-button key-button" title="Escape"
      onMouseDown={() => passKeypress(27)}>
      <span className="text-key">esc</span>
    </button>
    <button className="push-button key-button" title="Tab"
      onMouseDown={() => passKeypress(9)}>
      <span className="text-key">tab</span>
    </button>
    <button
      className={lockedKeyStyle(props.ctrlKeyMode)}
      title="Control"
      onMouseDown={() => props.handleCtrlDown((props.ctrlKeyMode + 1) % 3)}>
      <span className="text-key">ctrl</span>
    </button>
    <button className={lockedKeyStyle(props.openAppleKeyMode)}
      title="Open Apple"
      onMouseDown={() => props.handleOpenAppleDown((props.openAppleKeyMode + 1) % 3)}>
      <svg width="25" height="25" className="fill-color">{appleOutline}</svg>
    </button>
    <button className={lockedKeyStyle(props.closedAppleKeyMode)} title="Closed Apple"
      onMouseDown={() => props.handleClosedAppleDown((props.closedAppleKeyMode + 1) % 3)}>
      <svg width="25" height="25" className="fill-color">{appleSolid}</svg>
    </button>
    { handleGetTheme() == UI_THEME.MINIMAL &&
      <button title="Touch Joystick"
        className="push-button"
        onMouseDown={(event: React.MouseEvent) => setPopupLocation([event.clientX, event.clientY])}>
        <svg width="25" height="25" className="fill-color">{joystick}</svg>
      </button>}
  </span >
  }
    <button className={`joystick-button ${handleGetLeftButton() ? "joystick-active" : ""}`}
      title="Button 1"
      onTouchStart={() => tryButtonPressRelease(true, "left", true)}
      onTouchEnd={() => tryButtonPressRelease(true, "left", false)}
      onMouseDown={() => tryButtonPressRelease(false, "left", true)}
      onMouseUp={() => tryButtonPressRelease(false, "left", false)}>
    </button>
    <button className={`joystick-button ${handleGetRightButton() ? "joystick-active" : ""}`}
      title="Button 2"
      onTouchStart={() => tryButtonPressRelease(true, "right", true)}
      onTouchEnd={() => tryButtonPressRelease(true, "right", false)}
      onMouseDown={() => tryButtonPressRelease(false, "right", true)}
      onMouseUp={() => tryButtonPressRelease(false, "right", false)}>
    </button>
    <PopupMenu
      location={popupLocation}
      onClose={() => { setPopupLocation(undefined) }}
      menuItems={[[
        {
          label: "Touch Joystick Disabled",
          isSelected: () => { return handleGetTouchJoyStickMode() === "off" },
          onClick: () => { setPreferenceTouchJoystickMode("off"); props.updateDisplay() }
        },
        {
          label: "Touch Joystick Enabled (Left-Handed)",
          isSelected: () => { return handleGetTouchJoyStickMode() === "left" },
          onClick: () => { setPreferenceTouchJoystickMode("left"); props.updateDisplay() }
        },
        {
          label: "Touch Joystick Enabled (Right-Handed)",
          isSelected: () => { return handleGetTouchJoyStickMode() === "right" },
          onClick: () => { setPreferenceTouchJoystickMode("right"); props.updateDisplay() }
        }
      ]]}
    />
  </span >
}

export default KeyboardButtons
