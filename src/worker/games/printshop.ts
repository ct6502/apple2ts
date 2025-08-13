const helptext = 
`The Print Shop

Total Reprint is a port of The Print Shop Color (1986) to ProDOS. Some notable features:

* All Broderbund graphic libraries
* Additional openly licensed 3rd party graphics and fonts
* Unified UI for selecting 3rd party graphics and borders
* All libraries available from hard drive (no swapping floppies!)

Total Reprint is © 2025 by 4am and licensed under the MIT open source license.
All original code is available on <a href="https://github.com/a2-4am/4print" target="_blank" rel="noopener noreferrer">GitHub</a>.

Program and graphic libraries are © their respective authors.`

export const printshop: GameLibraryItem = {
  address: 0x759E,
  data: [0xAD, 0x00, 0xC0],
  keymap: {},
  joystick: null,
  gamepad: null,
  rumble: null,
  setup: null,
  helptext: helptext}

