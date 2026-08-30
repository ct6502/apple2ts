const nativeWidth = 560
const nativeHeight = 384

const fontUrlPattern = /url\((['"]?)([^'")]+\.(?:otf|ttf|woff2?)(?:\?[^'")]*)?)\1\)/gi
const fontDataUrls = new Map<string, Promise<string>>()

const blobToDataUrl = (blob: Blob) => new Promise<string>((resolve, reject) => {
  const reader = new FileReader()
  reader.onload = () => resolve(String(reader.result))
  reader.onerror = () => reject(reader.error)
  reader.readAsDataURL(blob)
})

const inlineFontUrl = (url: string) => {
  const absoluteUrl = new URL(url, document.baseURI).href
  let dataUrl = fontDataUrls.get(absoluteUrl)
  if (!dataUrl) {
    dataUrl = fetch(absoluteUrl)
      .then(response => {
        if (!response.ok) throw new Error(`Unable to load font: ${response.status}`)
        return response.blob()
      })
      .then(blobToDataUrl)
      .catch(() => absoluteUrl)
    fontDataUrls.set(absoluteUrl, dataUrl)
  }
  return dataUrl
}

const getDocumentCss = async () => {
  const css = Array.from(document.styleSheets).flatMap(styleSheet => {
    try {
      return Array.from(styleSheet.cssRules, rule => rule.cssText)
        .filter(rule => /retro-|PrintChar21Retro/i.test(rule))
    } catch {
      return []
    }
  }).join("\n")
  const matches = Array.from(css.matchAll(fontUrlPattern))
  const replacements = await Promise.all(matches.map(match => inlineFontUrl(match[2])))
  let index = 0
  return css.replace(fontUrlPattern, () => `url("${replacements[index++]}")`)
}

const serializedStyle = (element: HTMLElement) => {
  const customProperties = Array.from(element.style)
    .filter(property => property.startsWith("--retro-"))
    .map(property => `${property}:${element.style.getPropertyValue(property)}`)
    .join(";")
  return `${customProperties};position:absolute;inset:0;width:${nativeWidth}px;height:${nativeHeight}px;` +
    "--retro-scale:1;--retro-viewport-width:560px;--retro-viewport-height:384px"
}

export const createRetroPanelSvg = async (
  panel: HTMLElement,
  nativeSurface: HTMLElement,
  width = nativeWidth,
  height = nativeHeight,
) => {
  await document.fonts.ready
  const css = await getDocumentCss()
  const clone = nativeSurface.cloneNode(true) as HTMLElement
  clone.style.transform = "none"
  const panelClasses = Array.from(panel.classList)
    .filter(className => !className.startsWith("retro-monitor-") &&
      !className.startsWith("retro-effect-") && className !== "retro-canvas-rendered")
    .join(" ")
  const wrapper = document.createElement("div")
  wrapper.setAttribute("xmlns", "http://www.w3.org/1999/xhtml")
  wrapper.setAttribute("class", panelClasses)
  wrapper.setAttribute("style", serializedStyle(panel))
  wrapper.append(clone)
  const content = new XMLSerializer().serializeToString(wrapper)
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${nativeWidth} ${nativeHeight}">` +
    `<style>${css.replaceAll("&", "&amp;").replaceAll("<", "&lt;")}</style>` +
    `<foreignObject width="${nativeWidth}" height="${nativeHeight}">${content}</foreignObject></svg>`
}

export const renderRetroPanelToCanvas = async (
  panel: HTMLElement,
  nativeSurface: HTMLElement,
  canvas: HTMLCanvasElement,
  width = nativeWidth,
  height = nativeHeight,
) => {
  const svg = await createRetroPanelSvg(panel, nativeSurface, width, height)
  const image = new Image()
  await new Promise<void>((resolve, reject) => {
    image.onload = () => resolve()
    image.onerror = () => reject(new Error("Unable to render control panel SVG"))
    image.src = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`
  })
  canvas.width = width
  canvas.height = height
  const context = canvas.getContext("2d")
  if (!context) throw new Error("Unable to create control panel canvas context")
  context.clearRect(0, 0, width, height)
  context.drawImage(image, 0, 0, width, height)
}
