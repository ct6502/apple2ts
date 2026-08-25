/* eslint-disable @typescript-eslint/no-explicit-any */
import { Step } from "react-joyride"

const isTouchDevice = "ontouchstart" in document.documentElement
const isMac = navigator.platform.startsWith("Mac")
const modKey = isMac ? "⌘" : "Alt"

export const getTourSettings = (t: any): Step[] => {
  const altArrowKeys = (
    <div>
      {t("tour.altArrowKeys", { modKey })}
    </div>
  )

  return [
    {
      target: "body",
      placement: "center",
      content: t("tour.settingsWelcome") + " " + t("tour.clickNext")
    },
    {
      target: "#tour-maincontrols",
      content: t("tour.mainControls"),
    },
    {
      target: "#tour-snapshot",
      content: t("tour.snapshot"),
    },
    {
      target: "#tour-pause-button",
      content: t("tour.pauseButton")
    },
    {
      target: "#tour-debug-button",
      content: t("tour.debugButton"),
    },
    {
      target: "#tour-configbuttons",
      content: t("tour.configButtons"),
    },
    {
      target: "#tour-keyboardbuttons",
      content: (<div style={{ textAlign: "left" }}>{t("tour.keyboardButtons")}
        <p />
        {isTouchDevice ? "" : altArrowKeys}</div>),
    },
    {
      target: "#tour-clearcookies",
      content: t("tour.clearCookies"),
    },
    {
      target: "body",
      placement: "center",
      content: t("tour.endTour") + " " + t("tour.tourSelectorHint")
    },
  ]
}
