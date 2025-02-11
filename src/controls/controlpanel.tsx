import { faWrench } from "@fortawesome/free-solid-svg-icons";
import ConfigButtons from "./configbuttons";
import ControlButtons from "./controlbuttons";
import DebugButtons from "./debugbuttons";
import FullScreenButton from "./fullscreenbutton";
import KeyboardButtons from "./keyboardbuttons";
import Flyout from "../flyout";

const ControlPanel = (props: DisplayProps) => {
  return (
    <Flyout icon={faWrench} width="auto" position="top-left">
      <div style={{paddingLeft: '4px'}}>
        <span id="tour-controlbuttons">
          <ControlButtons {...props} />
          <DebugButtons />
        </span>
        <ConfigButtons {...props} />
        <span className="flex-row">
          <FullScreenButton />
        </span>
        <KeyboardButtons {...props} />
      </div>
    </Flyout>
  )
}

export default ControlPanel;
