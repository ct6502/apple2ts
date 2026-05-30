import { RUN_MODE } from "../../common/utility"
import { handleGetTextPageAsString, handleGetState6502, handleGetRunMode, handleGetMachineName, handleGetStackString, handleGetSoftSwitches, handleGetBreakpoints, handleGetTracelog, handleGetTracing, handleGetSpeedMode, handleGetMemoryResource } from "../main2worker"
import { MCPResourceURI, MCPResource } from "./mcp_server"
import { getUIState } from "../ui_settings"
import { handleGetDriveProps } from "../devices/disk/driveprops"

/**
 * Catalog of bundled disk images available in the emulator
 * Based on diskimages.ts - only includes locally available disks
 */
const DISK_CATALOG = [
  { 
    name: "Total Replay", 
    filename: "https://ct6502.org/wp-content/uploads/2026/01/TotalReplay.hdv_.zip", 
    path: "https://ct6502.org/wp-content/uploads/2026/01/TotalReplay.hdv_.zip", 
    type: "game collection", 
    description: "Massive collection of 508 classic arcade and action games with instant loading. Navigate by typing the first 3-4 characters of a game name and pressing Enter.",
    games: "Examples: Choplifter, Lode Runner, Prince of Persia, Karateka, Tetris, Pac-Man, Frogger, Donkey Kong, Centipede, Dig Dug, Joust, Defender, Missile Command, Asteroids, Galaxian, Zaxxon, Qbert, Spy Hunter, Pitfall II, Burgertime, Archon, Arkanoid, Bruce Lee, Boulder Dash, Bubble Bobble, Commando, Crystal Castles, Dino Eggs, Montezuma's Revenge, Moon Patrol, Paperboy, Popeye, Space Invaders, Spy vs Spy, Track & Field, Winter Games, Oregon Trail, and 470+ more!"
  },
  { 
    name: "Instant Replay", 
    filename: "https://ct6502.org/wp-content/uploads/2026/01/TotalReplayII.hdv_.zip", 
    path: "https://ct6502.org/wp-content/uploads/2026/01/TotalReplayII.hdv_.zip", 
    type: "game collection", 
    description: "Collection of 94 sports, strategy, and board games. Navigate by typing the first 3-4 characters of a game name and pressing Enter.",
    games: "Examples: California Games, Hardball, Championship Basketball, Championship Baseball, F-15 Strike Eagle, Flight Simulator II, Chuck Yeager's Flight Simulator, Battle Chess, Go, Checkers, Card Sharks, Family Feud, Computer Foosball, Monopoly (Advance to Boardwalk), Draw Poker, Pool 1.5, Shuffleboard, World Karate Championship, and more!"
  },
  { 
    name: "Wizard Replay", 
    filename: "https://ct6502.org/wp-content/uploads/2026/01/WizardReplay.hdv_.zip", 
    path: "https://ct6502.org/wp-content/uploads/2026/01/WizardReplay.hdv_.zip", 
    type: "game collection", 
    description: "Frontend for 8 classic RPG scenarios with integrated character editor and save management. Navigate by typing the first 3-4 characters of a game name and pressing Enter.",
    games: "Classic RPGs: Wizardry: Proving Grounds of the Mad Overlord and other Wizardry series games with WizPlus character editor integration"
  },
  { name: "Pitch Dark", filename: "https://ct6502.org/wp-content/uploads/2026/01/PitchDark.hdv_.zip", path: "https://ct6502.org/wp-content/uploads/2026/01/PitchDark.hdv_.zip", type: "game", description: "Interactive fiction adventure" },
  { name: "Aztec", filename: "Aztec.po", path: "disks/Aztec.po", type: "game", description: "Adventure game exploring Aztec pyramid" },
  { name: "Eamon", filename: "Eamon%201.po", path: "disks/Eamon%201.po", type: "game", description: "Text adventure RPG system" },
  { name: "MECC Inspector", filename: "MECC-Inspector.woz", path: "disks/MECC-Inspector.woz", type: "educational", description: "Educational detective game" },
  { name: "MousePaint", filename: "MousePaint.woz", path: "disks/MousePaint.woz", type: "application", description: "Graphics drawing program" },
  { name: "Nox Archaist Demo", filename: "Nox%20Archaist%20Demo.hdv", path: "disks/Nox%20Archaist%20Demo.hdv", type: "game", description: "Modern RPG demo with enhanced graphics" },
  { name: "Olympic Decathlon", filename: "Olympic%20Decathlon.woz", path: "disks/Olympic%20Decathlon.woz", type: "game", description: "Sports game featuring 10 Olympic events" },
  { name: "Print Shop Color", filename: "Print%20Shop%20Color.po", path: "disks/Print%20Shop%20Color.po", type: "application", description: "Desktop publishing and greeting card maker" },
  { name: "ProDOS 2.4.3", filename: "ProDOS%202.4.3.po", path: "disks/ProDOS%202.4.3.po", type: "system", description: "ProDOS operating system disk" },
  { name: "Robotron", filename: "Robotron4Joy.po", path: "disks/Robotron4Joy.po", type: "game", description: "Arcade shooter adapted for joystick control" },
  { name: "Ultima IV", filename: "Ultima%20IV.hdv", path: "disks/Ultima%20IV.hdv", type: "game", description: "Classic RPG - Quest of the Avatar (hard disk image)" },
  { name: "Ultima V", filename: "Ultima%20V.hdv", path: "disks/Ultima%20V.hdv", type: "game", description: "Classic RPG - Warriors of Destiny (hard disk image)" },
]

