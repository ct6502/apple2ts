import {
  passGoBackInTime, passGoForwardInTime,
  handleCanGoBackward, handleCanGoForward, passTimeTravelSnapshot, handleGetRunMode,
} from "../main2worker"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import {
  faClock,
  faEye,
  faEyeSlash,
  faFastBackward,
  faFastForward,
  faLayerGroup,
  faPause,
  faPlay,
} from "@fortawesome/free-solid-svg-icons"
import { handleSetCPUState } from "../controller"
import { handleFileSave } from "../savestate"
import { RUN_MODE } from "../../common/utility"
import { getHotReload, isGameMode } from "../ui_settings"
import { isFileSystemApiSupported } from "../ui_utilities"
import { setPreferenceBoolean } from "../localstorage"
import { handleIsRetroHardcoreBlocked } from "../main2worker"

const DebugButtons = (props: DisplayProps) => {
  const runMode = handleGetRunMode()
  const notStarted = runMode === RUN_MODE.IDLE || runMode === RUN_MODE.NEED_BOOT
  const hardcoreBlocked = handleIsRetroHardcoreBlocked()
  return <span className="flex-row">
    <div className="flex-row" id="tour-snapshot">
      <button className="push-button"
        title={"Go Back in Time"}
        onClick={passGoBackInTime}
        disabled={hardcoreBlocked || notStarted || !handleCanGoBackward()}>
        <FontAwesomeIcon icon={faFastBackward} />
      </button>
      <button className="push-button"
        title={"Time Travel Snapshot"}
        onClick={passTimeTravelSnapshot}
        disabled={hardcoreBlocked || notStarted}>
        <FontAwesomeIcon icon={faClock} />
      </button>
      <button className="push-button"
        title={"Go Forward in Time"}
        onClick={passGoForwardInTime}
        disabled={hardcoreBlocked || notStarted || !handleCanGoForward()}>
        <FontAwesomeIcon icon={faFastForward} />
      </button>
      {!isGameMode() && <button className="push-button"
        title={"Save State with Snapshots"}
        onClick={() => handleFileSave(true)}
        disabled={hardcoreBlocked || notStarted}>
        <FontAwesomeIcon icon={faLayerGroup} />
      </button>}
    </div>
    <button className="push-button" id="tour-pause-button"
      title={runMode === RUN_MODE.PAUSED ? "Resume" : "Pause"}
      onClick={() => {
        handleSetCPUState(runMode === RUN_MODE.PAUSED ?
          RUN_MODE.RUNNING : RUN_MODE.PAUSED)
      }}
      disabled={runMode === RUN_MODE.IDLE}>
      {runMode === RUN_MODE.PAUSED ?
        <FontAwesomeIcon icon={faPlay} /> :
        <FontAwesomeIcon icon={faPause} />}
    </button>
    {isFileSystemApiSupported() && !isGameMode() &&
      <button className="push-button"
        title={getHotReload() ? "Hot Reload Enabled" : "Hot Reload Disabled"}
        onClick={() => {
          setPreferenceBoolean("hotReload", !getHotReload())
          props.updateDisplay()
        }}>
        <FontAwesomeIcon icon={getHotReload() ? faEye : faEyeSlash} />
      </button>}
  </span>
}

export default DebugButtons
