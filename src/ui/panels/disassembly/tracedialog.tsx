import React, { useEffect, useRef, useState } from "react"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import {
  faXmark,
  faSave,
  faCog,
  faPause,
  faPlay,
} from "@fortawesome/free-solid-svg-icons"
import { RUN_MODE } from "../../../common/utility"
import { handleGetRunMode, handleGetTracelog, passSetCyclesToRun } from "../../main2worker"
import TraceSettingsDialog from "./tracesettingsdialog"
import { handleSetCPUState } from "../../controller"
import EditField from "../editfield"

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
  const [showSettings, setShowSettings] = useState(false)
  const [cyclesToRun, setCyclesToRun] = useState(0)
  

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

  const handleDownloadButtonClick = async (tracelog: string[]) => {
    const text = [header, ...tracelog].join("\n")
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

  const doSetCyclesToRun = (value: string) => {
    let numValue = parseInt(value)
    if (isNaN(numValue) || numValue < 1) {
      numValue = 0
    }
    setCyclesToRun(numValue)
  }

  const doGetCyclesToRun = () => {
    if (cyclesToRun < 1) {
      return ""
    }
    return cyclesToRun.toString()
  }

  const runMode = handleGetRunMode()
  const currentTracelog = handleGetTracelog()

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
          zIndex: 500,  // above most stuff but not modal dialogs
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
        <div className="flex-row-space-between"
          style={{ padding: "0.5em", paddingTop: 0 }}>
          <div className="flex-row">
          <button
            className="push-button"
            title={"Download Trace Log"}
            disabled={currentTracelog.length === 0}
            onClick={() => handleDownloadButtonClick(currentTracelog)}>
              <FontAwesomeIcon icon={faSave} />
          </button>
          <button className="push-button" id="tour-debug-pause"
            title={runMode === RUN_MODE.PAUSED ? "Run" : "Pause"}
            onClick={() => {
              if (runMode === RUN_MODE.PAUSED) {
                passSetCyclesToRun(cyclesToRun)
              }
              handleSetCPUState(runMode === RUN_MODE.PAUSED ?
                RUN_MODE.RUNNING : RUN_MODE.PAUSED)
            }}
            disabled={runMode === RUN_MODE.IDLE}>
            {runMode === RUN_MODE.PAUSED ?
              <FontAwesomeIcon icon={faPlay} /> :
              <FontAwesomeIcon icon={faPause} />}
          </button>
          <EditField
            value={doGetCyclesToRun()}
            setValue={doSetCyclesToRun}
            isNumber={true}
            placeholder="Unlimited"
            showSuggestions={false}
            width="6em" />
          <span className="bigger-font" style={{ alignSelf: "center" }}>&nbsp;cycles</span>
          </div>
          <button className="push-button"
            title="Settings"
            onClick={() => setShowSettings(true)}
            disabled={runMode !== RUN_MODE.PAUSED}>
            <div className="icon-container">
              <FontAwesomeIcon icon={faCog} />
            </div>
          </button>
          {showSettings &&
            <TraceSettingsDialog
              onClose={() => setShowSettings(false)} />
          }
        </div>
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
                fontSize: "0.7em",
                color: runMode === RUN_MODE.RUNNING ? "gray" : undefined,
              }}>
              {currentTracelog.join("\n")}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default TraceDialog
