import { changeMockingboardMode } from "./devices/mockingboard_audio"
import { audioEnable } from "./devices/speaker"
import { COLOR_MODE, RUN_MODE } from "./emulator/utility/utility"
import { passRestoreSaveState, passSetRunMode } from "./main2worker"

export const restoreSaveState = (fileContents: string,
  handleColorChange: (mode: COLOR_MODE) => void,
  handleUpperCaseChange: (enable: boolean) => void) => {
  const saveState: EmulatorSaveState = JSON.parse(fileContents)
  passRestoreSaveState(saveState)
  if (saveState.emulator?.colorMode !== undefined) {
    handleColorChange(saveState.emulator.colorMode)
  }
  if (saveState.emulator?.uppercase !== undefined) {
    handleUpperCaseChange(saveState.emulator.uppercase)
  }
  if (saveState.emulator?.audioEnable !== undefined) {
    audioEnable(saveState.emulator.audioEnable)
  }
  if (saveState.emulator?.mockingboardMode !== undefined) {
    changeMockingboardMode(saveState.emulator.mockingboardMode)
  }
  passSetRunMode(RUN_MODE.RUNNING)
}
