import { RUN_MODE } from "../emulator/utility/utility"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import {
  faArrowRotateRight,
  faClipboard,
  faFolderOpen,
  faPaste,
  faPowerOff,
  faSave,
} from "@fortawesome/free-solid-svg-icons";
import { handleSetCPUState } from "../controller";
import { handleCopyToClipboard } from "../copycanvas";
import { handleGetRunMode, passPasteText } from "../main2worker";
import { handleFileSave } from "../fileoutput";

const ControlButtons = (props: DisplayProps) => {
  const runMode = handleGetRunMode()
  return <span className="flex-row">
    <button className="push-button"
      title="Boot"
      onClick={() => { handleSetCPUState(RUN_MODE.NEED_BOOT) }}>
      <FontAwesomeIcon icon={faPowerOff} />
    </button>
    <button className="push-button"
      title="Reset"
      onClick={() => { handleSetCPUState(RUN_MODE.NEED_RESET) }}
      disabled={runMode === RUN_MODE.IDLE || runMode === RUN_MODE.NEED_BOOT}
    >
      <FontAwesomeIcon icon={faArrowRotateRight} />
    </button>
    <button className="push-button" title="Restore State"
      onClick={() => props.setShowFileOpenDialog(true, 0)}>
      <FontAwesomeIcon icon={faFolderOpen} style={{ fontSize: '0.9em' }} />
    </button>
    <button className="push-button" title="Save State"
      onClick={() => handleFileSave(false)}
      disabled={runMode === RUN_MODE.IDLE || runMode === RUN_MODE.NEED_BOOT}
    >
      <FontAwesomeIcon icon={faSave} />
    </button>
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

export default ControlButtons;
