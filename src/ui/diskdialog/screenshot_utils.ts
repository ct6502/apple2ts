/**
 * Screenshot capture and conversion utilities for HDV export
 */

type Rgb = [number, number, number]

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

/**
 * Loads watermark artwork from runningGuy.gif.
 * Uses ImageDecoder when available so exports can use successive animated frames.
 */
const RUNNING_GUY_URL = "assets/runningGuy.gif"
const FALLBACK_WATERMARK_URL = "logo48x48.png"

let fallbackWatermarkPromise: Promise<HTMLImageElement | null> | null = null
const loadFallbackWatermarkImage = (): Promise<HTMLImageElement | null> => {
  if (!fallbackWatermarkPromise) {
    fallbackWatermarkPromise = new Promise((resolve) => {
      const img = new Image()
      img.onload = () => resolve(img)
      img.onerror = () => resolve(null)
      img.src = new URL(FALLBACK_WATERMARK_URL, window.location.href).toString()
    })
  }
  return fallbackWatermarkPromise
}

let runningGuyDataPromise: Promise<ArrayBuffer | null> | null = null
const loadRunningGuyGifData = async (): Promise<ArrayBuffer | null> => {
  if (!runningGuyDataPromise) {
    runningGuyDataPromise = (async () => {
      try {
        const response = await fetch(new URL(RUNNING_GUY_URL, window.location.href).toString())
        if (!response.ok) return null
        return await response.arrayBuffer()
      } catch {
        return null
      }
    })()
  }
  return runningGuyDataPromise
}

const runningGuyFrameCache = new Map<number, HTMLCanvasElement>()

const getRunningGuyFrameCanvas = async (frameIndex: number): Promise<HTMLCanvasElement | null> => {
  if (typeof ImageDecoder === "undefined") {
    return null
  }

  try {
    const data = await loadRunningGuyGifData()
    if (!data) return null

    const decoder = new ImageDecoder({ data, type: "image/gif" })
    await decoder.tracks.ready
    const frameCount = decoder.tracks.selectedTrack?.frameCount || 1
    const safeFrame = ((frameIndex % frameCount) + frameCount) % frameCount

    const cached = runningGuyFrameCache.get(safeFrame)
    if (cached) {
      return cached
    }

    const result = await decoder.decode({ frameIndex: safeFrame })
    const image = result.image
    const canvas = document.createElement("canvas")
    canvas.width = image.displayWidth
    canvas.height = image.displayHeight
    const ctx = canvas.getContext("2d")
    if (!ctx) {
      image.close()
      return null
    }

    ctx.clearRect(0, 0, canvas.width, canvas.height)
    ctx.drawImage(image, 0, 0)
    image.close()
    runningGuyFrameCache.set(safeFrame, canvas)
    return canvas
  } catch {
    return null
  }
}

const LOGO_NATIVE_SIZE = 48
const LOGO_OUTLINE = 2

// 8-neighbor dilation of a binary mask by one pixel.
const dilateMask = (mask: Uint8Array, size: number): Uint8Array => {
  const out = new Uint8Array(mask.length)
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      if (mask[y * size + x]) {
        out[y * size + x] = 1
        continue
      }
      let hit = 0
      for (let dy = -1; dy <= 1 && !hit; dy++) {
        for (let dx = -1; dx <= 1; dx++) {
          const nx = x + dx
          const ny = y + dy
          if (nx < 0 || ny < 0 || nx >= size || ny >= size) continue
          if (mask[ny * size + nx]) {
            hit = 1
            break
          }
        }
      }
      out[y * size + x] = hit
    }
  }
  return out
}

/**
 * Stamps the logo into an already-converted hi-res page in its original colors
 * with a black/white outline so it reads clearly on any background. The logo is
 * converted to hi-res in isolation (without dithering, so its small footprint
 * stays crisp), then only the logo and its outline pixels are composited into
 * the page — leaving the rest of the screenshot untouched.
 */
