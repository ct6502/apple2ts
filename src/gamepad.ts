import { passSetGamepads } from "./main2worker"

const getGamepads = () => {
  const gamepads = navigator.getGamepads().filter((gp) => (gp !== null))
  return gamepads
}

export const checkGamepad = () => {
  const gamepads = getGamepads()
  if (!gamepads || gamepads.length < 1) return
  let gamePad: EmuGamepad[] = []
  for (let i = 0; i < gamepads.length; i++) {
    const axes = gamepads[i]?.axes
    const buttons = gamepads[i]?.buttons
    if (axes && buttons) {
      gamePad.push({axes: axes.slice(), buttons: buttons.map(b => b.pressed)})
    }
  }
  if (gamePad.length > 0) {
    passSetGamepads(gamePad)
  }
}

export const doRumble = (params: GamePadActuatorEffect) => {
  const gamepads = getGamepads()
  if (!gamepads || gamepads.length < 1) return
  const gp = gamepads[0] as any
  if (gp && 'vibrationActuator' in gp) {
    gp.vibrationActuator.playEffect("dual-rumble", params);
  }
}
