import "../panels.css"
import "./agent.css"
import { isMinimalTheme } from "../../ui_settings"
import { useState, useRef, useEffect } from "react"
import { getAgent } from "../../mcp/mcp_agent"
import type { ConversationMessage } from "../../mcp/mcp_agent_conversation"
import { 
  isAgentConfigured} from "../../mcp/mcp_agent_config"
import AgentTabConfig from "./agent_tab_config"
import { formatMarkdown } from "./agent_formatmarkdown"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { faPlay, faStop } from "@fortawesome/free-solid-svg-icons"
import { passRequestMemoryDump } from "../../main2worker"


const AgentTab = () => {

  if (isMinimalTheme()) {
    import("../panels.minimal.css")
  }

  const [messages, setMessages] = useState<ConversationMessage[]>([])
  const [inputValue, setInputValue] = useState("")
  const [isProcessing, setIsProcessing] = useState(false)
  const [streamingMessage, setStreamingMessage] = useState<ConversationMessage | null>(null)
  const [streamingStatus, setStreamingStatus] = useState("")
  const [tokenUsage, setTokenUsage] = useState<{ inputTokens: number; outputTokens: number } | null>(null)

  const messagesContainerRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLTextAreaElement>(null)
  const abortControllerRef = useRef<AbortController | null>(null)
  const agent = getAgent()



  // Load existing conversation on mount
  useEffect(() => {
    if (isAgentConfigured()) {
      const conversation = agent.getConversation()
      setMessages(conversation.getMessagesForDisplay())
    }
  }, [agent])
  
  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (messagesContainerRef.current) {
      messagesContainerRef.current.scrollTop = messagesContainerRef.current.scrollHeight
    }
  }, [messages, streamingMessage, streamingStatus])

  // Auto-focus input when tab becomes visible and agent is configured
  useEffect(() => {
    if (isAgentConfigured()) {
      // Small delay to ensure the textarea is rendered
      setTimeout(() => {
        inputRef.current?.focus()
      }, 100)
    }
  }, [])
  
  // Re-focus input when configuration changes
  useEffect(() => {
    if (isAgentConfigured() && !isProcessing) {
      inputRef.current?.focus()
    }
  }, [isProcessing])

  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!inputValue.trim() || isProcessing || !isAgentConfigured()) return

    const userInput = inputValue
    setInputValue("")
    setIsProcessing(true)
    setStreamingStatus("Processing...")
    setStreamingMessage(null)
    setTokenUsage(null)
    // Request latest memory dump for agent context. This is critical to do before
    // sending the message to ensure the agent has the most up-to-date information,
    // especially if emulator is running, as the regular memory dump will be empty.
    // This is also a race against time, as it assumes that the worker will
    // respond before the AI can fire a tool call that needs memory access.
    passRequestMemoryDump()

    // Create abort controller for this request
    abortControllerRef.current = new AbortController()

    try {
      // Add user message to conversation and update UI immediately
      const conversation = agent.getConversation()
      conversation.addMessage({
        role: "user",
        content: userInput.trim(),
      })
      setMessages([...conversation.getMessagesForDisplay()])
      
      // Send message to AI agent with progress updates
      await agent.sendMessage(userInput, (status, usage, streamingText, streamingToolCalls) => {
        // Check if aborted
        if (abortControllerRef.current?.signal.aborted) {
          throw new Error("Request cancelled by user")
        }
        
        setStreamingStatus(status)
        if (streamingText !== undefined || streamingToolCalls !== undefined) {
          // Update streaming message with new content and/or tool calls
          setStreamingMessage(prev => ({
            id: prev?.id || "streaming",
            role: "assistant" as const,
            content: streamingText || prev?.content || "",
            timestamp: prev?.timestamp || new Date(),
            toolCalls: streamingToolCalls || prev?.toolCalls || [],
          }))
        }
        if (usage) {
          setTokenUsage(usage)
        }
      })
      
      // Update with final response
      setMessages([...agent.getConversation().getMessagesForDisplay()])
      
    } catch (error) {
      console.error("Agent error:", error)
      
      // Don't add error message if it was a user cancellation
      if (error instanceof Error && error.message === "Request cancelled by user") {
        console.log("Request was cancelled by user")
      } else {
        // Add error message to conversation
        const conversation = agent.getConversation()
        conversation.addMessage({
          role: "assistant",
          content: error instanceof Error ? error.message : String(error),
        })
        setMessages([...conversation.getMessagesForDisplay()])
      }
      
    } finally {
      setIsProcessing(false)
      setStreamingStatus("")
      setStreamingMessage(null)
      abortControllerRef.current = null
      inputRef.current?.focus()
    }
  }

  const handleStop = () => {
    if (abortControllerRef.current) {
      console.log("Cancelling agent request...")
      abortControllerRef.current.abort()
      setStreamingStatus("Cancelled")
      setStreamingMessage(null)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSubmit(e)
    }
  }

  return (
    <div className="flex-column-gap debug-section agent-container">

      {isAgentConfigured() && (
        <div className="agent-messages" ref={messagesContainerRef}>
          {messages.length === 0 && (
            <div>
              <p>Welcome to the Apple II assistant! I can help you with:</p>
              <ul>
                <li>Inspecting CPU registers and memory</li>
                <li>Controlling execution (boot, reset, step, breakpoints)</li>
                <li>Loading programs and managing disks</li>
                <li>Debugging 6502 assembly code</li>
                <li>Reading screen content and system state</li>
              </ul>
              <p>Just ask me anything!</p>
            </div>
          )}
          
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`agent-message agent-message-${msg.role}`}
            >
              <div className="agent-message-header">
                <span>{msg.role === "user" ? "You" : "🤖 Assistant"}</span>
                <span>
                  {msg.timestamp.toLocaleTimeString()}
                  {msg.usage && (
                    <span style={{ marginLeft: "8px", opacity: 0.6, fontSize: "0.9em" }}>
                      • {msg.usage.inputTokens.toLocaleString()} in / {msg.usage.outputTokens.toLocaleString()} out
                    </span>
                  )}
                </span>
              </div>
              {msg.toolCalls && msg.toolCalls.length > 0 && (
                <div className="agent-tool-calls">
                  {msg.toolCalls.map((tc, idx) => (
                    <div key={idx} className="agent-tool-call">
                      <span className="agent-tool-name">🔧 {tc.name}</span>
                      {tc.result && (
                        <span className={`agent-tool-status ${tc.result.success ? "success" : "error"}`}>
                          {tc.result.success ? "✓" : "✗"}
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              )}
              {msg.content && (
                <div className="agent-message-content">
                  {formatMarkdown(msg.content)}
                </div>
              )}
            </div>
          ))}
          
          {/* Streaming message */}
          {streamingMessage && (
            <div className="agent-message agent-message-assistant agent-streaming">
              <div className="agent-message-header">
                <span>🤖 Assistant</span>
                <span>
                  {streamingStatus && `⚙️ ${streamingStatus}`}
                  {tokenUsage && (
                    <span style={{ marginLeft: "10px", opacity: 0.7 }}>
                      • {tokenUsage.inputTokens.toLocaleString()} in / {tokenUsage.outputTokens.toLocaleString()} out
                    </span>
                  )}
                </span>
              </div>
              {streamingMessage.toolCalls && streamingMessage.toolCalls.length > 0 && (
                <div className="agent-tool-calls">
                  {streamingMessage.toolCalls.map((tc, idx) => (
                    <div key={idx} className="agent-tool-call">
                      <span className="agent-tool-name">🔧 {tc.name}</span>
                      {tc.result && (
                        <span className={`agent-tool-status ${tc.result.success ? "success" : "error"}`}>
                          {tc.result.success ? "✓" : "✗"}
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              )}
              {streamingMessage.content && (
                <div className="agent-message-content">
                  {formatMarkdown(streamingMessage.content)}
                </div>
              )}
            </div>
          )}
          
          {/* Status only (when no message yet) */}
          {streamingStatus && !streamingMessage && (
            <div className="agent-message agent-message-assistant agent-streaming">
              <div className="agent-message-header">
                <span>🤖 Assistant</span>
                <span>⚙️ {streamingStatus}</span>
              </div>
            </div>
          )}
          
        </div>
      )}

      {/* Input area */}
      {isAgentConfigured() && (
        <div>
        <form onSubmit={handleSubmit} className="agent-form">
          <textarea
            className="agent-input"
            ref={inputRef}
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask me anything about the Apple II emulator... (Press Enter to send, Shift+Enter for new line)"
            disabled={isProcessing}
            spellCheck={true}
          />
          <div className="agent-controls">
            <button
              type={isProcessing ? "button" : "submit"}
              onClick={isProcessing ? handleStop : undefined}
              disabled={!isProcessing && !inputValue.trim()}
              className="agent-submit"
              title={isProcessing ? "Stop" : "Send"}
            >
              <FontAwesomeIcon icon={isProcessing ? faStop : faPlay} />
            </button>
          </div>
        </form>
        </div>
      )}
      
      {/* Initial setup prompt */}
      {/* {!isAgentConfigured() && (
        <div className="agent-setup-prompt">
          <h3>🤖 AI Agent Setup</h3>
          <p>Configure your AI assistant to interact with the Apple II emulator using natural language.</p>
        </div>
      )} */}

      <AgentTabConfig/>
    </div>
  )
}

export default AgentTab
