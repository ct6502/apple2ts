/**
 * MCP State Inspection & Modification Tools
 * Tools for reading and writing CPU state and memory
 */

import {
  handleGetState6502,
  handleGetMemoryDump,
  handleGetSoftSwitches,
  passSetState6502,
  passSetMemory,
  passSetSoftSwitches,
  handleGetZeroPage,
} from "../main2worker"
import type { MCPToolResult } from "./mcp_server"

/**
 * Returns the current values of CPU registers
 */
export function toolGetRegisters(): MCPToolResult {
  try {
    const state = handleGetState6502()
    return {
      success: true,
      data: {
        A: state.Accum,
        X: state.XReg,
        Y: state.YReg,
        PC: state.PC,
        S: state.StackPtr,
        P: state.PStatus,
        flags: {
          N: (state.PStatus & 0x80) !== 0, // Negative
          V: (state.PStatus & 0x40) !== 0, // Overflow
          B: (state.PStatus & 0x10) !== 0, // Break
          D: (state.PStatus & 0x08) !== 0, // Decimal
          I: (state.PStatus & 0x04) !== 0, // Interrupt disable
          Z: (state.PStatus & 0x02) !== 0, // Zero
          C: (state.PStatus & 0x01) !== 0, // Carry
        },
        cycleCount: state.cycleCount,
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
 * Modifies a specific CPU register
 * @param name Register name: A, X, Y, PC, S, P
 * @param value New value (0-255 for 8-bit, 0-65535 for 16-bit)
 */
export function toolSetRegister(name: string, value: number): MCPToolResult {
  try {
    const state = handleGetState6502()
    const upperName = name.toUpperCase()

    switch (upperName) {
      case "A":
        state.Accum = value & 0xFF
        break
      case "X":
        state.XReg = value & 0xFF
        break
      case "Y":
        state.YReg = value & 0xFF
        break
      case "PC":
        state.PC = value & 0xFFFF
        break
      case "S":
        state.StackPtr = value & 0xFF
        break
      case "P":
        state.PStatus = value & 0xFF
        break
      default:
        return {
          success: false,
          error: `Invalid register name: ${name}. Valid names are: A, X, Y, PC, S, P`,
        }
    }

    passSetState6502(state)

    return {
      success: true,
      data: {
        register: upperName,
        value: value,
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
 * Returns a hex dump or byte array from a specific memory range
 * @param address Starting address (0-65535)
 * @param length Number of bytes to read
 */
export function toolReadMemory(address: number, length: number): MCPToolResult {
  try {
    if (address < 0 || address > 0xFFFF) {
      return {
        success: false,
        error: `Invalid address: ${address}. Must be 0-65535`,
      }
    }
    if (length < 1 || length > 65536) {
      return {
        success: false,
        error: `Invalid length: ${length}. Must be 1-65536`,
      }
    }

    let bytes: number[] = []
    let memory: Uint8Array
    const endAddr = Math.min(address + length, 0x10000)
    const start = 0
    if (address + length < 0x100) {
      memory = handleGetZeroPage()
    } else {
      memory = handleGetMemoryDump(true)
    }
    bytes = Array.from(memory.slice(address - start, endAddr - start))

    return {
      success: true,
      data: {
        address: address,
        length: bytes.length,
        bytes: bytes,
        hex: bytes.map((b) => b.toString(16).padStart(2, "0").toUpperCase()).join(" "),
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
 * Writes specific values to RAM
 * @param address Starting address (0-65535)
 * @param data Array of bytes to write
 */
export function toolWriteMemory(address: number, data: number[]): MCPToolResult {
  try {
    if (address < 0 || address > 0xFFFF) {
      return {
        success: false,
        error: `Invalid address: ${address}. Must be 0-65535`,
      }
    }

    for (let i = 0; i < data.length; i++) {
      const addr = (address + i) & 0xFFFF
      const value = data[i] & 0xFF
      passSetMemory(addr, value)
    }

    return {
      success: true,
      data: {
        address: address,
        bytesWritten: data.length,
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
 * Returns the state of Apple II softswitches
 */
export function toolGetSoftSwitches(): MCPToolResult {
  try {
    const switches = handleGetSoftSwitches()
    return {
      success: true,
      data: {
        softswitches: switches,
        description: "Apple II soft switches state",
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
 * Sets soft switches by triggering their addresses
 * @param addresses Array of addresses to trigger (e.g., [0xC050, 0xC054])
 */
export function toolSetSoftSwitches(addresses: number[]): MCPToolResult {
  try {
    passSetSoftSwitches(addresses)
    return {
      success: true,
      data: {
        addressesSet: addresses,
      },
    }
  } catch (error) {
    return {
      success: false,
      error: String(error),
    }
  }
}
