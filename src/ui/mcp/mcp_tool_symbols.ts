/**
 * MCP Symbol & Metadata Tools
 * Tools for disassembly and symbol management
 */

import { handleGetMemoryResource } from "../main2worker"
import { opCodes } from "../../common/opcodes"
import type { MCPToolResult } from "./mcp_server"

/**
 * Returns the assembly mnemonics for a range of memory
 * @param address Starting address
 * @param lines Number of instructions to disassemble
 */
export function toolDisassemble(address: number, lines = 10): MCPToolResult {
  try {
    if (address < 0 || address > 0xFFFF) {
      return {
        success: false,
        error: `Invalid address: ${address}. Must be 0-65535`,
      }
    }

    const memory = handleGetMemoryResource()
    const instructions: Array<{
      address: number
      bytes: number[]
      mnemonic: string
      hexBytes: string
    }> = []

    let currentAddr = address
    for (let i = 0; i < lines && currentAddr < 0x10000; i++) {
      const opcode = memory[currentAddr]
      const code = opCodes[opcode]
      
      const bytes: number[] = [opcode]
      const vLo = code.bytes > 1 ? memory[(currentAddr + 1) & 0xFFFF] : 0
      const vHi = code.bytes > 2 ? memory[(currentAddr + 2) & 0xFFFF] : 0
      
      if (code.bytes > 1) bytes.push(vLo)
      if (code.bytes > 2) bytes.push(vHi)

      // Format hex bytes for display
      const hexBytes = bytes.map(b => b.toString(16).padStart(2, "0").toUpperCase()).join(" ")

      instructions.push({
        address: currentAddr,
        bytes: bytes,
        mnemonic: code.name,
        hexBytes: hexBytes,
      })

      currentAddr += code.bytes
    }

    return {
      success: true,
      data: {
        startAddress: address,
        instructions: instructions,
        count: instructions.length,
      },
    }
  } catch (error) {
    return {
      success: false,
      error: String(error),
    }
  }
}
