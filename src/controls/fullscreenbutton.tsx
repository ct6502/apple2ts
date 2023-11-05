import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import {
  faExpand,
} from "@fortawesome/free-solid-svg-icons";
const FullScreenButton = (props: DisplayProps) => {  
  const isTouchDevice = "ontouchstart" in document.documentElement
  return (
    <button className="pushButton" title="Full Screen"
      style={{display: isTouchDevice ? 'none' : ''}}
      onClick={() => {
        const context = props.myCanvas.current
        if (context) {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          let requestFullScreen: any
          if ('webkitRequestFullscreen' in context) {
            requestFullScreen = context.webkitRequestFullscreen
          } else if ('mozRequestFullScreen' in context) {
            requestFullScreen = context.mozRequestFullScreen
          } else if ('msRequestFullscreen' in context) {
            requestFullScreen = context.msRequestFullscreen
          } else if ('requestFullscreen' in context) {
            requestFullScreen = context.requestFullscreen
          }
          if (requestFullScreen) {
            requestFullScreen.call(context);
          }
        }
      }
        }>
      <FontAwesomeIcon icon={faExpand}/>
    </button>
  )
}

export default FullScreenButton;
