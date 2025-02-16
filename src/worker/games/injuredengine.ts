import { doSetMachineName } from "../motherboard"

const helptext = 
`Injured Engine
(c) 1984 Imagic, Inc.
Concept: Dave Johnson
Program: Tom McWilliams
Graphics: Karen Elliott
Tech Support: Dave Boisvert

Keyboard Controls:
T         Select, look at text
I         Inspect part(s)
R         Repair/replace part(s)
P         Price list
E, <ESC>  Main screen
A, S      Scroll text back
Z, X      Scroll text forward
Y         Yes
N         No
O         Open throttle
C         Close throttle`

const setup = () => {
  // Injured Engine required an unenhanced Apple //e
  doSetMachineName("APPLE2EU", false)
}

export const injuredengine: GameLibraryItem = {
  address: 0x040D,
  data: [0xC9, 0xCE, 0xCA, 0xD5, 0xD2],
  keymap: {},
  joystick: null,
  gamepad: null,
  rumble: null,
  setup: setup,
  helptext: helptext}

