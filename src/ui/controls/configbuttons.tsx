import { lockedKeyStyle, themeToName, UI_THEME } from "../../common/utility"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import {
  faVolumeHigh,
  faVolumeXmark,
  faUpDownLeftRight,
  faSlash,
  faSync,
  faPalette,
} from "@fortawesome/free-solid-svg-icons"
import { MachineConfig } from "../devices/machineconfig"
import { resetPreferences, setPreferenceCapsLock, setPreferenceTheme } from "../localstorage"
import { DisplayConfig } from "../devices/displayconfig"
import RunTour from "../tours/runtour"
import { appleOutline } from "../img/icon_appleoutline"
import { useState } from "react"
import PopupMenu from "./popupmenu"
import { MidiDeviceSelect } from "../devices/audio/midiselect"
import { MockingboardWaveform } from "../devices/audio/mockingboardwaveform"
import { audioEnable, isAudioEnabled } from "../devices/audio/speaker"
import { SerialPortSelect } from "../devices/serial/serialselect"
import { SpeedDropdown } from "./speeddropdown"
import { getCapsLock, getArrowKeysAsJoystick, getUseOpenAppleKey, setUseOpenAppleKey, setArrowKeysAsJoystick, getTheme } from "../ui_settings"

// import VideogameAssetIcon from '@mui/icons-material/VideogameAsset';
// import VideogameAssetOffIcon from '@mui/icons-material/VideogameAssetOff';
const isTouchDevice = "ontouchstart" in document.documentElement
const isMac = navigator.platform.startsWith("Mac")

const ConfigButtons = (props: DisplayProps) => {
  const capsLock = getCapsLock()
  const arrowKeysAsJoystick = getArrowKeysAsJoystick()
  const useOpenAppleKey = getUseOpenAppleKey()
  const modKey = isMac ? "⌘" : "Alt"

  const [popupLocation, setPopupLocation] = useState<[number, number]>()

  const handleClick = (event: React.MouseEvent) => {
    setPopupLocation([event.clientX, event.clientY])
  }
  return <div className="flex-row">
    <div className="flex-row" id="tour-configbuttons">

      <SpeedDropdown updateDisplay={props.updateDisplay} />

      <DisplayConfig updateDisplay={props.updateDisplay} />

      <button className="push-button"
        title={"Toggle Sound"}
        style={{ display: typeof AudioContext !== "undefined" ? "" : "none" }}
        onClick={() => { audioEnable(!isAudioEnabled()); props.updateDisplay() }}>
        <FontAwesomeIcon icon={isAudioEnabled() ? faVolumeHigh : faVolumeXmark} />
      </button>
    </div>

    <div className="flex-row" id="tour-keyboardbuttons">
      <button className={lockedKeyStyle(capsLock ? 2 : 0)}
        title={`Caps Lock (${capsLock ? "on" : "off"})`}
        onClick={() => { setPreferenceCapsLock(!capsLock); props.updateDisplay() }}>
        <span className="text-key" style={{ fontSize: "18pt" }}>{capsLock ? "A" : "a"}</span>
      </button>

      {!isTouchDevice &&
        <button className="push-button"
          title={useOpenAppleKey ? `Use ${modKey} as Open Apple key` : `Use ${modKey} for keyboard shortcuts`}
          onClick={() => { setUseOpenAppleKey(!useOpenAppleKey); props.updateDisplay() }}>
          {useOpenAppleKey ?
            <svg width="28" height="28" className="fill-color">{appleOutline}</svg> :
            <span className={(modKey === "Alt") ? "text-key" : ""}>{modKey.toLowerCase()}</span>}
        </button>
      }

      {!isTouchDevice &&
        <button className="push-button" style={{ position: "relative" }}
          title={`Use Arrow Keys as Joystick (${arrowKeysAsJoystick ? "on" : "off"})`}
          onClick={() => { setArrowKeysAsJoystick(!arrowKeysAsJoystick); props.updateDisplay() }}>
          <FontAwesomeIcon icon={faUpDownLeftRight} style={arrowKeysAsJoystick ? {} : { transform: "translateX(50%)" }} />
          {!arrowKeysAsJoystick && <FontAwesomeIcon style={{ transform: "translateX(-50%)", width: "80%" }} icon={faSlash} />}
        </button>
      }
    </div>

    <MockingboardWaveform />

    <SerialPortSelect />

    <MidiDeviceSelect />

    <MachineConfig updateDisplay={props.updateDisplay} />

    <button className="push-button"
      id="tour-theme-button"
      title={`${themeToName(getTheme())} Theme`}
      onClick={handleClick}>
      <FontAwesomeIcon icon={faPalette} />
    </button>

    <PopupMenu
      location={popupLocation}
      onClose={() => { setPopupLocation(undefined) }}
      menuItems={[Object.values(UI_THEME).filter(value => typeof value === "number").map((value, i) => {
        return {
          label: themeToName(i),
          isSelected: () => { return i == getTheme() },
          onClick: () => {
            if (i >= 0 && i != getTheme()) {
              if (window.confirm("Reload the emulator and apply this theme now?")) {
                setPreferenceTheme(i)
                const url = new URL(window.location.href)
                url.searchParams.delete("theme")
                window.location.href = url.toString()
              }
            }
          }
        }
      })]}
    />

    <button className="push-button" id="tour-clearcookies"
      title="Reset All Settings"
      onClick={() => { resetPreferences(); props.updateDisplay() }}>
      <FontAwesomeIcon icon={faSync} />
    </button>

    <RunTour />

  </div>
}

export default ConfigButtons
