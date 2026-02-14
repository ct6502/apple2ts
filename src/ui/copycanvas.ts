import { convertTextPageValueToASCII } from "../common/utility"
import { handleGetAltCharSet, handleGetMachineName, handleGetTextPage } from "./main2worker"

export const copyCanvas = (handleBlob: (blob: Blob) => void, thumbnail = false) => {
  const canvas = document.getElementById("hiddenCanvas") as HTMLCanvasElement
if (!canvas) return
  let copyCanvas = canvas
  if (thumbnail) {
    copyCanvas = document.createElement("canvas")
    copyCanvas.height = 128
    copyCanvas.width = copyCanvas.height * 1.333333
    // The willReadFrequently is a performance optimization hint that does
    // the rendering in software rather than hardware. This is better because
    // we're just reading back pixels from the canvas.
    const ctx = copyCanvas.getContext("2d", { willReadFrequently: true })
    if (!ctx) return
    ctx.imageSmoothingEnabled = false
    ctx.drawImage(canvas, 0, 0, 560, 384,
      0, 0, copyCanvas.width, copyCanvas.height)
  }
  copyCanvas.toBlob((blob) => {
    if (blob) handleBlob(blob)
  })
}

  /**
   * For text mode, copy all of the screen text.
   * For graphics mode, do a bitmap copy of the canvas.
   */
export const handleCopyToClipboard = () => {
  const textPage = handleGetTextPage()
  if (textPage.length === 960 || textPage.length === 1920) {
    const nchars = textPage.length / 24
    const machineName = handleGetMachineName()
    const isAltCharSet = machineName === "APPLE2P" ? false : handleGetAltCharSet()
    const hasLowerCase = machineName !== "APPLE2P"
    const useApple2PlusMap = machineName === "APPLE2P"
    let output = ""
    const hasMouseText = machineName === "APPLE2EE"
    for (let j = 0; j < 24; j++) {
      let line = ""
      for (let i = 0; i < nchars; i++) {
        const value = textPage[j * nchars + i]
        const c = convertTextPageValueToASCII(
          value, isAltCharSet, hasMouseText, hasLowerCase, useApple2PlusMap
        )
        line += c
      }
      line = line.trim()
      output += line + "\n"
    }
    navigator.clipboard.writeText(output)
  } else {
    try {
      copyCanvas((blob) => {
        navigator.clipboard.write([new ClipboardItem({ "image/png": blob, })])
      })
    }
    catch (error) {
      console.error(error)
    }
  }
}
  
