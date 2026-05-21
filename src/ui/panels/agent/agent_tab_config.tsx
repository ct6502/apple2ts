import { useEffect, useState } from "react"
import { validateApiKeyFormat, getProviderDisplayName, saveAgentConfig, loadAgentConfig, getDefaultModel, getSupportedModels, ProviderType, clearAgentConfig, isAgentConfigured } from "../../mcp/mcp_agent_config"
import { getAgent } from "../../mcp/mcp_agent"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { faXmark } from "@fortawesome/free-solid-svg-icons"

const AgentTabConfig = (props: {
  showConfig: boolean, 
  setShowConfig: (show: boolean) => void,
  onConfigChange?: () => void
}) => {
  const [apiKey, setApiKey] = useState("")
  const [provider, setProvider] = useState<ProviderType>("anthropic")
  const [model, setModel] = useState(getDefaultModel("anthropic"))
  const [availableModels, setAvailableModels] = useState(getSupportedModels("anthropic"))
  const [currentConfig, setCurrentConfig] = useState<ReturnType<typeof loadAgentConfig>>(null)
  const agent = getAgent()

  // Initialize config state from localStorage on mount
  useEffect(() => {
    const config = loadAgentConfig()
    if (config) {
      setProvider(config.provider)
      setModel(config.model || getDefaultModel(config.provider))
      setAvailableModels(getSupportedModels(config.provider))
      setApiKey(config.apiKey)
      setCurrentConfig(config)
    }
  }, [])
    
  const handleConfigSave = (e?: React.FormEvent) => {
    e?.preventDefault() // Prevent form submission page reload
    
    if (!validateApiKeyFormat(provider, apiKey)) {
      alert(`Invalid API key format for ${getProviderDisplayName(provider)}`)
      return
    }
    
    const config = { provider, apiKey, model }
    saveAgentConfig(config)
    agent.configure(provider, apiKey, model)
    
    // Clear conversation history when changing provider
    agent.clearConversation()
    
    // Update current config state
    setCurrentConfig(config)
    
    props.setShowConfig(false)
    
    // Trigger parent component refresh if callback provided
    if (props.onConfigChange) {
      props.onConfigChange()
    }
  }
  
  const handleProviderChange = (newProvider: ProviderType) => {
    setProvider(newProvider)
    setAvailableModels(getSupportedModels(newProvider))
    setModel(getDefaultModel(newProvider))
    setApiKey("") // Clear API key when changing provider
  }
  
  const handleClearConfig = () => {
    clearAgentConfig()
    
    // Clear conversation history
    agent.clearConversation()
    
    // Reset local state
    setApiKey("")
    setProvider("anthropic")
    setModel(getDefaultModel("anthropic"))
    setCurrentConfig(null)
    
    props.setShowConfig(false)
    
    // Trigger parent component refresh if callback provided
    if (props.onConfigChange) {
      props.onConfigChange()
    }
  }
  
  const getApiKeyPlaceholder = () => {
    switch (provider) {
      case "anthropic":
        return "sk-ant-..."
      case "deepseek":
        return "sk-..."
      case "openai":
        return "sk-..."
      case "google":
        return "AIza..."
      default:
        return ""
    }
  }
  
  const getApiKeyLink = () => {
    switch (provider) {
      case "anthropic":
        return { url: "https://console.anthropic.com/", text: "console.anthropic.com" }
      case "deepseek":
        return { url: "https://platform.deepseek.com/", text: "platform.deepseek.com" }
      case "openai":
        return { url: "https://platform.openai.com/", text: "platform.openai.com" }
      case "google":
        return { url: "https://makersuite.google.com/", text: "makersuite.google.com" }
      default:
        return { url: "#", text: "provider website" }
    }
  }
  
return (
<div>
  {props.showConfig &&
  <div className="modal-overlay"
      tabIndex={0} // Make the div focusable
      onKeyDown={(event) => {
        if (event.key === "Escape") props.setShowConfig(false)
      }}>
    <div className="floating-dialog flex-column"
        style={{ left: "35%", top: "25%", width: "70%", maxWidth: "500px" }}>
      <div className="agent-config-panel">
      <div className="flex-row-space-between">
        <div className="dialog-title" style={{padding: 0, paddingTop: "6px"}}>Configure AI Agent</div>
        <button className="push-button"
          type="button"
          onClick={() => props.setShowConfig(false)}>
          <FontAwesomeIcon icon={faXmark} style={{ fontSize: "0.8em" }} />
        </button>
      </div>
      <div className="horiz-rule" style={{ marginTop: "2px", marginBottom: "10px" }}></div>
      <form className="agent-config-form" onSubmit={handleConfigSave}>
        <label>
          Provider:
          <select 
            value={provider} 
            onChange={(e) => handleProviderChange(e.target.value as ProviderType)}
          >
            <option value="anthropic">Anthropic Claude</option>
            <option value="deepseek">DeepSeek AI</option>
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
            placeholder={getApiKeyPlaceholder()}
            className="agent-api-key-input"
          />
        </label>
        
        <div className="flex-row">
          <button className="push-button text-button"
            type="submit" disabled={!apiKey}>
            <span className="centered-title">Save</span>
          </button>
          <button type="button" className="push-button text-button"
            onClick={handleClearConfig}>
            <span className="centered-title">Clear</span>
          </button>
        </div>
        
        <div className="agent-config-info">
          <small>
            Your API key is stored locally in your browser and never sent to apple2ts.com.
            Get your {getProviderDisplayName(provider)} API key at <a href={getApiKeyLink().url} target="_blank" rel="noopener noreferrer">{getApiKeyLink().text}</a>
          </small>
        </div>
      </form>
    </div>
      </div>
    </div>
  }

  <div className="agent-footer">
    {(() => {
      const providerInfo = agent.getProviderInfo()
      return (providerInfo && isAgentConfigured()) 
        ? `Provider: ${providerInfo.name} (${currentConfig?.model || "default"})` 
        : "Provider not configured - click the gear icon to set up your AI agent"
    })()}
  </div>
</div>
)
}

export default AgentTabConfig