import { useState } from "react"
import "./App.css"
import DisplayApple2 from "./display"
import { GlobalContext } from "./globalcontext"
import { handleGetTheme } from "./main2worker"
import { UI_THEME } from "../common/utility"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { faRotate } from "@fortawesome/free-solid-svg-icons"

const App = () => {
  const [updateHgr, setUpdateHgr] = useState(false)
  const [hgrMagnifier, setHgrMagnifier] = useState([-1, -1])
  const [updateBreakpoint, setUpdateBreakpoint] = useState(0)
  const [runTour, setRunTour] = useState("")
  const [tourIndex, setTourIndex] = useState(0)

  window.setTimeout(() => {
    if (handleGetTheme() == UI_THEME.MINIMAL) {
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
        <FontAwesomeIcon icon={faRotate} className="global-progress-spinner"/>
      </div>
    </GlobalContext.Provider>
  )
}

export default App
