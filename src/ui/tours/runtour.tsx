import { ACTIONS, EventData, EVENTS, Joyride, Step, TooltipRenderProps } from "react-joyride"
import { useGlobalContext } from "../globalcontext"
import { getTourMain } from "./tourmain"
import { getTourSettings } from "./toursettings"
import { getTourDebug } from "./tourdebug"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { faGlobe } from "@fortawesome/free-solid-svg-icons"
import { DropdownButton } from "../controls/dropdownbutton"
import { useTranslation } from "../../i18n/useTranslation"
import { navigateToTourStep } from "./tourutils"
import { getTheme } from "../ui_settings"

const tourName = (index: number) => ["main", "settings", "debug"][index] ?? ""

const TourTooltip = ({ backProps, closeProps, index, primaryProps, step, tooltipProps }: TooltipRenderProps) => {
  const { color, height, width, ...closeButtonStyle } = step.styles.buttonClose

  return (
    <div className="react-joyride__tooltip" style={step.styles.tooltip} {...tooltipProps}>
      <button style={closeButtonStyle} type="button" {...closeProps}>
        <svg
          aria-hidden="true"
          height={typeof height === "number" ? `${height}px` : height}
          preserveAspectRatio="xMidYMid"
          viewBox="0 0 18 18"
          width={typeof width === "number" ? `${width}px` : width}
          xmlns="http://www.w3.org/2000/svg">
          <path
            d="M8.139 9.003.172 17.026a.572.572 0 0 0 .801.807L9 9.749l8.028 8.084a.56.56 0 0 0 .8 0 .575.575 0 0 0 0-.807L9.861 9.003 17.834.974a.575.575 0 0 0 0-.807.56.56 0 0 0-.801 0L9 8.256.967.167a.56.56 0 0 0-.801 0 .575.575 0 0 0 0 .807l7.973 8.029Z"
            fill={color}
          />
        </svg>
      </button>
      <div style={step.styles.tooltipContainer}>
        {step.title && <h4 style={step.styles.tooltipTitle}>{step.title}</h4>}
        <div style={step.styles.tooltipContent}>{step.content}</div>
      </div>
      <div style={step.styles.tooltipFooter}>
        <button style={step.styles.buttonSkip} type="button" {...closeProps}>{step.locale.close}</button>
        <div style={step.styles.tooltipFooterSpacer} />
        {index > 0 && <button style={step.styles.buttonBack} type="button" {...backProps} />}
        <button style={step.styles.buttonPrimary} type="button" {...primaryProps} />
      </div>
    </div>
  )
}

export const getTour = (name: string, t: ReturnType<typeof useTranslation>["t"]): Step[] => {
  switch (name.toLowerCase()) {
    case "main": return getTourMain(t)
    case "debug": return getTourDebug(t)
    case "settings": return getTourSettings(t)
    default: return []
  }
}

const RunTour = ({
  showSelector = true,
  showTour = true,
}: {
  showSelector?: boolean
  showTour?: boolean
}) => {
  const { t } = useTranslation()
  const { runTour: runTour, setRunTour: setRunTour,
    tourIndex: tourIndex, setTourIndex: setTourIndex,
    setTourSourceTheme, setReturnToTourHelp } = useGlobalContext()

  const goToTourIndex = (index: number) => {
    navigateToTourStep(
      getTour(runTour, t),
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

  const tour = getTour(runTour, t)

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
      {showTour && (tour.length > 0) &&
        <div className="modal-overlay"
          style={{ backgroundColor: "inherit", pointerEvents: "none" }}
        >
          <Joyride
            onEvent={handleJoyrideCallback}
            steps={tour}
            tooltipComponent={TourTooltip}
            locale={locale}
            options={{
              showProgress: true,
              buttons: ["back", "close", "primary"],
              blockTargetInteraction: false,
              closeButtonAction: "skip",
              dismissKeyAction: false,
              overlayClickAction: false,
              zIndex: 10003,
            }}
            run={tour.length > 0}
            continuous={true}
            stepIndex={tourIndex}
            styles={{
              tooltipContent: {
                textAlign: "left",
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
