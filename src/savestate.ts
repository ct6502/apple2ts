import { handleGetFilename } from "./devices/driveprops"
import { changeMockingboardMode, getMockingboardMode } from "./devices/mockingboard_audio"
import { audioEnable, isAudioEnabled } from "./devices/speaker"
import { RUN_MODE } from "./emulator/utility/utility"
import { handleGetCapsLock, handleGetColorMode, handleGetHelpText, handleGetSaveState, passCapsLock, passColorMode, passHelpText, passRestoreSaveState, passSetRunMode } from "./main2worker"

const useSaveStateCallback = (saveState: EmulatorSaveState) => {
  const d = new Date()
  let datetime = new Date(d.getTime() - (d.getTimezoneOffset() * 60000)).toISOString()
  if (saveState.emulator) {
    saveState.emulator.name = `Apple2TS Emulator`
    saveState.emulator.date = datetime
    saveState.emulator.colorMode = handleGetColorMode()
    saveState.emulator.capsLock = handleGetCapsLock()
    saveState.emulator.audioEnable = isAudioEnabled()
    saveState.emulator.mockingboardMode = getMockingboardMode()
    saveState.emulator.helptext = handleGetHelpText()
  }
  const state = JSON.stringify(saveState, null, 2)
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
  datetime = datetime.replaceAll('-', '').replaceAll(':', '').split('.')[0]
  link.setAttribute('download', `${name}${datetime}.a2ts`);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

export const handleFileSave = (withSnapshots: boolean) => {
  handleGetSaveState(useSaveStateCallback, withSnapshots)
}

export const RestoreSaveState = (fileContents: string) => {
  const saveState: EmulatorSaveState = JSON.parse(fileContents)
  passRestoreSaveState(saveState)
  if (saveState.emulator?.colorMode !== undefined) {
    passColorMode(saveState.emulator.colorMode)
  }
  if (saveState.emulator && ('uppercase' in saveState.emulator)) {
    passCapsLock(saveState.emulator['uppercase'] as boolean)
  }
  if (saveState.emulator?.capsLock !== undefined) {
    passCapsLock(saveState.emulator.capsLock)
  }
  if (saveState.emulator?.audioEnable !== undefined) {
    audioEnable(saveState.emulator.audioEnable)
  }
  if (saveState.emulator?.mockingboardMode !== undefined) {
    changeMockingboardMode(saveState.emulator.mockingboardMode)
  }
  if (saveState.emulator?.helptext !== undefined) {
    passHelpText(saveState.emulator.helptext)
  }
  passSetRunMode(RUN_MODE.RUNNING)
}
