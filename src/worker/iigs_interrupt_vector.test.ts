import { CPU65816, VEC_E_IRQ, VEC_N_BRK, VEC_N_IRQ } from "./cpu65816"

// The IIgs fetches its native-mode vectors from bank $FF ROM but GS/OS keeps a
// shadow-ROM copy in bank-0 RAM while booting. The CPU must not treat those
// shadow bytes as installed handlers: doing so sent the first COP/BRK/IRQ into
// garbage and GS/OS aborted with "Fatal System Error $0308". The emulation-mode
// IRQ/BRK vector at $FFFE is genuinely writable RAM, so a handler installed
// there (e.g. the Mockingboard MBSI driver) must still win.

const makeCpu = () => {
  const ram = new Uint8Array(0x10000)
  const rom = new Uint8Array(0x10000)
  const cpu = new CPU65816(
    (address: number) => ram[address & 0xFFFF],
    (address: number, value: number) => { ram[address & 0xFFFF] = value & 0xFF },
  )
  cpu.setVectorReadCallback((address: number) => rom[address & 0xFFFF])
  cpu.S = 0x01FF
  cpu.P = 0x30
  cpu.PC = 0x0100
  return { cpu, ram, rom }
}

const setVector = (memory: Uint8Array, address: number, value: number) => {
  memory[address] = value & 0xFF
  memory[address + 1] = (value >> 8) & 0xFF
}

const interrupt = (cpu: CPU65816, nativeVector: number, emulationVector: number, software: boolean) =>
  // interrupt() is the private vector-pull entry point; call it directly so the
  // test exercises the real push/vector logic without running guest code first.
  (cpu as unknown as {
    interrupt: (native: number, emulation: number, software: boolean) => void
  }).interrupt(nativeVector, emulationVector, software)

test("native IRQ ignores the bank-0 shadow-ROM bytes and resumes on the ROM vector", () => {
  const { cpu, ram, rom } = makeCpu()
  cpu.emulationMode = false
  setVector(rom, VEC_N_IRQ, 0xC074)
  setVector(ram, VEC_N_IRQ, 0x0800) // shadow-ROM byte pair, not a handler
  interrupt(cpu, VEC_N_IRQ, VEC_E_IRQ, false)
  expect(cpu.PB).toBe(0)
  expect(cpu.PC).toBe(0xC074)
  expect(cpu.waiting).toBe(false)
})

test("native BRK ignores the bank-0 shadow-ROM bytes and resumes on the ROM vector", () => {
  const { cpu, ram, rom } = makeCpu()
  cpu.emulationMode = false
  setVector(rom, VEC_N_BRK, 0xC071)
  setVector(ram, VEC_N_BRK, 0xFCB7)
  interrupt(cpu, VEC_N_BRK, VEC_E_IRQ, true)
  expect(cpu.PB).toBe(0)
  expect(cpu.PC).toBe(0xC071)
})

test("emulation IRQ honours a handler written into bank-0 $FFFE", () => {
  const { cpu, ram, rom } = makeCpu()
  cpu.emulationMode = true
  setVector(rom, VEC_E_IRQ, 0xC0F0)
  setVector(ram, VEC_E_IRQ, 0x1D72) // Mockingboard MBSI handler
  interrupt(cpu, VEC_N_IRQ, VEC_E_IRQ, false)
  expect(cpu.PB).toBe(0)
  expect(cpu.PC).toBe(0x1D72)
})

test("emulation IRQ falls back to the ROM vector when $FFFE is uninitialised", () => {
  const { cpu, ram, rom } = makeCpu()
  cpu.emulationMode = true
  setVector(rom, VEC_E_IRQ, 0xC0F0)
  ram[VEC_E_IRQ] = 0xFF
  ram[VEC_E_IRQ + 1] = 0xFF
  interrupt(cpu, VEC_N_IRQ, VEC_E_IRQ, false)
  expect(cpu.PB).toBe(0)
  expect(cpu.PC).toBe(0xC0F0)
})
