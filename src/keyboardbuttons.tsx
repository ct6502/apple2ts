import { handleAppleCommandKeyPress, handleAppleCommandKeyRelease, handleKeyboardBuffer } from "./main2worker"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faArrowRight,
  faArrowLeft,
  faArrowDown,
  faArrowUp,
} from "@fortawesome/free-solid-svg-icons";
import { appleOutline, appleSolid } from "./appleicons";

const KeyboardButtons = (props: DisplayProps) => {
  return <span>
    <button className={`pushButton keyButton ${props.button0 ? 'isActive' : ''}`} title="Open Apple"
      onMouseDown={() => handleAppleCommandKeyPress(true)}
      onMouseUp={() => handleAppleCommandKeyRelease(true)}>
      {appleOutline}
    </button>
    <button className={`pushButton keyButton ${props.button1 ? 'isActive' : ''}`} title="Closed Apple"
      onMouseDown={() => handleAppleCommandKeyPress(false)}
      onMouseUp={() => handleAppleCommandKeyRelease(false)}>
      {appleSolid}
    </button>
    <button className="pushButton keyButton" title="Escape"
      onMouseDown={() => handleKeyboardBuffer(String.fromCharCode(27))}>
      <span className="textKey">esc</span>
    </button>
    <button className="pushButton keyButton" title="Left"
      onMouseDown={() => handleKeyboardBuffer(String.fromCharCode(8))}>
      <FontAwesomeIcon icon={faArrowLeft}/>
    </button>
    <button className="pushButton keyButton" title="Right"
      onMouseDown={() => handleKeyboardBuffer(String.fromCharCode(21))}>
      <FontAwesomeIcon icon={faArrowRight}/>
    </button>
    <button className="pushButton keyButton" title="Up"
      onMouseDown={() => handleKeyboardBuffer(String.fromCharCode(11))}>
      <FontAwesomeIcon icon={faArrowUp}/>
    </button>
    <button className="pushButton keyButton" title="Down"
      onMouseDown={() => handleKeyboardBuffer(String.fromCharCode(10))}>
      <FontAwesomeIcon icon={faArrowDown}/>
    </button>
  </span>
}

export default KeyboardButtons;
