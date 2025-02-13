import { ARROW } from "../../common/utility"
import { handleGetArrowKeysAsJoystick, passKeypress, passSetGamepads } from "../main2worker"

// Keep these outside so we can have both X and Y axes set at the same time.
const arrowGamePad = [0, 0]

const convertArrowGamepadToValue = (index: number) => {
  const indexToValue = [0, 0.25, 0.5, 0.75, 1, 0]
  if (index < 0) {
    return -indexToValue[-index]
  } else {
    return indexToValue[index]
  }
}

const checkArrowKeyGamepadValues = () => {
  const gamePad: EmuGamepad[] = [{
    axes: [convertArrowGamepadToValue(arrowGamePad[0]),
      convertArrowGamepadToValue(arrowGamePad[1]), 0, 0],
    buttons: []
  }]
  passSetGamepads(gamePad)
  if (arrowGamePad[0] < 0 && arrowGamePad[0] > -4) {
    arrowGamePad[0]--
  } else if (arrowGamePad[0] > 0 && arrowGamePad[0] < 4) {
    arrowGamePad[0]++
  }
  if (arrowGamePad[1] < 0 && arrowGamePad[1] > -4) {
    arrowGamePad[1]--
  } else if (arrowGamePad[1] > 0 && arrowGamePad[1] < 4) {
    arrowGamePad[1]++
  }
  if (Math.abs(arrowGamePad[0]) === 5) {
    arrowGamePad[0] = 0
  }
  if (Math.abs(arrowGamePad[1]) === 5) {
    arrowGamePad[1] = 0
  }
}

const getGamepads = () => {
  const gamepads = navigator.getGamepads().filter((gp) => (gp !== null))
  return gamepads
}

export const checkGamepad = () => {
  const gamepads = getGamepads()
  // If we don't have a gamepad, see if we're using our arrow keys as a joystick
  if (!gamepads || gamepads.length < 1) {
    if (handleGetArrowKeysAsJoystick() && arrowGamePad[0] !== 0 || arrowGamePad[1] !== 0) {
      checkArrowKeyGamepadValues()
    }  
    return
  }
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
    }
    , params.duration)
  }
}

export const handleArrowKey = (key: ARROW, release: boolean) => {
  if (!release) {
    let code = 0
    if (handleGetArrowKeysAsJoystick()) {
      switch (key) {
        case ARROW.LEFT:
          code = 8
          if (arrowGamePad[0] === 0) {
            arrowGamePad[0] = -1
          } else if (arrowGamePad[0] < -4) {
            arrowGamePad[0] = -4
          }
          break
        case ARROW.RIGHT:
          code = 21
          if (arrowGamePad[0] === 0) {
            arrowGamePad[0] = 1
          } else if (arrowGamePad[0] > 4) {
            arrowGamePad[0] = 4
          }
          break
        case ARROW.UP:
          code = 11
          if (arrowGamePad[1] === 0) {
            arrowGamePad[1] = -1
          } else if (arrowGamePad[1] < -4) {
            arrowGamePad[1] = -4
          }
          break
        case ARROW.DOWN:
          code = 10
          if (arrowGamePad[1] === 0) {
            arrowGamePad[1] = 1
          } else if (arrowGamePad[1] > 4) {
            arrowGamePad[1] = 4
          }
          break
      }
    }
    passKeypress(String.fromCharCode(code))
  } else {
    switch (key) {
      case ARROW.LEFT:  // fall through
      case ARROW.RIGHT:
        arrowGamePad[0] = 5
        break
      case ARROW.UP:  // fall through
      case ARROW.DOWN:
        arrowGamePad[1] = 5
        break
    }
  }
}
