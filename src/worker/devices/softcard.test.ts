/* eslint-disable @typescript-eslint/no-explicit-any */
declare const test: any
declare const expect: any

import { SoftCard, SOFTCARD_ROM } from "./softcard"

test("SoftCard initial state", () => {
  const card = new SoftCard(2)
  expect(card.slot).toBe(2)
  expect(card.activeCpu).toBe("6502")
})

test("SoftCard ROM signature", () => {
  expect(SOFTCARD_ROM[0x05]).toBe(0x38)
  expect(SOFTCARD_ROM[0x07]).toBe(0x18)
  expect(SOFTCARD_ROM[0x0b]).toBe(0x01)
})

test("SoftCard toggle switch detection ($C0A0 for Slot 2)", () => {
  const card = new SoftCard(2)
  expect(card.isToggleSwitch(0xc0a0)).toBe(true)
  expect(card.isToggleSwitch(0xc0a9)).toBe(true)
  expect(card.isToggleSwitch(0xc0c0)).toBe(false)
})

test("SoftCard Z80 address remapping", () => {
  const card = new SoftCard(2)
  // Z80 0x0000 - 0xEFFF -> Apple II 0x1000 - 0xFFFF
  expect(card.translateZ80Address(0x0000)).toBe(0x1000)
  expect(card.translateZ80Address(0x2000)).toBe(0x3000)
  expect(card.translateZ80Address(0xefff)).toBe(0xffff)

  // Z80 0xF000 - 0xFFFF -> Apple II 0x0000 - 0x0FFF
  expect(card.translateZ80Address(0xf000)).toBe(0x0000)
  expect(card.translateZ80Address(0xffff)).toBe(0x0fff)

  // I/O space bypass (0xC000 - 0xC0FF)
  expect(card.translateZ80Address(0xc0c0)).toBe(0xc0c0)
})

test("SoftCard CPU toggle on read/write", () => {
  const memory = new Uint8Array(0x10000)
  const card = new SoftCard(2)
  card.setMemoryBus({
    read: (addr) => memory[addr],
    write: (addr, val) => { memory[addr] = val },
  })

  expect(card.activeCpu).toBe("6502")
  card.readByte(0xc0a0)
  expect(card.activeCpu).toBe("Z80")
  card.writeByte(0xc0a0, 0x00)
  expect(card.activeCpu).toBe("6502")
})

test("Z80 execution NOP and LD instructions", () => {
  const memory = new Uint8Array(0x10000)
  const card = new SoftCard(2)
  card.setMemoryBus({
    read: (addr) => memory[addr],
    write: (addr, val) => { memory[addr] = val },
  })

  // Z80 PC starts at 0x0000, which maps to Apple II 0x1000
  // Write Z80 instructions at Apple II 0x1000:
  // 0x00: NOP
  // 0x3E 0x42: LD A, 0x42
  memory[0x1000] = 0x00 // NOP
  memory[0x1001] = 0x3e // LD A, 0x42
  memory[0x1002] = 0x42

  card.activeCpu = "Z80"
  expect(card.z80.pc).toBe(0x0000)

  card.stepZ80() // NOP
  expect(card.z80.pc).toBe(0x0001)

  card.stepZ80() // LD A, 0x42
  expect(card.z80.pc).toBe(0x0003)
  expect(card.z80.a).toBe(0x42)
})
