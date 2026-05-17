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
    default:
      // Generic success message for other tools
      return result.data && typeof result.data === "object" && "message" in result.data
        ? String((result.data as { message: unknown }).message)
        : "✓ Command completed"
  }
}
