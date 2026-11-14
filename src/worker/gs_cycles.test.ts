import { CPU65816 } from "./cpu65816"
import { doSetMachineName, doSetRunMode, doSetSpeedMode, doBoot, getCPU } from "./motherboard"
import { RUN_MODE } from "../common/utility"
import { setIsTesting } from "./worker2main"

// The Apple IIgs is a 6502-compatible machine when it is running 8-bit code,
// which is exactly what any old IIe game does. Before this was measured, the
// 65816 core charged every instruction one cycle, so the IIgs burned its
// identical 17030-cycle frame budget roughly 5x faster than the IIe and every
// old game ran far too fast.
//
// The numbers below are the published 6502 cycle counts, checked against the
// emulation-mode core - i.e. exactly the timing the Mega II gives 8-bit
// software. If the IIgs disagrees with the IIe here, it disagrees in the
// game, which is why this test exists.
describe("CPU65816 emulation mode cycle counts (8-bit / IIe compatible)", () => {
  const CODE = 0x8000
  const CODE_CROSS = 0x80F0
  // Base addresses for the absolute tests, chosen so a small index either
  // stays inside a page or crosses into the next one.
  const ABS_NOCROSS = 0x9000
  const ABS_CROSS = 0x90F0
  const INDEX = 0x20
  // Direct page pointer locations for the indirect tests.
  const PTR_NOCROSS = 0x30
  const PTR_CROSS = 0x44

  let cpu: CPU65816
  let mem: Uint8Array

  const runOne = (bytes: number[], address = CODE, flags = 0x31) => {
    for (let i = 0; i < bytes.length; i++) mem[address + i] = bytes[i]
    cpu.reset()
    // reset() reinitialises everything, so apply the wanted state after it.
    cpu.PC = address
    cpu.PB = 0
    cpu.DB = 0
    cpu.D = 0
    cpu.A = 0
    cpu.X = INDEX
    cpu.Y = INDEX
    cpu.S = 0x01FF
    cpu.P = flags // emulation mode, 8-bit A/X/Y, I set
    // Seed memory so page crossings are deterministic.
    mem[ABS_NOCROSS] = 0
    mem[ABS_NOCROSS + 0xFF] = 0
    mem[ABS_CROSS] = 0
    mem[PTR_NOCROSS] = ABS_NOCROSS & 0xFF
    mem[PTR_NOCROSS + 1] = ABS_NOCROSS >> 8
    mem[PTR_CROSS] = ABS_CROSS & 0xFF
    mem[PTR_CROSS + 1] = ABS_CROSS >> 8
    return cpu.processInstruction(null)
  }

  beforeEach(() => {
    mem = new Uint8Array(0x1000000)
    cpu = new CPU65816((address) => mem[address], (address, value) => {
      mem[address] = value & 0xFF
    })
  })

  const cases: [string, number[], number | undefined][] = [
    // Implied - one byte, no operand.
    ["NOP", [0xEA], undefined],
    ["BCS taken, same page", [0xB0, 0x10], undefined],
    ["BCS not taken", [0x90, 0x00], undefined],
    ["CLC", [0x18], undefined],
    ["SEC", [0x38], undefined],
    ["CLI", [0x58], undefined],
    ["SEI", [0x78], undefined],
    ["CLD", [0xD8], undefined],
    ["INX", [0xE8], undefined],
    ["DEX", [0xCA], undefined],
    ["INY", [0xC8], undefined],
    ["DEY", [0x88], undefined],
    ["TAX", [0xAA], undefined],
    ["TXA", [0x8A], undefined],
    ["TAY", [0xA8], undefined],
    ["TYA", [0x98], undefined],
    ["TSX", [0xBA], undefined],
    ["ASL A", [0x0A], undefined],
    ["LSR A", [0x4A], undefined],
    ["ROL A", [0x2A], undefined],
    ["ROR A", [0x6A], undefined],

    // Zero page.
    ["LDA zp", [0xA5, 0x10], undefined],
    ["STA zp", [0x85, 0x10], undefined],
    ["ADC zp", [0x65, 0x10], undefined],
    ["AND zp", [0x25, 0x10], undefined],
    ["ORA zp", [0x05, 0x10], undefined],
    ["EOR zp", [0x45, 0x10], undefined],
    ["CMP zp", [0xC5, 0x10], undefined],
    ["LDX zp", [0xA6, 0x10], undefined],
    ["LDY zp", [0xA4, 0x10], undefined],
    ["STX zp", [0x86, 0x10], undefined],
    ["STY zp", [0x84, 0x10], undefined],
    ["CPX zp", [0xE4, 0x10], undefined],
    ["CPY zp", [0xC4, 0x10], undefined],
    ["BIT zp", [0x24, 0x10], undefined],
    ["INC zp", [0xE6, 0x10], undefined],
    ["DEC zp", [0xC6, 0x10], undefined],
    ["ASL zp", [0x06, 0x10], undefined],
    ["LSR zp", [0x46, 0x10], undefined],
    ["ROL zp", [0x26, 0x10], undefined],
    ["ROR zp", [0x66, 0x10], undefined],

    // Zero page,X. In emulation mode these cost exactly what the 6502's
    // zp,X costs, because the direct page is page zero and the access wraps.
    ["LDA zp,X", [0xB5, 0x10], undefined],
    ["STA zp,X", [0x95, 0x10], undefined],
    ["ADC zp,X", [0x75, 0x10], undefined],
    ["LDY zp,X", [0xB4, 0x10], undefined],
    ["INC zp,X", [0xF6, 0x10], undefined],
    ["DEC zp,X", [0xD6, 0x10], undefined],
    ["ASL zp,X", [0x16, 0x10], undefined],

    // Absolute. The low operand byte is 0x00 or 0xF0 so the effective address
    // is one of the two seeded bases; INDEX then decides whether it crosses.
    ["LDA abs", [0xAD, 0x00, 0x90], undefined],
    ["STA abs", [0x8D, 0x00, 0x90], undefined],
    ["ADC abs", [0x6D, 0x00, 0x90], undefined],
    ["AND abs", [0x2D, 0x00, 0x90], undefined],
    ["ORA abs", [0x0D, 0x00, 0x90], undefined],
    ["EOR abs", [0x4D, 0x00, 0x90], undefined],
    ["CMP abs", [0xCD, 0x00, 0x90], undefined],
    ["LDX abs", [0xAE, 0x00, 0x90], undefined],
    ["LDY abs", [0xAC, 0x00, 0x90], undefined],
    ["STX abs", [0x8E, 0x00, 0x90], undefined],
    ["CPX abs", [0xEC, 0x00, 0x90], undefined],
    ["CPY abs", [0xCC, 0x00, 0x90], undefined],
    ["BIT abs", [0x2C, 0x00, 0x90], undefined],
    ["INC abs", [0xEE, 0x00, 0x90], undefined],
    ["DEC abs", [0xCE, 0x00, 0x90], undefined],
    ["ASL abs", [0x0E, 0x00, 0x90], undefined],
    ["ROL abs", [0x2E, 0x00, 0x90], undefined],

    // Absolute,X / ,Y.
    ["LDA abs,X no cross", [0xBD, 0x00, 0x90], undefined],
    ["LDA abs,X cross", [0xBD, 0xF0, 0x90], undefined],
    ["LDA abs,Y no cross", [0xB9, 0x00, 0x90], undefined],
    ["LDA abs,Y cross", [0xB9, 0xF0, 0x90], undefined],
    ["ADC abs,X cross", [0x7D, 0xF0, 0x90], undefined],
    ["ADC abs,Y cross", [0x79, 0xF0, 0x90], undefined],
    ["LDX abs,Y cross", [0xBE, 0xF0, 0x90], undefined],
    ["STA abs,X", [0x9D, 0x00, 0x90], undefined],
    ["STA abs,Y", [0x99, 0x00, 0x90], undefined],
    ["INC abs,X", [0xFE, 0x00, 0x90], undefined],
    ["DEC abs,X", [0xDE, 0x00, 0x90], undefined],
    ["ASL abs,X", [0x1E, 0x00, 0x90], undefined],

    // Indexed indirect and indirect indexed.
    ["LDA (zp,X)", [0xA1, 0x24], undefined],
    ["STA (zp,X)", [0x81, 0x24], undefined],
    ["LDA (zp),Y no cross", [0xB1, PTR_NOCROSS], undefined],
    ["LDA (zp),Y cross", [0xB1, PTR_CROSS], undefined],
    ["STA (zp),Y", [0x91, PTR_NOCROSS], undefined],

    // Immediate.
    ["LDA #imm", [0xA9, 0x12], undefined],
    ["ADC #imm", [0x69, 0x12], undefined],
    ["AND #imm", [0x29, 0x12], undefined],
    ["CPX #imm", [0xE0, 0x12], undefined],
    ["CPY #imm", [0xC0, 0x12], undefined],
    ["LDY #imm", [0xA0, 0x12], undefined],

    // Branches have their own tests below, because the branch condition has to
    // be satisfied for the cycle count to be meaningful.

    // Stack.
    ["PHA", [0x48], undefined],
    ["PLA", [0x68], undefined],
    ["PHP", [0x08], undefined],
    ["PLP", [0x28], undefined],

    // Jumps and calls.
    ["JMP abs", [0x4C, 0x00, 0x90], undefined],
    ["JMP (abs)", [0x6C, 0x00, 0x90], undefined],
    ["JSR abs", [0x20, 0x00, 0x90], undefined],
  ]

  // [name, bytes, override address, expected cycles]
  const cycles: Record<string, number> = {
    "NOP": 2,
    "BCS taken, same page": 3,
    "BCS not taken": 2,
    "CLC": 2, "SEC": 2, "CLI": 2, "SEI": 2, "CLD": 2,
    "INX": 2, "DEX": 2, "INY": 2, "DEY": 2,
    "TAX": 2, "TXA": 2, "TAY": 2, "TYA": 2, "TSX": 2,
    "ASL A": 2, "LSR A": 2, "ROL A": 2, "ROR A": 2,

    "LDA zp": 3, "STA zp": 3, "ADC zp": 3, "AND zp": 3, "ORA zp": 3,
    "EOR zp": 3, "CMP zp": 3, "LDX zp": 3, "LDY zp": 3, "STX zp": 3,
    "STY zp": 3, "CPX zp": 3, "CPY zp": 3, "BIT zp": 3,
    "INC zp": 5, "DEC zp": 5, "ASL zp": 5, "LSR zp": 5, "ROL zp": 5, "ROR zp": 5,

    "LDA zp,X": 4, "STA zp,X": 4, "ADC zp,X": 4, "LDY zp,X": 4,
    "INC zp,X": 6, "DEC zp,X": 6, "ASL zp,X": 6,

    "LDA abs": 4, "STA abs": 4, "ADC abs": 4, "AND abs": 4, "ORA abs": 4,
    "EOR abs": 4, "CMP abs": 4, "LDX abs": 4, "LDY abs": 4, "STX abs": 4,
    "CPX abs": 4, "CPY abs": 4, "BIT abs": 4,
    "INC abs": 6, "DEC abs": 6, "ASL abs": 6, "ROL abs": 6,

    "LDA abs,X no cross": 4, "LDA abs,X cross": 5,
    "LDA abs,Y no cross": 4, "LDA abs,Y cross": 5,
    "ADC abs,X cross": 5, "ADC abs,Y cross": 5,
    "LDX abs,Y cross": 5,
    "STA abs,X": 5, "STA abs,Y": 5,
    "INC abs,X": 7, "DEC abs,X": 7, "ASL abs,X": 7,

    "LDA (zp,X)": 6, "STA (zp,X)": 6,
    "LDA (zp),Y no cross": 5, "LDA (zp),Y cross": 6,
    "STA (zp),Y": 6,

    "LDA #imm": 2, "ADC #imm": 2, "AND #imm": 2,
    "CPX #imm": 2, "CPY #imm": 2, "LDY #imm": 2,

    "PHA": 3, "PLA": 4, "PHP": 3, "PLP": 4,

    "JMP abs": 3, "JMP (abs)": 5, "JSR abs": 6,
  }

  test.each(cases)("%s", (name, bytes, address) => {
    expect(runOne(bytes, address)).toBe(cycles[name])
  })

  test("RTS returns six cycles", () => {
    // Seed a return address on the stack first: PCL at $01FF, PCH at $01FE.
    mem[0x01FF] = 0x00
    mem[0x01FE] = 0x12
    cpu.S = 0x01FD
    expect(runOne([0x60])).toBe(6)
  })

  // Branches are tested separately because the condition flags decide whether
  // the branch is taken at all, and only a taken branch costs the extra cycle.
  test("BCC taken, same page", () => {
    expect(runOne([0x90, 0x10], CODE, 0x30)).toBe(3)
  })

  test("BCC taken, page cross", () => {
    expect(runOne([0x90, 0x40], CODE_CROSS, 0x30)).toBe(4)
  })

  test("BEQ taken, page cross", () => {
    expect(runOne([0xF0, 0x40], CODE_CROSS, 0x32)).toBe(4)
  })

  test("BCC not taken", () => {
    expect(runOne([0x90, 0x10], CODE, 0x31)).toBe(2)
  })
})

