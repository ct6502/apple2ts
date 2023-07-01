import { memGet } from "../memory"
import { passRumble } from "../worker2main"

let memB6 = 14
let memB7 = 14
const karatekaRumble = () => {
  let newValue = memGet(0xB6)
  if (memB6 < 40 && newValue < memB6) {
    passRumble({startDelay: 220, duration: 300, weakMagnitude: 1, strongMagnitude: 0})
  }
  memB6 = newValue
  newValue = memGet(0xB7)
  if (memB7 < 40 && newValue < memB7) {
    passRumble({startDelay: 220, duration: 300, weakMagnitude: 0, strongMagnitude: 1})
  }
  memB7 = newValue
}

const helptext = `KARATEKA
Jordan Mechner, Brøderbund 1984
Press K for Keyboard control
Press J for Joystick control

KEYBOARD
Fighting stance:
Q A Z     punch high, middle, low
W S X     kick high, middle, low
M . →     advance
N , ←     retreat
Space     stand up

Standing up:
B         bow
M . →     run forward
N , ←     stop
Space     fighting stance

JOYSTICK
Push the joystick up to stand up, and release it to get into a fighting stance.

Fighting stance:
Button 1: punch
Button 0: kick
Move the joystick up and down to control the height of your punches  and kicks. Move it right to advance and left to retreat.

To run forward, start from a standing position. Then move the joystick to the upper right. Press button 1 to bow.
`

// Karateka - allows N/M and ,/. to work as left/right arrow keys, for phones
export const karateka: GameLibraryItem = {
  address: 0x6E6C,
  data: [0xAD, 0x00, 0xC0],
  keymap: {'N': '\x08', 'M': '\x15', ',': '\x08', '.': '\x15'},
  joystick: null,
  gamepad: null,
  rumble: karatekaRumble,
  setup: null,
  helptext: helptext}

