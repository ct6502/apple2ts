import { useState } from "react"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { faHourglassStart } from "@fortawesome/free-solid-svg-icons"
import PopupMenu from "../controls/popupmenu"
import { useTranslation } from "../../i18n/useTranslation"
import { AUTO_SNAPSHOT, RUN_MODE } from "../../common/utility"
import { handleSetCPUState } from "../controller"
import { isCanvasFullscreen, setCanvasFullscreen } from "../controls/fullscreenbutton"
import type { RetroControlMetadata } from "../retro/retromenucontext"
import { choiceBinding, controlsFromJson, type RetroControlBindings } from "../retro/retrocontrolmetadata"
import { getAutoSnapshot, getUIStateBoolean } from "../ui_settings"
import { setPreferenceAutoSnapshot, setPreferenceBoolean } from "../localstorage"

const machineBindings: RetroControlBindings = {
  "machine.boot": {
    action: context => {
      handleSetCPUState(RUN_MODE.NEED_BOOT)
      context.close()
    },
  },
  "machine.reset": {
    action: context => {
      handleSetCPUState(RUN_MODE.NEED_RESET)
      context.close()
    },
  },
  "machine.fullscreen": {
    ...choiceBinding({
      options: context => [
        { label: context.t("messages.off") },
        { label: context.t("messages.on") },
      ],
      currentIndex: () => isCanvasFullscreen() ? 1 : 0,
      select: (context, index) => setCanvasFullscreen(index === 1, context.settingsOrigin),
    }),
    defaultIndex: 0,
  },
}

export const retroMachineControls: RetroControlMetadata[] = controlsFromJson("machine", machineBindings)

export const TimeTravelConfig = () => {
  const { t } = useTranslation()
  const [popupLocation, setPopupLocation] = useState<[number, number]>()

  const handleClick = (event: React.MouseEvent) => {
    setPopupLocation([event.clientX, event.clientY])
  }

  const autoSnapshot = getAutoSnapshot()

  return (
    <span>
      <button
        id="basic-button"
        className="push-button"
        title={t("timetravel.configuration")}
        onClick={handleClick}
      >
        <FontAwesomeIcon icon={faHourglassStart} />
      </button>

      <PopupMenu
        location={popupLocation}
        onClose={() => { setPopupLocation(undefined) }}
        menuItems={[[
          { label: t("timetravel.snapshotOnKeyPress"),
            isSelected: () => getUIStateBoolean("snapshotOnKeyPress"),
            onClick: () => {
              setPreferenceBoolean("snapshotOnKeyPress", !getUIStateBoolean("snapshotOnKeyPress"))
            }
          },
          { label: "-" },
          { label: t("timetravel.autoSnapshot"), isHeading: true },
          { label: t("timetravel.auto_Off"),
            isSelected: () => autoSnapshot === AUTO_SNAPSHOT.AUTO_OFF,
            onClick: () => { setPreferenceAutoSnapshot(AUTO_SNAPSHOT.AUTO_OFF) }
           },
          { label: t("timetravel.auto_100k"),
            isSelected: () => autoSnapshot === AUTO_SNAPSHOT.AUTO_100K,
            onClick: () => { setPreferenceAutoSnapshot(AUTO_SNAPSHOT.AUTO_100K) }
           },
          { label: t("timetravel.auto_1M"),
            isSelected: () => autoSnapshot === AUTO_SNAPSHOT.AUTO_1M,
            onClick: () => { setPreferenceAutoSnapshot(AUTO_SNAPSHOT.AUTO_1M) }
           },
        ]]}
      />
    </span>
  )
}
