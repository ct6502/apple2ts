/**
 * Main AI Agent Orchestrator
 * Coordinates between the AI provider, MCP tools, and conversation history
 */

import type { AIProvider, AIResponse } from "./mcp_agent_provider"
import { AnthropicProvider } from "./mcp_agent_anthropic"
import { ConversationHistory, type ConversationMessage } from "./mcp_agent_conversation"
import { loadAgentConfig, type ProviderType } from "./mcp_agent_config"
import { listMCPTools } from "./mcp_tools"
import { executeMCPTool } from "./mcp_tool_execute"
import type { MCPToolCall, MCPToolResult } from "./mcp_server"

export class MCPAgent {
  private provider: AIProvider | null = null
  private conversation: ConversationHistory
  private maxToolIterations = 5 // Prevent infinite tool loops
  
  constructor() {
    this.conversation = new ConversationHistory()
  }
  
  /**
   * Initialize the agent with saved configuration
   */
  initialize(): boolean {
    const config = loadAgentConfig()
    if (!config) {
      return false
    }
    
    this.provider = this.createProvider(config.provider, config.apiKey, config.model)
    return this.provider !== null
  }
  
  /**
   * Configure the agent with a new provider and API key
   */
  configure(provider: ProviderType, apiKey: string, model?: string): void {
    this.provider = this.createProvider(provider, apiKey, model)
  }
  
  /**
   * Check if agent is ready to use
   */
  isReady(): boolean {
    return this.provider !== null
  }
  
  /**
   * Send a user message and get a response (with automatic tool execution)
   */
  async sendMessage(userMessage: string): Promise<ConversationMessage> {
    if (!this.provider) {
      throw new Error("Agent not configured. Please set up your API key first.")
    }
    
    // Add user message to conversation
    this.conversation.addMessage({
      role: "user",
      content: userMessage,
    })
    
    // Get available tools
    const tools = listMCPTools()
    
    // Iterate until we get a final response (handle tool calls)
    let iterations = 0
    let finalResponse: AIResponse | null = null
    
    while (iterations < this.maxToolIterations) {
      iterations++
      
      // Get AI response
      const response = await this.provider.sendMessage(
        this.conversation.getMessagesForAI(),
        tools
      )
      
      // If no tool calls, we're done
      if (!response.toolCalls || response.toolCalls.length === 0) {
        finalResponse = response
        break
      }
      
      // Execute all tool calls
      const toolResults: Array<{ id: string; result: MCPToolResult }> = []
      
      for (const toolCall of response.toolCalls) {
        const mcpToolCall: MCPToolCall = {
          tool: toolCall.name as any,
          arguments: toolCall.input,
        }
        
        const result = executeMCPTool(mcpToolCall)
        toolResults.push({ id: toolCall.id, result })
      }
      
      // Add assistant message with tool calls
      this.conversation.addMessage({
        role: "assistant",
        content: response.content || "(Tool calls executed)",
        toolCalls: response.toolCalls.map((tc, idx) => ({
          id: tc.id,
          name: tc.name,
          input: tc.input,
          result: toolResults[idx].result,
        })),
      })
      
      // If the response has content and tools succeeded, we might be done
      if (response.content && response.content.trim().length > 0) {
        finalResponse = response
        break
      }
      
      // Otherwise, let the AI continue with tool results
      // The tool results are already in the conversation history
    }
    
    // If we exhausted iterations without a final response, create one
    if (!finalResponse) {
      finalResponse = {
        content: "I've completed the requested tool operations.",
        stopReason: "end_turn",
      }
    }
    
    // Add final assistant message if needed
    const messages = this.conversation.getMessages()
    const lastMessage = messages[messages.length - 1]
    
    if (lastMessage.role !== "assistant" || lastMessage.toolCalls) {
      return this.conversation.addMessage({
        role: "assistant",
        content: finalResponse.content,
      })
    }
    
    return lastMessage
  }
  
  /**
   * Stream a response (with automatic tool execution)
   */
  async streamMessage(
    userMessage: string,
    onChunk: (content: string) => void,
    onComplete: (message: ConversationMessage) => void
  ): Promise<void> {
    if (!this.provider || !this.provider.streamMessage) {
      throw new Error("Streaming not supported by current provider")
    }
    
    // Add user message to conversation
    this.conversation.addMessage({
      role: "user",
      content: userMessage,
    })
    
    // Get available tools
    const tools = listMCPTools()
    
    let accumulatedContent = ""
    const toolCalls: Array<{ id: string; name: string; input: Record<string, unknown> }> = []
    
    await this.provider.streamMessage(
      this.conversation.getMessagesForAI(),
      tools,
      (chunk) => {
        if (chunk.type === "content" && chunk.content) {
          accumulatedContent += chunk.content
          onChunk(chunk.content)
        } else if (chunk.type === "tool_use" && chunk.toolCall) {
          toolCalls.push(chunk.toolCall)
        }
      }
    )
    
    // Add assistant message
    const message = this.conversation.addMessage({
      role: "assistant",
      content: accumulatedContent,
      toolCalls: toolCalls.length > 0 ? toolCalls.map(tc => ({
        id: tc.id,
        name: tc.name,
        input: tc.input,
      })) : undefined,
    })
    
    onComplete(message)
  }
  
  /**
   * Get conversation history
   */
  getConversation(): ConversationHistory {
    return this.conversation
  }
  
  /**
   * Clear conversation history
   */
  clearConversation(): void {
    this.conversation.clear()
  }
  
  /**
   * Create a provider instance
   */
  private createProvider(type: ProviderType, apiKey: string, model?: string): AIProvider | null {
    switch (type) {
      case "anthropic":
        return new AnthropicProvider(apiKey, model)
      // Future providers:
      // case "openai":
      //   return new OpenAIProvider(apiKey, model)
      // case "google":
      //   return new GoogleProvider(apiKey, model)
      default:
        console.error(`Unknown provider type: ${type}`)
        return null
    }
  }
}

// Singleton instance
let agentInstance: MCPAgent | null = null

/**
 * Get or create the global agent instance
 */
export function getAgent(): MCPAgent {
  if (!agentInstance) {
    agentInstance = new MCPAgent()
    agentInstance.initialize() // Try to load saved config
  }
  return agentInstance
}
