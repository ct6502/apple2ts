import { BREAKPOINT_RESULT, doSetBreakpoints, hitBreakpoint } from "../cpu6502"
import { BRK_ILLEGAL_65C02, BRK_INSTR, BreakpointMap, BreakpointNew } from "../../common/breakpoint"
import { opCodes } from "../../common/opcodes"


const bpMap: BreakpointMap = new BreakpointMap()
doSetBreakpoints(bpMap)

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

// TODO: Need to do tests...

