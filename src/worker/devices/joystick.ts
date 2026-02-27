import { defaultButtons, getGameMapping } from "../games/game_mappings"
import { memSetC000 } from "../memory"
import { SWITCHES } from "../softswitches"
// import { doSaveTimeSlice } from "./motherboard"
// import { addToBufferDebounce } from "./keyboard"

let gamePads: EmuGamepad[]

// This is 2.8ms times the clock frequency, which is the maximum time that
// the Apple II's PDL subroutine will wait for the RC timing circuit to
// discharge from 5V to 0V, and is then scaled into a value 0 to 255.
// This is actually a tiny bit less than 2.8ms, to guarantee that our
// midpoint is at 128.
const MAX_TIMEOUT_CYCLES = Math.trunc(0.00278 * 1.020484e6)
let paddle0timeout = MAX_TIMEOUT_CYCLES / 2
let paddle1timeout = MAX_TIMEOUT_CYCLES / 2
let paddle2timeout = MAX_TIMEOUT_CYCLES / 2
let paddle3timeout = MAX_TIMEOUT_CYCLES / 2
// let prevPaddle0timeout = paddle0timeout
// let prevPaddle1timeout = paddle1timeout
let countStart = 0
let leftAppleDown = false
let rightAppleDown = false
let leftButtonDown = false
let rightButtonDown = false
let isPB2down = false
let isLeftDown = false
let isRightDown = false

// 10 PRINT PEEK(49249); PEEK(49250); PEEK(49251): GOTO 10
export const setLeftButtonDown = () => { leftButtonDown = true }
export const setRightButtonDown = () => { rightButtonDown = true }
export const setPushButton2 = () => { isPB2down = true }

const valueToTimeout = (value: number) => {
  value = Math.min(Math.max(value, -1), 1)
  return (value + 1) * MAX_TIMEOUT_CYCLES / 2
}

export const setGamepad0 = (value: number) => {
  paddle0timeout = valueToTimeout(value)
}
export const setGamepad1 = (value: number) => {
  paddle1timeout = valueToTimeout(value)
}
export const setGamepad2 = (value: number) => {
  paddle2timeout = valueToTimeout(value)
}
export const setGamepad3 = (value: number) => {
  paddle3timeout = valueToTimeout(value)
}

export const setButtonState = () => {
  const wasLeftDown = isLeftDown
  const wasRightDown = isRightDown
  isLeftDown = leftAppleDown || leftButtonDown
  isRightDown = rightAppleDown || rightButtonDown
  SWITCHES.PB0.isSet = isLeftDown
  SWITCHES.PB1.isSet = isRightDown || isPB2down
  SWITCHES.PB2.isSet = isPB2down
  if ((isLeftDown && !wasLeftDown) || (isRightDown && !wasRightDown)) {
//    doSaveTimeSlice()
  }
}

export const pressAppleCommandKey = (isDown: boolean, left: boolean) => {
  if (left) {
    leftAppleDown = isDown
  } else {
    rightAppleDown = isDown
  }
  setButtonState()
}

export const resetJoystick = (cycleCount: number) => {
  memSetC000(0xC064, 0x80)
  memSetC000(0xC065, 0x80)
  memSetC000(0xC066, 0x80)
  memSetC000(0xC067, 0x80)
  countStart = cycleCount
}

// const largeDiff = (v1: number, v2: number) => {
//   return (Math.abs(v1 - v2) > 0.1 * MAX_TIMEOUT_CYCLES)
// }

export const checkJoystickValues = (cycleCount: number) => {
//   if (largeDiff(prevPaddle0timeout, paddle0timeout) ||
//     largeDiff(prevPaddle1timeout, paddle1timeout)) {
//     prevPaddle0timeout = paddle0timeout
//     prevPaddle1timeout = paddle1timeout
//     doSaveTimeSlice()
//   }
  const diff = cycleCount - countStart
  memSetC000(0xC064, (diff < paddle0timeout) ? 0x80 : 0)
  memSetC000(0xC065, (diff < paddle1timeout) ? 0x80 : 0)
  memSetC000(0xC066, (diff < paddle2timeout) ? 0x80 : 0)
  memSetC000(0xC067, (diff < paddle3timeout) ? 0x80 : 0)
}

let gameMapping: GameLibraryItem
let gamePadMapping: GamePadMapping
let isKeyboardJoystick = false

export const setGamepads = (gamePadsIn: EmuGamepad[]) => {
  gamePads = gamePadsIn
  isKeyboardJoystick = !gamePads.length || !gamePads[0].buttons.length
  gameMapping = getGameMapping()
  gamePadMapping = gameMapping.gamepad ? gameMapping.gamepad : defaultButtons
}

const nearZero = (value: number) => {return value > -0.01 && value < 0.01}

// Convert a circular thumbstick into a square range.
const circularToSquare = (xstick: number, ystick: number) => {
  if (nearZero(xstick)) xstick = 0
  if (nearZero(ystick)) ystick = 0
  const dist = Math.sqrt(xstick * xstick + ystick * ystick)
  // The 0.95 factor gives some headroom to make sure we reach the corners.
  const clip = 0.95 * ((dist === 0) ? 1 :
    Math.max(Math.abs(xstick), Math.abs(ystick)) / dist)
  xstick = Math.min(Math.max(-clip, xstick), clip)
  ystick = Math.min(Math.max(-clip, ystick), clip)
  xstick = (xstick + clip) / (2 * clip)
  ystick = (ystick + clip) / (2 * clip)
  return [xstick, ystick]
}

// Convert raw gamepad axes to a square joystick timeout values.
const convertAxesToTimeout = (xstick: number, ystick: number) => {
  [xstick, ystick] = circularToSquare(xstick, ystick)
  xstick = Math.trunc(MAX_TIMEOUT_CYCLES * xstick)
  ystick = Math.trunc(MAX_TIMEOUT_CYCLES * ystick)
  return [xstick, ystick]
}

const convertGamepadAxes = (axes: number[]) => {
  const [xstick1, ystick1] = convertAxesToTimeout(axes[0], axes[1])
  const joy2y = (axes.length >= 6) ? axes[5] : axes[3]
  const [xstick2, ystick2] = (axes.length >= 4) ? convertAxesToTimeout(axes[2], joy2y) : [0, 0]
  return [xstick1, ystick1, xstick2, ystick2]
}

const handleGamepad = (gp: number) => {
  const axes = gameMapping.joystick ?
    gameMapping.joystick(gamePads[gp].axes, isKeyboardJoystick) : gamePads[gp].axes
  const stick = convertGamepadAxes(axes)
  if (gp === 0) {
    paddle0timeout = stick[0]
    paddle1timeout = stick[1]
    leftButtonDown = false
    rightButtonDown = false
    paddle2timeout = stick[2]
    paddle3timeout = stick[3]
  } else {
    paddle2timeout = stick[0]
    paddle3timeout = stick[1]
    isPB2down = false
  }
  let buttonPressed = false
  gamePads[gp].buttons.forEach((button, i) => {
    if (button) {
      gamePadMapping(i, gamePads.length > 1, gp === 1)
      buttonPressed = true
    }
  })
  // Special "no buttons down" call
  if (!buttonPressed) {
    gamePadMapping(-1, gamePads.length > 1, gp === 1)
  }

  if (gameMapping.rumble) {
    gameMapping.rumble()
  }
  setButtonState()
}

export const handleGamepads = () => {
  if (gamePads && gamePads.length > 0) {
    handleGamepad(0)
    if (gamePads.length > 1) {
      handleGamepad(1)
    }
  }
}
