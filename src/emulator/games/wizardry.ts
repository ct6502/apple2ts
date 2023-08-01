const helptext = 
`Wizardry
Andrew Greenberg and Robert Woodhead
Sir-Tech Software, 1981

____ Adventuring ____
W  forward
A  left
D  right
K  kick through a door
S  update status area
C  camp
T  combat message delay time (ms)
Q  quick plotting - see the LOMILWA spell
I  inspect for dead bodies

____ Combat ____
F  fight (# for group)
P  parry
S  cast spell
U  use an item
R  run!
D  dispell undead
`

export const wizardry: GameLibraryItem = {
  address: 0xB797,
  data: [0xAD, 0x00, 0xC0],
  keymap: {},
  gamepad: null,
  joystick: null,
  rumble: null,
  setup: null,
  helptext: helptext}

