import { lockedKeyStyle, themeToName, UI_THEME } from "../../common/utility"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import {
  faVolumeHigh,
  faVolumeXmark,
  faWalking,
  faTruckFast,
  faRocket,
  faUpDownLeftRight,
  faSlash,
  faSync,
  faPalette,
} from "@fortawesome/free-solid-svg-icons"
import { MockingboardWaveform } from "../devices/mockingboardwaveform"
import { MidiDeviceSelect } from "../devices/midiselect"
import { audioEnable, isAudioEnabled } from "../devices/speaker"
import { SerialPortSelect } from "../devices/serialselect"
import {
  handleGetArrowKeysAsJoystick,
  handleGetCapsLock, handleGetTheme, handleGetSpeedMode,
  handleUseOpenAppleKey,
  passArrowKeysAsJoystick,
  passUseOpenAppleKey
} from "../main2worker"
import { MachineConfig } from "../devices/machineconfig"
import { resetPreferences, setPreferenceCapsLock, setPreferenceTheme, setPreferenceSpeedMode } from "../localstorage"
import { DisplayConfig } from "../devices/displayconfig"
import RunTour from "../tours/runtour"
import { appleOutline } from "../img/icon_appleoutline"
import React from "react"

// import VideogameAssetIcon from '@mui/icons-material/VideogameAsset';
// import VideogameAssetOffIcon from '@mui/icons-material/VideogameAssetOff';
const isTouchDevice = "ontouchstart" in document.documentElement
const isMac = navigator.platform.startsWith("Mac")

const ConfigButtons = (props: DisplayProps) => {
  const speedMode = handleGetSpeedMode()
  const capsLock = handleGetCapsLock()
  const arrowKeysAsJoystick = handleGetArrowKeysAsJoystick()
  const useOpenAppleKey = handleUseOpenAppleKey()
  const modKey = isMac ? "⌘" : "Alt"

  const theme = handleGetTheme()
  const [droplistOpen, setDroplistOpen] = React.useState<boolean>(false)
  const [position, setPosition] = React.useState<{ x: number, y: number }>({ x: 0, y: 0 })

  const handleClick = (event: React.MouseEvent) => {
    const y = Math.min(event.clientY, window.innerHeight - 200)
    setPosition({ x: event.clientX, y: y })
    setDroplistOpen(true)
  }

  const handleThemeClose = (theme = -1) => {
    setDroplistOpen(false)
    if (theme >= 0 && theme != handleGetTheme()) {
      if (window.confirm("Reload the emulator and apply this theme now?")) {
        setPreferenceTheme(theme)
        const url = new URL(window.location.href)
        url.searchParams.delete("theme")
        window.location.href = url.toString()
      }
    }
  }

  return <div className="flex-row">
    <div className="flex-row" id="tour-configbuttons">
      <button className="push-button"
        title={(["1 MHz", "Fast Speed", "Ludicrous Speed"])[speedMode]}
        onClick={() => { setPreferenceSpeedMode((speedMode + 1) % 3); props.updateDisplay() }}>
        <FontAwesomeIcon icon={([faWalking, faTruckFast, faRocket])[speedMode]} />
      </button>

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
          onClick={() => { passUseOpenAppleKey(!useOpenAppleKey); props.updateDisplay() }}>
          {useOpenAppleKey ?
            <svg width="28" height="28" className="fill-color">{appleOutline}</svg> :
            <span className={(modKey === "Alt") ? "text-key" : ""}>{modKey.toLowerCase()}</span>}
        </button>
      }

      {!isTouchDevice &&
        <button className="push-button" style={{ position: "relative" }}
          title={`Use Arrow Keys as Joystick (${arrowKeysAsJoystick ? "on" : "off"})`}
          onClick={() => { passArrowKeysAsJoystick(!arrowKeysAsJoystick); props.updateDisplay() }}>
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
      title={`${themeToName(handleGetTheme())} Theme`}
      onClick={handleClick}>
      <FontAwesomeIcon icon={faPalette} />
    </button>

    {droplistOpen &&
      <div className="modal-overlay"
        style={{ backgroundColor: "rgba(0, 0, 0, 0)" }}
        onClick={() => handleThemeClose(-1)}>
        <div className="floating-dialog flex-column droplist-option"
          style={{ left: position.x, top: position.y }}>
          {Object.values(UI_THEME).filter(value => typeof value === "number").map((i) => (
            <div className="droplist-option" style={{ padding: "5px" }}
              onMouseOver={(e) => e.currentTarget.style.backgroundColor = "#ccc"}
              onMouseOut={(e) => e.currentTarget.style.backgroundColor = "inherit"}
              key={i} onClick={() => handleThemeClose(i)}>
              {(theme === i) ? "\u2714\u2009" : "\u2003"}{themeToName(i)}
            </div>))}
        </div>

      </div>
    }

    <button className="push-button" id="tour-clearcookies"
      title="Reset All Settings"
      onClick={() => { resetPreferences(); props.updateDisplay() }}>
      <FontAwesomeIcon icon={faSync} />
    </button>

    <RunTour />

  </div>
}

export default ConfigButtons
