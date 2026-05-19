/**
 * Main AI Agent Orchestrator
 * Coordinates between the AI provider, MCP tools, and conversation history
 */

import type { AIProvider, AIResponse } from "./mcp_agent_provider"
import { AnthropicProvider } from "./mcp_agent_anthropic"
import { DeepSeekProvider } from "./mcp_agent_deepseek"
import { ConversationHistory, type ConversationMessage } from "./mcp_agent_conversation"
import { loadAgentConfig, type ProviderType } from "./mcp_agent_config"
import { listMCPTools } from "./mcp_tools"
import { executeMCPTool } from "./mcp_tool_execute"
import type { MCPToolCall, MCPToolName, MCPToolResult } from "./mcp_server"
import { trySimpleCommand, formatSimpleCommandResult } from "./mcp_simple_commands"

export class MCPAgent {
  private provider: AIProvider | null = null
  private conversation: ConversationHistory
  private maxToolIterations = 8 // Prevent infinite tool loops (increased to allow more complex tasks)
  
  constructor() {
    this.conversation = new ConversationHistory()
  }
  
  /**
   * Initialize the agent with saved configuration
   */
  initialize(): boolean {
    const config = loadAgentConfig()
    if (!config) {
      console.log("[MCPAgent] No saved config found")
      return false
    }
    
    console.log(`[MCPAgent] Initializing with provider: ${config.provider}, model: ${config.model}`)
    this.provider = this.createProvider(config.provider, config.apiKey, config.model)
    
    if (this.provider) {
      console.log(`[MCPAgent] Provider initialized: ${this.provider.name}`)
    } else {
      console.error(`[MCPAgent] Failed to create provider for: ${config.provider}`)
    }
    
    return this.provider !== null
  }
  
  /**
   * Configure the agent with a new provider and API key
   */
  configure(provider: ProviderType, apiKey: string, model?: string): void {
    console.log(`[MCPAgent] Configuring with provider: ${provider}, model: ${model}`)
    this.provider = this.createProvider(provider, apiKey, model)
    
    if (this.provider) {
      console.log(`[MCPAgent] Provider configured: ${this.provider.name}`)
    } else {
      console.error(`[MCPAgent] Failed to create provider for: ${provider}`)
    }
  }
  
  /**
   * Check if agent is ready to use
   */
  isReady(): boolean {
    return this.provider !== null
  }
  
  /**
   * Get current provider info (for debugging/display)
   */
  getProviderInfo(): { name: string; ready: boolean } | null {
    if (!this.provider) {
      return null
    }
    return {
      name: this.provider.name,
      ready: true,
    }
  }
  
