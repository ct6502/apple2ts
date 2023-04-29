import { colorToName } from "./emulator/utility";
import ControlButtons from "./controlbuttons";
import KeyboardButtons from "./keyboardbuttons";

const ControlPanel = (props: DisplayProps) => {
  return (
    <span>
      <ControlButtons {...props}/>
      <br/>
      <KeyboardButtons {...props}/>
      <br/>

      <span className="statusItem">
        <label>
          <input
            type="checkbox"
            checked={props.speedCheck}
            onChange={props.handleSpeedChange}
          />
          1 MHz
        </label>
      </span>
      <span className="statusItem">
        <select value={colorToName(props.colorMode)} onChange={props.handleColorChange}>
          <option value="Color">Color</option>
          <option value="Color (no fringe)">Color (no fringe)</option>
          <option value="Green">Green</option>
          <option value="Amber">Amber</option>
        </select>
      </span>
      <br />
      <span className="statusItem">
        <span className="fixed">{props.speed}</span> MHz
      </span>
      {/* <span className="statusItem">
        <span className="fixed">{toHex(props.s6502.PC, 4)}</span>
      </span> */}
    </span>
  )
}

export default ControlPanel;
