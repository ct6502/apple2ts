const SLOWEST_RENDER_INTERVAL_MS = 1000 / 45
const SCREEN_CAPTURE_TIMEOUT_MS = 1000

const waitForDisplayRefresh = () => {
  const requestedAt = performance.now()
  return new Promise<void>((resolve, reject) => {
    let frameId = 0
    const timeoutId = window.setTimeout(() => {
      window.cancelAnimationFrame(frameId)
      reject(new Error("Rendered Apple II screen did not refresh"))
    }, SCREEN_CAPTURE_TIMEOUT_MS)
    const checkFrame = (timestamp: number) => {
      if (timestamp - requestedAt >= SLOWEST_RENDER_INTERVAL_MS) {
        window.clearTimeout(timeoutId)
        resolve()
      } else {
        frameId = window.requestAnimationFrame(checkFrame)
      }
    }
    frameId = window.requestAnimationFrame(checkFrame)
  })
}

export const captureRenderedScreen = async () => {
  const canvas = document.getElementById("apple2canvas") as HTMLCanvasElement | null
  if (!canvas) throw new Error("Rendered Apple II screen is unavailable")
  await waitForDisplayRefresh()

  const dataUrl = canvas.toDataURL("image/png")
  const prefix = "data:image/png;base64,"
  if (!dataUrl.startsWith(prefix)) throw new Error("Rendered Apple II screen is not a PNG")

  return {
    mimeType: "image/png",
    dataBase64: dataUrl.slice(prefix.length),
    width: canvas.width,
    height: canvas.height,
  }
}
