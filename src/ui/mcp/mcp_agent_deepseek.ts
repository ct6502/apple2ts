/**
 * DeepSeek AI Provider Implementation
 * Uses Anthropic-compatible API at https://api.deepseek.com
 */

import type { AIProvider, AIMessage, AIResponse, AIStreamChunk, AIProviderConfig } from "./mcp_agent_provider"

const DEEPSEEK_API_URL = "https://api.deepseek.com/anthropic/v1/messages"
const CORS_PROXY = "https://proxy.corsfix.com/?url="

/**
 * Make an API request to DeepSeek (always through CORS proxy since no local proxy for DeepSeek)
 */
async function makeApiRequest(
  requestBody: Record<string, unknown>,
  headers: Record<string, string>,
  apiKey: string
): Promise<Response> {
  const corsUrl = CORS_PROXY + encodeURIComponent(DEEPSEEK_API_URL)
  // console.log("[DeepSeek] Making API request to:", corsUrl)
  // console.log("[DeepSeek] Model:", requestBody.model)
  
  const corsHeaders = {
    ...headers,
    "Authorization": `Bearer ${apiKey}`,
  }
  
  return fetch(corsUrl, {
    method: "POST",
    headers: corsHeaders,
    body: JSON.stringify(requestBody),
  })
}

/**
 * Format DeepSeek API error messages in a human-readable way
 */
