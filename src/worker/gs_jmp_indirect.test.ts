// Regression: JMP (abs) must read its 16-bit pointer from bank 0, not PB.
import { CPU65816 } from "./cpu65816"

describe("65816 JMP (abs) pointer bank", () => {
  test("6C reads the pointer from bank 0", () => {
    const mem = new Uint8Array(0x120000)
    const cpu = new CPU65816((address) => mem[address], (address, value) => {
      mem[address] = value & 0xFF
    })
    cpu.reset()
    cpu.PC = 0x1234
    cpu.PB = 0x11
    cpu.DB = 0x00
    cpu.S = 0x01FF
    cpu.P = 0x31
    // Instruction sits in bank 11; its pointer table is in bank 0 at $C000.
    mem[(0x11 << 16) | 0x1234] = 0x6C
    mem[(0x11 << 16) | 0x1235] = 0x00
    mem[(0x11 << 16) | 0x1236] = 0xC0
    mem[0x00C000] = 0x00
    mem[0x00C001] = 0x40
    cpu.processInstruction(null)
    expect(cpu.PC).toBe(0x4000)
    expect(cpu.PB).toBe(0x11)
  })
})