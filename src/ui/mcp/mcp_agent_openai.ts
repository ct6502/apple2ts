/**
 * OpenAI ChatGPT Provider Implementation
 */

import { AIProviderModel } from "./mcp_agent_config"
import type { AIProvider, AIMessage, AIResponse, AIStreamChunk, AIProviderConfig } from "./mcp_agent_provider"
import { hasToolSchemaProperties, type OpenAIStyleToolCall } from "./mcp_agent_tool_types"

const OPENAI_API_URL = "https://api.openai.com/v1/chat/completions"
const CORS_PROXY = "https://proxy.corsfix.com/?url="

/**
 * Make an API request to OpenAI (with CORS proxy fallback)
 */
async function makeApiRequest(
  requestBody: Record<string, unknown>,
  headers: Record<string, string>,
  apiKey: string
): Promise<Response> {
  // Add authorization header
  const fullHeaders = {
    ...headers,
    "Authorization": `Bearer ${apiKey}`,
  }

  // Try direct request first (OpenAI supports CORS)
  try {
    const response = await fetch(OPENAI_API_URL, {
      method: "POST",
      headers: fullHeaders,
      body: JSON.stringify(requestBody),
    })
    return response
  } catch (error) {
    console.log("[OpenAI] Direct request failed, trying CORS proxy:", error)
  }

  // Fallback to CORS proxy
  const proxiedUrl = CORS_PROXY + encodeURIComponent(OPENAI_API_URL)
  const response = await fetch(proxiedUrl, {
    method: "POST",
    headers: fullHeaders,
    body: JSON.stringify(requestBody),
  })

  return response
}

/**
 * Format OpenAI API error messages in a human-readable way
 */
function formatOpenAIError(status: number, statusText: string, errorData: Record<string, unknown>): string {
  const errorObj = errorData.error as Record<string, unknown> | undefined
  const message = errorObj?.message as string | undefined
  const type = errorObj?.type as string | undefined

  if (status === 401) {
    return "OpenAI API Error: Invalid API key. Please check your API key in the configuration."
  } else if (status === 429) {
    return "OpenAI API Error: Rate limit exceeded or quota reached. Please check your OpenAI account."
  } else if (status === 500 || status === 502 || status === 503) {
    return `OpenAI API Error: Server error (${status}). The OpenAI service may be temporarily unavailable.`
  } else if (message) {
    return `OpenAI API Error: ${message}${type ? ` (${type})` : ""}`
  } else {
    return `OpenAI API Error: ${status} ${statusText}`
  }
}

/**
 * Convert Anthropic-style tool format to OpenAI format
 */
function convertToolsToOpenAI(
  tools: Array<{ name: string; description: string; inputSchema: Record<string, unknown> }>
): Array<Record<string, unknown>> {
  return tools.map(tool => {
    const hasProperties = hasToolSchemaProperties(tool.inputSchema)

    return {
      type: "function",
      function: {
        name: tool.name,
        description: tool.description,
        ...(hasProperties ? { parameters: tool.inputSchema } : {}),
      },
    }
  })
}

export class OpenAIProvider implements AIProvider {
  static validateApiKeyFormat(apiKey: string): boolean {
    return apiKey.startsWith("sk-") && apiKey.length > 20
  }
  name = "OpenAI ChatGPT"

  private apiKey: string
  private defaultModel: string
  
  static getSupportedModels(): Array<AIProviderModel> {
    return [
      { value: "gpt-5.4-mini", label: "GPT-5.4 mini" },
      { value: "gpt-5.4", label: "GPT-5.4" },
      { value: "gpt-5.5", label: "GPT-5.5" },
    ]
  }
  
  constructor(apiKey: string, model: string) {
    this.apiKey = apiKey
    this.defaultModel = model
  }
  
  validateApiKey(apiKey: string): boolean {
    // OpenAI keys start with "sk-" and are at least 20 characters
    return apiKey.startsWith("sk-") && apiKey.length > 20
  }
  
