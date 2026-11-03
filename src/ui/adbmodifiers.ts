// Which host key carries which IIgs ADB modifier.
//
// A chord exists on the IIgs only in the $C025 modifier byte, and this app binds
// the two Apple keys to several host keys (Alt, the Meta pair, the numpad fire
// buttons). Windows takes Alt+Esc for its own window switcher, so if only Alt
// drove $C025 no IIgs chord would be pressable on that host at all — every
// binding has to report the same modifier bit.

// The strings are worker DOM codes, not Apple II keycodes: DOM_TO_ADB turns
// AltLeft into Option ($3A, bit 6) and AltRight into Command ($37, bit 7).
export const OPEN_APPLE = "AltLeft"
export const CLOSED_APPLE = "AltRight"

// The two Apple keys are not here: they are resolved by role below, because
// several host keys stand in for each of them.
const PLAIN_ADB_MODIFIERS = ["ControlLeft", "ControlRight", "ShiftLeft", "ShiftRight"]

export const isOpenAppleCode = (code: string, useOpenAppleKey: boolean) =>
  code === OPEN_APPLE || code === "Numpad0" || code === "Numpad5" ||
  (useOpenAppleKey && code === "MetaLeft")

export const isClosedAppleCode = (code: string, useOpenAppleKey: boolean) =>
  code === CLOSED_APPLE || code === "NumpadDecimal" || code === "NumpadEnter" ||
  (useOpenAppleKey && code === "MetaRight")

// The modifier event to post for this physical key, or null when it is not a
// modifier at all.
export const adbModifierRole = (code: string, useOpenAppleKey: boolean) => {
  if (isOpenAppleCode(code, useOpenAppleKey)) return OPEN_APPLE
  if (isClosedAppleCode(code, useOpenAppleKey)) return CLOSED_APPLE
  return PLAIN_ADB_MODIFIERS.includes(code) ? code : null
}
