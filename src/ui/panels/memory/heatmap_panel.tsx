import { useEffect, useState } from "react"
import HeatMapControls from "./heatmap_controls"
import HeatMapView from "./heatmap_view"
import type { PaletteName } from "viridis"
import { getPreferenceByString, setPreferenceByString, PREFERENCES_RESET_EVENT } from "../../localstorage"

export enum HEATMAP_STATE {
  CPU,
  GETMEM,
  SETMEM
}

const HeatMapPanel = (props: { isActive: boolean, updateDisplay: UpdateDisplay }) => {
  const [state, setState] = useState<HEATMAP_STATE>(HEATMAP_STATE.CPU)
  const [colorTable, setColorTable] = useState<PaletteName>(
    getPreferenceByString("heatMapColorTable", "Spectral") as PaletteName)
  const [showMagnifier, setShowMagnifier] = useState(false)
  const doSetShowMagnifier = (value: boolean) => {
    setShowMagnifier(value)
  }

  const doSetColorTable = (value: PaletteName) => {
    setPreferenceByString("heatMapColorTable", value, "Spectral")
    setColorTable(value)
    props.updateDisplay()
  }

  useEffect(() => {
    const handlePreferencesReset = () => {
      setColorTable(getPreferenceByString("heatMapColorTable", "Spectral") as PaletteName)
    }
    window.addEventListener(PREFERENCES_RESET_EVENT, handlePreferencesReset)
    return () => window.removeEventListener(PREFERENCES_RESET_EVENT, handlePreferencesReset)
  }, [])

  return (
    <div className="tall-panel"
      style={{ width: "calc(100% - 20px)",
        height: "100%" }}>
      <HeatMapControls state={state} setState={setState}
        colorTable={colorTable}
        setColorTable={doSetColorTable}
        setShowMagnifier={doSetShowMagnifier}/>
      <HeatMapView state={state}
        colorTable={colorTable}
        showMagnifier={showMagnifier}
        setShowMagnifier={doSetShowMagnifier} />
    </div>
  )
}

export default HeatMapPanel
