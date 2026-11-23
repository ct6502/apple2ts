import { ARROW } from "../common/utility"

export type ArrowKeyCode = "ArrowLeft" | "ArrowRight" | "ArrowUp" | "ArrowDown" |
  "Numpad4" | "Numpad6" | "Numpad8" | "Numpad2"

export const arrowKeys: Record<ArrowKeyCode, ARROW> = {
  ArrowLeft: ARROW.LEFT,
  ArrowRight: ARROW.RIGHT,
  ArrowUp: ARROW.UP,
  ArrowDown: ARROW.DOWN,
  // Numpad 8/2/4/6 Joystick Mapping (Immune to NumLock)
  Numpad4: ARROW.LEFT,
  Numpad6: ARROW.RIGHT,
  Numpad8: ARROW.UP,
  Numpad2: ARROW.DOWN,
}

export const arrowKeyCodes: Record<ArrowKeyCode, number> = {
  ArrowLeft: 8,
  ArrowRight: 21,
  ArrowUp: 11,
  ArrowDown: 10,
  Numpad4: 8,
  Numpad6: 21,
  Numpad8: 11,
  Numpad2: 10,
}

export const diagonalKeys: Record<string, boolean> = {
  Numpad7: true,
  Numpad9: true,
  Numpad1: true,
  Numpad3: true,
}

// The numeric keypad drives the arrow-key joystick only while that setting is on.
// A real IIgs keyboard reports keypad 2/4/6/8 as digits while NumLock is on, and
// as the arrow key codes while it is off. The browser's e.key already says which
// of the two the press is, so with the setting off the keypad must fall through
// to the normal key path: games that take keyboard input read those digits, and
// swallowing the press into a joystick arrow means they never see it at all.
const isNumpadDirection = (code: string) =>
  code === "Numpad2" || code === "Numpad4" || code === "Numpad6" || code === "Numpad8"

export const getArrowKeyName = (code: string, key: string,
  numpadAsJoystick: boolean): ArrowKeyCode | null => {
  if (code in arrowKeys && (numpadAsJoystick || !isNumpadDirection(code))) {
    return code as ArrowKeyCode
  }
  // With the setting off this only matches a real arrow key, or a keypad press
  // whose NumLock state made the browser report it as one.
  if (key in arrowKeys) return key as ArrowKeyCode
  return null
}

export const usesDiagonalKey = (code: string, numpadAsJoystick: boolean) =>
  numpadAsJoystick && code in diagonalKeys
