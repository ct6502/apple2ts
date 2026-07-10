type JsonObject = Record<string, unknown>

export type ToolSchemaWithProperties = {
  properties: Record<string, unknown>
}

export type OpenAIStyleToolCall = {
  id: string
  function: {
    name: string
    arguments: string | Record<string, unknown>
  }
}

export const hasToolSchemaProperties = (schema: Record<string, unknown>): schema is ToolSchemaWithProperties => {
  const properties = schema["properties"]
  return Boolean(properties && typeof properties === "object" && Object.keys(properties as JsonObject).length > 0)
}