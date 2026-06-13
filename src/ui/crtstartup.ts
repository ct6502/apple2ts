import { COLOR_MODE } from "../common/utility"
import { getCrtDistortion } from "./ui_settings"

// Animate a CRT turning on effect using canvas
export const doCRTStartup = (ctx: CanvasRenderingContext2D, colorMode: COLOR_MODE,
  xmargin: number, ymargin: number) => {
  const width = ctx.canvas.width
  const height = ctx.canvas.height
  const xmarginPx = xmargin * width
  const ymarginPx = ymargin * height
  const imgWidth = width - 2 * xmarginPx
  const imgHeight = height - 2 * ymarginPx
  
  // Determine color based on color mode
  let color: string
  let glowColor: string
  if (colorMode === COLOR_MODE.GREEN) {
    color = "#88ff8840"
    glowColor = "rgba(136, 255, 136, 0.8)"
  } else if (colorMode === COLOR_MODE.AMBER) {
    color = "#ffb00040"
    glowColor = "rgba(255, 176, 0, 0.8)"
  } else {
    color = "#ffffff40"
    glowColor = "rgba(255, 255, 255, 0.8)"
  }
  
  const startTime = Date.now()
  const duration = 250 // milliseconds
  const crtDistort = getCrtDistortion()
  
  const animate = () => {
    const elapsed = Date.now() - startTime
    const progress = Math.min(elapsed / duration, 1)
    
    if (progress < 1) {
      // Clear entire canvas (transparent to show background image bezel)
      ctx.clearRect(0, 0, width, height)
      
      // Fill only the screen area with black (within margins)
      ctx.fillStyle = "black"
      ctx.fillRect(xmarginPx, ymarginPx, imgWidth, imgHeight)
      
      // Draw horizontal scan line effect within margins
      const centerY = ymarginPx + imgHeight / 2
      const lineHeight = Math.min(imgHeight * progress * 1.3, imgHeight)
      const lineTop = centerY - lineHeight / 2
      const lineBottom = centerY + lineHeight / 2
      
      // Create gradient for the scanning effect
      const gradient = ctx.createLinearGradient(0, lineTop, 0, lineBottom)
      gradient.addColorStop(0, "rgba(0, 0, 0, 0)")
      gradient.addColorStop(0.01, color)
      gradient.addColorStop(0.5, glowColor)
      gradient.addColorStop(0.99, color)
      gradient.addColorStop(1, "rgba(0, 0, 0, 0)")
      
      ctx.fillStyle = gradient
      
      if (crtDistort) {
        // Draw with barrel distortion - bow out the sides
        const distortionStrength = 0.02 // How much to bow out
        
        for (let y = lineTop; y < lineBottom; y++) {
          // Calculate distance from vertical center (0 at center, 1 at edges)
          const normalizedY = (y - (ymarginPx + imgHeight / 2)) / (imgHeight / 2)
          
          // Barrel distortion: bow out at center, less at edges
          const distortion = 1 + distortionStrength * (1 - normalizedY * normalizedY)
          
          // Calculate extended width
          const extendedWidth = imgWidth * distortion
          const widthDiff = extendedWidth - imgWidth
          
          ctx.fillRect(xmarginPx - widthDiff / 2, y, extendedWidth, 1)
        }
      } else {
        ctx.fillRect(xmarginPx, lineTop, imgWidth, lineBottom - lineTop)
      }
      
      requestAnimationFrame(animate)
    }
  }
  
  animate()
}
