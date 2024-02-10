import { RUN_MODE } from "../emulator/utility/utility"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import {
  faArrowRotateRight,
  faClipboard,
  faFolderOpen,
  faPowerOff,
  faSave,
} from "@fortawesome/free-solid-svg-icons";
import { handleSetCPUState } from "../controller";
import { handleCopyToClipboard } from "../copycanvas";

const ControlButtons = (props: DisplayProps) => {
  return <span className="flex-row">
    <button className="push-button"
      title="Boot"
      onClick={() => { handleSetCPUState(RUN_MODE.NEED_BOOT) }}>
      <FontAwesomeIcon icon={faPowerOff} />
    </button>
    <button className="push-button"
      title="Reset"
      onClick={() => { handleSetCPUState(RUN_MODE.NEED_RESET) }}
      disabled={props.runMode === RUN_MODE.IDLE || props.runMode === RUN_MODE.NEED_BOOT}
    >
      <FontAwesomeIcon icon={faArrowRotateRight} />
    </button>
    <button className="push-button" title="Restore State"
      onClick={() => props.setShowFileOpenDialog(true, 0)}>
      <FontAwesomeIcon icon={faFolderOpen} style={{ fontSize: '0.9em' }} />
    </button>
    <button className="push-button" title="Save State"
      onClick={() => props.handleFileSave(false)}
      disabled={props.runMode === RUN_MODE.IDLE || props.runMode === RUN_MODE.NEED_BOOT}
    >
      <FontAwesomeIcon icon={faSave} />
    </button>
    <button className="push-button" title="Copy Screen"
      onClick={() => handleCopyToClipboard()}>
      <FontAwesomeIcon icon={faClipboard} />
    </button>
  </span>
}

export default ControlButtons;