  async sendMessage(
    messages: AIMessage[],
    availableTools?: Array<{ name: string; description: string; inputSchema: Record<string, unknown> }>,
    config?: Partial<AIProviderConfig>
  ): Promise<AIResponse> {
    const modelToUse = config?.model || this.defaultModel
    
    // Build request body (OpenAI format)
    const requestBody: Record<string, unknown> = {
      model: modelToUse,
      messages: messages.map(m => ({
        role: m.role,
        content: m.content,
      })),
    }
    
    if (config?.maxTokens !== undefined) {
      requestBody.max_tokens = config.maxTokens
    }
    
    // Add tools if provided
    if (availableTools && availableTools.length > 0) {
      requestBody.tools = convertToolsToOpenAI(availableTools)
      requestBody.tool_choice = "auto"
    }
    
    try {
      const headers: Record<string, string> = {
        "Content-Type": "application/json",
      }
      
      const response = await makeApiRequest(requestBody, headers, this.apiKey)
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(formatOpenAIError(response.status, response.statusText, errorData))
      }
      
      const data = await response.json()
      
      // Parse response
      const result: AIResponse = {
        content: "",
        stopReason: this.mapFinishReason(data.choices[0]?.finish_reason),
        toolCalls: [],
        usage: data.usage ? {
          inputTokens: data.usage.prompt_tokens || 0,
          outputTokens: data.usage.completion_tokens || 0,
        } : undefined,
      }
      
      // Extract content and tool calls
      const choice = data.choices[0]
      if (choice?.message) {
        result.content = choice.message.content || ""
        
        // Handle tool calls
        if (choice.message.tool_calls) {
          result.toolCalls = (choice.message.tool_calls as OpenAIStyleToolCall[]).map((tc) => ({
            id: tc.id,
            name: tc.function.name,
            input: typeof tc.function.arguments === "string"
              ? JSON.parse(tc.function.arguments)
              : tc.function.arguments,
          }))
        }
      }
      
      return result
    } catch (error) {
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
    const modelToUse = config?.model || this.defaultModel
    
    // Build request body
    const requestBody: Record<string, unknown> = {
      model: modelToUse,
      messages: messages.map(m => ({
        role: m.role,
        content: m.content,
      })),
      stream: true,
    }
    
    if (config?.maxTokens !== undefined) {
      requestBody.max_tokens = config.maxTokens
    }
    
    // Add tools
    if (availableTools && availableTools.length > 0) {
      requestBody.tools = convertToolsToOpenAI(availableTools)
      requestBody.tool_choice = "auto"
    }
    
    try {
      const headers: Record<string, string> = {
        "Content-Type": "application/json",
      }
      
      const response = await makeApiRequest(requestBody, headers, this.apiKey)
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(formatOpenAIError(response.status, response.statusText, errorData))
      }
      
      if (!response.body) {
        throw new Error("Response body is null")
      }
      
      // Parse SSE stream
      const reader = response.body.getReader()
      const decoder = new TextDecoder()
      let buffer = ""
      
      // Track tool calls as they come in
      const toolCallBuffers = new Map<number, { id?: string; name?: string; arguments: string }>()
      
      while (true) {
        const { done, value } = await reader.read()
        
        if (done) {
          // Emit any remaining tool calls in the buffer (just in case they weren't emitted yet)
          for (const [, buffer] of toolCallBuffers) {
            if (buffer.id && buffer.name && buffer.arguments) {
              try {
                const input = JSON.parse(buffer.arguments)
                onChunk({
                  type: "tool_use",
                  toolCall: {
                    id: buffer.id,
                    name: buffer.name,
                    input,
                  },
                })
              } catch (e) {
                console.warn("Failed to parse tool arguments on stream end:", buffer.arguments, e)
              }
            }
          }
          toolCallBuffers.clear()

          onChunk({ type: "done" })
          break
        }
        
        buffer += decoder.decode(value, { stream: true })
        const lines = buffer.split("\n")
        buffer = lines.pop() || ""
        
        for (const line of lines) {
          if (!line.trim() || line.startsWith(": ping")) {
            continue
          }
          
          if (line.startsWith("data: ")) {
            const data = line.slice(6)
            
            if (data === "[DONE]") {
              continue
            }
            
            try {
              const event = JSON.parse(data)
              const delta = event.choices?.[0]?.delta
              
              if (!delta) continue
              
              // Handle content
              if (delta.content) {
                onChunk({
                  type: "content",
                  content: delta.content,
                })
              }
              
              // Handle tool calls
              if (delta.tool_calls) {
                for (const tc of delta.tool_calls) {
                  const index = tc.index
                  
                  if (!toolCallBuffers.has(index)) {
                    toolCallBuffers.set(index, { arguments: "" })
                  }
                  
                  const buffer = toolCallBuffers.get(index)!
                  
                  if (tc.id) {
                    buffer.id = tc.id
                  }
                  
                  if (tc.function?.name) {
                    buffer.name = tc.function.name
                  }
                  
                  if (tc.function?.arguments) {
                    buffer.arguments += tc.function.arguments
                  }
                }
              }
              
              // Check for finish_reason to emit complete tool calls
              const finishReason = event.choices?.[0]?.finish_reason
              if (finishReason === "tool_calls" || finishReason === "stop") {
                for (const [, buffer] of toolCallBuffers) {
                  if (buffer.id && buffer.name && buffer.arguments) {
                    try {
                      const input = JSON.parse(buffer.arguments)
                      onChunk({
                        type: "tool_use",
                        toolCall: {
                          id: buffer.id,
                          name: buffer.name,
                          input,
                        },
                      })
                    } catch (e) {
                      console.warn("Failed to parse tool arguments:", buffer.arguments, e)
                    }
                  }
                }
                toolCallBuffers.clear()
              }
              
              // Handle usage data
              if (event.usage) {
                onChunk({
                  type: "usage",
                  usage: {
                    inputTokens: event.usage.prompt_tokens || 0,
                    outputTokens: event.usage.completion_tokens || 0,
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
      if (error instanceof Error) {
        throw error
      }
      throw new Error(String(error))
    }
  }
  
  /**
   * Map OpenAI finish_reason to standard stop reason
   */
  private mapFinishReason(reason: string | undefined): AIResponse["stopReason"] {
    switch (reason) {
      case "stop":
        return "end_turn"
      case "tool_calls":
        return "tool_use"
      case "length":
        return "max_tokens"
      default:
        return "end_turn"
    }
  }
}
