import React, { useEffect, useRef } from "react"
import { HEATMAP_STATE } from "./heatmap_panel"
import { colormap_turbo } from "./heatmap_colormap_turbo"
import { colormap_inferno } from "./heatmap_colormap_inferno"
import { handleGetHeatMapCPU, handleGetHeatMapMemSet } from "../../main2worker"

let isMouseDown = false

const HeatMapView = (props: { state: HEATMAP_STATE }) => {
  const heatMapRef = useRef<HTMLCanvasElement>(null)

  const getAddressAtMouse = (event: React.MouseEvent<HTMLDivElement>) => {
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

  const handleCodeClick = (event: React.MouseEvent<HTMLDivElement>) => {
    const [addr] = getAddressAtMouse(event)
    if (addr < 0 || isNaN(addr)) return
  }

  const handleCodeMouseMove = (event: React.MouseEvent<HTMLDivElement>) => {
    const [addr, mouseY] = getAddressAtMouse(event)
    console.log(addr, mouseY, isMouseDown)
  }

  const handleCodeMouseLeave = () => {
    isMouseDown = false
  }

  const updateHeatMap = () => {
    const heatMap = (props.state === HEATMAP_STATE.CPU) ? handleGetHeatMapCPU() : handleGetHeatMapMemSet()
    const canvas = heatMapRef.current
    if (!canvas) return
    const ctx = canvas.getContext("2d")
    if (!ctx) return
    ctx.imageSmoothingEnabled = false
    const rgba = new Uint8ClampedArray(4 * 128 * 512)
    const colorTable = (props.state === HEATMAP_STATE.CPU) ? colormap_inferno : colormap_turbo
    if (heatMap.length > 0) {
      let heatMax = 0
      for (let i = 0; i < 128 * 512; i++) {
        if (heatMap[i] > heatMax) {
          heatMax = heatMap[i]
        }
      }
      heatMax = Math.log10(heatMax)
      const heatMapBottom = 10
      for (let i = 0; i < 128 * 512; i++) {
        const value = Math.floor(255 * (Math.log10(Math.max(1, heatMap[i])) / heatMax))
        if (value > heatMapBottom) {
          const [r, g, b] = colorTable[value]
          rgba[4 * i] = r
          rgba[4 * i + 1] = g
          rgba[4 * i + 2] = b
          rgba[4 * i + 3] = 255
        } else {
          rgba[4 * i] = 0
          rgba[4 * i + 1] = 0
          rgba[4 * i + 2] = 0
          rgba[4 * i + 3] = 255
        }
      }
    }
    ctx.putImageData(new ImageData(rgba as ImageDataArray, 128, 512), 0, 0)
  }

  useEffect(() => {
    updateHeatMap()
  })

  return (
    <div className="flex-row thin-border"
      style={{ position: "relative" }}>
      <div
        className="mono-text"
        style={{
          overflowY: "hidden",
          overflowX: "hidden",
          width: "4em",
          height: "512px",
        }}
        tabIndex={0} // Makes the div focusable for keydown events
        onMouseDown={() => {isMouseDown = true}}
        onMouseUp={() => {isMouseDown = false}}
        onTouchStart={() => {isMouseDown = true}}
        onTouchEnd={() => {isMouseDown = false}}
        onMouseMove={handleCodeMouseMove}
        onMouseLeave={handleCodeMouseLeave}
        onClick={handleCodeClick}>
      </div>
      <canvas
        ref={heatMapRef}
        width="128px"
        height="512px"
        style={{ border: "1px solid black" }}
      />
    </div>
  )
}

export default HeatMapView