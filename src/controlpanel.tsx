import { getProcessorStatus, STATE } from "./motherboard";
import { getAudioContext } from "./speaker";
import fullscreen from './img/fullscreen.svg';
import parse from "html-react-parser"

const ControlPanel = (props: any) => {
  return (
    <span className="leftStatus">
      <span className="statusItem">
        Speed (MHz): <span className="fixed">{props.speed}</span>
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
      <img src={fullscreen} alt="FS" width="20" height="20" onClick={() => {
        props.myCanvas.current?.requestFullscreen()
        }}/>
      <br />
      <span className="statusItem">
        <span className="fixed">{parse(getProcessorStatus())}</span>
      </span>
      <br />

      <button
        onClick={() => {
          if (getAudioContext().state !== "running") {
            getAudioContext().resume();
          }
          props.handle6502StateChange(STATE.NEED_BOOT)
        }}>
        Boot
      </button>
      <button
        onClick={() => {
          if (getAudioContext().state !== "running") {
            getAudioContext().resume();
          }
          props.handle6502StateChange(STATE.NEED_RESET)
        }}
        disabled={props._6502 === STATE.IDLE || props._6502 === STATE.NEED_BOOT}
        >
        Reset
      </button>
      <button
        onClick={props.handlePause}
        disabled={props._6502 === STATE.IDLE}>
        {props._6502 === STATE.PAUSED ? "Resume" : "Pause"}
      </button>
    </span>
  )
}

export default ControlPanel;
