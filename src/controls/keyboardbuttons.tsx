import { passAppleCommandKeyPress, passAppleCommandKeyRelease, passKeypress, passSetGamepads } from "../main2worker"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faArrowRight,
  faArrowLeft,
  faArrowDown,
  faArrowUp,
} from "@fortawesome/free-solid-svg-icons";
import { appleOutline, appleSolid } from "../img/icons";
import { ARROW } from "../emulator/utility/utility";

const arrowGamePad = [0, 0]

// eslint-disable-next-line react-refresh/only-export-components
export const handleArrowKey = (key: ARROW, release: boolean) => {

  if (!release) {
    let code = 0
    switch (key) {
      case ARROW.LEFT: code = 8; arrowGamePad[0] = -1; break
      case ARROW.RIGHT: code = 21; arrowGamePad[0] = 1; break
      case ARROW.UP: code = 11; arrowGamePad[1] = -1; break
      case ARROW.DOWN: code = 10; arrowGamePad[1] = 1; break
    }
    passKeypress(String.fromCharCode(code))
  } else {
    switch (key) {
      case ARROW.LEFT: // fall thru
      case ARROW.RIGHT: arrowGamePad[0] = 0; break
      case ARROW.UP: // fall thru
      case ARROW.DOWN: arrowGamePad[1] = 0; break
    }
  }

  const gamePads: EmuGamepad[] = [{
      axes: [arrowGamePad[0], arrowGamePad[1], 0, 0],
      buttons: []
  }]
  passSetGamepads(gamePads)
}

const KeyboardButtons = (props: DisplayProps) => {
  const arrowKeys = [
    {name: 'Left', icon: faArrowLeft},
    {name: 'Right', icon: faArrowRight},
    {name: 'Up', icon: faArrowUp},
    {name: 'Down', icon: faArrowDown},
  ]
  return <span>
    <button className={`pushButton keyButton ${props.button0 ? 'isButtonActive' : ''}`} title="Open Apple"
      onTouchStart={() => passAppleCommandKeyPress(true)}
      onTouchEnd={() => passAppleCommandKeyRelease(true)}
      onMouseDown={() => passAppleCommandKeyPress(true)}
      onMouseUp={() => passAppleCommandKeyRelease(true)}>
      {appleOutline}
    </button>
    <button className={`pushButton keyButton ${props.button1 ? 'isButtonActive' : ''}`} title="Closed Apple"
      onTouchStart={() => passAppleCommandKeyPress(false)}
      onTouchEnd={() => passAppleCommandKeyRelease(false)}
      onMouseDown={() => passAppleCommandKeyPress(false)}
      onMouseUp={() => passAppleCommandKeyRelease(false)}>
      {appleSolid}
    </button>
     {arrowKeys.map((key, i) => (
        <button className="pushButton keyButton" title={key.name}
          key={key.name}
          onTouchStart={() => handleArrowKey(i, false)}
          onTouchEnd={() => handleArrowKey(i, true)}
          onMouseDown={() => handleArrowKey(i, false)}
          onMouseUp={() => handleArrowKey(i, true)}
        >
          <FontAwesomeIcon icon={key.icon}/>
        </button>
     ))}
    <button className="pushButton keyButton" title="Escape"
      onMouseDown={() => passKeypress(String.fromCharCode(27))}>
      <span className="textKey">esc</span>
    </button>
    <button className="pushButton keyButton" title="Tab"
      onMouseDown={() => passKeypress(String.fromCharCode(9))}>
      <span className="textKey">tab</span>
    </button>
  </span>
}

export default KeyboardButtons;
