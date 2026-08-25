/* eslint-disable @typescript-eslint/no-explicit-any */
import { Step } from "react-joyride"

export const getTourMain = (t: any, retro = false): Step[] => [
  {
    target: "body",
    placement: "center",
    content: t("tour.welcome") + " " + t("tour.clickNext")
  },
  {
    target: "#tour-boot-button",
    content: retro ? t("tour.retroBootButton") : t("tour.bootButton"),
  },
  {
    target: "#tour-reset-button",
    content: retro ? t("tour.retroResetButton") : t("tour.resetButton"),
  },
  {
    target: "#tour-disk-images",
    content: t("tour.diskImages"),
  },
  {
    target: "#tour-floppy-disks",
    content: retro ? t("tour.retroFloppyDisks") : t("tour.floppyDisks"),
  },
  {
    target: "#tour-saverestore",
    content: retro ? t("tour.retroSaveRestore") : t("tour.saveRestore"),
  },
  {
    target: "#tour-theme-button",
    content: retro ? t("tour.retroThemeButton") : t("tour.themeButton")
  },
  {
    target: "body",
    placement: "center",
    content: t("tour.endTour") + " " + (retro
      ? t("tour.retroTourSelectorHint")
      : t("tour.tourSelectorHint"))
  },
]
