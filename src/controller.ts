import { doPlayDriveSound } from "./devices/diskinterface"
import { DRIVE, RUN_MODE } from "./emulator/utility/utility"
import { passSetRunMode, passSetDisassembleAddress } from "./main2worker"

export const handleSetCPUState = (state: RUN_MODE) => {
  // This is a hack to force the browser to start playing sound after a user gesture.
  if (state === RUN_MODE.NEED_BOOT) {
    doPlayDriveSound(DRIVE.TRACK_SEEK)
  }
  if (state === RUN_MODE.PAUSED) {
    passSetDisassembleAddress(RUN_MODE.PAUSED)
  } else {
    passSetDisassembleAddress(RUN_MODE.RUNNING)
  }
  passSetRunMode(state)
}
