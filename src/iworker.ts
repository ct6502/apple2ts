import { doGetMachineState, doBoot, doReset, doPause, doRun, doAdvance6502,
  doGetSaveState, doRestoreSaveState, doGetSpeed, doSetNormalSpeed, doSaveTimeSlice,
  doGoBackInTime, doGoForwardInTime, doGetTextPage, doMemget, doGetLores, doGetHGR } from "./motherboard";
import { addToBuffer } from "./keyboard"
import { pressAppleCommandKey, setGamePad } from "./joystick"

export const handleGetMachineState = () => {
  return doGetMachineState()
}

export const handleRun = () => {
  doRun()
}

export const handleAdvance6502 = () => {
  doAdvance6502()
}

export const handleGetSpeed = () => {
  return doGetSpeed()
}

export const handleSetNormalSpeed = (normal: boolean) => {
  doSetNormalSpeed(normal)
}

export const handleMemget = (addr: number) => {
  return doMemget(addr)
}

export const handleGetTextPage = () => {
  return doGetTextPage()
}

export const handleGetLores = () => {
  return doGetLores()
}

export const handleGetHGR = () => {
  return doGetHGR()
}

export const handleGoBackInTime = () => {
  doGoBackInTime()
}

export const handleGoForwardInTime = () => {
  doGoForwardInTime()
}

export const handlePause = () => {
  doPause(true)
}

export const handleBoot = () => {
  doBoot()
}

export const handleReset = () => {
  doReset()
}

export const getSaveState = () => {
  return doGetSaveState()
}

export const restoreSaveState = (sState: string) => {
  doRestoreSaveState(sState)
}

export const handleSaveTimeSlice = () => {
  doSaveTimeSlice()
}

export const handleKeyboardBuffer = (text: String) => {
  addToBuffer(text)
}

export const handleAppleCommandKeyPress = (left: boolean) => {
  return pressAppleCommandKey(true, left)
}

export const handleAppleCommandKeyRelease = (left: boolean) => {
  return pressAppleCommandKey(false, left)
}

export const handleSetGamePad = (gamePad: Gamepad | null) => {
  setGamePad(gamePad)
}