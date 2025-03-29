import { addToBuffer, addToBufferDebounce } from "../devices/keyboard"
import { getTextPageAsString } from "../memory"

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
//
// F: draw machete if you have one, gun otherwise, does nothing if unarmed
// S: turn around while using weapon
// L: lunge while using machete
// M: stab at ground while using machete
// G: switch from machete to gun
// <spacebar>: fire gun
const gamepad = (button: number) => {
  switch (button) {
    case 0: addToBufferDebounce("JL"); break  // jump
    case 1: addToBufferDebounce("G", 200); break       // crawl
    case 2: addToBuffer("M"); addToBufferDebounce("O"); break  // open/dig
    case 3: addToBufferDebounce("L"); break  // look/lunge
    case 4: addToBufferDebounce("F"); break  // LB
    case 5: addToBuffer("P"); addToBufferDebounce("T"); break  // 5 RB
    case 6: break  // 6 LT
    case 7: break  // 7 RT
    case 8: addToBufferDebounce("Z"); break  // 8 Select?
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
    case 10: break  // 10 Left thumb button
    case 11: break  // 11 Right thumb button
    case 12: addToBufferDebounce("L"); break  // 12 D-pad U, climb
    case 13: addToBufferDebounce("M"); break  // 13 D-pad D, stop/spin
    case 14: addToBufferDebounce("A"); break // 14 D-pad L
    case 15: addToBufferDebounce("D"); break // 15 D-pad R
    case -1: return
    default: break
  }
  // leftdown = 0
  // rightdown = 0
}

let leftdown = 0
let rightdown = 0
let buttonreleased = false
const threshold = 0.5
const joystick = (axes: number[]) => {
  if (axes[0] < -threshold) {
    rightdown = 0
    if (leftdown === 0 || leftdown > 2) {
      leftdown = 0
      addToBuffer("A")
    } else if (leftdown === 1 && buttonreleased) {
      addToBufferDebounce("W")
    } else if (leftdown === 2 && buttonreleased) {
      addToBufferDebounce("R")
    }
    leftdown++
    buttonreleased = false
    return axes
  }
  if (axes[0] > threshold) {
    leftdown = 0
    if (rightdown === 0 || rightdown > 2) {
      rightdown = 0
      addToBuffer("D")
    } else if (rightdown === 1 && buttonreleased) {
      addToBufferDebounce("W")
    } else if (rightdown === 2 && buttonreleased) {
      addToBufferDebounce("R")
    }
    rightdown++
    buttonreleased = false
    return axes
  }
  if (axes[1] < -threshold) {
    addToBufferDebounce("C")
    return axes
  } else if (axes[1] > threshold) {
    addToBufferDebounce("S")
    return axes
  }
  buttonreleased = true
  return axes
}

// Aztec gamepad
const helptext = 
`AZTEC
Paul Stephenson, Datamost 1982

W: walk
R: run
J (A button): jump
S (Thumb down): stop
C (Thumb up): climb
A (Thumb left): turn left
D (Thumb right): turn right
G (B button): crawl (G to move)
P (RB button): place and light explosive
T (RB button): take item
O (X button): opens box or dig in trash
L (Y button): look in box
Z: inventory

F (LB button): goes to fight mode:
   S (Thumb down): spin around
   A (Dpad left): move one to left
   D (Dpad right): move one to right
   L: lunge with machete
   M (Dpad down): strike down with machete
   G (B button): draw gun
   L (A button): shoot gun

Thumbwheel
              Climb
  Walk/run left   Walk/run right
            Stop/spin

D-pad
        Lunge/shoot
  Move left    Move right
        Strike down

A:  jump/lunge/shoot
B:  crawl/switch to gun
X:  open box/dig in trash
Y:  look in box
RB: place explosive (crawling) or take item (box/trash)
LB: fight mode
Select: inventory
Start:  start the game
`

// This 0x6103 is a somewhat random address that happens to contain the same
// three bytes for both the standalone Aztec disk and the one in Total Replay.
export const aztec: GameLibraryItem = {
  address: 0x6103,
  data: [0xAD, 0xC6, 0x09],
  keymap: {},
  joystick: joystick,
  gamepad: gamepad,
  rumble: null,
  setup: null,
  helptext: helptext}

