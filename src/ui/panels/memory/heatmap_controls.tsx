import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { faPenToSquare, faUpRightFromSquare, faMicrochip } from "@fortawesome/free-solid-svg-icons"
import { RUN_MODE } from "../../../common/utility"
import { handleGetRunMode } from "../../main2worker"
import { HEATMAP_STATE } from "./heatmap_panel"

const HeatMapControls = (props: { state: HEATMAP_STATE, setState: React.Dispatch<React.SetStateAction<HEATMAP_STATE>> }) => {
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
        ${props.state === HEATMAP_STATE.GETMEM || props.state === HEATMAP_STATE.GETSET ? "button-active" : ""}`}
        title="Get Memory Calls"
        onClick={() => {
          if (props.state === HEATMAP_STATE.SETMEM) {
            props.setState(HEATMAP_STATE.GETSET)
          } else if (props.state === HEATMAP_STATE.GETSET) {
            props.setState(HEATMAP_STATE.SETMEM)
          } else if (props.state === HEATMAP_STATE.CPU) {
            props.setState(HEATMAP_STATE.GETMEM)
          }
        }}
        disabled={runMode === RUN_MODE.IDLE}>
        <FontAwesomeIcon icon={faUpRightFromSquare} />
      </button>
      <button className={`push-button
        ${props.state === HEATMAP_STATE.SETMEM || props.state === HEATMAP_STATE.GETSET ? "button-active" : ""}`}
        title="Set Memory Calls"
        onClick={() => {
          if (props.state === HEATMAP_STATE.GETMEM) {
            props.setState(HEATMAP_STATE.GETSET)
          } else if (props.state === HEATMAP_STATE.GETSET) {
            props.setState(HEATMAP_STATE.GETMEM)
          } else if (props.state === HEATMAP_STATE.CPU) {
            props.setState(HEATMAP_STATE.SETMEM)
          }
        }}
        disabled={runMode === RUN_MODE.IDLE}>
        <FontAwesomeIcon icon={faPenToSquare} />
      </button>
    </span>
  )
}

export default HeatMapControls
