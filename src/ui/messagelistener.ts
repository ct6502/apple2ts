import { RUN_MODE } from "../common/utility"
import { handleSetDiskOrFileFromBuffer, prepWritableFile } from "./devices/disk/driveprops"
import { passSetRunMode, handleGetState6502, passSetBinaryBlock, handleGetRunMode } from "./main2worker"
import { RestoreSaveState } from "./savestate"
import { showGlobalProgressModal } from "./ui_utilities"
import { handleInputParams } from "./inputparams"

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
    return
  }

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
      const { filename, filePath, data } = event.data
      
      console.log(`Loading save state: ${filename}, ${filePath}`)
      
      // Convert array back to string
      const stateData = new TextDecoder().decode(new Uint8Array(data))
      
      // Restore the save state
      RestoreSaveState(stateData)
      
      console.log(`Save state loaded successfully: ${filename}`)
    } catch (error) {
      console.error("Error loading save state:", error)
    } finally {
      showGlobalProgressModal(false)
    }
  }

  if (event.data.type === "loadDisk") {
    try {
      showGlobalProgressModal()
      const { filename, filePath, data } = event.data
      
      console.log(`Loading disk image: ${filename}, ${data.length} bytes`)
      
      // Convert array back to Uint8Array
      const diskData = new Uint8Array(data)
      
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
      handleSetDiskOrFileFromBuffer(0, diskData.buffer, filename, null, customSaveHandler)
      
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
