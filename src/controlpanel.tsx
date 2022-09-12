import { getProcessorStatus, STATE } from "./utility";
import { getAudioContext } from "./speaker";
import parse from "html-react-parser"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faArrowRotateRight,
  faExpand,
  faFolderOpen,
  faPause,
  faPlay,
  faPowerOff,
  faSave
} from "@fortawesome/free-solid-svg-icons";

const ControlPanel = (props: DisplayProps) => {
  return (
    <span>
      <span>
        <button
          title="Boot"
          onClick={() => {
            if (getAudioContext().state !== "running") {
              getAudioContext().resume();
            }
            props.handle6502StateChange(STATE.NEED_BOOT)
          }}>
          <FontAwesomeIcon icon={faPowerOff}/>
        </button>
        <button
          title="Reset"
          onClick={() => {
            if (getAudioContext().state !== "running") {
              getAudioContext().resume();
            }
            props.handle6502StateChange(STATE.NEED_RESET)
          }}
          disabled={props._6502 === STATE.IDLE || props._6502 === STATE.NEED_BOOT}
          >
          <FontAwesomeIcon icon={faArrowRotateRight}/>
        </button>
        <button
          title={props._6502 === STATE.PAUSED ? "Resume" : "Pause"}
          onClick={props.handlePause}
          disabled={props._6502 === STATE.IDLE}>
          {props._6502 === STATE.PAUSED ?
          <FontAwesomeIcon icon={faPlay}/> :
          <FontAwesomeIcon icon={faPause}/>}
        </button>
        <button title="Restore State"
          onClick={() => props.handleFileOpen()}>
          <FontAwesomeIcon icon={faFolderOpen}/>
        </button>
        <button title="Save State"
          onClick={() => props.handleFileSave()}
          disabled={props._6502 === STATE.IDLE || props._6502 === STATE.NEED_BOOT}
        >
          <FontAwesomeIcon icon={faSave}/>
        </button>
        <button title="Full Screen"
          onClick={() => props.myCanvas.current?.requestFullscreen()}>
          <FontAwesomeIcon icon={faExpand}/>
        </button>
      </span>
      <br/>

      <span className="statusItem">
        <span className="fixed">{props.speed}</span> MHz
      </span>
      <span className="statusItem">
        <label>
          <input
            type="checkbox"
            checked={props.speedCheck}
            onChange={props.handleSpeedChange}
          />
          Limit speed
        </label>
      </span>
      <span className="statusItem">
        <label>
          <input
            type="checkbox"
            checked={props.uppercase}
            onChange={props.handleUpperCaseChange}
          />
          Uppercase
        </label>
      </span>
      <span className="statusItem">
        <label>
          <input
            type="checkbox"
            checked={props.isColor}
            onChange={props.handleColorChange}
          />
          Color
        </label>
      </span>
      <br />

      <span className="statusItem">
        <span className="fixed">{parse(getProcessorStatus(props.s6502))}</span>
      </span>
    </span>
  )
}

export default ControlPanel;
