import { useEffect, useState } from "react"
import { validateApiKeyFormat, getProviderDisplayName, saveAgentConfig, loadAgentConfig, getDefaultModel, getSupportedModels, ProviderType, isAgentConfigured, clearAgentConfig } from "../../mcp/mcp_agent_config"
import { getAgent } from "../../mcp/mcp_agent"

const AgentTabConfig = (props: {showConfig: boolean, setShowConfig: (show: boolean) => void }) => {
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
    
  const handleConfigSave = () => {
    if (!validateApiKeyFormat(provider, apiKey)) {
      alert(`Invalid API key format for ${getProviderDisplayName(provider)}`)
      return
    }
    
    const config = { provider, apiKey, model }
    saveAgentConfig(config)
    agent.configure(provider, apiKey, model)
    props.setShowConfig(false)
    
    // Reload the page to ensure the new provider is properly initialized
    window.location.reload()
  }
  
  const handleProviderChange = (newProvider: ProviderType) => {
    setProvider(newProvider)
    setAvailableModels(getSupportedModels(newProvider))
    setModel(getDefaultModel(newProvider))
  }
  
  const handleClearConfig = () => {
    clearAgentConfig()
    // Reload the page to reset the agent
    window.location.reload()
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
        style={{ left: "15%", top: "25%" }}>
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
        
        <div className="agent-config-buttons">
          <button onClick={handleConfigSave} disabled={!apiKey}>
            Save Configuration
          </button>
            <button onClick={handleClearConfig}>
              Clear Configuration
            </button>
            <button onClick={() => props.setShowConfig(false)}>
              Cancel
            </button>
        </div>
        
        <div className="agent-config-info">
          <small>
            Your API key is stored locally in your browser and never sent to apple2ts.com.
            Get your {getProviderDisplayName(provider)} API key at <a href={getApiKeyLink().url} target="_blank" rel="noopener noreferrer">{getApiKeyLink().text}</a>
          </small>
        </div>
      </div>
    </div>
      </div>
    </div>
  }

  {isAgentConfigured() && (
    <div className="agent-footer">
      {(() => {
        const providerInfo = agent.getProviderInfo()
        return providerInfo 
          ? `Provider: ${providerInfo.name} (${currentConfig?.model || "default"})` 
          : "Not configured"
      })()}
    </div>
  )}
</div>
)
}

export default AgentTabConfig