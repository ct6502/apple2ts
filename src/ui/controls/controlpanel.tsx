import { faWrench } from "@fortawesome/free-solid-svg-icons"
import Flyout from "../flyout"
import ConfigButtons from "./configbuttons"
import ControlButtons from "./controlbuttons"
import DebugButtons from "./debugbuttons"
import FullScreenButton from "./fullscreenbutton"
import KeyboardButtons from "./keyboardbuttons"
import { useTranslation } from "../../i18n/useTranslation"
import { useState } from "react"
import { isGameMode } from "../ui_settings"

const ControlPanel = (props: DisplayProps & { singleRow?: boolean }) => {
  const [isFlyoutOpen, setIsFlyoutOpen] = useState(false)
  const { t } = useTranslation()

  const handleFlyoutClick = () => {
      setIsFlyoutOpen(!isFlyoutOpen)
  }

  return (
    <Flyout
      icon={faWrench}
      title={t("controls.settings")}
      isOpen={() => { return isFlyoutOpen }}
      onClick={handleFlyoutClick}
      position="top-left">
      {props.singleRow ?
        <div className="control-panel-two-rows">
          <div className="control-panel-row">
            <ControlButtons {...props} />
            <DebugButtons {...props} />
            <FullScreenButton />
          </div>
          <div className="control-panel-row">
            <ConfigButtons {...props} />
            <KeyboardButtons {...props} />
          </div>
        </div> :
      <span className="flex-column">
        <span className={isGameMode() ? "flex-row flexwrap" : ""}>
          <span className={isGameMode() ? "flex-row" : "flex-row flexwrap"} id="tour-controlbuttons">
            <ControlButtons {...props} />
            <DebugButtons {...props} />
            <FullScreenButton />
          </span>
          <ConfigButtons {...props} />
          <KeyboardButtons {...props} />
        </span>
      </span>}
    </Flyout>
  )
}

export default ControlPanel
