import { DRIVE, RUN_MODE } from "../common/utility"
import { doPlayDriveSound } from "./devices/disk/drivesounds"
import { handleIsRetroHardcoreBlocked, passSetRunMode } from "./main2worker"

export const handleSetCPUState = (state: RUN_MODE) => {
  if (handleIsRetroHardcoreBlocked() && (state === RUN_MODE.PAUSED)) {
    return
  }
  // This is a hack to force the browser to start playing sound after a user gesture.
  if (state === RUN_MODE.NEED_BOOT) {
    doPlayDriveSound(DRIVE.TRACK_SEEK)
  }
  passSetRunMode(state)
}