const stampLogoIntoHires = (hiresData: Uint8Array, logo: CanvasImageSource): void => {
  const logoSize = LOGO_NATIVE_SIZE
  const outline = LOGO_OUTLINE
  const stampSize = logoSize + outline * 2 // 52: leaves room for the outline ring

  // 1. Rasterize the logo, inset by the outline width, on a transparent canvas.
  const stampCanvas = document.createElement("canvas")
  stampCanvas.width = stampSize
  stampCanvas.height = stampSize
  const sctx = stampCanvas.getContext("2d")
  if (!sctx) return
  sctx.imageSmoothingEnabled = true
  sctx.drawImage(logo, outline, outline, logoSize, logoSize)
  const stamp = sctx.getImageData(0, 0, stampSize, stampSize)
  const sd = stamp.data

  // 2. Body mask = opaque logo pixels; dilate twice for two 1px outline rings.
  const body = new Uint8Array(stampSize * stampSize)
  for (let i = 0; i < body.length; i++) {
    body[i] = sd[i * 4 + 3] > 128 ? 1 : 0
  }
  const dil1 = dilateMask(body, stampSize) // body + inner ring
  const dil2 = dilateMask(dil1, stampSize) // body + inner ring + outer ring

  // 3. Paint the outline: inner ring white, outer ring black, rest transparent.
  for (let i = 0; i < body.length; i++) {
    if (body[i]) continue // keep the original logo color
    const o = i * 4
    if (dil1[i]) {
      sd[o] = 255; sd[o + 1] = 255; sd[o + 2] = 255; sd[o + 3] = 255
    } else if (dil2[i]) {
      sd[o] = 0; sd[o + 1] = 0; sd[o + 2] = 0; sd[o + 3] = 255
    } else {
      sd[o + 3] = 0
    }
  }
  sctx.putImageData(stamp, 0, 0)
  const covered = dil2

  // 4. Convert the stamp to hi-res in isolation at its final absolute position
  //    (upper-right corner of the screen). The fine canvas is 560 wide (2×
  //    native horizontally) × 192 tall, so x parity and byte/palette layout
  //    match the page exactly. Dithering is disabled so the logo stays crisp.
  const originX = 280 - stampSize // 228
  const originY = 0 // upper-right corner
  const fineCanvas = document.createElement("canvas")
  fineCanvas.width = 560
  fineCanvas.height = 192
  const fctx = fineCanvas.getContext("2d")
  if (!fctx) return
  fctx.fillStyle = "#000"
  fctx.fillRect(0, 0, 560, 192)
  fctx.imageSmoothingEnabled = false
  fctx.drawImage(stampCanvas, originX * 2, originY, stampSize * 2, stampSize)
  const logoHires = convertCanvasToHires(fctx.getImageData(0, 0, 560, 192), false)

  // 5. Composite only the covered pixels into the page, copying each affected
  //    byte's palette high bit so the logo's colors render correctly.
  for (let sy = 0; sy < stampSize; sy++) {
    const y = originY + sy
    const rowBase =
      (y & 0x07) * 0x400 +
      ((y >> 3) & 0x07) * 0x80 +
      ((y >> 6) & 0x03) * 0x28
    for (let sx = 0; sx < stampSize; sx++) {
      if (!covered[sy * stampSize + sx]) continue
      const x = originX + sx
      const byteIndex = rowBase + Math.floor(x / 7)
      const bit = 1 << (x % 7)
      if ((logoHires[byteIndex] >> (x % 7)) & 1) hiresData[byteIndex] |= bit
      else hiresData[byteIndex] &= ~bit
      hiresData[byteIndex] = (hiresData[byteIndex] & 0x7f) | (logoHires[byteIndex] & 0x80)
    }
  }
}

// localStorage key prefix for cached screenshot data URLs (keyed by absolute source URL).
const SCREENSHOT_CACHE_PREFIX = "ssc-"

