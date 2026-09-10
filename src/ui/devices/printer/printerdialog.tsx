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
import { getPreferencePageLength, getPreferencePrinterDialogPosition, setPreferencePrinterDialogPosition } from "../../localstorage"
import { PrinterDialogConfig } from "./printerdialog_config"
import { useTranslation } from "../../../i18n/useTranslation"

export interface PageImageProps {
  imageData: string,
  pageLength: number,
  altText: string
}

const PageImage = (props: PageImageProps) => {
  return <div className="printer-paper" style={{ marginBottom: "0px", borderBottom: "2px dashed #999", paddingBottom: "10px" }}>
    <img 
      src={props.imageData}
      alt={props.altText}
      className="printer-canvas"
      style={{ width: `${1224 / 2.5}px`, height: `${props.pageLength * 144 / 2.5}px` }}
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
  const { t } = useTranslation()
  const dialogRef = useRef<HTMLDivElement>(null)
  const dragOffsetRef = useRef([0, 0])
  const dragPositionRef = useRef<[number, number] | null>(null)
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

  const handlePointerDown = (event: React.PointerEvent<HTMLDivElement>) => {
    if (!dialogRef.current || event.button !== 0 || (event.target as Element).closest("button")) return
    event.preventDefault()
    event.stopPropagation()
    event.currentTarget.setPointerCapture(event.pointerId)
    dragOffsetRef.current = [
      event.clientX - dialogRef.current.offsetLeft,
      event.clientY - dialogRef.current.offsetTop,
    ]
    dragPositionRef.current = [dialogPositionX, dialogPositionY]
    setDragging(true)
  }

  const handlePointerMove = (event: React.PointerEvent<HTMLDivElement>) => {
    if (!event.currentTarget.hasPointerCapture(event.pointerId) || !dialogRef.current) return
    event.preventDefault()
    event.stopPropagation()
    const left = event.clientX - dragOffsetRef.current[0]
    const top = event.clientY - dragOffsetRef.current[1]
    dragPositionRef.current = [left, top]
    dialogRef.current.style.left = `${left}px`
    dialogRef.current.style.top = `${top}px`
  }

  const handlePointerUp = (event: React.PointerEvent<HTMLDivElement>) => {
    if (!event.currentTarget.hasPointerCapture(event.pointerId)) return
    event.currentTarget.releasePointerCapture(event.pointerId)
    const position = dragPositionRef.current
    if (position) {
      setDialogPositionX(position[0])
      setDialogPositionY(position[1])
      setPreferencePrinterDialogPosition({ x: position[0], y: position[1] })
    }
    dragPositionRef.current = null
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

  const pageLength = getPreferencePageLength()

  return (
    <div
      className="printer-dialog-host"
      tabIndex={0} // Make the div focusable
      style={{ cursor: dragging ? "move" : "default" }}>
      <div className="floating-dialog flex-column"
        ref={dialogRef}
        style={{
          left: `${Math.max(1, dialogPositionX)}px`, top: `${Math.max(1, dialogPositionY)}px`,
        }}
        onClick={(e) => e.stopPropagation()}>
        <div className="flex-column">
          <div className="flex-row-space-between flexwrap printer-controls"
            onPointerCancel={handlePointerUp}
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
            style={{ touchAction: "none" }}>
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
              <PrinterDialogConfig printer={props.printer} />
              <button className="push-button"
                style={{ color: `${buttonColor}` }}
                title={t("print.dumpScreen")}
                onClick={async () => {
                  await imagewriterDumpScreen()
                }}>
                <FontAwesomeIcon icon={faCamera} />
              </button>
              <button className="push-button"
                style={{ color: `${buttonColor}` }}
                title={t("print.dumpScreenInverse")}
                onClick={async () => {
                  await imagewriterDumpScreen(true)
                }}>
                <FontAwesomeIcon icon={faCamera} style={{ color: "#ffffff" }} />
              </button>
              <button className="push-button"
                disabled={!hasPrinterData}
                style={{ color: `${buttonColor}` }}
                title={t("print.sendToPrinter")}
                onClick={handlePrint}>
                <FontAwesomeIcon icon={faPrint} />
              </button>
              <button className="push-button"
                disabled={!hasPrinterData}
                style={{ color: `${buttonColor}` }}
                title={t("print.tearOff")}
                onClick={handleClear}>
                <FontAwesomeIcon icon={faTrashCan} />
              </button>
              <button className="push-button"
                style={{ color: `${buttonColor}` }}
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
              <PageImage key={index} imageData={pageData} pageLength={pageLength} altText={t("print.printedPage")} />
            ))}
            {(props.printer.hasRenderedData() || !props.printer.hasData()) && <CopyCanvas srcCanvas={props.canvas} pageLength={pageLength} />}
          </div>
        </div>
      </div>
    </div>
  )
}

export default PrinterDialog
