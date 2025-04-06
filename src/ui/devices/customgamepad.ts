const getDefaultButtons = () => {
  return JSON.parse(JSON.stringify([
    {
      pressed: false,
      touched: false,
      value: 0
    },
    {
      pressed: false,
      touched: false,
      value: 0
    }
  ]))
}

export class CustomGamepad implements Gamepad  {
  axes: readonly number[]
  buttons: readonly GamepadButton[]
  connected: boolean
  id: string
  index: number
  mapping: GamepadMappingType
  timestamp: number
  vibrationActuator: GamepadHapticActuator

  constructor(buttons = [false, false], axes = [0, 0]) {
    const gamepadButtons = getDefaultButtons()
    gamepadButtons[0].pressed = buttons[0]
    gamepadButtons[1].pressed = buttons[1]
    this.axes = JSON.parse(JSON.stringify(axes))
    this.buttons = gamepadButtons
    this.connected = false
    this.id = ""
    this.index = 0
    this.mapping = "standard"
    this.timestamp = Date.now()
    this.vibrationActuator = {
      // playEffect: function (type: GamepadHapticEffectType, params?: GamepadEffectParameters): Promise<GamepadHapticsResult> {
      playEffect: function (): Promise<GamepadHapticsResult> {
        return Promise.resolve("complete")
      },
      reset: function (): Promise<GamepadHapticsResult> {
        return Promise.resolve("complete")
      }
    }
  }

  setButtons(buttons: boolean[]) {
    const gamepadButtons = getDefaultButtons()
    gamepadButtons[0].pressed = buttons[0]
    gamepadButtons[1].pressed = buttons[1]
    this.buttons = gamepadButtons
  }

  setAxes(axes: number[]) {
    this.axes = axes
  }
}
