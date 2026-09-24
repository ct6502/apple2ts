import React, { useEffect, useRef, useState } from "react"
import { toHex } from "../../../common/utility"
import { faBolt, faMountain, faXmark } from "@fortawesome/free-solid-svg-icons"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { getDisassembly } from "../disassembly/disassembly_utilities"
import { handleGetState6502 } from "../../main2worker"
import { HEATMAP_STATE } from "./heatmap_panel"

const MAGNIFIER_ZOOM = 8
const MAGNIFIER_WIDTH = 512
const MAGNIFIER_HEIGHT = 512
const BASE_HEATMAP_WIDTH = 256
const BASE_HEATMAP_HEIGHT = 256

let heatMapAddress = -1

const HeatMapMagnifier = (props: {
  state: HEATMAP_STATE,
  heatCanvas: React.RefObject<HTMLCanvasElement | null>,
  heatMapValue: number,
  maxIndex: number,
  setHeatMapAddress: (address: number) => void,
  heatMapPosition: [number, number],
  setHeatMapPosition: (x: number, y: number) => void
  closeDialog: () => void,
  dialogPositionX: number,
  dialogPositionY: number,
  setDialogPosition: (x: number, y: number) => void,
}) => {
  const dialogRef = useRef<HTMLDivElement>(null)
  const [offset, setOffset] = useState([0, 0])
  const [dragging, setDragging] = useState(false)
  const magnifierCanvasRef = useRef<HTMLCanvasElement>(null)
  const magnifierScrollRef = useRef<HTMLDivElement>(null)
  const [mousePos, setMousePos] = useState<{ x: number, y: number }>({ x: -1, y: -1 })

  const handleTitleBarMouseDown = (e: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
    if (dialogRef.current) {
      setDragging(true)
      const div = dialogRef.current as HTMLDivElement
      // Offset of the mouse down event within the dialog title bar.
      // This way we drag the window from where the user clicked.
      setOffset([e.clientX - div.offsetLeft, e.clientY - div.offsetTop])
    }
  }

  const handleTitleBarMouseMove = (e: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
    if (dragging && dialogRef.current) {
      const div = dialogRef.current as HTMLDivElement
      const left = e.clientX - offset[0]
      const top = e.clientY - offset[1]
      props.setDialogPosition(left, top)
      div.style.left = `${left}px`
      div.style.top = `${top}px`
    }
  }

  const handleTitleBarMouseUp = () => {
    setDragging(false)
  }

  const handleHeatMapMouseMove = (event: React.MouseEvent<HTMLCanvasElement>) => {
    if (!magnifierCanvasRef.current || !props.heatCanvas.current) return
    const canvas = magnifierCanvasRef.current
    const rect = canvas.getBoundingClientRect()
    const x = event.clientX - rect.left + canvas.scrollLeft - 2
    const y = event.clientY - rect.top + canvas.scrollTop - 2
    const magnifierX = Math.max(0, Math.min(x, canvas.width - 1))
    const magnifierY = Math.max(0, Math.min(y, canvas.height - 1))
    const next = { x: magnifierX, y: magnifierY }
    if (mousePos.x === next.x && mousePos.y === next.y) return
    setMousePos(next)
    const sourceX = Math.max(0, Math.min(Math.floor(mousePos.x / MAGNIFIER_ZOOM), BASE_HEATMAP_WIDTH - 1))
    const sourceY = Math.max(0, Math.min(Math.floor(mousePos.y / MAGNIFIER_ZOOM), BASE_HEATMAP_HEIGHT - 1))
    const addrY = Math.max(0, Math.min(sourceY * BASE_HEATMAP_WIDTH, 0xFFFF))
    const addrX = Math.max(0, Math.min(sourceX, BASE_HEATMAP_WIDTH - 1))
    heatMapAddress = addrY + addrX
    props.setHeatMapAddress(heatMapAddress)
  }

  // Auto scroll the magnifier to center on the heat map position when it changes
  useEffect(() => {
    if (!magnifierScrollRef.current) return
    if (props.heatMapPosition[0] >= 0 && props.heatMapPosition[1] >= 0) {
      magnifierScrollRef.current.scrollLeft = MAGNIFIER_ZOOM * props.heatMapPosition[0] - MAGNIFIER_WIDTH / 2
      magnifierScrollRef.current.scrollTop = MAGNIFIER_ZOOM * props.heatMapPosition[1] - MAGNIFIER_HEIGHT / 2
      props.setHeatMapPosition(-1, -1)
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [props.heatMapPosition, props.setHeatMapPosition])

  useEffect(() => {
    if (!magnifierCanvasRef.current || !props.heatCanvas.current || !magnifierScrollRef.current) return
    const heatCanvas = props.heatCanvas.current
    const magnifierCanvas = magnifierCanvasRef.current
    const magnifierCtx = magnifierCanvas?.getContext("2d")
    if (!magnifierCtx) return

    magnifierCtx.clearRect(0, 0, magnifierCanvas.width, magnifierCanvas.height)
    magnifierCtx.imageSmoothingEnabled = false
    magnifierCtx.drawImage(heatCanvas, 0, 0, magnifierCanvas.width, magnifierCanvas.height)
    // Draw a grid of thin lines, every $1000 in vertical direction, every $20 in horizontal direction
    for (let i = 0; i < MAGNIFIER_ZOOM * 256; i += MAGNIFIER_ZOOM * 16) {
      magnifierCtx.beginPath()
      magnifierCtx.moveTo(i, 0)
      magnifierCtx.lineTo(i, MAGNIFIER_ZOOM * 256)
      magnifierCtx.strokeStyle = "rgb(255, 255, 255)"
      magnifierCtx.lineWidth = 0.5
      magnifierCtx.stroke()
    }
    for (let j = 0; j < MAGNIFIER_ZOOM * 256; j += MAGNIFIER_ZOOM * 16) {
      magnifierCtx.beginPath()
      magnifierCtx.moveTo(0, j)
      magnifierCtx.lineTo(MAGNIFIER_ZOOM * 256, j)
      magnifierCtx.strokeStyle = "rgb(255, 255, 255)"
      magnifierCtx.lineWidth = 0.5
      magnifierCtx.stroke()
    }
    if (heatMapAddress >= 0) {
      const heatmapInfo = `$${toHex(heatMapAddress, 4)} = ${props.heatMapValue}`
      const visibleY = mousePos.y - magnifierScrollRef.current.scrollTop
      const labelWidth = heatmapInfo.length * 8
      const rightEdge = magnifierScrollRef.current.scrollLeft + magnifierScrollRef.current.clientWidth
      const labelX = Math.min(mousePos.x, rightEdge - labelWidth - 5)
      const labelY = visibleY > 20 ? mousePos.y - 10 : mousePos.y + 35
      magnifierCtx.font = "14px monospace"
      magnifierCtx.fillStyle = "#ffff00"
      magnifierCtx.fillText(heatmapInfo, labelX, labelY)

      // Add in the local assembly code if CPU heatmap
      if (props.state === HEATMAP_STATE.CPU) {
        const disassembly = getDisassembly(heatMapAddress - 15, heatMapAddress + 15).split("\n")
        const leftEdge = magnifierScrollRef.current.scrollLeft
        const topEdge = magnifierScrollRef.current.scrollTop
        magnifierCtx.fillStyle = "#ffff00"
        const addresses = disassembly.map(line => parseInt(line, 16))
        addresses.push(0xFFFF)
        for (let i = 0; i < disassembly.length; i++) {
          const hit = addresses[i] <= heatMapAddress && addresses[i + 1] > heatMapAddress
          magnifierCtx.font = hit ? "bold 11px monospace" : "11px monospace"
          const xtra = hit ? "*" : " "
          magnifierCtx.fillText(xtra + disassembly[i], leftEdge + 5, topEdge + 10 + i * 12)
        }
      }
    }
  })

  return (
    <div className="floating-dialog flex-column"
      ref={dialogRef}
      style={{
        left: `${props.dialogPositionX}px`, top: `${props.dialogPositionY}px`,
      }}
    >
    <div className="flex-row-space-between"
      onMouseDown={(e) => handleTitleBarMouseDown(e)}
      onMouseMove={(e) => handleTitleBarMouseMove(e)}
      onMouseUp={handleTitleBarMouseUp}>
      <div className="flex-row" style={{ marginLeft: "5px" }}>
        <button className="push-button"
          title="Jump to current program counter"
          onClick={() => {
            const addr = handleGetState6502().PC
            props.setHeatMapPosition(addr & 0xFF, addr >> 8)
          }}>
          <FontAwesomeIcon icon={faBolt} style={{ fontSize: "0.8em" }} />
        </button>
        <button className="push-button"
          title="Jump to maximum heatmap value"
          onClick={() => {
            const addr = props.maxIndex
            props.setHeatMapPosition(addr & 0xFF, addr >> 8)
          }}>
          <FontAwesomeIcon icon={faMountain} style={{ fontSize: "0.8em" }} />
        </button>
      </div>
      <button className="push-button"
        onClick={props.closeDialog}>
        <FontAwesomeIcon icon={faXmark} style={{ fontSize: "0.8em" }} />
      </button>
    </div>
    <div
      ref={magnifierScrollRef}
      style={{
        width: MAGNIFIER_WIDTH,
        height: MAGNIFIER_HEIGHT,
        overflow: "auto",
        overscrollBehavior: "none",
      }}
    >
      <canvas
        ref={magnifierCanvasRef}
        width={MAGNIFIER_ZOOM * 256}
        height={MAGNIFIER_ZOOM * 256}
        onMouseMove={handleHeatMapMouseMove}
        style={{ display: "block", imageRendering: "auto" }}
      />
      {/* <canvas
        ref={magnifierAddressRef}
        width={MAGNIFIER_LABEL_WIDTH}
        height={MAGNIFIER_HEIGHT}
        style={{ borderRight: "1px solid rgba(0, 0, 0, 0.4)" }}
      /> */}
    </div>
    </div>
  )
}

export default HeatMapMagnifier