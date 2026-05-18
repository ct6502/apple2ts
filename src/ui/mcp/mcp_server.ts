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
  | "set_register"
  | "read_memory"
  | "write_memory"
  | "set_softswitches"
  // Debugging & Tracing
  | "set_breakpoint"
  | "clear_breakpoint"
  | "set_watchpoint"
  | "enable_trace"
  | "disable_trace"
  // Media & I/O
  | "insert_disk"
  | "eject_disk"
  | "load_bundled_disk"
  | "send_keypress"
  | "press_apple_key"
  | "release_apple_key"
  | "load_binary"
  // Symbol & Metadata
  | "disassemble"
  | "read_resource"
  // Emulator Settings
  | "set_speed"
  | "set_machine_type"
  | "set_color_mode"
  | "set_sound"

export type MCPResourceURI =
  | "apple2ts://memory/main"
  | "apple2ts://video/text"
  | "apple2ts://video/lores"
  | "apple2ts://video/hires"
  | "apple2ts://cpu/status"
  | "apple2ts://system/softswitches"
  | "apple2ts://debugger/stack"
  | "apple2ts://debugger/breakpoints"
  | "apple2ts://debugger/trace"
  | "apple2ts://debugger/backtrace"
  | "apple2ts://disks/catalog"
  | "apple2ts://emulator/settings"

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
