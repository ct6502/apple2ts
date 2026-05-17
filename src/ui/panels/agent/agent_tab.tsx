import "../panels.css"
import "./agent.css"
import { isMinimalTheme } from "../../ui_settings"
import { useState, useRef, useEffect } from "react"
import { getAgent } from "../../mcp/mcp_agent"
import type { ConversationMessage } from "../../mcp/mcp_agent_conversation"
import { 
  isAgentConfigured} from "../../mcp/mcp_agent_config"
import AgentTabConfig from "./agent_tab_config"

/**
 * Simple markdown formatter for agent messages
 * Supports: **bold**, *italic*, `code`, line breaks
 */
function formatMarkdown(text: string): React.JSX.Element {
  const parts: React.JSX.Element[] = []
  let keyCounter = 0
  
  // Split by line breaks first
  const lines = text.split("\n")
  
  lines.forEach((line, lineIdx) => {
    // Check for headings at the start of a line
    const headingMatch = line.match(/^(#{1,6})\s+(.+)$/)
    if (headingMatch) {
      const level = headingMatch[1].length
      const content = headingMatch[2]
      
      // Create heading element based on level
      if (level === 1) {
        parts.push(<h1 key={`h1-${keyCounter++}`}>{content}</h1>)
      } else if (level === 2) {
        parts.push(<h2 key={`h2-${keyCounter++}`}>{content}</h2>)
      } else if (level === 3) {
        parts.push(<h3 key={`h3-${keyCounter++}`}>{content}</h3>)
      } else if (level === 4) {
        parts.push(<h4 key={`h4-${keyCounter++}`}>{content}</h4>)
      } else if (level === 5) {
        parts.push(<h5 key={`h5-${keyCounter++}`}>{content}</h5>)
      } else {
        parts.push(<h6 key={`h6-${keyCounter++}`}>{content}</h6>)
      }
      
      // Add line break after heading unless it's the last line
      if (lineIdx < lines.length - 1) {
        parts.push(<br key={`br-${keyCounter++}`} />)
      }
      return
    }
    
    let remaining = line
    let lineKey = 0
    
    while (remaining.length > 0) {
      // Match [text](url) links
      const linkMatch = remaining.match(/^\[([^\]]+)\]\(([^)]+)\)/)
      if (linkMatch) {
        parts.push(
          <a 
            key={`${keyCounter++}-${lineKey++}`} 
            href={linkMatch[2]} 
            target="_blank" 
            rel="noopener noreferrer"
          >
            {linkMatch[1]}
          </a>
        )
        remaining = remaining.slice(linkMatch[0].length)
        continue
      }
      
      // Match plain URLs (http:// or https://)
      const urlMatch = remaining.match(/^(https?:\/\/[^\s<>"{}|\\^`[\]]+)/)
      if (urlMatch) {
        parts.push(
          <a 
            key={`${keyCounter++}-${lineKey++}`} 
            href={urlMatch[1]} 
            target="_blank" 
            rel="noopener noreferrer"
          >
            {urlMatch[1]}
          </a>
        )
        remaining = remaining.slice(urlMatch[0].length)
        continue
      }
      
      // Match **bold**
      const boldMatch = remaining.match(/^\*\*(.+?)\*\*/)
      if (boldMatch) {
        parts.push(<strong key={`${keyCounter++}-${lineKey++}`}>{boldMatch[1]}</strong>)
        remaining = remaining.slice(boldMatch[0].length)
        continue
      }
      
      // Match *italic*
      const italicMatch = remaining.match(/^\*(.+?)\*/)
      if (italicMatch) {
        parts.push(<em key={`${keyCounter++}-${lineKey++}`}>{italicMatch[1]}</em>)
        remaining = remaining.slice(italicMatch[0].length)
        continue
      }
      
      // Match `code`
      const codeMatch = remaining.match(/^`(.+?)`/)
      if (codeMatch) {
        parts.push(<code key={`${keyCounter++}-${lineKey++}`}>{codeMatch[1]}</code>)
        remaining = remaining.slice(codeMatch[0].length)
        continue
      }
      
      // Match plain text until next special character
      const plainMatch = remaining.match(/^([^*`[h]+)/)
      if (plainMatch) {
        parts.push(<span key={`${keyCounter++}-${lineKey++}`}>{plainMatch[1]}</span>)
        remaining = remaining.slice(plainMatch[0].length)
        continue
      }
      
      // Single character (unmatched special char)
      parts.push(<span key={`${keyCounter++}-${lineKey++}`}>{remaining[0]}</span>)
      remaining = remaining.slice(1)
    }
    
    // Add line break after each line except the last
    if (lineIdx < lines.length - 1) {
      parts.push(<br key={`br-${keyCounter++}`} />)
    }
  })
  
  return <>{parts}</>
}

const AgentTab = (props: { updateDisplay: UpdateDisplay }) => {

  if (isMinimalTheme()) {
    import("../panels.minimal.css")
    // DELETE SOON!!!
    console.log(props)
  }

  const [messages, setMessages] = useState<ConversationMessage[]>([])
  const [inputValue, setInputValue] = useState("")
  const [isProcessing, setIsProcessing] = useState(false)
  const [streamingContent, setStreamingContent] = useState("")

  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLTextAreaElement>(null)
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
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages, streamingContent])

  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!inputValue.trim() || isProcessing || !isAgentConfigured()) return

    const userInput = inputValue
    setInputValue("")
    setIsProcessing(true)
    setStreamingContent("Processing...")

    try {
      // Add user message to conversation and update UI immediately
      const conversation = agent.getConversation()
      conversation.addMessage({
        role: "user",
        content: userInput.trim(),
      })
      setMessages([...conversation.getMessagesForDisplay()])
      
      // Send message to AI agent with progress updates
      await agent.sendMessage(userInput, (status) => {
        setStreamingContent(status)
      })
      
      // Update with final response
      setMessages([...agent.getConversation().getMessagesForDisplay()])
      
    } catch (error) {
      console.error("Agent error:", error)
      
      // Add error message to conversation
      const conversation = agent.getConversation()
      conversation.addMessage({
        role: "assistant",
        content: error instanceof Error ? error.message : String(error),
      })
      setMessages([...conversation.getMessagesForDisplay()])
      
    } finally {
      setIsProcessing(false)
      setStreamingContent("")
      inputRef.current?.focus()
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
        <div className="agent-messages">
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
                <span>{msg.timestamp.toLocaleTimeString()}</span>
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
          
          {/* Processing status */}
          {streamingContent && (
            <div className="agent-message agent-message-assistant agent-streaming">
              <div className="agent-message-header">
                <span>🤖 Assistant</span>
                <span>⚙️ {streamingContent}</span>
              </div>
            </div>
          )}
          
          {/* <div ref={messagesEndRef} /> */}
        </div>
      )}

      {/* Input area */}
      {isAgentConfigured() && (
        <div style={{ display: "none2" }}>
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
              type="submit"
              disabled={!inputValue.trim() || isProcessing}
              className="agent-submit"
            >
              {isProcessing ? "Thinking..." : "Send"}
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
