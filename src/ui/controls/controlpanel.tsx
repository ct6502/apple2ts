import ConfigButtons from "./configbuttons"
import ControlButtons from "./controlbuttons"
import DebugButtons from "./debugbuttons"
import FullScreenButton from "./fullscreenbutton"
import KeyboardButtons from "./keyboardbuttons"

const ControlPanel = (props: DisplayProps) => {
  return (
    <span className="flex-column">
      <span className="flex-row wrap" id="tour-controlbuttons">
        <ControlButtons {...props} />
        <DebugButtons />
        <FullScreenButton />
      </span>
      <ConfigButtons {...props} />
      <KeyboardButtons {...props} />
    </span>
  )
}

export default ControlPanel
