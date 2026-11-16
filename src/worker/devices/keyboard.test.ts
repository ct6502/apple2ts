import {
  advanceKeySequence,
  clearKeyStrobe,
  interruptKeySequence,
  popKey,
  sendPastedText,
  sendKeySequence,
  setKeyboardState,
} from "./keyboard"
import { iigsADB } from "../iigs_adb"

const keyboardMemory = new Uint8Array(0x20)
let mockMachineName = "APPLE2EE"

jest.mock("../memory", () => ({
  memGetC000: (address: number) => keyboardMemory[address - 0xC000],
  memSetC000: (address: number, value: number) => {
    keyboardMemory[address - 0xC000] = value
  },
  getCurrentMachineName: () => mockMachineName,
}))

jest.mock("../games/game_mappings", () => ({
  handleKeyMapping: (key: string) => key,
}))

jest.mock("../motherboard", () => ({doTakeSnapshot: jest.fn()}))

beforeEach(() => {
  mockMachineName = "APPLE2EE"
  iigsADB.reset()
  keyboardMemory.fill(0)
})

afterEach(() => {
  interruptKeySequence()
  keyboardMemory.fill(0)
  jest.useRealTimers()
})

test("delivers a sequence at keyboard-strobe boundaries", async () => {
  jest.useFakeTimers()
  const result = sendKeySequence({keys: "AZ\r", timeoutMs: 5000})

  expect(keyboardMemory[0]).toBe(0xC1)
  clearKeyStrobe()
  expect(keyboardMemory[0]).toBe(0x41)
  advanceKeySequence()
  expect(keyboardMemory[0]).toBe(0xDA)
  clearKeyStrobe()
  advanceKeySequence()
  expect(keyboardMemory[0]).toBe(0x8D)
  clearKeyStrobe()
  advanceKeySequence()

  await expect(result).resolves.toEqual({
    outcome: "completed",
    keysDelivered: 3,
    keyMayHaveBeenObserved: false,
  })
  expect(keyboardMemory[0]).toBe(0x0D)
  expect(keyboardMemory[0x10]).toBe(0x0D)
})

test("bounds a sequence that software does not acknowledge", async () => {
  jest.useFakeTimers()
  const result = sendKeySequence({keys: "A", timeoutMs: 50})

  jest.advanceTimersByTime(50)

  await expect(result).resolves.toEqual({
    outcome: "timeout",
    keysDelivered: 0,
    keyMayHaveBeenObserved: true,
  })
  expect(keyboardMemory[0]).toBe(0x41)
  expect(keyboardMemory[0x10]).toBe(0x41)
})

test("reports a partially delivered sequence when interrupted", async () => {
  jest.useFakeTimers()
  const result = sendKeySequence({keys: "AZ", timeoutMs: 5000})
  clearKeyStrobe()
  advanceKeySequence()

  interruptKeySequence()

  await expect(result).resolves.toEqual({
    outcome: "interrupted",
    keysDelivered: 1,
    keyMayHaveBeenObserved: true,
  })
})

test("rejects malformed sequences before changing the keyboard", async () => {
  await expect(sendKeySequence({keys: "", timeoutMs: 5000})).rejects.toThrow("Invalid key sequence")
  await expect(sendKeySequence({keys: "🙂", timeoutMs: 5000})).rejects.toThrow("Invalid key sequence")
  expect(keyboardMemory[0]).toBe(0)
})

test("does not mix a sequence with buffered text", async () => {
  const first = sendKeySequence({keys: "A", timeoutMs: 5000})
  const second = sendKeySequence({keys: "Z", timeoutMs: 5000})

  await expect(second).resolves.toEqual({
    outcome: "input_busy",
    keysDelivered: 0,
    keyMayHaveBeenObserved: false,
  })
  interruptKeySequence()
  await first
})

test("does not replace a held or unconsumed key", async () => {
  setKeyboardState({key: 0x41, isDown: true, repeat: true})
  await expect(sendKeySequence({keys: "Z", timeoutMs: 5000})).resolves.toMatchObject({
    outcome: "input_busy",
  })

  clearKeyStrobe()
  await expect(sendKeySequence({keys: "Z", timeoutMs: 5000})).resolves.toMatchObject({
    outcome: "input_busy",
  })
  setKeyboardState({key: 0x41, isDown: false, repeat: false})
})

