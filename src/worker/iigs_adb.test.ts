/**
 * Regression tests for the IIgs ADB micro-controller keyboard auto-repeat.
 *
 * These are ports of gssquared's ADB_Micro.hpp: `dlyrpt` delay-to-repeat / repeat
 * rate nibbles, `dncntr`, `start_repeat()` / `stop_repeat()`, and the 60 Hz
 * `frame_handler()` that stores `last_key_down` again at `repeat_frames()`.
 */

import {
  ADB_MODE_KBD_AUTOPOLL_OFF,
  IIGSADB,
  registerLegacyKeyboardStrobe,
} from "./iigs_adb"

const MOD_SHIFT = 0x01
const MOD_CAPS = 0x04

let adb = new IIGSADB()
let strobes: number[] = []

const setRepeatConfiguration = (dlyrpt: number) => {
  adb.writeCommand(0x06)
  adb.writeCommand(0x00)
  adb.writeCommand(0x03)
  adb.writeCommand(dlyrpt)
}

beforeEach(() => {
  adb = new IIGSADB()
  adb.reset()
  strobes = []
  registerLegacyKeyboardStrobe((key) => {
    strobes.push(key)
  })
})

afterEach(() => {
  registerLegacyKeyboardStrobe(null)
})

test("delay-to-repeat and repeat-rate tables match gssquared ROM 01", () => {
  expect(adb.delayFrames()).toBe(15)
  expect(adb.repeatFrames()).toBe(1)

  setRepeatConfiguration(0x32)
  expect(adb.delayFrames()).toBe(60)
  expect(adb.repeatFrames()).toBe(2)

  setRepeatConfiguration(0x4f) // nibble 4 = no repeat; f clamps to rate 15
  expect(adb.delayFrames()).toBe(0)
  expect(adb.repeatFrames()).toBe(15)

  setRepeatConfiguration(0x80) // high nibble 8 clamps to delay nibble 4
  expect(adb.delayFrames()).toBe(0)
  expect(adb.repeatFrames()).toBe(1)

  setRepeatConfiguration(0xf0) // both nibbles clamp at their table ends
  expect(adb.delayFrames()).toBe(0)
  expect(adb.repeatFrames()).toBe(1)
})

test("ROM 03 uses the reverse repeat-rate table with two extra-slow slots", () => {
  adb.setRom03(true)

  expect(adb.repeatFrames()).toBe(30) // nibble 0 is the slowest on ROM 03
  setRepeatConfiguration(0x01)
  expect(adb.repeatFrames()).toBe(20)
  setRepeatConfiguration(0x03)
  expect(adb.repeatFrames()).toBe(8)
  setRepeatConfiguration(0x09)
  expect(adb.repeatFrames()).toBe(1) // nibble 9 is fastest
  setRepeatConfiguration(0x0a)
  expect(adb.repeatFrames()).toBe(1) // >= 10 clamps to index 9
  setRepeatConfiguration(0x0f)
  expect(adb.repeatFrames()).toBe(1)
  expect(adb.delayFrames()).toBe(15)
})

test("a held key repeats after delayFrames and then at repeatFrames", () => {
  setRepeatConfiguration(0x31) // delay 60 frames, repeat every 2 frames
  expect(adb.queueKeyboard(0x00)).toBe(false) // ADB_A key down
  expect(strobes).toEqual([]) // no repeat on the original host press

  for (let frame = 0; frame < 59; frame += 1) {
    expect(adb.repeatTick()).toBeNull()
  }
  expect(strobes).toEqual([])

  expect(adb.repeatTick()).toBe(0x61) // 60th frame: first repeat of 'a'
  expect(strobes).toEqual([0x61])
  expect(adb.repeatTick()).toBeNull()
  expect(adb.repeatTick()).toBe(0x61) // 2-frame repeat rate
  expect(strobes).toEqual([0x61, 0x61])
  expect(adb.getKeyboardEvent()[0]).toBe(0x00) // fresh raw A key-down report
})

test("a repeat re-latches the micro's own report, not the guest echo", () => {
  setRepeatConfiguration(0x30) // delay 60 frames, repeat every frame
  adb.queueKeyboard(0x00) // A down starts the repeat

  // A guest echo ($11) would leave register 0 holding the echoed K; the repeat
  // must restore the micro's own A key-down event beside the modifier byte.
  adb.writeCommand(0x11)
  adb.writeCommand(0x28)
  expect(adb.getKeyboardEvent()[0]).toBe(0xeb)

  for (let frame = 0; frame < 59; frame += 1) {
    expect(adb.repeatTick()).toBeNull()
  }
  expect(adb.repeatTick()).toBe(0x61)
  expect(adb.getKeyboardEvent()).toEqual([0x00, 0])
})

