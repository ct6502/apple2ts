import { RUN_MODE } from "../../common/utility"
import { handleGetMemoryDump, handleGetTextPageAsString, handleGetState6502, handleGetRunMode, handleGetMachineName, handleGetStackString, handleGetLores, handleGetHires } from "../main2worker"
import { MCPResourceURI, MCPResource } from "./mcp_server"

/**
 * Gets a resource by URI
 */
export function getMCPResource(uri: MCPResourceURI): MCPResource | null {
  try {
    switch (uri) {
      case "apple2ts://memory/main": {
        const memory = handleGetMemoryDump()
        return {
          uri: uri,
          mimeType: "application/octet-stream",
          data: Array.from(memory),
        }
      }

      case "apple2ts://video/text": {
        const textPage = handleGetTextPageAsString()
        return {
          uri: uri,
          mimeType: "text/plain",
          data: textPage,
        }
      }


      case "apple2ts://video/lores": {
        const loresPage = handleGetLores()
        return {
          uri: uri,
          mimeType: "application/octet-stream",
          data: Array.from(loresPage),
        }
      }

      case "apple2ts://video/hires": {
        const hiresPage = handleGetHires()
        return {
          uri: uri,
          mimeType: "application/octet-stream",
          data: Array.from(hiresPage),
        }
      }

      case "apple2ts://cpu/status": {
        const state = handleGetState6502()
        const runMode = handleGetRunMode()
        const machineName = handleGetMachineName()
        
        return {
          uri: uri,
          mimeType: "application/json",
          data: {
            A: state.Accum,
            X: state.XReg,
            Y: state.YReg,
            PC: state.PC,
            S: state.StackPtr,
            P: state.PStatus,
            cycleCount: state.cycleCount,
            runMode: RUN_MODE[runMode],
            machineName: machineName,
          },
        }
      }

      case "apple2ts://debugger/stack": {
        const stackString = handleGetStackString()
        return {
          uri: uri,
          mimeType: "text/plain",
          data: stackString,
        }
      }

      default:
        return null
    }
  } catch (error) {
    console.error(`Error getting resource ${uri}:`, error)
    return null
  }
}


/**
 * Lists all available MCP resources
 */
export function listMCPResources(): Array<{
  uri: MCPResourceURI
  name: string
  description: string
  mimeType: string
}> {
  return [
    {
      uri: "apple2ts://memory/main",
      name: "Main Memory",
      description: "A raw binary stream of the 64K-128K RAM",
      mimeType: "application/octet-stream",
    },
    {
      uri: "apple2ts://video/text",
      name: "Text Screen",
      description: "The current text screen buffer as a string",
      mimeType: "text/plain",
    },
    {
      uri: "apple2ts://video/lores",
      name: "Lo-Res Graphics",
      description: "The current low-resolution graphics buffer as byte array",
      mimeType: "application/octet-stream",
    },
    {
      uri: "apple2ts://video/hires",
      name: "Hi-Res Graphics",
      description: "The current high-resolution graphics buffer as byte array",
      mimeType: "application/octet-stream",
    },
    {
      uri: "apple2ts://cpu/status",
      name: "CPU Status",
      description: "A real-time JSON object of the CPU registers and cycle count",
      mimeType: "application/json",
    },
    {
      uri: "apple2ts://debugger/stack",
      name: "Stack",
      description: "Current stack dump as a string",
      mimeType: "text/plain",
    },
  ]
}
