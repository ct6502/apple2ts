import { addToBuffer } from "../keyboard";
import { memSet } from "../memory"

const helptext = `SNOGGLE
Jun Wada and Ken Iba
Star Craft (Brøderbund) 1981

KEYBOARD
A    up
Z    down
N , ←     left
M . →     right
`

const gamepad = (button: number) => {
  switch (button) {
    case 1: memSet(0x6D, 255); break  // extra life
    case 12: addToBuffer('A'); break  // 12 D-pad up
    case 13: addToBuffer('Z'); break  // 13 D-pad down
    case 14: addToBuffer('\x08'); break // 14 D-pad left
    case 15: addToBuffer('\x15'); break // 15 D-pad right
    default: break;
  }
}

const threshold = 0.75
const joystick = (axes: number[]) => {
  const key = (axes[0] < -threshold) ? '\x08' : (axes[0] > threshold) ? '\x15' :
    (axes[1] < -threshold) ? 'A' : (axes[1] > threshold) ? 'Z' : ''
  if (key) {
    addToBuffer(key)
  }
  return axes
}

const setup = () => {
  // Disable splash screen flashing
  memSet(0x61C1, 0xAD)
  memSet(0x61CC, 0x40)
}

// Allow N/M and ,/. to work as left/right arrow keys, for phones
export const snoggle: GameLibraryItem[] = [
  {
    address: 0x8866,
    data: [0x20, 0x00, 0x60],
    keymap: {},
    joystick: null,
    gamepad: null,
    rumble: null,
    setup: setup,
    helptext: helptext
  },
  {
    address: 0x1C7B,
    data: [0xAD, 0x00, 0xC0],
    keymap: {'N': '\x08', 'M': '\x15', ',': '\x08', '.': '\x15'},
    joystick: joystick,
    gamepad: gamepad,
    rumble: null,
    setup: null,
    helptext: helptext
  }]
