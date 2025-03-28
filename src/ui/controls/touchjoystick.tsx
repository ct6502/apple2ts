import { setPaddleValue } from "../../worker/devices/joystick"
import { passAppleCommandKeyPress } from "../main2worker"
import "./touchjoystick.css"

export const TouchJoystick = () => {

  const isSouthpaw = false

  const scaleToRange = (value: number, inputStart: number, inputEnd: number, outputStart: number, outputEnd: number) => {
    const inputRange = inputEnd - inputStart;
    const outputRange = outputEnd - outputStart;
    return (value - inputStart) * outputRange / inputRange + outputStart;
  }

  const handlePointerMove = (event: React.PointerEvent) => {
    const currentTarget = event.currentTarget as HTMLElement
    const offsetX = Math.max(0, Math.min(event.nativeEvent.offsetX, currentTarget.offsetWidth))
    const offsetY = Math.max(0, Math.min(event.nativeEvent.offsetY, currentTarget.offsetHeight))
    const localX = scaleToRange(offsetX,  0, currentTarget.offsetWidth, -1, 1)
    const localY = scaleToRange(offsetY, 0, currentTarget.offsetHeight, -1, 1)

    const radians = Math.atan2(localY, localX)
    const degrees = ((radians * (180 / Math.PI) + 450) % 360) * (isSouthpaw ? -1 : 1)

    const joystick = document.getElementById("touchjoystick-stick") as HTMLElement
    joystick.style.transform = `rotate(${degrees}deg)`

    setPaddleValue(0, scaleToRange(localX, -1, 1, 0, 0x80))
    setPaddleValue(1, scaleToRange(localY, -1, 1, 0, 0x80))
  }

  const handleStickPointerLeave = (event: React.PointerEvent) => {
    const joystick = document.getElementById("touchjoystick-stick") as HTMLElement
    joystick.style.transform = "rotate(0deg)"
  }

  const handleButtonsTouchEnd = (event: React.TouchEvent) => {
    const currentTarget = event.currentTarget as HTMLElement
    const touch = event.changedTouches[0]
    const localX = (touch.clientX - currentTarget.offsetLeft) / event.currentTarget.clientWidth
    const localY = (touch.clientY - currentTarget.offsetTop) / event.currentTarget.clientHeight

    if (isSouthpaw) {
      if (localX >= 0.7479 && localX <= 0.8529 && localY >= -0.3060 && localY <= -0.1958) {
        passAppleCommandKeyPress(true)
      } else if (localX >= 0.0558 && localX <= 0.6639 && localY >= -0.4904 && localY <= -0.3897) {
        passAppleCommandKeyPress(false)
      } else {
        return false
      }
    } else {
      if (localX >= 0.1170 && localX <= 0.2561 && localY >= -0.3179 && localY <= -0.1735) {
        passAppleCommandKeyPress(true)
      } else if (localX >= 0.3086 && localX <= 0.4369 && localY >= -0.4807 && localY <= -0.3794) {
        passAppleCommandKeyPress(false)
      } else {
        return false
      }
    }
  }

  return (
    <div className="tj-container">
      <div
        className={`tj-base tj-base-${isSouthpaw ? "right" : "left"}`}
        onPointerMove={handlePointerMove}
        onPointerLeave={handleStickPointerLeave}
        >
        <div>
          <img
            className={`tj-base-image-${isSouthpaw ? "left" : "right"}`}
            draggable="false" src="/touchjoystick-base.png" />
        </div>
        <div
            id="touchjoystick-stick"
            className={`tj-stick tj-stick-${isSouthpaw ? "right" : "left"}`}>
          <img
            className="tj-stick-image"
            draggable="false"
            src="/touchjoystick-stick.png" />
        </div>
      </div>
      <div
        className={`tj-buttons tj-buttons-${isSouthpaw ? "left" : "right"}`}
        onTouchEnd={handleButtonsTouchEnd}>
        <img
          className={`tj-base-image-${isSouthpaw ? "left" : "right"}`}
          draggable="false" src="/touchjoystick-base.png" />
      </div>
    </div>
  )
}

export default TouchJoystick