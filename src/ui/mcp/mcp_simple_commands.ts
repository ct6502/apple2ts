/**
 * Simple Command Parser
 * Handles direct tool execution for simple commands without needing AI
 */

import { executeMCPTool } from "./mcp_tool_execute"
import type { MCPToolCall, MCPToolResult, MCPToolName } from "./mcp_server"

export interface SimpleCommandResult {
  toolName: MCPToolName
  result: MCPToolResult
}

/**
 * Try to parse and execute a simple direct command
 * Returns the tool result if it's a recognized simple command, null otherwise
 * Only handles single-word commands - anything complex goes to Claude
 */
export async function trySimpleCommand(userMessage: string): Promise<SimpleCommandResult | null> {
  const input = userMessage.trim().toLowerCase()
  
  // Simple single-word commands that map directly to tools with no parameters
  const simpleCommands: Record<string, MCPToolCall> = {
    "boot": { tool: "boot" },
    "reset": { tool: "reset" },
    "stop": { tool: "stop" },
    "pause": { tool: "stop" },
    "resume": { tool: "resume" },
    "continue": { tool: "resume" },
    "run": { tool: "resume" },
    "step": { tool: "step", arguments: { count: 1 } },
    "registers": { tool: "get_registers" },
    "breakpoints": { tool: "list_breakpoints" },
    "softswitches": { tool: "get_softswitches" },
  }
  
  if (simpleCommands[input]) {
    const toolCall = simpleCommands[input]
    const result = await executeMCPTool(toolCall)
    return { toolName: toolCall.tool, result }
  }
  
  // Check for step with a number (e.g., "step 10") - unambiguous pattern
  const stepMatch = input.match(/^step\s+(\d+)$/)
  if (stepMatch) {
    const count = parseInt(stepMatch[1], 10)
    const result = await executeMCPTool({ tool: "step", arguments: { count } })
    return { toolName: "step", result }
  }
  
  // Everything else (multi-word commands, natural language) goes to Claude
  return null
}

/**
 * Format a tool result into a user-friendly message
 */
export function formatSimpleCommandResult(toolName: MCPToolName, result: MCPToolResult): string {
  if (!result.success) {
    return `Error: ${result.error || "Command failed"}`
  }
  
  // Format based on tool type
  switch (toolName) {
    case "boot":
      return "✓ System booted"
    case "reset":
      return "✓ System reset"
    case "stop":
      return "✓ Execution paused"
    case "resume":
      return "✓ Execution resumed"
    case "step":
    case "step_over":
    case "step_out":
      return "✓ Step completed"
    case "get_registers":
      if (result.data && typeof result.data === "object") {
        const regs = result.data as Record<string, number>
        return `Registers:\n  A: $${regs.A?.toString(16).padStart(2, "0").toUpperCase()}\n  X: $${regs.X?.toString(16).padStart(2, "0").toUpperCase()}\n  Y: $${regs.Y?.toString(16).padStart(2, "0").toUpperCase()}\n  PC: $${regs.PC?.toString(16).padStart(4, "0").toUpperCase()}\n  S: $${regs.S?.toString(16).padStart(2, "0").toUpperCase()}\n  P: $${regs.P?.toString(16).padStart(2, "0").toUpperCase()}`
      }
      return "✓ Registers retrieved"
    case "list_breakpoints":
      if (result.data && typeof result.data === "object" && "breakpoints" in result.data) {
        const bp = result.data as { breakpoints: unknown[] }
        if (bp.breakpoints.length === 0) {
          return "No breakpoints set"
        }
        return `Breakpoints (${bp.breakpoints.length}):\n${JSON.stringify(bp.breakpoints, null, 2)}`
      }
      return "✓ Breakpoints listed"
    case "enable_trace":
      return "✓ Trace logging enabled"
    case "disable_trace":
      return "✓ Trace logging disabled"
    case "load_bundled_disk":
      if (result.data && typeof result.data === "object" && "filename" in result.data) {
        const data = result.data as { filename: string; message?: string }
        return `✓ ${data.message || `Loaded ${data.filename}`}`
      }
      return "✓ Disk loaded"
    case "send_keypress":
      if (result.data && typeof result.data === "object") {
        if ("typed" in result.data) {
          const data = result.data as { typed: string }
          return `✓ Typed: ${data.typed}`
        } else if ("character" in result.data) {
          const data = result.data as { character: string }
          return `✓ Sent key: ${data.character}`
        }
      }
      return "✓ Key sent"
    default:
      if (typeof result.data === "string") {
        return result.data
      }
      if (result.data) {
        return JSON.stringify(result.data, null, 2)
      }
      return "✓ Command executed successfully"
  }
}
