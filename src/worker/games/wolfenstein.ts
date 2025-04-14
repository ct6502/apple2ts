import { setLeftButtonDown, setRightButtonDown } from "../devices/joystick"
import { addToBuffer, addToBufferDebounce } from "../devices/keyboard"
import { getTextPageAsString, memGet, memSet } from "../memory"
import { passRumble } from "../worker2main"

const helptext = 
`<b>Castle Wolfenstein</b>
Silas Warner, Muse Software 1981

World War II is raging across Europe, and Castle Wolfenstein has been occupied by the Nazis and converted into their HQ. You have just been captured behind enemy lines and await interrogation and torture by the dreaded SS in the dungeons of Castle Wolfenstein. A dying cellmate bequeaths you your only hope - a gun and ten bullets.

Your Mission: Find the war plans and escape from Castle Wolfenstein ALIVE!

<a href="https://archive.org/details/muse-castle-wolfenstein-a2-ph/" target="_blank">Detailed instructions</a>

<b>KEYBOARD</b>
<b>Q W E</b>
<b>A S D</b>    Movement (<b>S</b> = Stop)
<b>Z X C</b>

<b>I O P</b>
<b>K L ;</b>    Aim gun (<b>L</b> = Fire)
<b>, . /</b>

<b>Space</b>  Search guards, unlock doors & chests
<b>T</b>      Throw grenade
<b>U</b>      Use contents of chest
<b>RETURN</b> Inventory

<b>JOYSTICK</b>
Left button (0):  Hold down and move joystick to aim, or press button to holster
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

export const wolfenstein_splash: GameLibraryItem = {
  address: 0x0C85,
  data: [0xAD, 0x00, 0xC0],
  keymap: {},
  joystick: null,
  gamepad: null,
  rumble: null,
  setup: null,
  helptext: helptext}

export const wolfenstein: GameLibraryItem = {
  address: 0x1289,
  data: [0xAD, 0x00, 0xC0],
  keymap: {},
  joystick: null,
  gamepad: gamepad,
  rumble: rumble,
  setup: wolfsetup,
  helptext: helptext}
