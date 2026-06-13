/**
 * Screenshot capture and conversion utilities for HDV export
 */

/**
 * Loads an image from a URL and converts it to Apple II hi-res format
 * @param imageUrl URL to load (http/https, data URL, or relative path)
 * @returns Hi-res binary data (8KB for 280×192) or null if load fails
 */
export const loadAndConvertImageToHires = async (imageUrl?: string): Promise<Uint8Array | null> => {
  if (!imageUrl) return null
  
  try {
    let url = imageUrl
    
    // Handle relative URLs
    if (!url.startsWith("http://") && !url.startsWith("https://") && !url.startsWith("data:")) {
      url = new URL(url, window.location.href).toString()
    }
    
    return new Promise((resolve) => {
      const img = new Image()
      img.crossOrigin = "anonymous"
      img.onload = () => {
        try {
          const canvas = document.createElement("canvas")
          canvas.width = 280
          canvas.height = 192
          const ctx = canvas.getContext("2d")
          if (!ctx) {
            resolve(null)
            return
          }
          
          // Clear and draw image scaled to hi-res dimensions
          ctx.fillStyle = "#000"
          ctx.fillRect(0, 0, 280, 192)
          
          // Scale image to fit canvas while maintaining aspect ratio
          const scale = Math.max(
            canvas.width / img.width,
            canvas.height / img.height
          )
          const x = (canvas.width - img.width * scale) / 2
          const y = (canvas.height - img.height * scale) / 2
          ctx.drawImage(img, x, y, img.width * scale, img.height * scale)
          
          // Convert to hi-res format
          const imageData = ctx.getImageData(0, 0, 280, 192)
          const hiresData = convertCanvasToHires(imageData)
          resolve(hiresData)
        } catch (e) {
          console.error("Error converting image to hi-res:", e)
          resolve(null)
        }
      }
      img.onerror = () => {
        resolve(null)
      }
      img.src = url
    })
  } catch (e) {
    console.error("Error loading image:", e)
    return null
  }
}

/**
 * Converts canvas ImageData to Apple II hi-res format
 * Hi-res format: 40 bytes/row × 192 rows = 8KB total
 * Pixel data is organized by rows, with each byte containing 7 pixels
 */
export const convertCanvasToHires = (imageData: ImageData): Uint8Array => {
  const width = 280
  const height = 192
  const hiresData = new Uint8Array(8192) // Full HGR page ($2000-$3FFF)
  
  for (let y = 0; y < height; y++) {
    // Apple II HGR layout is interleaved in memory, not linear by rows.
    // Offset within page (without $2000 base):
    //   (y % 8) * $400 + ((y / 8) % 8) * $80 + (y / 64) * $28
    const rowBase =
      (y & 0x07) * 0x400 +
      ((y >> 3) & 0x07) * 0x80 +
      ((y >> 6) & 0x03) * 0x28
    
    for (let x = 0; x < width; x += 7) {
      const byteIndex = rowBase + Math.floor(x / 7)
      let byte = 0
      
      for (let bit = 0; bit < 7; bit++) {
        const pixelX = x + bit
        if (pixelX < width) {
          const pixelIndex = (y * width + pixelX) * 4
          // Check if pixel is bright (luminance > threshold)
          const r = imageData.data[pixelIndex]
          const g = imageData.data[pixelIndex + 1]
          const b = imageData.data[pixelIndex + 2]
          const luminance = 0.299 * r + 0.587 * g + 0.114 * b
          if (luminance > 128) {
            byte |= (1 << bit)
          }
        }
      }

      // Bit 7 is the color phase bit; keep it 0 for stable monochrome rendering.
      hiresData[byteIndex] = byte
    }
  }
  
  return hiresData
}

/**
 * Creates menu metadata file containing disk names and screenshot offsets
 * Format:
 * Byte 0: Number of items
 * For each item (40 bytes):
 *   Bytes 0-19: Filename (null-padded)
 *   Bytes 20-22: Screenshot block offset (3 bytes LE, 0=none)
 *   Bytes 23-39: Reserved
 */
export const createMenuMetadata = (
  entries: Array<{ name: string; screenshotBlock?: number }>
): Uint8Array => {
  const totalSize = 1 + entries.length * 40
  const data = new Uint8Array(totalSize)
  
  data[0] = Math.min(entries.length, 255)
  
  for (let i = 0; i < entries.length && i < 255; i++) {
    const offset = 1 + i * 40
    const entry = entries[i]
    
    // Filename (20 bytes, null-padded)
    const name = entry.name.toUpperCase().slice(0, 15)
    for (let j = 0; j < 20; j++) {
      data[offset + j] = j < name.length ? name.charCodeAt(j) : 0
    }
    
    // Screenshot block offset (3 bytes LE)
    const block = entry.screenshotBlock || 0
    data[offset + 20] = block & 0xFF
    data[offset + 21] = (block >> 8) & 0xFF
    data[offset + 22] = (block >> 16) & 0xFF
    // Bytes 23-39 reserved (zeros)
  }
  
  return data
}
