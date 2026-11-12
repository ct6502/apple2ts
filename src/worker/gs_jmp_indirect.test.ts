// Regression: JMP (abs) must read its 16-bit pointer from bank 0, not PB.
import { CPU65816 } from "./cpu65816"

describe("65816 absolute indexed bank carry", () => {
  test("9D STA abs,X carries the index into the next bank, not the offset", () => {
    const mem = new Uint8Array(0x130000)
    const writes: number[] = []
    const cpu = new CPU65816((address) => mem[address & 0xFFFFFF] ?? 0, (address, value) => {
      writes.push(address)
      mem[address & 0xFFFFFF] = value & 0xFF
    })
    cpu.reset()
    cpu.PB = 0x11
    cpu.DB = 0x11
    cpu.PC = 0xE00C
    cpu.S = 0x01FF
    cpu.P = 0x04 // 16-bit A and X
    cpu.emulationMode = false
    cpu.A = 0
    cpu.X = 0xE3DC
    mem[(0x11 << 16) | 0xE00C] = 0x9D // STA $FC23,X
    mem[(0x11 << 16) | 0xE00D] = 0x23
    mem[(0x11 << 16) | 0xE00E] = 0xFC
    cpu.processInstruction(null)
    // $11:FC23 + $E3DC carries over the 16-bit word into bank $12, so a
    // 16-bit store lands at $12DFFF/$12E000, not $11DFFF/$11E000.
    expect(writes.slice(-2)).toEqual([0x12DFFF, 0x12E000])
  })

  test("99 STA abs,Y carries the index into the next bank, not the offset", () => {
    const mem = new Uint8Array(0x130000)
    const writes: number[] = []
    const cpu = new CPU65816((address) => mem[address & 0xFFFFFF] ?? 0, (address, value) => {
      writes.push(address)
      mem[address & 0xFFFFFF] = value & 0xFF
    })
    cpu.reset()
    cpu.PB = 0x11
    cpu.DB = 0x11
    cpu.PC = 0xE00C
    cpu.S = 0x01FF
    cpu.P = 0x04
    cpu.emulationMode = false
    cpu.A = 0
    cpu.Y = 0xE3DC
    mem[(0x11 << 16) | 0xE00C] = 0x99 // STA $FC23,Y
    mem[(0x11 << 16) | 0xE00D] = 0x23
    mem[(0x11 << 16) | 0xE00E] = 0xFC
    cpu.processInstruction(null)
    expect(writes.slice(-2)).toEqual([0x12DFFF, 0x12E000])
  })
})

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