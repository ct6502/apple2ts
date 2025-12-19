import { memSet } from "../memory"


const setup = () => {
  // Disable the iris loading effect
  memSet(0xB6C9, 0xEA)
  memSet(0xB6CA, 0xEA)
}

const helptext = 
`Lode Runner by Doug Smith
(c) 1983 Brøderbund Software
_____________________________________________
Joystick (Ctrl+J):   move
Button 0:   dig left
Button 1:   dig right

Keyboard (Ctrl+K):
   W
A     D
   S
Left arrow    dig left
Right arrow   dig right

Keyboard original controls:
   I
J     L
   K
U       dig left
O       dig right
ESC     pause game
_____________________________________________
Other Controls:
Ctrl+A        abort man
Ctrl+J        joystick mode
Ctrl+K        keyboard mode
Ctrl+R        reset game
Ctrl+S        toggle sound
Ctrl+X        flip joystick x-axis
Ctrl+Y        flip joystick y-axis
Ctrl+Shift+6  next level (no high score)
Ctrl+Shift+2  add life (no high score)
_____________________________________________
Editor:
From demo mode, press Ctrl+E
E        edit
P        play
I        initialize
C        clear level
M        move (copy level)
S        clear high scores
I/J/K/M  move cursor
0-9      make shapes
Ctrl+S   save level
Ctrl+Q   quit editor
`

export const lode_runner: GameLibraryItem = {
  address: 0x61F6,
  data: [0x8D, 0x10, 0xC0],
  keymap: {"A": "J", "S": "K", "D": "L", "W": "I", "\x08": "U", "\x15": "O"},
  gamepad: null,
  joystick: null,
  rumble: null,
  setup: setup,
  helptext: helptext}

