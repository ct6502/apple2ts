import { colorToName } from "../emulator/utility/utility"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import {
  faVolumeHigh,
  faVolumeXmark,
  faWalking,
  faTruckFast,
  faDisplay,
} from "@fortawesome/free-solid-svg-icons";
import { getColorModeSVG, svgLowercase, svgUppercase } from "../img/icons";
import { MockingboardWaveform } from "../devices/mockingboardwaveform";
import { MidiDeviceSelect } from "../devices/midiselect";
import { audioEnable, isAudioEnabled } from "../devices/speaker";
// import VideogameAssetIcon from '@mui/icons-material/VideogameAsset';
// import VideogameAssetOffIcon from '@mui/icons-material/VideogameAssetOff';

const ConfigButtons = (props: DisplayProps) => {
  // const useArrowKeysAsJoystick = props.useArrowKeysAsJoystick ?
  //   <VideogameAssetIcon className="pushMuiButton" /> :
  //   <VideogameAssetOffIcon className="pushMuiButton" />
  
  return <span className="flex-row">
    <button className="pushButton"
      title={props.speedCheck ? "1 MHz" : "Fast Speed"}
      onClick={() => props.handleSpeedChange(!props.speedCheck)}>
      <FontAwesomeIcon icon={props.speedCheck ? faWalking : faTruckFast}/>
    </button>
    <button className="pushButton"
      title={colorToName(props.colorMode)}
      onClick={() => props.handleColorChange((props.colorMode + 1) % 5)}>
      <span className="fa-layers fa-fw">
        <svg width="20" height="19">
          {getColorModeSVG(props.colorMode)}
        </svg>
        <FontAwesomeIcon icon={faDisplay}/>
      </span>
    </button>
    <button className="pushButton"
      title={"Toggle Sound"}
      style={{display: typeof AudioContext !== 'undefined' ? '' : 'none'}}
      onClick={() => {audioEnable(!isAudioEnabled())}}>
      <FontAwesomeIcon icon={isAudioEnabled() ? faVolumeHigh : faVolumeXmark}/>
    </button>
    <button className="pushButton"
      title={props.uppercase ? "Uppercase" : "Lowercase"}
      onClick={() => props.handleUpperCaseChange(!props.uppercase)}>
      {props.uppercase ? svgUppercase : svgLowercase}
    </button>

    <MockingboardWaveform/>
    <MidiDeviceSelect/>

    {/* <button className="pushButton"
      title={"Keyboard Joystick"}
      onClick={() => props.handleUseArrowKeyJoystick(props.useArrowKeysAsJoystick)}>
      {useArrowKeysAsJoystick}
    </button> */}
  </span>
}

export default ConfigButtons;
