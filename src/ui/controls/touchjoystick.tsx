import { useEffect, useState } from "react"
import "./touchjoystick.css"
import { handleGetTouchJoyStickMode, handleGetTouchJoystickSensitivity } from "../main2worker"
import { getPreferenceTiltSensorJoystick } from "../localstorage"

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

  let oldBeta = 0
  let oldGamma = 0
  const deviceOrientationEvent = (event: DeviceOrientationEvent) => {
    if (event.beta === null || event.gamma === null) return
    const useTiltSensor = getPreferenceTiltSensorJoystick()
    if (!useTiltSensor) return

    if (Math.abs(oldBeta - event.beta) > 1 || Math.abs(oldGamma - event.gamma) > 1) {
      const axes = customGamepad.axes.slice()
      axes[0] = scale(event.gamma, -25, 25, -1, 1)
      axes[1] = scale(event.beta, -25, 25, -1, 1)
      setCustomGamepad(new CustomGamepad(customGamepad.buttons.slice(), axes))
      oldBeta = event.beta
      oldGamma = event.gamma
    }
  }

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
    window.removeEventListener("deviceorientation", deviceOrientationEvent)
    window.addEventListener("deviceorientation", deviceOrientationEvent)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [touchjoystickMode, customGamepad])

  const scale = (value: number, yMin: number, yMax: number, xMin: number, xMax: number) => {
    return ((value - yMin) / (yMax - yMin)) * (xMax - xMin) + xMin
  }

  const toggleButton = (buttonNumber: number, enabled: boolean) => {
    const button = document.getElementById(`tj-button${buttonNumber}`) as HTMLElement
    // Make the button look "pressed"
    if (button) {
      const tx = enabled ? (isSouthpaw ? -5 : 5) : 0
      button.style.transform = `translateX(${tx}px) scale(${enabled ? 0.95 : 1})`
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
    const stickScale = Math.min(Math.sqrt((axes[0] * axes[0] + axes[1] * axes[1]) / 2), 1)
    const joystick = document.getElementById("touchjoystick-stick") as HTMLElement
    joystick.style.transform = `rotate(${degrees}deg) scaleY(${stickScale})`
    // If our stick scaling is too small it starts to look tiny and stupid.
    // So just hide it in that case.
    joystick.style.display = stickScale > 0.4 ? "block" : "none"
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const handleStickPointerLeave = (event: React.PointerEvent) => {
    const joystick = document.getElementById("touchjoystick-stick") as HTMLElement
    joystick.style.display = "none"
    const axes = customGamepad.axes.slice()
    axes[0] = 0
    axes[1] = 0
    setCustomGamepad(new CustomGamepad(customGamepad.buttons.slice(), axes))
  }

  const handleButtonsTouchStart = (event: React.TouchEvent) => {
    const currentTarget = event.currentTarget as HTMLElement
    const buttons = getDefaultButtons()

    for (let i=0; i<event.touches.length; i++) {
      const touch = event.touches[i]
      const unitY = (currentTarget.offsetTop - touch.clientY) / currentTarget.clientHeight
      // Allow anything halfway or below to be button 0, otherwise button 1
      if (unitY <= 0.5) {
        buttons[0].pressed = true
        toggleButton(0, true)
      } else {
        buttons[1].pressed = true
        toggleButton(1, true)
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

  const isLandscape = (window.innerWidth > window.innerHeight)

  return (
    touchjoystickMode !== "off"
      ? <div
        className="tj-container"
        draggable="false">
        <div
          className={`tj-base-position tj-base-${isSouthpaw ? "right" : "left"} ${isLandscape ? "" : "tj-base-portrait"}`}
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
          className={`tj-base-position tj-buttons-${isSouthpaw ? "left" : "right"} ${isLandscape ? "" : "tj-base-portrait"}`}
          onTouchStart={handleButtonsTouchStart}
          onTouchEnd={handleButtonsTouchEnd}>
          <img
            className={`tj-base-image-${isSouthpaw ? "left" : "right"}`}
            src="/tj-base.png" />
          <img id="tj-button0"
            className={`tj-buttons-all tj-buttons-button0-${isSouthpaw ? "left" : "right"}`}
            src="/tj-button0.png" />
          <img id="tj-button1"
            className={`tj-buttons-all tj-buttons-button1-${isSouthpaw ? "left" : "right"}`}
            src="/tj-button1.png" />
        </div>
      </div>
      : <div></div>
  )
}

export default TouchJoystick
