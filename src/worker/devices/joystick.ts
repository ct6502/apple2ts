import { defaultButtons, getGameMapping } from "../games/game_mappings"
import { memSetC000 } from "../memory"
import { SWITCHES } from "../softswitches"
import { checkSiriusJoyportValues, getSiriusJoyport, siriusJoyportButtons } from "./sirius_joyport"
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

export const setGamepadValue = (gamepad: number, value: number) => {
  switch (gamepad) {
    case 0:
      paddle0timeout = valueToTimeout(value)
      break
    case 1:
      paddle1timeout = valueToTimeout(value)
      break
    case 2:
      paddle2timeout = valueToTimeout(value)
      break
    case 3:
      paddle3timeout = valueToTimeout(value)
      break
  }
}

export const setButtonState = () => {
  const wasLeftDown = isLeftDown
  const wasRightDown = isRightDown
  isLeftDown = leftAppleDown || leftButtonDown
  isRightDown = rightAppleDown || rightButtonDown
  SWITCHES.PB0.isSet = isLeftDown
  SWITCHES.PB1.isSet = isRightDown
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

export const checkJoystickValues = (cycleCount: number, value: number) => {
//   if (largeDiff(prevPaddle0timeout, paddle0timeout) ||
//     largeDiff(prevPaddle1timeout, paddle1timeout)) {
//     prevPaddle0timeout = paddle0timeout
//     prevPaddle1timeout = paddle1timeout
//     doSaveTimeSlice()
//   }
  const diff = cycleCount - countStart
  memSetC000(0xC064, (diff < paddle0timeout) ? (value | 0x80) : (value & 0x7F))
  memSetC000(0xC065, (diff < paddle1timeout) ? (value | 0x80) : (value & 0x7F))
  memSetC000(0xC066, (diff < paddle2timeout) ? (value | 0x80) : (value & 0x7F))
  memSetC000(0xC067, (diff < paddle3timeout) ? (value | 0x80) : (value & 0x7F))
}

export const checkPushButtonValues = (addr: number, value: number) => {
  if (getSiriusJoyport()) {
    checkSiriusJoyportValues(addr)
  } else {
    let isSet = false
    switch (addr) {
      case SWITCHES.PB0.isSetAddr: isSet = SWITCHES.PB0.isSet; break
      case SWITCHES.PB1.isSetAddr: isSet = SWITCHES.PB1.isSet; break
      case SWITCHES.PB2.isSetAddr: isSet = SWITCHES.PB2.isSet; break
    }
    memSetC000(addr, isSet ? (value | 0x80) : (value & 0x7F))
  }
}

let gameMapping: GameLibraryItem
let gamePadMapping: GamePadMapping
let isKeyboardJoystick = false

export const setGamepads = (gamePadsIn: EmuGamepad[]) => {
  gamePads = gamePadsIn
  isKeyboardJoystick = !gamePads.length || !gamePads[0].buttons.length
  gameMapping = getGameMapping()
  if (gameMapping.gamepad) {
    gamePadMapping = gameMapping.gamepad
  } else {
    const siriusJoyport = getSiriusJoyport()
    gamePadMapping = siriusJoyport ? siriusJoyportButtons : defaultButtons
  }
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
  } else {
    paddle2timeout = stick[0]
    paddle3timeout = stick[1]
  }
  const buttons = gamePads[gp].buttons
  // This is a hack for generic Ucom controllers, which map the D-pad buttons
  // to strange values on axis 9.
  if (axes.length >= 10) {
    if (axes[9] !== 0 && axes[9] < 2) {
      if (axes[9] < -0.4 && axes[9] > -0.5) {
        buttons[15] = true  // D-pad Right
      } else if (axes[9] > 0.7 && axes[9] < 0.8) {
        buttons[14] = true  // D-pad Left
      } else if (axes[9] > 0.1 && axes[9] < 0.2) {
        buttons[13] = true  // D-pad Down
      } else if (axes[9] < -0.95) {
        buttons[12] = true  // D-pad Up
      }
    }
  }
  // Pass in -1 to initialize button states for appropriate joystick
  gamePadMapping(-1, gamePads.length > 1, gp === 1)
  buttons.forEach((button, i) => {
    if (button) {
      gamePadMapping(i, gamePads.length > 1, gp === 1)
    }
  })

  if (gameMapping.rumble) {
    gameMapping.rumble()
  }
  setButtonState()
}

export const handleGamepads = () => {
  leftButtonDown = false
  rightButtonDown = false
  isPB2down = false

  if (gamePads && gamePads.length > 0) {
    handleGamepad(0)
    if (gamePads.length > 1) {
      handleGamepad(1)
    }
  }
}
