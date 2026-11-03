// Apple IIgs hardware keyboard delivery through the ADB.
//
// On the IIgs the physical keyboard is ADB device address 2, and it drives two
// things at once: the ADB event stream (register 0 plus the $C025 modifier byte)
// and the Mega II's legacy $C000/$C010 strobe. Measured on GS/OS 6.0.1 the
// Finder consumes $C000 and polls $C025 about once per frame while never
// polling ADB device 2, so for the Finder the legacy register is the key's
// carrier and $C025 the modifier's - see gs_command_key.test.ts for the
// end-to-end proof. Event bytes carry the ADB convention: keycode for a key
// down, keycode | 0x80 for a key up (gssquared ADB_Keyboard.hpp:477). Table
// lookup from DOM KeyboardEvent.code is transcribed from the same file.

import { doSetMachineName } from "./motherboard"
import { setKeyboardState } from "./devices/keyboard"
import { iigsADB } from "./iigs_adb"
import { memGetC000 } from "./memory"

// $C025 bit assignments (KEGS adb.c:153-157, gssquared adb_mod_key_t).
const MOD_SHIFT = 0x01
const MOD_CONTROL = 0x02
const MOD_LATCH = 0x20
const MOD_OPEN = 0x40
const MOD_CLOSED = 0x80

beforeEach(() => {
  doSetMachineName("APPLE2GS")
  iigsADB.reset()
})

test("a hardware key reaches ADB keyboard register 0 as a down/up event", () => {
  setKeyboardState({ key: 97, isDown: true, repeat: false, domCode: "KeyA" })
  expect(iigsADB.getKeyboardEvent().slice(0, 1)[0]).toBe(0x00)
  expect(iigsADB.hasKeyData()).toBe(true)
  setKeyboardState({ key: 97, isDown: false, repeat: false, domCode: "KeyA" })
  expect(iigsADB.getKeyboardEvent()[0]).toBe(0x80)
})

test("the same key still strobes the legacy $C000 register", () => {
  setKeyboardState({ key: 97, isDown: true, repeat: false, domCode: "KeyA" })
  expect(memGetC000(0xC000)).toBe(0x80 | 97)
})

test("navigation keys use the IIgs ADB codes", () => {
  setKeyboardState({ key: 13, isDown: true, repeat: false, domCode: "Enter" })
  expect(iigsADB.getKeyboardEvent()[0]).toBe(0x24)
  setKeyboardState({ key: 13, isDown: false, repeat: false, domCode: "Enter" })
  expect(iigsADB.getKeyboardEvent()[0]).toBe(0x80 | 0x24)
  setKeyboardState({ key: -1, isDown: true, repeat: false, domCode: "ArrowUp" })
  expect(iigsADB.getKeyboardEvent()[0]).toBe(0x3e)
})

test("host auto-repeat does not re-queue the same report", () => {
  setKeyboardState({ key: 97, isDown: true, repeat: true, domCode: "KeyA" })
  expect(iigsADB.hasKeyData()).toBe(false)
})

test("modifier keys drive $C025 and release with their own keycode", () => {
  // A held key first, so the assertion below is about a *chord* and not about a
  // register nobody has touched: the modifier must leave the key it rides on
  // alone. The pre-fix code fell through to the key -1 branch and dropped the
  // any-key-down line, which is how a second Alt press cancelled a keypress.
  setKeyboardState({ key: 97, isDown: true, repeat: false, domCode: "KeyA" })
  setKeyboardState({ key: -1, isDown: true, repeat: false, domCode: "ShiftLeft" })
  expect(iigsADB.peekModifiers() & MOD_SHIFT).toBe(MOD_SHIFT)
  expect(memGetC000(0xC000)).toBe(0x80 | 97)
  expect(memGetC000(0xC010) & 0x80).toBe(0x80)

  setKeyboardState({ key: -1, isDown: true, repeat: false, domCode: "ControlLeft" })
  expect(iigsADB.peekModifiers() & MOD_CONTROL).toBe(MOD_CONTROL)

  setKeyboardState({ key: -1, isDown: false, repeat: false, domCode: "ShiftLeft" })
  expect(iigsADB.peekModifiers() & MOD_SHIFT).toBe(0)
  expect(iigsADB.peekModifiers() & MOD_CONTROL).toBe(MOD_CONTROL)
})

test("Open Apple and Closed Apple are different keys", () => {
  // The chord the guest acts on is chosen by which of these two bits is set, so
  // mapping both Alt keys to Option ($3A) made Closed Apple unreachable.
  setKeyboardState({ key: -1, isDown: true, repeat: false, domCode: "AltLeft" })
  expect(iigsADB.peekModifiers() & MOD_OPEN).toBe(MOD_OPEN)
  expect(iigsADB.peekModifiers() & MOD_CLOSED).toBe(0)
  setKeyboardState({ key: -1, isDown: false, repeat: false, domCode: "AltLeft" })

  setKeyboardState({ key: -1, isDown: true, repeat: false, domCode: "AltRight" })
  expect(iigsADB.peekModifiers() & MOD_CLOSED).toBe(MOD_CLOSED)
  expect(iigsADB.peekModifiers() & MOD_OPEN).toBe(0)
})

test("a chord releases only the key let go first", () => {
  // Hold Closed Apple, press Escape, then let go of the Apple key: an up event
  // that replayed the *last down* keycode would send Escape going up and leave
  // the Command bit stuck in $C025 forever.
  setKeyboardState({ key: -1, isDown: true, repeat: false, domCode: "AltRight" })
  setKeyboardState({ key: 27, isDown: true, repeat: false, domCode: "Escape" })
  expect(iigsADB.peekModifiers() & MOD_CLOSED).toBe(MOD_CLOSED)
  setKeyboardState({ key: -1, isDown: false, repeat: false, domCode: "AltRight" })
  expect(iigsADB.peekModifiers() & MOD_CLOSED).toBe(0)
  expect(iigsADB.getKeyboardEvent()[0]).toBe(0x80 | 0x37)
  setKeyboardState({ key: 27, isDown: false, repeat: false, domCode: "Escape" })
  expect(iigsADB.getKeyboardEvent()[0]).toBe(0x80 | 0x35)
})

test("reading $C025 clears the modifiers-updated latch but keeps the bits", () => {
  setKeyboardState({ key: -1, isDown: true, repeat: false, domCode: "AltRight" })
  expect(iigsADB.peekModifiers() & MOD_LATCH).toBe(MOD_LATCH)
  const read = iigsADB.readModifiers()
  expect(read & MOD_CLOSED).toBe(MOD_CLOSED)
  expect(iigsADB.peekModifiers() & MOD_LATCH).toBe(0)
  expect(iigsADB.peekModifiers() & MOD_CLOSED).toBe(MOD_CLOSED)
})

test("the Apple IIe path still uses the $C000 softswitch", () => {
  doSetMachineName("APPLE2EE")
  setKeyboardState({ key: 97, isDown: true, repeat: false, domCode: "KeyA" })
  expect(iigsADB.hasKeyData()).toBe(false)
  // The IIe branch is exercised by devices/keyboard.test.ts; here we only
  // assert that a IIe key did not leak into the ADB.
})

test("an unknown DOM code is not delivered and does not throw", () => {
  setKeyboardState({ key: 32, isDown: true, repeat: false, domCode: "F13" })
  expect(iigsADB.hasKeyData()).toBe(false)
})
