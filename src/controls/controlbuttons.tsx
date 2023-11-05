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
// import VideogameAssetIcon from '@mui/icons-material/VideogameAsset';
// import VideogameAssetOffIcon from '@mui/icons-material/VideogameAssetOff';

const ControlButtons = (props: DisplayProps) => {  
  return <span className="flexRow">
    <button className="pushButton"
      title="Boot"
      onClick={() => { handleSetCPUState(RUN_MODE.NEED_BOOT) }}>
      <FontAwesomeIcon icon={faPowerOff}/>
    </button>
    <button className="pushButton"
      title="Reset"
      onClick={() => { handleSetCPUState(RUN_MODE.NEED_RESET) }}
      disabled={props.runMode === RUN_MODE.IDLE || props.runMode === RUN_MODE.NEED_BOOT}
      >
      <FontAwesomeIcon icon={faArrowRotateRight}/>
    </button>
    <button className="pushButton" title="Restore State"
      onClick={() => props.handleFileOpen()}>
      <FontAwesomeIcon icon={faFolderOpen} style={{ fontSize: '0.9em' }}/>
    </button>
    <button className="pushButton" title="Save State"
      onClick={() => props.handleFileSave()}
      disabled={props.runMode === RUN_MODE.IDLE || props.runMode === RUN_MODE.NEED_BOOT}
    >
      <FontAwesomeIcon icon={faSave}/>
    </button>
    <button className="pushButton" title="Copy Screen"
      onClick={() => props.handleCopyToClipboard()}>
      <FontAwesomeIcon icon={faClipboard}/>
    </button>
  </span>
}

export default ControlButtons;
