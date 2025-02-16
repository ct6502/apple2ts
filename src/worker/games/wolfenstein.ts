import { setLeftButtonDown, setRightButtonDown } from "../devices/joystick"
import { addToBuffer, addToBufferDebounce } from "../devices/keyboard"
import { getTextPageAsString, memGet, memSet } from "../memory"
import { passRumble } from "../worker2main"

const helptext = 
`Castle Wolfenstein
Silas Warner, Muse Software 1981

KEYBOARD:
QWE
ASD    Movement (S = Stop)
ZXC

IOP
KL;    Aim gun (L = Fire)
,./

Space: Search guards, unlock doors & chests
T:  Throw grenade
U:  Use contents of chest
Return:  Inventory

JOYSTICK:
Joystick:  Move or aim
Left button (0):  Aim
Right button (1): Shoot
X button:  Search/unlock
Y button:  Use chest contents
RB button: Throw grenade
LB button: Inventory`

const gamepad = (button: number) => {
  switch (button) {
    case 0: setLeftButtonDown(); break   // aim
    case 1: setRightButtonDown(); break  // shoot
    case 2: addToBufferDebounce(" "); break  // search/unlock
    case 3: addToBufferDebounce("U"); break  // Use chest contents
    case 4: addToBufferDebounce("\r"); break
    case 5: addToBufferDebounce("T"); break
    case 9: {
      const str = getTextPageAsString()
      if (str.includes("'N'")) {
        addToBuffer("N")
      } else if (str.includes("'S'")) {
        addToBuffer("S")
      } else if (str.includes("NUMERIC KEY")) {
        addToBuffer("1")
      } else {
        addToBuffer("N")
      }
      break  // 9 Start?
    }
    case 10: setLeftButtonDown(); break  // 10 Left thumb button
    case -1: break
    default: break
  }
}

const wolfsetup = () => {
  // When you run into the wall, only freak out 4 times
  memSet(0x1408, 0)
  memSet(0x140A, 4)
  // Do not play sounds when crashing into the wall (both locations need NOPs)
  let i = 0x145A
  memSet(i, 0xEA)
  memSet(i + 1, 0xEA)
  memSet(i + 2, 0xEA)
  i = 0x1468
  memSet(i, 0xEA)
  memSet(i + 1, 0xEA)
  memSet(i + 2, 0xEA)
}

const rumble = () => {
  if (memGet(0xC01A, false) < 0x80 && memGet(0xC01D, false) < 0x80) {
    passRumble({startDelay: 0, duration: 200, weakMagnitude: 1, strongMagnitude: 0})
  }
}

export const wolfenstein: GameLibraryItem = {
  address: 0x1289,
  data: [0xAD, 0x00, 0xC0],
  keymap: {},
  joystick: null,
  gamepad: gamepad,
  rumble: rumble,
  setup: wolfsetup,
  helptext: helptext}

