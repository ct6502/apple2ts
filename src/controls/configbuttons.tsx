import { colorToName, lockedKeyStyle } from "../emulator/utility/utility"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import {
  faVolumeHigh,
  faVolumeXmark,
  faWalking,
  faTruckFast,
  faDisplay,
  faCircleHalfStroke,
} from "@fortawesome/free-solid-svg-icons";
import { getColorModeSVG } from "../img/icons";
import { MockingboardWaveform } from "../devices/mockingboardwaveform";
import { MidiDeviceSelect } from "../devices/midiselect";
import { audioEnable, isAudioEnabled } from "../devices/speaker";
import { SerialPortSelect } from "../devices/serialselect";
import { ReactNode } from "react";
import {
  handleGetCapsLock, handleGetColorMode, handleGetSpeedMode,
  passCapsLock, passColorMode, passSetSpeedMode
} from "../main2worker";
import { RamworksSelect } from "../devices/ramworks";

// import VideogameAssetIcon from '@mui/icons-material/VideogameAsset';
// import VideogameAssetOffIcon from '@mui/icons-material/VideogameAssetOff';

const ConfigButtons = (props: DisplayProps) => {
  const speedMode = handleGetSpeedMode()
  const colorMode = handleGetColorMode()
  const capsLock = handleGetCapsLock()
  // const useArrowKeysAsJoystick = handleGetArrowKeysAsJoystick() ?
  //   <VideogameAssetIcon className="pushMuiButton" /> :
  //   <VideogameAssetOffIcon className="pushMuiButton" />

  return <span className="flex-row">
    <button className="push-button"
      title={speedMode ? "Fast" : "1 MHz"}
      onClick={() => { passSetSpeedMode(speedMode ? 0 : 1); props.updateDisplay() }}>
      <FontAwesomeIcon icon={speedMode ? faTruckFast : faWalking} />
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

    <MockingboardWaveform />
    <SerialPortSelect />
    <MidiDeviceSelect />
    <RamworksSelect updateDisplay={props.updateDisplay} />

    <button className="push-button"
      title="Dark Mode"
      onClick={() => { props.setDarkMode(!props.darkMode) }}>
      <FontAwesomeIcon icon={faCircleHalfStroke} />
    </button>

    {/* <button className="push-button"
      title={"Keyboard Joystick"}
      onClick={() => passArrowKeysAsJoystick(handleGetArrowKeysAsJoystick())}>
      {useArrowKeysAsJoystick}
    </button> */}
  </span>
}

export default ConfigButtons;
