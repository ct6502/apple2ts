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
import { toggleMetadata } from "../retro/retromenuhelpers"
import type { RetroControlMetadata } from "../retro/retromenucontext"
import { createControlContext } from "../retro/retromenucontext"
import { ControlRegistry } from "./controlregistry"

const emulatorStarted = () => {
  const runMode = handleGetRunMode()
  return runMode !== RUN_MODE.IDLE && runMode !== RUN_MODE.NEED_BOOT
}

export const retroDebugControls: RetroControlMetadata[] = [
  {
    id: "machine.timeMachine",
    parentId: "machine",
    order: 4,
    tourTargets: ["#tour-snapshot"],
    label: context => context.t("retroControl.timeMachine"),
    separator: true,
    selectable: false,
  },
  {
    id: "snapshot.back",
    parentId: "machine",
    order: 5,
    label: context => context.t("debugControls.goBackInTime"),
    action: passGoBackInTime,
    selectable: () => emulatorStarted() && handleCanGoBackward(),
  },
  {
    id: "snapshot.take",
    parentId: "machine",
    order: 6,
    label: context => context.t("debugControls.takeSnapshot"),
    action: passTimeTravelSnapshot,
    selectable: emulatorStarted,
  },
  {
    id: "snapshot.forward",
    parentId: "machine",
    order: 7,
    label: context => context.t("debugControls.goForwardInTime"),
    action: passGoForwardInTime,
    selectable: () => emulatorStarted() && handleCanGoForward(),
  },
  {
    id: "snapshot.saveState",
    parentId: "machine",
    order: 8,
    label: context => context.t("debugControls.saveStateWithSnapshots"),
    action: () => handleFileSave(true),
    selectable: emulatorStarted,
  },
  {
    id: "emulator.pause",
    parentId: "machine",
    order: 9,
    tourTargets: ["#tour-pause-button", "#tour-debug-pause"],
    label: context => context.t(handleGetRunMode() === RUN_MODE.PAUSED
      ? "debugControls.resume"
      : "debugControls.pause"),
    action: context => {
      handleSetCPUState(handleGetRunMode() === RUN_MODE.PAUSED ? RUN_MODE.RUNNING : RUN_MODE.PAUSED)
      context.displayProps.updateDisplay()
    },
    selectable: () => handleGetRunMode() !== RUN_MODE.IDLE,
  },
  toggleMetadata({
    id: "options.hotReload",
    order: 1,
    label: context => context.t(getHotReload()
      ? "debugControls.hotReloadEnabled"
      : "debugControls.hotReloadDisabled"),
    enabled: getHotReload,
    setEnabled: (context, enabled) => {
      setPreferenceBoolean("hotReload", enabled, context.settingsOrigin)
      context.displayProps.updateDisplay()
    },
    isVisible: isFileSystemApiSupported,
  }),
]

const debugControlRegistry = new ControlRegistry(retroDebugControls)

const DebugButtons = (props: DisplayProps) => {
  const { t, language, changeLanguage } = useTranslation()
  const runMode = handleGetRunMode()
  const machineControls = debugControlRegistry.resolve(
    createControlContext(props, t, language, changeLanguage),
    "machine",
  )
  const optionControls = debugControlRegistry.resolve(
    createControlContext(props, t, language, changeLanguage),
    "options",
  )
  const controls = machineControls.filter(item => item.id !== "machine.timeMachine")
  const control = (id: string) => controls.find(item => item.id === id)!
  const back = control("snapshot.back")
  const take = control("snapshot.take")
  const forward = control("snapshot.forward")
  const save = control("snapshot.saveState")
  const pause = control("emulator.pause")
  const hotReload = optionControls.find(item => item.id === "options.hotReload")
  return <span className="flex-row">
    <div className="flex-row" id="tour-snapshot">
      <button className="push-button"
        title={back.label}
        onClick={back.action}
        disabled={back.selectable === false}>
        <FontAwesomeIcon icon={faFastBackward} />
      </button>
      <button className="push-button"
        title={take.label}
        onClick={take.action}
        disabled={take.selectable === false}>
        <FontAwesomeIcon icon={faClock} />
      </button>
      <button className="push-button"
        title={forward.label}
        onClick={forward.action}
        disabled={forward.selectable === false}>
        <FontAwesomeIcon icon={faFastForward} />
      </button>
      {!isGameMode() && <button className="push-button"
        title={save.label}
        onClick={save.action}
        disabled={save.selectable === false}>
        <FontAwesomeIcon icon={faLayerGroup} />
      </button>}
    </div>
    <button className="push-button" id="tour-pause-button"
      title={pause.label}
      onClick={pause.action}
      disabled={pause.selectable === false}>
      {runMode === RUN_MODE.PAUSED ?
        <FontAwesomeIcon icon={faPlay} /> :
        <FontAwesomeIcon icon={faPause} />}
    </button>
    {hotReload && !isGameMode() &&
      <button className="push-button"
        title={hotReload.label}
        onClick={hotReload.options?.[hotReload.optionIndex === 1 ? 0 : 1]?.action}>
        <FontAwesomeIcon icon={getHotReload() ? faEye : faEyeSlash} />
      </button>}
  </span>
}

export default DebugButtons
