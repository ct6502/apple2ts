import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import {
  faExpand,
} from "@fortawesome/free-solid-svg-icons"

import { useTranslation } from "../../i18n/useTranslation"

export const isCanvasFullscreen = () => {
  const canvas = document.getElementById("apple2canvas")
  return document.fullscreenElement === canvas?.parentElement
}

export const setCanvasFullscreen = (enabled: boolean) => {
  const canvas = document.getElementById("apple2canvas") as HTMLCanvasElement | null
  if (!canvas || enabled === isCanvasFullscreen()) return

  if (enabled) {
    const context = canvas.getContext("2d")
    if (!context) return
    void canvas.parentElement?.requestFullscreen().then(() => {
      canvas.width = window.outerWidth
      canvas.height = window.outerHeight
    }).catch(() => { })
  } else {
    void document.exitFullscreen().catch(() => { })
  }
}

const FullScreenButton = () => {
  const { t } = useTranslation()
  const isTouchDevice = "ontouchstart" in document.documentElement
  return (
    <button className="push-button" title={t("fullscreen.fullScreen")}
      style={{ display: isTouchDevice ? "none" : "" }}
      onClick={() => setCanvasFullscreen(true)}>
      <FontAwesomeIcon icon={faExpand} />
    </button>
  )
}

export default FullScreenButton