describe("CPU65816 native mode cycle counts", () => {
  const CODE = 0x8000

  let cpu: CPU65816
  let mem: Uint8Array

  const run = (bytes: number[], m16: boolean) => {
    for (let i = 0; i < bytes.length; i++) mem[CODE + i] = bytes[i]
    cpu.reset()
    cpu.emulationMode = false
    cpu.P = 0x04 // native mode, I set
    cpu.PC = CODE
    cpu.PB = 0
    cpu.DB = 0
    cpu.D = 0
    cpu.A = 0
    cpu.X = 0
    cpu.Y = 0
    cpu.S = 0x1FFF
    cpu.P = (cpu.P & ~0x30) | (m16 ? 0x00 : 0x30) // M and X flags
    cpu.P |= 0x04 // I flag
    return cpu.processInstruction(null)
  }

  beforeEach(() => {
    mem = new Uint8Array(0x1000000)
    cpu = new CPU65816((address) => mem[address], (address, value) => {
      mem[address] = value & 0xFF
    })
  })

  // [name, bytes, 16-bit accumulator, expected cycles]
  const cases: [string, number[], boolean, number][] = [
    // 8-bit accumulator.
    ["STZ abs", [0x9C, 0x00, 0x90], false, 4],
    ["STA abs", [0x8D, 0x00, 0x90], false, 4],
    ["LDA abs", [0xAD, 0x00, 0x90], false, 4],
    ["PHA", [0x48], false, 3],
    ["PLA", [0x68], false, 4],
    ["PHB", [0x8B], false, 3],
    ["PLB", [0xAB], false, 4],
    ["PHK", [0x4B], false, 3],
    ["JML abs", [0x5C, 0x00, 0x90, 0x01], false, 4],
    ["PEA", [0xF4, 0x12, 0x34], false, 5],
    ["PER", [0x62, 0x12, 0x00], false, 6],
    ["BRA taken", [0x80, 0x10], false, 3],

    // 16-bit accumulator - one more bus cycle than 8-bit.
    ["LDA #imm 16-bit", [0xA9, 0x34, 0x12], true, 3],
    ["LDA abs 16-bit", [0xAD, 0x00, 0x90], true, 5],
    ["STA abs 16-bit", [0x8D, 0x00, 0x90], true, 5],
    ["LDA long 16-bit", [0xAF, 0x00, 0x90, 0x00], true, 6],
    ["STZ abs 16-bit", [0x9C, 0x00, 0x90], true, 5],
    ["PHA 16-bit", [0x48], true, 4],
    ["PLA 16-bit", [0x68], true, 5],
    ["PHD", [0x0B], true, 4],
    ["PLD", [0x2B], true, 5],
  ]

  test.each(cases)("%s", (_name, bytes, m16, expected) => {
    expect(run(bytes, m16)).toBe(expected)
  })

  test("JSL is eight cycles", () => {
    expect(run([0x22, 0x00, 0x90, 0x01], false)).toBe(8)
  })

  test("RTS is six cycles", () => {
    expect(run([0x60], false)).toBe(6)
  })

  test("RTL is six cycles", () => {
    expect(run([0x6B], false)).toBe(6)
  })

  test("MVN charges seven for the first byte and six after that", () => {
    // A starts at zero, so one MVN pass decrements it to $FFFF and finishes.
    expect(run([0x54, 0x05, 0x01], false)).toBe(7)
  })

  // A block move re-executes the same MVN opcode, so the per-pass cycle count
  // is state that lives in the CPU between consecutive passes.
  const prepareMove = (count: number) => {
    for (let i = 0; i < 3; i++) mem[CODE + i] = [0x54, 0x05, 0x01][i]
    cpu.reset()
    cpu.emulationMode = false
    cpu.P = 0x04
    cpu.PC = CODE
    cpu.PB = 0
    cpu.A = count
    cpu.X = 0x1000
    cpu.Y = 0x2000
    cpu.S = 0x1FFF
    cpu.P |= 0x20 // 8-bit accumulator
    cpu.P |= 0x10 // 8-bit index registers
    cpu.P |= 0x04
  }

  const moveStep = () => cpu.processInstruction(null)

  test("MVN moves one byte per pass: seven for the first, six after that", () => {
    prepareMove(0x0004)
    expect(moveStep()).toBe(7)
    expect(cpu.A).toBe(0x0003)
    // PC has been rewound to re-execute the same MVN for the next byte.
    expect(cpu.PC).toBe(CODE)
    expect(moveStep()).toBe(6)
    expect(moveStep()).toBe(6)
    expect(moveStep()).toBe(6)
    expect(moveStep()).toBe(6)
    // A wrapped to $FFFF, so the move finished and PC stops rewinding.
    expect(cpu.A).toBe(0xFFFF)
    expect(cpu.PC).toBe(CODE + 3)
  })

  test("a new MVN starts a fresh pass at seven cycles again", () => {
    prepareMove(0x0002)
    expect(moveStep()).toBe(7)
    expect(moveStep()).toBe(6)
    // This is the last pass of the move: A wraps to $FFFF and the move ends.
    expect(moveStep()).toBe(6)
    expect(cpu.A).toBe(0xFFFF)
    expect(cpu.PC).toBe(CODE + 3)
    // A brand new block move starts over at seven again.
    prepareMove(0x0002)
    expect(moveStep()).toBe(7)
    expect(moveStep()).toBe(6)
  })
})

