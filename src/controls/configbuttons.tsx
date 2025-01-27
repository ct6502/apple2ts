import { lockedKeyStyle } from "../emulator/utility/utility"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import {
  faVolumeHigh,
  faVolumeXmark,
  faWalking,
  faTruckFast,
  faRocket,
  faCircleHalfStroke,
  faGamepad,
  faUpDownLeftRight,
  faSync,
} from "@fortawesome/free-solid-svg-icons";
import { MockingboardWaveform } from "../devices/mockingboardwaveform";
import { MidiDeviceSelect } from "../devices/midiselect";
import { audioEnable, isAudioEnabled } from "../devices/speaker";
import { SerialPortSelect } from "../devices/serialselect";
import {
  handleGetArrowKeysAsJoystick,
  handleGetCapsLock, handleGetDarkMode, handleGetSpeedMode,
  handleUseOpenAppleKey,
  passArrowKeysAsJoystick,
  passUseOpenAppleKey
} from "../main2worker";
import { MachineConfig } from "../devices/machineconfig";
import { resetPreferences, setPreferenceCapsLock, setPreferenceDarkMode, setPreferenceSpeedMode } from "../localstorage";
import { DisplayConfig } from "../devices/displayconfig";
import RunTour from "../tours/runtour";

// import VideogameAssetIcon from '@mui/icons-material/VideogameAsset';
// import VideogameAssetOffIcon from '@mui/icons-material/VideogameAssetOff';
const isTouchDevice = "ontouchstart" in document.documentElement
const isMac = navigator.platform.startsWith('Mac')

const ConfigButtons = (props: DisplayProps) => {
  const speedMode = handleGetSpeedMode()
  const capsLock = handleGetCapsLock()
  const arrowKeysAsJoystick = handleGetArrowKeysAsJoystick()
  const useOpenAppleKey = handleUseOpenAppleKey()
  const modKey = isMac ? "⌘" : "Alt"
  // const useArrowKeysAsJoystick = handleGetArrowKeysAsJoystick() ?
  //   <VideogameAssetIcon className="pushMuiButton" /> :
  //   <VideogameAssetOffIcon className="pushMuiButton" />

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
      style={{ display: typeof AudioContext !== 'undefined' ? '' : 'none' }}
      onClick={() => { audioEnable(!isAudioEnabled()); props.updateDisplay() }}>
      <FontAwesomeIcon icon={isAudioEnabled() ? faVolumeHigh : faVolumeXmark} />
    </button>
    </div>

    <button className={lockedKeyStyle(capsLock ? 2 : 0)}
      title="Caps Lock"
      onClick={() => { setPreferenceCapsLock(!capsLock); props.updateDisplay() }}>
      <span className="text-key" style={{ fontSize: "9pt" }}>caps</span>
    </button>

    {!isTouchDevice &&
      <button className={lockedKeyStyle(useOpenAppleKey ? 1 : 0)}
        title={useOpenAppleKey ? `Use ${modKey} as Open Apple key` : `Use ${modKey} for keyboard shortcuts`}
        onClick={() => { passUseOpenAppleKey(!useOpenAppleKey); props.updateDisplay() }}>
        <span className={(modKey === "Alt") ? "text-key" : ""}>{modKey.toLowerCase()}</span>
      </button>
    }

    {!isTouchDevice &&
      <button className="push-button"
        title={arrowKeysAsJoystick ? "Joystick Arrow Keys" : "Regular Arrow Keys"}
        onClick={() => { passArrowKeysAsJoystick(!arrowKeysAsJoystick); props.updateDisplay() }}>
        <FontAwesomeIcon icon={arrowKeysAsJoystick ? faGamepad : faUpDownLeftRight} />
      </button>
    }

    <MockingboardWaveform />

    <SerialPortSelect />

    <MidiDeviceSelect />

    <MachineConfig updateDisplay={props.updateDisplay} />

    <button className="push-button"
      title="Dark Mode"
      onClick={() => { setPreferenceDarkMode(!handleGetDarkMode()); props.updateDisplay() }}>
      <FontAwesomeIcon icon={faCircleHalfStroke} />
    </button>

    <button className="push-button"
      title="Reset All Settings"
      onClick={() => { resetPreferences(); props.updateDisplay() }}>
      <FontAwesomeIcon icon={faSync} />
    </button>

    <RunTour/>

  </div>
}

export default ConfigButtons;
