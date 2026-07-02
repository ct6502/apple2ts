/**
 * Ollama AI Provider Implementation
 * Uses OpenAI-compatible API at local Ollama instance (default http://localhost:11434)
 */

import { AIProviderModel } from "./mcp_agent_config"
import type { AIProvider, AIMessage, AIResponse, AIStreamChunk, AIProviderConfig } from "./mcp_agent_provider"

/**
 * Make an API request to Ollama (with local dev server proxy fallback)
 */
async function makeApiRequest(
  ollamaUrl: string,
  requestBody: Record<string, unknown>,
  headers: Record<string, string>
): Promise<Response> {
  const IS_LOCALHOST = window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1"
  const IS_DEFAULT_OLLAMA = ollamaUrl.includes("localhost") || ollamaUrl.includes("127.0.0.1")
  const LOCAL_PROXY_URL = "/api/ollama"
  
  // Try local proxy first if on localhost to bypass CORS
  if (IS_LOCALHOST && IS_DEFAULT_OLLAMA) {
    try {
      const response = await fetch(LOCAL_PROXY_URL, {
        method: "POST",
        headers: {
          ...headers,
          "x-ollama-url": ollamaUrl,
        },
        body: JSON.stringify(requestBody),
      })
      const contentType = response.headers.get("content-type")
      if (response.ok && contentType && contentType.includes("application/json")) {
        return response
      }
    } catch (error) {
      console.log("[Ollama] Local proxy failed, falling back to direct request:", error)
    }
  }

  // Direct browser request to Ollama endpoint
  const directUrl = `${ollamaUrl}/v1/chat/completions`
  return fetch(directUrl, {
    method: "POST",
    headers,
    body: JSON.stringify(requestBody),
  })
}

/**
 * Format Ollama API error messages in a human-readable way
 */
function formatOllamaError(status: number, statusText: string, errorData: Record<string, unknown>): string {
  const errorObj = errorData.error as Record<string, unknown> | string | undefined
  const message = typeof errorObj === "object" ? errorObj?.message as string | undefined : errorObj as string | undefined

  if (status === 404) {
    return "Ollama Error: Model not found. Please verify you have downloaded the model using 'ollama run <model-name>'."
  } else if (message) {
    return `Ollama Error: ${message}`
  } else {
    return `Ollama Error: ${status} ${statusText}`
  }
}

/**
 * Convert Anthropic-style tool format to OpenAI/Ollama format
 */
function convertToolsToOllama(
  tools: Array<{ name: string; description: string; inputSchema: Record<string, unknown> }>
): Array<Record<string, unknown>> {
  return tools.map(tool => ({
    type: "function",
    function: {
      name: tool.name,
      description: tool.description,
      parameters: tool.inputSchema,
    },
  }))
}

export class OllamaProvider implements AIProvider {
  static validateApiKeyFormat(apiKey: string): boolean {
    // For Ollama, the "API key" is actually the Ollama endpoint URL.
    try {
      const url = new URL(apiKey)
      return url.protocol === "http:" || url.protocol === "https:"
    } catch {
      return false
    }
  }
  
  name = "Ollama (Local)"

  private ollamaUrl: string
  private defaultModel: string
  
  static getSupportedModels(): Array<AIProviderModel> {
    return [
      { value: "ornith:9b", label: "ornith:9b" },
      { value: "qwen2.5-coder", label: "qwen2.5-coder" },
      { value: "llama3.1", label: "llama3.1" },
      { value: "llama3", label: "llama3" },
      { value: "mistral", label: "mistral" },
      { value: "phi3", label: "phi3" },
    ]
  }
  
  constructor(ollamaUrl: string, model: string) {
    this.ollamaUrl = ollamaUrl || "http://localhost:11434"
    this.defaultModel = model || "ornith:9b"
  }
  
  validateApiKey(apiKey: string): boolean {
    return OllamaProvider.validateApiKeyFormat(apiKey)
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
      requestBody.tools = convertToolsToOllama(availableTools)
      requestBody.tool_choice = "auto"
    }
    
    try {
      const headers: Record<string, string> = {
        "Content-Type": "application/json",
      }
      
      const response = await makeApiRequest(this.ollamaUrl, requestBody, headers)
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(formatOllamaError(response.status, response.statusText, errorData))
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
      if (error instanceof TypeError && error.message.includes("Failed to fetch")) {
        throw new Error(`Failed to connect to Ollama at ${this.ollamaUrl}. Please make sure Ollama is running and CORS is allowed (OLLAMA_ORIGINS="*").`)
      }
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
      requestBody.tools = convertToolsToOllama(availableTools)
      requestBody.tool_choice = "auto"
    }
    
    try {
      const headers: Record<string, string> = {
        "Content-Type": "application/json",
      }
      
      const response = await makeApiRequest(this.ollamaUrl, requestBody, headers)
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(formatOllamaError(response.status, response.statusText, errorData))
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
              if (event.choices?.[0]?.finish_reason === "tool_calls" || event.choices?.[0]?.finish_reason === "function_call") {
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
      if (error instanceof TypeError && error.message.includes("Failed to fetch")) {
        throw new Error(`Failed to connect to Ollama at ${this.ollamaUrl}. Please make sure Ollama is running and CORS is allowed (OLLAMA_ORIGINS="*").`)
      }
      if (error instanceof Error) {
        throw error
      }
      throw new Error(String(error))
    }
  }
  
  /**
   * Map Ollama finish_reason to standard stop reason
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
