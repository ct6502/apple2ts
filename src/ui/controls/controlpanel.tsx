import { faWrench } from "@fortawesome/free-solid-svg-icons"
import Flyout from "../flyout"
import ConfigButtons from "./configbuttons"
import ControlButtons from "./controlbuttons"
import DebugButtons from "./debugbuttons"
import FullScreenButton from "./fullscreenbutton"
import KeyboardButtons from "./keyboardbuttons"
import RetroAchievementsButtons from "./retroachievements"
import { useState } from "react"
import { isGameMode } from "../ui_settings"

const ControlPanel = (props: DisplayProps) => {
  const [isFlyoutOpen, setIsFlyoutOpen] = useState(false)

  const handleFlyoutClick = () => {
      setIsFlyoutOpen(!isFlyoutOpen)
  }

  return (
    <Flyout
      icon={faWrench}
      title="settings"
      isOpen={() => { return isFlyoutOpen }}
      onClick={handleFlyoutClick}
      position="top-left">
      <span className="flex-column">
        <span className={isGameMode() ? "flex-row flexwrap" : ""}>
        <span className={isGameMode() ? "flex-row" : "flex-row flexwrap"} id="tour-controlbuttons">
          <ControlButtons {...props} />
          <DebugButtons {...props} />
          <RetroAchievementsButtons {...props} />
          <FullScreenButton />
        </span>
        <ConfigButtons {...props} />
        <KeyboardButtons {...props} />
        </span>
      </span>
    </Flyout>
  )
}

export default ControlPanel
