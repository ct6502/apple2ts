import { RUN_MODE } from "../../common/utility"
import { handleSetDiskOrFileFromBuffer, prepWritableFile } from "../devices/disk/driveprops"
import {
  passSetRunMode,
  handleGetState6502,
  passSetBinaryBlock,
  handleGetRunMode,
  handleGetTextPageAsString,
  passKeypress,
  passKeyRelease,
} from "../main2worker"
import { RestoreSaveState } from "../savestate"
import { showGlobalProgressModal } from "../ui_utilities"
import { handleInputParams } from "../inputparams"

export const AUTOMATION_INSTRUMENTATION_VERSION = "a2ts-automation-v4"

const decodePayloadBytes = (data: unknown, dataBase64: unknown): Uint8Array => {
  if (typeof dataBase64 === "string" && dataBase64.length > 0) {
    const binary = atob(dataBase64)
    const bytes = new Uint8Array(binary.length)
    for (let i = 0; i < binary.length; i += 1) {
      bytes[i] = binary.charCodeAt(i)
    }
    return bytes
  }

  if (Array.isArray(data)) {
    return new Uint8Array(data as number[])
  }

  throw new Error("Missing payload data")
}

export const reportAutomationEvent = (eventName: string, payload?: unknown) => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  if ((window as any).electronAPI?.reportAutomationEvent) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    ;(window as any).electronAPI.reportAutomationEvent(eventName, payload)
  }
}

const seenLoadRequestIds = new Set<string>()
let automationTextSamplerTimer: number | null = null
let automationTextSamplerDeadline = 0
let lastAutomationTextSample: string | null = null
let lastFatalSignature: string | null = null

const FATAL_TEXT_PATTERNS = [
  /\bI\s*\/\s*O\s+ERROR\b/i,
  /\bPATH\s+NOT\s+FOUND\b/i,
  /\bSYNTAX\s+ERROR\b/i,
]

const summarizeText = (raw: string, maxLen = 220) => {
  const normalized = String(raw || "")
    .replace(/[\x00-\x1F\x7F]+/g, " ")
    .replace(/\s+/g, " ")
    .trim()
  if (normalized.length <= maxLen) return normalized
  return `${normalized.slice(0, maxLen)}...`
}

const fatalLabelFromText = (text: string) => {
  if (/SYNTAX\s+ERROR/i.test(text)) return "SYNTAX ERROR"
  if (/PATH\s+NOT\s+FOUND/i.test(text)) return "PATH NOT FOUND"
  if (/I\s*\/\s*O\s+ERROR/i.test(text)) return "I/O ERROR"
  return "FATAL SCREEN TEXT"
}

export const stopAutomationTextSampler = () => {
  if (automationTextSamplerTimer !== null) {
    window.clearInterval(automationTextSamplerTimer)
    automationTextSamplerTimer = null
  }
}

export const reportMachineTextSnapshot = (reason: string) => {
  try {
    const rawText = handleGetTextPageAsString()
    const sample = summarizeText(rawText)

    if (sample !== lastAutomationTextSample) {
      lastAutomationTextSample = sample
      reportAutomationEvent("machine-text-sample", {
        reason,
        sample,
        rawLength: String(rawText || "").length,
      })
    }

    const fatalMatch = FATAL_TEXT_PATTERNS.find((pattern) => pattern.test(rawText))
    if (fatalMatch) {
      const fatalLabel = fatalLabelFromText(rawText)
      const signature = `${fatalLabel}|${fatalMatch.source}|${sample}`
      if (signature !== lastFatalSignature) {
        lastFatalSignature = signature
        reportAutomationEvent("machine-text-fatal", {
          code: "fatal_screen_text",
          label: fatalLabel,
          needle: fatalMatch.source,
          sample,
        })
        // Stop periodic sampling after first fatal to avoid log spam.
        stopAutomationTextSampler()
      }
    } else {
      lastFatalSignature = null
    }
  } catch (error) {
    reportAutomationEvent("machine-text-sampler-error", {
      reason,
      error: error instanceof Error ? error.message : String(error),
    })
  }
}

