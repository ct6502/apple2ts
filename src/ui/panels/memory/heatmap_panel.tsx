import { useState } from "react"
import HeatMapControls from "./heatmap_controls"
import HeatMapView from "./heatmap_view"
import { HEATMAP_STATE } from "../../../common/utility"
import { passHeatMapState } from "../../main2worker"

const HeatMapPanel = () => {
  const [state, setState] = useState<HEATMAP_STATE>(HEATMAP_STATE.CPU)
  const [showMagnifier, setShowMagnifier] = useState(false)
  const doSetShowMagnifier = (value: boolean) => {
    setShowMagnifier(value)
  }
  const doSetState = (value: HEATMAP_STATE) => {
    setState(value)
    passHeatMapState(value)
  }
  // const isLandscape = (window.innerWidth > window.innerHeight)
  // const height = isLandscape ? Math.max((window.innerHeight - 270), 435) : 590

  return (
    <div className="tall-panel"
      style={{ width: "calc(100% - 20px)",
        height: "100%" }}>
      <HeatMapControls state={state} setState={doSetState} setShowMagnifier={doSetShowMagnifier}/>
      <HeatMapView state={state} showMagnifier={showMagnifier} setShowMagnifier={doSetShowMagnifier} />
    </div>
  )
}

export default HeatMapPanel
