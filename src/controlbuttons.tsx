import { COLOR_MODE, DRIVE, STATE, colorToName } from "./emulator/utility";
import { passSetCPUState, passGoBackInTime, passGoForwardInTime,
  handleCanGoBackward, handleCanGoForward } from "./main2worker"
import { isAudioEnabled, audioEnable } from "./speaker";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faArrowRotateRight,
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
  faWaveSquare,
} from "@fortawesome/free-solid-svg-icons";
import { doPlayDriveSound } from "./diskinterface";
// import VideogameAssetIcon from '@mui/icons-material/VideogameAsset';
// import VideogameAssetOffIcon from '@mui/icons-material/VideogameAssetOff';

const ControlButtons = (props: DisplayProps) => {
  const svgSawtooth = <svg viewBox="0 0 20 20">
  <polyline style={{fill: 'none', stroke: 'black', strokeWidth: '2.5px', strokeLinecap: 'round', strokeMiterlimit: 7.46}}
  points="0 9.847 6.379 3.135 6.269 16.048 14.035 3.611 13.973 16.424 19.5 9.348"/>
</svg>

  let svgRect: any
  switch (props.colorMode) {
    case COLOR_MODE.COLOR:
      svgRect = <svg>
        <rect width={5} height={14} fill="#00ff00"/>
        <rect width={5} height={14} x={5} fill="#ff00ff"/>
        <rect width={5} height={14} x={10} fill="#007fff"/>
        <rect width={5} height={14} x={15} fill="#ff7f00"/>
      </svg>
      break
    case COLOR_MODE.NOFRINGE:
      svgRect = <rect width={20} height={14} fill="#ffffff"/>
      break
    case COLOR_MODE.GREEN:
      svgRect = <rect width={20} height={14} fill="#39FF14" opacity={0.5}/>
      break;
    case COLOR_MODE.AMBER:
      svgRect = <rect width={20} height={14} fill="#FFA500" opacity={0.75}/>
      break;
    case COLOR_MODE.BLACKANDWHITE:
      svgRect = <svg>
        <rect width={10} height={14} fill="#000000"/>
        <rect width={10} height={14} x={10} fill="#F0F0F0"/>
      </svg>
      break;
    default:
      break;
  }
  const isTouchDevice = "ontouchstart" in document.documentElement
  // const useArrowKeysAsJoystick = props.useArrowKeysAsJoystick ?
  //   <VideogameAssetIcon className="pushMuiButton" /> :
  //   <VideogameAssetOffIcon className="pushMuiButton" />


  return <span>
    <button className="pushButton"
      title="Boot"
      onClick={() => {
        doPlayDriveSound(DRIVE.REQUEST_AUDIO)
        passSetCPUState(STATE.NEED_BOOT)
      }}>
      <FontAwesomeIcon icon={faPowerOff}/>
    </button>
    <button className="pushButton"
      title="Reset"
      onClick={() => {
        passSetCPUState(STATE.NEED_RESET)
      }}
      disabled={props.machineState === STATE.IDLE || props.machineState === STATE.NEED_BOOT}
      >
      <FontAwesomeIcon icon={faArrowRotateRight}/>
    </button>
    <button className="pushButton"
      title={props.machineState === STATE.PAUSED ? "Resume" : "Pause"}
      onClick={() => {props.machineState === STATE.PAUSED ?
        passSetCPUState(STATE.RUNNING) : passSetCPUState(STATE.PAUSED)}}
      disabled={props.machineState === STATE.IDLE}>
      {props.machineState === STATE.PAUSED ?
      <FontAwesomeIcon icon={faPlay}/> :
      <FontAwesomeIcon icon={faPause}/>}
    </button>
    <button className="pushButton"
      title={"Go back in time"}
      onClick={passGoBackInTime}
      disabled={handleCanGoBackward()}>
      <FontAwesomeIcon icon={faFastBackward}/>
    </button>
    <button className="pushButton"
      title={"Go forward in time"}
      onClick={passGoForwardInTime}
      disabled={handleCanGoForward()}>
      <FontAwesomeIcon icon={faFastForward}/>
    </button>
    <button className="pushButton"
      title={props.speedCheck ? "1 MHz" : "Fast Speed"}
      onClick={props.handleSpeedChange}>
      <FontAwesomeIcon icon={props.speedCheck ? faWalking : faTruckFast}/>
    </button>
    <button className="pushButton"
      title={colorToName(props.colorMode)}
      onClick={props.handleColorChange}>
      <span className="fa-layers fa-fw">
        <svg width="20" height="19">
          {svgRect}
        </svg>
        <FontAwesomeIcon icon={faDisplay}/>
      </span>
    </button>
    <button className="pushButton"
      title={"Toggle Sound"}
      style={{display: typeof AudioContext !== 'undefined' ? '' : 'none'}}
      onClick={() => {audioEnable(!isAudioEnabled); props.updateDisplay()}}>
      <FontAwesomeIcon icon={isAudioEnabled ? faVolumeHigh : faVolumeXmark}/>
    </button>
    <button className="pushButton"
      title={props.uppercase ? "Uppercase" : "Lowercase"}
      onClick={props.handleUpperCaseChange}>
      {props.uppercase ? <span>A</span> : <span>a</span>}
    </button>
    <button className="pushButton"
      title="Mockingboard Mode"
      onClick={props.handleMockingboardMode}>
      {(props.mockingboardMode === 1) ?
        <svg className="svg-inline--fa" width="30" height="30">{svgSawtooth}</svg> :
      <FontAwesomeIcon icon={faWaveSquare}/>}
    </button>
    {/* <button className="pushButton"
      title={"Keyboard Joystick"}
      onClick={props.handleUseArrowKeyJoystick}>
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
    <button className="pushButton" title="Full Screen"
      style={{display: isTouchDevice ? 'none' : ''}}
      onClick={() => {
        const context = props.myCanvas.current
        if (context) {
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
