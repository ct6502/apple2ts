import ControlButtons from "./controlbuttons";
import KeyboardButtons from "./keyboardbuttons";

const ControlPanel = (props: DisplayProps) => {
  return (
    <span>
      <ControlButtons {...props}/>
      <br/>
      <KeyboardButtons {...props}/>
      <br/>
    </span>
  )
}

export default ControlPanel;
