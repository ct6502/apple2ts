import { ACTIONS, EventData, EVENTS, Joyride, Step } from "react-joyride"
import { useGlobalContext } from "../globalcontext"
import { getTourMain } from "./tourmain"
import { getTourSettings } from "./toursettings"
import { getTourDebug } from "./tourdebug"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { faGlobe } from "@fortawesome/free-solid-svg-icons"
import { DropdownButton } from "../controls/dropdownbutton"
import { useTranslation } from "../../i18n/useTranslation"
import type { RetroControlMetadata } from "../retro/retromenucontext"
import { navigateToTourStep } from "./tourutils"
import { getTheme, setTheme } from "../ui_settings"
import { UI_THEME } from "../../common/utility"

const tourName = (index: number) => ["main", "settings", "debug"][index] ?? ""

export const retroTourControls: RetroControlMetadata[] = [
  {
    id: "guidedTours",
    parentId: null,
    order: 9,
    label: context => context.t("debug.helpTab"),
  },
  ...(["mainLabel", "settingsLabel", "debugLabel"] as const).map((labelKey, index): RetroControlMetadata => ({
    id: `guidedTours.${tourName(index)}`,
    parentId: "guidedTours",
    order: index,
    label: context => context.t(`tour.${labelKey}`),
    action: context => {
      if (tourName(index) === "debug") context.close()
      context.startTour(tourName(index))
    },
    keepMenuOpen: true,
    tourTargets: index === 0 ? ["#tour-help-menu"] : undefined,
  })),
]

export const getTour = (name: string, t: ReturnType<typeof useTranslation>["t"], retro = false): Step[] => {
  switch (name.toLowerCase()) {
    case "main": return getTourMain(t, retro)
    case "debug": return getTourDebug(t, retro)
    case "settings": return getTourSettings(t, retro)
    default: return []
  }
}

const RunTour = ({ showSelector = true }: { showSelector?: boolean }) => {
  const { t } = useTranslation()
  const { runTour: runTour, setRunTour: setRunTour,
    tourIndex: tourIndex, setTourIndex: setTourIndex,
    tourSourceTheme, setTourSourceTheme, setReturnToTourHelp } = useGlobalContext()
  const isRetroTour = tourSourceTheme === UI_THEME.RETRO

  const goToTourIndex = (index: number) => {
    if (isRetroTour && runTour.toLowerCase() === "debug" && index === getTourDebug(t, true).length - 1) {
      setTheme(UI_THEME.RETRO)
    }
    navigateToTourStep(
      getTour(runTour, t, isRetroTour),
      index,
      setTourIndex,
    )
  }

  const handleJoyrideCallback = (data: EventData) => {
    const stepCallbackFunction = data.step.data as StepCallbackFunction
    if (stepCallbackFunction) {
      const completed = stepCallbackFunction()
      if (completed) return
    }
    console.log(`handleJoyrideCallback action=${data.action} type=${data.type} index=${data.index} ti=${tourIndex}`)

    if (data.type === EVENTS.STEP_AFTER) {
      if (data.action === ACTIONS.PREV) {
        goToTourIndex(Math.max(0, data.index - 1))
      } else {
        goToTourIndex(data.index + 1)
      }
    } else if (data.type === EVENTS.TARGET_NOT_FOUND) {
      console.warn(`Joyride target not found for step index ${data.index}, advancing...`)
      goToTourIndex(data.index + 1)
    }

    if (data.type === EVENTS.TOUR_END || data.action === ACTIONS.SKIP || data.action === ACTIONS.CLOSE || data.status === "finished" || data.status === "skipped") {
      if (isRetroTour) {
        setTheme(UI_THEME.RETRO)
        setReturnToTourHelp(true)
      }
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

  const tour = getTour(runTour, t, isRetroTour)

  const selectGuidedTour = (index: number) => {
    setReturnToTourHelp(false)
    setTourSourceTheme(getTheme())
    setRunTour(tourName(index))
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
            buttons: ["back", "close", "primary"],
            blockTargetInteraction: false,
            closeButtonAction: "skip",
            dismissKeyAction: false,
            overlayClickAction: false,
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
      {showSelector && <DropdownButton
        currentIndex={-1}
        itemNames={[
          t("tour.mainLabel"),
          t("tour.settingsLabel"),
          t("tour.debugLabel")
        ]}
        closeCallback={selectGuidedTour}
        icon={<FontAwesomeIcon icon={faGlobe} />}
        tooltip={t("tour.guidedTour")}
      />}
    </span>
  )

}

export default RunTour
