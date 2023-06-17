import { addToBuffer, addToBufferDebounce } from "../keyboard"

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
const timeout = 300
let leftdown = false
let rightdown = false
let buttonreleased = false
const gamepad = (button: number) => {
  if (button === 14) {
    if (leftdown && buttonreleased) {
      addToBufferDebounce('R', timeout);
    } else if (!leftdown) {
      leftdown = true
      addToBuffer('A'); addToBufferDebounce('W', timeout);
    }
    buttonreleased = false
    return
  }
  if (button === 15) {
    if (rightdown && buttonreleased) {
      addToBufferDebounce('R', timeout);
    } else {
      rightdown = true
      addToBuffer('D'); addToBufferDebounce('W', timeout);
    }
    buttonreleased = false
    return
  }
  switch (button) {
    case 0: addToBufferDebounce('J', timeout); break  // jump
    case 1: addToBufferDebounce('G', 50); break       // crawl
    case 2: addToBuffer('M'); addToBufferDebounce('O', timeout); break  // open/dig
    case 3: addToBufferDebounce('L', timeout); break  // look/lunge
    case 4: addToBufferDebounce('F', timeout); break
    case 5: addToBuffer('P'); addToBufferDebounce('T', timeout); break  // 5 RB
    case 6: break  // 6 LT
    case 7: addToBufferDebounce(' ', timeout); break  // 7 RT
    case 8: break  // 8 Select?
    case 9: addToBufferDebounce('N', timeout); break  // 9 Start?
    case 10: addToBufferDebounce('G', timeout); break  // 10 Left thumb button
    case 11: break  // 11 Right thumb button
    case 12: addToBufferDebounce('C', timeout); break  // 12 D-pad U, climb
    case 13: addToBufferDebounce('S', timeout); break  // 13 D-pad D, stop
    case 14:  // 14 D-pad L
      break
    case 15: break // 15 D-pad R
    case -1: buttonreleased = true; return
    default: break;
  }
  leftdown = false
  rightdown = false
  buttonreleased = false
}

// Aztec gamepad
const helptext = 
`AZTEC
Paul Stephenson, Datamost 1982

W: walk
R: run
J: jump
S: stop
C: climb
A: turn left
D: turn right
G: crawl (G to move)
P: place and light explosive
T: take item
O: opens box or dig in trash
L: look in box
Z: inventory

F: goes to fight mode:
   S: spin around
   A: move one to left
   D: move one to right
   L: lunge with machete
   M: strike down with machete
   G: draw gun
   Space: shoot gun`

export const aztec: GameLibraryItem = {
  address: 0x196D,
  data: [0xAD, 0x00, 0xC0],
  keymap: {},
  gamepad: gamepad,
  rumble: () => {},
  helptext: helptext}

