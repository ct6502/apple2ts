import { bank0 } from "./motherboard"

let paddle0 = 0
let paddle1 = 0
let countStart = 0
let leftAppleDown = false
let rightAppleDown = false
let leftButtonDown = false
let rightButtonDown = false

const setButtonState = () => {
  bank0[0xC061] = (leftAppleDown || leftButtonDown) ? 255 : 0
  bank0[0xC062] = (rightAppleDown || rightButtonDown) ? 255 : 0
}

export const pressAppleKey = (isDown: boolean, left: boolean) => {
  if (left) {
    leftAppleDown = isDown
  } else {
    rightAppleDown = isDown
  }
  setButtonState()
}

export const resetJoystick = (cycleCount: number) => {
  bank0[0xC064] = 0x80
  bank0[0xC065] = 0x80
  bank0[0xC066] = 0
  bank0[0xC067] = 0
  countStart = cycleCount
}

export const checkJoystickValues = (cycleCount: number) => {
  const diff = (cycleCount - countStart)/11
  bank0[0xC064] = (diff < paddle0) ? 0x80 : 0
  bank0[0xC065] = (diff < paddle1) ? 0x80 : 0
}

export const handleGamePad = (gamePad: Gamepad | null) => {
    // window.addEventListener("gamepadconnected", function(e) {
    //   console.log("Gamepad connected at index %d: %s. %d buttons, %d axes.",
    //   e.gamepad.index, e.gamepad.id,
    //   e.gamepad.buttons.length, e.gamepad.axes.length);
    // })
  if (gamePad) {
    const clip = 0.85
    let xstick = (gamePad.axes[0] !== 0) ? gamePad.axes[0] : gamePad.axes[2]
    let ystick = (gamePad.axes[1] !== 0) ? gamePad.axes[1] : gamePad.axes[3]
    xstick = Math.min(Math.max(-clip, xstick), clip)
    ystick = Math.min(Math.max(-clip, ystick), clip)
    paddle0 = Math.trunc(255*(xstick + clip)/(2*clip))
    paddle1 = Math.trunc(255*(ystick + clip)/(2*clip))
    leftButtonDown = false
    rightButtonDown = false
    gamePad.buttons.forEach((button, i) => {
      if (i <= 11 && button.pressed) {
        if (i % 2 === 0) {
          leftButtonDown = true
        } else {
          rightButtonDown = true
        }
      }
    });
    setButtonState()
  }

}