/**
 * Gets a resource by URI
 */
export function getMCPResource(uri: MCPResourceURI): MCPResource | null {
  try {
    switch (uri) {
      case "apple2ts://memory/main": {
        const memory = handleGetMemoryResource()
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

      case "apple2ts://video/screen": {
        const canvas = document.getElementById("hiddenCanvas") as HTMLCanvasElement
        if (!canvas) return null
        const canvasCopy = document.createElement("canvas")
        canvasCopy.width = 280
        canvasCopy.height = 192
        const ctx = canvasCopy.getContext("2d", { willReadFrequently: true })
        if (!ctx) return null
        ctx.imageSmoothingEnabled = false
        ctx.drawImage(canvas, 0, 0, 560, 384, 0, 0, canvasCopy.width, canvasCopy.height)
        // Convert canvas to base64-encoded PNG (standard format for AI vision APIs)
        const dataUrl = canvasCopy.toDataURL("image/png")
        return {
          uri: uri,
          mimeType: "image/png",
          data: dataUrl,
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

      case "apple2ts://system/softswitches": {
        const switches = handleGetSoftSwitches()
        return {
          uri: uri,
          mimeType: "application/json",
          data: {
            softswitches: switches,
            description: "Apple II soft switches state",
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

      case "apple2ts://debugger/breakpoints": {
        const breakpoints = handleGetBreakpoints()
        const list: Array<{
          address: number
          type: string
          mode?: string
          disabled: boolean
        }> = []

        breakpoints.forEach((bp: Record<string, unknown>, addr: number) => {
          const watchpoint = bp.watchpoint as boolean | undefined
          const disabled = bp.disabled as boolean | undefined
          const memget = bp.memget as boolean | undefined
          const memset = bp.memset as boolean | undefined

          const item: {
            address: number
            type: string
            mode?: string
            disabled: boolean
          } = {
            address: addr,
            type: watchpoint ? "watchpoint" : "breakpoint",
            disabled: disabled || false,
          }

          if (watchpoint) {
            if (memget && memset) {
              item.mode = "rw"
            } else if (memget) {
              item.mode = "r"
            } else if (memset) {
              item.mode = "w"
            }
          }

          list.push(item)
        })

        return {
          uri: uri,
          mimeType: "application/json",
          data: {
            breakpoints: list,
            count: list.length,
          },
        }
      }

      case "apple2ts://debugger/trace": {
        const traceLog = handleGetTracelog()
        const isTracing = handleGetTracing()

        return {
          uri: uri,
          mimeType: "application/json",
          data: {
            tracing: isTracing,
            logEntries: traceLog,
            count: traceLog.length,
          },
        }
      }

      case "apple2ts://debugger/backtrace": {
        const stackString = handleGetStackString()
        const state = handleGetState6502()

        return {
          uri: uri,
          mimeType: "application/json",
          data: {
            stackPointer: state.StackPtr,
            stackString: stackString,
            PC: state.PC,
          },
        }
      }

      case "apple2ts://disks/catalog": {
        return {
          uri: uri,
          mimeType: "application/json",
          data: {
            disks: DISK_CATALOG,
            totalCount: DISK_CATALOG.length,
            instructions: "To load a disk, use the 'load_bundled_disk' tool with the filename from this catalog. Most games will auto-boot. URLs starting with 'https://' will be downloaded and loaded. For local files, use the filename as shown (may include URL encoding like %20 for spaces). For game collections (Total Replay, Instant Replay, Wizard Replay), after loading the disk, type the first 3-4 characters of the game name and press Enter to select and launch the game."
          },
        }
      }

      case "apple2ts://disks/current": {
        const drives = [0, 1, 2, 3].map(index => {
          const drive = handleGetDriveProps(index)
          return {
            index: drive.index,
            type: drive.hardDrive ? "hard-drive" : "floppy",
            driveNumber: drive.drive,
            filename: drive.filename || null,
            motorRunning: drive.motorRunning,
            hasChanges: drive.diskHasChanges,
            isWriteProtected: drive.isWriteProtected,
            status: drive.status,
          }
        })
        
        return {
          uri: uri,
          mimeType: "application/json",
          data: {
            drives: drives,
            description: "Status of all 4 disk drives (2 hard drives and 2 floppy drives). motorRunning indicates if the drive motor is currently on.",
          },
        }
      }

      case "apple2ts://emulator/settings": {
        const uiState = getUIState()
        const speedMode = handleGetSpeedMode()
        const machineName = handleGetMachineName()
        const runMode = handleGetRunMode()
        
        const speedNames = [
          "0.1 MHz (Snail)",
          "0.5 MHz (Slow)",
          "1 MHz (Normal)",
          "2 MHz",
          "3 MHz",
          "4 MHz (Fast)",
          "Ludicrous"
        ]
        const speedName = speedNames[speedMode + 2]
        
        const machineNames: Record<MACHINE_NAME, string> = {
          "APPLE2P": "Apple II+",
          "APPLE2EU": "Apple IIe (Unenhanced)",
          "APPLE2EE": "Apple IIe (Enhanced)"
        }
        const machineDisplayName = machineNames[machineName]
        
        const colorModeNames = [
          "Color",
          "Color (No Fringe)",
          "Green Monitor",
          "Amber Monitor",
          "Black & White",
          "Inverse B&W"
        ]
        const colorModeName = colorModeNames[uiState.colorMode]
        
        return {
          uri: uri,
          mimeType: "application/json",
          data: {
            speed: {
              mode: speedMode,
              name: speedName,
            },
            machine: {
              type: machineName,
              name: machineDisplayName,
            },
            display: {
              colorMode: uiState.colorMode,
              colorModeName: colorModeName,
              showScanlines: uiState.showScanlines,
              crtDistortion: uiState.crtDistortion,
              ghosting: uiState.ghosting,
            },
            execution: {
              runMode: RUN_MODE[runMode],
              capsLock: uiState.capsLock,
            },
            theme: uiState.theme,
          },
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
      uri: "apple2ts://video/screen",
      name: "Graphics Screen",
      description: "Base64-encoded PNG screenshot of the current graphics display",
      mimeType: "image/png",
    },
    {
      uri: "apple2ts://cpu/status",
      name: "CPU Status",
      description: "A real-time JSON object of the CPU registers and cycle count",
      mimeType: "application/json",
    },
    {
      uri: "apple2ts://system/softswitches",
      name: "Soft Switches",
      description: "Current state of all Apple II soft switches",
      mimeType: "application/json",
    },
    {
      uri: "apple2ts://debugger/stack",
      name: "Stack",
      description: "Current stack dump as a string",
      mimeType: "text/plain",
    },
    {
      uri: "apple2ts://debugger/breakpoints",
      name: "Breakpoints",
      description: "List of all breakpoints and watchpoints",
      mimeType: "application/json",
    },
    {
      uri: "apple2ts://debugger/trace",
      name: "Trace Log",
      description: "Instruction trace log if tracing is enabled",
      mimeType: "application/json",
    },
    {
      uri: "apple2ts://debugger/backtrace",
      name: "Backtrace",
      description: "Call stack backtrace showing JSR addresses",
      mimeType: "application/json",
    },
    {
      uri: "apple2ts://disks/catalog",
      name: "Disk Catalog",
      description: "Complete catalog of bundled disk images available in the emulator with metadata (names, types, descriptions, file paths)",
      mimeType: "application/json",
    },
    {
      uri: "apple2ts://disks/current",
      name: "Current Disk Status",
      description: "Real-time status of all 4 disk drives including whether motor is on, filename of mounted disk, and write protection status",
      mimeType: "application/json",
    },
    {
      uri: "apple2ts://emulator/settings",
      name: "Emulator Settings",
      description: "Current emulator configuration including speed, machine type, color mode, and display settings",
      mimeType: "application/json",
    },
  ]
}
