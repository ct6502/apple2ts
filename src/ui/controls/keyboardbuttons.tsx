import {
  handleGetLeftButton, handleGetRightButton, passAppleCommandKeyPress,
  passAppleCommandKeyRelease
  } from "../main2worker"
import PopupMenu from "./popupmenu"
import { useState } from "react"
import LanguageSwitch from "./languageswitch"
import { setPreferenceBoolean } from "../localstorage"
import { getUIStateBoolean } from "../ui_settings"
const KeyboardButtons = (props: DisplayProps) => {
  const [popupLocation, setPopupLocation] = useState<[number, number]>()


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

  return <span>
    <span className="flex-row" style={{ alignItems: "center" }}>
      {!isTouchDevice && <>
        <button className={`joystick-button ${handleGetLeftButton() ? "joystick-active" : ""}`}
          title={`Button 1 (${navigator.platform.startsWith("Mac") ? "Option Left" : "Alt Left"})`}
          onTouchStart={() => tryButtonPressRelease(true, "left", true)}
          onTouchEnd={() => tryButtonPressRelease(true, "left", false)}
          onMouseDown={() => tryButtonPressRelease(false, "left", true)}
          onMouseUp={() => tryButtonPressRelease(false, "left", false)}>
        </button>
        <button className={`joystick-button ${handleGetRightButton() ? "joystick-active" : ""}`}
          title={`Button 2 (${navigator.platform.startsWith("Mac") ? "Option Right" : "Alt Right"})`}
          onTouchStart={() => tryButtonPressRelease(true, "right", true)}
          onTouchEnd={() => tryButtonPressRelease(true, "right", false)}
          onMouseDown={() => tryButtonPressRelease(false, "right", true)}
          onMouseUp={() => tryButtonPressRelease(false, "right", false)}>
        </button>
      </>}
      <LanguageSwitch />
    </span>
    <PopupMenu
      location={popupLocation}
      onClose={() => { setPopupLocation(undefined) }}
      menuItems={[[
        {
          label: "Disabled",
          isSelected: () => { return !getUIStateBoolean("touchJoystick") },
          onClick: () => { setPreferenceBoolean("touchJoystick", false); props.updateDisplay() }
        },
        {
          label: "Use Tilt Sensor as Joystick",
          isSelected: () => { return getUIStateBoolean("tiltSensorJoystick") },
          onClick: () => {
            let turningOn = !getUIStateBoolean("tiltSensorJoystick")
            if (turningOn) {
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              if (typeof ((DeviceOrientationEvent as any).requestPermission) === "function") {
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                const permissionState = (DeviceOrientationEvent as any).requestPermission()
                if (permissionState === "denied") {
                  turningOn = false
                }
              }
            }
            setPreferenceBoolean("tiltSensorJoystick", turningOn)
          }
        },
      ]]}
    />
  </span >
}

export default KeyboardButtons
