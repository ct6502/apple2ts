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
import { iigsADB, ADB_MODE_KBD_AUTOPOLL_OFF } from "./iigs_adb"
import { memGetC000 } from "./memory"

// $C025 bit assignments (gssquared adb_mod_key_t ADB_Keyboard.hpp:6).
// bit6 is closed, bit7 is open - ADB_COMMAND ($37) drives open and ADB_OPTION
// ($3A) drives closed (ADB_Micro.hpp:503-504).
const MOD_SHIFT = 0x01
const MOD_CONTROL = 0x02
const MOD_CAPS = 0x04
const MOD_LATCH = 0x20
const MOD_CLOSED = 0x40
const MOD_OPEN = 0x80

// $C027: bit 5 data register full, bit 4 data interrupt enable, bit 3 keyboard
// data available. The data interrupt's report byte carries bit 3 as "service
// request valid" - both status bit 3 and report bit 3 are 0x08.
const STATUS_DATA_AVAILABLE = 0x20
const STATUS_KEYBOARD_DATA = 0x08
const STATUS_DATA_INTERRUPT = 0x10
const REPORT_SERVICE_REQUEST = 0x08

const enableAdbSrqMode = () => {
  iigsADB.writeCommand(0x04) // set modes
  iigsADB.writeCommand(ADB_MODE_KBD_AUTOPOLL_OFF)
}

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

test("Caps Lock toggles on key-up and feeds the legacy letter case", () => {
  // The old UI preference uppercased every host key in convertAppleKey, and a
  // browser's Caps Lock never reached $C025. Toggling the ADB modifier on
  // key-up (gssquared ADB_Micro.hpp:505) and deriving $C000 from keycode +
  // modifiers is what makes the case follow the physical caps state.
  setKeyboardState({ key: -1, isDown: true, repeat: false, domCode: "CapsLock" })
  expect(iigsADB.peekModifiers() & MOD_CAPS).toBe(0)
  setKeyboardState({ key: -1, isDown: false, repeat: false, domCode: "CapsLock" })
  expect(iigsADB.peekModifiers() & MOD_CAPS).toBe(MOD_CAPS)

  setKeyboardState({ key: 97, isDown: true, repeat: false, domCode: "KeyA" })
  expect(memGetC000(0xC000)).toBe(0x80 | "A".charCodeAt(0))

  // A second press/release puts the toggle back off; the ADB letter returns to
  // lowercase regardless of the host keyboard event's own text.
  iigsADB.readModifiers() // clear the updated latch so the caps-off edge is observable
  setKeyboardState({ key: -1, isDown: true, repeat: false, domCode: "CapsLock" })
  expect(iigsADB.peekModifiers() & MOD_CAPS).toBe(MOD_CAPS)
  setKeyboardState({ key: -1, isDown: false, repeat: false, domCode: "CapsLock" })
  expect(iigsADB.peekModifiers() & MOD_CAPS).toBe(0)
  expect(iigsADB.peekModifiers() & MOD_LATCH).toBe(MOD_LATCH)
  setKeyboardState({ key: 97, isDown: true, repeat: false, domCode: "KeyA" })
  expect(memGetC000(0xC000)).toBe(0x80 | "a".charCodeAt(0))
})

