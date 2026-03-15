import React, { useEffect, useRef, useState } from "react"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import {
  faRoute,
  faXmark,
  faSave,
} from "@fortawesome/free-solid-svg-icons"
import { RUN_MODE } from "../../../common/utility"
import { handleGetRunMode, handleGetTracelog, handleGetTracing, passSetTracing } from "../../main2worker"

const width = 400
const height = 600
const header = " Cycle     PC            Instruction     A   X   Y   S   P   NVBDIZC"

const TraceDialog = (props: {
  cancelDialog: () => void,
  dialogPositionX: number,
  dialogPositionY: number,
  setDialogPosition: (x: number, y: number) => void
}) => {
  const { dialogPositionX, dialogPositionY, setDialogPosition } = props
  const dialogRef = useRef<HTMLDivElement>(null)
  const traceLogRef = useRef<HTMLDivElement>(null)
  const previousLastLineRef = useRef("")
  const [offset, setOffset] = useState([0, 0])
  const [dragging, setDragging] = useState(false)
  const [tracing, setTracing] = useState(handleGetTracing())

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
      div.style.left = `${left}px`
      div.style.top = `${top}px`
    }
  }

  const handleMouseUp = () => {
    if (dragging && dialogRef.current) {
      const div = dialogRef.current as HTMLDivElement
      // Save the final position to parent state
      setDialogPosition(parseInt(div.style.left), parseInt(div.style.top))
    }
    setDragging(false)
  }

  const handleDownloadButtonClick = async () => {
    const text = [header, ...handleGetTracelog()].join("\n")
    const blob = new Blob([text], { type: "text/plain" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    const now = new Date()
    const datetime = [
      now.getFullYear(),
      String(now.getMonth() + 1).padStart(2, "0"),
      String(now.getDate()).padStart(2, "0"),
      String(now.getHours()).padStart(2, "0"),
      String(now.getMinutes()).padStart(2, "0"),
      String(now.getSeconds()).padStart(2, "0")
    ].join("_")
    a.download = `trace_${datetime}.txt`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  useEffect(() => {
    if (dialogPositionX === -1) {
      setDialogPosition(window.outerWidth - width - 10, 100)
    }
  }, [dialogPositionX, setDialogPosition])

  useEffect(() => {
    const traceLog = handleGetTracelog()
    const currentLastLine = traceLog.length > 0 ? traceLog[traceLog.length - 1] : ""
    if (traceLogRef.current && currentLastLine !== previousLastLineRef.current) {
      setTimeout(() => {
        if (traceLogRef.current) {
          traceLogRef.current.scrollTop = traceLogRef.current.scrollHeight
        }
      }, 50)
      previousLastLineRef.current = currentLastLine
    }
  })

  const runMode = handleGetRunMode()
  
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
          left: `${dialogPositionX}px`, top: `${dialogPositionY}px`,
          opacity: 0.95,
        }}
      >
        <div className="flex-column">
          <div className="flex-row-space-between"
            onMouseDown={(e) => handleMouseDown(e)}
            style={{ cursor: "move" }}>
            <div className="dialog-title">Trace</div>
            <button className="push-button"
              onClick={props.cancelDialog}>
              <FontAwesomeIcon icon={faXmark} style={{ fontSize: "0.8em" }} />
            </button>
          </div>
          <div className="horiz-rule"></div>
        </div>
        <span className="flex-row" style={{ marginLeft: "5px", marginBottom: "5px" }}>
          <button
            className={`push-button ${tracing ? "button-active" : ""}`}
            title={`Tracing (${tracing ? "on" : "off"})`}
            onClick={() => {
              const isTracing = tracing
              setTracing(!isTracing)
              passSetTracing(!isTracing)
            }}
            disabled={runMode === RUN_MODE.IDLE}>
              <FontAwesomeIcon icon={faRoute} />
          </button>
          <button
            className="push-button"
            title={"Download Trace Log"}
            onClick={handleDownloadButtonClick}>
              <FontAwesomeIcon icon={faSave} />
          </button>
        </span>
        <div className="flex-column">
          <div style={{width: `${width}px`, height: `${height}px`}}>
            <div className="debug-panel mono-text thin-border"
              style={{
                overflow: "auto",
                paddingLeft: "5pt",
                fontSize: "0.7em",
                fontWeight: "bold",
              }}>
              {header}
            </div>
            <div className="debug-panel mono-text thin-border"
              ref={traceLogRef}
              style={{
                height: `${height - 30}px`,
                overflow: "auto",
                paddingLeft: "5pt",
                fontSize: "0.7em"
              }}>
              {handleGetTracelog().map((line, index) => (
                <div key={index}>{line}</div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default TraceDialog
