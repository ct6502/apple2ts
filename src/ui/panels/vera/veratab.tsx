import { useEffect, useRef, useState } from "react"
import { handleGetVeraFrame, handleGetShowAppleMouse, passMouseEvent } from "../../main2worker"
import { MouseEventSimple } from "../../../common/utility"
import { getMouseButtonReleaseEvents } from "../../mouseevent"

const VeraTab = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [withinScreen, setWithinScreen] = useState(false)
  const [viewSize, setViewSize] = useState<"320" | "640">(() => {
    try {
      return (localStorage.getItem("vera_view_size") as "320" | "640") || "640"
    } catch {
      return "640"
    }
  })

  const isTouchDevice = false

  const setFocus = () => {
    const mainCanvas = document.getElementById("apple2canvas") as HTMLCanvasElement | null
    if (mainCanvas) {
      mainCanvas.focus({ preventScroll: true })
    }
  }

  const scaleMouseEvent = (e: React.MouseEvent<HTMLCanvasElement>): MouseEventSimple | null => {
    const canvas = canvasRef.current
    if (!canvas) return null
    const rect = canvas.getBoundingClientRect()
    if (rect.width <= 0 || rect.height <= 0) return null
    const x = (e.clientX - rect.left) / rect.width
    const y = (e.clientY - rect.top) / rect.height
    if (x < 0 || x > 1 || y < 0 || y > 1) return null
    return { x, y, buttons: -1 }
  }

  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    setFocus()
    const evt = scaleMouseEvent(e)
    if (!evt) return
    evt.buttons = e.button === 0 ? 0x10 : 0x11
    passMouseEvent(evt)
  }

  const handleMouseUp = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const evt = scaleMouseEvent(e)
    if (!evt) return
    evt.buttons = e.button === 0 ? 0x00 : 0x01
    passMouseEvent(evt)
  }

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const evt = scaleMouseEvent(e)
    if (!evt) {
      setWithinScreen(false)
      return
    }
    setWithinScreen(true)
    passMouseEvent(evt)
  }

  const handleMouseEnter = (e: React.MouseEvent<HTMLCanvasElement>) => {
    setFocus()
    setWithinScreen(true)
    for (const release of getMouseButtonReleaseEvents(e.buttons, isTouchDevice)) {
      passMouseEvent(release)
    }
  }

  const handleMouseLeave = (e: React.MouseEvent<HTMLCanvasElement>) => {
    setWithinScreen(false)
    for (const release of getMouseButtonReleaseEvents(e.buttons, isTouchDevice)) {
      passMouseEvent(release)
    }
  }

  const handleContextMenu = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (handleGetShowAppleMouse()) {
      e.preventDefault()
    }
  }

  const handleSizeChange = (size: "320" | "640") => {
    setViewSize(size)
    try {
      localStorage.setItem("vera_view_size", size)
    } catch (e) {
      void e
    }
  }

  useEffect(() => {
    let animationFrameId: number

    const render = () => {
      const veraFrame = handleGetVeraFrame()
      const canvas = canvasRef.current

      if (canvas) {
        const ctx = canvas.getContext("2d")
        if (ctx) {
          // If DC_VIDEO output is disabled (lowest 2 bits are 0) or no frame, show standby/help screen
          if (!veraFrame || !veraFrame.fb || (veraFrame.dcVideo & 3) === 0) {
            ctx.fillStyle = "#0a0a0a"
            ctx.fillRect(0, 0, canvas.width, canvas.height)

            ctx.textAlign = "center"

            // Header
            ctx.fillStyle = "#4ec9b0"
            ctx.font = "bold 22px system-ui, -apple-system, BlinkMacSystemFont, sans-serif"
            ctx.fillText("VERA DISPLAY STANDBY", 320, 115)

            ctx.fillStyle = "#dddddd"
            ctx.font = "16px system-ui, -apple-system, BlinkMacSystemFont, sans-serif"
            ctx.fillText("Output is active when running VERA-enabled software", 320, 150)
            ctx.fillStyle = "#888888"
            ctx.font = "14px system-ui, -apple-system, BlinkMacSystemFont, sans-serif"
            ctx.fillText("(e.g. Time Pilot, VeraTest)", 320, 175)

            // Separator
            ctx.strokeStyle = "#333333"
            ctx.lineWidth = 1
            ctx.beginPath()
            ctx.moveTo(100, 205)
            ctx.lineTo(540, 205)
            ctx.stroke()

            // VERA SD Card Section
            ctx.fillStyle = "#ffffff"
            ctx.font = "bold 18px system-ui, -apple-system, BlinkMacSystemFont, sans-serif"
            ctx.fillText("VERA SD Drive (*.img, *.raw, *.bin)", 320, 245)

            ctx.fillStyle = "#cccccc"
            ctx.font = "15px system-ui, -apple-system, BlinkMacSystemFont, sans-serif"
            ctx.fillText("Raw SPI mass storage for Apple II software (SD-DIAG, VeraSDEdit)", 320, 275)

            // Separator 2
            ctx.strokeStyle = "#282828"
            ctx.beginPath()
            ctx.moveTo(140, 310)
            ctx.lineTo(500, 310)
            ctx.stroke()

            // Floppy & HDD Tip
            ctx.fillStyle = "#64b5f6"
            ctx.font = "15px system-ui, -apple-system, BlinkMacSystemFont, sans-serif"
            ctx.fillText("Tip: Dropping floppy & HDD images (.dsk, .woz, .po, .hdv)", 320, 345)
            ctx.fillText("onto the VERA SD icon will auto-boot in Drive 1", 320, 370)
          } else {
            const imgData = new ImageData(veraFrame.fb, 640, 480)
            ctx.putImageData(imgData, 0, 0)
          }
        }
      }

      animationFrameId = requestAnimationFrame(render)
    }

    render()

    return () => {
      cancelAnimationFrame(animationFrameId)
    }
  }, [])

  useEffect(() => {
    const handleWindowMouseUp = (e: MouseEvent) => {
      if (e.buttons === 0) {
        for (const release of getMouseButtonReleaseEvents(0, isTouchDevice)) {
          passMouseEvent(release)
        }
      }
    }
    window.addEventListener("mouseup", handleWindowMouseUp)
    return () => {
      window.removeEventListener("mouseup", handleWindowMouseUp)
    }
  }, [isTouchDevice])

  const isHalf = viewSize === "320"
  const veraFrame = handleGetVeraFrame()
  const isVeraActive = !!(veraFrame && veraFrame.fb && (veraFrame.dcVideo & 3) !== 0)
  const cursor = (handleGetShowAppleMouse() && withinScreen && isVeraActive) ?
    (window.assetRegistry?.dotCursor ? `url(${window.assetRegistry.dotCursor}), none` : "default") :
    "default"

  return (
    <div className="flex-column-gap debug-section"
      style={{ display: "flex",
        flexDirection: "column",
        height: "100%",
        width: "693px", /* should be a better way to do this, but needs to match other debug tabs! */
        alignItems: "flex-start",
        marginLeft: 0,
        paddingLeft: 0 }}>
      <div style={{
        display: "inline-flex",
        justifyContent: "flex-start",
        alignItems: "flex-start",
        backgroundColor: "#000",
        border: "10px solid #333",
        borderRadius: "20px",
        overflow: "hidden",
        boxShadow: "0 4px 16px rgba(0,0,0,0.6)",
      }}>
        <canvas 
          ref={canvasRef} 
          id="veraCanvas"
          width={640} 
          height={480} 
          style={{ 
            width: isHalf ? "320px" : "640px",
            height: isHalf ? "240px" : "480px",
            display: "block",
            backgroundColor: "#000",
            imageRendering: isHalf ? "auto" : "pixelated",
            cursor: cursor,
          }} 
          onMouseDown={(e) => { setFocus(); handleMouseDown(e) }}
          onMouseUp={handleMouseUp}
          onMouseMove={handleMouseMove}
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
          onContextMenu={handleContextMenu}
        />
      </div>
      <div style={{ display: "flex", gap: "6px", width: "100%", justifyContent: "flex-start", paddingLeft: "4px", marginTop: "8px" }}>
        <button
          type="button"
          className={`push-button text-button${isHalf ? " button-active" : ""}`}
          style={{
            fontSize: "11px",
            width: "auto",
            height: "22px",
            padding: "2px 8px",
          }}
          onClick={() => handleSizeChange("320")}>
          320×240 (1x)
        </button>
        <button
          type="button"
          className={`push-button text-button${!isHalf ? " button-active" : ""}`}
          style={{
            fontSize: "11px",
            width: "auto",
            height: "22px",
            padding: "2px 8px",
          }}
          onClick={() => handleSizeChange("640")}>
          640×480 (2x)
        </button>
      </div>
    </div>
  )
}

export default VeraTab
