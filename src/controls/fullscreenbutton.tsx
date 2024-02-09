import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import {
  faExpand,
} from "@fortawesome/free-solid-svg-icons";

type RequestFullScreen_Type = {
  call: (context: HTMLCanvasElement) => void
}

const FullScreenButton = (props: DisplayProps) => {
  const isTouchDevice = "ontouchstart" in document.documentElement
  return (
    <button className="push-button" title="Full Screen"
      style={{ display: isTouchDevice ? 'none' : '' }}
      onClick={() => {
        const context = props.myCanvas.current
        if (context) {
          let requestFullScreen: RequestFullScreen_Type | null = null
          if ('webkitRequestFullscreen' in context) {
            requestFullScreen = context.webkitRequestFullscreen as RequestFullScreen_Type
          } else if ('mozRequestFullScreen' in context) {
            requestFullScreen = context.mozRequestFullScreen as RequestFullScreen_Type
          } else if ('msRequestFullscreen' in context) {
            requestFullScreen = context.msRequestFullscreen as RequestFullScreen_Type
          } else if ('requestFullscreen' in context) {
            requestFullScreen = context.requestFullscreen as RequestFullScreen_Type
          }
          if (requestFullScreen) {
            requestFullScreen.call(context);
          }
        }
      }
      }>
      <FontAwesomeIcon icon={faExpand} />
    </button>
  )
}

export default FullScreenButton;
