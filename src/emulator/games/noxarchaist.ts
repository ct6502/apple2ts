import { addToBuffer, addToBufferDebounce } from "../keyboard"

const timeout = 150
const gamepad = (button: number) => {
  switch (button) {
    case 0: addToBufferDebounce('A', timeout); break  // attack
    case 1: addToBufferDebounce('C', 50); break       // cast
    case 2: addToBufferDebounce('O', timeout); break  // open
    case 3: addToBufferDebounce('L', timeout); break  // look
    case 4: addToBufferDebounce('F', timeout); break
    case 5: addToBuffer('P'); addToBufferDebounce('T', timeout); break  // 5 RB
    case 6: break  // 6 LT
    case 7: addToBufferDebounce(' ', timeout); break  // 7 RT
    case 8: addToBuffer('N'); addToBufferDebounce('\x27', timeout); break  // 8 Select?
    case 9: addToBuffer('Y'); addToBufferDebounce('1', timeout); break  // 9 Start?
    case 10: addToBufferDebounce('G', timeout); break  // 10 Left thumb button
    case 11: break  // 11 Right thumb button
    case 12: addToBufferDebounce('\x0B', timeout); break  // 12 D-pad U, climb
    case 13: addToBufferDebounce('\x0A', timeout); break  // 13 D-pad D, stop
    case 14: addToBufferDebounce('\x08', timeout); break // 14 D-pad L
    case 15: addToBufferDebounce('\x15', timeout); break // 15 D-pad R
    case -1: return
    default: break;
  }
}

// Aztec gamepad
const helptext = 
`Nox Archaist, Mark Lemmert, 6502 Workshop, 2021
_______________________________________________
ARROWS (D-pad)  movement
A (A button)    attack
C (B button)    cast spell
O (X button)    open or operate object
L (Y button)    look
SPACE (Select/back button)  pass turn
RETURN (Start button)       ready item
TAB/TAB display character roster/inventory

_____ ADVENTURING _____
B  board transport or mount
D  dig (ruins only)
G  get current location
H  hide and camp
I  ignite torch
J  jump with your horse
N  new character order
Q  quick save game
S  search
T  talk to NPC
W  wait for a number of hours
X  exit transport or mount
Y  yell, go fast on horse/mount
/  quest log
V  volume/sound toggle
=  toggle character icon

_____ COMBAT _____
F  fire cannon (ships only)
SHIFT+8   toggle combat math
+/−  fast/slow scroll speed
8    pause text scroll
ESC  flee from battle; exit combat

_____ INVENTORY & SHOPPING _____
TAB     switch to next menu (or press 1-7)
ARROWS  scroll through items or pages
SPACE   next character
RETURN  ready/unready item
I/U/D   Info/Use/Discard item
B/S  switch to buy/sell (shop)
RETURN buy or sell item (shop)
ESC    exit inventory/shop

_____ NPC DIALOG _____
Keywords NAME, JOB, JOIN
TAB  toggle voice mode
ESC  exit conversation`

export const noxarchaist: GameLibraryItem = {
  address: 0x300,
  data: [0x8D, 0x4A, 0x03, 0x84],
  keymap: {},
  gamepad: gamepad,
  rumble: () => {},
  setup: () => {},
  helptext: helptext}

