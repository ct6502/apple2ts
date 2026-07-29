import { BREAKPOINT_RESULT, doSetBreakpoints, hitBreakpoint } from "../cpu6502"
import { BRK_ILLEGAL_65C02, BRK_INSTR, BreakpointMap, BreakpointNew } from "../../common/breakpoint"
import { setPC } from "../instructions"
import { memSet } from "../memory"
import { opCodes } from "../../common/opcodes"


const bpMap: BreakpointMap = new BreakpointMap()
doSetBreakpoints(bpMap)
const testOpcode = 0xEA

const setInstructionBreakpoint = (memoryBank: string, pc: number) => {
  bpMap.clear()
  const bp = BreakpointNew()
  bp.address = testOpcode | BRK_INSTR
  bp.instruction = true
  bp.memoryBank = memoryBank
  bpMap.set(bp.address, bp)
  setPC(pc)
}

const expectInstructionBreakpoint = (result: BREAKPOINT_RESULT) => {
  expect(hitBreakpoint(testOpcode, 0)).toEqual(result)
}

// ************ Instructions - test all properties ************

test("hitInstruction BRK", () => {
  // Simple test for BRK
  const opcode = 0
  const bp = BreakpointNew()
  bp.instruction = true
  bp.address = opcode | BRK_INSTR
  bpMap.set(bp.address, bp)
  expect(hitBreakpoint()).toEqual(BREAKPOINT_RESULT.NO_BREAK)
  expect(hitBreakpoint(opcode, 0)).toEqual(BREAKPOINT_RESULT.BREAK)
  // Make sure all opcodes other than BRK do not hit breakpoint
  for (let i = 1; i < 256; i++) {
    expect(hitBreakpoint(i, 0)).toEqual(BREAKPOINT_RESULT.NO_BREAK)
  }
})

test("hitInstruction All Opcodes", () => {
  // Now test all opcodes
  for (let i = 0; i < 256; i++) {
    bpMap.clear()
    const bp = BreakpointNew()
    bp.instruction = true
    bp.address = i | BRK_INSTR
    bpMap.set(bp.address, bp)
    expect(hitBreakpoint(i, 0)).toEqual(BREAKPOINT_RESULT.BREAK)
    if (i > 0) {
      expect(hitBreakpoint(i - 1, 0)).toEqual(BREAKPOINT_RESULT.NO_BREAK)
    }
  }
})

test("hitInstruction Illegal Opcodes", () => {
  // Now test all illegal opcodes
  bpMap.clear()
  const bp = BreakpointNew()
  bp.instruction = true
  bp.address = BRK_ILLEGAL_65C02
  bpMap.set(bp.address, bp)
  for (let i = 0; i < 256; i++) {
    if (!opCodes[i]) {
      expect(hitBreakpoint(i, 0)).toEqual(BREAKPOINT_RESULT.BREAK)
    } else {
      expect(hitBreakpoint(i, 0)).toEqual(BREAKPOINT_RESULT.NO_BREAK)
    }
  }
})

test("hitInstruction with hexvalue", () => {
  for (let i = 0; i < 256; i++) {
    bpMap.clear()
    const bp = BreakpointNew()
    bp.instruction = true
    bp.address = i | BRK_INSTR
    bp.hexvalue = 0xCD
    bpMap.set(bp.address, bp)
    // Some instructions may ignore the hexvalue,
    // but they should all hit it if the hexvalue matches.
    expect(hitBreakpoint(i, 0xCD)).toEqual(BREAKPOINT_RESULT.BREAK)
    // Implied mode instructions have length 1 byte
    if (opCodes[i] && opCodes[i].bytes === 1) {
      // cpu6502 will pass in -1 for implied mode hex values  
      expect(hitBreakpoint(i, -1)).toEqual(BREAKPOINT_RESULT.BREAK)
    } else {
      expect(hitBreakpoint(i, 0xCE)).toEqual(BREAKPOINT_RESULT.NO_BREAK)
    }
  }
})

// ************ Instructions memory bank ************

test.each([
  ["MAIN", 0xC002, 0xC003],
  ["AUX", 0xC003, 0xC002]
])("hitInstruction memory bank %s", (memoryBank, matchingSwitch, nonmatchingSwitch) => {
  setInstructionBreakpoint(memoryBank, 0x0300)

  memSet(nonmatchingSwitch, 1)
  expectInstructionBreakpoint(BREAKPOINT_RESULT.NO_BREAK)
  memSet(matchingSwitch, 1)
  expectInstructionBreakpoint(BREAKPOINT_RESULT.BREAK)
})

test("hitInstruction memory bank ROM", () => {
  setInstructionBreakpoint("ROM", 0xD000)

  memSet(0xC083, 1)  // enable R/W RAM, bank 2
  expectInstructionBreakpoint(BREAKPOINT_RESULT.NO_BREAK)
  memSet(0xC082, 1)  // enable ROM
  expectInstructionBreakpoint(BREAKPOINT_RESULT.BREAK)
})

test.each([
  ["MAIN-DXXX-1", 0xC008, 0xC009, 0xC08B, 0xC083],
  ["MAIN-DXXX-2", 0xC008, 0xC009, 0xC083, 0xC08B],
  ["AUX-DXXX-1", 0xC009, 0xC008, 0xC08B, 0xC083],
  ["AUX-DXXX-2", 0xC009, 0xC008, 0xC083, 0xC08B]
])("hitInstruction memory bank %s",
  (memoryBank, matchingRam, nonmatchingRam, matchingBank, nonmatchingBank) => {
    setInstructionBreakpoint(memoryBank, 0xD000)

    memSet(matchingRam, 1)
    memSet(matchingBank, 1)
    expectInstructionBreakpoint(BREAKPOINT_RESULT.BREAK)

    memSet(nonmatchingBank, 1)
    expectInstructionBreakpoint(BREAKPOINT_RESULT.NO_BREAK)

    memSet(matchingBank, 1)
    memSet(nonmatchingRam, 1)
    expectInstructionBreakpoint(BREAKPOINT_RESULT.NO_BREAK)
  }
)

test.each([
  ["CXXX-ROM", 0xC007, 0xC006],
  ["CXXX-CARD", 0xC006, 0xC007]
])("hitInstruction memory bank %s", (memoryBank, matchingSwitch, nonmatchingSwitch) => {
  setInstructionBreakpoint(memoryBank, 0xC100)

  memSet(nonmatchingSwitch, 1)
  expectInstructionBreakpoint(BREAKPOINT_RESULT.NO_BREAK)
  memSet(matchingSwitch, 1)
  expectInstructionBreakpoint(BREAKPOINT_RESULT.BREAK)
})
