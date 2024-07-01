import { handleGetFilename } from "./devices/driveprops"
import { changeMockingboardMode, getMockingboardMode } from "./devices/mockingboard_audio"
import { audioEnable, isAudioEnabled } from "./devices/speaker"
import { BreakpointMap } from "./emulator/utility/breakpoint"
import { RUN_MODE } from "./emulator/utility/utility"
import { handleGetBreakpoints, handleGetCapsLock, handleGetColorMode, handleGetHelpText, handleGetIsDebugging, handleGetRunMode, handleGetSaveState, handleGetSpeedMode, passBreakpoints, passCapsLock, passColorMode, passHelpText, passRestoreSaveState, passSetDebug, passSetRunMode, passSetSpeedMode } from "./main2worker"

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
    colorMode: handleGetColorMode(),
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
  for (let i = 0; i < 4; i++) {
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
    passColorMode(displayState.colorMode)
  }
  // In an old version, property was renamed from uppercase to capsLock
  if (displayState && ('uppercase' in displayState)) {
    passCapsLock(displayState['uppercase'] as boolean)
  }
  if (displayState?.capsLock !== undefined) {
    passCapsLock(displayState.capsLock)
  }
  if (displayState?.audioEnable !== undefined) {
    audioEnable(displayState.audioEnable)
  }
  if (displayState?.mockingboardMode !== undefined) {
    changeMockingboardMode(displayState.mockingboardMode)
  }
  if (displayState?.helptext !== undefined) {
    passHelpText(displayState.helptext)
  }
  if (displayState?.speedMode !== undefined) {
    passSetSpeedMode(displayState.speedMode)
  }
  if (displayState?.isDebugging !== undefined) {
    passSetDebug(displayState.isDebugging)
  }
  const runMode = displayState?.runMode ? (displayState.runMode as RUN_MODE) : RUN_MODE.RUNNING
  passSetRunMode(runMode)
  if (displayState?.breakpoints) {
    const deserializedBreakpoints = new BreakpointMap(JSON.parse(displayState.breakpoints))
    passBreakpoints(deserializedBreakpoints)
  }
}
