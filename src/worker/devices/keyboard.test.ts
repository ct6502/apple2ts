import {
  advanceKeySequence,
  clearKeyStrobe,
  interruptKeySequence,
  popKey,
  sendPastedText,
  sendKeySequence,
  setKeyboardState,
} from "./keyboard"

const keyboardMemory = new Uint8Array(0x20)

jest.mock("../memory", () => ({
  memGetC000: (address: number) => keyboardMemory[address - 0xC000],
  memSetC000: (address: number, value: number) => {
    keyboardMemory[address - 0xC000] = value
  },
}))

jest.mock("../games/game_mappings", () => ({
  handleKeyMapping: (key: string) => key,
}))

jest.mock("../motherboard", () => ({doTakeSnapshot: jest.fn()}))

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
