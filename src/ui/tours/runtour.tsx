import { ACTIONS, EventData, EVENTS, Joyride, Step } from "react-joyride"
import { useGlobalContext } from "../globalcontext"
import { getTourMain } from "./tourmain"
import { getTourSettings } from "./toursettings"
import { getTourDebug } from "./tourdebug"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { faGlobe } from "@fortawesome/free-solid-svg-icons"
import { DropdownButton } from "../controls/dropdownbutton"
import { useTranslation } from "../../i18n/useTranslation"

const RunTour = () => {
  const { t } = useTranslation()
  const { runTour: runTour, setRunTour: setRunTour,
    tourIndex: tourIndex, setTourIndex: setTourIndex } = useGlobalContext()

  const handleJoyrideCallback = (data: EventData) => {
    const stepCallbackFunction = data.step.data as StepCallbackFunction
    if (stepCallbackFunction) {
      const completed = stepCallbackFunction()
      if (completed) return
    }
    console.log(`handleJoyrideCallback action=${data.action} type=${data.type} index=${data.index} ti=${tourIndex}`)

    if (data.type === EVENTS.STEP_AFTER) {
      if (data.action === ACTIONS.PREV) {
        setTourIndex(Math.max(0, data.index - 1))
      } else {
        setTourIndex(data.index + 1)
      }
    } else if (data.type === EVENTS.TARGET_NOT_FOUND) {
      console.warn(`Joyride target not found for step index ${data.index}, advancing...`)
      setTourIndex(data.index + 1)
    }

    if (data.type === EVENTS.TOUR_END || data.action === ACTIONS.SKIP || data.action === ACTIONS.CLOSE || data.status === "finished" || data.status === "skipped") {
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
      tour = getTourMain(t)
      break
    case "debug":
      tour = getTourDebug(t)
      break
    case "settings":
      tour = getTourSettings(t)
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
    back: t("tour.back"),
    close: t("tour.close"),
    last: t("tour.last"),
    next: t("tour.next"),
    nextLabelWithProgress: t("tour.nextLabelWithProgress"),
    skip: t("tour.skip"),
  }

  return (
    <span>
      {(tour.length > 0) &&
        <div className="modal-overlay"
          style={{backgroundColor: "inherit", pointerEvents: "none"}}
        >
        <Joyride
          onEvent={handleJoyrideCallback}
          steps={tour}
          locale={locale}
          options={{
            showProgress: true,
            buttons: ["back", "close", "primary", "skip"],
            blockTargetInteraction: false,
          }}
          run={tour.length > 0}
          continuous={true}
          stepIndex={tourIndex}
          styles={{
            tooltipContent: {
              textAlign: "left",
            },
            floater: {
              zIndex: 10000,
            },
          }}
        />
        </div>
      }
      <DropdownButton
        currentIndex={-1}
        itemNames={[
          t("tour.mainLabel"),
          t("tour.settingsLabel"),
          t("tour.debugLabel")
        ]}
        closeCallback={selectGuidedTour}
        icon={<FontAwesomeIcon icon={faGlobe} />}
        tooltip={t("tour.guidedTour")}
      />
    </span>
  )

}

export default RunTour
