/**
 * Agent Configuration and API Key Management
 * Handles storing/loading API keys and provider settings from localStorage
 */

const STORAGE_KEY_PREFIX = "apple2ts_agent_"

export type ProviderType = "anthropic" | "deepseek" | "openai" | "google"

export interface AgentConfig {
  provider: ProviderType
  apiKey: string
  model?: string
  maxTokens?: number
  temperature?: number
}

/**
 * Save agent configuration to localStorage
 */
export function saveAgentConfig(config: AgentConfig): void {
  try {
    localStorage.setItem(
      `${STORAGE_KEY_PREFIX}config`,
      JSON.stringify(config)
    )
  } catch (error) {
    console.error("Failed to save agent config:", error)
  }
}

/**
 * Load agent configuration from localStorage
 */
export function loadAgentConfig(): AgentConfig | null {
  try {
    const stored = localStorage.getItem(`${STORAGE_KEY_PREFIX}config`)
    if (!stored) {
      console.log("[AgentConfig] No config in localStorage")
      return null
    }
    
    const config = JSON.parse(stored) as AgentConfig
    
    // Validate required fields
    if (!config.provider || !config.apiKey) {
      console.warn("[AgentConfig] Invalid config - missing provider or apiKey")
      return null
    }
    
    return config
  } catch (error) {
    console.error("Failed to load agent config:", error)
    return null
  }
}

/**
 * Clear agent configuration from localStorage
 */
export function clearAgentConfig(): void {
  try {
    localStorage.removeItem(`${STORAGE_KEY_PREFIX}config`)
  } catch (error) {
    console.error("Failed to clear agent config:", error)
  }
}

/**
 * Check if agent is configured
 */
export function isAgentConfigured(): boolean {
  const config = loadAgentConfig()
  return config !== null && config.apiKey.length > 0
}

/**
 * Get display name for provider
 */
export function getProviderDisplayName(provider: ProviderType): string {
  switch (provider) {
    case "anthropic":
      return "Anthropic Claude"
    case "deepseek":
      return "DeepSeek AI"
    case "openai":
      return "OpenAI GPT"
    case "google":
      return "Google Gemini"
    default:
      return "Unknown Provider"
  }
}

/**
 * Get default models for each provider
 */
export function getDefaultModel(provider: ProviderType): string {
  switch (provider) {
    case "anthropic":
      return "claude-sonnet-4-6"
    case "deepseek":
      return "deepSeek-v4-flash"
    case "openai":
      return "gpt-4o"
    case "google":
      return "gemini-1.5-pro"
    default:
      return ""
  }
}

/**
 * Get supported models for each provider
 */
export function getSupportedModels(provider: ProviderType): Array<{ value: string; label: string }> {
  switch (provider) {
    case "anthropic":
      return [
        { value: "claude-sonnet-4-6", label: "Claude Sonnet 4" },
        { value: "claude-3-5-sonnet-20240620", label: "Claude 3.5 Sonnet (June)" },
        { value: "claude-3-opus-20240229", label: "Claude 3 Opus" },
        { value: "claude-3-sonnet-20240229", label: "Claude 3 Sonnet" },
        { value: "claude-3-haiku-20240307", label: "Claude 3 Haiku" },
      ]
    case "deepseek":
      return [
        { value: "deepseek-v4-flash", label: "DeepSeek V4 Flash" },
        { value: "deepseek-v4-flash-thinking", label: "DeepSeek V4 Flash (Thinking)" },
        { value: "deepseek-v4-pro", label: "DeepSeek V4 Pro" },
        { value: "deepseek-v4-pro-thinking", label: "DeepSeek V4 Pro (Thinking)" },
      ]
    case "openai":
      return [
        { value: "gpt-4o", label: "GPT-4o" },
        { value: "gpt-4-turbo", label: "GPT-4 Turbo" },
        { value: "gpt-3.5-turbo", label: "GPT-3.5 Turbo" },
      ]
    case "google":
      return [
        { value: "gemini-1.5-pro", label: "Gemini 1.5 Pro" },
        { value: "gemini-1.5-flash", label: "Gemini 1.5 Flash" },
      ]
    default:
      return []
  }
}

/**
 * Validate API key format for a provider
 */
export function validateApiKeyFormat(provider: ProviderType, apiKey: string): boolean {
  switch (provider) {
    case "anthropic":
      return apiKey.startsWith("sk-ant-") && apiKey.length > 20
    case "deepseek":
      return apiKey.startsWith("sk-") && apiKey.length > 20
    case "openai":
      return apiKey.startsWith("sk-") && apiKey.length > 20
    case "google":
      return apiKey.length > 20 // Google keys don't have a consistent prefix
    default:
      return false
  }
}
