/* eslint-disable @typescript-eslint/no-explicit-any */
import { Step } from "react-joyride"

export const getTourMain = (t: any): Step[] => [
  {
    target: "body",
    placement: "center",
    content: t("tour.welcome") + " " + t("tour.clickNext")
  },
  {
    target: "#tour-boot-button",
    content: t("tour.bootButton"),
  },
  {
    target: "#tour-reset-button",
    content: t("tour.resetButton"),
  },
  {
    target: "#tour-disk-images",
    content: t("tour.diskImages"),
  },
  {
    target: "#tour-floppy-disks",
    content: t("tour.floppyDisks"),
  },
  {
    target: "#tour-saverestore",
    content: t("tour.saveRestore"),
  },
  {
    target: "#tour-theme-button",
    content: t("tour.themeButton")
  },
  {
    target: "body",
    placement: "center",
    content: t("tour.endTour") + " " + t("tour.tourSelectorHint")
  },
]
