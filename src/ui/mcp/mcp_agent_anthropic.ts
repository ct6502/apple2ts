/**
 * Anthropic Claude Provider Implementation
 */

import type { AIProvider, AIMessage, AIResponse, AIStreamChunk, AIProviderConfig } from "./mcp_agent_provider"

const ANTHROPIC_API_URL = "https://api.anthropic.com/v1/messages"
const ANTHROPIC_VERSION = "2023-06-01"
const USE_LOCAL_PROXY = window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1"
const LOCAL_PROXY_URL = `http://${window.location.hostname}:6502/api/anthropic`
const CORS_PROXY = "https://proxy.corsfix.com/?url="

function getApiUrl(): string {
  return USE_LOCAL_PROXY ? LOCAL_PROXY_URL : CORS_PROXY + ANTHROPIC_API_URL
}
/**
 * Format Anthropic API error messages in a human-readable way
 */
function formatAnthropicError(status: number, statusText: string, errorData: Record<string, unknown>): string {
  // Check if this is a CORS proxy error
  if (errorData.corsfix_error) {
    const message = errorData.message as string || "Connection failed"
    const userMessage = errorData.if_you_are_user as string
    
    let formattedMessage = `## Connection Error (${status})\n`
    formattedMessage += `**${message}**\n`
    
    if (userMessage) {
      formattedMessage += `${userMessage}\n`
    }
    
    formattedMessage += "This may be a temporary issue. Please try again in a moment."
    
    return formattedMessage
  }
  
  // Check if this is an Anthropic API error
  const error = errorData?.error as { type?: string; message?: string } | undefined
  if (error?.type || error?.message) {
    const errorType = error?.type || "unknown_error"
    const errorMessage = error?.message || statusText
    
    let formattedMessage = `## Anthropic API Error (${status})\n`
    
    // Add error type with better formatting
    if (errorType === "rate_limit_error") {
      formattedMessage += "**Rate Limit Exceeded**\n"
    } else if (errorType === "invalid_request_error") {
      formattedMessage += "**Invalid Request**\n"
    } else if (errorType === "authentication_error") {
      formattedMessage += "**Authentication Error**\n"
    } else {
      formattedMessage += `**Error Type:** ${errorType}\n`
    }
    
    // Add the main error message
    formattedMessage += errorMessage
    
    return formattedMessage
  }
  
  // Fallback for unknown error structures
  let formattedMessage = `## API Error (${status})\n`
  formattedMessage += `**${statusText}**\n`
  
  // Try to extract a message field if it exists
  if (errorData.message && typeof errorData.message === "string") {
    formattedMessage += errorData.message
  } else {
    formattedMessage += "An unexpected error occurred. Please try again."
  }
  
  return formattedMessage
}
export class AnthropicProvider implements AIProvider {
  name = "Anthropic Claude"
  
  private apiKey: string
  private defaultModel: string
  
  constructor(apiKey: string, model = "claude-sonnet-4-6") {
    this.apiKey = apiKey
    this.defaultModel = model
  }
  
  validateApiKey(apiKey: string): boolean {
    // Anthropic keys start with "sk-ant-"
    return apiKey.startsWith("sk-ant-") && apiKey.length > 20
  }
  
  getSupportedModels(): string[] {
    return [
      "claude-sonnet-4-6",
      "claude-3-5-sonnet-20240620",
      "claude-3-opus-20240229",
      "claude-3-sonnet-20240229",
      "claude-3-haiku-20240307",
    ]
  }
  
