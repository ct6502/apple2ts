import { BreakpointMap } from "../common/breakpoint"
import { MAX_DRIVES, RUN_MODE, SAVE_STATE_VERSION } from "../common/utility"
import { getPreferenceBoolean, setPreferenceBreakpoints, setPreferenceMockingboardMode, setPreferenceSpeedMode } from "./localstorage"
import { handleGetFilename } from "./devices/disk/driveprops"
import { getMockingboardMode } from "./devices/audio/mockingboard_audio"
import { isAudioEnabled, audioEnable } from "./devices/audio/speaker"
import { handleGetBreakpoints, handleGetSpeedMode, handleGetIsDebugging, handleGetRunMode, handleGetSaveState, passRestoreSaveState, passSetRunMode, passSetShowDebugTab, handleGetSaveStateForLocalStorage } from "./main2worker"
import { getUIState, setUIState} from "./ui_settings"

const constructSaveStateWithUI = (sState: EmulatorSaveState) => {
  const d = new Date()
  const datetime = new Date(d.getTime() - (d.getTimezoneOffset() * 60000)).toISOString()
  const breakpoints = handleGetBreakpoints()
  const serializedBreakpoints = JSON.stringify(Array.from(breakpoints.entries()))
  const uiState = getUIState()
  const displayState: DisplaySaveState = {
    name: "Apple2TS Emulator",
    date: datetime,
    version: SAVE_STATE_VERSION,
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
  return state
}

let didThrowConsoleError = false
// let lastState = ""

const saveStateToLocalStorageCallback = (sState: EmulatorSaveState) => {
  const state = constructSaveStateWithUI(sState)
  // const currentState = state.slice(0, state.indexOf("stackDump:"))
  // if (currentState === lastState) return
  try {
    localStorage.setItem("apple2ts_save_state", state)
    // lastState = currentState
    didThrowConsoleError = false
  } catch (e) {
    if (!didThrowConsoleError) {
      console.error("Failed to save state to localStorage", e)
      didThrowConsoleError = true
    }
  }
}

export const resetSavedStateFromLocalStorage = () => {
  localStorage.removeItem("apple2ts_save_state")
}

const saveStateToDownloadCallback = (sState: EmulatorSaveState) => {
  const state = constructSaveStateWithUI(sState)
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

let saveStateTimer: number | undefined = undefined

const onHidden = () => { if (document.hidden) handleSaveStateToLocalStorage() }
const onPageHide = () => handleSaveStateToLocalStorage()

export const handleSaveStateToLocalStorage = () => {
  if (getPreferenceBoolean("saveStateToLocalStorage")) {
    const runMode = handleGetRunMode()
    if (runMode !== RUN_MODE.IDLE && runMode !== RUN_MODE.NEED_BOOT) {
      handleGetSaveStateForLocalStorage(saveStateToLocalStorageCallback)
    }
    if (saveStateTimer === undefined) {
      saveStateTimer = window.setInterval(handleSaveStateToLocalStorage, 1000)
      document.addEventListener("visibilitychange", onHidden)
      window.addEventListener("pagehide", onPageHide)
    }
  } else if (saveStateTimer !== undefined) {
    clearInterval(saveStateTimer)
    saveStateTimer = undefined
    document.removeEventListener("visibilitychange", onHidden)
    window.removeEventListener("pagehide", onPageHide)
  }
}

export const handleSaveStateToDownload = (withSnapshots: boolean) => {
  handleGetSaveState(saveStateToDownloadCallback, withSnapshots)
}

export const RestoreSaveState = (fileContents: string) => {
  const sState: EmulatorSaveState = JSON.parse(fileContents)
  passRestoreSaveState(sState)
  const displayState = sState.emulator
  // In an old version, property was renamed from uppercase to lowercaseMode
  if (displayState && ("uppercase" in displayState)) {
    displayState.lowercaseMode = displayState["uppercase"] as boolean
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
    passSetShowDebugTab(displayState.isDebugging)
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
