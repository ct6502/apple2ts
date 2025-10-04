import { useState } from "react"
import "./App.css"
import DisplayApple2 from "./display"
import { GlobalContext } from "./globalcontext"
import { UI_THEME } from "../common/utility"
import { getTheme } from "./ui_settings"

const App = () => {
  const [updateHgr, setUpdateHgr] = useState(false)
  const [hgrMagnifier, setHgrMagnifier] = useState([-1, -1])
  const [updateBreakpoint, setUpdateBreakpoint] = useState(0)
  const [runTour, setRunTour] = useState("")
  const [tourIndex, setTourIndex] = useState(0)

  window.setTimeout(() => {
    if (getTheme() == UI_THEME.MINIMAL) {
      import("./App.minimal.css")
    }
  }, 1)

  return (
    <GlobalContext.Provider
      value={{
        runTour: runTour,
        setRunTour: setRunTour,
        tourIndex: tourIndex,
        setTourIndex: setTourIndex,
        updateHgr: updateHgr,
        setUpdateHgr: setUpdateHgr,
        hgrMagnifier: hgrMagnifier,
        setHgrMagnifier: setHgrMagnifier,
        updateBreakpoint: updateBreakpoint,
        setUpdateBreakpoint: setUpdateBreakpoint,
      }}>
      <DisplayApple2 />
      <div className="global-progress-modal-overlay">
        <img src={window.assetRegistry.runningGuy} alt="Loading..." className="global-progress-spinner2" />
      </div>
    </GlobalContext.Provider>
  )
}

export default App