  async sendMessage(
    messages: AIMessage[],
    availableTools?: Array<{ name: string; description: string; inputSchema: Record<string, unknown> }>,
    config?: Partial<AIProviderConfig>
  ): Promise<AIResponse> {
    // Separate system messages from conversation
    const systemMessages = messages.filter(m => m.role === "system")
    const conversationMessages = messages.filter(m => m.role !== "system")
    
    const systemPrompt = systemMessages.map(m => m.content).join("\n\n")
    
    // Build request body
    const requestBody: Record<string, unknown> = {
      model: config?.model || this.defaultModel,
      max_tokens: config?.maxTokens || 4096,
      messages: conversationMessages.map(m => ({
        role: m.role,
        content: m.content,
      })),
    }
    
    // Use prompt caching for system prompt (cache for 5 minutes across requests)
    if (systemPrompt) {
      requestBody.system = [
        {
          type: "text",
          text: systemPrompt,
          cache_control: { type: "ephemeral" },
        },
      ]
    }
    
    if (config?.temperature !== undefined) {
      requestBody.temperature = config.temperature
    }
    
    // Add tools with caching on the last tool (all tools get cached together)
    if (availableTools && availableTools.length > 0) {
      requestBody.tools = availableTools.map((tool, index) => {
        const toolDef: Record<string, unknown> = {
          name: tool.name,
          description: tool.description,
          input_schema: tool.inputSchema,
        }
        
        // Add cache control to the last tool only
        if (index === availableTools.length - 1) {
          toolDef.cache_control = { type: "ephemeral" }
        }
        
        return toolDef
      })
    }
    
    try {
      const headers: Record<string, string> = {
        "Content-Type": "application/json",
        "anthropic-version": ANTHROPIC_VERSION,
        "anthropic-beta": "prompt-caching-2024-07-31",
      }
      
      // Only send API key when using CORS proxy (local proxy uses env var)
      if (!USE_LOCAL_PROXY) {
        headers["x-api-key"] = this.apiKey
      }
      
      const response = await fetch(getApiUrl(), {
        method: "POST",
        headers,
        body: JSON.stringify(requestBody),
      })
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(formatAnthropicError(response.status, response.statusText, errorData))
      }
      
      const data = await response.json()
      
      // Parse response
      const result: AIResponse = {
        content: "",
        stopReason: data.stop_reason,
        toolCalls: [],
        usage: data.usage ? {
          inputTokens: data.usage.input_tokens || 0,
          outputTokens: data.usage.output_tokens || 0,
        } : undefined,
      }
      
      // Handle content blocks
      if (data.content && Array.isArray(data.content)) {
        for (const block of data.content) {
          if (block.type === "text") {
            result.content += block.text
          } else if (block.type === "tool_use") {
            result.toolCalls?.push({
              id: block.id,
              name: block.name,
              input: block.input,
            })
          }
        }
      }
      
      return result
    } catch (error) {
      // Re-throw without adding prefix - formatAnthropicError already provides context
      if (error instanceof Error) {
        throw error
      }
      throw new Error(String(error))
    }
  }
  
  async streamMessage(
    messages: AIMessage[],
    availableTools: Array<{ name: string; description: string; inputSchema: Record<string, unknown> }>,
    onChunk: (chunk: AIStreamChunk) => void,
    config?: Partial<AIProviderConfig>
  ): Promise<void> {
    // Separate system messages from conversation
    const systemMessages = messages.filter(m => m.role === "system")
    const conversationMessages = messages.filter(m => m.role !== "system")
    
    const systemPrompt = systemMessages.map(m => m.content).join("\n\n")
    
    // Build request body
    const requestBody: Record<string, unknown> = {
      model: config?.model || this.defaultModel,
      max_tokens: config?.maxTokens || 4096,
      messages: conversationMessages.map(m => ({
        role: m.role,
        content: m.content,
      })),
      stream: true,
    }
    
    // Use prompt caching for system prompt
    if (systemPrompt) {
      requestBody.system = [
        {
          type: "text",
          text: systemPrompt,
          cache_control: { type: "ephemeral" },
        },
      ]
    }
    
    if (config?.temperature !== undefined) {
      requestBody.temperature = config.temperature
    }
    
    // Add tools with caching on the last tool
    if (availableTools && availableTools.length > 0) {
      requestBody.tools = availableTools.map((tool, index) => {
        const toolDef: Record<string, unknown> = {
          name: tool.name,
          description: tool.description,
          input_schema: tool.inputSchema,
        }
        
        // Add cache control to the last tool only
        if (index === availableTools.length - 1) {
          toolDef.cache_control = { type: "ephemeral" }
        }
        
        return toolDef
      })
    }
    
    try {
      const headers: Record<string, string> = {
        "Content-Type": "application/json",
        "anthropic-version": ANTHROPIC_VERSION,
        "anthropic-beta": "prompt-caching-2024-07-31",
      }
      
      // Only send API key when using CORS proxy (local proxy uses env var)
      if (!USE_LOCAL_PROXY) {
        headers["x-api-key"] = this.apiKey
      }
      
      const response = await fetch(getApiUrl(), {
        method: "POST",
        headers,
        body: JSON.stringify(requestBody),
      })
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(formatAnthropicError(response.status, response.statusText, errorData))
      }
      
      if (!response.body) {
        throw new Error("Response body is null")
      }
      
      // Parse SSE stream
      const reader = response.body.getReader()
      const decoder = new TextDecoder()
      let buffer = ""
      
      while (true) {
        const { done, value } = await reader.read()
        
        if (done) {
          onChunk({ type: "done" })
          break
        }
        
        buffer += decoder.decode(value, { stream: true })
        const lines = buffer.split("\n")
        buffer = lines.pop() || ""
        
        for (const line of lines) {
          if (line.startsWith("data: ")) {
            const data = line.slice(6)
            
            if (data === "[DONE]") {
              onChunk({ type: "done" })
              continue
            }
            
            try {
              const event = JSON.parse(data)
              
              if (event.type === "content_block_delta" && event.delta?.type === "text_delta") {
                onChunk({
                  type: "content",
                  content: event.delta.text,
                })
              } else if (event.type === "content_block_start" && event.content_block?.type === "tool_use") {
                onChunk({
                  type: "tool_use",
                  toolCall: {
                    id: event.content_block.id,
                    name: event.content_block.name,
                    input: {},
                  },
                })
              }
            } catch (e) {
              console.warn("Failed to parse SSE event:", data, e)
            }
          }
        }
      }
    } catch (error) {
      // Re-throw without adding prefix - formatAnthropicError already provides context
      if (error instanceof Error) {
        throw error
      }
      throw new Error(String(error))
    }
  }
}
