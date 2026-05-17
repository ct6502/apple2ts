import "../panels.css"
import "./agent.css"
import { isMinimalTheme } from "../../ui_settings"
import { useState, useRef, useEffect } from "react"
import { getAgent } from "../../mcp/mcp_agent"
import type { ConversationMessage } from "../../mcp/mcp_agent_conversation"
import { 
  loadAgentConfig, 
  saveAgentConfig, 
  isAgentConfigured,
  getProviderDisplayName,
  validateApiKeyFormat,
  getDefaultModel,
  getSupportedModels,
  type ProviderType 
} from "../../mcp/mcp_agent_config"

const AgentTab = (props: { updateDisplay: UpdateDisplay }) => {

  if (isMinimalTheme()) {
    import("../panels.minimal.css")
    // DELETE SOON!!!
    console.log(props)
  }

  const [isConfigured, setIsConfigured] = useState(isAgentConfigured())
  const [showConfig, setShowConfig] = useState(!isConfigured)
  const [messages, setMessages] = useState<ConversationMessage[]>([])
  const [inputValue, setInputValue] = useState("")
  const [isProcessing, setIsProcessing] = useState(false)
  const [streamingContent, setStreamingContent] = useState("")
  
  // Config form state
  const [provider, setProvider] = useState<ProviderType>("anthropic")
  const [apiKey, setApiKey] = useState("")
  const [model, setModel] = useState(getDefaultModel("anthropic"))
  const [availableModels, setAvailableModels] = useState(getSupportedModels("anthropic"))
  
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLTextAreaElement>(null)
  const agent = getAgent()

  // Initialize config state from localStorage on mount
  useEffect(() => {
    const config = loadAgentConfig()
    if (config) {
      setProvider(config.provider)
      setModel(config.model || getDefaultModel(config.provider))
      setAvailableModels(getSupportedModels(config.provider))
    }
  }, [])

  // Load existing conversation on mount
  useEffect(() => {
    if (isConfigured) {
      const conversation = agent.getConversation()
      setMessages(conversation.getMessages())
    }
  }, [isConfigured, agent])
  
  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages, streamingContent])
  
  const handleConfigSave = () => {
    if (!validateApiKeyFormat(provider, apiKey)) {
      alert(`Invalid API key format for ${getProviderDisplayName(provider)}`)
      return
    }
    
    const config = { provider, apiKey, model }
    saveAgentConfig(config)
    agent.configure(provider, apiKey, model)
    
    setIsConfigured(true)
    setShowConfig(false)
    setApiKey("") // Clear from memory
  }
  
  const handleConfigChange = () => {
    setShowConfig(true)
    const config = loadAgentConfig()
    if (config) {
      setProvider(config.provider)
      setModel(config.model || getDefaultModel(config.provider))
      setAvailableModels(getSupportedModels(config.provider))
      // Don't pre-fill API key for security
    }
  }
  
  const handleProviderChange = (newProvider: ProviderType) => {
    setProvider(newProvider)
    setAvailableModels(getSupportedModels(newProvider))
    setModel(getDefaultModel(newProvider))
  }
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!inputValue.trim() || isProcessing || !isConfigured) return

    const userInput = inputValue
    setInputValue("")
    setIsProcessing(true)
    setStreamingContent("")

    try {
      // Update messages immediately with user input
      const conversation = agent.getConversation()
      setMessages([...conversation.getMessages()])
      
      // Send message to AI agent
      await agent.sendMessage(userInput)
      
      // Update with final response
      setMessages([...agent.getConversation().getMessages()])
      
    } catch (error) {
      console.error("Agent error:", error)
      
      // Add error message to conversation
      const conversation = agent.getConversation()
      conversation.addMessage({
        role: "assistant",
        content: `Error: ${error instanceof Error ? error.message : String(error)}`,
      })
      setMessages([...conversation.getMessages()])
      
    } finally {
      setIsProcessing(false)
      setStreamingContent("")
      inputRef.current?.focus()
    }
  }
  
  const handleClearConversation = () => {
    if (confirm("Clear all conversation history?")) {
      agent.clearConversation()
      setMessages([])
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
      {/* Configuration Panel */}
      {showConfig && (
        <div className="agent-config-panel">
          <h3>Configure AI Agent</h3>
          <div className="agent-config-form">
            <label>
              Provider:
              <select 
                value={provider} 
                onChange={(e) => handleProviderChange(e.target.value as ProviderType)}
              >
                <option value="anthropic">Anthropic Claude</option>
                <option value="openai" disabled>OpenAI GPT (Coming soon)</option>
                <option value="google" disabled>Google Gemini (Coming soon)</option>
              </select>
            </label>
            
            <label>
              Model:
              <select 
                value={model} 
                onChange={(e) => setModel(e.target.value)}
              >
                {availableModels.map((m) => (
                  <option key={m.value} value={m.value}>
                    {m.label}
                  </option>
                ))}
              </select>
            </label>
            
            <label>
              API Key:
              <input
                type="password"
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                placeholder="sk-ant-..."
                className="agent-api-key-input"
              />
            </label>
            
            <div className="agent-config-buttons">
              <button onClick={handleConfigSave} disabled={!apiKey}>
                Save Configuration
              </button>
              {isConfigured && (
                <button onClick={() => setShowConfig(false)}>
                  Cancel
                </button>
              )}
            </div>
            
            <div className="agent-config-info">
              <small>
                Your API key is stored locally in your browser and never sent to apple2ts.com.
                Get your Anthropic API key at <a href="https://console.anthropic.com/" target="_blank" rel="noopener noreferrer">console.anthropic.com</a>
              </small>
            </div>
          </div>
        </div>
      )}
      
      {/* Chat Header */}
      {isConfigured && !showConfig && (
        <div className="agent-header">
          <span className="agent-status">
            🤖 AI Agent Ready ({getProviderDisplayName(provider)})
          </span>
          <div className="agent-header-buttons">
            <button onClick={handleClearConversation} title="Clear conversation">
              Clear
            </button>
            <button onClick={handleConfigChange} title="Change configuration">
              Settings
            </button>
          </div>
        </div>
      )}
      
      {/* Chat messages area */}
      {isConfigured && !showConfig && (
        <div className="agent-messages">
          {messages.length === 0 && (
            <div>
              <p>👋 Welcome! I&apos;m your Apple II assistant.</p>
              <p>I can help you with:</p>
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
                <span>{msg.role === "user" ? "You" : "Assistant"}</span>
                <span>{msg.timestamp.toLocaleTimeString()}</span>
              </div>
              <div className="agent-message-content">
                {msg.content}
              </div>
              {msg.toolCalls && msg.toolCalls.length > 0 && (
                <div className="agent-tool-calls">
                  {msg.toolCalls.map((tc, idx) => (
                    <div key={idx} className="agent-tool-call">
                      <div className="agent-tool-name">🔧 {tc.name}</div>
                      {tc.result && (
                        <div className={`agent-tool-result ${tc.result.success ? "success" : "error"}`}>
                          {tc.result.success ? "✓" : "✗"} {tc.result.success ? "Success" : tc.result.error}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
          
          {/* Streaming content */}
          {streamingContent && (
            <div className="agent-message agent-message-assistant agent-streaming">
              <div className="agent-message-header">
                <span>Assistant</span>
                <span>typing...</span>
              </div>
              <div className="agent-message-content">
                {streamingContent}
              </div>
            </div>
          )}
          
          <div ref={messagesEndRef} />
        </div>
      )}

      {/* Input area */}
      {isConfigured && !showConfig && (
        <form onSubmit={handleSubmit} className="agent-form">
          <textarea
            ref={inputRef}
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask me anything about the Apple II emulator... (Press Enter to send, Shift+Enter for new line)"
            disabled={isProcessing}
            spellCheck={true}
            className="agent-input"
          />
          <div className="agent-controls">
            <button
              type="submit"
              disabled={!inputValue.trim() || isProcessing}
              className="agent-submit"
            >
              {isProcessing ? "Thinking..." : "Send"}
            </button>
          </div>
        </form>
      )}
      
      {/* Initial setup prompt */}
      {!isConfigured && !showConfig && (
        <div className="agent-setup-prompt">
          <h3>🤖 AI Agent Setup</h3>
          <p>Configure your AI assistant to interact with the Apple II emulator using natural language.</p>
          <button onClick={() => setShowConfig(true)}>
            Get Started
          </button>
        </div>
      )}
    </div>
  )
}

export default AgentTab
