import { useEffect, useRef, useState } from "react"
import { handleGetHeatMap, handleGetHeatMapMax, handleGetRunMode, handleGetState6502 } from "../../main2worker"
import { HEATMAP_STATE, RUN_MODE, toHex } from "../../../common/utility"
import HeatMapMagnifier from "./heatmap_magnifier"
import { getViridisColorsRGB } from "../../ui_utilities"
import { PaletteName } from "viridis"

const BASE_HEATMAP_WIDTH = 256
const BASE_HEATMAP_HEIGHT = 256

// let isMouseDown = false
let heatMapValue = 0
let maxIndex = 0
// s6502.cycleCount the canvas was actually redrawn for. The worker posts
// machine state ~60x/sec regardless of whether new instructions/memory
// accesses happened; skip the expensive per-pixel redraw when nothing has
// changed since the last paint. (execution.executionSequence is NOT this
// signal - it only bumps on running/paused/idle transitions, so it never
// changes while the emulator runs continuously.)
let lastDrawnCycleCount = -1
// Which HEATMAP_STATE (CPU/GETMEM/SETMEM) the canvas currently reflects.
// Switching sub-tabs swaps to a different underlying array without
// necessarily advancing cycleCount, so that alone must also force a redraw.
let lastDrawnState: HEATMAP_STATE | null = null

