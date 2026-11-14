import { UI_THEME, UI_THEMES } from "../../common/utility"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import {
  faDesktop,
  faVolumeHigh,
  faVolumeXmark,
} from "@fortawesome/free-solid-svg-icons"
import { faWindowMaximize as faWindowMaximizeOutline } from "@fortawesome/free-regular-svg-icons"
import { notifySettingsChanged, setPreferenceBoolean, setPreferenceTheme } from "../localstorage"
import { handleGetMachineName, passIigsDeskPanel } from "../main2worker"
import RunTour from "../tours/runtour"
import { useSyncExternalStore } from "react"
import {
  audioEnable,
  canShowAudioControl,
  getAudioStatus,
  retrySpeakerAudio,
  subscribeAudioStatus,
} from "../devices/audio/speaker"
import { SpeedDropdown } from "./speeddropdown"
import { getLowercaseMode, getTheme, getUIStateBoolean, isGameMode } from "../ui_settings"
import { useTranslation } from "../../i18n/useTranslation"
import LinkBuilder from "./linkbuilder"
import { ControlAvailabilityIcon } from "./controlavailabilityicon"
import type { RetroControlMetadata } from "../retro/retromenucontext"
import { choiceBinding, controlsFromJson, toggleBinding, type RetroControlBindings } from "../retro/retrocontrolmetadata"
import { openRetroControlPanel } from "../retro/retrocontrolevents"
import { SettingsDialog } from "./settingsdialog"
import { settingsResetBinding } from "./resetcontrols"
import { themeLabels } from "../ui_utilities"

const configBindings: RetroControlBindings = {
  "options.theme": {
    ...choiceBinding({
      options: context => themeLabels(context.t).map(label => ({ label })),
      currentIndex: () => UI_THEMES.findIndex(theme => theme.value === getTheme()),
      select: (_context, index) => {
        setPreferenceTheme(UI_THEMES[index].value)
        const url = new URL(window.location.href)
        url.searchParams.delete("theme")
        url.searchParams.set("cache", Date.now().toString())
        window.location.href = url.toString()
      },
    }),
    defaultIndex: UI_THEMES.findIndex(theme => theme.value === UI_THEME.CLASSIC),
  },
  keyboard: {
    value: context => context.t(getLowercaseMode() ? "retroControl.lowercase" : "keyboard.capsLock"),
  },
  "keyboard.lowercase": toggleBinding({
    enabled: getLowercaseMode,
    setEnabled: (context, enabled) => {
      setPreferenceBoolean("lowercaseMode", enabled, context.settingsOrigin)
      context.displayProps.updateDisplay()
    },
  }),
  "keyboard.openApple": toggleBinding({
    enabled: () => getUIStateBoolean("useOpenAppleKey"),
    setEnabled: (context, enabled) => {
      setPreferenceBoolean("useOpenAppleKey", enabled, context.settingsOrigin)
      context.displayProps.updateDisplay()
    },
  }),
  "settings.reset": settingsResetBinding,  // needed for the Retro Menu action
}

export const retroConfigControls: RetroControlMetadata[] = controlsFromJson("config", configBindings)

const ConfigButtons = (props: DisplayProps) => {
  const { t } = useTranslation()
  const audioStatus = useSyncExternalStore(subscribeAudioStatus, getAudioStatus)
  const audioUnavailable = audioStatus === "unavailable"
  const audioTitle = audioUnavailable
    ? t("controls.retrySound")
    : t("controls.toggleSound")

  return <div className="flex-row">
    <div className="flex-row" id="tour-configbuttons">

      <SpeedDropdown {...props} />

      <button className="push-button"
        title={audioTitle}
        aria-label={audioTitle}
        style={{
          display: canShowAudioControl() ? "" : "none",
        }}
        onClick={() => {
          if (audioUnavailable) {
            void retrySpeakerAudio()
          } else {
            audioEnable(audioStatus === "muted")
            notifySettingsChanged(["sound.enabled"], "external")
          }
        }}>
        <ControlAvailabilityIcon unavailable={audioUnavailable}>
          <FontAwesomeIcon icon={audioStatus === "muted" ? faVolumeXmark : faVolumeHigh} />
        </ControlAvailabilityIcon>
      </button>
    </div>

    <SettingsDialog {...props} />

    {!isGameMode() && <RunTour showTour={false} />}

    <LinkBuilder />

    <button className="push-button"
      title={t("config.openRetroControlPanel")}
      type="button"
      onClick={openRetroControlPanel}>
      <FontAwesomeIcon icon={faWindowMaximizeOutline} />
    </button>

    {/* The ROM Desk Accessories menu belongs to the IIgs, so this one-click
        escape hatch appears only in GS mode. Place it immediately to the right
        of the Control Panel icon rather than the settings gear. */}
    {handleGetMachineName() === "APPLE2GS" &&
      <button className="push-button"
        id="tour-iigs-desk-button"
        title={t("machine.iigsDeskPanel")}
        aria-label={t("machine.iigsDeskPanel")}
        onClick={() => { passIigsDeskPanel() }}>
        <FontAwesomeIcon icon={faDesktop} />
      </button>}

  </div>
}

export default ConfigButtons
