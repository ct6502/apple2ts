import { faWrench } from "@fortawesome/free-solid-svg-icons"
import Flyout from "../flyout"
import ConfigButtons from "./configbuttons"
import ControlButtons from "./controlbuttons"
import DebugButtons from "./debugbuttons"
import FullScreenButton from "./fullscreenbutton"
import KeyboardButtons from "./keyboardbuttons"
import { useState } from "react"

const ControlPanel = (props: DisplayProps) => {
  const [isFlyoutOpen, setIsFlyoutOpen] = useState(false)

  return (
    <Flyout
      icon={faWrench}
      isOpen={() => { return isFlyoutOpen }}
      onClick={() => { setIsFlyoutOpen(!isFlyoutOpen) }}
      position="top-left">
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
