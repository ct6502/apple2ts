/**
 * MCP Media & I/O Tools
 * Tools for disk operations, keyboard input, and binary loading
 */

import {
  passKeypress,
  passKeyRelease,
  passSetBinaryBlock,
  passPasteText,
  passAppleCommandKeyPress,
  passAppleCommandKeyRelease,
} from "../main2worker"
import {
  handleEjectDisk,
  handleSetDiskOrFileFromBuffer,
  handleSetDiskFromURL,
} from "../devices/disk/driveprops"
import type { MCPToolResult } from "./mcp_server"

/**
 * Mounts a disk image
 * @param drive Drive number (1 or 2, maps to 0-3 internally)
 * @param data Disk image data as Uint8Array
 * @param filename Filename for the disk image
 */
export function toolInsertDisk(drive: number, data: Uint8Array, filename: string): MCPToolResult {
  try {
    // Map drive 1-2 to internal 0-1
    const driveIndex = drive - 1
    if (driveIndex < 0 || driveIndex > 3) {
      return {
        success: false,
        error: `Invalid drive number: ${drive}. Must be 1-4`,
      }
    }

    const arrayBuffer = data.buffer.slice(data.byteOffset, data.byteOffset + data.byteLength) as ArrayBuffer
    const mountedDrive = handleSetDiskOrFileFromBuffer(driveIndex, arrayBuffer, filename, null, null)

    return {
      success: true,
      data: {
        drive: drive,
        filename: filename,
        mountedDrive: mountedDrive,
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
 * Loads a bundled disk image from the catalog
 * @param filename Filename or URL from the disk catalog (e.g., "https://...TotalReplay.hdv_.zip" or "Olympic%20Decathlon.woz")
 * @param drive Drive number (1-4), defaults to 1
 */
export async function toolLoadBundledDisk(filename: string, drive: number = 1): Promise<MCPToolResult> {
  try {
    const driveIndex = drive - 1
    if (driveIndex < 0 || driveIndex > 3) {
      return {
        success: false,
        error: `Invalid drive number: ${drive}. Must be 1-4`,
      }
    }

    // Determine URL - use as-is if it's already a URL, otherwise prepend /disks/
    const url = filename.startsWith("http://") || filename.startsWith("https://")
      ? filename
      : `/disks/${filename}`
    
    // Use handleSetDiskFromURL which handles zip files, downloads, etc.
    await handleSetDiskFromURL(url, undefined, driveIndex)
    
    // Wait for disk to boot (especially important for game collections like Total Replay)
    // Most disks boot in under 2 seconds
    await new Promise(resolve => setTimeout(resolve, 2000))
    
    const displayName = filename.split("/").pop() || filename

    return {
      success: true,
      data: {
        drive: drive,
        filename: displayName,
        message: `Loaded ${displayName} into drive ${drive}. Disk is ready.`,
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
 * Removes the disk image from a drive
 * @param drive Drive number (1 or 2, maps to 0-3 internally)
 */
export function toolEjectDisk(drive: number): MCPToolResult {
  try {
    const driveIndex = drive - 1
    if (driveIndex < 0 || driveIndex > 3) {
      return {
        success: false,
        error: `Invalid drive number: ${drive}. Must be 1-4`,
      }
    }

    handleEjectDisk(driveIndex)

    return {
      success: true,
      data: {
        drive: drive,
        message: `Disk ejected from drive ${drive}`,
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
 * Simulates a keypress on the Apple II keyboard
 * @param key ASCII code, single character, or string to type
 */
export function toolSendKeypress(key: string | number): MCPToolResult {
  try {
    // Handle typing entire strings
    if (typeof key === "string" && key.length > 1) {
      passPasteText(key)
      
      return {
        success: true,
        data: {
          typed: key,
          characterCount: key.length,
        },
      }
    }
    
    // Handle single character or key code
    const keyCode = typeof key === "string" ? key.charCodeAt(0) : key
    
    if (keyCode < 0 || keyCode > 255) {
      return {
        success: false,
        error: `Invalid key code: ${keyCode}. Must be 0-255`,
      }
    }

    passKeypress(keyCode)
    passKeyRelease()

    return {
      success: true,
      data: {
        keyCode: keyCode,
        character: keyCode === 13 ? "⏎" : String.fromCharCode(keyCode),
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
 * Loads a binary file directly into memory
 * @param data Binary data as array of bytes
 * @param address Starting address (default: 0x300)
 * @param run Whether to execute after loading (default: false)
 */
export function toolLoadBinary(data: number[], address = 0x300, run = false): MCPToolResult {
  try {
    if (address < 0 || address > 0xFFFF) {
      return {
        success: false,
        error: `Invalid address: ${address}. Must be 0-65535`,
      }
    }

    const uint8Data = new Uint8Array(data)
    passSetBinaryBlock(address, uint8Data, run)

    return {
      success: true,
      data: {
        address: address,
        size: data.length,
        run: run,
        message: `Binary loaded at $${address.toString(16).padStart(4, "0").toUpperCase()}`,
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
 * Parses button description to determine left/right
 * Accepts: "left", "right", "button 0", "button 1", "button 2", "joystick button 0/1/2"
 */
function parseButtonDescription(button: string): boolean | null {
  const normalized = button.toLowerCase().trim()
  
  // Left button patterns
  if (normalized.includes("left") || 
      normalized === "button 0" || 
      normalized === "button0" ||
      normalized === "0") {
    return true
  }
  
  // Right button patterns
  if (normalized.includes("right") || 
      normalized === "button 1" || 
      normalized === "button1" ||
      normalized === "1" ||
      normalized === "button 2" ||
      normalized === "button2" ||
      normalized === "2") {
    return false
  }
  
  return null
}

/**
 * Presses an Apple command key (joystick button)
 * @param button Button description: "left"/"right", "button 0/1/2", or "joystick button 0/1/2"
 */
export function toolPressAppleKey(button: string): MCPToolResult {
  try {
    const isLeft = parseButtonDescription(button)
    
    if (isLeft === null) {
      return {
        success: false,
        error: `Invalid button description: "${button}". Use "left", "right", "button 0", "button 1", etc.`,
      }
    }
    
    passAppleCommandKeyPress(isLeft)
    
    return {
      success: true,
      data: {
        button: isLeft ? "left (button 0)" : "right (button 1)",
        action: "pressed",
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
 * Releases an Apple command key (joystick button)
 * @param button Button description: "left"/"right", "button 0/1/2", or "joystick button 0/1/2"
 */
export function toolReleaseAppleKey(button: string): MCPToolResult {
  try {
    const isLeft = parseButtonDescription(button)
    
    if (isLeft === null) {
      return {
        success: false,
        error: `Invalid button description: "${button}". Use "left", "right", "button 0", "button 1", etc.`,
      }
    }
    
    passAppleCommandKeyRelease(isLeft)
    
    return {
      success: true,
      data: {
        button: isLeft ? "left (button 0)" : "right (button 1)",
        action: "released",
      },
    }
  } catch (error) {
    return {
      success: false,
      error: String(error),
    }
  }
}
