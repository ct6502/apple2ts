import { useEffect, useState } from "react"
import HeatMapControls from "./heatmap_controls"
import HeatMapView from "./heatmap_view"
import { HEATMAP_STATE } from "../../../common/utility"
import { passHeatMapState } from "../../main2worker"

const HeatMapPanel = (props: { isActive: boolean }) => {
  const [state, setState] = useState<HEATMAP_STATE>(HEATMAP_STATE.CPU)
  const [colorTable, setColorTable] = useState<string>("Viridis")
  const [showMagnifier, setShowMagnifier] = useState(false)
  const doSetShowMagnifier = (value: boolean) => {
    setShowMagnifier(value)
  }
  const doSetState = (value: HEATMAP_STATE) => {
    setState(value)
  }

  // Only ask the worker to build/send the heat map while this tab is the
  // one actually visible; otherwise tell it HEATMAP_STATE.NONE so the
  // 64K-entry array stops being computed and posted every frame.
  useEffect(() => {
    passHeatMapState(props.isActive ? state : HEATMAP_STATE.NONE)
  }, [props.isActive, state])
  // const isLandscape = (window.innerWidth > window.innerHeight)
  // const height = isLandscape ? Math.max((window.innerHeight - 270), 435) : 590

  return (
    <div className="tall-panel"
      style={{ width: "calc(100% - 20px)",
        height: "100%" }}>
      <HeatMapControls state={state} setState={doSetState}
        colorTable={colorTable}
        setColorTable={setColorTable}
        setShowMagnifier={doSetShowMagnifier}/>
      <HeatMapView state={state} colorTable={colorTable} showMagnifier={showMagnifier} setShowMagnifier={doSetShowMagnifier} />
    </div>
  )
}

export default HeatMapPanel