export const startAutomationTextSampler = (durationMs = 90000, intervalMs = 500) => {
  stopAutomationTextSampler()
  automationTextSamplerDeadline = Date.now() + Math.max(1000, durationMs)
  lastAutomationTextSample = null

  const tick = () => {
    if (Date.now() >= automationTextSamplerDeadline) {
      stopAutomationTextSampler()
      return
    }

    reportMachineTextSnapshot("sampler-tick")
  }

  tick()
  automationTextSamplerTimer = window.setInterval(tick, Math.max(150, intervalMs))
}

const isDuplicateLoadRequest = (eventType: string, requestId: unknown) => {
  if (typeof requestId !== "string" || requestId.length === 0) {
    return false
  }
  if (seenLoadRequestIds.has(requestId)) {
    reportAutomationEvent("load-request-duplicate-ignored", { eventType, requestId })
    return true
  }
  seenLoadRequestIds.add(requestId)
  return false
}

export const queueAutomationLaunchKeys = (attempts = 3, initialDelayMs = 700, retryDelayMs = 1200) => {
  const launchOnce = (attempt: number) => {
    reportMachineTextSnapshot(`launch-before-${attempt}`)
    reportAutomationEvent("launch-key-attempt", { sequence: [32, 13], attempt })
    passKeypress(32)
    passKeyRelease()
    setTimeout(() => {
      passKeypress(13)
      passKeyRelease()
      reportMachineTextSnapshot(`launch-after-${attempt}`)
    }, 70)
  }

  for (let attempt = 1; attempt <= attempts; attempt += 1) {
    const delay = initialDelayMs + ((attempt - 1) * retryDelayMs)
    setTimeout(() => launchOnce(attempt), delay)
  }
}

export const notifyAutomationDiskLoaded = (filename: string, filePath = "") => {
  reportAutomationEvent("automation-instrumentation-version", {
    version: AUTOMATION_INSTRUMENTATION_VERSION,
  })
  stopAutomationTextSampler()
  reportAutomationEvent("disk-loaded", { filename, filePath })
  startAutomationTextSampler()
  queueAutomationLaunchKeys()
}

