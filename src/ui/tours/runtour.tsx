import Joyride, { ACTIONS, CallBackProps, EVENTS, Step } from "react-joyride"
import { useGlobalContext } from "../globalcontext"
import { tourMain } from "./tourmain"
import { tourSettings } from "./toursettings"
import { tourDebug } from "./tourdebug"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { faGlobe } from "@fortawesome/free-solid-svg-icons"
import { DropdownButton } from "../controls/dropdownbutton"

const RunTour = () => {
  const { runTour: runTour, setRunTour: setRunTour,
    tourIndex: tourIndex, setTourIndex: setTourIndex } = useGlobalContext()

  const handleJoyrideCallback = (data: CallBackProps) => {
    const stepCallbackFunction = data.step.data as StepCallbackFunction
    if (stepCallbackFunction) {
      const completed = stepCallbackFunction()
      if (completed) return
    }
    console.log(`handleJoyrideCallback action=${data.action} type=${data.type} index=${data.index} ti=${tourIndex}`)
    if (data.type === EVENTS.STEP_AFTER) {
      // Update state to advance the tour
      setTourIndex(data.index + (data.action === ACTIONS.PREV ? -1 : 1))
    }  
    if (data.type === EVENTS.TOUR_END || data.action === ACTIONS.SKIP || data.action === ACTIONS.CLOSE) {
      setRunTour("")
      setTourIndex(0)
      // If our URL contains the "tour" parameter, be sure to turn it off
      // and reload the page. Otherwise if the user saves that URL or
      // posts it, then the tour will run every time the page is loaded.
      const params = new URLSearchParams(window.location.search.toLowerCase())
      if (params.get("tour")) {
        // Remove the 'tour' parameter      
        const url = new URL(window.location.href)
        url.searchParams.delete("tour")
        // Reload the page with the updated URL
        window.location.href = url.toString()
      }
    }
  }

  let tour: Step[] = []

  switch (runTour.toLowerCase()) {
    case "main":
      tour = tourMain
      break
    case "debug":
      tour = tourDebug
      break
    case "settings":
      tour = tourSettings
      break
    default:
      break
  }

  const selectGuidedTour = (index: number) => {
    let tourName = ""
    switch (index) {
      case 0:
        tourName = "main"
        break
      case 1:
        tourName = "settings"
        break
      case 2:
        tourName = "debug"
        break
      default:
        break
    }
    setRunTour(tourName)
    setTourIndex(0)
  }

  const locale = {
    back: "Back",
    close: "Close",
    last: "Finish",
    next: "Next",
    skip: "Close",
  }

  return (
    <span>
    {(tour.length > 0) &&
      <div className="modal-overlay"
        style={{backgroundColor: "inherit"}}
        tabIndex={0} // Make the div focusable
      >
      <Joyride
        callback={handleJoyrideCallback}
        steps={tour}
        locale={locale}
        run={tour.length > 0}
        continuous={true}
        showProgress={true}
        showSkipButton={true}
        spotlightClicks={true}
        stepIndex={tourIndex}
        styles={{
          tooltipContent: {
            textAlign: "left",
          },
          options: {
            zIndex: 10000,
          },
        }}
      />
      </div>
      }
      <DropdownButton 
        currentIndex = {-1}
        itemNames = {["Guided Tour: Main", "Guided Tour: Settings", "Guided Tour: Debug"]}
        closeCallback = {selectGuidedTour}
        icon = {<FontAwesomeIcon icon={faGlobe}/>}
        tooltip = "Guided Tour"
      />
    </span>
  )

}

export default RunTour
