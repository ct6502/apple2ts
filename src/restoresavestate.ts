import { changeMockingboardMode } from "./devices/mockingboard_audio"
import { audioEnable } from "./devices/speaker"
import { RUN_MODE } from "./emulator/utility/utility"
import { passCapsLock, passColorMode, passRestoreSaveState, passSetRunMode } from "./main2worker"

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
  passSetRunMode(RUN_MODE.RUNNING)
}
