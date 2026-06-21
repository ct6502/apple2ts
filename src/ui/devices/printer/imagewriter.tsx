import { useEffect, useState } from "react"
import iwiion from "./iwiion.png"
import iwiioff from "./iwiioff.png"
import PrinterDialog from "./printerdialog"
import { ImageWriterII, registerSetPrinting } from "./iwii"
import { constructAudio, playAudio } from "../../../common/utility"
import { isAudioEnabled, registerAudioContext } from "../audio/speaker"
import { setSerialConfigCallback } from "../../main2worker"
import { getSerialMode } from "../serial/serialhub"

const audioDevices: Array<AudioDevice | undefined> = []
enum AUDIO {
  TURN_ON = 0,
  PRINT = 1,
  LINEFEED = 2,
}
let printingTimeout = 0
let audioStartTime = 0
let setPrintCalls = 0

const PRINTER_DURATIONS = [0.7083, 1.292, 2.459, 3.625, 4.125, 5.375, 6.5, 7.625, 8.792, 9.75] // seconds
const CLIP_LENGTH = PRINTER_DURATIONS[PRINTER_DURATIONS.length - 1]

const ImageWriter = () => {
  const [open, setOpen] = useState(false)
  const [canvas] = useState(document.createElement("canvas"))

  const playPrinterAudio = (audio: AUDIO, audioFile: string, duration: number, loop: boolean) => {
    if (!isAudioEnabled()) {
      audioDevices[audio]?.context.close()
      audioDevices[audio] = undefined
    }
    if (!audioDevices[audio]) {
      audioDevices[audio] = constructAudio(audioFile)
      if (loop) {
        audioDevices[audio]!.element.loop = true
      }
      registerAudioContext((enable: boolean) => {
        if (!enable) {
          audioDevices[audio]?.context.close()
          audioDevices[audio] = undefined
        }
      })
    }
    playAudio(audioDevices[audio], duration)
  }

  useEffect(() => {
    ImageWriterII.startup(canvas)
    setSerialConfigCallback((config: SerialConfig) => {
      if (config.baud > 0 && getSerialMode() === 0) {
        playPrinterAudio(AUDIO.TURN_ON, window.assetRegistry.imagewriterTurnOn, 3000, false)
        audioDevices[AUDIO.TURN_ON]!.element.addEventListener("ended", () => {
          if (audioDevices[AUDIO.TURN_ON]?.context.state !== "closed") {
            audioDevices[AUDIO.TURN_ON]?.context.close()
          }
          audioDevices[AUDIO.TURN_ON] = undefined
        })
      }
    })
    
    // Cleanup audio on unmount
    return () => {
      for (const audio in audioDevices) {
        audioDevices[audio]?.context.close()
        audioDevices[audio] = undefined
      }
    }
  }, [canvas])

  const setPrinting = () => {
    if (audioDevices[AUDIO.TURN_ON]) {
      return
    }
    // Start audio on first call or if it was previously stopped
    if (printingTimeout === 0) {
      // Always restart audio and reset timer for a new print job
      if (audioDevices[AUDIO.PRINT]) {
        audioDevices[AUDIO.PRINT]?.context.close()
        audioDevices[AUDIO.PRINT] = undefined
      }
      playPrinterAudio(AUDIO.PRINT, window.assetRegistry.imagewriterPrint, 975000, true)
      audioStartTime = Date.now()
    } else {
      // Just reset the timeout if already printing
      clearTimeout(printingTimeout)
    }

    setPrintCalls++
    const overallPrintTime = (Date.now() - audioStartTime) / 1000
    const remainingTimeout = (setPrintCalls > 10 && overallPrintTime <= CLIP_LENGTH) ? 2000 : 500

    const timeout = window.setTimeout(() => {
      // Find the correct slot within PRINTER_DURATIONS based on elapsed time to ensure a smooth stop
      const overallPrintTime = (Date.now() - audioStartTime) / 1000
      const timeWithinAudioClip = overallPrintTime % CLIP_LENGTH
      let targetDuration = CLIP_LENGTH // default to last
      for (const duration of PRINTER_DURATIONS) {
        if (duration > timeWithinAudioClip) {
          targetDuration = duration
          break
        }
      }
      // Timeout to reach target duration
      const timeoutMs = (targetDuration - timeWithinAudioClip) * 1000
      window.setTimeout(() => {
        printingTimeout = 0
        audioStartTime = 0
        setPrintCalls = 0
        // Stop printer sound
        if (audioDevices[AUDIO.PRINT]) {
          audioDevices[AUDIO.PRINT]?.context.close()
          audioDevices[AUDIO.PRINT] = undefined
        }
        if (overallPrintTime > 1) {
          playPrinterAudio(AUDIO.LINEFEED, window.assetRegistry.imagewriterLinefeed, 2000, false)
        }
      }, timeoutMs)
    }, remainingTimeout)
    printingTimeout = timeout
  }

  registerSetPrinting(setPrinting)
  const img1 = printingTimeout ? iwiion : iwiioff
  const isTouchDevice = "ontouchstart" in document.documentElement

  return (
    <span className="flex-column">
      <img className={`disk-image${isTouchDevice ? " disk-image-small" : ""}`}
        style={{ borderWidth: 0 }}
        src={img1} alt="iwii"
        title="ImageWriter II (Slot 1)"
        height="57px"
        onClick={() => { setOpen(true) }} />
      <PrinterDialog
        open={open}
        onClose={() => { setOpen(false) }}
        canvas={canvas}
        printer={ImageWriterII}
      />
    </span>
  )
}

export default ImageWriter
