/**
 * Conversation History Management
 * Handles message history, context management, and conversation state
 */

import type { AIMessage } from "./mcp_agent_provider"
import type { MCPToolResult } from "./mcp_server"

export interface ConversationMessage {
  id: string
  role: "user" | "assistant" | "system"
  content: string
  timestamp: Date
  toolCalls?: Array<{
    id: string
    name: string
    input: Record<string, unknown>
    result?: MCPToolResult
  }>
}

export class ConversationHistory {
  private messages: ConversationMessage[] = []
  private maxMessages: number
  private systemPrompt: string
  
  constructor(maxMessages = 50, systemPrompt?: string) {
    this.maxMessages = maxMessages
    this.systemPrompt = systemPrompt || this.getDefaultSystemPrompt()
  }
  
  /**
   * Get default system prompt for the Apple II agent
   */
  private getDefaultSystemPrompt(): string {
    return `You are an AI assistant helping users interact with an Apple II emulator.

You have access to various tools that let you control and inspect the emulator:
- Execute and debug 6502 assembly code
- Read/write memory and registers  
- Control execution (boot, reset, step, breakpoints)
- Load programs and insert disks
- Type text and commands using send_keypress (can send entire strings, use "\n" or code 13 for Enter)
- Access screen content and system state

BUNDLED DISK IMAGES: The emulator includes these games and programs. Use the 'load_bundled_disk' tool with the exact filename:
- Total Replay (https://ct6502.org/wp-content/uploads/2026/01/TotalReplay.hdv_.zip) - Massive collection of 508 classic arcade and action games including Choplifter, Lode Runner, Oregon Trail, Prince of Persia, Karateka, Tetris, Pac-Man, Frogger, Donkey Kong, Centipede, Dig Dug, Joust, Defender, and many more. After loading, type the first 3-4 characters of the game name and press Enter.
- Instant Replay (https://ct6502.org/wp-content/uploads/2026/01/TotalReplayII.hdv_.zip) - Collection of 94 sports and strategy games (California Games, Hardball, F-15 Strike Eagle, Battle Chess, etc.)
- Wizard Replay (https://ct6502.org/wp-content/uploads/2026/01/WizardReplay.hdv_.zip) - Frontend for 8 classic Wizardry RPG scenarios with integrated character editor
- Pitch Dark (https://ct6502.org/wp-content/uploads/2026/01/PitchDark.hdv_.zip) - Interactive fiction
- Olympic Decathlon (Olympic%20Decathlon.woz) - Sports game
- Ultima IV (Ultima%20IV.hdv) - Classic RPG
- Ultima V (Ultima%20V.hdv) - Classic RPG
- Nox Archaist Demo (Nox%20Archaist%20Demo.hdv) - Modern RPG
- And several other games and utilities (check the disk catalog resource for the full list)

IMPORTANT: When a user asks to play a game like "Choplifter", check the disk catalog to see which collection contains it. Load that collection disk using load_bundled_disk (this tool waits for the disk to boot), then use send_keypress to type the first 3-4 characters of the game name (e.g., "Chop") followed by Enter ("\n"). The collection menu will auto-complete and launch the game. You can call both tools in the same response.

When users ask questions or request actions:
1. Use the appropriate MCP tools to accomplish tasks
2. Explain what you're doing in clear, friendly language
3. Show relevant output (memory dumps, registers, screen content)
4. Help debug issues by inspecting state

Be concise but informative. If something goes wrong, explain why and suggest alternatives.`
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
