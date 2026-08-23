import { RUN_MODE } from "../../common/utility"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import {
  faArrowRotateRight,
  faCamera,
  faClipboard,
  faFolderOpen,
  faPaste,
  faPowerOff,
  faSave,
} from "@fortawesome/free-solid-svg-icons"
import { handleSetCPUState } from "../controller"
import { handleCopyScreenAsBitmap, handleCopyToClipboard } from "../copycanvas"
import { handleGetRunMode, handleGetTextPage, passPasteText } from "../main2worker"
import { handleFileSave } from "../savestate"
import { isGameMode } from "../ui_settings"
import DiskImportExport from "../devices/disk/diskimportexport"
import { useTranslation } from "../../i18n/useTranslation"
import type { RetroControlMetadata } from "../retro/retromenucontext"
import { createControlContext } from "../retro/retromenucontext"
import { ControlRegistry } from "./controlregistry"

export const retroStateControls: RetroControlMetadata[] = [
  {
    id: "state.restore",
    parentId: "machine",
    order: 2,
    label: context => context.t("controls.restoreState"),
    action: context => {
      context.close()
      context.displayProps.setShowFileOpenDialog(true, 0)
    },
  },
  {
    id: "state.save",
    parentId: "machine",
    order: 3,
    label: context => context.t("controls.saveState"),
    action: () => {
      const runMode = handleGetRunMode()
      if (runMode !== RUN_MODE.IDLE && runMode !== RUN_MODE.NEED_BOOT) handleFileSave(false)
    },
    selectable: () => {
      const runMode = handleGetRunMode()
      return runMode !== RUN_MODE.IDLE && runMode !== RUN_MODE.NEED_BOOT
    },
  },
]

const stateControlRegistry = new ControlRegistry(retroStateControls)

const ControlButtons = (props: DisplayProps) => {
  const { t, language, changeLanguage } = useTranslation()
  const runMode = handleGetRunMode()
  const stateControls = stateControlRegistry.resolve(
    createControlContext(props, t, language, changeLanguage),
    "machine",
  )
  const restoreState = stateControls.find(control => control.id === "state.restore")!
  const saveState = stateControls.find(control => control.id === "state.save")!
  return <span className="flex-row" id="tour-maincontrols">
    <button className="push-button .boot-button"
      title={t("controls.boot")}
      id="tour-boot-button"
      onClick={() => { handleSetCPUState(RUN_MODE.NEED_BOOT) }}>
      <FontAwesomeIcon icon={faPowerOff} />
    </button>
    <button className="push-button"
      title={t("controls.reset")}
      id="tour-reset-button"
      onClick={() => { handleSetCPUState(RUN_MODE.NEED_RESET) }}
      disabled={runMode === RUN_MODE.IDLE || runMode === RUN_MODE.NEED_BOOT}
    >
      <FontAwesomeIcon icon={faArrowRotateRight} />
    </button>
    {isGameMode() && <DiskImportExport />}
    {!isGameMode() &&
      <span id="tour-saverestore" className="flex-row">
        <button className="push-button" title={restoreState.label}
          onClick={restoreState.action}>
          <FontAwesomeIcon icon={faFolderOpen} style={{ fontSize: "0.9em" }} />
        </button>
        <button className="push-button" title={saveState.label}
          onClick={saveState.action}
          disabled={saveState.selectable === false}>
          <FontAwesomeIcon icon={faSave} />
        </button>
      </span>
    }
    <button className="push-button" title={t("controls.copyText")}
      disabled={handleGetTextPage().length === 0}
      onClick={() => handleCopyToClipboard()}>
      <FontAwesomeIcon icon={faClipboard} />
    </button>
    <button className="push-button" title={t("controls.pasteText")}
      onClick={() => {
        navigator.clipboard.readText().then((data) => passPasteText(data))
      }}>
      <FontAwesomeIcon icon={faPaste} />
    </button>
    <button className="push-button" title={t("controls.copyScreen")}
      onClick={() => handleCopyScreenAsBitmap()}>
      <FontAwesomeIcon icon={faCamera} />
    </button>
  </span>
}

export default ControlButtons
