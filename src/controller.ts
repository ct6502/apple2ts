import { doPlayDriveSound } from "./devices/diskinterface"
import { DRIVE, STATE } from "./emulator/utility/utility"
import { passSetCPUState, passSetDisassembleAddress } from "./main2worker"

export const handleSetCPUState = (state: STATE) => {
  // This is a hack to force the browser to start playing sound after a user gesture.
  if (state === STATE.NEED_BOOT) {
    doPlayDriveSound(DRIVE.TRACK_SEEK)
  }
  if (state === STATE.PAUSED) {
    passSetDisassembleAddress(STATE.PAUSED)
  } else {
    passSetDisassembleAddress(STATE.RUNNING)
  }
  passSetCPUState(state)
}
