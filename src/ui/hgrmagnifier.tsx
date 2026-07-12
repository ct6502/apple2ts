import { COLOR_MODE, toHex } from "../common/utility"
import { useEffect } from "react"
import { useGlobalContext } from "./globalcontext"
import { nColsHgrMagnifier, nRowsHgrMagnifier, getOverrideHiresPixels, screenBytesToCanvasPixels, screenCoordToCanvasCoord, canvasCoordToNormScreenCoord } from "./graphics"
import { drawHiresTile } from "./graphicshgr"

type MagnifyProps = {
  mainCanvas: HTMLCanvasElement | null,
  mouseLoc: number[],
  lockHgrMagnifier: boolean
}

const HgrMagnifier = (props: MagnifyProps) => {
  const { updateHgrMagnifier: updateHgrMagnifier, setUpdateHgrMagnifier: setUpdateHgrMagnifier,
    hgrMagnifierLoc: hgrMagnifierLoc, setHgrMagnifierLoc: setHgrMagnifierLoc,
    setLockHgrMagnifier } = useGlobalContext()

  let x = 0, y = 0
  if (props.mainCanvas) {
    const nHalf = nRowsHgrMagnifier / 2
    let [cx, cy] = canvasCoordToNormScreenCoord(props.mainCanvas, props.mouseLoc[0] - 30, props.mouseLoc[1] - 25)
    cx = Math.floor(cx * 280)
    cy = Math.floor(cy * 192)
    // Make sure the showHgrMagnifier doesn't go off the edge of the screen.
    // Also shift it to the left so it falls more naturally on an
    // HGR screen byte boundary.
    x = Math.max(Math.min(Math.min(Math.max(Math.floor(cx / 7), 0), 40 - nColsHgrMagnifier), 40), 0)
    y = Math.max(Math.min(Math.max(nHalf - 1, Math.min(cy, 191 - nHalf)) - (nHalf - 1), 192), 0)
  }

  useEffect(() => {
    if (props.lockHgrMagnifier && props.mainCanvas) {
      setHgrMagnifierLoc([x, y])
    }
  }, [x, y, props.lockHgrMagnifier, props.mainCanvas, setHgrMagnifierLoc])

  useEffect(() => {
    if (updateHgrMagnifier) {
      setUpdateHgrMagnifier(false)
      setLockHgrMagnifier(true)
    }
  }, [updateHgrMagnifier, setUpdateHgrMagnifier, setLockHgrMagnifier])

  if (!props.mainCanvas) return <></>

  // When locked, display the saved location instead of the current mouse position
  const displayX = (props.lockHgrMagnifier && hgrMagnifierLoc[0] >= 0)
    ? Math.max(Math.min(hgrMagnifierLoc[0], 40), 0)
    : Math.max(Math.min(x, 40), 0)
  const displayY = (props.lockHgrMagnifier && hgrMagnifierLoc[1] >= 0)
    ? Math.max(Math.min(hgrMagnifierLoc[1], 192), 0)
    : Math.max(Math.min(y, 192), 0)

  const drawBytes = (pixels: number[][]) => {
    const infoCanvas = document.getElementById("hgr-info-canvas") as HTMLCanvasElement | null
    if (infoCanvas) {
      const canvas = infoCanvas
      const context = canvas.getContext("2d")
      if (context) {
        context.fillStyle = "black"
        context.fillRect(0, 0, canvas.width, canvas.height)
        const tile = new Uint8Array(nColsHgrMagnifier * nRowsHgrMagnifier)
        for (let j = 0; j < nRowsHgrMagnifier; j++) {
          for (let i = 0; i < nColsHgrMagnifier; i++) {
            tile[nColsHgrMagnifier * j + i] = pixels[j][i + 1]
          }
        }
        context.imageSmoothingEnabled = false
        const addr = pixels[0][0]
        const isEven = addr % 2 === 0
        drawHiresTile(context, tile, COLOR_MODE.NOFRINGE,
          nRowsHgrMagnifier, 0, 0, 11, isEven)
        // Draw vertical lines
        const nPixels = 7 * nColsHgrMagnifier
        for (let i = 1; i < nPixels; i++) {
          const x = Math.round((canvas.width / nPixels) * i + 0.5) - 0.5
          context.moveTo(x, 0)
          context.lineTo(x, canvas.height)
        }
        // Draw horizontal lines
        for (let i = 1; i <= nRowsHgrMagnifier - 1; i++) {
          const y = Math.round((canvas.height / nRowsHgrMagnifier) * i + 0.5) - 0.5
          context.moveTo(0, y)
          context.lineTo(canvas.width, y)
        }
        context.strokeStyle = "#888"
        context.stroke()
      }
    }
  }

  const pixels = getOverrideHiresPixels(displayX, displayY)
  if (!pixels) return <></>
  const pixelText = pixels.map((line: Array<number>, i) => {
    return <div key={i}>
      {`${toHex(line[0])}: ${line.slice(1, nColsHgrMagnifier + 1).map((value) => toHex(value, 2)).join(" ")}`}
    </div>
  })
  const [dx, dy] = screenBytesToCanvasPixels(props.mainCanvas, nColsHgrMagnifier, nRowsHgrMagnifier)
  const col = 7 * displayX
  const row = displayY
  let [xPos, yPos] = screenCoordToCanvasCoord(props.mainCanvas, col, row)
  xPos -= 2
  yPos -= 2
  setTimeout(() => drawBytes(pixels), 50)

  return <div className="hgr-view flex-row"
    style={{ left: `${xPos}px`, top: `${yPos}px` }}>
    <div className="hgr-view-box" style={{ width: `${dx}px`, height: `${dy}px` }}>&nbsp;</div>
    <div className="hgr-view-text">{pixelText}</div>
    <canvas id="hgr-info-canvas"
      style={{ zIndex: "9999", border: "2px solid red" }}
      width={`${77 * nColsHgrMagnifier}pt`} height={`${11 * nRowsHgrMagnifier}pt`} />
  </div>

}

export default HgrMagnifier