// Once localStorage is exhausted and eviction fails, stop attempting writes for the rest of
// the session so we don't log a quota warning for every screenshot.
let screenshotCacheWritesDisabled = false

const isQuotaExceededError = (e: unknown): boolean => {
  return e instanceof DOMException &&
    (e.name === "QuotaExceededError" || e.name === "NS_ERROR_DOM_QUOTA_REACHED" || e.code === 22 || e.code === 1014)
}

// Removes cached screenshot entries to free localStorage space. Returns true if any were removed.
const evictCachedScreenshots = (): boolean => {
  try {
    const keys: string[] = []
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i)
      if (key && key.startsWith(SCREENSHOT_CACHE_PREFIX)) keys.push(key)
    }
    if (keys.length === 0) return false
    for (const key of keys) localStorage.removeItem(key)
    return true
  } catch {
    return false
  }
}

const readCachedScreenshotDataUrl = (absoluteUrl: string): string | undefined => {
  try {
    return localStorage.getItem(SCREENSHOT_CACHE_PREFIX + absoluteUrl) || undefined
  } catch {
    return undefined
  }
}

const writeCachedScreenshotDataUrl = (absoluteUrl: string, dataUrl: string) => {
  if (screenshotCacheWritesDisabled) return
  const key = SCREENSHOT_CACHE_PREFIX + absoluteUrl
  try {
    localStorage.setItem(key, dataUrl)
  } catch (e) {
    if (isQuotaExceededError(e) && evictCachedScreenshots()) {
      // Freed space by evicting older cached screenshots; retry once.
      try {
        localStorage.setItem(key, dataUrl)
        return
      } catch {
        // Still over quota even after eviction.
      }
    }
    // localStorage is unavailable or over quota; caching is best-effort. Disable further
    // write attempts so we don't log this warning for every remaining screenshot.
    screenshotCacheWritesDisabled = true
    console.warn("Disabling screenshot local storage cache (unavailable or over quota):", e)
  }
}

/**
 * Normalizes a screenshot URL to an absolute cache key, or returns undefined for URLs that
 * should not be cached (data URLs are already local).
 */
const screenshotCacheKey = (imageUrl: string): string | undefined => {
  if (imageUrl.startsWith("data:")) return undefined
  return (imageUrl.startsWith("http://") || imageUrl.startsWith("https://"))
    ? imageUrl
    : new URL(imageUrl, window.location.href).toString()
}

/**
 * Resolves a screenshot URL against the localStorage cache WITHOUT issuing any network
 * request. Returns the source to load (a cached data URL when available, otherwise the
 * original/absolute URL) plus the cache key to store the image under after it loads. The
 * caller loads the returned url via an <img> element exactly as before — so this adds no
 * extra HTTP requests that could compete with other in-flight fetches (e.g. the connection-
 * limited CORS proxy used for Internet Archive resolution).
 */
export const resolveScreenshotUrlWithCache = (imageUrl: string): { url: string; cacheKey?: string; cached: boolean } => {
  const cacheKey = screenshotCacheKey(imageUrl)
  if (!cacheKey) return { url: imageUrl, cached: true }
  const cached = readCachedScreenshotDataUrl(cacheKey)
  if (cached) return { url: cached, cacheKey, cached: true }
  return { url: cacheKey, cacheKey, cached: false }
}

/**
 * Encodes an already-loaded image to a data URL and stores it in the localStorage cache so
 * subsequent exports resolve it locally. Uses the loaded <img> (no new network request); a
 * cross-origin image without CORS headers taints the canvas and toDataURL throws, in which
 * case it simply isn't cached (best-effort).
 */
const cacheLoadedScreenshot = (img: HTMLImageElement, cacheKey: string) => {
  try {
    const canvas = document.createElement("canvas")
    canvas.width = img.naturalWidth || img.width
    canvas.height = img.naturalHeight || img.height
    if (canvas.width === 0 || canvas.height === 0) return
    const ctx = canvas.getContext("2d")
    if (!ctx) return
    ctx.drawImage(img, 0, 0)
    writeCachedScreenshotDataUrl(cacheKey, canvas.toDataURL("image/png"))
  } catch {
    // Tainted canvas (cross-origin image without CORS) — can't read it back to cache.
  }
}

