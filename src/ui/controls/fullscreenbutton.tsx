import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import {
  faExpand,
} from "@fortawesome/free-solid-svg-icons"

const FullScreenButton = () => {
  const isTouchDevice = "ontouchstart" in document.documentElement
  return (
    <button className="push-button" title="Full Screen"
      style={{ display: isTouchDevice ? "none" : "" }}
      onClick={() => {
        const canvas = document.getElementById("apple2canvas") as HTMLCanvasElement
        const context = canvas.getContext("2d")
        if (context) {
          try {
            canvas?.parentElement?.requestFullscreen()
            canvas.width = window.outerWidth
            canvas.height = window.outerHeight
          } catch {
            // do nothing
          }
        }
      }
      }>
      <FontAwesomeIcon icon={faExpand} />
    </button>
  )
}

export default FullScreenButton
