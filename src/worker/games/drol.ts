import { addToBuffer } from "../devices/keyboard"

const helptext = 
`Drol
Benny Aik Beng Ngo, Brøderbund 1983

KEYBOARD:
Arrow keys for left/right
Arrow keys or A/Z for up/down
Spacebar: Fire

GAMEPAD:
D-pad: Up/Down/Left/Right
A button: Fire
`

const gamepad = (button: number) => {
  switch (button) {
    case 0: addToBuffer(" "); break  // jump
    case 12: addToBuffer("A"); break  // 12 D-pad up
    case 13: addToBuffer("Z"); break  // 13 D-pad down
    case 14: addToBuffer("\x08"); break // 14 D-pad left
    case 15: addToBuffer("\x15"); break // 15 D-pad right
    case -1: return
    default: break
  }
  // leftdown = 0
  // rightdown = 0
}

export const drol: GameLibraryItem = {
  address: 0x6007,
  data: [0xAD, 0x00, 0xC0],
  keymap: {"\x0B": "A", "\x0A": "Z"},
  joystick: null,
  gamepad: gamepad,
  rumble: null,
  setup: null,
  helptext: helptext}

