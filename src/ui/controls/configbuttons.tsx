import { lockedKeyStyle, UI_THEME } from "../../common/utility"
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
import { useState } from "react"
import PopupMenu from "./popupmenu"
import { audioEnable, isAudioEnabled } from "../devices/audio/speaker"
import { SerialPortSelect } from "../devices/serial/serialselect"
import { SpeedDropdown } from "./speeddropdown"
import { getLowercaseMode, getUseOpenAppleKey, getTheme, isGameMode } from "../ui_settings"
import { useTranslation } from "../../i18n/useTranslation"
import { AudioConfig } from "../devices/audio/audioconfig"
import { GamepadConfig } from "../devices/gamepadconfig"
import LinkBuilder from "./linkbuilder"

const isTouchDevice = "ontouchstart" in document.documentElement
const isMac = navigator.platform.startsWith("Mac")

const ConfigButtons = (props: DisplayProps) => {
  const { t } = useTranslation()
  const lowercaseMode = getLowercaseMode()
  const useOpenAppleKey = getUseOpenAppleKey()
  const modKey = (isMac ? "Cmd" : "Alt")
  const modKeyDisplay = isMac ? "⌘" : "alt"
  const themeNames = [t("themes.classic"), t("themes.dark"), t("themes.minimal")]

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
        title={t("controls.toggleSound")}
        style={{ display: typeof AudioContext !== "undefined" ? "" : "none" }}
        onClick={() => { audioEnable(!isAudioEnabled()); props.updateDisplay() }}>
        <FontAwesomeIcon icon={isAudioEnabled() ? faVolumeHigh : faVolumeXmark} />
      </button>
    </div>

    <div className="flex-row" id="tour-keyboardbuttons">
      {!isTouchDevice && <>
        <button className={lockedKeyStyle(lowercaseMode ? 0 : 2)}
          title={`${t("config.capsLock")} (${lowercaseMode ? t("messages.off") : t("messages.on")})`}
          onClick={() => { setPreferenceBoolean("lowercaseMode", !lowercaseMode); props.updateDisplay() }}>
          <span className="text-key" style={{ fontSize: "18pt" }}>{lowercaseMode ? "a" : "A"}</span>
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
      title={`${themeNames[getTheme()]} ${t("config.theme")}`}
      onClick={handleClick}>
      <FontAwesomeIcon icon={faPalette} />
    </button>

    <PopupMenu
      location={popupLocation}
      onClose={() => { setPopupLocation(undefined) }}
      menuItems={[Object.values(UI_THEME).filter(value => typeof value === "number").map((value, i) => {
        return {
          label: themeNames[i],
          isVisible: () => { return (isGameMode() ? i != UI_THEME.MINIMAL : true) },
          isSelected: () => { return i == getTheme() },
          onClick: () => {
            if (i >= 0 && i != getTheme()) {
              if (window.confirm(t("messages.confirmTheme"))) {
                setPreferenceTheme(i)
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
