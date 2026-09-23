import React, { useEffect, useRef, useState } from "react"
import { toHex } from "../../../common/utility"
import { faXmark } from "@fortawesome/free-solid-svg-icons"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"

const MAGNIFIER_ZOOM = 8
const MAGNIFIER_WIDTH = 512
const MAGNIFIER_HEIGHT = 512
const BASE_HEATMAP_WIDTH = 256
const BASE_HEATMAP_HEIGHT = 256

let heatMapAddress = -1

const HeatMapMagnifier = (props: {
  heatCanvas: React.RefObject<HTMLCanvasElement | null>,
  heatMapValue: number,
  setHeatMapAddress: (address: number) => void,
  closeDialog: () => void,
  dialogPositionX: number,
  dialogPositionY: number,
  setDialogPosition: (x: number, y: number) => void
}) => {
  const dialogRef = useRef<HTMLDivElement>(null)
  const [offset, setOffset] = useState([0, 0])
  const [dragging, setDragging] = useState(false)
  const magnifierCanvasRef = useRef<HTMLCanvasElement>(null)
  const magnifierScrollRef = useRef<HTMLDivElement>(null)
  const [mousePos, setMousePos] = useState<{ x: number, y: number }>({ x: -1, y: -1 })

  const handleMouseDown = (e: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
    if (dialogRef.current) {
      setDragging(true)
      const div = dialogRef.current as HTMLDivElement
      // Offset of the mouse down event within the dialog title bar.
      // This way we drag the window from where the user clicked.
      setOffset([e.clientX - div.offsetLeft, e.clientY - div.offsetTop])
    }
  }

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
    if (dragging && dialogRef.current) {
      const div = dialogRef.current as HTMLDivElement
      const left = e.clientX - offset[0]
      const top = e.clientY - offset[1]
      props.setDialogPosition(left, top)
      div.style.left = `${left}px`
      div.style.top = `${top}px`
    }
  }

  const handleMouseUp = () => {
    setDragging(false)
  }

  const handleCodeMouseMove = (event: React.MouseEvent<HTMLCanvasElement>) => {
    if (!magnifierCanvasRef.current || !props.heatCanvas.current) return
    const canvas = magnifierCanvasRef.current
    const rect = canvas.getBoundingClientRect()
    const x = event.clientX - rect.left + canvas.scrollLeft
    const y = event.clientY - rect.top + canvas.scrollTop
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

  useEffect(() => {
    if (!magnifierCanvasRef.current || !props.heatCanvas.current || !magnifierScrollRef.current) return
    const heatCanvas = props.heatCanvas.current
    const magnifierCanvas = magnifierCanvasRef.current
    const magnifierCtx = magnifierCanvas?.getContext("2d")
    if (!magnifierCtx) return

    magnifierCtx.clearRect(0, 0, magnifierCanvas.width, magnifierCanvas.height)
    magnifierCtx.imageSmoothingEnabled = false
    magnifierCtx.drawImage(heatCanvas, 0, 0, magnifierCanvas.width, magnifierCanvas.height)
    if (heatMapAddress >= 0) {
      const heatmapInfo = `$${toHex(heatMapAddress, 4)} = ${props.heatMapValue}`
      magnifierCtx.font = "14px monospace"
      magnifierCtx.fillStyle = "#ffff00"
      // const rect = magnifierCanvas.getBoundingClientRect()
      const visibleY = mousePos.y - magnifierScrollRef.current.scrollTop
      const labelWidth = heatmapInfo.length * 6
      const rightEdge = magnifierScrollRef.current.scrollLeft + magnifierScrollRef.current.clientWidth
      const labelX = Math.min(mousePos.x, rightEdge - labelWidth - 4)
      const labelY = visibleY > 20 ? mousePos.y - 10 : mousePos.y + 30
      magnifierCtx.fillText(heatmapInfo, labelX, labelY)
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
      onMouseDown={(e) => handleMouseDown(e)}
      onMouseMove={(e) => handleMouseMove(e)}
      onMouseUp={handleMouseUp}>
      <div className="dialog-title">Heat Map</div>
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
      }}
    >
      <canvas
        ref={magnifierCanvasRef}
        width={MAGNIFIER_ZOOM * 256}
        height={MAGNIFIER_ZOOM * 256}
        onMouseMove={handleCodeMouseMove}
        style={{ display: "block", imageRendering: "pixelated" }}
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