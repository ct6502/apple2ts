import { getFilename } from "./drivestate"
import { addToBuffer, addToBufferDebounce } from "./keyboard"
import { memSetC000 } from "./memory"
import { SWITCHES } from "./softswitches"
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
//   () => {addToBufferDebounce('U'.charCodeAt(0))},
//   () => {addToBufferDebounce('T'.charCodeAt(0))},
//   () => {leftButtonDown = true},
//   () => {rightButtonDown = true},
//   () => {addToBufferDebounce(' '.charCodeAt(0))},
//   () => {addToBufferDebounce('\r', timeout)},
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
//let moving = false
const timeout = 300
const aztec = [
  () => {addToBufferDebounce('J', timeout)},  // 0 A
  () => {addToBuffer('O'); addToBufferDebounce('L', timeout)},  // 1 B
  () => {addToBufferDebounce('G', timeout)},  // 2 X
  () => {addToBufferDebounce('T', timeout)},  // 3 Y
  () => {leftButtonDown = true},  // 4 LB
  () => {addToBuffer('F'); addToBufferDebounce('L', timeout)},  // 5 RB
  () => {addToBuffer('O'); addToBuffer('L'); addToBufferDebounce('T', timeout)},  // 6 LT
  () => {addToBufferDebounce(' ', timeout)},  // 7 RT
  () => {leftButtonDown = true},  // 8 Select?
  () => {rightButtonDown = true},  // 9 Start?
  () => {leftButtonDown = true},  // 10 Left thumb
  () => {rightButtonDown = true},  // 11 Right thumb
  () => {addToBufferDebounce('C', timeout)},  // 12 D-pad U
  () => {addToBufferDebounce('S', timeout)},  // 13 D-pad D
  () => {
    addToBuffer('A')
    addToBufferDebounce('W', timeout)},  // 14 D-pad L
  () => {
    addToBuffer('D')
    addToBufferDebounce('W', timeout)},  // 15 D-pad R
]

let funcs = defaultButtons
// funcs = aztec

export const setGamepad = (gamePadIn: EmuGamepad) => {
  gamePad = gamePadIn
  const filename = getFilename()
  if (filename.toLowerCase().includes("aztec")) {
    funcs = aztec
  } else {
    funcs = defaultButtons
  }
}

const nearZero = (value: number) => {return value > -0.01 && value < 0.01}

export const handleGamepad = () => {
  if (gamePad && gamePad.connected) {
    let xstick = gamePad.axes[0]
    let ystick = gamePad.axes[1]
    if (nearZero(gamePad.axes[0]) && nearZero(gamePad.axes[1])) {
      xstick = gamePad.axes[2]
      ystick = gamePad.axes[3]
    }
    if (Math.abs(xstick) < 0.01) xstick = 0
    if (Math.abs(ystick) < 0.01) ystick = 0
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
    setButtonState()
  }

}
