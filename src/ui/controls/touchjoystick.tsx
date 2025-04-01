import { useEffect, useState } from "react"
import "./touchjoystick.css"
import { handleGetTouchJoyStickMode, handleGetTouchJoystickSensitivity } from "../main2worker"

let defaultGetGamePads: () => (Gamepad | null)[]

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

class CustomGamepad implements Gamepad  {
  axes: readonly number[]
  buttons: readonly GamepadButton[]
  connected: boolean
  id: string
  index: number
  mapping: GamepadMappingType
  timestamp: number
  vibrationActuator: GamepadHapticActuator

  constructor(buttons: GamepadButton[] = getDefaultButtons(), axes: number[] = [0, 0]) {
    this.axes = JSON.parse(JSON.stringify(axes))
    this.buttons = JSON.parse(JSON.stringify(buttons))
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
}

export const TouchJoystick = () => {

  const touchjoystickMode = handleGetTouchJoyStickMode()
  const isSouthpaw = touchjoystickMode === "left"

  const [customGamepad, setCustomGamepad] = useState<CustomGamepad>(new CustomGamepad)
  const [eventCounter, setEventCounter] = useState<number>(0)

  useEffect(() => {
    if (touchjoystickMode !== "off") {
      defaultGetGamePads = navigator.getGamepads
      navigator.getGamepads = function() {
        return [customGamepad]
      }
    } else {
      if (defaultGetGamePads !== undefined) {
        navigator.getGamepads = defaultGetGamePads
      }
    }
  }, [touchjoystickMode, customGamepad])

  const scale = (value: number, yMin: number, yMax: number, xMin: number, xMax: number) => {
    return ((value - yMin) / (yMax - yMin)) * (xMax - xMin) + xMin
  }

  const toggleButton = (buttonNumber: number, enabled: boolean) => {
    const button = document.getElementById(`tj-button${buttonNumber}`) as HTMLElement
    if (button) {
      button.style.display = enabled ? "inline" : "none"
    }
  }

  const handlePointerEnter = (event: React.PointerEvent) => {
    handlePointerMove(event)
  }

  const handlePointerMove = (event: React.PointerEvent) => {
    event.preventDefault()

    setEventCounter(eventCounter + 1)
    if (eventCounter % handleGetTouchJoystickSensitivity() != 0)
      return

    const currentTarget = event.currentTarget as HTMLElement
    const rect = currentTarget.getBoundingClientRect()

    const buttonsLeft = isSouthpaw ? rect.left : 0
    const buttonsRight = isSouthpaw ? window.outerWidth : rect.right
    const buttonsTop = rect.top + rect.width * 0.12
    const buttonsBottom = rect.top + rect.height - rect.width * 0.12
    
    const offsetX = event.clientX - currentTarget.clientLeft
    const offsetY = event.clientY

    const axes = customGamepad.axes.slice()
    axes[0] = scale(offsetX, buttonsLeft, buttonsRight, -1, 1)
    axes[1] = scale(offsetY, buttonsTop, buttonsBottom, -1, 1)

    setCustomGamepad(new CustomGamepad(customGamepad.buttons.slice(), axes))

    const radians = Math.atan2(axes[1], axes[0])
    const degrees = ((radians * (180 / Math.PI) + 450) % 360)
    const joystick = document.getElementById("touchjoystick-stick") as HTMLElement
    joystick.style.transform = `rotate(${degrees}deg)`
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const handleStickPointerLeave = (event: React.PointerEvent) => {
    const joystick = document.getElementById("touchjoystick-stick") as HTMLElement
    joystick.style.transform = "rotate(0deg)"

    setCustomGamepad(new CustomGamepad)
  }

  const handleButtonsTouchStart = (event: React.TouchEvent) => {
    const currentTarget = event.currentTarget as HTMLElement
    const buttons = getDefaultButtons()

    for (let i=0; i<event.touches.length; i++) {
      const touch = event.touches[i]
      const unitX = (touch.clientX - currentTarget.offsetLeft) / currentTarget.clientWidth
      const unitY = (touch.clientY - currentTarget.offsetTop) / currentTarget.clientHeight

      if (isSouthpaw) {
        if (unitX >= 0.7479 && unitX <= 0.8529 && unitY >= -0.3060 && unitY <= -0.1958) {
          buttons[0].pressed = true
          toggleButton(0, true)
        }
        if (unitX >= 0.0558 && unitX <= 0.6639 && unitY >= -0.4904 && unitY <= -0.3897) {
          buttons[1].pressed = true
          toggleButton(1, true)
        }
      } else {
        if (unitX >= 0.1170 && unitX <= 0.2561 && unitY >= -0.3179 && unitY <= -0.1735) {
          buttons[0].pressed = true
          toggleButton(0, true)
        }
        if (unitX >= 0.3086 && unitX <= 0.4369 && unitY >= -0.4807 && unitY <= -0.3794) {
          buttons[1].pressed = true
          toggleButton(1, true)
        }
      }
    }

    setCustomGamepad(new CustomGamepad(buttons, customGamepad.axes.slice()))
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const handleButtonsTouchEnd = (event: React.TouchEvent) => {
    toggleButton(0, false)
    toggleButton(1, false)
    setCustomGamepad(new CustomGamepad(getDefaultButtons(), customGamepad.axes.slice()))
  }

  return (
    touchjoystickMode !== "off"
      ? <div
        className="tj-container"
        draggable="false">
        <div
          className={`tj-base tj-base-${isSouthpaw ? "right" : "left"}`}
          onTouchMove={(event: React.TouchEvent) => event.preventDefault()}
          onPointerEnter={handlePointerEnter}
          onPointerMove={handlePointerMove}
          onPointerLeave={handleStickPointerLeave}>
          <div>
            <img
              className={`tj-base-image-${isSouthpaw ? "left" : "right"}`}
              src="/tj-base.png" />
          </div>
          <div
            id="touchjoystick-stick"
            className={`tj-stick tj-stick-${isSouthpaw ? "right" : "left"}`}
          >
            <img
              className="tj-stick-image"
              src="/tj-stick.png" />
          </div>
        </div>
        <div
          className={`tj-buttons tj-buttons-${isSouthpaw ? "left" : "right"}`}
          onTouchStart={handleButtonsTouchStart}
          onTouchEnd={handleButtonsTouchEnd}>
          <img
            className={`tj-base-image-${isSouthpaw ? "left" : "right"}`}
            src="/tj-base.png" />
          <img id="tj-button0" className={`tj-buttons-button0-${isSouthpaw ? "left" : "right"}`} src="/tj-button0.png" />
          <img id="tj-button1" className={`tj-buttons-button1-${isSouthpaw ? "left" : "right"}`} src="/tj-button1.png" />
        </div>
      </div>
      : <div></div>
  )
}

export default TouchJoystick