test("accepts a sequence after the final pasted key is consumed", async () => {
  jest.useFakeTimers()
  sendPastedText("A")
  popKey()
  popKey()
  popKey()
  clearKeyStrobe()

  const sequence = sendKeySequence({keys: "Z", timeoutMs: 5000})
  expect(keyboardMemory[0]).toBe(0xDA)
  clearKeyStrobe()
  advanceKeySequence()
  await expect(sequence).resolves.toMatchObject({outcome: "completed"})
})

test("IIgs micro repeat strobes the legacy latch at the 60 Hz delay and rate", () => {
  mockMachineName = "APPLE2GS"
  setKeyboardState({key: 0x41, isDown: true, repeat: false, domCode: "KeyA"})
  expect(keyboardMemory[0]).toBe(0xE1) // first host press: 'a' + key-present bit
  expect(keyboardMemory[0x10]).toBe(0xE1)

  clearKeyStrobe() // the Finder consumed the host press
  expect(keyboardMemory[0]).toBe(0x61)
  for (let frame = 0; frame < 14; frame += 1) {
    expect(iigsADB.repeatTick()).toBeNull()
  }
  expect(keyboardMemory[0]).toBe(0x61)

  expect(iigsADB.repeatTick()).toBe(0x61) // frame 15: default delay nibble 0
  expect(keyboardMemory[0]).toBe(0xE1) // repeated key strobes $C000 again
  expect(keyboardMemory[0x10]).toBe(0xE1) // and any-key-down $C010
  expect(iigsADB.getKeyboardEvent()[0]).toBe(0x00) // raw ADB A key-down report

  expect(iigsADB.repeatTick()).toBe(0x61) // default rate nibble 0 = every frame

  setKeyboardState({key: 0x41, isDown: false, repeat: false, domCode: "KeyA"})
  clearKeyStrobe()
  for (let frame = 0; frame < 60; frame += 1) {
    expect(iigsADB.repeatTick()).toBeNull()
  }
  expect(keyboardMemory[0]).toBe(0x61) // key-up stopped the micro repeat
})

test("GS host repeat states do not duplicate or arm the micro repeat", () => {
  mockMachineName = "APPLE2GS"
  setKeyboardState({key: 0x41, isDown: true, repeat: false, domCode: "KeyA"})
  clearKeyStrobe()
  expect(keyboardMemory[0]).toBe(0x61)

  // A host repeat state must not queue another ADB report or strobe the legacy
  // latch itself: the micro's own repeatTick() is the single repeat source.
  setKeyboardState({key: 0x41, isDown: true, repeat: true, domCode: "KeyA"})
  expect(keyboardMemory[0]).toBe(0x61)

  for (let frame = 0; frame < 14; frame += 1) {
    expect(iigsADB.repeatTick()).toBeNull()
  }
  expect(iigsADB.repeatTick()).toBe(0x61)
  expect(keyboardMemory[0]).toBe(0xE1)
})

test("IIgs repeat keeps $C025 modifier semantics across key chords", () => {
  mockMachineName = "APPLE2GS"
  setKeyboardState({key: 0x41, isDown: true, repeat: false, domCode: "ShiftLeft"})
  setKeyboardState({key: 0x41, isDown: true, repeat: false, domCode: "KeyA"})
  expect(iigsADB.peekModifiers() & 0x01).toBe(0x01) // Shift bit is live

  expect(keyboardMemory[0]).toBe(0xC1) // Shift+A strobes uppercase 'A'
  clearKeyStrobe()
  expect(keyboardMemory[0]).toBe(0x41)

  for (let frame = 0; frame < 14; frame += 1) {
    expect(iigsADB.repeatTick()).toBeNull()
  }
  expect(iigsADB.repeatTick()).toBe(0x41)
  expect(keyboardMemory[0]).toBe(0xC1)
  expect(iigsADB.getKeyboardEvent()[1] & 0x01).toBe(0x01) // report carries Shift

  setKeyboardState({key: 0x41, isDown: false, repeat: false, domCode: "KeyA"})
  setKeyboardState({key: 0x41, isDown: false, repeat: false, domCode: "ShiftLeft"})
})
