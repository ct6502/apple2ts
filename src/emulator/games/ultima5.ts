
import { passEnhancedMidi } from "../worker2main"

const helptext = `ULTIMA5
  The exciting sequal to Ultima 4.
  Now with enhanced MIDI support.
`

const setup = () => {
  passEnhancedMidi(0x1)
}

export const ultima5: GameLibraryItem = {
  address: 0x0202,
  data: [0x55, 0x4c, 0x54, 0x49, 0x4d, 0x41, 0x35],
  keymap: {},
  joystick: null,
  gamepad: null,
  rumble: null,
  setup: setup,
  helptext: helptext}

