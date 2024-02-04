import { doSetBreakpoints, hitBreakpoint } from "../emulator/cpu6502";
import { setPC, setX } from "../emulator/instructions";
import { memGet, memSet } from "../emulator/memory";
import { Breakpoint, BreakpointMap, checkBreakpointExpression } from "./breakpoint";

// Test Breakpoint expression evaluation
const testBP = (expression: string) => {
  return checkBreakpointExpression(expression)
}

test('validBreakpointExpression', () => {
  expect(testBP("A == 0x20")).toEqual('')
  expect(testBP("A ==")).toEqual('Syntax error in expression')
  expect(testBP("2 + 2")).toEqual('Expression must evaluate to true or false')
  expect(testBP("A == #$2F")).toEqual('')
  expect(testBP("A == X && X == Y && Y == P && P == S")).toEqual('')
  expect(testBP("$2F == 1")).toEqual('')
  expect(testBP("$1234 == 1")).toEqual('')
})

// Test all Breakpoint properties
const bpMap: BreakpointMap = new Map()
const address = 0x2000
const bp = new Breakpoint()
bp.address = address
bpMap.set(bp.address, bp)
doSetBreakpoints(bpMap)

test('hitBreakpoint', () => {
  setPC(address)
  expect(hitBreakpoint()).toEqual(true)

  setPC(address + 1)
  expect(hitBreakpoint()).toEqual(false)
  // Add a new breakpoint right after the first one
  const bp1 = new Breakpoint()
  bp1.address = address + 1
  bpMap.set(bp1.address, bp1)
  expect(hitBreakpoint()).toEqual(true)
  bp1.once = true
  // This will remove our second breakpoint
  expect(hitBreakpoint()).toEqual(true)
  expect(hitBreakpoint()).toEqual(false)

  bp.address = address
  setPC(address)
  bp.disabled = true
  expect(hitBreakpoint()).toEqual(false)
  bp.disabled = false
  expect(hitBreakpoint()).toEqual(true)
  bp.hitcount = 3
  expect(hitBreakpoint()).toEqual(false)
  expect(hitBreakpoint()).toEqual(false)
  expect(hitBreakpoint()).toEqual(true)
  expect(hitBreakpoint()).toEqual(false)
  expect(hitBreakpoint()).toEqual(false)
  expect(hitBreakpoint()).toEqual(true)
  bp.hitcount = 0
  expect(hitBreakpoint()).toEqual(true)
  bp.expression = "X == 0x20"
  expect(hitBreakpoint()).toEqual(false)
  setX(0x20)
  expect(hitBreakpoint()).toEqual(true)
  // We can't seem to test memGet, since eval fails to recognize memGet
  // as a function. Strange because it works fine in the emulator.
  // bp.expression = "X == $20"
  // expect(hitBreakpoint()).toEqual(false)
  // memSet(0x20, 0x20)
  // expect(memGet(0x20)).toEqual(0x20)
  // expect(hitBreakpoint()).toEqual(true)
  bp.expression = "A == 0x99 && X == 0x20"
  expect(hitBreakpoint()).toEqual(false)
  bp.expression = "A == 0x99 || X == #$20"
  expect(hitBreakpoint()).toEqual(true)
  bp.expression = "bad expression"
  expect(hitBreakpoint()).toEqual(false)
  bp.expression = ''
  expect(hitBreakpoint()).toEqual(true)
})

test('watchpoints', () => {
  setPC(0x0)
  expect(hitBreakpoint()).toEqual(false)
  const bp = new Breakpoint()
  bp.address = 0x3000
  bp.watchpoint = true
  bpMap.set(bp.address, bp)
  expect(hitBreakpoint()).toEqual(false)
  memGet(0x3000, false)
  expect(hitBreakpoint()).toEqual(false)
  memGet(0x3000, true)
  expect(hitBreakpoint()).toEqual(false)
  bp.memget = true
  memGet(0x3000, false)
  expect(hitBreakpoint()).toEqual(false)
  memGet(0x3000, true)
  expect(hitBreakpoint()).toEqual(true)
  expect(hitBreakpoint()).toEqual(false)
  // breakpoint.memSet is true by default
  memSet(0x3000, 0x20)
  expect(hitBreakpoint()).toEqual(true)
  bp.memset = false
  memSet(0x3000, 0x20)
  expect(hitBreakpoint()).toEqual(false)
})
