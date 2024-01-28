import { handleGetLeftButton, handleGetRightButton, passAppleCommandKeyPress, passAppleCommandKeyRelease, passKeypress } from "../main2worker"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faArrowRight,
  faArrowLeft,
  faArrowDown,
  faArrowUp,
} from "@fortawesome/free-solid-svg-icons";
import { appleOutline, appleSolid } from "../img/icons";
import { lockedKeyStyle } from "../emulator/utility/utility";

const KeyboardButtons = (props: DisplayProps) => {
  const arrowKeys = [
    { name: 'Left', icon: faArrowLeft },
    { name: 'Right', icon: faArrowRight },
    { name: 'Up', icon: faArrowUp },
    { name: 'Down', icon: faArrowDown },
  ]
  const isTouchDevice = "ontouchstart" in document.documentElement
  const tryButtonPressRelease = (doTouch: boolean, key: string, press: boolean) => {
    if (doTouch !== isTouchDevice) return
    // If one of our Apple keys is locked, ignore the button press.
    if (key === 'left') {
      if (props.openAppleKeyMode > 0) return
    } else {
      if (props.closedAppleKeyMode > 0) return
    }
    if (press) {
      passAppleCommandKeyPress(key === 'left')
    } else {
      passAppleCommandKeyRelease(key === 'left')
    }
  }
  return <span>{isTouchDevice && <span className="flex-row">
    {arrowKeys.map((key, i) => (
      <button className="pushButton key-button" title={key.name}
        key={key.name}
        onTouchStart={() => props.handleArrowKey(i, false)}
        onTouchEnd={() => props.handleArrowKey(i, true)}
        onMouseDown={() => { if (!isTouchDevice) props.handleArrowKey(i, false) }}
        onMouseUp={() => { if (!isTouchDevice) props.handleArrowKey(i, true) }}
      >
        <FontAwesomeIcon icon={key.icon} />
      </button>
    ))}
    <button className="pushButton key-button" title="Escape"
      onMouseDown={() => passKeypress(String.fromCharCode(27))}>
      <span className="text-key">esc</span>
    </button>
    <button className="pushButton key-button" title="Tab"
      onMouseDown={() => passKeypress(String.fromCharCode(9))}>
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
      {appleOutline}
    </button>
    <button className={lockedKeyStyle(props.closedAppleKeyMode)} title="Closed Apple"
      onMouseDown={() => props.handleClosedAppleDown((props.closedAppleKeyMode + 1) % 3)}>
      {appleSolid}
    </button>
  </span>
  }
    <button className={`joystick-button ${handleGetLeftButton() ? 'joystick-active' : ''}`}
      title="Button 1"
      onTouchStart={() => tryButtonPressRelease(true, 'left', true)}
      onTouchEnd={() => tryButtonPressRelease(true, 'left', false)}
      onMouseDown={() => tryButtonPressRelease(false, 'left', true)}
      onMouseUp={() => tryButtonPressRelease(false, 'left', false)}>
    </button>
    <button className={`joystick-button ${handleGetRightButton() ? 'joystick-active' : ''}`}
      title="Button 2"
      onTouchStart={() => tryButtonPressRelease(true, 'right', true)}
      onTouchEnd={() => tryButtonPressRelease(true, 'right', false)}
      onMouseDown={() => tryButtonPressRelease(false, 'right', true)}
      onMouseUp={() => tryButtonPressRelease(false, 'right', false)}>
    </button>
  </span>
}

export default KeyboardButtons;
