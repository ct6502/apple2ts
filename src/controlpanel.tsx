import ControlButtons from "./controlbuttons";
import KeyboardButtons from "./keyboardbuttons";

const ControlPanel = (props: DisplayProps) => {
  return (
    <span>
      <ControlButtons {...props}/>
      <br/>
      <KeyboardButtons {...props}/>
      <br/>
      {/* <span className="statusItem">
        <span className="fixed">{toHex(props.s6502.PC, 4)}</span>
      </span> */}
    </span>
  )
}

export default ControlPanel;
