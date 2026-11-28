import { memSet } from "../memory"

// This disables the "M" copy protection scheme used in:
// Red Alert, Genetic Drift, and Space Quarks.
// These games xor the ROM from $F800-$FFFF and confirm that the machine
// is a stock Apple II or II+. This just replaces the failure case with a RTS.
const disableCopyProtect = () => {
  memSet(0x0606, 0x60)
}

export const redalert: GameLibraryItem = {
  address: 0x0606,
  data: [0xA9, 0xCD, 0x2C],
  keymap: {},
  joystick: null,
  gamepad: null,
  rumble: null,
  setup: disableCopyProtect,
  helptext: ""}
