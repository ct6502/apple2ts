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
import { faCog, faPlay, faStop } from "@fortawesome/free-solid-svg-icons"
import { passRequestMemoryDump } from "../../main2worker"


const AgentTab = () => {

  if (isMinimalTheme()) {
    import("../panels.minimal.css")
  }

  const [showConfig, setShowConfig] = useState(false)
  const [messages, setMessages] = useState<ConversationMessage[]>([])
  const [inputValue, setInputValue] = useState("")
  const [isProcessing, setIsProcessing] = useState(false)
  const [streamingMessage, setStreamingMessage] = useState<ConversationMessage | null>(null)
  const [streamingStatus, setStreamingStatus] = useState("")
  const [tokenUsage, setTokenUsage] = useState<{ inputTokens: number; outputTokens: number } | null>(null)
  const [promptHistory, setPromptHistory] = useState<string[]>([])
  const [historyIndex, setHistoryIndex] = useState<number>(-1)

  const messagesContainerRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLTextAreaElement>(null)
  const abortControllerRef = useRef<AbortController | null>(null)
  const agent = getAgent()

  // Load prompt history from localStorage
  const loadPromptHistory = (): string[] => {
    try {
      const saved = localStorage.getItem("agent_prompt_history")
      return saved ? JSON.parse(saved) : []
    } catch (error) {
      console.error("Failed to load prompt history:", error)
      return []
    }
  }

  // Save prompt history to localStorage
  const savePromptHistory = (history: string[]) => {
    try {
      localStorage.setItem("agent_prompt_history", JSON.stringify(history))
    } catch (error) {
      console.error("Failed to save prompt history:", error)
    }
  }

  // Add prompt to history (max 10, max 2000 chars each)
  const addToHistory = (prompt: string) => {
    const trimmed = prompt.trim()
    if (trimmed.length === 0 || trimmed.length > 2000) return
    
    // Don't add duplicate of the most recent prompt
    if (promptHistory.length > 0 && promptHistory[promptHistory.length - 1] === trimmed) return
    
    const newHistory = [...promptHistory, trimmed].slice(-10) // Keep last 10
    setPromptHistory(newHistory)
    savePromptHistory(newHistory)
    setHistoryIndex(-1) // Reset navigation
  }

  // Load existing conversation and prompt history on mount
  useEffect(() => {
    if (isAgentConfigured()) {
      const conversation = agent.getConversation()
      setMessages(conversation.getMessagesForDisplay())
    }
    setPromptHistory(loadPromptHistory())
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
    addToHistory(userInput) // Save to history
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
      setIsProcessing(false)
      setStreamingStatus("")
      setStreamingMessage(null)
      abortControllerRef.current = null
      inputRef.current?.focus()
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSubmit(e)
      return
    }
    
    // Navigate history with up/down arrows (when cursor at start/end)
    if (e.key === "ArrowUp" && promptHistory.length > 0) {
        e.preventDefault()
        const newIndex = historyIndex === -1 ? promptHistory.length - 1 : Math.max(0, historyIndex - 1)
        setHistoryIndex(newIndex)
        setInputValue(promptHistory[newIndex])
        // Set cursor to end after state updates
        setTimeout(() => {
          if (inputRef.current) {
            inputRef.current.selectionStart = inputRef.current.value.length
            inputRef.current.selectionEnd = inputRef.current.value.length
          }
        }, 0)
    } else if (e.key === "ArrowDown" && historyIndex !== -1) {
      e.preventDefault()
      const newIndex = historyIndex + 1
      if (newIndex >= promptHistory.length) {
        setHistoryIndex(-1)
        setInputValue("")
      } else {
        setHistoryIndex(newIndex)
        setInputValue(promptHistory[newIndex])
      }
    }
  }

  const handleConfigChange = () => {
    // Refresh messages after config change
    const conversation = agent.getConversation()
    setMessages(conversation.getMessagesForDisplay())
    
    // Clear any streaming state
    setStreamingMessage(null)
    setStreamingStatus("")
    setTokenUsage(null)
    
    // Focus input if configured
    if (isAgentConfigured()) {
      inputRef.current?.focus()
    }
  }

  const initialMessage = !isAgentConfigured() ? (
    <div className="agent-setup-prompt">
      <h3>🤖 AI Agent Setup</h3>
      <p>Click the gear icon below to configure your AI assistant.</p>
    </div>) :
      (messages.length === 0 && (
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
      ))

  return (
    <div className="flex-column-gap debug-section agent-container">
      <div className="agent-messages" ref={messagesContainerRef}>
        {initialMessage}
        
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

      {/* Input area */}
      <div>
      <form onSubmit={handleSubmit} className="agent-form">
        <textarea
          className="agent-input"
          ref={inputRef}
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Ask me anything about the Apple II emulator... (Press Enter to send, Shift+Enter for new line)"
          disabled={isProcessing || !isAgentConfigured()}
          spellCheck={true}
        />
      </form>
      </div>
      
      <div className="agent-controls">
            <button
              type={isProcessing ? "button" : "submit"}
              onClick={isProcessing ? handleStop : handleSubmit}
              disabled={!isProcessing && !inputValue.trim()}
              className="agent-submit"
              title={isProcessing ? "Stop" : "Send"}
            >
              <FontAwesomeIcon icon={isProcessing ? faStop : faPlay} />
            </button>
        <button onClick={() => setShowConfig(true)}
          className="agent-submit"
          title="Change configuration">
          <FontAwesomeIcon icon={faCog} />
        </button>
      </div>

      <AgentTabConfig 
        showConfig={showConfig} 
        setShowConfig={setShowConfig}
        onConfigChange={handleConfigChange}
      />
    </div>
  )
}

export default AgentTab
