/**
 * Screenshot capture and conversion utilities for HDV export
 */

type Rgb = [number, number, number]

const clamp8 = (v: number): number => Math.max(0, Math.min(255, Math.round(v)))

const sampleBilinear = (imageData: ImageData, x: number, y: number): Rgb => {
  const w = imageData.width
  const h = imageData.height
  const x0 = Math.max(0, Math.min(w - 1, Math.floor(x)))
  const y0 = Math.max(0, Math.min(h - 1, Math.floor(y)))
  const x1 = Math.max(0, Math.min(w - 1, x0 + 1))
  const y1 = Math.max(0, Math.min(h - 1, y0 + 1))
  const fx = Math.max(0, Math.min(1, x - x0))
  const fy = Math.max(0, Math.min(1, y - y0))

  const idx00 = (y0 * w + x0) * 4
  const idx10 = (y0 * w + x1) * 4
  const idx01 = (y1 * w + x0) * 4
  const idx11 = (y1 * w + x1) * 4

  const w00 = (1 - fx) * (1 - fy)
  const w10 = fx * (1 - fy)
  const w01 = (1 - fx) * fy
  const w11 = fx * fy

  const r = imageData.data[idx00] * w00 + imageData.data[idx10] * w10 + imageData.data[idx01] * w01 + imageData.data[idx11] * w11
  const g = imageData.data[idx00 + 1] * w00 + imageData.data[idx10 + 1] * w10 + imageData.data[idx01 + 1] * w01 + imageData.data[idx11 + 1] * w11
  const b = imageData.data[idx00 + 2] * w00 + imageData.data[idx10 + 2] * w10 + imageData.data[idx01 + 2] * w01 + imageData.data[idx11 + 2] * w11
  return [r, g, b]
}

const rgbToYuv = (r: number, g: number, b: number): [number, number, number] => {
  const y = 0.299 * r + 0.587 * g + 0.114 * b
  const u = b - y
  const v = r - y
  return [y, u, v]
}

const colorError = (tr: number, tg: number, tb: number, cr: number, cg: number, cb: number): number => {
  const [ty, tu, tv] = rgbToYuv(tr, tg, tb)
  const [cy, cu, cv] = rgbToYuv(cr, cg, cb)
  const dy = ty - cy
  const du = tu - cu
  const dv = tv - cv
  // Favor luminance to keep structure stable and reduce color-bar instability.
  return dy * dy * 4 + du * du * 0.6 + dv * dv * 0.6
}

const APPLE2_COLORS = {
  black: [0, 0, 0] as Rgb,
  white: [255, 255, 255] as Rgb,
  green: [32, 224, 32] as Rgb,
  purple: [212, 32, 255] as Rgb,
  orange: [255, 128, 16] as Rgb,
  blue: [32, 112, 255] as Rgb,
}