  /**
   * Send a user message and get a response (with automatic tool execution)
   */
  async sendMessage(
    userMessage: string,
    onProgress?: (status: string, usage?: { inputTokens: number; outputTokens: number }) => void
  ): Promise<ConversationMessage> {
    if (!this.provider) {
      throw new Error("Agent not configured. Please set up your API key first.")
    }
    
    // Track cumulative token usage across all API calls
    let totalInputTokens = 0
    let totalOutputTokens = 0
    
    // Add user message to conversation (skip if already added by UI)
    const messages = this.conversation.getMessages()
    const lastMessage = messages[messages.length - 1]
    const trimmedInput = userMessage.trim()
    
    if (!lastMessage || lastMessage.role !== "user" || lastMessage.content !== trimmedInput) {
      this.conversation.addMessage({
        role: "user",
        content: trimmedInput,
      })
    }
    
    // Try to execute as a simple command first (saves API calls)
    onProgress?.("Checking for simple commands...")
    const simpleResult = await trySimpleCommand(userMessage)
    if (simpleResult !== null) {
      const responseText = formatSimpleCommandResult(
        simpleResult.toolName as MCPToolName,
        simpleResult.result
      )
      
      return this.conversation.addMessage({
        role: "assistant",
        content: responseText,
      })
    }
    
    // Get available tools
    const tools = listMCPTools()
    
    // Iterate until we get a final response (handle tool calls)
    let iterations = 0
    let finalResponse: AIResponse | null = null
    
    while (iterations < this.maxToolIterations) {
      iterations++
      
      // Get AI response
      onProgress?.("Consulting AI...", { inputTokens: totalInputTokens, outputTokens: totalOutputTokens })
      const response = await this.provider.sendMessage(
        this.conversation.getMessagesForAI(),
        tools
      )
      
      // Update token counts
      if (response.usage) {
        totalInputTokens += response.usage.inputTokens
        totalOutputTokens += response.usage.outputTokens
      }
      
      // If no tool calls, we're done
      if (!response.toolCalls || response.toolCalls.length === 0) {
        onProgress?.("Response complete", { inputTokens: totalInputTokens, outputTokens: totalOutputTokens })
        finalResponse = response
        break
      }
      
      // Execute all tool calls
      onProgress?.(`Executing ${response.toolCalls.length} tool${response.toolCalls.length > 1 ? "s" : ""}...`, { inputTokens: totalInputTokens, outputTokens: totalOutputTokens })
      const toolResults: Array<{ id: string; result: MCPToolResult }> = []
      
      for (const toolCall of response.toolCalls) {
        onProgress?.(`Running ${toolCall.name}...`, { inputTokens: totalInputTokens, outputTokens: totalOutputTokens })
        const mcpToolCall: MCPToolCall = {
          tool: toolCall.name as MCPToolName,
          arguments: toolCall.input,
        }
        
        const result = await executeMCPTool(mcpToolCall)
        toolResults.push({ id: toolCall.id, result })
      }
      
      // Add assistant message with tool calls
      this.conversation.addMessage({
        role: "assistant",
        content: response.content || "",
        toolCalls: response.toolCalls.map((tc, idx) => ({
          id: tc.id,
          name: tc.name,
          input: tc.input,
          result: toolResults[idx].result,
        })),
        usage: response.usage ? {
          inputTokens: response.usage.inputTokens,
          outputTokens: response.usage.outputTokens,
        } : undefined,
      })
      
      // Add user message with tool results (required by Anthropic API)
      let toolResultsText = "Tool results:\n"
      for (let i = 0; i < response.toolCalls.length; i++) {
        const tc = response.toolCalls[i]
        const result = toolResults[i].result
        toolResultsText += `\n[${tc.name}]\n`
        if (result.success) {
          const resultData = typeof result.data === "string"
            ? result.data
            : JSON.stringify(result.data, null, 2)
          toolResultsText += resultData
        } else {
          toolResultsText += `Error: ${result.error || "Unknown error"}`
        }
        toolResultsText += "\n"
      }
      
      this.conversation.addMessage({
        role: "user",
        content: toolResultsText.trimEnd(),
        isToolResult: true, // Mark as internal message for API, not shown to user
      })
      
      // Always continue the loop to let the AI interpret tool results
      // (even if it provided commentary alongside the tool calls)
    }
    
    // If we exhausted iterations without a final response, give AI one more chance
    // to interpret the results (without allowing more tool calls)
    if (!finalResponse) {
      onProgress?.("Generating final response...", { inputTokens: totalInputTokens, outputTokens: totalOutputTokens })
      const finalAttempt = await this.provider.sendMessage(
        this.conversation.getMessagesForAI(),
        [] // No tools available - force a text response
      )
      
      // Update token counts from final attempt
      if (finalAttempt.usage) {
        totalInputTokens += finalAttempt.usage.inputTokens
        totalOutputTokens += finalAttempt.usage.outputTokens
      }
      
      finalResponse = finalAttempt
    }
    
    // Add a final assistant message only if we need one (no content in previous messages)
    onProgress?.("Complete!", { inputTokens: totalInputTokens, outputTokens: totalOutputTokens })
    return this.conversation.addMessage({
      role: "assistant",
      content: finalResponse.content || "Task completed.",
      usage: {
        inputTokens: totalInputTokens,
        outputTokens: totalOutputTokens,
      },
    })
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
    console.log(`[MCPAgent] Creating provider: type=${type}, model=${model}`)
    
    switch (type) {
      case "anthropic":
        return new AnthropicProvider(apiKey, model)
      case "deepseek":
        return new DeepSeekProvider(apiKey, model)
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

/**
 * Reset the agent singleton (forces reinitialization on next getAgent call)
 */
export function resetAgent(): void {
  agentInstance = null
}
