import { SWITCHES } from "../softswitches"
import { setLeftButtonDown, setRightButtonDown, setPushButton2 } from "./joystick"

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

export const siriusJoyportButtons: GamePadMapping = (button: number,
  dualJoysticks: boolean, isJoystick2: boolean) => {
  const isAN0 = SWITCHES.AN0.isSet
  const isAN1 = SWITCHES.AN1.isSet
  const isJoystick1 = !isJoystick2

  switch (button) {
    case 0:
      if ((isJoystick1 && !isAN0) || (isJoystick2 && isAN0)) {
        setLeftButtonDown()
      }
      break
    case 1:
      break
    case 12:   // D-pad Up
      if (isAN1) {
        if ((isJoystick1 && !isAN0) || (isJoystick2 && isAN0)) {
          setRightButtonDown()
        }
      }
      break
    case 13:   // D-pad Down
      if (isAN1) {
        if ((isJoystick1 && !isAN0) || (isJoystick2 && isAN0)) {
          setPushButton2()
        }
      }
      break
    case 14:   // D-pad Left
      if (!isAN1) {
        if ((isJoystick1 && !isAN0) || (isJoystick2 && isAN0)) {
          setRightButtonDown()
        }
      }
      break
    case 15:   // D-pad Right
      if (!isAN1) {
        if ((isJoystick1 && !isAN0) || (isJoystick2 && isAN0)) {
          setPushButton2()
        }
      }
      break
    default: break
  }
}
