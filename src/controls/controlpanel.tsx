import ConfigButtons from "./configbuttons";
import ControlButtons from "./controlbuttons";
import DebugButtons from "./debugbuttons";
import FullScreenButton from "./fullscreenbutton";
import KeyboardButtons from "./keyboardbuttons";

const ControlPanel = (props: DisplayProps) => {
  return (
    <span className="flex-column">
      <span className="flex-row wrap">
        <ControlButtons {...props}/>
        <DebugButtons {...props}/>
        <FullScreenButton {...props}/>
      </span>
      <ConfigButtons {...props}/>
      <KeyboardButtons/>
    </span>
  )
}

export default ControlPanel;
