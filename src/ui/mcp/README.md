# AI Agent Integration for Apple2TS

This directory contains the AI agent integration that allows natural language interaction with the Apple II emulator.

## Architecture

The integration is designed to be modular and provider-agnostic:

```
mcp_agent_provider.ts      - Abstract interface for AI providers
mcp_agent_anthropic.ts     - Claude/Anthropic implementation  
mcp_agent_config.ts        - Configuration and API key management
mcp_agent_conversation.ts  - Message history and conversation management
mcp_agent.ts              - Main orchestrator
```

## Features

- **Natural Language Interface**: Chat with your Apple II emulator
- **Automatic Tool Execution**: AI automatically uses MCP tools (memory, CPU, debugging)
- **Multi-Provider Support**: Easy to add OpenAI, Google, or other providers
- **Secure**: API keys stored locally in browser localStorage
- **Conversation History**: Maintains context across multiple interactions

## Currently Supported

### Providers
- ✅ **Anthropic Claude** (3.5 Sonnet, 3 Opus, 3 Sonnet, 3 Haiku)
- 🚧 OpenAI GPT (architecture ready, implementation pending)
- 🚧 Google Gemini (architecture ready, implementation pending)

### Features
- Chat interface with message history
- Automatic MCP tool calling
- Configuration management
- Tool execution tracking
- Error handling

## Usage

### 1. Get an API Key

For Claude (Anthropic):
- Visit https://console.anthropic.com/
- Create an account and generate an API key
- Key format: `sk-ant-...`

### 2. Configure the Agent

In the Apple2TS app:
1. Navigate to the Agent tab
2. Click "Get Started"
3. Select your provider (currently only Anthropic Claude)
4. Choose your model
5. Enter your API key
6. Click "Save Configuration"

Your API key is stored locally in your browser and never sent to apple2ts.com.

### 3. Start Chatting

Ask questions like:
- "What's in the CPU registers?"
- "Show me the text on the screen"
- "Read memory at address $C000"
- "Set a breakpoint at $300"
- "Boot the system"

The AI will automatically use the appropriate MCP tools to answer your questions.

## Adding a New Provider

To add support for another AI provider (OpenAI, Google, etc.):

1. **Create the provider implementation** (e.g., `mcp_agent_openai.ts`):
```typescript
import type { AIProvider, AIMessage, AIResponse } from "./mcp_agent_provider"

export class OpenAIProvider implements AIProvider {
  name = "OpenAI"
  
  // Implement all required methods
  async sendMessage(...) { ... }
  validateApiKey(...) { ... }
  getSupportedModels() { ... }
}
```

2. **Update the config** in `mcp_agent_config.ts`:
```typescript
export type ProviderType = "anthropic" | "openai" | "google"
```

3. **Register in the orchestrator** in `mcp_agent.ts`:
```typescript
private createProvider(type: ProviderType, apiKey: string, model?: string): AIProvider | null {
  switch (type) {
    case "anthropic":
      return new AnthropicProvider(apiKey, model)
    case "openai":
      return new OpenAIProvider(apiKey, model)
    // ...
  }
}
```

4. **Update the UI** in `agent_tab.tsx` to add the new provider option.

## API

### MCPAgent

Main orchestrator class:

```typescript
const agent = getAgent() // Singleton instance

// Initialize from saved config
agent.initialize()

// Configure manually
agent.configure("anthropic", "sk-ant-...", "claude-3-5-sonnet-20241022")

// Send a message
const response = await agent.sendMessage("What's in the CPU registers?")

// Clear conversation
agent.clearConversation()
```

### Configuration

```typescript
import { saveAgentConfig, loadAgentConfig, isAgentConfigured } from "./mcp_agent_config"

// Save config
saveAgentConfig({
  provider: "anthropic",
  apiKey: "sk-ant-...",
  model: "claude-3-5-sonnet-20241022"
})

// Load config
const config = loadAgentConfig()

// Check if configured
if (isAgentConfigured()) {
  // Ready to use
}
```

## Security

- API keys are stored in browser `localStorage` only
- Keys are never sent to apple2ts.com servers
- All AI API calls are made directly from the browser to the provider
- No proxy or intermediary servers involved
- Users maintain full control over their API keys

## Tool Calling

The AI agent has access to all MCP tools defined in `mcp_tools.ts`:

- **Execution Control**: boot, reset, stop, resume, step, step_over, step_out
- **State Inspection**: get_registers, read_memory, get_softswitches
- **State Modification**: set_register, write_memory, set_softswitches
- **Debugging**: set_breakpoint, clear_breakpoint, list_breakpoints
- **Media**: insert_disk, eject_disk, send_keypress, load_binary
- **Analysis**: disassemble

The agent automatically chooses and executes the appropriate tools based on user requests.

## Future Enhancements

- [ ] Streaming responses for real-time feedback
- [ ] OpenAI GPT provider implementation
- [ ] Google Gemini provider implementation
- [ ] Conversation export/import
- [ ] Custom system prompts
- [ ] Model parameter tuning (temperature, max_tokens)
- [ ] Cost tracking and usage statistics
- [ ] Multi-turn tool execution with confirmation
- [ ] Voice input/output integration
