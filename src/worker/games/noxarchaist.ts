import { addToBuffer, addToBufferDebounce } from "../devices/keyboard"

const gamepad = (button: number) => {
  switch (button) {
    case 0: addToBufferDebounce('A'); break  // attack
    case 1: addToBufferDebounce('C', 50); break       // cast
    case 2: addToBufferDebounce('O'); break  // open
    case 3: addToBufferDebounce('T'); break  // look
    case 4: addToBufferDebounce('\x1B'); break  // 4 LB, ESC
    case 5: addToBufferDebounce('\x0D'); break  // 5 RB, Return
    case 6: break  // 6 LT
    case 7: break  // 7 RT
    case 8: addToBuffer('N'); addToBufferDebounce('\x27'); break  // 8 Select?
    case 9: addToBuffer('Y'); addToBufferDebounce('1'); break  // 9 Start?
    case 10: break  // 10 Left thumb button
    case 11: break  // 11 Right thumb button
    case 12: break  // 12 D-pad U, Return
    case 13: addToBufferDebounce('\x20'); break  // 13 D-pad D, Spacebar
    case 14: break // 14 D-pad L
    case 15: addToBufferDebounce('\x09'); break // 15 D-pad R, Tab
    case -1: return
    default: break;
  }
}

const threshold = 0.5
const joystick = (axes: number[], isKeyboardJoystick: boolean) => {
  // If we're only using arrow keys as a joystick, just quietly return,
  // as Nox already uses arrows for movement and we don't want to double move.
  if (isKeyboardJoystick) return axes
  const key1 = (axes[0] < -threshold) ? '\x08' : (axes[0] > threshold) ? '\x15' : ''
  const key2 = (axes[1] < -threshold) ? '\x0B' : (axes[1] > threshold) ? '\x0A' : ''
  // Combine W/E and N/S to allow diagonal moves
  let key = key1 + key2
  if (!key) {
    key = (axes[2] < -threshold) ? 'L\x08' : (axes[2] > threshold) ? 'L\x15' : ''
    if (!key) {
      key = (axes[3] < -threshold) ? 'L\x0B' : (axes[3] > threshold) ? 'L\x0A' : ''
    }
  }
  if (key) {
    addToBufferDebounce(key, 200)
  }
  return [0, 0, 0, 0]
}

const helptext = 
`Nox Archaist, Mark Lemmert
6502 Workshop, 2021
_____________________________________________
Arrows (Left thumb)  movement
A (A button)         attack
C (B button)         cast spell
O (X button)         open or operate object
T (Y button)         talk
L (Right thumb)      look
SPACE (Dpad down)    pass turn
RETURN (RB button)   ready item
TAB  (Dpad right)    inventory
ESC  (LB button)     flee from battle

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
  joystick: joystick,
  rumble: null,
  setup: null,
  helptext: helptext}

