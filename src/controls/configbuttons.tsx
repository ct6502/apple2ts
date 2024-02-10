import { colorToName, lockedKeyStyle } from "../emulator/utility/utility"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import {
  faVolumeHigh,
  faVolumeXmark,
  faWalking,
  faTruckFast,
  faDisplay,
} from "@fortawesome/free-solid-svg-icons";
import { getColorModeSVG } from "../img/icons";
import { MockingboardWaveform } from "../devices/mockingboardwaveform";
import { MidiDeviceSelect } from "../devices/midiselect";
import { audioEnable, isAudioEnabled } from "../devices/speaker";
import { ReactNode } from "react";
import { handleGetCapsLock, handleGetColorMode, handleGetSpeedMode, passCapsLock, passColorMode, passSetSpeedMode, updateDisplay } from "../main2worker";
// import VideogameAssetIcon from '@mui/icons-material/VideogameAsset';
// import VideogameAssetOffIcon from '@mui/icons-material/VideogameAssetOff';

const ConfigButtons = () => {
  // const useArrowKeysAsJoystick = props.useArrowKeysAsJoystick ?
  //   <VideogameAssetIcon className="pushMuiButton" /> :
  //   <VideogameAssetOffIcon className="pushMuiButton" />
  const speedMode = handleGetSpeedMode()
  const colorMode = handleGetColorMode()
  const capsLock = handleGetCapsLock()

  return <span className="flex-row">
    <button className="push-button"
      title={speedMode ? "Fast" : "1 MHz"}
      onClick={() => { passSetSpeedMode(speedMode ? 0 : 1); updateDisplay() }}>
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
        updateDisplay()
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
      onClick={() => { audioEnable(!isAudioEnabled()); updateDisplay() }}>
      <FontAwesomeIcon icon={isAudioEnabled() ? faVolumeHigh : faVolumeXmark} />
    </button>
    <button className={lockedKeyStyle(capsLock ? 2 : 0)}
      title="Caps Lock"
      onClick={() => { passCapsLock(!capsLock); updateDisplay() }}>
      <span className="text-key" style={{ fontSize: "9pt" }}>caps</span>
    </button>

    <MockingboardWaveform />
    <MidiDeviceSelect />

    {/* <button className="push-button"
      title={"Keyboard Joystick"}
      onClick={() => props.handleUseArrowKeyJoystick(props.useArrowKeysAsJoystick)}>
      {useArrowKeysAsJoystick}
    </button> */}
  </span>
}

export default ConfigButtons;