/**
 * Loads an image from a URL and converts it to Apple II hi-res format
 * @param imageUrl URL to load (http/https, data URL, or relative path)
 * @param stampLogo When true, watermarks the export screenshot.
 * @param watermarkFrameIndex Frame index used for animated runningGuy.gif watermark.
 * @returns Hi-res binary data (8KB for 280×192) or null if load fails
 */
export const loadAndConvertImageToHires = async (
  imageUrl?: string,
  stampLogo = false,
  watermarkFrameIndex = 0,
): Promise<Uint8Array | null> => {
  const logo = stampLogo ? await loadFallbackWatermarkImage() : null
  const watermark = stampLogo
    ? (await getRunningGuyFrameCanvas(watermarkFrameIndex)) || logo
    : null
  const buildFallbackHires = (): Uint8Array | null => {
    if (!stampLogo) return null
    const hiresData = new Uint8Array(8192)
    if (watermark) stampLogoIntoHires(hiresData, watermark)
    return hiresData
  }

  if (!imageUrl) return buildFallbackHires()

  try {
    // Resolve against the localStorage cache without issuing any network request: on a hit
    // we load a cached data URL, on a miss we load the original URL via <img> (as before)
    // and cache the decoded image afterwards. This avoids adding extra fetches that could
    // compete with the connection-limited CORS proxy used for Internet Archive resolution.
    const { url, cacheKey, cached } = resolveScreenshotUrlWithCache(imageUrl)

    return new Promise((resolve) => {
      const img = new Image()
      img.crossOrigin = "anonymous"
      img.onload = () => {
        try {
          if (!cached && cacheKey) cacheLoadedScreenshot(img, cacheKey)
          const canvas = document.createElement("canvas")
          canvas.width = 560
          canvas.height = 192
          const ctx = canvas.getContext("2d")
          if (!ctx) {
            resolve(buildFallbackHires())
            return
          }
          
          // Clear and draw image scaled to hi-res dimensions.
          // Mixed mode only shows top 160 lines as graphics.
          ctx.fillStyle = "#000"
          ctx.fillRect(0, 0, 560, 192)
          ctx.imageSmoothingEnabled = true
          ctx.drawImage(img, 0, 0, img.width, img.height, 0, 0, 560, 160)

          // Convert to hi-res format, then stamp the logo directly into the
          // hi-res bytes so it stays crisp instead of being blurred/fringed by
          // the color-matching pipeline.
          const imageData = ctx.getImageData(0, 0, 560, 192)
          const hiresData = convertCanvasToHires(imageData)
          if (watermark) stampLogoIntoHires(hiresData, watermark)
          resolve(hiresData)
        } catch (e) {
          console.error("Error converting image to hi-res:", e)
          resolve(buildFallbackHires())
        }
      }
      img.onerror = () => {
        resolve(buildFallbackHires())
      }
      img.src = url
    })
  } catch (e) {
    console.error("Error loading image:", e)
    return buildFallbackHires()
  }
}

/**
 * Converts canvas ImageData to Apple II hi-res format (8KB page, 280×192).
 *
 * The color conversion is adapted from Bill Buckels' royalty-free Bmp2DHR
 * (which itself credits Sheldon Simms' tohgr): every scanline is dithered
 * twice — once assuming the Orange-Blue HGR palette and once assuming the
 * Green-Violet palette — and then, for each 7-dot byte, the palette giving the
 * lower accumulated error is selected. A final pass dithers each color cell
 * against its byte's chosen palette with Floyd–Steinberg error diffusion.
 *
 * @param imageData Source pixels, expected 560×192 (2× native horizontally).
 * @param dither When false (logo/sprite path) the image is quantized with no
 *   error diffusion so small graphics stay crisp.
 * @param ditherStrength Fraction (0–1) of the quantization error that is
 *   diffused to neighboring cells. Lower values reduce the speckly "fuzz" in
 *   flat areas (at the cost of some banding); 1 is full Floyd–Steinberg.
 */