// The instruction-level tables above pin individual opcodes. This measures the
// whole boot, which is the case that actually matters: both machines' ROM boot
// code is 8-bit and runs in 6502 emulation mode, so the instructions-per-cycle
// ratio has to agree. If the IIgs is higher, 8-bit software is running too fast
// for the cycle budget the run loop hands its CPU, which is exactly why a
// 17030-cycle frame used to run old games at roughly 5x speed.
describe("Apple IIgs 8-bit boot costs the same as the Apple IIe", () => {
  const measureBoot = (machine: "APPLE2EE" | "APPLE2GS", instrLimit: number) => {
    doSetMachineName(machine)
    doSetSpeedMode(0) // Normal / 1.02 MHz
    doBoot()
    doSetRunMode(RUN_MODE.RUNNING, false)
    const cpu = getCPU() as unknown as { processInstruction: (cb?: unknown) => number }
    const orig = cpu.processInstruction.bind(cpu)
    let instrCount = 0
    let cycles = 0
    cpu.processInstruction = (cb?: unknown) => {
      if (instrCount >= instrLimit) return -1
      const c = orig(cb)
      instrCount++
      cycles += c
      return c
    }
    jest.advanceTimersByTime(16.6881 * 400)
    cpu.processInstruction = orig
    doSetRunMode(RUN_MODE.PAUSED, false)
    return instrCount / cycles
  }

  beforeEach(() => {
    setIsTesting()
    jest.useFakeTimers()
  })

  afterEach(() => {
    doSetRunMode(RUN_MODE.PAUSED, false)
    doSetMachineName("APPLE2EE")
    jest.useRealTimers()
  })

  test("the IIgs burns 8-bit code at the same rate per instruction", () => {
    const iie = measureBoot("APPLE2EE", 60000)
    const gs = measureBoot("APPLE2GS", 60000)
    // The two ROMs are different programs, so allow a little slack either way;
    // what matters is that they are the same order of magnitude.
    expect(gs).toBeGreaterThan(iie - 0.02)
    expect(gs).toBeLessThan(iie + 0.02)
  })
})
