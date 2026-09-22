import React, { useEffect, useRef, useState } from "react"
import { HEATMAP_STATE } from "./heatmap_panel"
import { colormap_inferno } from "./heatmap_colormap_inferno"
import { handleGetHeatMapCPU, handleGetHeatMapMemGet, handleGetHeatMapMemSet } from "../../main2worker"
import { toHex } from "../../../common/utility"

const MAGNIFIER_ZOOM = 8
const MAGNIFIER_HEIGHT = 16 * MAGNIFIER_ZOOM
const MAGNIFIER_WIDTH = 16 * MAGNIFIER_ZOOM
// const MAGNIFIER_LABEL_WIDTH = 72
const MAGNIFIER_LABEL_STEP = 0x200
const BASE_HEATMAP_ROW_HEIGHT = 16

let isMouseDown = false
console.log(isMouseDown)

const HeatMapView = (props: { state: HEATMAP_STATE }) => {
  const heatMapRef = useRef<HTMLCanvasElement>(null)
  const magnifierRef = useRef<HTMLCanvasElement>(null)
  const magnifierAddressRef = useRef<HTMLCanvasElement>(null)
  const [magnifierPos, setMagnifierPos] = useState<{ x: number, y: number } | null>(null)

  const getAddressAtMouse = (event: React.MouseEvent<HTMLCanvasElement>) => {
    if (!heatMapRef.current) return [-1, -1]
    const div = heatMapRef.current as HTMLCanvasElement
    const divRect = div.getBoundingClientRect()
    const clickedDiv = document.elementFromPoint(event.clientX + 30, event.clientY + 2) as HTMLDivElement
    if (clickedDiv && clickedDiv.textContent) {
      const myRect = clickedDiv.getBoundingClientRect()
      const mouseX = event.clientX - divRect.left
      if (mouseX <= 18) {
        const addr = parseInt(clickedDiv.textContent.slice(0, 4), 16)
        return [addr, (myRect.top + myRect.bottom) / 2 - divRect.top]
      }
    }
    return [-1, -1]
  }

  const handleCodeClick = (event: React.MouseEvent<HTMLCanvasElement>) => {
    const [addr] = getAddressAtMouse(event)
    if (addr < 0 || isNaN(addr)) return
  }

  const handleCodeMouseMove = (event: React.MouseEvent<HTMLCanvasElement>) => {
    // const [addr, mouseY] = getAddressAtMouse(event)
    if (!heatMapRef.current) return
    const rect = heatMapRef.current.getBoundingClientRect()
    const x = Math.max(0, Math.min(event.clientX - rect.left, rect.width - 1))
    const y = Math.max(0, Math.min(event.clientY - rect.top, rect.height - 1))
    setMagnifierPos({ x, y })
    // console.log(addr, mouseY, isMouseDown)
  }

  const handleCodeMouseLeave = () => {
    isMouseDown = false
    setMagnifierPos(null)
  }

  const getHeatMap = () => {
    if (props.state === HEATMAP_STATE.CPU) {
      return handleGetHeatMapCPU()
    } else if (props.state === HEATMAP_STATE.GETMEM) {
      return handleGetHeatMapMemGet()
    } else if (props.state === HEATMAP_STATE.SETMEM) {
      return handleGetHeatMapMemSet()
    }
    return new Float64Array()
  }

  const drawGrid = (rgba: Uint8ClampedArray) => {
    for (let i = 0; i < 128; i += 16) {
      for (let j = 0; j < 512; j++) {
        const index = i + j * 128
        rgba[4 * index] = 0
        rgba[4 * index + 1] = 0
        rgba[4 * index + 2] = 0
        rgba[4 * index + 3] = 32
      }
    }
    for (let j = 0; j < 512; j += 16) {
      for (let i = 0; i < 128; i++) {
        const index = i + j * 128
        rgba[4 * index] = 0
        rgba[4 * index + 1] = 0
        rgba[4 * index + 2] = 0
        rgba[4 * index + 3] = 32
      }
    }
  }

  const updateHeatMap = () => {
    const canvas = heatMapRef.current
    const ctx = canvas?.getContext("2d")
    if (!ctx) return
    const heatMap = getHeatMap()
    if (heatMap.length === 0) {
      ctx.clearRect(0, 0, 128, 512)
      return
    }
    ctx.imageSmoothingEnabled = false
    const rgba = new Uint8ClampedArray(4 * 128 * 512)
    drawGrid(rgba)
    const colorTable = colormap_inferno
    let heatMax = 0
    for (let i = 0; i < 128 * 512; i++) {
      if (heatMap[i] > heatMax) {
        heatMax = heatMap[i]
      }
    }
    heatMax = Math.log10(Math.max(1, 0.9 * heatMax))
    const heatMapBottom = 10
    for (let i = 0; i < 128 * 512; i++) {
      const value = Math.min(255, Math.floor(255 * (Math.log10(Math.max(1, heatMap[i])) / heatMax)))
      if (value > heatMapBottom) {
        const [r, g, b] = colorTable[value]
        rgba[4 * i] = r
        rgba[4 * i + 1] = g
        rgba[4 * i + 2] = b
        rgba[4 * i + 3] = 255
      }
    }
    ctx.putImageData(new ImageData(rgba as ImageDataArray, 128, 512), 0, 0)
  }

  useEffect(() => {
    updateHeatMap()
  })

  useEffect(() => {
    if (!magnifierRef.current || !heatMapRef.current || !magnifierPos) return
    const heatCanvas = heatMapRef.current
    const magnifierCanvas = magnifierRef.current
    const magnifierCtx = magnifierCanvas?.getContext("2d")
    const addressCanvas = magnifierAddressRef.current
    const addressCtx = addressCanvas?.getContext("2d")
    if (!magnifierCtx) return

    const cropWidth = Math.floor(MAGNIFIER_WIDTH / MAGNIFIER_ZOOM)
    const cropHeight = Math.floor(MAGNIFIER_HEIGHT / MAGNIFIER_ZOOM)
    const sourceX = magnifierPos.x - cropWidth / 2//Math.max(0, Math.min(magnifierPos.x - cropWidth / 2, heatCanvas.width - cropWidth))
    const sourceY = magnifierPos.y - cropHeight / 2//Math.max(0, Math.min(magnifierPos.y - cropHeight / 2, heatCanvas.height - cropHeight))

    magnifierCtx.clearRect(0, 0, magnifierCanvas.width, magnifierCanvas.height)
    magnifierCtx.fillStyle = "rgba(255, 255, 255, 0.85)"
    magnifierCtx.fillRect(0, 0, magnifierCanvas.width, magnifierCanvas.height)
    magnifierCtx.imageSmoothingEnabled = false
    magnifierCtx.drawImage(heatCanvas, sourceX, sourceY,
      cropWidth, cropHeight, 0, 0, magnifierCanvas.width, magnifierCanvas.height)

    const addrY = Math.max(0, Math.min(Math.floor(magnifierPos.y - 0.5) * 128, 0xFFFF))
    const addrX = Math.max(0, Math.min(Math.floor(magnifierPos.x - 0.5), 127))
    const heatMap = getHeatMap()
    if (heatMap.length > 0) {
      const label = `$${toHex(addrY + addrX, 4)} = ${heatMap[addrY + addrX]}`
      magnifierCtx.font = "10px monospace"
      magnifierCtx.fillStyle = "#000"
      magnifierCtx.fillText(label, 0, 12)
    }

    if (addressCtx && addressCanvas) {
      addressCtx.clearRect(0, 0, addressCanvas.width, addressCanvas.height)
      addressCtx.font = "10px monospace"
      addressCtx.textAlign = "right"
      addressCtx.fillStyle = "#000"

      const labelStep = MAGNIFIER_LABEL_STEP
      const pixelsPerSourceStep = BASE_HEATMAP_ROW_HEIGHT * (labelStep / 0x800)
      const startAddr = Math.floor(sourceY / pixelsPerSourceStep) * labelStep
      const visibleRows = Math.max(1, Math.ceil(cropHeight / pixelsPerSourceStep))
      for (let rowIndex = 0; rowIndex < visibleRows; rowIndex++) {
        const rowY = rowIndex * pixelsPerSourceStep * MAGNIFIER_ZOOM
        const addr = startAddr + (rowIndex * labelStep)
        const label = `$${addr.toString(16).toUpperCase().padStart(4, "0")}`
        addressCtx.fillText(label, addressCanvas.width - 6, rowY + 12)
      }
    }
  })

  const addressStops = Array.from({ length: 0x10000 / 0x800 }, (_, index) => index * 0x800)

  return (
    <div className="flex-row"
      style={{ position: "relative" }}
      onMouseLeave={handleCodeMouseLeave}>
      <div className="mono-text no-select heatmap-address-column">
        {addressStops.map((addr) => (
          <div key={addr} style={{ height: "16px" }}>
            {`$${addr.toString(16).toUpperCase().padStart(4, "0")}-`}
          </div>
        ))}
      </div>
      <div style={{ position: "relative" }}>
        <canvas
          ref={heatMapRef}
          width="128px"
          height="512px"
          style={{ border: "1px solid black" }}
          onMouseDown={() => {isMouseDown = true}}
          onMouseUp={() => {isMouseDown = false}}
          onTouchStart={() => {isMouseDown = true}}
          onTouchEnd={() => {isMouseDown = false}}
          onMouseMove={handleCodeMouseMove}
          onClick={handleCodeClick}
        />
        {magnifierPos && (
          <div
            style={{
              position: "absolute",
              left: magnifierPos.x - 0.5 * MAGNIFIER_WIDTH,
              top: magnifierPos.y - 0.5 * MAGNIFIER_HEIGHT,
              display: "flex",
              alignItems: "stretch",
              border: "1px solid rgba(0, 0, 0, 0.6)",
              background: "rgba(255, 255, 255, 0.12)",
              boxShadow: "0 4px 12px rgba(0, 0, 0, 0.2)",
              zIndex: 10,
              pointerEvents: "none",
            }}
          >
            {/* <canvas
              ref={magnifierAddressRef}
              width={MAGNIFIER_LABEL_WIDTH}
              height={MAGNIFIER_HEIGHT}
              style={{ borderRight: "1px solid rgba(0, 0, 0, 0.4)" }}
            /> */}
            <canvas
              ref={magnifierRef}
              width={MAGNIFIER_WIDTH}
              height={MAGNIFIER_HEIGHT}
              style={{ display: "block" }}
            />
          </div>
        )}
      </div>
    </div>
  )
}

export default HeatMapView