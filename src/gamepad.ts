import { handleSetGamepad } from "./main2worker"

export const checkGamepad = () => {
  const gamepads = navigator.getGamepads()
  if (!gamepads || gamepads.length < 1) return
  let gamePad: EmuGamepad = {
    connected: false,
    axes: [],
    buttons: []
  }
  const axes = gamepads[0]?.axes
  const buttons = gamepads[0]?.buttons
  if (axes && buttons) {
    gamePad.connected = true
    for (let i = 0; i < axes.length; i++) {
      gamePad.axes[i] = axes[i]
    }
    for (let i = 0; i < buttons.length; i++) {
      gamePad.buttons[i] = buttons[i].pressed
    }
  }
  if (gamePad.connected) {
    handleSetGamepad(gamePad)
  }
}

export const doRumble = (duration: number, delay: number) => {
  const gamepads = navigator.getGamepads()
  if (!gamepads || gamepads.length < 1) return
  const gp = gamepads[0] as any
  if ('vibrationActuator' in gp) {
    gp.vibrationActuator.playEffect("dual-rumble", {
      startDelay: delay,
      duration: duration,
      weakMagnitude: 1.0,
      strongMagnitude: 1.0,
    });
  }
}
