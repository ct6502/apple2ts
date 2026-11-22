import { ARROW, convertAppleKey } from "../common/utility"
import { arrowKeyCodes, getArrowKeyName, usesDiagonalKey } from "./arrowkeymap"

const keyEvent = (key: string, code: string): Parameters<typeof convertAppleKey>[0] =>
  ({ key, code, altKey: false, ctrlKey: false, shiftKey: false, keyCode: 0 }) as unknown as
  Parameters<typeof convertAppleKey>[0]

describe("arrow key mapping", () => {
  test("the keypad is a joystick direction while the arrow-key joystick is on", () => {
    expect(getArrowKeyName("Numpad2", "2", true)).toBe("Numpad2")
    expect(getArrowKeyName("Numpad8", "8", true)).toBe("Numpad8")
    // The keypad mapping is deliberately immune to NumLock in this mode.
    expect(getArrowKeyName("Numpad2", "ArrowDown", true)).toBe("Numpad2")
  })

  test("a real arrow key is an arrow whether or not the joystick setting is on", () => {
    expect(getArrowKeyName("ArrowLeft", "ArrowLeft", true)).toBe("ArrowLeft")
    expect(getArrowKeyName("ArrowLeft", "ArrowLeft", false)).toBe("ArrowLeft")
    expect(getArrowKeyName("ArrowUp", "ArrowUp", false)).toBe("ArrowUp")
  })

  // Rastan's keyboard control reads the digit keys, so with the joystick setting
  // off the keypad press has to reach the guest as '2'/'4'/'6'/'8' rather than
  // being turned into an arrow code the game never looks at.
  test("with the joystick setting off, keypad 2/4/6/8 is not turned into an arrow", () => {
    expect(getArrowKeyName("Numpad2", "2", false)).toBeNull()
    expect(getArrowKeyName("Numpad4", "4", false)).toBeNull()
    expect(getArrowKeyName("Numpad6", "6", false)).toBeNull()
    expect(getArrowKeyName("Numpad8", "8", false)).toBeNull()
  })

  test("with the joystick setting off and NumLock off, the keypad reports the arrow it is", () => {
    expect(getArrowKeyName("Numpad2", "ArrowDown", false)).toBe("ArrowDown")
    expect(getArrowKeyName("Numpad4", "ArrowLeft", false)).toBe("ArrowLeft")
    expect(getArrowKeyName("Numpad6", "ArrowRight", false)).toBe("ArrowRight")
    expect(getArrowKeyName("Numpad8", "ArrowUp", false)).toBe("ArrowUp")
    expect(arrowKeyCodes["ArrowDown"]).toBe(10)
  })

  test("the keypad diagonal keys only belong to the joystick while the setting is on", () => {
    expect(usesDiagonalKey("Numpad7", true)).toBe(true)
    expect(usesDiagonalKey("Numpad7", false)).toBe(false)
    expect(usesDiagonalKey("Numpad3", false)).toBe(false)
    expect(usesDiagonalKey("ArrowUp", true)).toBe(false)
  })

  test("the digits the keypad sends match the ones the number row sends", () => {
    const numberRow = ["2", "4", "6", "8"].map((digit) =>
      convertAppleKey(keyEvent(digit, `Digit${digit}`), false, 0, 0))
    const keypad = ["2", "4", "6", "8"].map((digit) =>
      convertAppleKey(keyEvent(digit, `Numpad${digit}`), false, 0, 0))
    expect(keypad).toEqual(numberRow)
    expect(keypad).toEqual([0x32, 0x34, 0x36, 0x38])
  })
})

describe("numpad digits are the same keys to the guest", () => {
  test("keypad '2' with NumLock on is the Apple II '2' key", () => {
    // This is the path handleKeyDown takes once getArrowKeyName returns null.
    const arrow = getArrowKeyName("Numpad2", "2", false)
    expect(arrow).toBeNull()
    const key = convertAppleKey(keyEvent("2", "Numpad2"), false, 0, 0)
    expect(key).toBe(0x32)
    expect(arrowKeyCodes["Numpad2"]).toBe(10)   // the code it used to send instead
    expect(ARROW.DOWN).toBeDefined()
  })
})