const HeatMapView = (props: { state: HEATMAP_STATE,
  colorTable: PaletteName,
  showMagnifier: boolean,
  setShowMagnifier: (value: boolean) => void }) => {
  const heatMapRef = useRef<HTMLCanvasElement>(null)
  const x = window.outerWidth - 600
  const y = window.outerHeight - 700
  const [dialogPosition, setDialogPosition] = useState([x, y])
  const [heatMapAddress, setHeatMapAddressState] = useState<number>(-1)
  const [heatMapPosition, setHeatMapPosition] = useState<[number, number]>([x, y])

  const doSetDialogPosition = (x: number, y: number) => {
    setDialogPosition([x, y])
  }

  const doSetHeatMapPosition = (x: number, y: number) => {
    setHeatMapPosition([x, y])
  }

  const handleHeatMapClick = (event: React.MouseEvent<HTMLCanvasElement>) => {
    if (handleGetRunMode() === RUN_MODE.IDLE) return
    // Show magnifier and scroll to event.clientX, event.clientY
    props.setShowMagnifier(true)
    const rect = heatMapRef.current?.getBoundingClientRect()
    const offsetX = rect ? event.clientX - rect.left : 0
    const offsetY = rect ? event.clientY - rect.top : 0
    setHeatMapPosition([offsetX, offsetY])
    // const [addr] = getAddressAtMouse(event)
    // if (addr < 0 || isNaN(addr)) return
  }

  const closeMagnifier = () => {
    props.setShowMagnifier(false)
  }

    // const drawGrid = (rgba: Uint8ClampedArray) => {
    //   for (let i = 0; i < BASE_HEATMAP_WIDTH; i += 16) {
    //     for (let j = 0; j < BASE_HEATMAP_HEIGHT; j++) {
    //       const index = i + j * BASE_HEATMAP_WIDTH
    //       rgba[4 * index] = 0
    //       rgba[4 * index + 1] = 0
    //       rgba[4 * index + 2] = 0
    //       rgba[4 * index + 3] = 255
    //     }
    //   }
    //   for (let j = 0; j < BASE_HEATMAP_HEIGHT; j += 16) {
    //     for (let i = 0; i < BASE_HEATMAP_WIDTH; i++) {
    //       const index = i + j * BASE_HEATMAP_WIDTH
    //       rgba[4 * index] = 0
    //       rgba[4 * index + 1] = 0
    //       rgba[4 * index + 2] = 0
    //       rgba[4 * index + 3] = 255
    //     }
    //   }
    // }

  const updateHeatMap = () => {
    const canvas = heatMapRef.current
    const ctx = canvas?.getContext("2d")
    if (!ctx) return
    const heatMap = handleGetHeatMap()
    if (heatMap.length === 0) {
      ctx.clearRect(0, 0, BASE_HEATMAP_WIDTH, BASE_HEATMAP_HEIGHT)
      lastDrawnCycleCount = -1
      lastDrawnState = null
      return
    }
    // Keep the magnifier's live value readout responsive even while paused
    // (e.g. hovering to inspect a frozen heat map), before the "did
    // anything change" bail-out below.
    if (heatMapAddress >= 0) {
      heatMapValue = heatMap[heatMapAddress]
    }
    const cycleCount = handleGetState6502().cycleCount
    if (cycleCount === lastDrawnCycleCount && props.state === lastDrawnState) return
    lastDrawnCycleCount = cycleCount
    lastDrawnState = props.state
    ctx.imageSmoothingEnabled = false
    const rgba = new Uint8ClampedArray(4 * BASE_HEATMAP_WIDTH * BASE_HEATMAP_HEIGHT)
    // drawGrid(rgba)
    // The peak value/address is tracked incrementally by the producer
    // (cpu6502.ts / memory.ts) as it writes the heat map, instead of being
    // rescanned across all 65536 entries here on every redraw.
    const heatMapMax = handleGetHeatMapMax()
    maxIndex = heatMapMax.index
    const heatMax = Math.log10(Math.max(1, 0.9 * heatMapMax.value))
    const colorTable = getViridisColorsRGB(props.colorTable, 16)
    // const heatMapBottom = 75
    for (let i = 0; i < BASE_HEATMAP_WIDTH * BASE_HEATMAP_HEIGHT; i++) {
      const logscale = Math.log10(Math.max(1, heatMap[i])) / heatMax
      const value = Math.floor(16 * logscale) - 1
      if (value >= 0) {
        const [r, g, b] = colorTable[value]
        rgba[4 * i] = r
        rgba[4 * i + 1] = g
        rgba[4 * i + 2] = b
        rgba[4 * i + 3] = 255
      } else {
        if (rgba[4 * i + 3] === 0) rgba[4 * i + 3] = 255
      }
    }
    ctx.putImageData(new ImageData(rgba as ImageDataArray, BASE_HEATMAP_WIDTH, BASE_HEATMAP_HEIGHT), 0, 0)
  }

  useEffect(() => {
    updateHeatMap()
  })

  const doSetHeatMapAddress = (address: number) => {
    setHeatMapAddressState(address)
  }

  const addressStops = Array.from({ length: 15 }, (_, index) => (index + 1) * 0x1000)
  const rowStops = Array.from({ length: 7 }, (_, index) => (index + 1) * 32)

  return (
  <div className="flex-column">
    <div className="mono-text no-select heatmap-address-row">
      {rowStops.map((row, i) => (
        <span key={row} style={{position: "absolute", left: `${(i + 1) * 32}px`}}>
          {`$${toHex(row, 2)}`}
        </span>
      ))}
    </div>
    <div className="flex-row"
      style={{ position: "relative" }}>
      <div className="mono-text no-select heatmap-address-column">
        {addressStops.map((addr) => (
          <div key={addr} style={{position: "absolute", top: `${(addr / 0x1000) * 16}px`}}>
            {`$${toHex(addr, 4)}-`}
          </div>
        ))}
      </div>
      <div style={{ position: "relative" }}>
        <canvas
          ref={heatMapRef}
          width={BASE_HEATMAP_WIDTH}
          height={BASE_HEATMAP_HEIGHT}
          style={{ border: "1px solid black" }}
          onClick={(e) => handleHeatMapClick(e)}
        />
      </div>
    </div>
    {props.showMagnifier && <HeatMapMagnifier
        state={props.state}
        heatCanvas={heatMapRef}
        heatMapValue={heatMapValue}
        maxIndex={maxIndex}
        setHeatMapAddress={doSetHeatMapAddress}
        heatMapPosition={heatMapPosition}
        setHeatMapPosition={doSetHeatMapPosition}
        closeDialog={closeMagnifier}
        dialogPositionX={dialogPosition[0]}
        dialogPositionY={dialogPosition[1]}
        setDialogPosition={doSetDialogPosition} />}
  </div>
  )
}

export default HeatMapView