test("a key-up cancels the pending repeat before it fires", () => {
  setRepeatConfiguration(0x30) // delay 60 frames
  adb.queueKeyboard(0x00) // A down starts the repeat

  for (let frame = 0; frame < 10; frame += 1) {
    expect(adb.repeatTick()).toBeNull()
  }
  adb.queueKeyboard(0x80) // A up stops the repeat

  for (let frame = 0; frame < 60; frame += 1) {
    expect(adb.repeatTick()).toBeNull()
  }
  expect(strobes).toEqual([])
})

test("modifier keys neither start nor cancel the repeat", () => {
  setRepeatConfiguration(0x30) // delay 60 frames
  adb.queueKeyboard(0x38) // Shift down: modifier event only
  for (let frame = 0; frame < 60; frame += 1) {
    expect(adb.repeatTick()).toBeNull()
  }
  expect(strobes).toEqual([])

  adb.queueKeyboard(0x00) // A down starts the repeat; Shift is still held
  for (let frame = 0; frame < 10; frame += 1) {
    expect(adb.repeatTick()).toBeNull()
  }
  adb.queueKeyboard(0xb8) // Shift up: must not stop the pending repeat
  for (let frame = 0; frame < 49; frame += 1) {
    expect(adb.repeatTick()).toBeNull()
  }
  expect(adb.repeatTick()).toBe(0x41)
})

test("repeat maps the ASCII from the modifiers at key-down", () => {
  setRepeatConfiguration(0x30)
  adb.queueKeyboard(0x38) // Shift down
  adb.queueKeyboard(0x00) // A down starts the repeat

  for (let frame = 0; frame < 59; frame += 1) {
    expect(adb.repeatTick()).toBeNull()
  }
  expect(adb.repeatTick()).toBe(0x41) // Shift+A => uppercase 'A'
  expect(strobes).toEqual([0x41])
  expect(adb.getKeyboardEvent()[1] & MOD_SHIFT).toBe(MOD_SHIFT)

  // A modifier change after the press does not re-map the repeated key: the
  // micro keeps the ASCII it mapped at the original key-down.
  adb.queueKeyboard(0xb8) // Shift up
  expect(adb.repeatTick()).toBe(0x41) // one-frame repeat rate
  expect(strobes).toEqual([0x41, 0x41])
})

test("Caps Lock drives the repeat ASCII and its modifier byte", () => {
  setRepeatConfiguration(0x30)
  adb.queueKeyboard(0xb9) // Caps Lock key-up toggles caps on
  expect(adb.peekModifiers() & MOD_CAPS).toBe(MOD_CAPS)

  adb.queueKeyboard(0x00) // A down starts the repeat
  for (let frame = 0; frame < 59; frame += 1) {
    expect(adb.repeatTick()).toBeNull()
  }
  expect(adb.repeatTick()).toBe(0x41) // caps => 'A'
  expect(strobes).toEqual([0x41])
  expect(adb.getKeyboardEvent()[1] & MOD_CAPS).toBe(MOD_CAPS)
})

test("delay nibble 4 disables repeat entirely", () => {
  setRepeatConfiguration(0x40) // no repeat
  adb.queueKeyboard(0x00)
  for (let frame = 0; frame < 60; frame += 1) {
    expect(adb.repeatTick()).toBeNull()
  }
  expect(strobes).toEqual([])
})

test("repeat latches a fresh SRQ report in autopoll-off mode", () => {
  setRepeatConfiguration(0x30)
  adb.writeCommand(0x04)
  adb.writeCommand(ADB_MODE_KBD_AUTOPOLL_OFF)
  adb.queueKeyboard(0x00) // key-down latches a service request
  expect(adb.readData()).toBe(0x08) // consume the original host report

  for (let frame = 0; frame < 59; frame += 1) {
    expect(adb.repeatTick()).toBeNull()
  }
  expect(adb.repeatTick()).toBe(0x61)
  expect(adb.readData()).toBe(0x08) // repeat latched a new service request
})

test("reset drops an in-flight repeat", () => {
  setRepeatConfiguration(0x30)
  adb.queueKeyboard(0x00)
  for (let frame = 0; frame < 10; frame += 1) {
    expect(adb.repeatTick()).toBeNull()
  }
  adb.reset()
  for (let frame = 0; frame < 60; frame += 1) {
    expect(adb.repeatTick()).toBeNull()
  }
  expect(strobes).toEqual([])
})
