// Which host key carries which IIgs ADB modifier.
//
// A chord exists on the IIgs only in the $C025 modifier byte, and this app binds
// the two Apple keys to several host keys (Alt, the Meta pair, the numpad fire
// buttons). Windows takes Alt+Esc for its own window switcher, so if only Alt
// drove $C025 no IIgs chord would be pressable on that host at all — every
// binding has to report the same modifier bit.

// The strings are worker DOM codes, not Apple II keycodes: DOM_TO_ADB turns the
// Open role (AltLeft) into ADB_COMMAND ($37, bit 7 open) and the Closed role
// (AltRight) into ADB_OPTION ($3A, bit 6 closed), matching gssquared's
// apple_modifier_scancode / adb_mod_key_t semantics.
export const OPEN_APPLE = "AltLeft"
export const CLOSED_APPLE = "AltRight"

// The two Apple keys are not here: they are resolved by role below, because
// several host keys stand in for each of them.
// Caps Lock is a toggle rather than a held bit, but it still has to reach the
// ADB micro: the worker flips $C025 bit 2 on key-up (gssquared
// ADB_Micro.hpp:505), exactly like the real keyboard. Excluding it here meant
// no host key ever produced that event, so GS/OS saw every letter as the
// unmodified lowercase keycode - the "typed text is all caps" report was the
// other side of the same missing event.
const PLAIN_ADB_MODIFIERS = ["ControlLeft", "ControlRight", "ShiftLeft", "ShiftRight", "CapsLock"]

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
