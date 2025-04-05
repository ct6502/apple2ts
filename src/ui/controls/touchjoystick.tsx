import { useState } from "react"
import "./touchjoystick.css"
import { handleGetTouchJoyStickMode, handleGetTouchJoystickSensitivity } from "../main2worker"
import { getPreferenceTiltSensorJoystick } from "../localstorage"
import { clearCustomGamepad, setCustomGamepad } from "../devices/gamepad"


let oldBeta = 0
let oldGamma = 0
let timePrev = 0
let timeTiltPrev = 0
let oldAxis0 = 0
let oldAxis1 = 0
let tiltSensorLoaded = false

export const TouchJoystick = () => {

  const touchjoystickMode = handleGetTouchJoyStickMode()
  const isSouthpaw = touchjoystickMode === "left"
  const [eventCounter, setEventCounter] = useState<number>(0)

  const doSetCustomGamepad = (buttons: boolean[] | null, axes: number[] | null) => {
    if (handleGetTouchJoyStickMode() === "off") {
      clearCustomGamepad()
      return
    }
    setCustomGamepad(buttons, axes)
  }

  const deviceOrientationEvent = (event: DeviceOrientationEvent) => {
    if (event.beta === null || event.gamma === null) return
    const useTiltSensor = getPreferenceTiltSensorJoystick()
    if (!useTiltSensor) return

    if (Math.abs(oldBeta - event.beta) < 1 || Math.abs(oldGamma - event.gamma) < 1) {
      return
    }
    oldBeta = event.beta
    oldGamma = event.gamma
    const t = performance.now()
    if ((t - timeTiltPrev) < 67) {
      return
    }
    timeTiltPrev = t

    const axes = [scale(event.gamma, -25, 25, -1, 1),
      scale(event.beta, -25, 25, -1, 1)]
    doSetCustomGamepad(null, axes)
  }

  if (!tiltSensorLoaded) {
    tiltSensorLoaded = true
    window.addEventListener("deviceorientation", deviceOrientationEvent)
  }

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

    const stickLeft = isSouthpaw ? (rect.left + 20) : 25
    const stickRight = isSouthpaw ? (window.outerWidth - 25) : (rect.right - 20)
    const stickTop = rect.top + rect.width * 0.12
    const stickBottom = rect.top + rect.height - rect.width * 0.12
    
    const offsetX = event.clientX - currentTarget.clientLeft
    const offsetY = event.clientY

    const axes = [0, 0]
    axes[0] = scale(offsetX, stickLeft, stickRight, -1, 1)
    axes[1] = scale(offsetY, stickTop, stickBottom, -1, 1)

    if (Math.abs(axes[0] - oldAxis0) < 0.01 && Math.abs(axes[1] - oldAxis1) < 0.01) {
      return
    }
    oldAxis0 = axes[0]
    oldAxis1 = axes[1]

    const t = performance.now()
    if ((t - timePrev) < 67) {
      return
    }
    timePrev = t

    doSetCustomGamepad(null, axes)

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
    doSetCustomGamepad(null, [0, 0])
  }

  const handleButtonsTouchStart = (event: React.TouchEvent) => {
    const currentTarget = event.currentTarget as HTMLElement
    let button0 = false
    let button1 = false

    for (let i=0; i<event.touches.length; i++) {
      const touch = event.touches[i]
      const unitY = (currentTarget.offsetTop - touch.clientY) / currentTarget.clientHeight
      // Allow anything halfway or below to be button 0, otherwise button 1
      if (unitY <= 0.5) {
        button0 = true
        toggleButton(0, true)
      } else {
        button1 = true
        toggleButton(1, true)
      }
    }
    doSetCustomGamepad([button0, button1], null)
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const handleButtonsTouchEnd = (event: React.TouchEvent) => {
    toggleButton(0, false)
    toggleButton(1, false)
    doSetCustomGamepad([false, false], null)
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
