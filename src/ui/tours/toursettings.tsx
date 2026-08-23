/* eslint-disable @typescript-eslint/no-explicit-any */
import { Step } from "react-joyride"
import { passSetDebug, passSetShowDebugTab } from "../main2worker"

const isTouchDevice = "ontouchstart" in document.documentElement
const isMac = navigator.platform.startsWith("Mac")
const modKey = isMac ? "⌘" : "Alt"

export const getTourSettings = (t: any, retro = false): Step[] => {
  const altArrowKeys = (
    <div>
      {t("tour.altArrowKeys", { modKey })}
    </div>
  )

  const callbackInDebugMode: StepCallbackFunction = () => {
    passSetDebug(true)
    passSetShowDebugTab(true)
    // Continue processing tour commands
    return false
  }

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
      data: callbackInDebugMode
    },
    {
      target: "#tour-configbuttons",
      content: retro ? t("tour.retroConfigButtons") : t("tour.configButtons"),
    },
    {
      target: "#tour-keyboardbuttons",
      content: (<div style={{ textAlign: "left" }}>{t("tour.keyboardButtons")}
        <p />
        {isTouchDevice ? "" : altArrowKeys}</div>),
    },
    {
      target: "#tour-clearcookies",
      content: retro ? t("tour.retroClearCookies") : t("tour.clearCookies"),
    },
    {
      target: "body",
      placement: "center",
      content: t("tour.endTour") + " " + (retro
        ? t("tour.retroTourSelectorHint")
        : t("tour.tourSelectorHint"))
    },
  ]
}
