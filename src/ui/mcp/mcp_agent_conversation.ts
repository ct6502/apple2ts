/**
 * Conversation History Management
 * Handles message history, context management, and conversation state
 */

import type { AIMessage } from "./mcp_agent_provider"
import { defaultSystemPrompt } from "./mcp_prompt"
import type { MCPToolResult } from "./mcp_server"

export interface ConversationMessage {
  id: string
  role: "user" | "assistant" | "system"
  content: string
  timestamp: Date
  isToolResult?: boolean // Internal message for API, not shown to user
  toolCalls?: Array<{
    id: string
    name: string
    input: Record<string, unknown>
    result?: MCPToolResult
  }>
  usage?: {
    inputTokens: number
    outputTokens: number
  }
}

export class ConversationHistory {
  private messages: ConversationMessage[] = []
  private maxMessages: number
  private systemPrompt: string
  
  constructor(maxMessages = 50, systemPrompt?: string) {
    this.maxMessages = maxMessages
    this.systemPrompt = systemPrompt || defaultSystemPrompt
  }

  /**
   * Add a message to the conversation
   */
  addMessage(message: Omit<ConversationMessage, "id" | "timestamp">): ConversationMessage {
    const newMessage: ConversationMessage = {
      ...message,
      id: this.generateId(),
      timestamp: new Date(),
    }
    
    this.messages.push(newMessage)
    this.pruneMessages()
    
    return newMessage
  }
  
  /**
   * Get all messages in the conversation
   */
  getMessages(): ConversationMessage[] {
    return [...this.messages]
  }
  
  /**
   * Get messages for display in UI (excludes internal tool result messages)
   */
  getMessagesForDisplay(): ConversationMessage[] {
    return this.messages.filter(msg => !msg.isToolResult)
  }
  
  /**
   * Get messages formatted for AI provider (includes system prompt)
   */
  getMessagesForAI(): AIMessage[] {
    const aiMessages: AIMessage[] = [
      {
        role: "system",
        content: this.systemPrompt.trimEnd(),
      },
    ]
    
    // Add conversation messages
    for (const msg of this.messages) {
      if (msg.role === "system") continue // System messages already added
      
      // Trim trailing whitespace to avoid Anthropic API errors
      const content = msg.content.trimEnd()
      
      aiMessages.push({
        role: msg.role,
        content,
      })
    }
    
    return aiMessages
  }
  
  /**
   * Update the last assistant message with tool results
   */
  addToolResultToLastMessage(toolId: string, result: MCPToolResult): void {
    const lastMessage = this.messages[this.messages.length - 1]
    if (!lastMessage || lastMessage.role !== "assistant") {
      console.warn("Cannot add tool result: last message is not from assistant")
      return
    }
    
    if (!lastMessage.toolCalls) {
      lastMessage.toolCalls = []
    }
    
    const toolCall = lastMessage.toolCalls.find(tc => tc.id === toolId)
    if (toolCall) {
      toolCall.result = result
    }
  }
  
  /**
   * Clear conversation history
   */
  clear(): void {
    this.messages = []
  }
  
  /**
   * Update system prompt
   */
  setSystemPrompt(prompt: string): void {
    this.systemPrompt = prompt
  }
  
  /**
   * Get current system prompt
   */
  getSystemPrompt(): string {
    return this.systemPrompt
  }
  
  /**
   * Prune old messages to stay within limit
   */
  private pruneMessages(): void {
    if (this.messages.length > this.maxMessages) {
      // Keep the most recent messages
      this.messages = this.messages.slice(-this.maxMessages)
    }
  }
  
  /**
   * Generate a unique message ID
   */
  private generateId(): string {
    return `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  }
  
  /**
   * Export conversation to JSON
   */
  export(): string {
    return JSON.stringify({
      systemPrompt: this.systemPrompt,
      messages: this.messages,
    }, null, 2)
  }
  
  /**
   * Import conversation from JSON
   */
  import(json: string): boolean {
    try {
      const data = JSON.parse(json)
      if (data.systemPrompt) {
        this.systemPrompt = data.systemPrompt
      }
      if (Array.isArray(data.messages)) {
        this.messages = data.messages
      }
      return true
    } catch (error) {
      console.error("Failed to import conversation:", error)
      return false
    }
  }
}
