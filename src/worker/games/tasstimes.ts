
const helptext = 
`<b>Tass Times in Tonetown</b>
Activision 1986
Designed by Michael Berlyn and Muffy McClung Berlyn
Apple ][ version by B. Heineman, Interplay Productions
Artwork by Todd Camasta
Advent code by Brian Fargo and Steve Neilsen

In Tass Times in Tonetown, you explore a bizarre city filled with eccentric characters and strange locations. Your goal is to solve puzzles, interact with the townspeople, and ultimately uncover the secrets of Tonetown.

<img src="disks/tasstimes_cover.jpg"/>

<a href="https://archive.org/details/Tass_Times_in_Tonetown_Manual_HQ/" target="_blank">Full Manual</a>

<a href="https://archive.org/details/Tass_Times-Newspaper/" target="_blank">Game Newspaper</a>

<a href="https://archive.org/details/tass-times-in-tone-town-source-code" target="_blank">Source Code</a>
`

export const tasstimes: GameLibraryItem = {
  address: 0x614B,
  data: [0x2C, 0x00, 0xC0],
  keymap: {},
  joystick: null,
  gamepad: null,
  rumble: null,
  setup: null,
  helptext: helptext}
