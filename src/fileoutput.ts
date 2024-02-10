import { getMockingboardMode } from "./devices/mockingboard_audio"
import { isAudioEnabled } from "./devices/speaker"
import { handleGetColorMode, handleGetCapsLock, handleGetFilename, handleGetSaveState } from "./main2worker"

const doSaveStateCallback = (saveState: EmulatorSaveState) => {
  const d = new Date()
  let datetime = new Date(d.getTime() - (d.getTimezoneOffset() * 60000)).toISOString()
  if (saveState.emulator) {
    saveState.emulator.name = `Apple2TS Emulator`
    saveState.emulator.date = datetime
    saveState.emulator.colorMode = handleGetColorMode()
    saveState.emulator.capsLock = handleGetCapsLock()
    saveState.emulator.audioEnable = isAudioEnabled()
    saveState.emulator.mockingboardMode = getMockingboardMode()
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
  handleGetSaveState(doSaveStateCallback, withSnapshots)
}
