export const parseRemoteKeyboardState = (payload: Record<string, unknown>): KeyboardState => {
  const value = payload.key
  return {
    key: typeof value === "string" ? value.charCodeAt(0) : Number(value),
    isDown: Boolean(payload.isDown),
    repeat: Boolean(payload.repeat),
  }
}
