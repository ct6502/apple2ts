import { STATE } from "./emulator/utility";
import { handleSetCPUState } from "./main2worker"
import { getAudioContext } from "./speaker";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faArrowRotateRight,
  faCopy,
  faExpand,
  faFolderOpen,
  faPause,
  faPlay,
  faPowerOff,
  faSave,
} from "@fortawesome/free-solid-svg-icons";
import {
  faSquareCaretLeft as iconLeftArrow,
  faSquareCaretRight as iconRightArrow,
  faSquareCaretUp as iconUpArrow,
  faSquareCaretDown as iconDownArrow,
} from "@fortawesome/free-regular-svg-icons";

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
            handleSetCPUState(STATE.NEED_BOOT)
          }}>
          <FontAwesomeIcon icon={faPowerOff}/>
        </button>
        <button
          title="Reset"
          onClick={() => {
            if (getAudioContext().state !== "running") {
              getAudioContext().resume();
            }
            handleSetCPUState(STATE.NEED_RESET)
          }}
          disabled={props.machineState === STATE.IDLE || props.machineState === STATE.NEED_BOOT}
          >
          <FontAwesomeIcon icon={faArrowRotateRight}/>
        </button>
        <button
          title={props.machineState === STATE.PAUSED ? "Resume" : "Pause"}
          onClick={() => {props.machineState === STATE.PAUSED ?
            handleSetCPUState(STATE.RUNNING) : handleSetCPUState(STATE.PAUSED)}}
          disabled={props.machineState === STATE.IDLE}>
          {props.machineState === STATE.PAUSED ?
          <FontAwesomeIcon icon={faPlay}/> :
          <FontAwesomeIcon icon={faPause}/>}
        </button>
        <button title="Restore State"
          onClick={() => props.handleFileOpen()}>
          <FontAwesomeIcon icon={faFolderOpen}/>
        </button>
        <button title="Save State"
          onClick={() => props.handleFileSave()}
          disabled={props.machineState === STATE.IDLE || props.machineState === STATE.NEED_BOOT}
        >
          <FontAwesomeIcon icon={faSave}/>
        </button>
        <button title="Full Screen"
          onClick={() => props.myCanvas.current?.requestFullscreen()}>
          <FontAwesomeIcon icon={faExpand}/>
        </button>
        <button title="Copy Screen"
          onClick={() => props.handleCopyToClipboard()}>
          <FontAwesomeIcon icon={faCopy}/>
        </button>
      </span>
      <span>
        <button title="Left"
          onClick={() => props.sendKey(8)}>
          <FontAwesomeIcon icon={iconLeftArrow}/>
        </button>
        <button title="Right"
          onClick={() => props.sendKey(21)}>
          <FontAwesomeIcon icon={iconRightArrow}/>
        </button>
        <button title="Down"
          onClick={() => props.sendKey(10)}>
          <FontAwesomeIcon icon={iconUpArrow}/>
        </button>
        <button title="Up"
          onClick={() => props.sendKey(11)}>
          <FontAwesomeIcon icon={iconDownArrow}/>
        </button>
      </span>
      <br/>

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
        <span className="fixed">{props.speed}</span> MHz
      </span>
      {/* <span className="statusItem">
        <span className="fixed">{toHex(props.s6502.PC, 4)}</span>
      </span> */}
    </span>
  )
}

export default ControlPanel;
