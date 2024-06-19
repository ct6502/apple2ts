import { memGet, memSet } from "../memory"
import { passRumble } from "../worker2main"

const helptext = 
`Robotron: 2084
(c) 1982 Williams Electronics, Inc.
(c) 1983 Atari, Inc.
Written by Steve Hays

This "Robotron4Joy" patch by Nick Westgate

Press <Space> to start game
1) One joystick
2) Gamepad with two joysticks

ESC       Pause (Space to resume)
Ctrl+Q    Quit current game
Ctrl+R+## Jump to level ##
Ctrl+S    Turn Sound On/Off`

const setup = () => {
  // 9 lives
  memSet(0x0C6A, 99)
  // Unlimited lives
  //  memSet(0x1509, 9)
}

const rumble = () => {
  if (memGet(0x39CF, false) === 0xFF) {
    passRumble({startDelay: 0, duration: 1000, weakMagnitude: 1, strongMagnitude: 0})
  }
}

export const robotron: GameLibraryItem = {
  address: 0x4242,
  data: [0xAD, 0x00, 0xC0],
  keymap: {},
  joystick: null,
  gamepad: null,
  rumble: rumble,
  setup: setup,
  helptext: helptext}

