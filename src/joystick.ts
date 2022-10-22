import { memC000 } from "./memory"
import { SWITCHES } from "./softswitches";
// import { addToBuffer } from "./keyboard"

const maxTimeoutCycles = Math.trunc(0.0028*1.020484e6)
let paddle0timeout = maxTimeoutCycles / 2
let paddle1timeout = maxTimeoutCycles / 2
let prevPaddle0timeout = paddle0timeout
let prevPaddle1timeout = paddle1timeout
let countStart = 0
let leftAppleDown = false
let rightAppleDown = false
let leftButtonDown = false
let rightButtonDown = false
let isLeftDown = false
let isRightDown = false
let saveTimeSlice = () => {}

export const setButtonState = () => {
  const wasLeftDown = isLeftDown
  const wasRightDown = isRightDown
  isLeftDown = leftAppleDown || leftButtonDown
  isRightDown = rightAppleDown || rightButtonDown
  SWITCHES.PB0.isSet = (leftAppleDown || leftButtonDown)
  SWITCHES.PB1.isSet = (isRightDown || rightButtonDown)
  if ((isLeftDown && !wasLeftDown) || (isRightDown && !wasRightDown)) {
    saveTimeSlice()
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

export const clearAppleCommandKeys = () => {
  leftAppleDown = false
  rightAppleDown = false
  setButtonState()
}

// const keyPress = (key: number) => {
//   memSet1(0xC000, key | 0b10000000)
// }

const memSet1 = (addr: number, value: number) => {
  memC000[addr - 0xC000] = value
}
export const resetJoystick = (cycleCount: number) => {
  memSet1(0xC064, 0x80)
  memSet1(0xC065, 0x80)
  memSet1(0xC066, 0)
  memSet1(0xC067, 0)
  countStart = cycleCount
}

const largeDiff = (v1: number, v2: number) => {
  return (Math.abs(v1 - v2) > 0.1 * maxTimeoutCycles)
}

export const checkJoystickValues = (cycleCount: number) => {
  if (largeDiff(prevPaddle0timeout, paddle0timeout) ||
    largeDiff(prevPaddle1timeout, paddle1timeout)) {
    prevPaddle0timeout = paddle0timeout
    prevPaddle1timeout = paddle1timeout
    saveTimeSlice()
  }
  const diff = cycleCount - countStart
  memSet1(0xC064, (diff < paddle0timeout) ? 0x80 : 0)
  memSet1(0xC065, (diff < paddle1timeout) ? 0x80 : 0)
}

export const setSaveTimeSlice = (func: () => void) => {
  saveTimeSlice = func
}

const defaultButtons = [
  () => {leftButtonDown = true},
  () => {rightButtonDown = true},
  () => {leftButtonDown = true},
  () => {rightButtonDown = true},
  () => {leftButtonDown = true},
  () => {rightButtonDown = true},
  () => {leftButtonDown = true},
  () => {rightButtonDown = true},
  () => {leftButtonDown = true},
  () => {rightButtonDown = true},
  () => {leftButtonDown = true},
  () => {rightButtonDown = true},
  () => {paddle1timeout = 0},
  () => {paddle1timeout = maxTimeoutCycles},
  () => {paddle0timeout = 0},
  () => {paddle0timeout = maxTimeoutCycles},
]

// const wolf = [
//   () => {leftButtonDown = true},
//   () => {rightButtonDown = true},
//   () => {keyPress('U'.charCodeAt(0))},
//   () => {keyPress('T'.charCodeAt(0))},
//   () => {leftButtonDown = true},
//   () => {rightButtonDown = true},
//   () => {keyPress(' '.charCodeAt(0))},
//   () => {keyPress(13)},
//   () => {leftButtonDown = true},
//   () => {rightButtonDown = true},
//   () => {leftButtonDown = true},
//   () => {rightButtonDown = true},
//   () => {paddle1timeout = 0},
//   () => {paddle1timeout = maxTimeoutCycles},
//   () => {paddle0timeout = 0},
//   () => {paddle0timeout = maxTimeoutCycles},
// ]

// AZTEC Controls
// A, D: move left or right (while using weapon); face left or right (otherwise)
// W: go to walk mode
// R: go to run mode
// C: go to climb mode (ascends steps or mounds)
// J: jump
// S: stop walking, running, or climbing
// G: crawl once
// P: set explosive (must be crawling)
// O: open box or clear trash mound
// L: look in box
// T: take object from ground or box
// Z: inventory
// F: draw machete if you have one, gun otherwise, does nothin if unarmed
// S: turn around while using weapon
// L: lunge while using machete
// M: stab at ground while using machete
// G: switch from machete to gun
// <spacebar>: fire gun
// let moving = false
// const aztec = [
//   () => {addToBuffer('J')},  // 0 A
//   () => {rightButtonDown = true},  // 1 B
//   () => {addToBuffer('U')},  // 2 X
//   () => {addToBuffer('T')},  // 3 Y
//   () => {leftButtonDown = true},  // 4 LB
//   () => {rightButtonDown = true},  // 5 RB
//   () => {addToBuffer('O'); addToBuffer('L'); addToBuffer('T')},  // 6 LT
//   () => {addToBuffer(' ')},  // 7 RT
//   () => {leftButtonDown = true},  // 8 Select?
//   () => {rightButtonDown = true},  // 9 Start?
//   () => {leftButtonDown = true},  // 10 Left thumb
//   () => {rightButtonDown = true},  // 11 Right thumb
//   () => {addToBuffer('R')},  // 12 D-pad U
//   () => {addToBuffer('W')},  // 13 D-pad D
//   () => {
//     addToBuffer(moving ? 'S' : 'A')
//     moving = !moving
//     if (moving) {addToBuffer('W')}},  // 14 D-pad L
//   () => {
//     addToBuffer(moving ? 'S' : 'D')
//     moving = !moving
//     if (moving) {addToBuffer('W')}},  // 15 D-pad R
// ]

let funcs = defaultButtons
// funcs = aztec

export const handleGamePad = (gamePad: Gamepad | null) => {
  if (gamePad) {
    let xstick = (gamePad.axes[0] !== 0) ? gamePad.axes[0] : gamePad.axes[2]
    let ystick = (gamePad.axes[1] !== 0) ? gamePad.axes[1] : gamePad.axes[3]
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
      if (button.pressed && i < funcs.length) {
        console.log(i)
        funcs[i]()
      }
    });
    setButtonState()
  }

}
