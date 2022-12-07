import { doSetCPUState, doAdvance6502,
  doRequestSaveState, doSetSaveState, doSetNormalSpeed,
  doGoBackInTime, doGoForwardInTime } from "./motherboard";
import { STATE } from "./utility"
import { addToBuffer } from "./keyboard"
import { pressAppleCommandKey, setGamePad } from "./joystick"

export const handleRun = () => {
  doSetCPUState(STATE.RUNNING)
}

export const handlePause = () => {
  doSetCPUState(STATE.PAUSED)
}

export const handleBoot = () => {
  doSetCPUState(STATE.NEED_BOOT)
}

export const handleReset = () => {
  doSetCPUState(STATE.NEED_RESET)
}

export const handleAdvance6502 = () => {
  doAdvance6502()
}


export const handleSetNormalSpeed = (normal: boolean) => {
  doSetNormalSpeed(normal)
}

export const handleGoForwardInTime = () => {
  doGoForwardInTime()
}

export const handleGoBackInTime = () => {
  doGoBackInTime()
}

export const handleSetSaveState = (sState: string) => {
  doSetSaveState(sState)
}

export const handleKeyboardBuffer = (text: String) => {
  addToBuffer(text)
}

export const handleAppleCommandKeyPress = (left: boolean) => {
  pressAppleCommandKey(true, left)
}

export const handleAppleCommandKeyRelease = (left: boolean) => {
  pressAppleCommandKey(false, left)
}

export const handleSetGamePad = (gamePad: Gamepad | null) => {
  setGamePad(gamePad)
}

let machineState: MachineState = {
  state: STATE.IDLE,
  speed: 0,
  altChar: false,
  textPage: new Uint8Array(960).fill(0xFF),
  lores: new Uint8Array(),
  hires: new Uint8Array()
}
let saveState = ""

export const handleGetState = () => {
  return machineState.state
}

export const handleGetSpeed = () => {
  return machineState.speed
}

export const handleGetTextPage = () => {
  return machineState.textPage
}

export const handleGetLores = () => {
  return machineState.lores
}

export const handleGetHires = () => {
  return machineState.hires
}

export const handleGetAltCharSet = () => {
  return machineState.altChar
}

export const handleGetSaveState = () => {
  doRequestSaveState()
  return saveState
}

export const passSaveState = (saveStateIn: string) => {
  saveState = saveStateIn
}

export const passMachineState = (state: MachineState) => {
   machineState = state
}

// export const passMachineSpeed = (speed: number) => {
//   machineSpeed = speed
// }

// export const passAltCharSet = (isAlt: boolean) => {
//   altCharSet = isAlt
// }

// export const passTextPage = (data: Uint8Array) => {
//   textPage = data
// }

// export const passLores = (data: Uint8Array) => {
//   lores = data
// }

// export const passHires = (data: Uint8Array) => {
//   hires = data
// }