function formatDeepSeekError(status: number, statusText: string, errorData: Record<string, unknown>): string {
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
  
  // Check if this is a DeepSeek API error (Anthropic-compatible format)
  const error = errorData?.error as { type?: string; message?: string } | undefined
  if (error?.type || error?.message) {
    const errorType = error?.type || "unknown_error"
    const errorMessage = error?.message || statusText
    
    let formattedMessage = `## DeepSeek API Error (${status})\n`
    
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

export class DeepSeekProvider implements AIProvider {
  name = "DeepSeek AI"
  
  private apiKey: string
  private defaultModel: string
  
  constructor(apiKey: string, model = "DeepSeek-V4-Flash") {
    this.apiKey = apiKey
    this.defaultModel = model
  }
  
  validateApiKey(apiKey: string): boolean {
    // DeepSeek keys start with "sk-" and are at least 20 characters
    return apiKey.startsWith("sk-") && apiKey.length > 20
  }
  
  getSupportedModels(): string[] {
    return [
      "deepseek-v4-flash",
      "deepseek-v4-flash-thinking",
      "deepseek-v4-pro",
      "deepseek-v4-pro-thinking",
    ]
  }
  
  /**
   * Check if model uses thinking mode
   */
  private isThinkingMode(model: string): boolean {
    return model.toLowerCase().includes("thinking")
  }
  
  /**
   * Get base model name (strip -thinking suffix and convert to API format)
   */
  private getBaseModel(model: string): string {
    // Normalize model name (handle old format)
    let normalizedModel = model.toLowerCase()
    
    // Remove -thinking suffix if present
    normalizedModel = normalizedModel.replace("-thinking", "")
    
    return normalizedModel
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
    
    const modelToUse = config?.model || this.defaultModel
    const baseModel = this.getBaseModel(modelToUse)
    const enableThinking = this.isThinkingMode(modelToUse)
    
    // Build request body (Anthropic-compatible format)
    const requestBody: Record<string, unknown> = {
      model: baseModel,
      max_tokens: config?.maxTokens || 4096,
      messages: conversationMessages.map(m => ({
        role: m.role,
        content: m.content,
      })),
    }
    
    // Enable thinking mode if requested
    if (enableThinking) {
      requestBody.thinking = {
        type: "enabled",
      }
    }
    
    // Add system prompt
    if (systemPrompt) {
      requestBody.system = systemPrompt
    }
    
    if (config?.temperature !== undefined) {
      requestBody.temperature = config.temperature
    }
    
    // Add tools if provided
    if (availableTools && availableTools.length > 0) {
      requestBody.tools = availableTools.map((tool) => ({
        name: tool.name,
        description: tool.description,
        input_schema: tool.inputSchema,
      }))
    }
    
    try {
      const headers: Record<string, string> = {
        "Content-Type": "application/json",
      }
      
      const response = await makeApiRequest(requestBody, headers, this.apiKey)
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(formatDeepSeekError(response.status, response.statusText, errorData))
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
      
      // Handle content blocks (Anthropic-compatible format)
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
      // Re-throw without adding prefix - formatDeepSeekError already provides context
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
    
    const modelToUse = config?.model || this.defaultModel
    const baseModel = this.getBaseModel(modelToUse)
    const enableThinking = this.isThinkingMode(modelToUse)
    
    // Build request body
    const requestBody: Record<string, unknown> = {
      model: baseModel,
      max_tokens: config?.maxTokens || 4096,
      messages: conversationMessages.map(m => ({
        role: m.role,
        content: m.content,
      })),
      stream: true,
    }
    
    // Enable thinking mode if requested
    if (enableThinking) {
      requestBody.thinking = {
        type: "enabled",
        budget_tokens: 4096,
      }
    }
    
    // Add system prompt
    if (systemPrompt) {
      requestBody.system = systemPrompt
    }
    
    if (config?.temperature !== undefined) {
      requestBody.temperature = config.temperature
    }
    
    // Add tools
    if (availableTools && availableTools.length > 0) {
      requestBody.tools = availableTools.map((tool) => ({
        name: tool.name,
        description: tool.description,
        input_schema: tool.inputSchema,
      }))
    }
    
    try {
      const headers: Record<string, string> = {
        "Content-Type": "application/json",
      }
      
      const response = await makeApiRequest(requestBody, headers, this.apiKey)
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(formatDeepSeekError(response.status, response.statusText, errorData))
      }
      
      if (!response.body) {
        throw new Error("Response body is null")
      }
      
      // Parse SSE stream
      const reader = response.body.getReader()
      const decoder = new TextDecoder()
      let buffer = ""
      
      // Track tool inputs as they stream in
      const toolInputBuffers = new Map<string, string>()
      const toolMetadata = new Map<string, { id: string; name: string }>()
      
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
                // Store tool metadata
                const blockIndex = event.index
                toolMetadata.set(blockIndex, {
                  id: event.content_block.id,
                  name: event.content_block.name,
                })
                toolInputBuffers.set(blockIndex, "")
              } else if (event.type === "content_block_delta" && event.delta?.type === "input_json_delta") {
                // Accumulate tool input JSON
                const blockIndex = event.index
                const currentBuffer = toolInputBuffers.get(blockIndex) || ""
                toolInputBuffers.set(blockIndex, currentBuffer + event.delta.partial_json)
              } else if (event.type === "content_block_stop") {
                // Tool input is complete, parse and emit
                const blockIndex = event.index
                const metadata = toolMetadata.get(blockIndex)
                const inputJson = toolInputBuffers.get(blockIndex)
                
                if (metadata && inputJson !== undefined) {
                  try {
                    const input = JSON.parse(inputJson)
                    onChunk({
                      type: "tool_use",
                      toolCall: {
                        id: metadata.id,
                        name: metadata.name,
                        input,
                      },
                    })
                  } catch (e) {
                    console.warn("Failed to parse tool input JSON:", inputJson, e)
                  }
                  
                  // Clean up
                  toolMetadata.delete(blockIndex)
                  toolInputBuffers.delete(blockIndex)
                }
              } else if (event.type === "message_delta" && event.usage) {
                // Emit usage data
                onChunk({
                  type: "usage",
                  usage: {
                    inputTokens: event.usage.input_tokens || 0,
                    outputTokens: event.usage.output_tokens || 0,
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
      // Re-throw without adding prefix - formatDeepSeekError already provides context
      if (error instanceof Error) {
        throw error
      }
      throw new Error(String(error))
    }
  }
}
