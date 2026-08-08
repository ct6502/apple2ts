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
import { useTranslation } from "../../i18n/useTranslation"
import { setPreferenceBoolean } from "../localstorage"
import { isFileSystemApiSupported } from "../ui_utilities"

const DebugButtons = (props: DisplayProps) => {
  const { t } = useTranslation()
  const runMode = handleGetRunMode()
  const notStarted = runMode === RUN_MODE.IDLE || runMode === RUN_MODE.NEED_BOOT
  return <span className="flex-row">
    <div className="flex-row" id="tour-snapshot">
      <button className="push-button"
        title={t("debugControls.goBackInTime")}
        onClick={passGoBackInTime}
        disabled={notStarted || !handleCanGoBackward()}>
        <FontAwesomeIcon icon={faFastBackward} />
      </button>
      <button className="push-button"
        title={t("debugControls.takeSnapshot")}
        onClick={passTimeTravelSnapshot}
        disabled={notStarted}>
        <FontAwesomeIcon icon={faClock} />
      </button>
      <button className="push-button"
        title={t("debugControls.goForwardInTime")}
        onClick={passGoForwardInTime}
        disabled={notStarted || !handleCanGoForward()}>
        <FontAwesomeIcon icon={faFastForward} />
      </button>
      {!isGameMode() && <button className="push-button"
        title={t("debugControls.saveStateWithSnapshots")}
        onClick={() => handleFileSave(true)}
        disabled={notStarted}>
        <FontAwesomeIcon icon={faLayerGroup} />
      </button>}
    </div>
    <button className="push-button" id="tour-pause-button"
      title={runMode === RUN_MODE.PAUSED ? t("debugControls.resume") : t("debugControls.pause")}
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
        title={getHotReload() ? t("debugControls.hotReloadEnabled") : t("debugControls.hotReloadDisabled")}
        onClick={() => {
          setPreferenceBoolean("hotReload", !getHotReload())
          props.updateDisplay()
        }}>
        <FontAwesomeIcon icon={getHotReload() ? faEye : faEyeSlash} />
      </button>}
  </span>
}

export default DebugButtons
