import { useEffect, useRef, useState } from "react"
import { handleGetVeraFrame } from "../../main2worker"

const VeraTab = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [viewSize, setViewSize] = useState<"320" | "640">(() => {
    try {
      return (localStorage.getItem("vera_view_size") as "320" | "640") || "640"
    } catch {
      return "640"
    }
  })

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

      if (canvas && veraFrame && veraFrame.fb) {
        const ctx = canvas.getContext("2d")
        if (ctx) {
          // If DC_VIDEO output is disabled (lowest 2 bits are 0), clear screen
          if ((veraFrame.dcVideo & 3) === 0) {
            ctx.fillStyle = "#000"
            ctx.fillRect(0, 0, canvas.width, canvas.height)
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

  const isHalf = viewSize === "320"

  return (
    <div className="flex-column-gap debug-section" style={{ display: "flex", flexDirection: "column", height: "100%", width: "fit-content", alignItems: "flex-start", marginLeft: 0, paddingLeft: 0 }}>
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
          width={640} 
          height={480} 
          style={{ 
            width: isHalf ? "320px" : "640px",
            height: isHalf ? "240px" : "480px",
            display: "block",
            backgroundColor: "#000",
            imageRendering: "pixelated",
          }} 
        />
      </div>
      <div style={{ display: "flex", gap: "6px", width: "100%", justifyContent: "flex-start", paddingLeft: "4px", marginTop: "8px" }}>
        <button
          type="button"
          className="push-button"
          style={{
            fontSize: "11px",
            width: "auto",
            height: "22px",
            padding: "2px 8px",
            borderRadius: "4px",
            border: isHalf ? "1px solid #666" : "1px solid transparent",
            backgroundColor: isHalf ? "#333" : "transparent",
            color: isHalf ? "#fff" : "#888",
          }}
          onClick={() => handleSizeChange("320")}>
          320×240 (1x)
        </button>
        <button
          type="button"
          className="push-button"
          style={{
            fontSize: "11px",
            width: "auto",
            height: "22px",
            padding: "2px 8px",
            borderRadius: "4px",
            border: !isHalf ? "1px solid #666" : "1px solid transparent",
            backgroundColor: !isHalf ? "#333" : "transparent",
            color: !isHalf ? "#fff" : "#888",
          }}
          onClick={() => handleSizeChange("640")}>
          640×480 (2x)
        </button>
      </div>
    </div>
  )
}

export default VeraTab
