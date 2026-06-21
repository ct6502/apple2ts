import React, { useEffect, useState, useRef } from "react"
import "./printer.css"
import { Printer } from "./iwii"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import {
  faFolderOpen,
  faPrint,
  faSave,
  faTrash,
  faXmark
} from "@fortawesome/free-solid-svg-icons"
import { imagewriter2 } from "./imagewriter2"
export interface CopyCanvasProps {
  srcCanvas: HTMLCanvasElement
}

const CopyCanvas = (props: CopyCanvasProps) => {

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { srcCanvas, ...rest } = props
  const canvasRef = useRef<HTMLCanvasElement>(null)
  // these dimensions represent a max dpi page
  const width = 1360
  const height = 1584
  const marginx = 0
  const marginy = 0

  useEffect(() => {
    let intervalId = 0

    const render = () => {
      if (canvasRef.current) {
        const destCanvas = canvasRef.current
        const destContext: CanvasRenderingContext2D | null = destCanvas.getContext("2d")
        // copy internal canvas over the other one
        if (destContext) {
          //copy the data, scale if necessary
          destContext?.drawImage(props.srcCanvas, marginx, marginy, width - 2 * marginx, height - 2 * marginy)
        } else {
          console.log("destinationCtx is NULL!")
        }
      } else {
        console.log("canvasRef.current is NULL!")
      }

      intervalId = window.requestAnimationFrame(render)
    }
    render()

    return () => {
      window.cancelAnimationFrame(intervalId)
    }
  }, [canvasRef, props.srcCanvas, height, width])

  return <div className="printer-paper">
      <canvas ref={canvasRef} {...rest}
        className="printer-canvas"
        style={{ width: "540px", height: "700px" }}
        hidden={false}
        width={width} height={height} />
    </div>
}

export interface PrinterDialogProps {
  open: boolean;
  onClose: () => void;
  canvas: HTMLCanvasElement
  printer: Printer;
}

const PrinterDialog = (props: PrinterDialogProps) => {
  const { open, onClose } = props
  const [state] = useState({
    canvasRef: React.createRef<HTMLCanvasElement>()
  })

  const handleClose = () => {
    onClose()
  }

  const handlePrint = () => {
    props.printer.print()
  }

  const handleClear = () => {
    props.printer.reset()
  }

  const handleSaveData = () => {
    props.printer.save()
  }

  const handleLoadData = () => {
    props.printer.load()
  }

  useEffect(() => {
    return () => { }
  }, [state.canvasRef, props.canvas])

  const buttonColor = "#404040"


  {/* <Dialog onClose={handleClose} open={open}> */ }
  if (!open) return (<></>)

  const hasPrinterData = props.printer.hasData()

  return (
    <div className="modal-overlay">
      <div className="floating-dialog flex-column"
        onClick={(e) => e.stopPropagation()}
        style={{ left: "5%", top: "5%", backgroundColor: "var(--panel-background)" }}>
        <div className="flex-column">
          <div className="flex-row-space-between flexwrap printer-controls">
            <svg height="28" width="120" style={{ marginLeft: "15px" }}>{imagewriter2}</svg>
            <div className="flex-row">
              <button className="push-button"
                disabled={!hasPrinterData}
                style={{ color: `${buttonColor}` }}
                title="Save Stored Data"
                onClick={handleSaveData}>
                <FontAwesomeIcon icon={faSave} />
              </button>
              <button className="push-button"
                style={{ color: `${buttonColor}` }}
                title="Reprint from Stored Data"
                onClick={handleLoadData}>
                <FontAwesomeIcon icon={faFolderOpen} />
              </button>
              <button className="push-button"
                disabled={!hasPrinterData}
                style={{ color: `${buttonColor}` }}
                title="Send to Printer"
                onClick={handlePrint}>
                <FontAwesomeIcon icon={faPrint} />
              </button>
              <button className="push-button"
                disabled={!hasPrinterData}
                style={{ color: `${buttonColor}` }}
                title="Tear off Page and Reset"
                onClick={handleClear}>
                <FontAwesomeIcon icon={faTrash} />
              </button>
              <button className="push-button"
                style={{ color: `${buttonColor}` }}
                title="Close Dialog"
                onClick={handleClose}>
                <FontAwesomeIcon icon={faXmark} />
              </button>
            </div>
          </div>

          <CopyCanvas srcCanvas={props.canvas} />
        </div>
      </div>
    </div>
  )
}

export default PrinterDialog
