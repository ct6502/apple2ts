import { useEffect, useRef, useState } from "react"
import { HEATMAP_STATE } from "./heatmap_panel"
import { colormap_inferno } from "./heatmap_colormap_inferno"
import { handleGetHeatMapCPU, handleGetHeatMapMemGet, handleGetHeatMapMemSet, handleGetRunMode } from "../../main2worker"
import { RUN_MODE, toHex } from "../../../common/utility"
import HeatMapMagnifier from "./heatmap_magnifier"

const BASE_HEATMAP_WIDTH = 256
const BASE_HEATMAP_HEIGHT = 256

// let isMouseDown = false
let heatMapValue = 0
let maxIndex = 0

const HeatMapView = (props: { state: HEATMAP_STATE, showMagnifier: boolean, setShowMagnifier: (value: boolean) => void }) => {
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
    const heatMap = getHeatMap()
    if (heatMap.length === 0) {
      ctx.clearRect(0, 0, BASE_HEATMAP_WIDTH, BASE_HEATMAP_HEIGHT)
      return
    }
    if (heatMapAddress >= 0) {
      heatMapValue = heatMap[heatMapAddress]
    }
    ctx.imageSmoothingEnabled = false
    const rgba = new Uint8ClampedArray(4 * BASE_HEATMAP_WIDTH * BASE_HEATMAP_HEIGHT)
    // drawGrid(rgba)
    const colorTable = colormap_inferno
    let heatMax = 0
    for (let i = 0; i < BASE_HEATMAP_WIDTH * BASE_HEATMAP_HEIGHT; i++) {
      if (heatMap[i] > heatMax) {
        heatMax = heatMap[i]
        maxIndex = i
      }
    }
    heatMax = Math.log10(Math.max(1, 0.9 * heatMax))
    const heatMapBottom = 75
    for (let i = 0; i < BASE_HEATMAP_WIDTH * BASE_HEATMAP_HEIGHT; i++) {
      const logscale = Math.log10(Math.max(1, heatMap[i])) / heatMax
      const value = Math.min(255, heatMapBottom + 12 * Math.floor(16 * logscale))
      if (value > heatMapBottom) {
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