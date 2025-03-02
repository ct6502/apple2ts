import { doPlayDriveSound } from "./devices/drivesounds"
import { DRIVE, RUN_MODE } from "../common/utility"
import { passSetRunMode, handleGetState6502 } from "./main2worker"
import { setDisassemblyAddress } from "./panels/debugpanelutilities"

export const handleSetCPUState = (state: RUN_MODE) => {
  // This is a hack to force the browser to start playing sound after a user gesture.
  if (state === RUN_MODE.NEED_BOOT) {
    doPlayDriveSound(DRIVE.TRACK_SEEK)
  }
  if (state === RUN_MODE.PAUSED) {
    const state = handleGetState6502()
    setDisassemblyAddress(state.PC)
  }
  passSetRunMode(state)
}
