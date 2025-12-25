const helptext = 
`Championship Lode Runner by Doug Smith
(c) 1984 Brøderbund Software
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
`

export const champ_lode_runner: GameLibraryItem = {
  address: 0x6270,
  data: [0x8D, 0x10, 0xC0],
  keymap: {"A": "J", "S": "K", "D": "L", "W": "I", "\x08": "U", "\x15": "O"},
  gamepad: null,
  joystick: null,
  rumble: null,
  setup: null,
  helptext: helptext}

