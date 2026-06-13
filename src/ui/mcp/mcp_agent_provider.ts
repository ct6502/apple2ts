/**
 * AI Provider Interface - Abstract layer for different AI services
 * This makes it easy to add OpenAI, Google, or other providers later
 */

export interface AIMessage {
  role: "user" | "assistant" | "system"
  content: string
}

export interface AIToolCall {
  id: string
  name: string
  input: Record<string, unknown>
}

export interface AIResponse {
  content: string
  toolCalls?: AIToolCall[]
  stopReason?: "end_turn" | "tool_use" | "max_tokens" | "stop_sequence"
  usage?: {
    inputTokens: number
    outputTokens: number
  }
}

export interface AIStreamChunk {
  type: "content" | "tool_use" | "done" | "usage"
  content?: string
  toolCall?: AIToolCall
  usage?: {
    inputTokens: number
    outputTokens: number
  }
}

export interface AIProviderConfig {
  apiKey: string
  model?: string
  maxTokens?: number
}

/**
 * Abstract interface that all AI providers must implement
 */
export interface AIProvider {
  name: string
  
  /**
   * Send a message and get a complete response
   */
  sendMessage(
    messages: AIMessage[],
    availableTools?: Array<{ name: string; description: string; inputSchema: Record<string, unknown> }>,
    config?: Partial<AIProviderConfig>
  ): Promise<AIResponse>
  
  /**
   * Stream a response (optional - can throw "not supported" if provider doesn't support streaming)
   */
  streamMessage?(
    messages: AIMessage[],
    availableTools: Array<{ name: string; description: string; inputSchema: Record<string, unknown> }>,
    onChunk: (chunk: AIStreamChunk) => void,
    config?: Partial<AIProviderConfig>
  ): Promise<void>
  
  /**
   * Validate API key format
   */
  validateApiKey(apiKey: string): boolean
}
