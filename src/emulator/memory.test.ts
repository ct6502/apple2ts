import { processInstruction } from "./motherboard";
import { memGet, memSet, memory, memoryReset, memorySetForTests } from "./memory";
import { s6502, setPC } from "./instructions";
import { parseAssembly } from "./assembler";
import { toHex } from "./utility";

const executeCode = (instr: Array<string>) => {
  const start = 0x05
  let pcode = parseAssembly(start, instr)
  memory.set(pcode, start)
  setPC(start)
  while (s6502.PC < start + pcode.length) {
    processInstruction()
  }
}

type MemTest = {
  doWrite: boolean,
  expectFF: boolean,
}

const doTestMemory = (offset: number, start: number, end: number, flags: MemTest) => {
  for (let i = start; i <= end; i++) {
    if (i === 0xC0) continue
    const addr = (i * 256 + offset) % 65536
    const mem = toHex(addr)
    let instr: Array<string> = []
    const expectValue = flags.expectFF ? 0xFF : ((addr < 0xC000) ? i : memGet(addr))
    if (flags.doWrite) {
      instr = [` LDA #${i}`, ` STA $${mem}`, ` LDA $${mem}`]
    } else {
      instr = [` LDA $${mem}`]
    }
    executeCode(instr)
    expect(s6502.Accum).toEqual(expectValue);
  }
}

test('readMainMemIndex', () => {
  memorySetForTests()
  doTestMemory(0, 0, 0xFF, {doWrite: false, expectFF: false})
  doTestMemory(1, 0, 0xFF, {doWrite: false, expectFF: false})
  doTestMemory(0xFE, 0, 0xFF, {doWrite: false, expectFF: false})
  doTestMemory(0xFF, 0, 0xFF, {doWrite: false, expectFF: false})
})

test('readAuxMemEmpty', () => {
  memorySetForTests()
  // AUX read enable
  memSet(0xC003, 1)
  expect(memGet(0xC013)).toEqual(0x8d);
  doTestMemory(0, 0x02, 0xBF, {doWrite: false, expectFF: true})
  // Pages 0 and 1 should still be from MAIN
  doTestMemory(0, 0, 0x01, {doWrite: false, expectFF: false})
  // MAIN read enable
  memSet(0xC002, 1)
  expect(memGet(0xC013)).toEqual(0x0d);
})

test('readAuxMemIndex', () => {
  memorySetForTests(true)
  // AUX read enable
  memSet(0xC003, 1)
  doTestMemory(0, 0x02, 0xFF, {doWrite: false, expectFF: false})
  doTestMemory(1, 0x02, 0xFF, {doWrite: false, expectFF: false})
  doTestMemory(0xFE, 0x02, 0xFF, {doWrite: false, expectFF: false})
  doTestMemory(0xFF, 0x02, 0xFF, {doWrite: false, expectFF: false})
})

test('readMainMemEmpty', () => {
  memorySetForTests(true)
  // MAIN read enable
  memSet(0xC002, 1)
  doTestMemory(0, 0x02, 0xBF, {doWrite: false, expectFF: true})
})

test('readWriteMainMem', () => {
  memoryReset()
  doTestMemory(0, 0, 0xFF, {doWrite: true, expectFF: false})
  doTestMemory(1, 0, 0xFF, {doWrite: true, expectFF: false})
  doTestMemory(0xFE, 0, 0xFF, {doWrite: true, expectFF: false})
  doTestMemory(0xFF, 0, 0xFF, {doWrite: true, expectFF: false})
})
