
import { passEnhancedMidi } from "../worker2main"

const setup = () => {
  passEnhancedMidi(0x1)
}

const helptext = 
`Ultima V: Warriors of Destiny
by Lord British
(c) 1987 Origin Systems
_____________________________________________
Arrows    movement
A         attack
B         board transport or mount
C         cast spell
E         enter towne, castle, or structure
F         fire cannon
G         get gold, food, or items
H         hole up and camp
I         ignite torch
J         jimmy a lock
K         climb up or down
L         look
M         mix reagents
N         new character order
O         open door or chest
P         push object
Q         quit and save game
R         ready equipment
S         search
T         talk
U         use item
V         view area
X         exit transport or mount
Y         yell, go fast on ship
Z         display stats/attributes
1-6       set active character
0         clear active character
SPACE     pass turn
ESC       abort command, exit combat
Ctrl+S    toggle sound
Ctrl+T    toggle speed
Ctrl+V    set music volume 0-9
---
For Dual Mockingboard Support:
1) Open Settings (gear icon) and assign Mockingboard to both Slot 4 & Slot 5.
2) In Ultima V, go to Activate Music -> Change Music Configuration, add Mockingboard A to Slot 4 and Slot 5, and press Enter.
3) A total of 12 voices will be initialized. Press the initial letter of any song title to play music (e.g., Ultima Theme & Stones use 7–8 polyphonic voices).

For MIDI Support:
1) Open Settings (gear icon) and assign Passport MIDI Card to Slot 2.
2) In Audio Configuration (music icon), select Apple2TS Built-in Synthesizer. If using External MIDI, launch a WebMIDI-supported player/synthesizer (such as https://signalmidi.app/ or Munt MT-32 emulator) in a separate tab or app and grant WebMIDI access.
3) In Ultima V, navigate to Activate Music -> Change Music Configuration, add Passport to Slot 2, and press Enter.
4) In the MIDI Information screen, select Channel 1 (default) and 16 voices, then enter numbers 1–15 for "MIDI Number" for each song (where Ultima Theme is '1' and Rule Britannia is '15'). Press Enter on each song title to test playback.

`

export const ultima5: GameLibraryItem = {
  address: 0x0202,
  data: [0x55, 0x4C, 0x54, 0x49, 0x4D, 0x41, 0x35], // ULTIMA5
  keymap: {},
  gamepad: null,
  joystick: null,
  rumble: null,
  setup: setup,
  helptext: helptext}

