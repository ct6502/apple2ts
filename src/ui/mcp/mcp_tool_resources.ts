/**
 * MCP Resource Tools
 * Tools for accessing MCP resources
 */

import { getMCPResource } from "./mcp_resources"
import type { MCPToolResult, MCPResourceURI } from "./mcp_server"

/**
 * Reads a resource by URI
 * @param uri Resource URI (e.g., "apple2ts://video/text")
 */
export function toolReadResource(uri: string): MCPToolResult {
  try {
    const resource = getMCPResource(uri as MCPResourceURI)
    
    if (!resource) {
      return {
        success: false,
        error: `Resource not found: ${uri}`,
      }
    }
    
    return {
      success: true,
      data: resource.data,
    }
  } catch (error) {
    return {
      success: false,
      error: String(error),
    }
  }
}
