import { RUN_MODE } from "../emulator/utility/utility";
import { passGoBackInTime, passGoForwardInTime,
  handleCanGoBackward, handleCanGoForward } from "../main2worker"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faBug,
  faBugSlash,
  faFastBackward,
  faFastForward,
  faPause,
  faPlay,
} from "@fortawesome/free-solid-svg-icons";
import { handleSetCPUState } from "../controller";
// import VideogameAssetIcon from '@mui/icons-material/VideogameAsset';
// import VideogameAssetOffIcon from '@mui/icons-material/VideogameAssetOff';

const DebugButtons = (props: DisplayProps) => {  
  return <span className="flexRow">
    <button className="pushButton"
      title={props.runMode === RUN_MODE.PAUSED ? "Resume" : "Pause"}
      onClick={() => {
        handleSetCPUState(props.runMode === RUN_MODE.PAUSED ?
          RUN_MODE.RUNNING : RUN_MODE.PAUSED)
      }}
      disabled={props.runMode === RUN_MODE.IDLE}>
      {props.runMode === RUN_MODE.PAUSED ?
      <FontAwesomeIcon icon={faPlay}/> :
      <FontAwesomeIcon icon={faPause}/>}
    </button>
    <button className="pushButton"
      title={"Go back in time"}
      onClick={passGoBackInTime}
      disabled={!handleCanGoBackward()}>
      <FontAwesomeIcon icon={faFastBackward}/>
    </button>
    <button className="pushButton"
      title={"Go forward in time"}
      onClick={passGoForwardInTime}
      disabled={!handleCanGoForward()}>
      <FontAwesomeIcon icon={faFastForward}/>
    </button>
    <button className="pushButton" title="Toggle Debug"
      onClick={() => props.handleDebugChange(!props.doDebug)}>
      <FontAwesomeIcon icon={props.doDebug ? faBug : faBugSlash}/>
    </button>
  </span>
}

export default DebugButtons;
