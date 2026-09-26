import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { faPenToSquare, faUpRightFromSquare, faMicrochip, faMagnifyingGlass, faSync } from "@fortawesome/free-solid-svg-icons"
import { HEATMAP_STATE, RUN_MODE } from "../../../common/utility"
import { handleGetRunMode, passSetCycleCount } from "../../main2worker"

const HeatMapControls = (props: {
  state: HEATMAP_STATE,
  setState: (value: HEATMAP_STATE) => void,
  setShowMagnifier: (value: boolean) => void }) => {
  // const { t } = useTranslation() 
  const runMode = handleGetRunMode()

  return (
    <span className="flex-row" style={{ marginBottom: "5px" }}>
      <button className={`push-button ${props.state === HEATMAP_STATE.CPU ? "button-active" : ""}`}
        title="6502 Program Counter"
        onClick={() => {
          props.setState(HEATMAP_STATE.CPU)
        }}
        disabled={runMode === RUN_MODE.IDLE}>
        <FontAwesomeIcon icon={faMicrochip} />
      </button>
      <button className={`push-button
        ${props.state === HEATMAP_STATE.GETMEM ? "button-active" : ""}`}
        title="Get Memory Calls"
        onClick={() => {
          props.setState(HEATMAP_STATE.GETMEM)
        }}
        disabled={runMode === RUN_MODE.IDLE}>
        <FontAwesomeIcon icon={faUpRightFromSquare} />
      </button>
      <button className={`push-button
        ${props.state === HEATMAP_STATE.SETMEM ? "button-active" : ""}`}
        title="Set Memory Calls"
        onClick={() => {
          props.setState(HEATMAP_STATE.SETMEM)
        }}
        disabled={runMode === RUN_MODE.IDLE}>
        <FontAwesomeIcon icon={faPenToSquare} />
      </button>
      <button className="push-button"
        title="Show Magnifier"
        onClick={() => {props.setShowMagnifier(true)}}
        disabled={runMode === RUN_MODE.IDLE}>
        <FontAwesomeIcon icon={faMagnifyingGlass} />
      </button>
      <button className="push-button"
        title="Reset cycle count and heat maps"
        onClick={() => { passSetCycleCount(0) }}
        disabled={runMode === RUN_MODE.IDLE}>
        <FontAwesomeIcon icon={faSync}/>
      </button>
    </span>
  )
}

export default HeatMapControls
