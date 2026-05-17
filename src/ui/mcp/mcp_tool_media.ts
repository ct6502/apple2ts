/**
 * MCP Media & I/O Tools
 * Tools for disk operations, keyboard input, and binary loading
 */

import {
  passKeypress,
  passKeyRelease,
  passSetBinaryBlock,
} from "../main2worker"
import {
  handleEjectDisk,
  handleSetDiskOrFileFromBuffer,
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
 * @param key ASCII code or character to press
 */
export function toolSendKeypress(key: string | number): MCPToolResult {
  try {
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
        character: String.fromCharCode(keyCode),
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
