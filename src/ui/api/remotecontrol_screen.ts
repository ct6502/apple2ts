import { ProcessDisplay } from "../graphics"

export const captureRenderedScreen = async () => {
  const canvas = document.getElementById("apple2canvas") as HTMLCanvasElement | null
  const hiddenCanvas = document.getElementById("hiddenCanvas") as HTMLCanvasElement | null
  if (!canvas || !hiddenCanvas) throw new Error("Rendered Apple II screen is unavailable")
  const ctx = canvas.getContext("2d", { willReadFrequently: true })
  const hiddenCtx = hiddenCanvas.getContext("2d", { willReadFrequently: true })
  if (!ctx || !hiddenCtx) throw new Error("Rendered Apple II screen is unavailable")

  // Draw the latest received display state even when animation frames are suspended.
  // Do not run the animation loop's gamepad polling or execution controls.
  ProcessDisplay(ctx, hiddenCtx, canvas.width, canvas.height)

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
