import { lockedKeyStyle, UI_THEME, UI_THEMES } from "../../common/utility"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import {
  faVolumeHigh,
  faVolumeXmark,
  faSync,
  faPalette,
} from "@fortawesome/free-solid-svg-icons"
import { MachineConfig } from "../devices/machineconfig"
import { resetPreferences, setPreferenceBoolean, setPreferenceTheme } from "../localstorage"
import { DisplayConfig } from "../devices/displayconfig"
import RunTour from "../tours/runtour"
import { appleOutline } from "../img/icon_appleoutline"
import { useState, useSyncExternalStore } from "react"
import PopupMenu from "./popupmenu"
import {
  audioEnable,
  canShowAudioControl,
  getAudioStatus,
  retrySpeakerAudio,
  subscribeAudioStatus,
} from "../devices/audio/speaker"
import { SerialPortSelect } from "../devices/serial/serialselect"
import { SpeedDropdown } from "./speeddropdown"
import { getLowercaseMode, getUseOpenAppleKey, getTheme, isGameMode } from "../ui_settings"
import { useTranslation } from "../../i18n/useTranslation"
import { AudioConfig } from "../devices/audio/audioconfig"
import { GamepadConfig } from "../devices/gamepadconfig"
import LinkBuilder from "./linkbuilder"
import { ControlAvailabilityIcon } from "./controlavailabilityicon"

const isTouchDevice = "ontouchstart" in document.documentElement
const isMac = navigator.platform.startsWith("Mac")

const ConfigButtons = (props: DisplayProps) => {
  const { t } = useTranslation()
  const lowercaseMode = getLowercaseMode()
  const useOpenAppleKey = getUseOpenAppleKey()
  const modKey = (isMac ? "Cmd" : "Alt")
  const modKeyDisplay = isMac ? "⌘" : "alt"
  const themeNames: Record<UI_THEME, string> = {
    [UI_THEME.CLASSIC]: t("themes.classic"),
    [UI_THEME.DARK]: t("themes.dark"),
    [UI_THEME.MINIMAL]: t("themes.minimal"),
    [UI_THEME.RETRO]: "Retro",
  }
  const getThemeName = (theme: UI_THEME) => themeNames[theme]
  const audioStatus = useSyncExternalStore(subscribeAudioStatus, getAudioStatus)
  const audioUnavailable = audioStatus === "unavailable"
  const audioTitle = audioUnavailable
    ? t("controls.retrySound")
    : t("controls.toggleSound")

  const [popupLocation, setPopupLocation] = useState<[number, number]>()
  const cmdKeyTitle = useOpenAppleKey
    ? t("config.useOpenApple", { modKey })
    : t("config.useShortcuts", { modKey })

  const handleClick = (event: React.MouseEvent) => {
    setPopupLocation([event.clientX, event.clientY])
  }
  return <div className="flex-row">
    <div className="flex-row" id="tour-configbuttons">

      <SpeedDropdown updateDisplay={props.updateDisplay} />

      <DisplayConfig updateDisplay={props.updateDisplay} />

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
          }
        }}>
        <ControlAvailabilityIcon unavailable={audioUnavailable}>
          <FontAwesomeIcon icon={audioStatus === "muted" ? faVolumeXmark : faVolumeHigh} />
        </ControlAvailabilityIcon>
      </button>
    </div>

    <div className="flex-row" id="tour-keyboardbuttons">
      {!isTouchDevice && <>
        <button className={lockedKeyStyle(lowercaseMode ? 0 : 2)}
          title={`${t("config.capsLock")} (${lowercaseMode ? t("messages.off") : t("messages.on")})`}
          onClick={() => { setPreferenceBoolean("lowercaseMode", !lowercaseMode); props.updateDisplay() }}>
          <span translate="no" className="text-key" style={{ fontSize: "18pt" }}>
            {lowercaseMode ? "a" : "A"}
          </span>
        </button>
        <button className="push-button"
          title={cmdKeyTitle}
          onClick={() => { setPreferenceBoolean("useOpenAppleKey", !useOpenAppleKey); props.updateDisplay() }}>
          {useOpenAppleKey ?
            <svg width="28" height="28" className="fill-color">{appleOutline}</svg> :
            <span className={(modKey === "Alt") ? "text-key" : ""}>{modKeyDisplay}</span>}
        </button>
        </>
      }

      {!isTouchDevice && <GamepadConfig />}
    </div>

    {!isGameMode() && <AudioConfig />}

    {!isGameMode() && <SerialPortSelect />}

    {!isGameMode() && <MachineConfig updateDisplay={props.updateDisplay} />}

    <button className="push-button"
      id="tour-theme-button"
      title={`${getThemeName(getTheme())} ${t("config.theme")}`}
      onClick={handleClick}>
      <FontAwesomeIcon icon={faPalette} />
    </button>

    <PopupMenu
      location={popupLocation}
      onClose={() => { setPopupLocation(undefined) }}
      menuItems={[UI_THEMES.map(({ value }) => {
        return {
          label: themeNames[value],
          isVisible: () => { return !isGameMode() || (value != UI_THEME.MINIMAL && value != UI_THEME.RETRO) },
          isSelected: () => { return value == getTheme() },
          onClick: () => {
            if (value != getTheme()) {
              if (window.confirm(t("messages.confirmTheme"))) {
                setPreferenceTheme(value)
                const url = new URL(window.location.href)
                url.searchParams.delete("theme")
                url.searchParams.set("cache", new Date().getTime().toString())
                window.location.href = url.toString()
              }
            }
          }
        }
      })]}
    />

    {!isGameMode() && <button className="push-button" id="tour-clearcookies"
      title={t("config.resetSettings")}
      onClick={() => { resetPreferences(); props.updateDisplay() }}>
      <FontAwesomeIcon icon={faSync} />
    </button>}

    {!isGameMode() && <RunTour />}

    <LinkBuilder />

  </div>
}

export default ConfigButtons
