import React, { useEffect, useState, useRef } from "react"
import "./printer.css"
import { Printer } from "./iwii"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import {
  faCamera,
  faPrint,
  faTrashCan,
  faXmark
} from "@fortawesome/free-solid-svg-icons"
import { imagewriter2 } from "./imagewriter2"
import { imagewriterDumpScreen } from "./imagewriterdumpscreen"
import { CopyCanvas } from "./copycanvas"
import { getPreferencePrinterDialogPosition, setPreferencePrinterDialogPosition } from "../../localstorage"

export interface PageImageProps {
  imageData: string
}

const PageImage = (props: PageImageProps) => {
  return <div className="printer-paper" style={{ marginBottom: "0px", borderBottom: "2px dashed #999", paddingBottom: "10px" }}>
    <img 
      src={props.imageData}
      alt="Printed page"
      className="printer-canvas"
      style={{ width: "540px", height: "700px" }}
    />
  </div>
}

export interface PrinterDialogProps {
  open: boolean;
  onClose: () => void;
  canvas: HTMLCanvasElement
  printer: Printer;
}

const PrinterDialog = (props: PrinterDialogProps) => {
  const { open } = props
  const dialogRef = useRef<HTMLDivElement>(null)
  const [offset, setOffset] = useState([0, 0])
  const [dragging, setDragging] = useState(false)
  const printerDialogPosition = getPreferencePrinterDialogPosition()
  const [dialogPositionX, setDialogPositionX] = useState(printerDialogPosition.x < 0 ? window.outerWidth / 2 - 275 : printerDialogPosition.x)
  const [dialogPositionY, setDialogPositionY] = useState(printerDialogPosition.y < 0 ? window.outerHeight / 2 - 400 : printerDialogPosition.y)
  const [, setPageCount] = useState(0)

  // Update page count to trigger re-renders when pages change
  useEffect(() => {
    if (!open) return
    const interval = setInterval(() => {
      setPageCount(props.printer.getPages().length)
    }, 100)
    return () => clearInterval(interval)
  }, [open, props.printer])

  const setDialogPosition = (x: number, y: number) => {
    setDialogPositionX(x)
    setDialogPositionY(y)
    // Save the position to local storage
    setPreferencePrinterDialogPosition({ x, y })
  }

  const handleMouseDown = (e: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
    if (dialogRef.current) {
      e.preventDefault() // Prevent text selection
      setDragging(true)
      const div = dialogRef.current as HTMLDivElement
      // Offset of the mouse down event within the dialog title bar.
      // This way we drag the window from where the user clicked.
      setOffset([e.clientX - div.offsetLeft, e.clientY - div.offsetTop])
    }
  }

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
    if (dragging && dialogRef.current) {
      e.preventDefault() // Prevent text selection
      const div = dialogRef.current as HTMLDivElement
      const left = e.clientX - offset[0]
      const top = e.clientY - offset[1]
      setDialogPosition(left, top)
      div.style.left = `${left}px`
      div.style.top = `${top}px`
    }
  }

  const handleMouseUp = () => {
    setDragging(false)
  }

  const handlePrint = () => {
    props.printer.print()
    props.onClose()
  }

  const handleClear = () => {
    props.printer.reset()
  }

  const buttonColor = "#404040"


  {/* <Dialog onClose={handleClose} open={open}> */ }
  if (!open) return (<></>)

  const hasPrinterData = props.printer.hasData()

  return (
    <div
      tabIndex={0} // Make the div focusable
      onMouseMove={(e) => handleMouseMove(e)}
      onMouseUp={handleMouseUp}
      style={{
        cursor: dragging ? "move" : "default",
        ...(dragging && {
          position: "fixed",
          top: 0,
          left: 0,
          width: "100vw",
          height: "100vh",
          zIndex: 9999,
        }),
      }}
      >
      <div className="floating-dialog flex-column"
        ref={dialogRef}
        style={{
          left: `${Math.max(1, dialogPositionX)}px`, top: `${Math.max(1, dialogPositionY)}px`,
        }}
        onClick={(e) => e.stopPropagation()}>
        <div className="flex-column">
          <div className="flex-row-space-between flexwrap printer-controls"
            onMouseDown={(e) => handleMouseDown(e)}
            onMouseMove={(e) => handleMouseMove(e)}
            onMouseUp={handleMouseUp}>
            <svg height="28" width="120" style={{ marginLeft: "15px" }}>{imagewriter2}</svg>
            <div className="flex-row">
              {/* <button className="push-button"
                disabled={!hasPrinterData}
                style={{ color: `${buttonColor}` }}
                title="Save Stored Data"
                onClick={props.printer.save()}>
                <FontAwesomeIcon icon={faSave} />
              </button>
              <button className="push-button"
                style={{ color: `${buttonColor}` }}
                title="Reprint from Stored Data"
                onClick={props.printer.load()}>
                <FontAwesomeIcon icon={faFolderOpen} />
              </button> */}
              <button className="push-button"
                style={{ color: `${buttonColor}` }}
                title="Dump Current Screen to Printer"
                onClick={async () => {
                  await imagewriterDumpScreen()
                }}>
                <FontAwesomeIcon icon={faCamera} />
              </button>
              <button className="push-button"
                style={{ color: `${buttonColor}` }}
                title="Dump Current Screen (Inverse)"
                onClick={async () => {
                  await imagewriterDumpScreen(true)
                }}>
                <FontAwesomeIcon icon={faCamera} style={{ color: "#ffffff" }} />
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
                <FontAwesomeIcon icon={faTrashCan} />
              </button>
              <button className="push-button"
                style={{ color: `${buttonColor}` }}
                title="Close Dialog"
                onClick={() => props.onClose()}>
                <FontAwesomeIcon icon={faXmark} />
              </button>
            </div>
          </div>

          <div style={{ 
            maxHeight: "730px", 
            overflowY: "auto",
            overflowX: "hidden",
            padding: "10px"
          }}>
            {props.printer.getPages().map((pageData, index) => (
              <PageImage key={index} imageData={pageData} />
            ))}
            <CopyCanvas srcCanvas={props.canvas} />
          </div>
        </div>
      </div>
    </div>
  )
}

export default PrinterDialog
