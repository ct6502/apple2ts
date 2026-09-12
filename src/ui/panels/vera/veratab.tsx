import { useEffect, useRef } from "react"
import { handleGetVeraFrame } from "../../main2worker"

const VeraTab = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null)

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

  return (
    <div className="flex-column-gap debug-section" style={{ display: "flex", height: "100%", width: "693px" }}>
      <div style={{ flex: 1, display: "flex",
        justifyContent: "flex-start",
        alignItems: "flex-start",
        backgroundColor: "#000",
        border: "10px solid #333",
        borderRadius: "20px",
      }}>
        <canvas 
          ref={canvasRef} 
          width={640} 
          height={480} 
          style={{ 
            objectFit: "contain",
            backgroundColor: "#000",
            border: "0px solid #000",
            borderRadius: "10px",
          }} 
        />
      </div>
    </div>
  )
}

export default VeraTab
