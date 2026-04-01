import { memSetC000 } from "../memory"
import { SWITCHES } from "../softswitches"

// The Sirius Joyport is designed to be used with two "Atari-style" joysticks.
// In practice, this would be two gamepads, each with a D-pad and a single button.
// Programs will set AN0 to select which joystick is active, and AN1 to select
// which joystick axes are being read.

//   AN0      AN1     Button0($C061)     Button1($C062)     Button2($C063)
//   Off      Off       Fire-1             Left-1             Right-1
//   Off      On        Fire-1             Up-1               Down-1
//   On       Off       Fire-2             Left-2             Right-2
//   On       On        Fire-2             Up-2               Down-2

let siriusJoyport = false

export const getSiriusJoyport = () => {
  return siriusJoyport
}

export const setSiriusJoyport = (mode: boolean) => {
  siriusJoyport = mode
}

let joy1button = false
let joy2button = false
let joy1down = false
let joy2down = false
let joy1up = false
let joy2up = false
let joy1left = false
let joy2left = false
let joy1right = false
let joy2right = false

export const checkSiriusJoyportValues = (addr: number) => {
  const isAN0 = SWITCHES.AN0.isSet
  const isAN1 = SWITCHES.AN1.isSet
  let isSet = false
  switch (addr) {
    case SWITCHES.PB0.isSetAddr:
      SWITCHES.PB0.isSet = (!isAN0 && joy1button) || (isAN0 && joy2button)
      isSet = SWITCHES.PB0.isSet
      break
    case SWITCHES.PB1.isSetAddr:
      SWITCHES.PB1.isSet = (!isAN0 && isAN1 && joy1up) ||
        (isAN0 && isAN1 && joy2up) ||
        (!isAN0 && !isAN1 && joy1left) ||
        (isAN0 && !isAN1 && joy2left)
      isSet = SWITCHES.PB1.isSet
      break
    case SWITCHES.PB2.isSetAddr:
      SWITCHES.PB2.isSet = (!isAN0 && isAN1 && joy1down) ||
      (isAN0 && isAN1 && joy2down) ||
        (!isAN0 && !isAN1 && joy1right) ||
        (isAN0 && !isAN1 && joy2right)
      isSet = SWITCHES.PB2.isSet
      break
  }
  // Handle push button switches for Sirius Joyport - they are active low
  memSetC000(addr, isSet ? 0 : 0x80)
}

export const siriusJoyportButtons: GamePadMapping = (button: number,
  dualJoysticks: boolean, isJoystick2: boolean) => {
  let isJoystick1 = !isJoystick2
  // If we have only a single gamepad, treat it as both joystick 1 and 2.
  if (!dualJoysticks) {
     isJoystick1 = true
     isJoystick2 = true
   }

  switch (button) {
    case -1:
      // Initialize buttons state for each joystick. We do this
      // independently of each other, in case we only have a single gamepad.
      if (isJoystick1) {
        joy1button = false
        joy1down = false
        joy1up = false
        joy1left = false
        joy1right = false
      }
      if (isJoystick2) {
        joy2button = false
        joy2down = false
        joy2up = false
        joy2left = false
        joy2right = false
      }
      break
    case 0:
      if (isJoystick1) joy1button = true
      if (isJoystick2) joy2button = true
      break
    case 1:
      break
    case 12:   // D-pad Up
      if (isJoystick1) joy1up = true
      if (isJoystick2) joy2up = true
      break
    case 13:   // D-pad Down
      if (isJoystick1) joy1down = true
      if (isJoystick2) joy2down = true
      break
    case 14:   // D-pad Left
      if (isJoystick1) joy1left = true
      if (isJoystick2) joy2left = true
      break
    case 15:   // D-pad Right
      if (isJoystick1) joy1right = true
      if (isJoystick2) joy2right = true
      break
    default: break
  }
}
