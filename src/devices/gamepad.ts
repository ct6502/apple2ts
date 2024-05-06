import { ARROW } from "../emulator/utility/utility"
import { passKeypress, passSetGamepads } from "../main2worker"

const getGamepads = () => {
  const gamepads = navigator.getGamepads().filter((gp) => (gp !== null))
  return gamepads
}

export const checkGamepad = () => {
  const gamepads = getGamepads()
  if (!gamepads || gamepads.length < 1) return
  const gamePad: EmuGamepad[] = []
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

let withinRumble = false

export const doRumble = (params: GamePadActuatorEffect) => {
  const gamepads = getGamepads()
  if (!gamepads || gamepads.length < 1) return
  if (withinRumble) return
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const gp = gamepads[0] as any
  if (gp && 'vibrationActuator' in gp && gp.vibrationActuator) {
    gp.vibrationActuator.playEffect("dual-rumble", params)
    withinRumble = true
    setTimeout(() => {
      withinRumble = false
    , params.duration})
  }
}

// Keep these outside so we can have both X and Y axes set at the same time.
const arrowGamePad = [0, 0]

export const handleArrowKey = (key: ARROW, release: boolean) => {
  if (!release) {
    let code = 0
    switch (key) {
      case ARROW.LEFT: code = 8; arrowGamePad[0] = -1; break
      case ARROW.RIGHT: code = 21; arrowGamePad[0] = 1; break
      case ARROW.UP: code = 11; arrowGamePad[1] = -1; break
      case ARROW.DOWN: code = 10; arrowGamePad[1] = 1; break
    }
    passKeypress(String.fromCharCode(code))
  } else {
    switch (key) {
      case ARROW.LEFT: // fall thru
      case ARROW.RIGHT: arrowGamePad[0] = 0; break
      case ARROW.UP: // fall thru
      case ARROW.DOWN: arrowGamePad[1] = 0; break
    }
  }

  const gamePads: EmuGamepad[] = [{
    axes: [arrowGamePad[0], arrowGamePad[1], 0, 0],
    buttons: []
  }]
  passSetGamepads(gamePads)
}
