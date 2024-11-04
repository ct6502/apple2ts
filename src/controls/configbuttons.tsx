import { colorToName, lockedKeyStyle } from "../emulator/utility/utility"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import {
  faVolumeHigh,
  faVolumeXmark,
  faWalking,
  faTruckFast,
  faRocket,
  faDisplay,
  faCircleHalfStroke,
  faGamepad,
  faUpDownLeftRight,
} from "@fortawesome/free-solid-svg-icons";
import { getColorModeSVG } from "../img/icons";
import { MockingboardWaveform } from "../devices/mockingboardwaveform";
import { MidiDeviceSelect } from "../devices/midiselect";
import { audioEnable, isAudioEnabled } from "../devices/speaker";
import { SerialPortSelect } from "../devices/serialselect";
import { ReactNode } from "react";
import {
  handleGetArrowKeysAsJoystick,
  handleGetCapsLock, handleGetColorMode, handleGetDarkMode, handleGetSpeedMode,
  handleUseOpenAppleKey,
  passArrowKeysAsJoystick,
  passCapsLock, passColorMode, passDarkMode, passSetSpeedMode,
  passUseOpenAppleKey
} from "../main2worker";
import { MachineConfig } from "../devices/machineconfig";

// import VideogameAssetIcon from '@mui/icons-material/VideogameAsset';
// import VideogameAssetOffIcon from '@mui/icons-material/VideogameAssetOff';
const isTouchDevice = "ontouchstart" in document.documentElement
const isMac = navigator.platform.startsWith('Mac')

const ConfigButtons = (props: DisplayProps) => {
  const speedMode = handleGetSpeedMode()
  const colorMode = handleGetColorMode()
  const capsLock = handleGetCapsLock()
  const arrowKeysAsJoystick = handleGetArrowKeysAsJoystick()
  const useOpenAppleKey = handleUseOpenAppleKey()
  const modKey = isMac ? "⌘" : "Alt"
  // const useArrowKeysAsJoystick = handleGetArrowKeysAsJoystick() ?
  //   <VideogameAssetIcon className="pushMuiButton" /> :
  //   <VideogameAssetOffIcon className="pushMuiButton" />

  return <span className="flex-row">
    <button className="push-button"
      title={(["1 MHz", "Fast Speed", "Ludicrous Speed"])[speedMode]}
      onClick={() => { passSetSpeedMode((speedMode + 1) % 3); props.updateDisplay() }}>
      <FontAwesomeIcon icon={([faWalking, faTruckFast, faRocket])[speedMode]} />
    </button>
    <button className="push-button"
      title={colorToName(colorMode)}
      onClick={(e) => {
        if (e.shiftKey) {
          passColorMode((colorMode + 4) % 5)
        } else {
          passColorMode((colorMode + 1) % 5)
        }
        // Force an update, since our colorMode isn't a state variable.
        props.updateDisplay()
      }}>
      <span className="fa-layers fa-fw">
        <svg width="20" height="19">
          {getColorModeSVG(colorMode) as ReactNode}
        </svg>
        <FontAwesomeIcon icon={faDisplay} />
      </span>
    </button>
    <button className="push-button"
      title={"Toggle Sound"}
      style={{ display: typeof AudioContext !== 'undefined' ? '' : 'none' }}
      onClick={() => { audioEnable(!isAudioEnabled()); props.updateDisplay() }}>
      <FontAwesomeIcon icon={isAudioEnabled() ? faVolumeHigh : faVolumeXmark} />
    </button>
    <button className={lockedKeyStyle(capsLock ? 2 : 0)}
      title="Caps Lock"
      onClick={() => { passCapsLock(!capsLock); props.updateDisplay() }}>
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
      onClick={() => { passDarkMode(!handleGetDarkMode()); props.updateDisplay() }}>
      <FontAwesomeIcon icon={faCircleHalfStroke} />
    </button>

  </span>
}

export default ConfigButtons;
