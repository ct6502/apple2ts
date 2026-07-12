import { useState } from "react"
import "./App.css"
import DisplayApple2 from "./display"
import { GlobalContext } from "./globalcontext"
import { isMinimalTheme } from "./ui_settings"

const App = () => {
  const [updateHgrMagnifier, setUpdateHgrMagnifier] = useState(false)
  const [hgrMagnifierLoc, setHgrMagnifierLoc] = useState([-1, -1])
  const [lockHgrMagnifier, setLockHgrMagnifier] = useState(false)
  const [updateBreakpoint, setUpdateBreakpoint] = useState(0)
  const [runTour, setRunTour] = useState("")
  const [tourIndex, setTourIndex] = useState(0)

  window.setTimeout(() => {
    if (isMinimalTheme()) {
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
        updateHgrMagnifier: updateHgrMagnifier,
        setUpdateHgrMagnifier: setUpdateHgrMagnifier,
        hgrMagnifierLoc: hgrMagnifierLoc,
        setHgrMagnifierLoc: setHgrMagnifierLoc,
        lockHgrMagnifier: lockHgrMagnifier,
        setLockHgrMagnifier: setLockHgrMagnifier,
        updateBreakpoint: updateBreakpoint,
        setUpdateBreakpoint: setUpdateBreakpoint,
      }}>
      <DisplayApple2 />
      <div className="global-progress-modal-overlay">
        <img src={window.assetRegistry.runningGuy} alt="Loading..." className="global-progress-spinner2" />
        <div className="global-progress-message" />
      </div>
    </GlobalContext.Provider>
  )
}

export default App
