
// =============================================================================
// Main MCP Interface
// =============================================================================

import { MCPToolCall, MCPToolResult } from "./mcp_server"
import { toolSetBreakpoint, toolClearBreakpoint, toolSetWatchpoint, toolEnableTrace, toolDisableTrace, toolBoot, toolReset, toolResume, toolStepInto, toolStepOut, toolStepOver, toolStop } from "./mcp_tool_debug"
import { toolInsertDisk, toolEjectDisk, toolSendKeypress, toolLoadBinary, toolLoadBundledDisk } from "./mcp_tool_media"
import { toolSetRegister, toolReadMemory, toolWriteMemory, toolSetSoftSwitches } from "./mcp_tool_state"
import { toolDisassemble } from "./mcp_tool_symbols"
import { toolReadResource } from "./mcp_tool_resources"
import { toolSetSpeed, toolSetMachineType, toolSetColorMode, toolSetSound } from "./mcp_tool_settings"

/**
 * Executes an MCP tool call
 */
export async function executeMCPTool(call: MCPToolCall): Promise<MCPToolResult> {
  const args = call.arguments || {}

  try {
    switch (call.tool) {
      // Execution Control
      case "boot":
        return await toolBoot()
      case "reset":
        return toolReset()
      case "stop":
        return toolStop()
      case "resume":
        return toolResume()
      case "step":
        return toolStepInto(args.count as number)
      case "step_over":
        return toolStepOver()
      case "step_out":
        return toolStepOut()

      // State Inspection & Modification
      case "set_register":
        return toolSetRegister(args.name as string, args.value as number)
      case "read_memory":
        return toolReadMemory(args.address as number, args.length as number)
      case "write_memory":
        return toolWriteMemory(args.address as number, args.data as number[])
      case "set_softswitches":
        return toolSetSoftSwitches(args.addresses as number[])

      // Debugging & Tracing
      case "set_breakpoint":
        return toolSetBreakpoint(args.address as number, args.condition as string)
      case "clear_breakpoint":
        return toolClearBreakpoint(args.address as number)
      case "set_watchpoint":
        return toolSetWatchpoint(args.address as number, args.mode as "r" | "w" | "rw")
      case "enable_trace":
        return toolEnableTrace()
      case "disable_trace":
        return toolDisableTrace()

      // Media & I/O
      case "insert_disk":
        return toolInsertDisk(
          args.drive as number,
          args.data as Uint8Array,
          args.filename as string
        )
      case "eject_disk":
        return toolEjectDisk(args.drive as number)
      case "load_bundled_disk":
        return await toolLoadBundledDisk(
          args.filename as string,
          args.drive as number
        )
      case "send_keypress":
        return toolSendKeypress(args.key as string | number)
      case "load_binary":
        return toolLoadBinary(
          args.data as number[],
          args.address as number,
          args.run as boolean
        )

      // Symbol & Metadata
      case "disassemble":
        return toolDisassemble(args.address as number, args.lines as number)
      
      case "read_resource":
        return toolReadResource(args.uri as string)

      // Emulator Settings
      case "set_speed":
        return toolSetSpeed(args.speed as number)
      case "set_machine_type":
        return toolSetMachineType(args.machineType as string)
      case "set_color_mode":
        return toolSetColorMode(args.colorMode as string)
      case "set_sound":
        return toolSetSound(args.enabled as boolean)

      default:
        return {
          success: false,
          error: `Unknown tool: ${call.tool}`,
        }
    }
  } catch (error) {
    return {
      success: false,
      error: `Error executing tool ${call.tool}: ${String(error)}`,
    }
  }
}
