/**
 * Model Context Protocol (MCP) Server Interface for Apple2TS Emulator
 * 
 * This file provides a standardized interface for AI agents to interact with
 * the Apple II emulator following the Model Context Protocol specification.
 * 
 * @see https://github.com/ct6502/apple2ts/issues/218
 */


// =============================================================================
// Types and Interfaces
// =============================================================================

export type MCPToolName =
  // Execution Control
  | "boot"
  | "reset"
  | "stop"
  | "resume"
  | "step"
  | "step_over"
  | "step_out"
  // State Inspection & Modification
  | "get_registers"
  | "set_register"
  | "read_memory"
  | "write_memory"
  | "get_softswitches"
  | "set_softswitches"
  // Debugging & Tracing
  | "set_breakpoint"
  | "clear_breakpoint"
  | "set_watchpoint"
  | "list_breakpoints"
  | "enable_trace"
  | "disable_trace"
  | "get_trace_log"
  | "get_backtrace"
  // Media & I/O
  | "insert_disk"
  | "eject_disk"
  | "send_keypress"
  | "load_binary"
  // Symbol & Metadata
  | "disassemble"

export type MCPResourceURI =
  | "apple2ts://memory/main"
  | "apple2ts://video/text"
  | "apple2ts://video/lores"
  | "apple2ts://video/hires"
  | "apple2ts://cpu/status"
  | "apple2ts://debugger/stack"

export interface MCPToolCall {
  tool: MCPToolName
  arguments?: Record<string, unknown>
}

export interface MCPToolResult {
  success: boolean
  data?: unknown
  error?: string
}

export interface MCPResource {
  uri: MCPResourceURI
  mimeType: string
  data: unknown
}
