import { faWrench } from "@fortawesome/free-solid-svg-icons"
import Flyout from "../flyout"
import ConfigButtons from "./configbuttons"
import ControlButtons from "./controlbuttons"
import DebugButtons from "./debugbuttons"
import FullScreenButton from "./fullscreenbutton"
import KeyboardButtons from "./keyboardbuttons"

const ControlPanel = (props: DisplayProps) => {
  return (
    <Flyout icon={faWrench} minWidth={1290} position="top-left">
      <span className="flex-column">
        <span className="flex-row wrap" id="tour-controlbuttons">
          <ControlButtons {...props} />
          <DebugButtons />
          <FullScreenButton />
        </span>
        <ConfigButtons {...props} />
        <KeyboardButtons {...props} />
      </span>
    </Flyout>
  )
}

export default ControlPanel
