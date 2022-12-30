import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faPlay,
} from "@fortawesome/free-solid-svg-icons";

const DebugPanel = (props: DebugProps) => {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let result = e.target.value.replace(/[^0-9a-f]/gi, '');
    props.handleBreakpoint(result)
  }
  return (
    <span>
      <input
        type="text"
        placeholder=""
        value={props.breakpoint}
        onChange={handleChange}
      />
      <button
        title={"Step Into"}
        onClick={props.handleStepOnce}>
        <FontAwesomeIcon icon={faPlay}/>
      </button>
    </span>
  )
}

export default DebugPanel;
