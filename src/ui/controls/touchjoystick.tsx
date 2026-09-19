import { useEffect, useState } from "react"
import "./touchjoystick.css"
import { clearCustomGamepad, setCustomGamepad } from "../devices/gamepad"
import { getUIStateBoolean } from "../ui_settings"


let oldBeta = 0
let oldGamma = 0
let timePrev = 0
let timeTiltPrev = 0
let oldAxis0 = 0
let oldAxis1 = 0

export const TouchJoystick = () => {
  const [stickDown, setStickDown] = useState<[number, number]>([-1, -1])
  const [stickOffset, setStickOffset] = useState<{ x: number, y: number }>({ x: 0, y: 0 })
  const [buttonStates, setButtonStates] = useState<[boolean, boolean]>([false, false])

  const isTouchDevice = "ontouchstart" in document.documentElement
  const defaultOpacity = isTouchDevice ? "0.25" : "0.5"

  const doSetCustomGamepad = (buttons: boolean[] | null, axes: number[] | null) => {
    if (getUIStateBoolean("touchJoystick")) {
      setCustomGamepad(buttons, axes)
    } else {
      clearCustomGamepad()
    }
  }

  const scaleJoystick = (value: number, yMin: number, yMax: number, xMin: number, xMax: number) => {
    return ((value - yMin) / (yMax - yMin)) * (xMax - xMin) + xMin
  }


  const deviceOrientationEvent = (event: DeviceOrientationEvent) => {
    if (event.beta === null || event.gamma === null) return
    const useTiltSensor = getUIStateBoolean("tiltSensorJoystick")
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

    const axes = [scaleJoystick(event.gamma, -25, 25, -1, 1),
      scaleJoystick(event.beta, -25, 25, -1, 1)]
    doSetCustomGamepad(null, axes)
  }

  useEffect(() => {
    window.addEventListener("deviceorientation", deviceOrientationEvent)
    return () => {
      window.removeEventListener("deviceorientation", deviceOrientationEvent)
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const handlePointerDown = (event: React.PointerEvent) => {
    event.currentTarget.setPointerCapture(event.pointerId)
    setStickDown([event.clientX, event.clientY])
    setStickOffset({ x: 0, y: 0 })
    handlePointerMove(event)
  }

  const handlePointerMove = (event: React.PointerEvent) => {
    if (!event.currentTarget.hasPointerCapture(event.pointerId)) {
      return
    }
    event.preventDefault()
    const joystick = document.getElementById("touchjoystick-stick") as HTMLElement
    joystick.style.opacity = "0.95"

    let stickX = stickDown[0]
    let stickY = stickDown[1]
    if (stickX < 0) {
      stickX = event.clientX
      stickY = event.clientY
      setStickDown([event.clientX, event.clientY])
    }
    const offsetX = event.clientX - stickX
    const offsetY = event.clientY - stickY
    const maxStickDistance = 70
    const clampedOffsetX = Math.max(-maxStickDistance, Math.min(maxStickDistance, offsetX))
    const clampedOffsetY = Math.max(-maxStickDistance, Math.min(maxStickDistance, offsetY))
    setStickOffset({ x: clampedOffsetX, y: clampedOffsetY })

    const axes = [0, 0]
    axes[0] = Math.max(-1, Math.min(1, offsetX / maxStickDistance))
    axes[1] = Math.max(-1, Math.min(1, offsetY / maxStickDistance))

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
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const handleStickPointerLeave = (event: React.PointerEvent) => {
    if (stickDown[0] >= 0) {
      setStickDown([-1, -1])
      setStickOffset({ x: 0, y: 0 })
      const joystick = document.getElementById("touchjoystick-stick") as HTMLElement
      joystick.style.opacity = defaultOpacity
      doSetCustomGamepad(null, [0, 0])
    }
  }

  const toggleButton = (buttonNumber: number, enabled: boolean) => {
    const button = document.getElementById(`tj-button${buttonNumber}`) as HTMLElement
    // Make the button look "pressed"
    if (button) {
      button.style.opacity = `${enabled ? 0.95 : defaultOpacity}`
    }
  }

  const onButtonPointerDown = (event: React.PointerEvent<HTMLDivElement>, button: number) => {
    event.currentTarget.setPointerCapture(event.pointerId)
    const newButtonStates: [boolean, boolean] = [false, false]
    if (button === 0) {
      newButtonStates[0] = true
      toggleButton(0, true)
    } else {
      newButtonStates[1] = true
      toggleButton(1, true)
    }
    setButtonStates(newButtonStates)
    doSetCustomGamepad(newButtonStates, null)
  }

  const onButtonPointerUp = (event: React.PointerEvent<HTMLDivElement>, button: number, reason: number) => {
    if (reason === -1) {  // only for debugging
      console.log(`button up: ${button} reason: ${reason}`)
    }
    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId)
    }
    // This might be called twice (once for PointerUp, again for PointerCancel or LostPointerCapture)
    // Only fire property changes if the state actually changed.
    let button0 = buttonStates[0]
    let button1 = buttonStates[1]
    if (button === 0 && button0) {
      button0 = false
      toggleButton(0, false)
    }
    if (button === 1 && button1) {
      button1 = false
      toggleButton(1, false)
    }
    if (button0 !== buttonStates[0] || button1 !== buttonStates[1]) {
      setButtonStates([button0, button1])
      doSetCustomGamepad([button0, button1], null)
    }
  }

  if (!getUIStateBoolean("touchJoystick")) {
    return <div></div>
  }

  return (
    <div
        className="tj-container"
        draggable="false">
        <div
          className="tj-base-position"
          onContextMenu={(event) => event.preventDefault()}>
          <div
            id="touchjoystick-stick"
            style={{
              opacity: defaultOpacity,
              "--touch-stick-offset-x": `${stickOffset.x}px`,
              "--touch-stick-offset-y": `${stickOffset.y}px`,
            } as React.CSSProperties}
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={handleStickPointerLeave}
            onPointerCancel={handleStickPointerLeave}
            onLostPointerCapture={handleStickPointerLeave}
            >
            <img
              className="tj-joystick-image"
              src="/tj-joystick.png"
              draggable={false} />
          </div>
        </div>
        <div
          className="tj-buttons-base">
          <div
            id="tj-button0"
            className={"tj-buttons-both tj-buttons-button0"}
            style={{ opacity: defaultOpacity }}
            onContextMenu={(event) => event.preventDefault()}
            onPointerDown={(event) => onButtonPointerDown(event, 0)}
            onPointerUp={(event) => onButtonPointerUp(event, 0, 0)}
            onPointerCancel={(event) => onButtonPointerUp(event, 0, 1)}
            onLostPointerCapture={(event) => onButtonPointerUp(event, 0, 2)}>
            <img
              className="tj-button-image"
              src="/tj-button.png"
              draggable={false}/>
            <div className="tj-button-number">1</div>
          </div>
          <div
            id="tj-button1"
            className={"tj-buttons-both tj-buttons-button1"}
            style={{ opacity: defaultOpacity }}
            onContextMenu={(event) => event.preventDefault()}
            onPointerDown={(event) => onButtonPointerDown(event, 1)}
            onPointerUp={(event) => onButtonPointerUp(event, 1, 0)}
            onPointerCancel={(event) => onButtonPointerUp(event, 1, 1)}
            onLostPointerCapture={(event) => onButtonPointerUp(event, 1, 2)}>
            <img
              className="tj-button-image"
              src="/tj-button.png"
              draggable={false}/>
            <div className="tj-button-number">2</div>
          </div>
        </div>
    </div>
  )
}

export default TouchJoystick
