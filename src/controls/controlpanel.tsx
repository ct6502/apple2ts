import ControlButtons from "./controlbuttons";
import KeyboardButtons from "./keyboardbuttons";

const ControlPanel = (props: DisplayProps) => {
  return (
    <span className="flexColumn">
      <ControlButtons {...props}/>
      <KeyboardButtons {...props}/>
    </span>
  )
}

export default ControlPanel;
