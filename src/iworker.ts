import { doSetMachineState, doAdvance6502,
  doGetSaveState, doSetSaveState, doSetNormalSpeed,
  doGoBackInTime, doGoForwardInTime, doMemget } from "./motherboard";
import { STATE } from "./utility"
import { addToBuffer } from "./keyboard"
import { pressAppleCommandKey, setGamePad } from "./joystick"

export const handleRun = () => {
  doSetMachineState(STATE.RUNNING)
}

export const handlePause = () => {
  doSetMachineState(STATE.PAUSED)
}

export const handleBoot = () => {
  doSetMachineState(STATE.NEED_BOOT)
}

export const handleReset = () => {
  doSetMachineState(STATE.NEED_RESET)
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

let machineState: STATE = STATE.IDLE
let machineSpeed = 0
let textPage = new Uint8Array(960).fill(0xFF)
let lores = new Uint8Array()
let hires = new Uint8Array()

export const handleGetMachineState = () => {
  return machineState
}

export const handleGetSpeed = () => {
  return machineSpeed
}

export const handleGetTextPage = () => {
  return textPage
}

export const handleGetLores = () => {
  return lores
}

export const handleGetHires = () => {
  return hires
}

export const handleMemget = (addr: number) => {
  return doMemget(addr)
}

export const handleGetSaveState = () => {
  return doGetSaveState()
}

export const passMachineState = (state: STATE) => {
  machineState = state
}

export const passMachineSpeed = (speed: number) => {
  machineSpeed = speed
}

export const passTextPage = (data: Uint8Array) => {
  textPage = data
}

export const passLores = (data: Uint8Array) => {
  lores = data
}

export const passHires = (data: Uint8Array) => {
  hires = data
}


