import "./touchjoystick.css"

export const TouchJoystick = () => {

  const handleButtonsClick = (event: React.MouseEvent) => {
    const currentTarget = event.currentTarget as HTMLElement
    const localX = (event.clientX - currentTarget.offsetLeft) / event.currentTarget.clientWidth
    const localY = (event.clientY - currentTarget.offsetTop) / event.currentTarget.clientHeight

    if (localX >= 0.1170 && localX <= 0.2561 && localY >= -0.3179 && localY <= -0.1735) {
      alert("button1")
    } else if (localX >= 0.3086 && localX <= 0.4369 && localY >= -0.4807 && localY <= -0.3794) {
      alert("button2")
    } else {
      return false
    }
  }

  return (
    <div className="tj-container">
      <div className="tj-common tj-left">
        <div className="tj-stick">
          <img className="tj-stick-image" draggable="false" src="/touchjoystick-stick.png" />
        </div>
        <img className="tj-left-image" draggable="false" src="/touchjoystick-base.png" />
      </div>
      <div className="tj-common tj-right" onClick={handleButtonsClick}>
        <img className="tj-right-image" draggable="false" src="/touchjoystick-base.png" />
      </div>
    </div>
  )
}

export default TouchJoystick