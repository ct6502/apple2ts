import { addToBuffer, addToBufferDebounce } from "./keyboard"
import { setGamepad0, setGamepad1,
  setLeftButtonDown, setRightButtonDown } from "./joystick"
import { getFilename } from "./drivestate"

const defaultButtons = [
  () => {setLeftButtonDown()},
  () => {setRightButtonDown()},
  () => {setLeftButtonDown()},
  () => {setRightButtonDown()},
  () => {setLeftButtonDown()},
  () => {setRightButtonDown()},
  () => {setLeftButtonDown()},
  () => {setRightButtonDown()},
  () => {setLeftButtonDown()},
  () => {setRightButtonDown()},
  () => {setLeftButtonDown()},
  () => {setRightButtonDown()},
  () => {setGamepad1(-1)},
  () => {setGamepad1(1)},
  () => {setGamepad0(-1)},
  () => {setGamepad0(1)},
]

// const wolf = [
//   () => {setLeftButtonDown()},
//   () => {setRightButtonDown()},
//   () => {addToBufferDebounce('U'.charCodeAt(0))},
//   () => {addToBufferDebounce('T'.charCodeAt(0))},
//   () => {setLeftButtonDown()},
//   () => {setRightButtonDown()},
//   () => {addToBufferDebounce(' '.charCodeAt(0))},
//   () => {addToBufferDebounce('\r', timeout)},
//   () => {setLeftButtonDown()},
//   () => {setRightButtonDown()},
//   () => {setLeftButtonDown()},
//   () => {setRightButtonDown()},
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
// F: draw machete if you have one, gun otherwise, does nothing if unarmed
// S: turn around while using weapon
// L: lunge while using machete
// M: stab at ground while using machete
// G: switch from machete to gun
// <spacebar>: fire gun
//let moving = false
const timeout = 300
const aztec = [
  () => {addToBufferDebounce('J', timeout)},  // 0 A
  () => {addToBufferDebounce('R', timeout)},  // 1 B
  () => {addToBufferDebounce('O', timeout)},  // 2 X
  () => {addToBufferDebounce('L', timeout)},  // 3 Y
  () => {setLeftButtonDown()},  // 4 LB
  () => {addToBuffer('F'); addToBufferDebounce('L', timeout)},  // 5 RB
  () => {addToBuffer('O'); addToBuffer('L'); addToBufferDebounce('T', timeout)},  // 6 LT
  () => {addToBufferDebounce(' ', timeout)},  // 7 RT
  () => {setLeftButtonDown()},  // 8 Select?
  () => {setRightButtonDown()},  // 9 Start?
  () => {setLeftButtonDown()},  // 10 Left thumb
  () => {setRightButtonDown()},  // 11 Right thumb
  () => {addToBufferDebounce('C', timeout)},  // 12 D-pad U
  () => {addToBufferDebounce('S', timeout)},  // 13 D-pad D
  () => {
    addToBuffer('A')
    addToBufferDebounce('W', timeout)},  // 14 D-pad L
  () => {
    addToBuffer('D')
    addToBufferDebounce('W', timeout)},  // 15 D-pad R
]

export const getCustomGamepad = () => {
  const filename = getFilename()
  if (filename.toLowerCase().includes("aztec")) {
    return aztec
  }
  return defaultButtons
}

