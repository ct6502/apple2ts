import { Buffer } from "buffer"

export type LinkBuilderContentType = "none" | "text" | "basic" | "hex" | "binary"
export type LinkBuilderCategory = "link" | "disks" | "content" | "machine" | "crt" | "advanced"

export type LinkBuilderState = {
  baseUrl: string
  fragmentUrl: string
  contentType: LinkBuilderContentType
  contentValue: string
  address: string
  run: boolean
  machine: string
  appMode: string
  capsLock: string
  color: string
  crtDistort: string
  debug: string
  ghosting: string
  hotReload: string
  ramDisk: string
  scanlines: string
  sound: string
  speed: string
  tab: string
  theme: string
  tour: string
}

export type LinkBuilderUiState = {
  activeCategory: LinkBuilderCategory
  statusMessage: string
  captureLength: string
  showCaptureDetails: boolean
}

const trimBaseUrl = (baseUrl: string) => baseUrl.replace(/[?#].*$/, "").trim()

export const machineNameToLinkBuilderMachine = (machineName: string) => {
  switch (machineName.toUpperCase()) {
    case "APPLE2P":
      return "apple2p"
    case "APPLE2EU":
      return "apple2eu"
    default:
      return "apple2ee"
  }
}

export const encodeLinkBuilderContentBytes = (
  contentType: LinkBuilderContentType,
  bytes: Uint8Array,
) => {
  switch (contentType) {
    case "hex":
      return Array.from(bytes, byte => byte.toString(16).padStart(2, "0").toUpperCase()).join("")
    case "binary":
      return Buffer.from(bytes).toString("base64")
    default:
      return ""
  }
}

export const sanitizeLinkBuilderContent = (
  contentType: LinkBuilderContentType,
  contentValue: string,
) => {
  switch (contentType) {
    case "hex":
      return contentValue.replace(/[^0-9a-f]/gi, "").toUpperCase()
    case "binary": {
      const collapsed = contentValue.replace(/\s+/g, "")
      if (collapsed.toUpperCase().startsWith("GZIP")) {
        return `GZIP${collapsed.substring(4).replace(/[^A-Za-z0-9+/=]/g, "")}`
      }
      return collapsed.replace(/[^A-Za-z0-9+/=]/g, "")
    }
    default:
      return contentValue
  }
}

export const createDefaultLinkBuilderState = (baseUrl: string, machine = "apple2ee"): LinkBuilderState => ({
  baseUrl: trimBaseUrl(baseUrl),
  fragmentUrl: "",
  contentType: "none",
  contentValue: "",
  address: "300",
  run: true,
  machine,
  appMode: "",
  capsLock: "",
  color: "",
  crtDistort: "",
  debug: "",
  ghosting: "",
  hotReload: "",
  ramDisk: "",
  scanlines: "",
  sound: "",
  speed: "",
  tab: "",
  theme: "",
  tour: "",
})

export const createDefaultLinkBuilderUiState = (): LinkBuilderUiState => ({
  activeCategory: "link",
  statusMessage: "",
  captureLength: "256",
  showCaptureDetails: false,
})

export const parseLinkBuilderStateFromUrl = (rawUrl: string, currentMachine: string) => {
  const parsedUrl = new URL(rawUrl, "https://example.invalid")
  const state = createDefaultLinkBuilderState(
    `${parsedUrl.origin}${parsedUrl.pathname}`.replace("https://example.invalid", ""),
    currentMachine,
  )
  const params = parsedUrl.searchParams

  state.baseUrl = trimBaseUrl(`${parsedUrl.origin}${parsedUrl.pathname}`.replace("https://example.invalid", ""))
  state.fragmentUrl = parsedUrl.hash.length > 1 ? decodeURI(parsedUrl.hash.substring(1)) : ""

  const machine = params.get("machine")
  if (machine) state.machine = machine.toLowerCase()

  state.appMode = params.get("appmode") ?? ""
  state.capsLock = params.get("capslock") ?? ""
  state.color = params.get("color") ?? ""
  state.crtDistort = params.get("crtdistort") ?? ""
  state.debug = params.get("debug") ?? ""
  state.ghosting = params.get("ghosting") ?? ""
  state.hotReload = params.get("hotreload") ?? ""
  state.ramDisk = params.get("ramdisk") ?? ""
  state.scanlines = params.get("scanlines") ?? ""
  state.sound = params.get("sound") ?? ""
  state.speed = params.get("speed") ?? ""
  state.tab = params.get("tab") ?? ""
  state.theme = params.get("theme") ?? ""
  state.tour = params.get("tour") ?? ""
  state.address = params.get("address") ?? state.address
  state.run = !["0", "false"].includes((params.get("run") ?? "").toLowerCase())

  const binary = params.get("binary")
  const hex = params.get("hex")
  const basic = params.get("basic")
  const text = params.get("text")

  if (binary) {
    state.contentType = "binary"
    state.contentValue = sanitizeLinkBuilderContent("binary", binary)
  } else if (hex) {
    state.contentType = "hex"
    state.contentValue = sanitizeLinkBuilderContent("hex", hex)
  } else if (basic) {
    state.contentType = "basic"
    state.contentValue = basic
  } else if (text) {
    state.contentType = "text"
    state.contentValue = text
  }

  return state
}

export const buildLinkBuilderUrl = (state: LinkBuilderState) => {
  const params = new URLSearchParams()
  const baseUrl = trimBaseUrl(state.baseUrl)
  const sanitizedContent = sanitizeLinkBuilderContent(state.contentType, state.contentValue)

  if (state.machine) {
    params.set("machine", state.machine)
  }
  if (state.appMode) {
    params.set("appmode", state.appMode)
  }
  if (state.capsLock) {
    params.set("capslock", state.capsLock)
  }
  if (state.color) {
    params.set("color", state.color)
  }
  if (state.crtDistort) {
    params.set("crtdistort", state.crtDistort)
  }
  if (state.debug) {
    params.set("debug", state.debug)
  }
  if (state.ghosting) {
    params.set("ghosting", state.ghosting)
  }
  if (state.hotReload) {
    params.set("hotreload", state.hotReload)
  }
  if (state.ramDisk) {
    params.set("ramdisk", state.ramDisk)
  }
  if (state.scanlines) {
    params.set("scanlines", state.scanlines)
  }
  if (state.sound) {
    params.set("sound", state.sound)
  }
  if (state.speed) {
    params.set("speed", state.speed)
  }
  if (state.tab) {
    params.set("tab", state.tab)
  }
  if (state.theme) {
    params.set("theme", state.theme)
  }
  if (state.tour) {
    params.set("tour", state.tour)
  }

  if (state.contentType !== "none" && sanitizedContent.length > 0) {
    switch (state.contentType) {
      case "text":
        params.set("text", sanitizedContent)
        break
      case "basic":
        params.set("basic", sanitizedContent)
        break
      case "hex":
        params.set("hex", sanitizedContent)
        break
      case "binary":
        params.set("binary", sanitizedContent)
        break
      default:
        break
    }
  }

  if ((state.contentType === "hex" || state.contentType === "binary") && state.address.trim().length > 0) {
    params.set("address", state.address.trim())
  }

  if (state.contentType !== "none" && sanitizedContent.length > 0 && !state.run) {
    params.set("run", "false")
  }

  const query = params.toString()
  const fragment = state.fragmentUrl.trim().length > 0 ? `#${encodeURI(state.fragmentUrl.trim())}` : ""

  if (!baseUrl) {
    return `${query ? `?${query}` : ""}${fragment}`
  }

  return `${baseUrl}${query ? `?${query}` : ""}${fragment}`
}

export const getLinkBuilderOmittedOptionsNote = () =>
  "Not covered: cloudProvider OAuth callback handling and access_token fragments."
