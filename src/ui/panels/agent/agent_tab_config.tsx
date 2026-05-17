import { useEffect, useState } from "react"
import { validateApiKeyFormat, getProviderDisplayName, saveAgentConfig, loadAgentConfig, getDefaultModel, getSupportedModels, ProviderType, isAgentConfigured, clearAgentConfig } from "../../mcp/mcp_agent_config"
import { getAgent } from "../../mcp/mcp_agent"

const AgentTabConfig = () => {
  const [apiKey, setApiKey] = useState("")
  const [showConfig, setShowConfig] = useState(!isAgentConfigured())
  const [provider, setProvider] = useState<ProviderType>("anthropic")
  const [model, setModel] = useState(getDefaultModel("anthropic"))
  const [availableModels, setAvailableModels] = useState(getSupportedModels("anthropic"))
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
    
  const handleConfigSave = () => {
    if (!validateApiKeyFormat(provider, apiKey)) {
      alert(`Invalid API key format for ${getProviderDisplayName(provider)}`)
      return
    }
    
    const config = { provider, apiKey, model }
    saveAgentConfig(config)
    agent.configure(provider, apiKey, model)
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
  
return (
<div>
  {showConfig &&
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
          {isAgentConfigured() && (
            <div>
            <button onClick={() => clearAgentConfig()}>
              Clear Configuration
            </button>
            <button onClick={() => setShowConfig(false)}>
              Cancel
            </button>
            </div>
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
  }

  {isAgentConfigured() && !showConfig && (
    <div className="agent-header">
      <div className="agent-header-buttons">
        <button onClick={handleConfigChange} title="Change configuration">
          Settings
        </button>
      </div>
    </div>
  )}
</div>
)
}

export default AgentTabConfig