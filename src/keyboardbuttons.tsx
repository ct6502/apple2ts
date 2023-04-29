import { handleAppleCommandKeyPress, handleAppleCommandKeyRelease } from "./main2worker"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faCircle as iconClosedButton,
  // faCircle as iconRightButton,
} from "@fortawesome/free-solid-svg-icons";
import {
  faCircle as iconOpenButton,
} from "@fortawesome/free-regular-svg-icons";

const KeyboardButtons = (props: DisplayProps) => {
  return <span>
    <button className="pushButton" title="Left"
      onMouseDown={() => handleAppleCommandKeyPress(true)}
      onMouseUp={() => handleAppleCommandKeyRelease(true)}>
      <FontAwesomeIcon icon={props.button0 ? iconClosedButton : iconOpenButton}/>
    </button>
    <button className="pushButton" title="Right"
      onMouseDown={() => handleAppleCommandKeyPress(false)}
      onMouseUp={() => handleAppleCommandKeyRelease(false)}>
      <FontAwesomeIcon icon={props.button1 ? iconClosedButton : iconOpenButton}/>
    </button>
  </span>
}

export default KeyboardButtons;
