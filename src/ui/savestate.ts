import { BreakpointMap } from "../common/breakpoint"
import { MAX_DRIVES, RUN_MODE } from "../common/utility"
import { setPreferenceBreakpoints, setPreferenceDebugMode, setPreferenceMockingboardMode, setPreferenceSpeedMode } from "./localstorage"
import { handleGetFilename } from "./devices/disk/driveprops"
import { getMockingboardMode } from "./devices/audio/mockingboard_audio"
import { isAudioEnabled, audioEnable } from "./devices/audio/speaker"
import { handleGetBreakpoints, handleGetSpeedMode, handleGetIsDebugging, handleGetRunMode, handleGetSaveState, passRestoreSaveState, passSetRunMode } from "./main2worker"
import { 
  
  getUIState,
  setUIState} from "./ui_settings"

const useSaveStateCallback = (sState: EmulatorSaveState) => {
  const d = new Date()
  const datetime = new Date(d.getTime() - (d.getTimezoneOffset() * 60000)).toISOString()
  const breakpoints = handleGetBreakpoints()
  const serializedBreakpoints = JSON.stringify(Array.from(breakpoints.entries()))
  const uiState = getUIState()
  const displayState: DisplaySaveState = {
    name: "Apple2TS Emulator",
    date: datetime,
    version: 1.0,
    ...uiState,
    audioEnable: isAudioEnabled(),
    mockingboardMode: getMockingboardMode(),
    speedMode: handleGetSpeedMode(),
    isDebugging: handleGetIsDebugging(),
    runMode: handleGetRunMode(),
    breakpoints: serializedBreakpoints,
  }
  sState.emulator = displayState
  const state = JSON.stringify(sState, null, 2)
  const blob = new Blob([state], { type: "text/plain" })
  const link = document.createElement("a")
  const url = URL.createObjectURL(blob)
  link.setAttribute("href", url)
  let name = "apple2ts"
  for (let i = 0; i < MAX_DRIVES; i++) {
    const n = handleGetFilename(i)
    if (n) {
      name = n
      break
    }
  }
  link.setAttribute("download", `${name}.a2ts`)
  link.style.visibility = "hidden"
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
}

export const handleFileSave = (withSnapshots: boolean) => {
  handleGetSaveState(useSaveStateCallback, withSnapshots)
}

export const RestoreSaveState = (fileContents: string) => {
  const sState: EmulatorSaveState = JSON.parse(fileContents)
  passRestoreSaveState(sState)
  const displayState = sState.emulator
  // In an old version, property was renamed from uppercase to capsLock
  if (displayState && ("uppercase" in displayState)) {
    displayState.capsLock = displayState["uppercase"] as boolean
  }
  setUIState(displayState as UIState)
  if (displayState?.audioEnable !== undefined) {
    audioEnable(displayState.audioEnable)
  }
  if (displayState?.mockingboardMode !== undefined) {
    setPreferenceMockingboardMode(displayState.mockingboardMode)
  }
  if (displayState?.speedMode !== undefined) {
    setPreferenceSpeedMode(displayState.speedMode)
  }
  if (displayState?.isDebugging !== undefined) {
    setPreferenceDebugMode(displayState.isDebugging)
  }
  const runMode = displayState?.runMode ? (displayState.runMode as RUN_MODE) : RUN_MODE.RUNNING
  passSetRunMode(runMode)
  if (displayState?.breakpoints) {
    const breakpoints = JSON.parse(displayState.breakpoints)
    if (breakpoints.length > 0) {
      const deserializedBreakpoints = new BreakpointMap()
      for (const [addr, bp] of breakpoints) {
        bp.address = parseInt(addr)
        // Watch out for old breakpoints that don't have an expression1 or expression2
        // If we did have an old expression, just throw away the breakpoint...
        // That's better than trying to convert it or remove the expression.
        if (!bp.expression) {
          // If we had old breakpoints without an expression, just
          // fill in new empty expression1 and expression2.
          if (!bp.expression1) {
            bp.expression1 = { register: "", address: 0, operator: "", value: 0 }
            bp.expression2 = { register: "", address: 0, operator: "", value: 0 }
            bp.expressionOperator = ""
          }
          deserializedBreakpoints.set(bp.address, bp)
        }
      }
      setPreferenceBreakpoints(deserializedBreakpoints)
    }
  }
}
