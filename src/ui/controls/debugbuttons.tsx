import {
  passGoBackInTime, passGoForwardInTime,
  handleCanGoBackward, handleCanGoForward, passTimeTravelSnapshot, handleGetIsDebugging, handleGetRunMode,
} from "../main2worker"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import {
  faBug,
  faBugSlash,
  faCamera,
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
import { setPreferenceDebugMode, setPreferenceHotReload } from "../localstorage"
import { RUN_MODE, UI_THEME } from "../../common/utility"
import { isFileSystemApiSupported } from "../ui_utilities"
import { getTheme, getHotReload } from "../ui_settings"

const DebugButtons = (props: DisplayProps) => {
  const runMode = handleGetRunMode()
  const notStarted = runMode === RUN_MODE.IDLE || runMode === RUN_MODE.NEED_BOOT
  return <span className="flex-row">
    <div className="flex-row" id="tour-snapshot">
      <button className="push-button"
        title={"Go Back in Time"}
        onClick={passGoBackInTime}
        disabled={notStarted || !handleCanGoBackward()}>
        <FontAwesomeIcon icon={faFastBackward} />
      </button>
      <button className="push-button"
        title={"Take a Snapshot"}
        onClick={passTimeTravelSnapshot}
        disabled={notStarted}>
        <FontAwesomeIcon icon={faCamera} />
      </button>
      <button className="push-button"
        title={"Go Forward in Time"}
        onClick={passGoForwardInTime}
        disabled={notStarted || !handleCanGoForward()}>
        <FontAwesomeIcon icon={faFastForward} />
      </button>
      <button className="push-button"
        title={"Save State with Snapshots"}
        onClick={() => handleFileSave(true)}
        disabled={notStarted}>
        <FontAwesomeIcon icon={faLayerGroup} />
      </button>
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
    {getTheme() != UI_THEME.MINIMAL &&
      <button className="push-button" id="tour-debug-button"
        title="Toggle Debug"
        onClick={() => {
            setPreferenceDebugMode(!handleGetIsDebugging())
            // Force a refresh to pick up the new canvas size
            window.dispatchEvent(new Event("resize"))
          }}>
        <FontAwesomeIcon icon={handleGetIsDebugging() ? faBug : faBugSlash} />
      </button>}
    {isFileSystemApiSupported() &&
      <button className="push-button"
        title={getHotReload() ? "Hot Reload Enabled" : "Hot Reload Disabled"}
        onClick={() => {
          setPreferenceHotReload(!getHotReload())
          props.updateDisplay()
        }}>
        <FontAwesomeIcon icon={getHotReload() ? faEye : faEyeSlash} />
      </button>}
  </span>
}

export default DebugButtons
