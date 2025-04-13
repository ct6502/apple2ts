import { setLeftButtonDown, setRightButtonDown } from "../devices/joystick"
import { addToBuffer, addToBufferDebounce } from "../devices/keyboard"
import { getTextPageAsString } from "../memory"

const helptext = 
`<b>Beyond Castle Wolfenstein</b>
Silas Warner, Muse Software 1981

<a href="https://archive.org/details/beyondcastlewolfensteinmusesoftware/" target="_blank">Detailed instructions</a>

Find the bomb, locate the private conference room, and leave the bomb, timed to detonate! Then return to the courtyard from which you entered the bunker. Good luck!

<b>KEYBOARD</b>
<b>Q W E</b>
<b>A S D</b>    Movement (<b>S</b> = Stop)
<b>Z X C</b>

<b>I O P</b>
<b>K L ;</b>    Aim gun (<b>L</b> = Fire)
<b>, . /</b>

<b>:</b>    Switch weapons (gun or dagger)
<b>B</b>    Bomb drop or pick up
<b>F</b>    Use first aid kit
<b>H</b>    Holster gun
<b>M</b>    Give money to bribe guard
<b>R</b>    Reset bomb
<b>U</b>    Use contents of open closet
<b>1-5</b>  Use pass
<b>Ctrl+T</b>  Use tool kit
<b>Ctrl+K</b>  Use key
<b>SPACE</b>   Search guards, unlock closets
<b>ESC</b>     Save game and exit
<b>RETURN</b>  Inventory

Open Closet: Aim gun and press SPACE
Unlock Closet: Aim gun then use number keys for 3-digit combo
Search Dead Guards: Stand over body and press SPACE
Drag Dead Guards: Stand next to body, aim gun at body and press SPACE

<b>JOYSTICK</b>
Left button (0):  Hold down and move joystick to aim, or press button to holster
Right button (1): Shoot
X button:  Search guards or open closet
Y button:  Use contents of open closet
RB button: Switch weapons
LB button: Inventory`

const gamepad = (button: number) => {
  switch (button) {
    case 0: setLeftButtonDown(); break   // aim
    case 1: setRightButtonDown(); break  // shoot
    case 2: addToBufferDebounce(" "); break  // search/unlock
    case 3: addToBufferDebounce("U"); break  // Use chest contents
    case 4: addToBufferDebounce("\r"); break
    case 5: addToBufferDebounce(":"); break
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

// const wolfsetup = () => {
//   // When you run into the wall, only freak out 4 times
//   memSet(0x1408, 0)
//   memSet(0x140A, 4)
//   // Do not play sounds when crashing into the wall (both locations need NOPs)
//   let i = 0x145A
//   memSet(i, 0xEA)
//   memSet(i + 1, 0xEA)
//   memSet(i + 2, 0xEA)
//   i = 0x1468
//   memSet(i, 0xEA)
//   memSet(i + 1, 0xEA)
//   memSet(i + 2, 0xEA)
// }

// const rumble = () => {
//   if (memGet(0xC01A, false) < 0x80 && memGet(0xC01D, false) < 0x80) {
//     passRumble({startDelay: 0, duration: 200, weakMagnitude: 1, strongMagnitude: 0})
//   }
// }

export const beyondwolf: GameLibraryItem = {
  address: 0x0B6E,
  data: [0xA9, 0x00, 0x85],
  keymap: {},
  joystick: null,
  gamepad: gamepad,
  rumble: null,
  setup: null,
  helptext: helptext}
