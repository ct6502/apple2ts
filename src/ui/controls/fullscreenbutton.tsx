import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import {
  faExpand,
} from "@fortawesome/free-solid-svg-icons"

import { useTranslation } from "../../i18n/useTranslation"

const FullScreenButton = () => {
  const { t } = useTranslation()
  const isTouchDevice = "ontouchstart" in document.documentElement
  return (
    <button className="push-button" title={t("fullscreen.fullScreen")}
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
