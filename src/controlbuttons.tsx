import { STATE } from "./emulator/utility";
import { handleSetCPUState } from "./main2worker"
import { isAudioEnabled, audioEnable } from "./speaker";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faArrowRotateRight,
  faClipboard,
  faExpand,
  faFolderOpen,
  faPause,
  faPlay,
  faPowerOff,
  faSave,
  faVolumeHigh,
  faVolumeXmark,
  // faCircle as iconRightButton,
} from "@fortawesome/free-solid-svg-icons";

const ControlButtons = (props: DisplayProps) => {
  return <span>
    <button className="pushButton"
      title="Boot"
      onClick={() => {
        handleSetCPUState(STATE.NEED_BOOT)
      }}>
      <FontAwesomeIcon icon={faPowerOff}/>
    </button>
    <button className="pushButton"
      title="Reset"
      onClick={() => {
        handleSetCPUState(STATE.NEED_RESET)
      }}
      disabled={props.machineState === STATE.IDLE || props.machineState === STATE.NEED_BOOT}
      >
      <FontAwesomeIcon icon={faArrowRotateRight}/>
    </button>
    <button className="pushButton"
      title={props.machineState === STATE.PAUSED ? "Resume" : "Pause"}
      onClick={() => {props.machineState === STATE.PAUSED ?
        handleSetCPUState(STATE.RUNNING) : handleSetCPUState(STATE.PAUSED)}}
      disabled={props.machineState === STATE.IDLE}>
      {props.machineState === STATE.PAUSED ?
      <FontAwesomeIcon icon={faPlay}/> :
      <FontAwesomeIcon icon={faPause}/>}
    </button>
    <button className="pushButton"
      title={props.machineState === STATE.PAUSED ? "Unmute" : "Mute"}
      onClick={() => {audioEnable(!isAudioEnabled); props.updateDisplay()}}>
      <FontAwesomeIcon icon={isAudioEnabled ? faVolumeHigh : faVolumeXmark}/>
    </button>
    <button className="pushButton"
      title={props.uppercase ? "Uppercase" : "Lowercase"}
      onClick={props.handleUpperCaseChange}>
      {props.uppercase ? <span>A</span> : <span>a</span>}
    </button>
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
