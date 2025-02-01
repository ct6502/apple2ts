import { handleGetFilename } from "./devices/driveprops"
import { getMockingboardMode } from "./devices/mockingboard_audio"
import { audioEnable, isAudioEnabled } from "./devices/speaker"
import { BreakpointMap } from "./emulator/utility/breakpoint"
import { MAX_DRIVES, RUN_MODE } from "./emulator/utility/utility"
import { setPreferenceCapsLock, setPreferenceColorMode, setPreferenceDebugMode, setPreferenceMockingboardMode, setPreferenceShowScanlines, setPreferenceSpeedMode } from "./localstorage"
import { handleGetArrowKeysAsJoystick, handleGetBreakpoints, handleGetCapsLock,
  handleGetColorMode, handleGetHelpText, handleGetIsDebugging, handleGetRunMode,
  handleGetSaveState, handleGetShowScanlines, handleGetSpeedMode, passArrowKeysAsJoystick,
  passBreakpoints, passHelpText, passRestoreSaveState, passSetRunMode } from "./main2worker"

const useSaveStateCallback = (sState: EmulatorSaveState) => {
  const d = new Date()
  const datetime = new Date(d.getTime() - (d.getTimezoneOffset() * 60000)).toISOString()
  const breakpoints = handleGetBreakpoints()
  const serializedBreakpoints = JSON.stringify(Array.from(breakpoints.entries()))
  const stackDump = sState.emulator.stackDump
  const displayState: DisplaySaveState = {
    name: 'Apple2TS Emulator',
    date: datetime,
    version: 1.0,
    arrowKeysAsJoystick: handleGetArrowKeysAsJoystick(),
    colorMode: handleGetColorMode(),
    showScanlines: handleGetShowScanlines(),
    capsLock: handleGetCapsLock(),
    audioEnable: isAudioEnabled(),
    mockingboardMode: getMockingboardMode(),
    speedMode: handleGetSpeedMode(),
    helptext: handleGetHelpText(),
    isDebugging: handleGetIsDebugging(),
    runMode: handleGetRunMode(),
    breakpoints: serializedBreakpoints,
    stackDump: stackDump
  }
  sState.emulator = displayState
  const state = JSON.stringify(sState, null, 2)
  const blob = new Blob([state], { type: "text/plain" });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  link.setAttribute('href', url);
  let name = "apple2ts"
  for (let i = 0; i < MAX_DRIVES; i++) {
    const n = handleGetFilename(i)
    if (n) {
      name = n
      break
    }
  }
  link.setAttribute('download', `${name}.a2ts`);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

export const handleFileSave = (withSnapshots: boolean) => {
  handleGetSaveState(useSaveStateCallback, withSnapshots)
}

export const RestoreSaveState = (fileContents: string) => {
  const sState: EmulatorSaveState = JSON.parse(fileContents)
  passRestoreSaveState(sState)
  const displayState = sState.emulator
  if (displayState?.colorMode !== undefined) {
    setPreferenceColorMode(displayState.colorMode)
  }
  if (displayState?.showScanlines !== undefined) {
    setPreferenceShowScanlines(displayState.showScanlines)
  }
  // In an old version, property was renamed from uppercase to capsLock
  if (displayState && ('uppercase' in displayState)) {
    setPreferenceCapsLock(displayState['uppercase'] as boolean)
  }
  if (displayState?.arrowKeysAsJoystick !== undefined) {
    passArrowKeysAsJoystick(displayState.arrowKeysAsJoystick)
  }
  if (displayState?.capsLock !== undefined) {
    setPreferenceCapsLock(displayState.capsLock)
  }
  if (displayState?.audioEnable !== undefined) {
    audioEnable(displayState.audioEnable)
  }
  if (displayState?.mockingboardMode !== undefined) {
    setPreferenceMockingboardMode(displayState.mockingboardMode)
  }
  if (displayState?.helptext !== undefined) {
    passHelpText(displayState.helptext)
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
          bp.expression1 = { register: '', address: 0, operator: '', value: 0 }
          bp.expression2 = { register: '', address: 0, operator: '', value: 0 }
          bp.expressionOperator = ''
        }
        deserializedBreakpoints.set(bp.address, bp)
      }
    }
    passBreakpoints(deserializedBreakpoints)
  }
}
