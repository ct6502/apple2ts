import { useRef, useEffect } from "react"

export interface CopyCanvasProps {
  srcCanvas: HTMLCanvasElement
}

export const CopyCanvas = (props: CopyCanvasProps) => {

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { srcCanvas, ...rest } = props
  const canvasRef = useRef<HTMLCanvasElement>(null)
  // these dimensions represent a max dpi page
  const width = 1360
  const height = 1584
  const marginx = 0
  const marginy = 0

  useEffect(() => {
    let intervalId = 0

    const render = () => {
      if (canvasRef.current) {
        const destCanvas = canvasRef.current
        const destContext: CanvasRenderingContext2D | null = destCanvas.getContext("2d")
        // copy internal canvas over the other one
        if (destContext) {
          //copy the data, scale if necessary
          destContext?.drawImage(props.srcCanvas, marginx, marginy, width - 2 * marginx, height - 2 * marginy)
        } else {
          console.log("destinationCtx is NULL!")
        }
      } else {
        console.log("canvasRef.current is NULL!")
      }

      intervalId = window.requestAnimationFrame(render)
    }
    render()

    return () => {
      window.cancelAnimationFrame(intervalId)
    }
  }, [canvasRef, props.srcCanvas, height, width])

  return <div className="printer-paper">
      <canvas ref={canvasRef} {...rest}
        className="printer-canvas"
        style={{ width: "540px", height: "700px" }}
        hidden={false}
        width={width} height={height} />
    </div>
}
