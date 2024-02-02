import { RUN_MODE } from "../emulator/utility/utility";
import {
  passGoBackInTime, passGoForwardInTime,
  handleCanGoBackward, handleCanGoForward, passTimeTravelSnapshot, handleGetIsDebugging, passSetDebug
} from "../main2worker"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faBug,
  faBugSlash,
  faCamera,
  faFastBackward,
  faFastForward,
  faPause,
  faPlay,
} from "@fortawesome/free-solid-svg-icons";
import multiSave from '../img/multiSave.svg';
import { handleSetCPUState } from "../controller";

const DebugButtons = (props: DisplayProps) => {
  const notStarted = props.runMode === RUN_MODE.IDLE || props.runMode === RUN_MODE.NEED_BOOT;
  return <span className="flex-row">
    <button className="pushButton"
      title={props.runMode === RUN_MODE.PAUSED ? "Resume" : "Pause"}
      onClick={() => {
        handleSetCPUState(props.runMode === RUN_MODE.PAUSED ?
          RUN_MODE.RUNNING : RUN_MODE.PAUSED)
      }}
      disabled={props.runMode === RUN_MODE.IDLE}>
      {props.runMode === RUN_MODE.PAUSED ?
        <FontAwesomeIcon icon={faPlay} /> :
        <FontAwesomeIcon icon={faPause} />}
    </button>
    <button className="pushButton"
      title={"Go Back in Time"}
      onClick={passGoBackInTime}
      disabled={notStarted || !handleCanGoBackward()}>
      <FontAwesomeIcon icon={faFastBackward} />
    </button>
    <button className="pushButton"
      title={"Take a Snapshot"}
      onClick={passTimeTravelSnapshot}
      disabled={notStarted}>
      <FontAwesomeIcon icon={faCamera} />
    </button>
    <button className="pushButton"
      title={"Go Forward in Time"}
      onClick={passGoForwardInTime}
      disabled={notStarted || !handleCanGoForward()}>
      <FontAwesomeIcon icon={faFastForward} />
    </button>
    <button className="pushButton"
      title={"Save State with Snapshots"}
      onClick={() => props.handleFileSave(true)}
      disabled={notStarted}>
      <img src={multiSave} alt="Save Snapshots" width={23} height={23} />
    </button>
    <button className="pushButton" title="Toggle Debug"
      onClick={() => passSetDebug(!handleGetIsDebugging())}>
      <FontAwesomeIcon icon={handleGetIsDebugging() ? faBug : faBugSlash} />
    </button>
  </span>
}

export default DebugButtons;
