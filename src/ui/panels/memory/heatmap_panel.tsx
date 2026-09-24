import { useState } from "react"
import HeatMapControls from "./heatmap_controls"
import HeatMapView from "./heatmap_view"

export enum HEATMAP_STATE {
  CPU = 0,
  GETMEM = 1,
  SETMEM = 2,
  GETSET = 3
}

const HeatMapPanel = () => {
  const [state, setState] = useState<HEATMAP_STATE>(HEATMAP_STATE.CPU)
  const [showMagnifier, setShowMagnifier] = useState(false)
  const doSetShowMagnifier = (value: boolean) => {
    setShowMagnifier(value)
  }
  // const isLandscape = (window.innerWidth > window.innerHeight)
  // const height = isLandscape ? Math.max((window.innerHeight - 270), 435) : 590

  return (
    <div className="round-rect-border tall-panel"
      style={{ width: "calc(100% - 20px)",
        height: "auto" }}>
      <div className="flex-row-space-between" style={{ marginBottom: "2px" }}>
        <div className="bigger-font">Heat Map</div>
      </div>
      <HeatMapControls state={state} setState={setState} setShowMagnifier={doSetShowMagnifier}/>
      <HeatMapView state={state} showMagnifier={showMagnifier} setShowMagnifier={doSetShowMagnifier} />
    </div>
  )
}

export default HeatMapPanel
