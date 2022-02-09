// from https://medium.com/@pdx.lucasm/canvas-with-react-js-32e133c05258
import useCanvas from "./use.canvas";

const Canvas = (props: any) => {  

  const { draw, ...rest } = props;
  const canvasRef = useCanvas(draw)

  return <canvas ref={canvasRef} {...rest}/>
}

export default Canvas