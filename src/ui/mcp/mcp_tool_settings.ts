/**
 * MCP Emulator Settings Tools
 * Tools for controlling emulator configuration (speed, machine type, color, sound)
 */

import { COLOR_MODE } from "../../common/utility"
import { passSetMachineName, passSpeedMode } from "../main2worker"
import { setPreferenceColorMode } from "../localstorage"
import { audioEnable } from "../devices/audio/speaker"
import type { MCPToolResult } from "./mcp_server"

/**
 * Set the emulator speed
 * @param speed Speed mode: -2 (0.1 MHz), -1 (0.5 MHz), 0 (1 MHz), 1 (2 MHz), 2 (3 MHz), 3 (4 MHz), 4 (ludicrous)
 */
export function toolSetSpeed(speed: number): MCPToolResult {
  try {
    if (speed < -2 || speed > 4) {
      return {
        success: false,
        error: "Speed must be between -2 (0.1 MHz) and 4 (ludicrous speed)",
      }
    }

    passSpeedMode(speed)
    
    const speedNames = [
      "0.1 MHz (Snail)",
      "0.5 MHz (Slow)",
      "1 MHz (Normal)",
      "2 MHz",
      "3 MHz",
      "4 MHz (Fast)",
      "Ludicrous"
    ]
    const speedName = speedNames[speed + 2]

    return {
      success: true,
      data: {
        speed: speed,
        speedName: speedName,
        message: `Speed set to ${speedName}`,
      },
    }
  } catch (error) {
    return {
      success: false,
      error: String(error),
    }
  }
}

/**
 * Set the machine type
 * @param machineType "APPLE2P" (Apple II+), "APPLE2EU" (Apple IIe unenhanced), "APPLE2EE" (Apple IIe enhanced)
 */
export function toolSetMachineType(machineType: string): MCPToolResult {
  try {
    if (machineType !== "APPLE2P" && machineType !== "APPLE2EU" && machineType !== "APPLE2EE") {
      return {
        success: false,
        error: 'Machine type must be "APPLE2P", "APPLE2EU", or "APPLE2EE"',
      }
    }

    passSetMachineName(machineType as MACHINE_NAME)
    
    const machineNames: Record<MACHINE_NAME, string> = {
      "APPLE2P": "Apple II+",
      "APPLE2EU": "Apple IIe (Unenhanced)",
      "APPLE2EE": "Apple IIe (Enhanced)"
    }
    const machineName = machineNames[machineType as MACHINE_NAME]

    return {
      success: true,
      data: {
        machineType: machineType,
        machineName: machineName,
        message: `Machine type set to ${machineName}`,
      },
    }
  } catch (error) {
    return {
      success: false,
      error: String(error),
    }
  }
}

/**
 * Set the color mode
 * @param colorMode "COLOR", "NOFRINGE", "GREEN", "AMBER", "BLACKANDWHITE", "INVERSEBLACKANDWHITE"
 */
export function toolSetColorMode(colorMode: string): MCPToolResult {
  try {
    const validModes = ["COLOR", "NOFRINGE", "GREEN", "AMBER", "BLACKANDWHITE", "INVERSEBLACKANDWHITE"]
    if (!validModes.includes(colorMode)) {
      return {
        success: false,
        error: `Color mode must be one of: ${validModes.join(", ")}`,
      }
    }

    const modeValue = COLOR_MODE[colorMode as keyof typeof COLOR_MODE]
    setPreferenceColorMode(modeValue)

    const modeNames: Record<string, string> = {
      "COLOR": "Color",
      "NOFRINGE": "Color (No Fringe)",
      "GREEN": "Green Monitor",
      "AMBER": "Amber Monitor",
      "BLACKANDWHITE": "Black & White",
      "INVERSEBLACKANDWHITE": "Inverse B&W"
    }
    const modeName = modeNames[colorMode]

    return {
      success: true,
      data: {
        colorMode: colorMode,
        modeName: modeName,
        message: `Color mode set to ${modeName}`,
      },
    }
  } catch (error) {
    return {
      success: false,
      error: String(error),
    }
  }
}

/**
 * Enable or disable sound
 * @param enabled true to enable sound, false to disable
 */
export function toolSetSound(enabled: boolean): MCPToolResult {
  try {
    audioEnable(enabled)

    return {
      success: true,
      data: {
        enabled: enabled,
        message: `Sound ${enabled ? "enabled" : "disabled"}`,
      },
    }
  } catch (error) {
    return {
      success: false,
      error: String(error),
    }
  }
}
