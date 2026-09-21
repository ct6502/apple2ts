import { useState } from "react"
import HeatMapControls from "./heatmap_controls"
import HeatMapView from "./heatmapview"

export enum HEATMAP_STATE {
  CPU = 0,
  GETMEM = 1,
  SETMEM = 2,
  GETSET = 3
}

const HeatmapPanel = () => {
  const [state, setState] = useState<HEATMAP_STATE>(HEATMAP_STATE.CPU)

  const isLandscape = (window.innerWidth > window.innerHeight)
  const height = isLandscape ? Math.max((window.innerHeight - 270), 435) : 590


  return (
    <div className="round-rect-border tall-panel"
      style={{ width: "calc(100% - 20px)",
        height: height }}>
      <div className="flex-row-space-between" style={{ marginBottom: "2px" }}>
        <div className="bigger-font">Heat Map</div>
      </div>
      <HeatMapControls state={state} setState={setState}/>
      <HeatMapView state={state}/>
    </div>
  )
}

export default HeatmapPanel
