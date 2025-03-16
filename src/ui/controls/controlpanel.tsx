import { faWrench } from "@fortawesome/free-solid-svg-icons"
import Flyout from "../flyout"
import ConfigButtons from "./configbuttons"
import ControlButtons from "./controlbuttons"
import DebugButtons from "./debugbuttons"
import FullScreenButton from "./fullscreenbutton"
import KeyboardButtons from "./keyboardbuttons"
import { useState } from "react"
import { getPreferenceFirstRunMinimal, setPreferenceFirstRunMinimal } from "../localstorage"

const ControlPanel = (props: DisplayProps) => {
  const [isFlyoutOpen, setIsFlyoutOpen] = useState(false)
  const showHighlight = getPreferenceFirstRunMinimal()

  const handleFlyoutClick = () => {
    if (showHighlight) {
      setPreferenceFirstRunMinimal(false)
    }

    setIsFlyoutOpen(!isFlyoutOpen)
  }

  return (
    <Flyout
      icon={faWrench}
      title="settings"
      highlight={showHighlight}
      isOpen={() => { return isFlyoutOpen }}
      onClick={handleFlyoutClick}
      position="top-left">
      <span className="flex-column">
        <span className="flex-row wrap" id="tour-controlbuttons">
          <ControlButtons {...props} />
          <DebugButtons {...props} />
          <FullScreenButton />
        </span>
        <ConfigButtons {...props} />
        <KeyboardButtons {...props} />
      </span>
    </Flyout>
  )
}

export default ControlPanel