export const messagelistener = (event: MessageEvent) => {
  // Verify the message is from a trusted source (VS Code webview or localhost for development)
  const trustedOrigins = [
    "vscode-webview://", // VS Code webview
    "file://",           // Electron app (apple2ts-app)
    "http://localhost",   // Local development
    "https://localhost"   // Local development with HTTPS
  ]
  
  const isTrusted = trustedOrigins.some(origin => 
    event.origin.startsWith(origin) || 
    event.origin === "null" // VS Code webview sometimes reports null origin
  )
  
  if (!isTrusted) {
    console.warn("Received message from untrusted origin:", event.origin)
    reportAutomationEvent("message-untrusted", { origin: event.origin, type: event.data?.type })
    return
  }

  reportAutomationEvent("message-received", { origin: event.origin, type: event.data?.type })

  if (event.data.type === "showProgress") {
    showGlobalProgressModal()
    return
  }

  console.log("Apple2TS received message:", event.data)
  
  if (event.data.type === "loadBinary") {
    try {
      const { address, format, runProgram, data } = event.data as MessageLoadProgram
      
      console.log(`Loading binary at address 0x${address.toString(16)}, ${data.length} bytes, format: ${format}`)
      
      // Convert array back to Uint8Array
      const binaryData = new Uint8Array(data)
      
      passSetRunMode(RUN_MODE.NEED_BOOT)
      setTimeout(() => { passSetRunMode(RUN_MODE.NEED_RESET) }, 500)

      const waitForBoot = setInterval(() => {
        // Wait a bit to give the emulator time to start and boot any disks.
        const cycleCount = handleGetState6502().cycleCount
        if (cycleCount > 2000000) {
          clearInterval(waitForBoot)
          if (format === "bin") {
            passSetBinaryBlock(address, binaryData, runProgram)
          }
        }
      }, 100)
      
    } catch (error) {
      console.error("Error loading binary:", error)
      // event.source.postMessage({
      //   type: "error",
      //   message: error.message
      // }, event.origin)
    }
  }
  
  if (event.data.type === "loadState") {
    try {
      showGlobalProgressModal()
      const { filename, filePath, data, dataBase64, requestId } = event.data

      if (isDuplicateLoadRequest("loadState", requestId)) {
        return
      }
      
      console.log(`Loading save state: ${filename}, ${filePath}`)
      
      // Convert array back to string
      const stateData = new TextDecoder().decode(decodePayloadBytes(data, dataBase64))
      
      // Restore the save state
      RestoreSaveState(stateData)
      
      console.log(`Save state loaded successfully: ${filename}`)
      reportAutomationEvent("state-loaded", { filename, filePath })
    } catch (error) {
      console.error("Error loading save state:", error)
    } finally {
      showGlobalProgressModal(false)
    }
  }

  if (event.data.type === "loadDisk") {
    try {
      showGlobalProgressModal()
      const { filename, filePath, data, dataBase64, requestId } = event.data

      if (isDuplicateLoadRequest("loadDisk", requestId)) {
        return
      }

      reportAutomationEvent("automation-instrumentation-version", {
        version: AUTOMATION_INSTRUMENTATION_VERSION,
      })

      stopAutomationTextSampler()

      const diskData = decodePayloadBytes(data, dataBase64)
      
      console.log(`Loading disk image: ${filename}, ${diskData.length} bytes`)
      
      // Create custom save handler for Electron that uses IPC to save to the original file
      let customSaveHandler: CustomWritableHandler | null = null
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      if (filePath && (window as any).electronAPI) {
        customSaveHandler = {
          requestPermission: async () => {
            console.log(`🔑 Electron: requestPermission called for ${filePath}`)
            return { state: "granted" as PermissionState }
          },
          createWritable: async () => {
            console.log(`📝 Electron: createWritable called for ${filePath}`)
            return {
              write: async (data: Uint8Array | Blob) => {
                // Convert to Uint8Array if needed
                const dataArray = data instanceof Uint8Array 
                  ? Array.from(data)
                  : Array.from(new Uint8Array(await data.arrayBuffer()))
                console.log("💾 Electron: Writing disk data to IPC:", filePath, `(${dataArray.length} bytes)`)
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                const result = await (window as any).electronAPI.saveDiskImage(filePath, dataArray)
                console.log("✅ Electron: IPC save result:", result)
              },
              close: async () => { 
                console.log(`🔒 Electron: close called for ${filePath}`)
              }
            }
          }
        }
        console.log(`🎯 Created Electron save handler for: ${filePath}`)
      }
      
      // Reset all drives and load the disk into drive 0
      // Use handleSetDiskOrFileFromBuffer which handles all disk types
      const diskBuffer = new Uint8Array(diskData).buffer
      handleSetDiskOrFileFromBuffer(0, diskBuffer, filename, null, customSaveHandler)
      
      // Set up auto-save timer for Electron
      if (customSaveHandler) {
        console.log("🚀 Setting up auto-save timer for Electron disk...")
        const cleanup = prepWritableFile(0, customSaveHandler)
        console.log("✅ Auto-save timer started, cleanup function:", cleanup)
      } else {
        console.log("⚠️ No customSaveHandler, skipping auto-save timer")
      }
      
      // Boot the disk if not already running
      if (handleGetRunMode() === RUN_MODE.IDLE) {
        passSetRunMode(RUN_MODE.NEED_BOOT)
      }
      
      console.log(`Disk image loaded successfully: ${filename}`)
      notifyAutomationDiskLoaded(filename, filePath)
    } catch (error) {
      console.error("Error loading disk:", error)
    } finally {
      showGlobalProgressModal(false)
    }
  }

  if (event.data.type === "updateParameters") {
    try {
      const params = event.data.params
      console.log("Updating parameters:", params)
      // Convert params object to URL search string
      const searchParams = new URLSearchParams(params)
      const paramString = "?" + searchParams.toString()
      // Use existing parameter handler to update all settings
      handleInputParams(paramString)
      console.log("Parameters updated successfully")
    } catch (error) {
      console.error("Error updating parameters:", error)
    }
  }

}
