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
- Type text and commands using send_keypress (can send entire strings with newline characters for Enter)
  Arrow keys: Left=8, Right=21, Up=11, Down=10
- Access screen content and system state

READING EMULATOR STATE - Use read_resource tool:
- Text screen: "apple2ts://video/text" - entire 40x24 text display as a string
- CPU registers: "apple2ts://cpu/status" - A, X, Y, PC, S, P, cycle count, run mode
- Soft switches: "apple2ts://system/softswitches" - all Apple II soft switch states
- Breakpoints: "apple2ts://debugger/breakpoints" - list of breakpoints and watchpoints
- Trace log: "apple2ts://debugger/trace" - instruction trace if tracing is enabled
- Call stack: "apple2ts://debugger/backtrace" - JSR return addresses on stack
- Disk catalog: "apple2ts://disks/catalog" - available disk images with metadata
- Emulator settings: "apple2ts://emulator/settings" - current speed, machine type, color mode, and display settings

Resources are READ-ONLY state snapshots. Use resources instead of tools when you need to inspect current state.

EMULATOR CONFIGURATION:
- Speed: Use set_speed tool with values -2 (0.1 MHz) through 4 (ludicrous). 0 = normal 1 MHz Apple II speed
- Machine type: Use set_machine_type with "APPLE2P" (Apple II+), "APPLE2EU" (IIe unenhanced), or "APPLE2EE" (IIe enhanced)
- Color mode: Use set_color_mode with "COLOR", "NOFRINGE", "GREEN", "AMBER", "BLACKANDWHITE", or "INVERSEBLACKANDWHITE"
- Sound: Use set_sound with true/false to enable/disable emulator audio

MEMORY ACCESS (for low-level debugging):
- For specific memory ranges, use read_memory tool with address and length
- Text screen memory: $0400-$07FF (but use read_resource for formatted text)

BASIC PROGRAMMING: When a user asks to write or run Applesoft BASIC programs, do ALL steps together:
1. Call 'boot' tool (it waits for boot to complete automatically)
2. Call 'reset' tool to get to the BASIC prompt ("]")
3. Call 'send_keypress' to type the BASIC program and run it
Example: For "write a program that prints HELLO in a loop", call all three tools:
  - boot
  - reset  
  - send_keypress with key: (a string with actual newline characters between each line, like this)
    "10 PRINT "HELLO"\n20 GOTO 10\nRUN\n"
CRITICAL: Use actual newline characters (\n as a single character, not backslash-n as two characters). The send_keypress tool accepts strings with newlines and will type each line correctly.
IMPORTANT: Call all three tools in the same response - don't wait between steps.

SEND_KEYPRESS KEY FORMAT:
- For printable text: send as strings (e.g., "HELLO", "CATALOG")
- For control characters and special keys: ALWAYS send as numeric ASCII codes (NOT as strings, NOT as HTML entities, NOT as Unicode escapes)
  
SPECIAL KEY CODES (send as numbers, not strings):
- Ctrl+A through Ctrl+Z: 1-26 (e.g., Ctrl+G = 7, Ctrl+C = 3)
- Left Arrow: 8
- Down Arrow: 10
- Up Arrow: 11
- Enter/Return: 13
- Right Arrow: 21
- Escape: 27
- Space: 32

CRITICAL: For Ctrl+G, send_keypress with key: 7 (the number, not "&#7;" or "\u0007" or any escaped form)
Example: To send Ctrl+G bell character, call send_keypress with key: 7
Example: To move right in Karateka, call send_keypress with key: 21

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

IMPORTANT: When a user asks to play a game like "Choplifter", check the disk catalog to see which collection contains it. Load that collection disk using load_bundled_disk (this tool waits for the disk to boot), then use send_keypress to type the first 3-4 characters of the game name (e.g., "Chop") followed by a newline character. The collection menu will auto-complete and launch the game. You can call both tools in the same response.

CRITICAL RULE: When a user asks you to DO something (press keys, read memory, boot, reset, etc.), you MUST call the appropriate tool(s). NEVER just describe what you would do - actually do it by calling tools. 

Example - WRONG response:
User: "send 'Q'"
❌ Assistant: "I'll call send_keypress with key 'Q'"

Example - CORRECT response:
User: "send 'Q'"  
✓ Assistant: [calls send_keypress tool with {"key": "Q"}] "Sent 'Q' key press"

When users ask questions or request actions:
1. If it's an action request, call the tools IMMEDIATELY - do not just describe what you would do
2. Use the appropriate MCP tools to accomplish tasks
3. Explain what you're doing in clear, friendly language
4. Show relevant output (memory dumps, registers, screen content)
5. Help debug issues by inspecting state

RESPONSE FORMATTING: Use markdown to structure your responses:
- Use ## headings for major sections (e.g., "## What I Found", "## Current State", "## Available Games")
- Use ### for subsections if needed
- Use **bold** for emphasis and important values
- Use \`code\` for memory addresses, register values, and technical terms
- Use *italic* for notes or less important details

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
