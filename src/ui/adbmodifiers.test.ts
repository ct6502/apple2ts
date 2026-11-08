import { OPEN_APPLE, CLOSED_APPLE, adbModifierRole, isOpenAppleCode, isClosedAppleCode } from "./adbmodifiers"

// Windows takes Alt+Esc for its own window switcher, so the IIgs chords this app
// offers (Closed Apple + Esc for the desk drawer, Closed Apple + W to close a
// window) would be unpressable there if only the Alt keys carried the modifier.
// Every binding has to resolve to the same $C025 bit.

test("each Open Apple binding reports Option, each Closed Apple binding reports Command", () => {
  for (const code of ["AltLeft", "Numpad0", "Numpad5"]) {
    expect(isOpenAppleCode(code, false)).toBe(true)
    expect(adbModifierRole(code, false)).toBe(OPEN_APPLE)
    expect(isClosedAppleCode(code, false)).toBe(false)
  }
  for (const code of ["AltRight", "NumpadDecimal", "NumpadEnter"]) {
    expect(isClosedAppleCode(code, false)).toBe(true)
    expect(adbModifierRole(code, false)).toBe(CLOSED_APPLE)
    expect(isOpenAppleCode(code, false)).toBe(false)
  }
})

test("the Meta pair joins the bindings only when the user asked for the Cmd keys", () => {
  expect(adbModifierRole("MetaLeft", false)).toBe(null)
  expect(adbModifierRole("MetaRight", false)).toBe(null)
  expect(adbModifierRole("MetaLeft", true)).toBe(OPEN_APPLE)
  expect(adbModifierRole("MetaRight", true)).toBe(CLOSED_APPLE)
})

test("Shift, Control and Caps Lock keep their own codes; ordinary keys post no modifier", () => {
  for (const code of ["ControlLeft", "ControlRight", "ShiftLeft", "ShiftRight", "CapsLock"]) {
    expect(adbModifierRole(code, true)).toBe(code)
  }
  // The chord's other half, and the numpad arrows that are joystick axes.
  for (const code of ["Escape", "KeyW", "Numpad8", "Numpad2"]) {
    expect(adbModifierRole(code, true)).toBe(null)
  }
})
