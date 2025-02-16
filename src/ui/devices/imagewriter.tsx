import { useEffect, useState } from "react"
import iwiion from "./img/iwiion.png"
import iwiioff from "./img/iwiioff.png"
import PrinterDialog from "./printerdialog"
import { ImageWriterII, registerSetPrinting } from "./iwii"

const ImageWriter = () => {
  const [open, setOpen] = useState(false)
  const [printingTimeout, setPrintingTimeout] = useState(0)
  const [canvas] = useState(document.createElement("canvas"))

  useEffect(() => {
    ImageWriterII.startup(canvas)
  }, [canvas])

  const setPrinting = () => {
    if (printingTimeout !== 0) {
      clearTimeout(printingTimeout)
    }
    const timeout = window.setTimeout(() => {
      setPrintingTimeout(0)
    }, 1000)
    setPrintingTimeout(timeout)
  }

  registerSetPrinting(setPrinting)
  const img1 = printingTimeout ? iwiion : iwiioff

  return (
    <span className="flex-column">
      <img className="disk-image"
        style={{ borderWidth: 0 }}
        src={img1} alt="iwii"
        title="ImageWriter II"
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
