import { handleGetFilename } from "./devices/driveprops"
import { changeMockingboardMode, getMockingboardMode } from "./devices/mockingboard_audio"
import { audioEnable, isAudioEnabled } from "./devices/speaker"
import { RUN_MODE } from "./emulator/utility/utility"
import { handleGetCapsLock, handleGetColorMode, handleGetHelpText, handleGetSaveState, passCapsLock, passColorMode, passHelpText, passRestoreSaveState, passSetRunMode } from "./main2worker"

const useSaveStateCallback = (sState: EmulatorSaveState) => {
  const d = new Date()
  const datetime = new Date(d.getTime() - (d.getTimezoneOffset() * 60000)).toISOString()
  if (sState.emulator) {
    sState.emulator.name = `Apple2TS Emulator`
    sState.emulator.date = datetime
    sState.emulator.version = 1.0
    sState.emulator.colorMode = handleGetColorMode()
    sState.emulator.capsLock = handleGetCapsLock()
    sState.emulator.audioEnable = isAudioEnabled()
    sState.emulator.mockingboardMode = getMockingboardMode()
    sState.emulator.helptext = handleGetHelpText()
  }
  const state = JSON.stringify(sState, null, 2)
  const blob = new Blob([state], { type: "text/plain" });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  link.setAttribute('href', url);
  let name = handleGetFilename(0)
  if (!name) {
    name = handleGetFilename(1)
    if (!name) {
      name = "apple2ts"
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
  if (sState.emulator?.colorMode !== undefined) {
    passColorMode(sState.emulator.colorMode)
  }
  // In an old version, property was renamed from uppercase to capsLock
  if (sState.emulator && ('uppercase' in sState.emulator)) {
    passCapsLock(sState.emulator['uppercase'] as boolean)
  }
  if (sState.emulator?.capsLock !== undefined) {
    passCapsLock(sState.emulator.capsLock)
  }
  if (sState.emulator?.audioEnable !== undefined) {
    audioEnable(sState.emulator.audioEnable)
  }
  if (sState.emulator?.mockingboardMode !== undefined) {
    changeMockingboardMode(sState.emulator.mockingboardMode)
  }
  if (sState.emulator?.helptext !== undefined) {
    passHelpText(sState.emulator.helptext)
  }
  passSetRunMode(RUN_MODE.RUNNING)
}
