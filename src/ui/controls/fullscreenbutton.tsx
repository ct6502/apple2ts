import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import {
  faExpand,
} from "@fortawesome/free-solid-svg-icons";

const FullScreenButton = () => {
  const isTouchDevice = "ontouchstart" in document.documentElement
  const fullscreenEnabled = document.fullscreenEnabled
  return (
    <button className="push-button" title="Full Screen"
      style={{ display: isTouchDevice && !fullscreenEnabled ? 'none' : '' }}
      onClick={() => {
        const canvas = document.getElementById('apple2canvas') as HTMLCanvasElement
        const context = canvas.getContext('2d')
        if (context) {
          try {
            var parentCopy=canvas.parentElement
            var parent:any = parentCopy
            var elementCopy=Element
            var Element:any = elementCopy
            var navigatorCopy=navigator
            var navigator:any = navigatorCopy
            parent.webkitRequestFullScreen()//Element.ALLOW_KEYBOARD_INPUT)
            // navigator.keyboard.unlock();
            canvas.width = window.outerWidth;
            canvas.height = window.outerHeight;
          } catch(e) {
            console.log(e)
          }
        }
      }
      }>
      <FontAwesomeIcon icon={faExpand} />
    </button>
  )
}

export default FullScreenButton;
