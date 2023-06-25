

const helptext = `FIREBUG
Silas Warner, Muse Software, 1982

KEYBOARD
W ↑    up
X ↓    down
A ←    left
D →    right
S      stop

P or Return   pick up gas can
M or Space    drop gas can

JOYSTICK
Button 0: drop gas can
Button 1: pick up gas can
`

// Firebug - allows P for pickup, M for drop, for phones

export const firebug: GameLibraryItem = {
  address: 0x452A,
  data: [0xAD, 0x00, 0xC0],
  keymap: {'\x08': 'A', '\x15': 'D', '\x0B': 'W', '\x0A': 'X', 'P': '\x0D', 'M': '\x20'},
  gamepad: () => {},
  rumble: () => {},
  setup: () => {},
  helptext: helptext}

