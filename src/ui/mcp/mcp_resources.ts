import { RUN_MODE } from "../../common/utility"
import { handleGetMemoryDump, handleGetTextPageAsString, handleGetState6502, handleGetRunMode, handleGetMachineName, handleGetStackString, handleGetLores, handleGetHires, handleGetSoftSwitches, handleGetBreakpoints, handleGetTracelog, handleGetTracing, handleGetSpeedMode } from "../main2worker"
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
        const memory = handleGetMemoryDump(true)
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
        const switches = handleGetSoftSwitches()
        
        // Lores can be different sizes based on mode
        const totalBytes = loresPage.length
        const bytesPerLine = (totalBytes === 1600 || totalBytes === 1920) ? 80 : 40
        const numLines = totalBytes / bytesPerLine
        
        return {
          uri: uri,
          mimeType: "application/json",
          data: {
            format: "lores",
            dimensions: {
              bytesWide: bytesPerLine,
              linesHigh: numLines,
              blocksWide: bytesPerLine,
              blocksHigh: numLines * 2,  // Each byte = 2 blocks vertically
              pixelsWide: bytesPerLine * 7,  // 7 pixels per block horizontally
              pixelsHigh: numLines * 8,  // 4 pixels per block, 2 blocks per byte
            },
            mode: {
              doubleRes: switches.DHIRES && switches.COLUMN80,
              mixed: switches.MIXED,
            },
            encoding: {
              description: "Apple II Lo-Res Graphics Format",
              details: "Each byte represents 2 vertical blocks of 7×4 pixels. Low nibble (bits 0-3) = top block color, high nibble (bits 4-7) = bottom block color. 16 colors available (0=black, 1=red, 2=dk.blue, 3=purple, 4=dk.green, 5=gray, 6=med.blue, 7=lt.blue, 8=brown, 9=orange, 10=gray, 11=pink, 12=lt.green, 13=yellow, 14=aqua, 15=white).",
              blockSize: "Each block is 7 pixels wide by 4 pixels tall",
            },
            data: Array.from(loresPage),
          },
        }
      }

      case "apple2ts://video/hires": {
        const hiresPage = handleGetHires()
        const switches = handleGetSoftSwitches()
        
        // Determine hires mode from soft switches and buffer size
        const doubleRes = switches.DHIRES && switches.COLUMN80
        const mixed = switches.MIXED
        const video7 = switches.DHIRES && !switches.COLUMN80 && switches.STORE80
        
        // Calculate dimensions from buffer size
        const totalBytes = hiresPage.length
        const bytesPerLine = (totalBytes === 80 * 192 || totalBytes === 80 * 160) ? 80 : 40
        const numLines = totalBytes / bytesPerLine
        
        return {
          uri: uri,
          mimeType: "application/json",
          data: {
            format: "hires",
            dimensions: {
              bytesWide: bytesPerLine,
              linesHigh: numLines,
              pixelsWide: doubleRes ? 560 : 280,
              pixelsHigh: numLines,
            },
            mode: {
              doubleRes: doubleRes,
              mixed: mixed,
              video7: video7,
            },
            encoding: {
              description: "Apple II Hi-Res Graphics Format",
              details: "Each byte represents 7 pixels. Bits 0-6 are pixel data (1=on, 0=off). Bit 7 (high bit) controls color: 0=undelayed (violet/green), 1=delayed by 14MHz (blue/orange). In monochrome, bit 7 is ignored. Pixels are arranged left-to-right, bit 0 is leftmost.",
              memoryLayout: "Lines are interleaved in a complex pattern for hardware compatibility, not sequential. Line addresses: $2000 + (line÷64)×40 + (line%8)×1024 + ((line÷8)%8)×128",
            },
            data: Array.from(hiresPage),
          },
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
      uri: "apple2ts://video/lores",
      name: "Lo-Res Graphics",
      description: "Low-resolution graphics buffer with metadata: dimensions (bytes/blocks/pixels), mode (double-res, mixed), encoding format. Each byte = 2 vertical blocks (7×4 pixels each), low nibble = top, high nibble = bottom, 4-bit color (0-15).",
      mimeType: "application/json",
    },
    {
      uri: "apple2ts://video/hires",
      name: "Hi-Res Graphics",
      description: "High-resolution graphics buffer with metadata: dimensions (bytes/pixels), mode (double-res, mixed, video7), encoding format, and raw byte data. Each byte = 7 pixels, bit 7 = color delay.",
      mimeType: "application/json",
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
