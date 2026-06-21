import { useEffect, useState } from "react"
import iwiion from "./iwiion.png"
import iwiioff from "./iwiioff.png"
import PrinterDialog from "./printerdialog"
import { ImageWriterII, registerSetPrinting } from "./iwii"
import { constructAudio, playAudio } from "../../../common/utility"
import { isAudioEnabled, registerAudioContext } from "../audio/speaker"

let printerAudio: AudioDevice | undefined
let linefeedAudio: AudioDevice | undefined
let printingTimeout = 0
let audioStartTime = 0
let setPrintCalls = 0

const PRINTER_DURATIONS = [0.7083, 1.292, 2.459, 3.625, 4.125, 5.375, 6.5, 7.625, 8.792, 9.75] // seconds
const CLIP_LENGTH = PRINTER_DURATIONS[PRINTER_DURATIONS.length - 1]

const ImageWriter = () => {
  const [open, setOpen] = useState(false)
  const [canvas] = useState(document.createElement("canvas"))

  const playLinefeedAudio = () => {
    if (!isAudioEnabled()) {
      return
    }
    if (!linefeedAudio) {
      linefeedAudio = constructAudio(window.assetRegistry.imagewriterLinefeed)
      registerAudioContext((enable: boolean) => {
        if (!enable) linefeedAudio?.context.suspend()
      })
    }
    playAudio(linefeedAudio, 2000)
  }

  const playPrinterAudio = () => {
    if (!isAudioEnabled()) {
      return
    }
    if (!printerAudio) {
      printerAudio = constructAudio(window.assetRegistry.imagewriterPrint)
      printerAudio.element.loop = true
      registerAudioContext((enable: boolean) => {
        // Just turn off audio if disabled, don't bother to turn it
        // back on because this sound is so short.
        if (!enable) printerAudio?.context.suspend()
      })
    }
    audioStartTime = Date.now()
    playAudio(printerAudio, 975000)
  }

  useEffect(() => {
    ImageWriterII.startup(canvas)
    
    // Cleanup audio on unmount
    return () => {
      if (printerAudio) {
        printerAudio.context.close()
        printerAudio = undefined
      }
      if (linefeedAudio) {
        linefeedAudio.context.close()
        linefeedAudio = undefined
      }
    }
  }, [canvas])

  const setPrinting = () => {
    // Start audio on first call or if it was previously stopped
    if (printingTimeout === 0) {
      // Always restart audio and reset timer for a new print job
      if (printerAudio) {
        printerAudio.context.close()
        printerAudio = undefined
      }
      playPrinterAudio()
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
        if (printerAudio) {
          printerAudio.context.close()
          printerAudio = undefined
        }
        if (overallPrintTime > 1) {
          playLinefeedAudio()
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
