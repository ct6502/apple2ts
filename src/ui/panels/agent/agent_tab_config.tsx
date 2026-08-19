import { useEffect, useState } from "react"
import { validateApiKeyFormat, getProviderDisplayName, saveAgentConfig, loadAgentConfig, getDefaultModel, getSupportedModels, ProviderType, clearAgentConfig, isAgentConfigured } from "../../mcp/mcp_agent_config"
import { getAgent } from "../../mcp/mcp_agent"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { faXmark } from "@fortawesome/free-solid-svg-icons"
import { useTranslation } from "../../../i18n/useTranslation"

interface OllamaModel {
  name: string
  modified_at?: string
  size?: number
  digest?: string
}

const AgentTabConfig = (props: {
  showConfig: boolean, 
  setShowConfig: (show: boolean) => void,
  onConfigChange?: () => void
}) => {
  const { t } = useTranslation()
  const initialConfig = loadAgentConfig()
  const initialProvider: ProviderType = initialConfig?.provider ?? "anthropic"
  const initialModel = initialConfig?.model || getDefaultModel(initialProvider)
  const [apiKey, setApiKey] = useState(initialConfig?.apiKey ?? "")
  const [provider, setProvider] = useState<ProviderType>(initialProvider)
  const [model, setModel] = useState(initialModel)
  const [availableModels, setAvailableModels] = useState(getSupportedModels(initialProvider))
  const [currentConfig, setCurrentConfig] = useState<ReturnType<typeof loadAgentConfig>>(initialConfig ?? null)
  const [ollamaModels, setOllamaModels] = useState<Array<{ value: string; label: string }>>([])
  const agent = getAgent()

  const isCustomModel = provider === "ollama" && Boolean(model) &&
    !getSupportedModels("ollama").some(m => m.value === model) &&
    !ollamaModels.some(m => m.value === model)

  // Dynamic tag fetching for Ollama
  useEffect(() => {
    if (provider !== "ollama" || !apiKey) {
      return
    }
    
    let active = true
    const fetchModels = async () => {
      try {
        const IS_LOCALHOST = window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1"
        const IS_DEFAULT_OLLAMA = apiKey.includes("localhost") || apiKey.includes("127.0.0.1")
        const proxyUrl = "/api/ollama/tags"
        
        let response
        if (IS_LOCALHOST && IS_DEFAULT_OLLAMA) {
          try {
            response = await fetch(proxyUrl, {
              headers: { "x-ollama-url": apiKey }
            })
            // Check if response is actually JSON (SPA routing might redirect to index.html with 200 OK)
            const contentType = response.headers.get("content-type")
            if (!response.ok || !contentType || !contentType.includes("application/json")) {
              response = undefined
            }
          } catch {
            // fallback
          }
        }
        
        if (!response) {
          response = await fetch(`${apiKey}/api/tags`)
        }
        
        if (response && response.ok) {
          const data = await response.json()
          if (data && Array.isArray(data.models) && active) {
            const models = data.models.map((m: OllamaModel) => ({
              value: m.name,
              label: m.name,
            }))
            setOllamaModels(models)
          }
        }
      } catch (err) {
        console.log("Failed to fetch Ollama models:", err)
      }
    }
    
    const timer = setTimeout(fetchModels, 500)
    return () => {
      active = false
      clearTimeout(timer)
    }
  }, [provider, apiKey])

  const handleConfigSave = (e?: React.FormEvent) => {
    e?.preventDefault() // Prevent form submission page reload
    
    if (!validateApiKeyFormat(provider, apiKey)) {
      alert(t("agent.invalidKeyFormat").replace("{{provider}}", getProviderDisplayName(provider)))
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
    if (newProvider === "ollama") {
      setApiKey("http://localhost:11434")
    } else {
      setApiKey("") // Clear API key when changing provider
    }
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
        return "AIza... or AQ..."
      case "ollama":
        return "http://localhost:11434"
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
      case "ollama":
        return { url: "https://ollama.com/", text: "ollama.com" }
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
        <div className="dialog-title" style={{padding: 0, paddingTop: "6px"}}>{t("agent.configTitle")}</div>
        <button className="push-button"
          type="button"
          onClick={() => props.setShowConfig(false)}>
          <FontAwesomeIcon icon={faXmark} style={{ fontSize: "0.8em" }} />
        </button>
      </div>
      <div className="horiz-rule" style={{ marginTop: "2px", marginBottom: "10px" }}></div>
      <form className="agent-config-form" onSubmit={handleConfigSave}>
        <label>
          {t("agent.provider")}
          <select 
            value={provider} 
            onChange={(e) => handleProviderChange(e.target.value as ProviderType)}
          >
            <option value="anthropic">Anthropic Claude</option>
            <option value="deepseek">DeepSeek AI</option>
            <option value="openai">OpenAI ChatGPT</option>
            <option value="google">Google Gemini</option>
            <option value="ollama">Ollama (Local)</option>
          </select>
        </label>
        
        <label>
          {t("agent.model")}
          {provider === "ollama" ? (
            <select 
              value={isCustomModel ? "custom" : model} 
              onChange={(e) => {
                const val = e.target.value
                if (val === "custom") {
                  setModel("ornith:9b")
                } else {
                  setModel(val)
                }
              }}
            >
              {ollamaModels.length > 0 ? (
                ollamaModels.map((m) => (
                  <option key={m.value} value={m.value}>
                    {m.label}
                  </option>
                ))
              ) : (
                availableModels.map((m) => (
                  <option key={m.value} value={m.value}>
                    {m.label}
                  </option>
                ))
              )}
              <option value="custom">Custom Model...</option>
            </select>
          ) : (
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
          )}
        </label>

        {provider === "ollama" && isCustomModel && (
          <label style={{ marginTop: "10px" }}>
            Custom Model Name:
            <input
              type="text"
              value={model}
              onChange={(e) => setModel(e.target.value)}
              placeholder="e.g. gemma2:27b"
              className="agent-model-input"
            />
          </label>
        )}
        
        <label>
          {provider === "ollama" ? t("agent.ollamaUrl") : t("agent.apiKey")}
          <input
            type={provider === "ollama" ? "text" : "password"}
            value={apiKey}
            onChange={(e) => setApiKey(e.target.value)}
            placeholder={getApiKeyPlaceholder()}
            className="agent-api-key-input"
          />
        </label>
        
        <div className="flex-row">
          <button className="push-button text-button"
            type="submit" disabled={!apiKey}>
            <span className="centered-title">{t("agent.save")}</span>
          </button>
          <button type="button" className="push-button text-button"
            onClick={handleClearConfig}>
            <span className="centered-title">{t("agent.clear")}</span>
          </button>
        </div>
        
        <div className="agent-config-info">
          <small>
            {provider === "ollama"
              ? t("agent.ollamaWarning")
              : t("agent.storageWarning").replace("{{provider}}", getProviderDisplayName(provider))
            }
            {" "}
            <a href={getApiKeyLink().url} target="_blank" rel="noopener noreferrer">{getApiKeyLink().text}</a>
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
        ? t("agent.providerConfigured")
            .replace("{{provider}}", providerInfo.name)
            .replace("{{model}}", currentConfig?.model || "default")
        : t("agent.providerNotConfigured")
    })()}
  </div>
</div>
)
}

export default AgentTabConfig
