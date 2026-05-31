import {
  handleGetLeftButton, handleGetRightButton, passAppleCommandKeyPress,
  passAppleCommandKeyRelease
  } from "../main2worker"
import PopupMenu from "./popupmenu"
import { useState } from "react"
import { setPreferenceTiltSensorJoystick, setPreferenceTouchJoystickMode, setPreferenceTouchJoystickSensitivity } from "../localstorage"
import { getTiltSensorJoystick, getTouchJoyStickMode, getTouchJoystickSensitivity } from "../ui_settings"

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
    {!isTouchDevice && <>
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
      </>
    }
    <PopupMenu
      location={popupLocation}
      onClose={() => { setPopupLocation(undefined) }}
      menuItems={[[
        {
          label: "Disabled",
          isSelected: () => { return getTouchJoyStickMode() === "off" },
          onClick: () => { setPreferenceTouchJoystickMode("off"); props.updateDisplay() }
        },
        {
          label: "Enabled: Right-Handed",
          isSelected: () => { return getTouchJoyStickMode() === "right" },
          onClick: () => { setPreferenceTouchJoystickMode("right"); props.updateDisplay() }
        },
        {
          label: "Enabled: Left-Handed",
          isSelected: () => { return getTouchJoyStickMode() === "left" },
          onClick: () => { setPreferenceTouchJoystickMode("left"); props.updateDisplay() }
        },
        { label: "-" },
        {
          label: "Sensitivity: High",
          isSelected: () => { return getTouchJoystickSensitivity() == 1 },
          onClick: () => { setPreferenceTouchJoystickSensitivity(1) }
        },
        {
          label: "Sensitivity: Normal",
          isSelected: () => { return getTouchJoystickSensitivity() == 2 },
          onClick: () => { setPreferenceTouchJoystickSensitivity(2) }
        },
        {
          label: "Sensitivity: Low",
          isSelected: () => { return getTouchJoystickSensitivity() == 3 },
          onClick: () => { setPreferenceTouchJoystickSensitivity(3) }
        },
        { label: "-" },
        {
          label: "Use Tilt Sensor as Joystick",
          isSelected: () => { return getTiltSensorJoystick() },
          onClick: () => {
            let turningOn = !getTiltSensorJoystick()
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
            setPreferenceTiltSensorJoystick(turningOn)
          }
        },
      ]]}
    />
  </span >
}

export default KeyboardButtons