test("Shift changes ADB letters and Backspace maps to delete 0x7F", () => {
  setKeyboardState({ key: -1, isDown: true, repeat: false, domCode: "ShiftLeft" })
  expect(iigsADB.peekModifiers() & MOD_SHIFT).toBe(MOD_SHIFT)
  setKeyboardState({ key: 97, isDown: true, repeat: false, domCode: "KeyA" })
  expect(memGetC000(0xC000)).toBe(0x80 | "A".charCodeAt(0))

  // The host convertAppleKey special case emitted 0x08 for Backspace under the
  // default COUT; GS/OS reads that as the left-arrow key. ADB_DELETE is 0x7F.
  setKeyboardState({ key: 8, isDown: true, repeat: false, domCode: "Backspace" })
  expect(memGetC000(0xC000)).toBe(0x80 | 0x7F)
  expect(iigsADB.getKeyboardEvent()[0]).toBe(0x33)
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
  expect(iigsADB.getKeyboardEvent()[0]).toBe(0x80 | 0x3A)
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

test("an SRQ-mode host key latches the data-interrupt service request report", () => {
  // XRick/Wolf3D's driver turns keyboard auto-poll off ($04,$01) and installs
  // an SRQ completion routine. The keyboard interrupt enable (bit 2) is not set
  // in that mode; the data interrupt (bit 4) is what carries the key. Its report
  // byte's bit 3 is the service-request-valid bit the ROM's IRQ dispatcher tests
  // before calling IRQ_SRQ, so the key must latch a report, not just fill the
  // keyboard register.
  iigsADB.writeStatus(STATUS_DATA_INTERRUPT)
  enableAdbSrqMode()
  setKeyboardState({ key: 97, isDown: true, repeat: false, domCode: "KeyA" })

  expect(iigsADB.getKeyboardEvent()[0]).toBe(0x00) // ADB_Keyboard keycode for A
  expect(iigsADB.readStatus() & STATUS_DATA_AVAILABLE).toBe(STATUS_DATA_AVAILABLE)
  expect(iigsADB.interruptPending()).toBe(true)
  expect(iigsADB.readData()).toBe(REPORT_SERVICE_REQUEST)
  expect(iigsADB.readStatus() & STATUS_DATA_AVAILABLE).toBe(0)
  expect(iigsADB.interruptPending()).toBe(false)
})

test("without SRQ mode a host key makes no data report", () => {
  // The ordinary GS/OS/ROM path leaves auto-poll on, so the key stays in the
  // keyboard register for the ROM's polling task and raises no service request.
  // Without this distinction the fix would inject every ordinary key into a
  // data register that no one has enabled.
  iigsADB.writeStatus(STATUS_DATA_INTERRUPT)
  setKeyboardState({ key: 97, isDown: true, repeat: false, domCode: "KeyA" })

  expect(iigsADB.hasKeyData()).toBe(true)
  expect(iigsADB.readStatus() & STATUS_DATA_AVAILABLE).toBe(0)
  expect(iigsADB.interruptPending()).toBe(false)
  expect(iigsADB.readData()).toBe(0x00)
})

test("a guest $11 echo writes the key latch without latching another report", () => {
  // XRick's SRQ completion routine receives the key bytes and forwards them back
  // to the micro with $11 "send FDB keycode". That is an echo into the micro's
  // own latch, not a fresh host event: re-latching the service request here
  // makes the driver interrupt itself forever. gssquared's
  // store_key_to_buffer() (ADB_Micro.hpp:698/608) does not touch
  // send_data_register, and its $11 path maps the raw keycode through
  // map_key() first (ADB_Micro.hpp:608): $28 (K) becomes ASCII 'k' ($6B) with
  // the key-present bit, so the latch is $EB.
  iigsADB.writeStatus(STATUS_DATA_INTERRUPT)
  enableAdbSrqMode()
  iigsADB.writeCommand(0x11)
  iigsADB.writeCommand(0x28) // the raw K keycode the guest echoed

  expect(iigsADB.getKeyboardEvent()[0]).toBe(0xeb)
  expect(iigsADB.getKeyboardEvent()[1]).toBe(0) // K is not in the keypad range
  expect(iigsADB.readStatus() & STATUS_KEYBOARD_DATA).toBe(STATUS_KEYBOARD_DATA)
  expect(iigsADB.readStatus() & STATUS_DATA_AVAILABLE).toBe(0)
  expect(iigsADB.interruptPending()).toBe(false)
  expect(iigsADB.readData()).toBe(0x00)
})

test("a guest $11 echo keeps the keypad flag for keypad keycodes", () => {
  // gssquared's $11 sets the keypad flag for raw keycodes in $43-$5C
  // (ADB_Micro.hpp:605) and stores it in the modifier byte, so a keypad key
  // reaches $C025 bit 4. K is outside that range, hence the 0 above.
  iigsADB.writeStatus(STATUS_DATA_INTERRUPT)
  enableAdbSrqMode()
  iigsADB.writeCommand(0x11)
  iigsADB.writeCommand(0x50) // keypad keycode in $43-$5C

  expect(iigsADB.getKeyboardEvent()[1]).toBe(0x10)
  expect(iigsADB.readStatus() & STATUS_KEYBOARD_DATA).toBe(STATUS_KEYBOARD_DATA)
  expect(iigsADB.readStatus() & STATUS_DATA_AVAILABLE).toBe(0)
  expect(iigsADB.interruptPending()).toBe(false)
  expect(iigsADB.readData()).toBe(0x00)
})
