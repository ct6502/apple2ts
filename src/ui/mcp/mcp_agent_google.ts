/**
 * Google Gemini Provider Implementation
 * Uses OpenAI-compatible API at https://generativelanguage.googleapis.com/v1beta/openai/chat/completions
 */

import { AIProviderModel } from "./mcp_agent_config"
import type { AIProvider, AIMessage, AIResponse, AIStreamChunk, AIProviderConfig } from "./mcp_agent_provider"

const GEMINI_API_URL = "https://generativelanguage.googleapis.com/v1beta/openai/chat/completions"

/**
 * Make an API request to Gemini (direct browser request since Google supports CORS)
 */
async function makeApiRequest(
  requestBody: Record<string, unknown>,
  headers: Record<string, string>,
  apiKey: string
): Promise<Response> {
  const fullHeaders = {
    ...headers,
    "Authorization": `Bearer ${apiKey}`,
  }

  return fetch(GEMINI_API_URL, {
    method: "POST",
    headers: fullHeaders,
    body: JSON.stringify(requestBody),
  })
}

/**
 * Format Gemini API error messages in a human-readable way
 */
function formatGeminiError(status: number, statusText: string, errorData: Record<string, unknown>): string {
  const errorObj = errorData.error as Record<string, unknown> | undefined
  const message = errorObj?.message as string | undefined
  const statusStr = errorObj?.status as string | undefined

  if (status === 400 && message?.includes("API key")) {
    return "Google Gemini API Error: Invalid API key. Please check your Gemini API key in the configuration."
  } else if (message) {
    return `Google Gemini API Error: ${message}${statusStr ? ` (${statusStr})` : ""}`
  } else {
    return `Google Gemini API Error: ${status} ${statusText}`
  }
}

/**
 * Convert Anthropic-style tool format to OpenAI/Gemini format
 */
function convertToolsToGemini(
  tools: Array<{ name: string; description: string; inputSchema: Record<string, unknown> }>
): Array<Record<string, unknown>> {
  return tools.map(tool => {
    const hasProperties = tool.inputSchema &&
      typeof tool.inputSchema === "object" &&
      (tool.inputSchema as any).properties &&
      Object.keys((tool.inputSchema as any).properties).length > 0

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

export class GoogleProvider implements AIProvider {
  static validateApiKeyFormat(apiKey: string): boolean {
    // Gemini keys start with "AIzaSy" (legacy) or "AQ" (new format)
    return (apiKey.startsWith("AIzaSy") || apiKey.startsWith("AQ")) && apiKey.length > 20
  }
  
  name = "Google Gemini"

  private apiKey: string
  private defaultModel: string
  
  static getSupportedModels(): Array<AIProviderModel> {
    return [
      { value: "gemini-3.5-flash", label: "Gemini 3.5 Flash" },
      { value: "gemini-3.1-flash-lite", label: "Gemini 3.1 Flash-Lite" },
      { value: "gemini-3.1-pro-preview", label: "Gemini 3.1 Pro (Preview)" },
      { value: "gemini-2.5-flash", label: "Gemini 2.5 Flash" },
      { value: "gemini-2.5-pro", label: "Gemini 2.5 Pro" },
    ]
  }
  
  constructor(apiKey: string, model: string) {
    this.apiKey = apiKey
    this.defaultModel = model
  }
  
  validateApiKey(apiKey: string): boolean {
    return GoogleProvider.validateApiKeyFormat(apiKey)
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
      requestBody.tools = convertToolsToGemini(availableTools)
      requestBody.tool_choice = "auto"
    }
    
    try {
      const headers: Record<string, string> = {
        "Content-Type": "application/json",
      }
      
      const response = await makeApiRequest(requestBody, headers, this.apiKey)
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(formatGeminiError(response.status, response.statusText, errorData))
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
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          result.toolCalls = choice.message.tool_calls.map((tc: any) => ({
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
      requestBody.tools = convertToolsToGemini(availableTools)
      requestBody.tool_choice = "auto"
    }
    
    try {
      const headers: Record<string, string> = {
        "Content-Type": "application/json",
      }
      
      const response = await makeApiRequest(requestBody, headers, this.apiKey)
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(formatGeminiError(response.status, response.statusText, errorData))
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
              if (finishReason === "tool_calls" || finishReason === "function_call" || finishReason === "stop") {
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
   * Map Gemini finish_reason to standard stop reason
   */
  private mapFinishReason(reason: string | undefined): AIResponse["stopReason"] {
    switch (reason) {
      case "stop":
        return "end_turn"
      case "tool_calls":
      case "function_call":
        return "tool_use"
      case "length":
        return "max_tokens"
      default:
        return "end_turn"
    }
  }
}
