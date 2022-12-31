import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faArrowRightToBracket as iconStepInto,
  faArrowsRotate as iconStepOver,
  faArrowUpFromBracket as iconStepOut,
} from "@fortawesome/free-solid-svg-icons";

const DebugPanel = (props: DebugProps) => {
  const handleBreakpointChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let result = e.target.value.replace(/[^0-9a-f]/gi, '');
    props.handleBreakpoint(result)
  }
  return (
    <span>
      <label>
        <input
          type="checkbox"
          checked={props.doDebug}
          onChange={props.handleDebugChange}
        />
        Debug
      </label>
      {/* <span hidden={!props.doDebug}> */}
      <span>
        <br/>
        <input
          type="text"
          placeholder=""
          value={props.breakpoint}
          onChange={handleBreakpointChange}
        />
        <button
          title={"Step Into"}
          onClick={props.handleStepInto}>
          <FontAwesomeIcon icon={iconStepInto} className="fa-rotate-90 icon"/>
        </button>
        <button
          title={"Step Over"}
          onClick={props.handleStepOver}>
          <span className="fa-stack small icon">
          <FontAwesomeIcon icon={iconStepOut} className="cropTop fa-stack-2x icon"/>
          <FontAwesomeIcon icon={iconStepOver} className="cropBottom fa-stack-2x icon"/>
          </span>
        </button>
        <button
          title={"Step Out"}
          onClick={props.handleStepOut}>
          <FontAwesomeIcon icon={iconStepOut} className="icon"/>
        </button>
      </span>
      <span className="statusPanel fixed small">
      </span>

    </span>
  )
}

export default DebugPanel;
