import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import {
  faExpand,
} from "@fortawesome/free-solid-svg-icons"

import { useTranslation } from "../../i18n/useTranslation"

type KeyboardLock = {
  lock: (keys: string[]) => Promise<void>
  unlock: () => void
}

const getKeyboardLock = () => (navigator as Navigator & { keyboard?: KeyboardLock }).keyboard
let removeFullscreenLockListener: (() => void) | undefined

const unlockEscape = () => {
  try {
    getKeyboardLock()?.unlock()
  } catch {
    // Keyboard Lock is optional and may be rejected by the browser.
  }
  removeFullscreenLockListener?.()
  removeFullscreenLockListener = undefined
}

const lockEscape = async () => {
  const keyboard = getKeyboardLock()
  if (!keyboard) return

  try {
    await keyboard.lock(["Escape"])
    if (!isCanvasFullscreen()) {
      unlockEscape()
      return
    }
    const handleFullscreenChange = () => {
      if (!isCanvasFullscreen()) unlockEscape()
    }
    document.addEventListener("fullscreenchange", handleFullscreenChange)
    removeFullscreenLockListener = () => {
      document.removeEventListener("fullscreenchange", handleFullscreenChange)
    }
  } catch {
    // Fullscreen remains usable when Keyboard Lock is unavailable.
  }
}

export const isCanvasFullscreen = () => {
  const canvas = document.getElementById("apple2canvas")
  return document.fullscreenElement === canvas?.parentElement
}

export const setCanvasFullscreen = async (enabled: boolean) => {
  const canvas = document.getElementById("apple2canvas") as HTMLCanvasElement | null
  if (!canvas || enabled === isCanvasFullscreen()) return

  if (enabled) {
    const context = canvas.getContext("2d")
    if (!context) return
    try {
      await canvas.parentElement?.requestFullscreen()
      canvas.width = window.outerWidth
      canvas.height = window.outerHeight
      await lockEscape()
    } catch {
      // Fullscreen requests can be rejected when user activation is unavailable.
    }
  } else {
    unlockEscape()
    try {
      await document.exitFullscreen()
    } catch {
      // Ignore browsers that reject an exit while fullscreen is already ending.
    }
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
