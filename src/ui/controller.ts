import { doPlayDriveSound } from "./devices/drivesounds"
import { DRIVE, RUN_MODE } from "../common/utility"
import { passSetRunMode } from "./main2worker"

export const handleSetCPUState = (state: RUN_MODE) => {
  // This is a hack to force the browser to start playing sound after a user gesture.
  if (state === RUN_MODE.NEED_BOOT) {
    doPlayDriveSound(DRIVE.TRACK_SEEK)
  }
  passSetRunMode(state)
}