export const convertCanvasToHires = (imageData: ImageData, dither = true, ditherStrength = 0.3): Uint8Array => {
  const width = 280
  const height = 192
  const cells = 140
  const bytesPerRow = 40
  const fineWidth = imageData.width
  const fineHeight = imageData.height
  const hiresData = new Uint8Array(8192) // Full HGR page ($2000-$3FFF)

  // HGR color cell states: 0 black, 1 odd-column color, 2 even-column color,
  // 3 white. The odd/even colors depend on the byte's palette (high) bit:
  //   Orange-Blue  (high bit set):   odd = orange, even = blue
  //   Green-Violet (high bit clear): odd = green,  even = violet
  const paletteOB: Rgb[] = [APPLE2_COLORS.black, APPLE2_COLORS.orange, APPLE2_COLORS.blue, APPLE2_COLORS.white]
  const paletteGV: Rgb[] = [APPLE2_COLORS.black, APPLE2_COLORS.green, APPLE2_COLORS.purple, APPLE2_COLORS.white]

  const getFineX = (xFine: number): number => Math.min(fineWidth - 1, Math.max(0, xFine * fineWidth / 560))
  const getFineY = (y: number): number => Math.min(fineHeight - 1, Math.max(0, y * fineHeight / 192))

  // The 7-dot byte that a color cell's even dot (column 2*cell) falls in.
  const cellByte = (cell: number): number => Math.floor((cell * 2) / 7)

  // Index of the nearest palette entry to an RGB target.
  const nearest = (palette: Rgb[], r: number, g: number, b: number): number => {
    let best = 0
    let bestErr = Number.POSITIVE_INFINITY
    for (let s = 0; s < 4; s++) {
      const c = palette[s]
      const err = colorError(r, g, b, c[0], c[1], c[2])
      if (err < bestErr) {
        bestErr = err
        best = s
      }
    }
    return best
  }

  // Bmp2DHR palette-test pass: dither a copy of the line against one palette,
  // diffusing error forward within the line only, and report the absolute
  // error per cell (used to pick the per-byte palette).
  const testPaletteError = (sr: Float32Array, sg: Float32Array, sb: Float32Array, palette: Rgb[]): Float32Array => {
    const lr = sr.slice()
    const lg = sg.slice()
    const lb = sb.slice()
    const err = new Float32Array(cells)
    for (let c = 0; c < cells; c++) {
      const col = palette[nearest(palette, lr[c], lg[c], lb[c])]
      const eR = lr[c] - col[0]
      const eG = lg[c] - col[1]
      const eB = lb[c] - col[2]
      err[c] = Math.abs(eR) + Math.abs(eG) + Math.abs(eB)
      if (dither && c + 1 < cells) {
        lr[c + 1] += eR * 7 / 16 * ditherStrength
        lg[c + 1] += eG * 7 / 16 * ditherStrength
        lb[c + 1] += eB * 7 / 16 * ditherStrength
      }
    }
    return err
  }

  // Error diffused down from the previous row, per color cell.
  let rowErrR = new Float32Array(cells)
  let rowErrG = new Float32Array(cells)
  let rowErrB = new Float32Array(cells)

  for (let y = 0; y < height; y++) {
    // Apple II HGR layout is interleaved in memory, not linear by rows.
    //   (y % 8) * $400 + ((y / 8) % 8) * $80 + (y / 64) * $28
    const rowBase =
      (y & 0x07) * 0x400 +
      ((y >> 3) & 0x07) * 0x80 +
      ((y >> 6) & 0x03) * 0x28

    const sourceY = getFineY(y)

    // Sample 140 color cells (4 fine pixels each) and fold in the error
    // diffused down from the row above.
    const baseR = new Float32Array(cells)
    const baseG = new Float32Array(cells)
    const baseB = new Float32Array(cells)
    for (let c = 0; c < cells; c++) {
      let tr = 0
      let tg = 0
      let tb = 0
      for (let i = 0; i < 4; i++) {
        const [r, g, b] = sampleBilinear(imageData, getFineX(c * 4 + i) + 0.5, sourceY + 0.5)
        tr += r
        tg += g
        tb += b
      }
      baseR[c] = tr / 4 + rowErrR[c]
      baseG[c] = tg / 4 + rowErrG[c]
      baseB[c] = tb / 4 + rowErrB[c]
    }

    // Pick the palette per byte: dither the line under both palettes and keep
    // whichever has the lower accumulated error over the byte's 7 dots.
    const obErr = testPaletteError(baseR, baseG, baseB, paletteOB)
    const gvErr = testPaletteError(baseR, baseG, baseB, paletteGV)
    const byteIsOB = new Uint8Array(bytesPerRow)
    const obSum = new Float32Array(bytesPerRow)
    const gvSum = new Float32Array(bytesPerRow)
    for (let c = 0; c < cells; c++) {
      const b = cellByte(c)
      obSum[b] += obErr[c]
      gvSum[b] += gvErr[c]
    }
    for (let b = 0; b < bytesPerRow; b++) {
      // Ties go to Orange-Blue, matching Bmp2DHR.
      byteIsOB[b] = gvSum[b] < obSum[b] ? 0 : 1
    }

    // Final pass: dither each cell against its byte's palette with full
    // Floyd–Steinberg diffusion (forward in the row and down to the next).
    const rowBits = new Uint8Array(width)
    const nextErrR = new Float32Array(cells)
    const nextErrG = new Float32Array(cells)
    const nextErrB = new Float32Array(cells)
    for (let c = 0; c < cells; c++) {
      const palette = byteIsOB[cellByte(c)] ? paletteOB : paletteGV
      const dr = baseR[c]
      const dg = baseG[c]
      const db = baseB[c]
      const state = nearest(palette, dr, dg, db)
      const col = palette[state]

      if (dither) {
        const eR = (dr - col[0]) * ditherStrength
        const eG = (dg - col[1]) * ditherStrength
        const eB = (db - col[2]) * ditherStrength
        if (c + 1 < cells) {
          baseR[c + 1] += eR * 7 / 16
          baseG[c + 1] += eG * 7 / 16
          baseB[c + 1] += eB * 7 / 16
          nextErrR[c + 1] += eR / 16
          nextErrG[c + 1] += eG / 16
          nextErrB[c + 1] += eB / 16
        }
        if (c - 1 >= 0) {
          nextErrR[c - 1] += eR * 3 / 16
          nextErrG[c - 1] += eG * 3 / 16
          nextErrB[c - 1] += eB * 3 / 16
        }
        nextErrR[c] += eR * 5 / 16
        nextErrG[c] += eG * 5 / 16
        nextErrB[c] += eB * 5 / 16
      }

      const x = c * 2
      // state -> bit pair: 0=00 black, 1=01 odd color, 2=10 even color, 3=11 white.
      rowBits[x] = (state >> 1) & 1
      rowBits[x + 1] = state & 1
    }
    rowErrR = nextErrR
    rowErrG = nextErrG
    rowErrB = nextErrB

    // Pack 7 dots per byte and OR in the byte's palette (high) bit.
    for (let x = 0; x < width; x += 7) {
      const byteIndex = rowBase + Math.floor(x / 7)
      let byte = 0
      for (let bit = 0; bit < 7; bit++) {
        if (rowBits[x + bit] !== 0) byte |= (1 << bit)
      }
      if (byteIsOB[x / 7]) byte |= 0x80
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

