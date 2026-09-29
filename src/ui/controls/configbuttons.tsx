import { UI_THEME, UI_THEMES } from "../../common/utility"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import {
  faVolumeHigh,
  faVolumeXmark,
  faSync,
  faPalette,
} from "@fortawesome/free-solid-svg-icons"
import { faWindowMaximize as faWindowMaximizeOutline } from "@fortawesome/free-regular-svg-icons"
import { MachineConfig } from "../devices/machineconfig"
import { notifySettingsChanged, resetPreferences, setPreferenceBoolean, setPreferenceTheme } from "../localstorage"
import { DisplayConfig } from "../devices/displayconfig"
import RunTour from "../tours/runtour"
import { useState, useSyncExternalStore } from "react"
import PopupMenu from "./popupmenu"
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
import { AudioConfig } from "../devices/audio/audioconfig"
import { GamepadConfig } from "../devices/gamepadconfig"
import LinkBuilder from "./linkbuilder"
import { ControlAvailabilityIcon } from "./controlavailabilityicon"
import type { RetroControlMetadata } from "../retro/retromenucontext"
import { createControlContext } from "../retro/retromenucontext"
import { ControlRegistry } from "./controlregistry"
import { choiceBinding, controlsFromJson, toggleBinding, type RetroControlBindings } from "../retro/retrocontrolmetadata"
import { openRetroControlPanel } from "../retro/retrocontrolevents"
import { TimeTravelConfig } from "../devices/timetravelconfig"

const themeLabels = (t: (key: string) => string) => [
  t("themes.classic"),
  t("themes.dark"),
  t("themes.minimal"),
]

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
  "settings.reset": {
    action: context => {
      resetPreferences(context.settingsOrigin)
      context.displayProps.updateDisplay()
    },
  },
}

export const retroConfigControls: RetroControlMetadata[] = controlsFromJson("config", configBindings)

const configControlRegistry = new ControlRegistry(retroConfigControls)

const ConfigButtons = (props: DisplayProps) => {
  const { t, language, changeLanguage } = useTranslation()
  const context = createControlContext(props, t, language, changeLanguage)
  const optionControls = configControlRegistry.resolve(context, "options")
  const themeControl = optionControls.find(control => control.id === "options.theme")!
  const resetControl = optionControls.find(control => control.id === "settings.reset")!

  const getThemeName = (theme: UI_THEME) => themeControl.options?.[
    UI_THEMES.findIndex(option => option.value === theme)
  ]?.label ?? theme
  const audioStatus = useSyncExternalStore(subscribeAudioStatus, getAudioStatus)
  const audioUnavailable = audioStatus === "unavailable"
  const audioTitle = audioUnavailable
    ? t("controls.retrySound")
    : t("controls.toggleSound")

  const [popupLocation, setPopupLocation] = useState<[number, number]>()

  const handleClick = (event: React.MouseEvent) => {
    setPopupLocation([event.clientX, event.clientY])
  }
  return <div className="flex-row">
    <div className="flex-row" id="tour-configbuttons">

      <SpeedDropdown {...props} />

      <DisplayConfig {...props} />

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

    <GamepadConfig />

    {!isGameMode() && <AudioConfig {...props} />}

    {!isGameMode() && <MachineConfig {...props} />}

    {!isGameMode() && <TimeTravelConfig/>}

    <button className="push-button"
      id="tour-theme-button"
      title={`${getThemeName(getTheme())} ${t("config.theme")}`}
      onClick={handleClick}>
      <FontAwesomeIcon icon={faPalette} />
    </button>

    <PopupMenu
      location={popupLocation}
      onClose={() => { setPopupLocation(undefined) }}
      menuItems={[UI_THEMES.map(({ value }, index) => {
        return {
          label: themeControl.options?.[index]?.label ?? String(value),
          isVisible: () => { return !isGameMode() || value != UI_THEME.MINIMAL },
          isSelected: () => { return value == getTheme() },
          onClick: themeControl.options?.[index]?.action,
        }
      })]}
    />

    {!isGameMode() && <button className="push-button" id="tour-clearcookies"
      title={resetControl.label}
      onClick={resetControl.action}>
      <FontAwesomeIcon icon={faSync} />
    </button>}

    {!isGameMode() && <RunTour showTour={false} />}

    <LinkBuilder />

    <button className="push-button"
      title={t("config.openRetroControlPanel")}
      type="button"
      onClick={openRetroControlPanel}>
      <FontAwesomeIcon icon={faWindowMaximizeOutline} />
    </button>

  </div>
}

export default ConfigButtons
