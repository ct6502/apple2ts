import { CPU65816 } from "./cpu65816"

// The V (overflow) flag of ADC, checked directly against the definition.
//
// The IIgs ROM's cursor accumulator at FF:9D8D-FF:9D99 adds a signed 16-bit
// delta to the 16-bit cursor with two 8-bit ADCs (M=1 - the accumulator really
// is 8-bit there, which is why both PLAs pull a single byte). The routine it
// then calls, FF:9E76, branches on "BVC $FF:9E86" to decide whether the cursor
// left the screen, and a spurious V sends the cursor to the screen maximum -
// which is what made every leftward move pin at 639.
//
// Signed overflow is only defined for operands of the same width, and is set
// exactly when the two operands share a sign and the result does not. These
// cases pin that definition in both accumulator widths.
let mem: Uint8Array
let cpu: CPU65816

const OP = 0x40   // the operand lives at $40, clear of the program at $2000

beforeEach(() => {
  mem = new Uint8Array(0x1000000)
  cpu = new CPU65816((address) => mem[address], (address, value) => {
    mem[address] = value & 0xff
  })
  cpu.PB = 0
  cpu.DB = 0
  cpu.PC = 0x2000
  cpu.S = 0x01ff
  cpu.emulationMode = false
})

// 8-bit accumulator: LDA #a / STA $40 / LDA #a / CLC / [SEC] / ADC $40
//
// The program must end at the ADC, not after it: BRK *sets* V (the 65816 pushes
// P with B set and the flags register then reads back with V), so a trailing
// BRK makes every case look like an overflow. Read the flags by stepping to the
// ADC and stopping there.
// Run the program and stop immediately after the ADC, so the flags read back
// are the ADC's. Two traps this avoids:
//   - a trailing BRK *sets* V (the 65816 pushes P with B set), so reading the
//     flags after it makes every case look like an overflow;
//   - stepping once per *byte* desynchronises on multi-byte instructions, so
//     step by PC and watch for the ADC opcode instead.
const stepsTo = (bytes: number[], adcOpcode: number) => {
  for (let i = 0; i < bytes.length; i++) mem[0x2000 + i] = bytes[i] as number
  for (let guard = 0; guard < 32; guard++) {
    const pcBefore = cpu.PC
    const opcode = mem[pcBefore] as number
    cpu.processInstruction(null)
    if (opcode === adcOpcode) break
  }
}

const program8 = (a: number, m: number, carryIn: boolean) => {
  // M=1, X=1: 8-bit accumulator and index registers (bits 5 and 4 of P).
  cpu.P = (cpu.P & ~0x30) | 0x30
  const bytes = [
    0xa9, a & 0xff,         // LDA #a
    0xa9, m & 0xff,         // LDA #m
    0x85, OP,               // STA $40
    0xa9, a & 0xff,         // LDA #a
    0x18,                   // CLC
    ...(carryIn ? [0x38] : []),   // SEC
    0x65, OP,               // ADC $40
  ]
  return stepsTo(bytes, 0x65)
}

// 16-bit accumulator: LDA #m(16) / STA $40 / LDA #a(16) / CLC / [SEC] / ADC $40
const program16 = (a: number, m: number, carryIn: boolean) => {
  // M=0, X=0: 16-bit accumulator and index registers.
  cpu.P = cpu.P & ~0x30
  const bytes = [
    0xa9, m & 0xff, m >> 8, // LDA #m
    0x8d, OP, 0x00,         // STA $40 (16-bit)
    0xa9, a & 0xff, a >> 8, // LDA #a
    0x18,                   // CLC
    ...(carryIn ? [0x38] : []),   // SEC
    0x6d, OP, 0x00,         // ADC $40 (16-bit)
  ]
  return stepsTo(bytes, 0x6d)
}

const V = () => (cpu.P & 0x40) !== 0
const C = () => (cpu.P & 0x01) !== 0

type Case = [number, number, boolean, boolean, string]

const run = (program: (a: number, m: number, c: boolean) => void,
  width: number, cases: Case[]) => {
  const rows: string[] = []
  const bad: string[] = []
  for (const [a, m, c, wantV, label] of cases) {
    // A fresh CPU per case: the program ends in BRK, and reusing the CPU would
    // leave PC past the program so the next case would never execute.
    cpu = new CPU65816((address) => mem[address], (address, value) => {
      mem[address] = value & 0xff
    })
    cpu.reset()
    cpu.emulationMode = false
    cpu.PB = 0
    cpu.DB = 0
    cpu.D = 0
    cpu.A = 0
    cpu.X = 0
    cpu.Y = 0
    cpu.S = 0x1fff
    cpu.PC = 0x2000
    program(a, m, c)
    const gotV = V()
    const h = (v: number) => v.toString(16).toUpperCase().padStart(width, "0")
    rows.push(`   $${h(a)} + $${h(m)}${c ? " +C" : "   "} = $${h(cpu.A & (width === 2 ? 0xff : 0xffff))}` +
      `  V=${gotV ? 1 : 0} (want ${wantV ? 1 : 0}) C=${C() ? 1 : 0}   ${label}`)
    if (gotV !== wantV) bad.push(label)
  }
  console.log(`[ADC${width * 8}] V/C truth table:\n` + rows.join("\n"))
  return bad
}

test("ADC 8-bit: V is set only for a same-sign add whose result changes sign", () => {
  const cases: Case[] = [
    [0x7f, 0x01, false, true, "+127 + 1 -> -128 overflow"],
    [0x7f, 0x01, true, true, "+127 + 1 + carry -> -127 overflow"],
    [0x80, 0xff, false, true, "-128 + -1 -> +127 overflow"],
    [0xff, 0x01, true, false, "-1 + 1 + carry -> +1, NO overflow"],
    [0xff, 0x01, false, false, "-1 + 1 -> 0, no overflow"],
    [0xfe, 0x01, true, false, "-2 + 1 + carry -> 0, no overflow"],
    [0x40, 0x20, false, false, "64 + 32 -> 96, no overflow"],
    [0x01, 0x01, false, false, "1 + 1 -> 2, no overflow"],
    [0x7f, 0x00, false, false, "127 + 0 -> 127, no overflow"],
    [0x80, 0x00, false, false, "-128 + 0 -> -128, no overflow"],
    [0x00, 0x80, false, false, "0 + -128 -> -128, no overflow"],
    [0x01, 0x7f, false, true, "+1 + +127 -> -128 overflow"],
  ]
  const bad = run(program8, 2, cases)
  expect(bad).toEqual([])
})

test("ADC 16-bit: V is set only for a same-sign add whose result changes sign", () => {
  const cases: Case[] = [
    [0x7fff, 0x0001, false, true, "+32767 + 1 -> -32768 overflow"],
    [0x8000, 0xffff, false, true, "-32768 + -1 -> +32767 overflow"],
    [0xffc1, 0x0180, false, false, "-63 + 384 -> 321, NO overflow"],
    [0x0180, 0x003f, false, false, "384 + 63 -> 447, no overflow"],
    [0xffff, 0x0001, true, false, "-1 + 1 + carry -> +1, NO overflow"],
    [0x0100, 0x00ff, false, false, "256 + 255 -> 511, no overflow"],
    [0x7fff, 0x0000, true, true, "+32767 + 0 + carry -> -32768 overflow"],
  ]
  const bad = run(program16, 4, cases)
  expect(bad).toEqual([])
})

