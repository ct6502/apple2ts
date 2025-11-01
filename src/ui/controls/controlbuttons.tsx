import { RUN_MODE } from "../../common/utility"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import {
  faArrowRotateRight,
  faClipboard,
  faFolderOpen,
  faPaste,
  faPowerOff,
  faSave,
} from "@fortawesome/free-solid-svg-icons"
import { handleSetCPUState } from "../controller"
import { handleCopyToClipboard } from "../copycanvas"
import { handleGetRunMode, passPasteText } from "../main2worker"
import { handleFileSave } from "../savestate"
import { isGameMode } from "../ui_settings"

const ControlButtons = (props: DisplayProps) => {
  const runMode = handleGetRunMode()
  return <span className="flex-row" id="tour-maincontrols">
    <button className="push-button .boot-button"
      title="Boot"
      id="tour-boot-button"
      onClick={() => { handleSetCPUState(RUN_MODE.NEED_BOOT) }}>
      <FontAwesomeIcon icon={faPowerOff} />
    </button>
    <button className="push-button"
      title="Reset"
      id="tour-reset-button"
      onClick={() => { handleSetCPUState(RUN_MODE.NEED_RESET) }}
      disabled={runMode === RUN_MODE.IDLE || runMode === RUN_MODE.NEED_BOOT}
    >
      <FontAwesomeIcon icon={faArrowRotateRight} />
    </button>
    {!isGameMode() &&
      <span id="tour-saverestore" className="flex-row">
      <button className="push-button" title="Restore State"
        onClick={() => props.setShowFileOpenDialog(true, 0)}>
        <FontAwesomeIcon icon={faFolderOpen} style={{ fontSize: "0.9em" }} />
      </button>
      <button className="push-button" title="Save State"
        onClick={() => handleFileSave(false)}
        disabled={runMode === RUN_MODE.IDLE || runMode === RUN_MODE.NEED_BOOT}>
        <FontAwesomeIcon icon={faSave} />
      </button>
      </span>
    }
    <button className="push-button" title="Copy Screen"
      onClick={() => handleCopyToClipboard()}>
      <FontAwesomeIcon icon={faClipboard} />
    </button>
    <button className="push-button" title="Paste Text"
      onClick={() => {
        navigator.clipboard.readText().then((data) => passPasteText(data))
      }}>
      <FontAwesomeIcon icon={faPaste} />
    </button>
  </span>
}

export default ControlButtons
