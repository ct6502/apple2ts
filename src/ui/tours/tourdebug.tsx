/* eslint-disable @typescript-eslint/no-explicit-any */
import { Step } from "react-joyride"
import { handleGetRunMode, passSetDebug, passSetRunMode, passSetShowDebugTab } from "../main2worker"
import { RUN_MODE } from "../../common/utility"

let neededToBoot = false
let didBoot = false

const callbackInDebugMode: StepCallbackFunction = () => {
  const runMode = handleGetRunMode()
  neededToBoot = runMode === RUN_MODE.IDLE
  didBoot = false
  passSetDebug(true)
  passSetShowDebugTab(true)
  // Continue processing tour commands
  return false
}


const callbackPauseEmulator: StepCallbackFunction = () => {
  if (neededToBoot && !didBoot) {
    didBoot = true
    passSetRunMode(RUN_MODE.NEED_BOOT)
  }
  // Continue processing tour commands
  return false
}

const callbackDebugControls: StepCallbackFunction = () => {
  const runMode = handleGetRunMode()
  if (runMode !== RUN_MODE.PAUSED) {
    if (didBoot) {
      didBoot = false
      passSetRunMode(RUN_MODE.NEED_RESET)
    }
    setTimeout(() => { passSetRunMode(RUN_MODE.PAUSED) }, 250)
  }
  // Continue processing tour commands
  return false
}

export const getTourDebug = (t: any): Step[] => [
  {
    target: "body",
    placement: "center",
    content: t("tour.debugWelcome") + " " + t("tour.clickNext")
  },
  {
    target: "#tour-debug-button",
    content: t("tour.debugIcon"),
    data: callbackInDebugMode
  },
  {
    target: "#tour-debug-pause",
    content: t("tour.debugPause"),
    data: callbackPauseEmulator
  },
  {
    target: "#tour-debug-controls",
    content: t("tour.debugControls"),
    data: callbackDebugControls
  },
  {
    target: "#tour-debug-disassembly",
    content: t("tour.debugDisassembly"),
    placement: "left"
  },
  {
    target: "#tour-debug-info",
    content: t("tour.debugInfo"),
    placement: "left"
  },
  {
    target: "#tour-debug-memorydump",
    content: t("tour.debugMemory"),
    placement: "left"
  },
  {
    target: "body",
    placement: "center",
    content: t("tour.endTour") + " " + t("tour.tourSelectorHint")
  },
]
