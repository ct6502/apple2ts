import { getCustomGamepad } from "./joystick_mapping"
import { matchMemory, memGet, memSetC000 } from "./memory"
import { SWITCHES } from "./softswitches"
import { passRumble } from "./worker2main"
// import { doSaveTimeSlice } from "./motherboard"
// import { addToBufferDebounce } from "./keyboard"

let gamePad: EmuGamepad | null = null
const maxTimeoutCycles = Math.trunc(0.0028*1.020484e6)
let paddle0timeout = maxTimeoutCycles / 2
let paddle1timeout = maxTimeoutCycles / 2
// let prevPaddle0timeout = paddle0timeout
// let prevPaddle1timeout = paddle1timeout
let countStart = 0
let leftAppleDown = false
let rightAppleDown = false
let leftButtonDown = false
let rightButtonDown = false
let isLeftDown = false
let isRightDown = false

export const setLeftButtonDown = () => {leftButtonDown = true}
export const setRightButtonDown = () => {rightButtonDown = true}
export const setGamepad0 = (value: number) => {
  value = Math.min(Math.max(value, -1), 1)
  paddle0timeout = (value + 1) / (2 * maxTimeoutCycles)
}
export const setGamepad1 = (value: number) => {
  value = Math.min(Math.max(value, -1), 1)
  paddle1timeout = (value + 1) / (2 * maxTimeoutCycles)
}

export const setButtonState = () => {
  const wasLeftDown = isLeftDown
  const wasRightDown = isRightDown
  isLeftDown = leftAppleDown || leftButtonDown
  isRightDown = rightAppleDown || rightButtonDown
  SWITCHES.PB0.isSet = (leftAppleDown || leftButtonDown)
  SWITCHES.PB1.isSet = (isRightDown || rightButtonDown)
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

const memSet1 = (addr: number, value: number) => {
  memSetC000(addr, value)
}
export const resetJoystick = (cycleCount: number) => {
  memSet1(0xC064, 0x80)
  memSet1(0xC065, 0x80)
  memSet1(0xC066, 0)
  memSet1(0xC067, 0)
  countStart = cycleCount
}

// const largeDiff = (v1: number, v2: number) => {
//   return (Math.abs(v1 - v2) > 0.1 * maxTimeoutCycles)
// }

export const checkJoystickValues = (cycleCount: number) => {
//   if (largeDiff(prevPaddle0timeout, paddle0timeout) ||
//     largeDiff(prevPaddle1timeout, paddle1timeout)) {
//     prevPaddle0timeout = paddle0timeout
//     prevPaddle1timeout = paddle1timeout
//     doSaveTimeSlice()
//   }
  const diff = cycleCount - countStart
  memSet1(0xC064, (diff < paddle0timeout) ? 0x80 : 0)
  memSet1(0xC065, (diff < paddle1timeout) ? 0x80 : 0)
}

let funcs: (() => void)[]

export const setGamepad = (gamePadIn: EmuGamepad) => {
  gamePad = gamePadIn
  funcs = getCustomGamepad()
}

const nearZero = (value: number) => {return value > -0.01 && value < 0.01}

let memB6 = 14

export const handleGamepad = () => {
  if (gamePad && gamePad.connected) {
    let xstick = gamePad.axes[0]
    let ystick = gamePad.axes[1]
    if (nearZero(gamePad.axes[0]) && nearZero(gamePad.axes[1])) {
      xstick = gamePad.axes[2]
      ystick = gamePad.axes[3]
    }
    if (nearZero(xstick)) xstick = 0
    if (nearZero(ystick)) ystick = 0
    const dist = Math.sqrt(xstick * xstick + ystick * ystick)
    const clip = 0.95 * ((dist === 0) ? 1 :
      Math.max(Math.abs(xstick), Math.abs(ystick)) / dist)
    xstick = Math.min(Math.max(-clip, xstick), clip)
    ystick = Math.min(Math.max(-clip, ystick), clip)
    paddle0timeout = Math.trunc(maxTimeoutCycles*(xstick + clip)/(2*clip))
    paddle1timeout = Math.trunc(maxTimeoutCycles*(ystick + clip)/(2*clip))
    leftButtonDown = false
    rightButtonDown = false
    gamePad.buttons.forEach((button, i) => {
      if (button && i < funcs.length) {
        funcs[i]()
      }
    });

    const isKarateka = matchMemory(0x6E6C, [0xAD, 0x00, 0xC0])
    if (isKarateka) {
      const newValue = memGet(0xB6)
      if (memB6 < 20 && newValue < memB6) {
        passRumble(300, 220)
      }
      memB6 = newValue
    }

    setButtonState()
  }

}
