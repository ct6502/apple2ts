// from https://medium.com/@pdx.lucasm/canvas-with-react-js-32e133c05258
import { useRef, useEffect } from 'react'

const useCanvas = (draw: any, options: any={}) => {
  
  const canvasRef = useRef(null)
  
  useEffect(() => {
    
    const canvas: any = canvasRef.current;
    const context = canvas.getContext(options.context || '2d');
    let frameCount = 0;
    let animationFrameId: number;
    const render = () => {
      frameCount++;
      draw(context, frameCount);
      animationFrameId = window.requestAnimationFrame(render);
    }
    render();
    return () => {
      window.cancelAnimationFrame(animationFrameId);
    }
  }, [draw])
  return canvasRef;
}
export default useCanvas;