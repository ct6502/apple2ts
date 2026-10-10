import React, { useEffect, useRef, useState } from "react"
import { HEATMAP_STATE, toHex } from "../../../common/utility"
import { faMountain, faXmark } from "@fortawesome/free-solid-svg-icons"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { getDisassembly } from "../disassembly/disassembly_utilities"
import { handleGetMemoryAtAddress, handleGetState6502 } from "../../main2worker"
import { useTranslation } from "../../../i18n/useTranslation"

const MAGNIFIER_ZOOM = 8
const MAGNIFIER_WIDTH = 512
const MAGNIFIER_HEIGHT = 512
const BASE_HEATMAP_WIDTH = 256
const BASE_HEATMAP_HEIGHT = 256

const HeatMapMagnifier = (props: {
  state: HEATMAP_STATE,
  heatCanvas: React.RefObject<HTMLCanvasElement | null>,
  heatMapCount: number,
  maxIndex: number,
  heatMapAddress: number,
  setHeatMapAddress: (address: number) => void,
  setMagnifierViewport: (viewport: {x: number, y: number, width: number, height: number} | null) => void,
  heatMapPosition: [number, number],
  setHeatMapPosition: (x: number, y: number) => void
  closeDialog: () => void,
  dialogPositionX: number,
  dialogPositionY: number,
  setDialogPosition: (x: number, y: number) => void,
}) => {
  const { t } = useTranslation()
  const dialogRef = useRef<HTMLDivElement>(null)
  const [offset, setOffset] = useState([0, 0])
  const [dragging, setDragging] = useState(false)
  const magnifierCanvasRef = useRef<HTMLCanvasElement>(null)
  const magnifierScrollRef = useRef<HTMLDivElement>(null)
  const [mousePos, setMousePos] = useState<{ x: number, y: number }>({ x: -1, y: -1 })
  const [mouseClicked, setMouseClicked] = useState(false)

  const updateMagnifierViewport = () => {
    const scroll = magnifierScrollRef.current
    if (!scroll) return
    props.setMagnifierViewport({
      x: scroll.scrollLeft / MAGNIFIER_ZOOM,
      y: scroll.scrollTop / MAGNIFIER_ZOOM,
      width: scroll.clientWidth / MAGNIFIER_ZOOM,
      height: scroll.clientHeight / MAGNIFIER_ZOOM,
    })
  }

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
      e.preventDefault()
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

  const selectAddress = (address: number) => {
    const x = address & 0xFF
    const y = address >>> 8
    props.setHeatMapAddress(address)
    setMouseClicked(true)
    setMousePos({
      x: x * MAGNIFIER_ZOOM + MAGNIFIER_ZOOM / 2,
      y: y * MAGNIFIER_ZOOM + MAGNIFIER_ZOOM / 2,
    })
    props.setHeatMapPosition(x, y)
  }

  const handleHeatMapMouseMove = (event: React.MouseEvent<HTMLCanvasElement>) => {
    if (!magnifierCanvasRef.current || !props.heatCanvas.current) return
    if (mouseClicked) return
    const canvas = magnifierCanvasRef.current
    const rect = canvas.getBoundingClientRect()
    const x = event.clientX - rect.left + canvas.scrollLeft - 2
    const y = event.clientY - rect.top + canvas.scrollTop - 2
    const magnifierX = Math.max(0, Math.min(x, canvas.width - 1))
    const magnifierY = Math.max(0, Math.min(y, canvas.height - 1))
    const next = { x: magnifierX, y: magnifierY }
    if (mousePos.x === next.x && mousePos.y === next.y) return
    setMousePos(next)
    const sourceX = Math.max(0, Math.min(Math.floor(next.x / MAGNIFIER_ZOOM), BASE_HEATMAP_WIDTH - 1))
    const sourceY = Math.max(0, Math.min(Math.floor(next.y / MAGNIFIER_ZOOM), BASE_HEATMAP_HEIGHT - 1))
    const addrY = Math.max(0, Math.min(sourceY * BASE_HEATMAP_WIDTH, 0xFFFF))
    const addrX = Math.max(0, Math.min(sourceX, BASE_HEATMAP_WIDTH - 1))
    props.setHeatMapAddress(addrY + addrX)
  }

  // Auto scroll the magnifier to center on the heat map position when it changes
  useEffect(() => {
    if (!magnifierScrollRef.current) return
    if (props.heatMapPosition[0] >= 0 && props.heatMapPosition[1] >= 0) {
      magnifierScrollRef.current.scrollLeft = MAGNIFIER_ZOOM * props.heatMapPosition[0] - MAGNIFIER_WIDTH / 2
      magnifierScrollRef.current.scrollTop = MAGNIFIER_ZOOM * props.heatMapPosition[1] - MAGNIFIER_HEIGHT / 2
      updateMagnifierViewport()
      props.setHeatMapPosition(-1, -1)
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [props.heatMapPosition, props.setHeatMapPosition])

  useEffect(() => {
    if (!magnifierCanvasRef.current || !props.heatCanvas.current || !magnifierScrollRef.current) return
    if (dragging) return
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
    if (props.heatMapAddress >= 0) {
      const memoryValue = toHex(handleGetMemoryAtAddress(props.heatMapAddress), 2)
      const heatmapInfo = `$${toHex(props.heatMapAddress, 4)}($${memoryValue}) ${t("debug.heatMap.count")}=${props.heatMapCount}`
      const scroll = magnifierScrollRef.current
      const leftEdge = scroll.scrollLeft
      const topEdge = scroll.scrollTop
      const rightEdge = leftEdge + scroll.clientWidth
      const labelWidth = heatmapInfo.length * 8.5
      const labelX = Math.max(leftEdge + 5, Math.min(mousePos.x, rightEdge - labelWidth - 5))
      const labelY = mousePos.y - topEdge > 20 ? mousePos.y - 10 : mousePos.y + 35
      magnifierCtx.font = "14px monospace"
      magnifierCtx.fillStyle = "#ffff00"
      magnifierCtx.fillText(heatmapInfo, labelX, labelY)

      // Draw a small box locked on the pixel address
      magnifierCtx.strokeStyle = "#fff"
      magnifierCtx.lineWidth = 2
      const pixelX = (props.heatMapAddress & 0xFF) * MAGNIFIER_ZOOM
      const pixelY = (props.heatMapAddress >>> 8) * MAGNIFIER_ZOOM
      magnifierCtx.strokeRect(pixelX - 1, pixelY - 1,
        MAGNIFIER_ZOOM + 2, MAGNIFIER_ZOOM + 2)

      // Add in the local assembly code if CPU heatmap
      if (props.state === HEATMAP_STATE.CPU) {
        const disassembly = getDisassembly(props.heatMapAddress - 15, props.heatMapAddress + 15)
        if ((props.heatMapAddress & 0xFF00) === 0xC000) {
          return
        }
        // If disassembly is all $00 or $FF then skip
        if (disassembly.every(line => line.includes(": 00") || line.includes(": FF") || line.length === 0)) {
          return
        }
        const leftEdge = magnifierScrollRef.current.scrollLeft
        const topEdge = magnifierScrollRef.current.scrollTop
        const rightEdge = magnifierScrollRef.current.scrollLeft + magnifierScrollRef.current.clientWidth
        const addressX = (props.heatMapAddress & 0xFF) * MAGNIFIER_ZOOM
        const addressOnLeft = addressX - leftEdge <= magnifierScrollRef.current.clientWidth / 2
        const leftPosition = addressOnLeft ? rightEdge - 200 : leftEdge + 5
        const topPosition = topEdge + 15
        magnifierCtx.fillStyle = "#ffff00"
        const addresses = disassembly.map(line => parseInt(line, 16))
        addresses.push(0xFFFF)
        for (let i = 0; i < disassembly.length; i++) {
          const hit = addresses[i] <= props.heatMapAddress && addresses[i + 1] > props.heatMapAddress
          magnifierCtx.font = hit ? "bold 11px monospace" : "11px monospace"
          const xtra = hit ? "*" : " "
          magnifierCtx.fillText(xtra + disassembly[i], leftPosition, topPosition + i * 12)
        }
      }
    }
  })

  return (
    <div className="modal-overlay"
      style={{ pointerEvents: dragging ? "auto" : "none",
        backgroundColor: "transparent" }}
      onMouseMove={dragging ? (e) => handleTitleBarMouseMove(e) : undefined}
      onMouseUp={dragging ? () => handleTitleBarMouseUp() : undefined}>
    <div className="floating-dialog flex-column"
      ref={dialogRef}
      style={{
        // The overlay is pointer-events: none when idle, so the dialog must opt back in.
        pointerEvents: "auto",
        left: `${props.dialogPositionX}px`, top: `${props.dialogPositionY}px`,
      }}
    >
    <div className="flex-row-space-between"
      onMouseDown={(e) => handleTitleBarMouseDown(e)}
      onMouseMove={(e) => handleTitleBarMouseMove(e)}
      onMouseUp={handleTitleBarMouseUp}>
      <div className="flex-row" style={{ marginLeft: "5px" }}>
        <button className="push-button bigger-font"
          title={t("debug.heatMap.jumpToProgramCounter")}
          onClick={() => {
            selectAddress(handleGetState6502().PC)
          }}>PC</button>
        <button className="push-button"
          title={t("debug.heatMap.jumpToMaximumValue")}
          onClick={() => {
            selectAddress(props.maxIndex)
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
      onScroll={updateMagnifierViewport}
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
        onClick={() => setMouseClicked(prev => !prev)}
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
    </div>
  )
}

export default HeatMapMagnifier