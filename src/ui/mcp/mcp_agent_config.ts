/**
 * Agent Configuration and API Key Management
 * Handles storing/loading API keys and provider settings from localStorage
 */

import { AnthropicProvider } from "./mcp_agent_anthropic"
import { DeepSeekProvider } from "./mcp_agent_deepseek"
import { OpenAIProvider } from "./mcp_agent_openai"

const STORAGE_KEY_PREFIX = "apple2ts_agent_"

export type ProviderType = "anthropic" | "deepseek" | "openai" | "google"

export interface AgentConfig {
  provider: ProviderType
  apiKey: string
  model: string
  maxTokens?: number
}

export type AIProviderModel = {
  value: string,
  label: string
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
  const models = getSupportedModels(provider)
  return models.length > 0 ? models[0].value : ""
}

/**
 * Get supported models for each provider
 */
export function getSupportedModels(provider: ProviderType): Array<AIProviderModel> {
  switch (provider) {
    case "anthropic":
      return AnthropicProvider.getSupportedModels()
    case "deepseek":
      return DeepSeekProvider.getSupportedModels()
    case "openai":
      return OpenAIProvider.getSupportedModels()
    case "google":
//      return GoogleProvider.getSupportedModels()
      break
    default:
      break
  }
  return []
}

/**
 * Validate API key format for a provider
 */
export function validateApiKeyFormat(provider: ProviderType, apiKey: string): boolean {
  switch (provider) {
    case "anthropic":
      return AnthropicProvider.validateApiKeyFormat(apiKey)
    case "deepseek":
      return DeepSeekProvider.validateApiKeyFormat(apiKey)
    case "openai":
      return OpenAIProvider.validateApiKeyFormat(apiKey)
    case "google":
//      return GoogleProvider.validateApiKeyFormat(apiKey)
      break
    default:
      break
  }
  return false
}