const smoothRowChroma = (row: Uint8Array): Uint8Array => {
  const out = new Uint8Array(row.length)
  const w = 560
  const yVals = new Float32Array(w)
  const uVals = new Float32Array(w)
  const vVals = new Float32Array(w)
  const uSm = new Float32Array(w)
  const vSm = new Float32Array(w)
  const kernel = [1, 2, 3, 4, 3, 2, 1]
  const norm = 16

  for (let x = 0; x < w; x++) {
    const off = x * 3
    const r = row[off]
    const g = row[off + 1]
    const b = row[off + 2]
    const [y, u, v] = rgbToYuv(r, g, b)
    yVals[x] = y
    uVals[x] = u
    vVals[x] = v
  }

  for (let x = 0; x < w; x++) {
    let su = 0
    let sv = 0
    for (let k = -3; k <= 3; k++) {
      const sx = Math.max(0, Math.min(w - 1, x + k))
      const kw = kernel[k + 3]
      su += uVals[sx] * kw
      sv += vVals[sx] * kw
    }
    uSm[x] = su / norm
    vSm[x] = sv / norm
  }

  for (let x = 0; x < w; x++) {
    const y = yVals[x]
    const u = uSm[x]
    const v = vSm[x]
    const r = y + v
    const b = y + u
    const g = (y - 0.299 * r - 0.114 * b) / 0.587
    const off = x * 3
    out[off] = clamp8(r)
    out[off + 1] = clamp8(g)
    out[off + 2] = clamp8(b)
  }

  return out
}

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
          canvas.width = 560
          canvas.height = 192
          const ctx = canvas.getContext("2d")
          if (!ctx) {
            resolve(null)
            return
          }
          
          // Clear and draw image scaled to hi-res dimensions.
          // Mixed mode only shows top 160 lines as graphics.
          ctx.fillStyle = "#000"
          ctx.fillRect(0, 0, 560, 192)
          ctx.imageSmoothingEnabled = true
          ctx.drawImage(img, 0, 0, img.width, img.height, 0, 0, 560, 160)
          
          // Convert to hi-res format
          const imageData = ctx.getImageData(0, 0, 560, 192)
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
  const fineWidth = imageData.width
  const fineHeight = imageData.height
  const hiresData = new Uint8Array(8192) // Full HGR page ($2000-$3FFF)
  const rowPhaseSwitchPenalty = 500
  let previousRowPhase = 0

  const getFineX = (xFine: number): number => Math.min(fineWidth - 1, Math.max(0, xFine * fineWidth / 560))
  const getFineY = (y: number): number => Math.min(fineHeight - 1, Math.max(0, y * fineHeight / 192))
  
  for (let y = 0; y < height; y++) {
    // Apple II HGR layout is interleaved in memory, not linear by rows.
    // Offset within page (without $2000 base):
    //   (y % 8) * $400 + ((y / 8) % 8) * $80 + (y / 64) * $28
    const rowBase =
      (y & 0x07) * 0x400 +
      ((y >> 3) & 0x07) * 0x80 +
      ((y >> 6) & 0x03) * 0x28

    const sourceY = getFineY(y)
    const rawRow = new Uint8Array(560 * 3)
    for (let fx = 0; fx < 560; fx++) {
      const [r, g, b] = sampleBilinear(imageData, getFineX(fx) + 0.5, sourceY + 0.5)
      const off = fx * 3
      rawRow[off] = clamp8(r)
      rawRow[off + 1] = clamp8(g)
      rawRow[off + 2] = clamp8(b)
    }
    const filteredRow = smoothRowChroma(rawRow)

    const chosenStateByPhase: number[][] = [new Array(140).fill(0), new Array(140).fill(0)]
    const phaseCost = [0, 0]

    for (let cell = 0; cell < 140; cell++) {
      let tr = 0
      let tg = 0
      let tb = 0
      const fxStart = cell * 4
      for (let i = 0; i < 4; i++) {
        const off = (fxStart + i) * 3
        tr += filteredRow[off]
        tg += filteredRow[off + 1]
        tb += filteredRow[off + 2]
      }
      tr /= 4
      tg /= 4
      tb /= 4

      const tMin = Math.min(tr, tg, tb)
      const tMax = Math.max(tr, tg, tb)
      const tSat = tMax - tMin
      const tLum = 0.299 * tr + 0.587 * tg + 0.114 * tb

      for (let phase = 0; phase <= 1; phase++) {
        const evenColor = phase === 0 ? APPLE2_COLORS.purple : APPLE2_COLORS.blue
        const oddColor = phase === 0 ? APPLE2_COLORS.green : APPLE2_COLORS.orange

        const candidates: Rgb[] = [
          APPLE2_COLORS.black,
          oddColor,
          evenColor,
          APPLE2_COLORS.white,
        ]

        let bestState = 0
        let bestErr = Number.POSITIVE_INFINITY
        for (let state = 0; state < 4; state++) {
          const c = candidates[state]
          let err = colorError(tr, tg, tb, c[0], c[1], c[2])

          // Reduce false color in near-monochrome zones.
          if (state === 1 || state === 2) {
            if (tSat < 30) err += 2600
            if (tSat < 18 && (tLum < 50 || tLum > 175)) err += 2400
          }

          if (err < bestErr) {
            bestErr = err
            bestState = state
          }
        }

        chosenStateByPhase[phase][cell] = bestState
        phaseCost[phase] += bestErr
      }
    }

    const costPhase0 = phaseCost[0] + (previousRowPhase === 0 ? 0 : rowPhaseSwitchPenalty)
    const costPhase1 = phaseCost[1] + (previousRowPhase === 1 ? 0 : rowPhaseSwitchPenalty)
    const rowPhase = costPhase0 <= costPhase1 ? 0 : 1
    previousRowPhase = rowPhase

    const rowBits = new Uint8Array(width)
    for (let cell = 0; cell < 140; cell++) {
      const state = chosenStateByPhase[rowPhase][cell]
      const x = cell * 2
      // state bits are ordered as [b1 b0]: 0=00 black, 1=01 odd color,
      // 2=10 even color, 3=11 white.
      rowBits[x] = (state >> 1) & 1
      rowBits[x + 1] = state & 1
    }
    
    for (let x = 0; x < width; x += 7) {
      const byteIndex = rowBase + Math.floor(x / 7)
      let byte = 0
      
      for (let bit = 0; bit < 7; bit++) {
        const pixelX = x + bit
        if (pixelX < width) {
          if (rowBits[pixelX] !== 0) {
            byte |= (1 << bit)
          }
        }
      }

      if (rowPhase === 1) {
        byte |= 0x80
      }
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
