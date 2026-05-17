
// =============================================================================
// Main MCP Interface
// =============================================================================

import { MCPToolCall, MCPToolResult } from "./mcp_server"
import { toolSetBreakpoint, toolClearBreakpoint, toolSetWatchpoint, toolListBreakpoints, toolEnableTrace, toolDisableTrace, toolGetTraceLog, toolGetBacktrace, toolBoot, toolReset, toolResume, toolStepInto, toolStepOut, toolStepOver, toolStop } from "./mcp_tool_debug"
import { toolInsertDisk, toolEjectDisk, toolSendKeypress, toolLoadBinary } from "./mcp_tool_media"
import { toolGetRegisters, toolSetRegister, toolReadMemory, toolWriteMemory, toolGetSoftSwitches, toolSetSoftSwitches } from "./mcp_tool_state"
import { toolDisassemble } from "./mcp_tool_symbols"

/**
 * Executes an MCP tool call
 */
export function executeMCPTool(call: MCPToolCall): MCPToolResult {
  const args = call.arguments || {}

  try {
    switch (call.tool) {
      // Execution Control
      case "boot":
        return toolBoot()
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
      case "get_registers":
        return toolGetRegisters()
      case "set_register":
        return toolSetRegister(args.name as string, args.value as number)
      case "read_memory":
        return toolReadMemory(args.address as number, args.length as number)
      case "write_memory":
        return toolWriteMemory(args.address as number, args.data as number[])
      case "get_softswitches":
        return toolGetSoftSwitches()
      case "set_softswitches":
        return toolSetSoftSwitches(args.addresses as number[])

      // Debugging & Tracing
      case "set_breakpoint":
        return toolSetBreakpoint(args.address as number, args.condition as string)
      case "clear_breakpoint":
        return toolClearBreakpoint(args.address as number)
      case "set_watchpoint":
        return toolSetWatchpoint(args.address as number, args.mode as "r" | "w" | "rw")
      case "list_breakpoints":
        return toolListBreakpoints()
      case "enable_trace":
        return toolEnableTrace()
      case "disable_trace":
        return toolDisableTrace()
      case "get_trace_log":
        return toolGetTraceLog()
      case "get_backtrace":
        return toolGetBacktrace(args.depth as number)

      // Media & I/O
      case "insert_disk":
        return toolInsertDisk(
          args.drive as number,
          args.data as Uint8Array,
          args.filename as string
        )
      case "eject_disk":
        return toolEjectDisk(args.drive as number)
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
