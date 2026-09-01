const nativeWidth = 560
const nativeHeight = 384

const fontUrlPattern = /url\((['"]?)([^'")]+\.(?:otf|ttf|woff2?)(?:\?[^'")]*)?)\1\)/gi
const fontDataUrls = new Map<string, Promise<string>>()
const maxCachedPanelImages = 32
const panelImages = new Map<string, Promise<HTMLImageElement>>()
let documentCssCache: { styleSheets: CSSStyleSheet[], value: Promise<string> } | null = null

const blobToDataUrl = (blob: Blob) => new Promise<string>((resolve, reject) => {
  const reader = new FileReader()
  reader.onload = () => resolve(String(reader.result))
  reader.onerror = () => reject(reader.error)
  reader.readAsDataURL(blob)
})

const inlineFontUrl = (url: string, baseUrl: string) => {
  const absoluteUrl = new URL(url, baseUrl).href
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
  const styleSheets = Array.from(document.styleSheets)
  if (documentCssCache && styleSheets.length === documentCssCache.styleSheets.length &&
    styleSheets.every((styleSheet, index) => styleSheet === documentCssCache?.styleSheets[index])) {
    return documentCssCache.value
  }
  const value = Promise.resolve().then(async () => {
    const css = await Promise.all(styleSheets.map(async styleSheet => {
      try {
        const rules = Array.from(styleSheet.cssRules, rule => rule.cssText)
          .filter(rule => /retro-|font-family:\s*PrintChar21(?:\s*;|\s*})/i.test(rule))
          .join("\n")
        const matches = Array.from(rules.matchAll(fontUrlPattern))
        const baseUrl = styleSheet.href ?? document.baseURI
        const replacements = await Promise.all(matches.map(match => inlineFontUrl(match[2], baseUrl)))
        let index = 0
        return rules.replace(fontUrlPattern, () => `url("${replacements[index++]}")`)
      } catch {
        return ""
      }
    }))
    return css.join("\n")
  })
  documentCssCache = { styleSheets, value }
  return value
}

const getPanelImage = (svg: string) => {
  const cached = panelImages.get(svg)
  if (cached) {
    panelImages.delete(svg)
    panelImages.set(svg, cached)
    return cached
  }
  const image = new Image()
  const loaded = new Promise<HTMLImageElement>((resolve, reject) => {
    image.onload = () => resolve(image)
    image.onerror = () => reject(new Error("Unable to render control panel SVG"))
    image.src = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`
  }).catch(error => {
    panelImages.delete(svg)
    throw error
  })
  panelImages.set(svg, loaded)
  if (panelImages.size > maxCachedPanelImages) {
    panelImages.delete(panelImages.keys().next().value!)
  }
  return loaded
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
      !className.startsWith("retro-effect-") && !className.startsWith("retro-canvas-"))
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
  const image = await getPanelImage(svg)
  canvas.width = width
  canvas.height = height
  const context = canvas.getContext("2d")
  if (!context) throw new Error("Unable to create control panel canvas context")
  context.clearRect(0, 0, width, height)
  context.drawImage(image, 0, 0, width, height)
}
