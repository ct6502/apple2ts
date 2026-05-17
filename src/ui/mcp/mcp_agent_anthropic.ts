/**
 * Anthropic Claude Provider Implementation
 */

import type { AIProvider, AIMessage, AIResponse, AIStreamChunk, AIProviderConfig } from "./mcp_agent_provider"

const ANTHROPIC_API_URL = "https://api.anthropic.com/v1/messages"
const ANTHROPIC_VERSION = "2023-06-01"
const CORS_PROXY = "https://proxy.corsfix.com/?"

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
    
    if (systemPrompt) {
      requestBody.system = systemPrompt
    }
    
    if (config?.temperature !== undefined) {
      requestBody.temperature = config.temperature
    }
    
    // Add tools if available
    if (availableTools && availableTools.length > 0) {
      requestBody.tools = availableTools.map(tool => ({
        name: tool.name,
        description: tool.description,
        input_schema: tool.inputSchema,
      }))
    }
    
    try {
      const response = await fetch(CORS_PROXY + ANTHROPIC_API_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-api-key": this.apiKey,
          "anthropic-version": ANTHROPIC_VERSION,
        },
        body: JSON.stringify(requestBody),
      })
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(
          `Anthropic API error: ${response.status} ${response.statusText}\n${JSON.stringify(errorData, null, 2)}`
        )
      }
      
      const data = await response.json()
      
      // Parse response
      const result: AIResponse = {
        content: "",
        stopReason: data.stop_reason,
        toolCalls: [],
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
      throw new Error(`Failed to call Anthropic API: ${error instanceof Error ? error.message : String(error)}`)
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
    
    if (systemPrompt) {
      requestBody.system = systemPrompt
    }
    
    if (config?.temperature !== undefined) {
      requestBody.temperature = config.temperature
    }
    
    // Add tools if available
    if (availableTools && availableTools.length > 0) {
      requestBody.tools = availableTools.map(tool => ({
        name: tool.name,
        description: tool.description,
        input_schema: tool.inputSchema,
      }))
    }
    
    try {
      const response = await fetch(CORS_PROXY + ANTHROPIC_API_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-api-key": this.apiKey,
          "anthropic-version": ANTHROPIC_VERSION,
        },
        body: JSON.stringify(requestBody),
      })
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(
          `Anthropic API error: ${response.status} ${response.statusText}\n${JSON.stringify(errorData, null, 2)}`
        )
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
      throw new Error(`Failed to stream from Anthropic API: ${error instanceof Error ? error.message : String(error)}`)
    }
  }
}
