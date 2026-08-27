import { useEffect, useState } from "react"
import { createPortal } from "react-dom"
import "./App.css"
import DisplayApple2 from "./display"
import { GlobalContext } from "./globalcontext"
import { getTheme, isMinimalTheme } from "./ui_settings"
import RunTour from "./tours/runtour"

const App = () => {
  const [updateHgrMagnifier, setUpdateHgrMagnifier] = useState(false)
  const [hgrMagnifierLoc, setHgrMagnifierLoc] = useState([-1, -1])
  const [lockHgrMagnifier, setLockHgrMagnifier] = useState(false)
  const [updateBreakpoint, setUpdateBreakpoint] = useState(0)
  const [runTour, setRunTour] = useState("")
  const [tourIndex, setTourIndex] = useState(0)
  const [tourSourceTheme, setTourSourceTheme] = useState(getTheme)
  const [returnToTourHelp, setReturnToTourHelp] = useState(false)
  const [memdumpAddress, setMemdumpAddress] = useState(-1)
  const [fullscreenElement, setFullscreenElement] = useState<Element | null>(document.fullscreenElement)

  useEffect(() => {
    const handleFullscreenChange = () => setFullscreenElement(document.fullscreenElement)
    document.addEventListener("fullscreenchange", handleFullscreenChange)
    return () => document.removeEventListener("fullscreenchange", handleFullscreenChange)
  }, [])

  window.setTimeout(() => {
    if (isMinimalTheme()) {
      import("./App.minimal.css")
    }
  }, 1)

  const progressModal = <div className="global-progress-modal-overlay">
    <img src={window.assetRegistry.runningGuy} alt="Loading..." className="global-progress-spinner2" />
    <div className="global-progress-message" />
  </div>

  return (
    <GlobalContext.Provider
      value={{
        runTour: runTour,
        setRunTour: setRunTour,
        tourIndex: tourIndex,
        setTourIndex: setTourIndex,
        tourSourceTheme,
        setTourSourceTheme,
        returnToTourHelp,
        setReturnToTourHelp,
        updateHgrMagnifier: updateHgrMagnifier,
        setUpdateHgrMagnifier: setUpdateHgrMagnifier,
        hgrMagnifierLoc: hgrMagnifierLoc,
        setHgrMagnifierLoc: setHgrMagnifierLoc,
        lockHgrMagnifier: lockHgrMagnifier,
        setLockHgrMagnifier: setLockHgrMagnifier,
        updateBreakpoint: updateBreakpoint,
        setUpdateBreakpoint: setUpdateBreakpoint,
        memdumpAddress: memdumpAddress,
        setMemdumpAddress: setMemdumpAddress
      }}>
      <DisplayApple2 />
      <RunTour showSelector={false} />
      {fullscreenElement ? createPortal(progressModal, fullscreenElement) : progressModal}
    </GlobalContext.Provider>
  )
}

export default App
