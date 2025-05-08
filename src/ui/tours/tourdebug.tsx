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
    setTimeout(() => {passSetRunMode(RUN_MODE.PAUSED)}, 250)
  }
  // Continue processing tour commands
  return false
}

export const tourDebug: Step[] = [
  {
    target: "body",
    placement: "center",
    content: "Apple2TS has a rich set of tools to " +
      "analyze and debug 6502 assembly code. " +
      "To learn more, press the Next button."
  },
  {
    target: "#tour-debug-button",
    content: "Click on the Bug icon on the Info tabs to view the Debug panel.",
    data: callbackInDebugMode
  },
  {
    target: "#tour-debug-pause",
    content: "Press the Pause button to pause or resume execution of the emulator.",
    data: callbackPauseEmulator
  },
  {
    target: "#tour-debug-controls",
    content: "Now that we have paused, we can step through the disassembled " +
      "code using the Step Over, Into, and Out buttons. We can also quickly jump " +
      "to the current address of the Program Counter (PC).",
    data: callbackDebugControls
  },
  {
    target: "#tour-debug-disassembly",
    content: "Here we see the disassembled code, with the hex addresses, " +
      "the three-letter instruction, and any values or addresses. " +
      "If you move your mouse over a green value, a tooltip will appear with the " +
      "current value. Clicking on a blue address will scroll to that location. " +
      "You can also click in the left gutter to add or remove breakpoints.",
    placement: "left"
  },
  {
    target: "#tour-debug-info",
    content: "In the middle we have the Stack Dump and a Memory Map. " +
      "The Memory Map updates in real time and shows you which memory banks are " +
      " currently active.",
    placement: "left"
  },
  {
    target: "#tour-debug-memorydump",
    content: "The last section displays the Apple II memory. " +
      "You can use the droplist to examine different portions of memory. " +
      "If you switch to one of the HGR pages, you will get a magnified view of the " +
      "hires screen, tied to the memory locations. You can also search for hex values " +
      " or ASCII strings, and save the memory to a file.",
    placement: "left"
  },
  {
    target: "body",
    placement: "center",
    content: "You have reached the end of the tour. Click on the globe " +
      "tour button to try one of the other tours, " +
      "or press Finish to start using the emulator.",
  },
]
