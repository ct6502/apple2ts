import {
  handleGetLeftButton, handleGetRightButton, passAppleCommandKeyPress,
  passAppleCommandKeyRelease
  } from "../main2worker"
import LanguageSwitch from "./languageswitch"
const KeyboardButtons = (props: DisplayProps) => {

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
  </span >
}

export default KeyboardButtons
