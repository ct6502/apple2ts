import { STATE, colorToName } from "../emulator/utility/utility";
import { passGoBackInTime, passGoForwardInTime,
  handleCanGoBackward, handleCanGoForward } from "../main2worker"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faArrowRotateRight,
  faBug,
  faBugSlash,
  faClipboard,
  faExpand,
  faFastBackward,
  faFastForward,
  faFolderOpen,
  faPause,
  faPlay,
  faPowerOff,
  faSave,
  faVolumeHigh,
  faVolumeXmark,
  faWalking,
  faTruckFast,
  faDisplay,
} from "@fortawesome/free-solid-svg-icons";
import { getColorModeSVG, svgLowercase, svgUppercase } from "../img/icons";
import { MockingboardWaveform } from "../devices/mockingboardwaveform";
// import VideogameAssetIcon from '@mui/icons-material/VideogameAsset';
// import VideogameAssetOffIcon from '@mui/icons-material/VideogameAssetOff';

const ControlButtons = (props: DisplayProps) => {
  const isTouchDevice = "ontouchstart" in document.documentElement
  // const useArrowKeysAsJoystick = props.useArrowKeysAsJoystick ?
  //   <VideogameAssetIcon className="pushMuiButton" /> :
  //   <VideogameAssetOffIcon className="pushMuiButton" />
  
  return <span className="flexRow">
    <button className="pushButton"
      title="Boot"
      onClick={() => { props.handleSetCPUState(STATE.NEED_BOOT) }}>
      <FontAwesomeIcon icon={faPowerOff}/>
    </button>
    <button className="pushButton"
      title="Reset"
      onClick={() => { props.handleSetCPUState(STATE.NEED_RESET) }}
      disabled={props.machineState === STATE.IDLE || props.machineState === STATE.NEED_BOOT}
      >
      <FontAwesomeIcon icon={faArrowRotateRight}/>
    </button>
    <button className="pushButton"
      title={props.machineState === STATE.PAUSED ? "Resume" : "Pause"}
      onClick={() => {
        props.handleSetCPUState(props.machineState === STATE.PAUSED ?
          STATE.RUNNING : STATE.PAUSED)
      }}
      disabled={props.machineState === STATE.IDLE}>
      {props.machineState === STATE.PAUSED ?
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
      onClick={() => {props.handleAudioChange(!props.audioEnable)}}>
      <FontAwesomeIcon icon={props.audioEnable ? faVolumeHigh : faVolumeXmark}/>
    </button>
    <button className="pushButton"
      title={props.uppercase ? "Uppercase" : "Lowercase"}
      onClick={() => props.handleUpperCaseChange(!props.uppercase)}>
      {props.uppercase ? svgUppercase : svgLowercase}
    </button>

    <MockingboardWaveform mode={props.mockingboardMode} change={props.handleMockingboardMode}/>

    {/* <button className="pushButton"
      title={"Keyboard Joystick"}
      onClick={() => props.handleUseArrowKeyJoystick(props.useArrowKeysAsJoystick)}>
      {useArrowKeysAsJoystick}
    </button> */}
    <button className="pushButton" title="Restore State"
      onClick={() => props.handleFileOpen()}>
      <FontAwesomeIcon icon={faFolderOpen}/>
    </button>
    <button className="pushButton" title="Save State"
      onClick={() => props.handleFileSave()}
      disabled={props.machineState === STATE.IDLE || props.machineState === STATE.NEED_BOOT}
    >
      <FontAwesomeIcon icon={faSave}/>
    </button>
    <button className="pushButton" title="Copy Screen"
      onClick={() => props.handleCopyToClipboard()}>
      <FontAwesomeIcon icon={faClipboard}/>
    </button>
    <button className="pushButton" title="Toggle Debug"
      onClick={() => props.handleDebugChange(!props.doDebug)}>
      <FontAwesomeIcon icon={props.doDebug ? faBug : faBugSlash}/>
    </button>
    <button className="pushButton" title="Full Screen"
      style={{display: isTouchDevice ? 'none' : ''}}
      onClick={() => {
        const context = props.myCanvas.current
        if (context) {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          let requestFullScreen: any
          if ('webkitRequestFullscreen' in context) {
            requestFullScreen = context.webkitRequestFullscreen
          } else if ('mozRequestFullScreen' in context) {
            requestFullScreen = context.mozRequestFullScreen
          } else if ('msRequestFullscreen' in context) {
            requestFullScreen = context.msRequestFullscreen
          } else if ('requestFullscreen' in context) {
            requestFullScreen = context.requestFullscreen
          }
          if (requestFullScreen) {
            requestFullScreen.call(context);
          }
        }
      }
        }>
      <FontAwesomeIcon icon={faExpand}/>
    </button>
  </span>
}

export default ControlButtons;
