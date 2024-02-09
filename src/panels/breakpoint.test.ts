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
const bpMap: BreakpointMap = new BreakpointMap()
doSetBreakpoints(bpMap)

// ************ Breakpoints ************

test('hitBreakpoint', () => {
  const address = 0x2000
  const bp = new Breakpoint()
  bp.address = address
  bpMap.set(bp.address, bp)
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


// ************ Watchpoints ************

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


// ************ Breakpoints memory bank ************

test('memory banks address range', () => {
  const bp = new Breakpoint()
  bp.address = 0xF800
  setPC(bp.address)
  bp.memoryBank = "MAIN-DXXX-1"
  bpMap.set(bp.address, bp)
  memSet(0xC08B, 1)  // enable banked RAM, DXXX bank 1
  expect(hitBreakpoint()).toEqual(false)
  bpMap.clear()
  bp.address = 0xD000
  bpMap.set(bp.address, bp)
  setPC(bp.address)
  expect(hitBreakpoint()).toEqual(true)
  bp.address = 0xDFFF
  setPC(bp.address)
  bpMap.clear()
  bpMap.set(bp.address, bp)
  expect(hitBreakpoint()).toEqual(true)
})

test('memory banks MAIN', () => {
  bpMap.clear()
  const bp = new Breakpoint()
  bp.address = 0x300
  setPC(bp.address)
  bp.memoryBank = "MAIN"
  bpMap.set(bp.address, bp)
  memSet(0xC002, 1)  // enable Main memory $200-$BFFF
  expect(hitBreakpoint()).toEqual(true)
  memSet(0xC003, 1)  // enable Aux memory $200-$BFFF
  expect(hitBreakpoint()).toEqual(false)

  bp.address = 0x100
  setPC(bp.address)
  bpMap.clear()
  bpMap.set(bp.address, bp)
  memSet(0xC008, 1)  // enable Main memory $0-$1FF, $D000-$FFFF
  expect(hitBreakpoint()).toEqual(true)

  bp.address = 0xD000
  setPC(bp.address)
  bpMap.clear()
  bpMap.set(bp.address, bp)
  expect(hitBreakpoint()).toEqual(true)
  memSet(0xC009, 1)  // enable Aux memory $0-$1FF, $D000-$FFFF
  expect(hitBreakpoint()).toEqual(false)
  bp.address = 0x100
  expect(hitBreakpoint()).toEqual(false)

  bp.address = 0xD000
  setPC(bp.address)
  bpMap.clear()
  bpMap.set(bp.address, bp)
  memSet(0xC008, 1)  // enable Main memory $0-$1FF, $D000-$FFFF
  memSet(0xC08B, 1)  // enable RAM $D000-$FFFF
  expect(hitBreakpoint()).toEqual(true)
  memSet(0xC08A, 1)  // enable ROM $D000-$FFFF
  expect(hitBreakpoint()).toEqual(false)
})

test('memory banks AUX', () => {
  bpMap.clear()
  const bp = new Breakpoint()
  bp.address = 0x300
  setPC(bp.address)
  bp.memoryBank = "AUX"
  bpMap.set(bp.address, bp)
  memSet(0xC002, 1)  // enable Main memory $200-$BFFF
  expect(hitBreakpoint()).toEqual(false)
  memSet(0xC003, 1)  // enable Aux memory $200-$BFFF
  expect(hitBreakpoint()).toEqual(true)

  bp.address = 0x100
  setPC(bp.address)
  bpMap.clear()
  bpMap.set(bp.address, bp)
  memSet(0xC002, 1)  // enable Main memory $200-$BFFF
  memSet(0xC008, 1)  // enable Main memory $0-$1FF, $D000-$FFFF
  expect(hitBreakpoint()).toEqual(false)

  bp.address = 0xD000
  setPC(bp.address)
  bpMap.clear()
  bpMap.set(bp.address, bp)
  expect(hitBreakpoint()).toEqual(false)
  memSet(0xC009, 1)  // enable Aux memory $0-$1FF, $D000-$FFFF
  memSet(0xC08A, 1)  // enable ROM $D000-$FFFF
  // Still false because ROM is enabled, not Aux RAM
  expect(hitBreakpoint()).toEqual(false)
  memSet(0xC08B, 1)  // enable RAM $D000-$FFFF
  expect(hitBreakpoint()).toEqual(true)
  memSet(0xC008, 1)  // enable Main memory $0-$1FF, $D000-$FFFF
})

test('memory banks ROM', () => {
  bpMap.clear()
  const bp = new Breakpoint()
  bp.address = 0xD000
  setPC(bp.address)
  bp.memoryBank = "ROM"
  bpMap.set(bp.address, bp)

  // Active Bank 2
  memSet(0xC080, 1)  // enable read RAM, no write
  expect(hitBreakpoint()).toEqual(false)
  memSet(0xC081, 1)  // enable read ROM, write RAM
  expect(hitBreakpoint()).toEqual(true)
  memSet(0xC082, 1)  // enable ROM
  expect(hitBreakpoint()).toEqual(true)
  memSet(0xC083, 1)  // enable R/W RAM
  expect(hitBreakpoint()).toEqual(false)

  // Active Bank 1
  memSet(0xC088, 1)  // enable read RAM, no write
  expect(hitBreakpoint()).toEqual(false)
  memSet(0xC089, 1)  // enable read ROM, write RAM
  expect(hitBreakpoint()).toEqual(true)
  memSet(0xC08A, 1)  // enable ROM
  expect(hitBreakpoint()).toEqual(true)
  memSet(0xC08B, 1)  // enable R/W RAM
  expect(hitBreakpoint()).toEqual(false)
})

test('memory banks MAIN-DXXX-1', () => {
  bpMap.clear()
  const bp = new Breakpoint()
  bp.address = 0xD000
  setPC(bp.address)
  bp.memoryBank = "MAIN-DXXX-1"
  bpMap.set(bp.address, bp)
  memSet(0xC08A, 1)  // enable ROM, not banked RAM
  expect(hitBreakpoint()).toEqual(false)
  memSet(0xC08B, 1)  // enable R/W banked RAM, DXXX bank 1
  expect(hitBreakpoint()).toEqual(true)
  memSet(0xC088, 1)  // enable R banked RAM, DXXX bank 1
  expect(hitBreakpoint()).toEqual(true)
  memSet(0xC083, 1)  // enable bank 2
  expect(hitBreakpoint()).toEqual(false)
  memSet(0xC08B, 1)  // enable R/W banked RAM, DXXX bank 1
  memSet(0xC009, 1)  // enable Aux memory $0-$1FF, $D000-$FFFF
  expect(hitBreakpoint()).toEqual(false)
  memSet(0xC008, 1)  // enable Main memory $0-$1FF, $D000-$FFFF
  expect(hitBreakpoint()).toEqual(true)
})

test('memory banks MAIN-DXXX-2', () => {
  bpMap.clear()
  const bp = new Breakpoint()
  bp.address = 0xD000
  setPC(bp.address)
  bp.memoryBank = "MAIN-DXXX-2"
  bpMap.set(bp.address, bp)
  memSet(0xC082, 1)  // enable ROM, not banked RAM
  expect(hitBreakpoint()).toEqual(false)
  memSet(0xC083, 1)  // enable R/W banked RAM, DXXX bank 2
  expect(hitBreakpoint()).toEqual(true)
  memSet(0xC080, 1)  // enable R banked RAM, DXXX bank 2
  expect(hitBreakpoint()).toEqual(true)
  memSet(0xC08B, 1)  // enable bank 2
  expect(hitBreakpoint()).toEqual(false)
  memSet(0xC083, 1)  // enable R/W banked RAM, DXXX bank 2
  memSet(0xC009, 1)  // enable Aux memory $0-$1FF, $D000-$FFFF
  expect(hitBreakpoint()).toEqual(false)
  memSet(0xC008, 1)  // enable Main memory $0-$1FF, $D000-$FFFF
  expect(hitBreakpoint()).toEqual(true)
})

test('memory banks AUX-DXXX-1', () => {
  bpMap.clear()
  const bp = new Breakpoint()
  bp.address = 0xD000
  setPC(bp.address)
  bp.memoryBank = "AUX-DXXX-1"
  bpMap.set(bp.address, bp)
  memSet(0xC009, 1)  // enable Aux memory $0-$1FF, $D000-$FFFF
  memSet(0xC08A, 1)  // enable ROM, not banked RAM
  expect(hitBreakpoint()).toEqual(false)
  memSet(0xC08B, 1)  // enable R/W banked RAM, DXXX bank 1
  expect(hitBreakpoint()).toEqual(true)
  memSet(0xC088, 1)  // enable R banked RAM, DXXX bank 1
  expect(hitBreakpoint()).toEqual(true)
  memSet(0xC083, 1)  // enable bank 2
  expect(hitBreakpoint()).toEqual(false)
  memSet(0xC08B, 1)  // enable R/W banked RAM, DXXX bank 1
  memSet(0xC008, 1)  // enable Main memory $0-$1FF, $D000-$FFFF
  expect(hitBreakpoint()).toEqual(false)
  memSet(0xC009, 1)  // enable Aux memory $0-$1FF, $D000-$FFFF
  expect(hitBreakpoint()).toEqual(true)
  memSet(0xC008, 1)  // enable Main memory $0-$1FF, $D000-$FFFF
})

test('memory banks AUX-DXXX-2', () => {
  bpMap.clear()
  const bp = new Breakpoint()
  bp.address = 0xD000
  setPC(bp.address)
  bp.memoryBank = "AUX-DXXX-2"
  bpMap.set(bp.address, bp)
  memSet(0xC009, 1)  // enable Aux memory $0-$1FF, $D000-$FFFF
  memSet(0xC082, 1)  // enable ROM, not banked RAM
  expect(hitBreakpoint()).toEqual(false)
  memSet(0xC083, 1)  // enable R/W banked RAM, DXXX bank 2
  expect(hitBreakpoint()).toEqual(true)
  memSet(0xC080, 1)  // enable R banked RAM, DXXX bank 2
  expect(hitBreakpoint()).toEqual(true)
  memSet(0xC08B, 1)  // enable bank 2
  expect(hitBreakpoint()).toEqual(false)
  memSet(0xC083, 1)  // enable R/W banked RAM, DXXX bank 2
  memSet(0xC008, 1)  // enable Main memory $0-$1FF, $D000-$FFFF
  expect(hitBreakpoint()).toEqual(false)
  memSet(0xC009, 1)  // enable Aux memory $0-$1FF, $D000-$FFFF
  expect(hitBreakpoint()).toEqual(true)
  memSet(0xC008, 1)  // enable Main memory $0-$1FF, $D000-$FFFF
})

test('memory banks Internal $CXXX ROM', () => {
  const bp = new Breakpoint()
  bp.address = 0xC100
  setPC(bp.address)
  bp.memoryBank = "CXXX-ROM"
  bpMap.clear()
  bpMap.set(bp.address, bp)
  memSet(0xC007, 1)  // enable Internal $CXXX ROM
  memSet(0xC00A, 1)  // enable Internal $C300 ROM
  expect(hitBreakpoint()).toEqual(true)
  memSet(0xC006, 1)  // enable peripheral card ROM
  expect(hitBreakpoint()).toEqual(false)

  bp.address = 0xC300
  setPC(bp.address)
  bpMap.clear()
  bpMap.set(bp.address, bp)
  memSet(0xC007, 1)  // enable Internal $CXXX ROM
  memSet(0xC00B, 1)  // enable $C300 slot ROM (has no effect since INTCXROM is on)
  expect(hitBreakpoint()).toEqual(true)
  memSet(0xC006, 1)  // enable peripheral card ROM
  expect(hitBreakpoint()).toEqual(false)
  memSet(0xC00A, 1)  // enable Internal $C300 ROM (should now have an effect)
  expect(hitBreakpoint()).toEqual(true)

  // INTCXROM   INTC8ROM   $C800-CFFF
  //    0           0         slot
  //    0           1       internal
  //    1           0       internal
  //    1           1       internal
  bp.address = 0xC900
  setPC(bp.address)
  bpMap.clear()
  bpMap.set(bp.address, bp)
  memSet(0xC007, 1)  // enable Internal $CXXX ROM
  expect(hitBreakpoint()).toEqual(true)
  memSet(0xC006, 1)  // enable peripheral card ROM
  memGet(0xCFFF, false)  // reset INTC8ROM to be false
  expect(hitBreakpoint()).toEqual(false)
  // Accessing $C300 sets INTC8ROM, which should switch back to internal ROM
  memGet(0xC300, false)
  expect(hitBreakpoint()).toEqual(true)
})

test('memory banks Peripheral card ROM', () => {
  const bp = new Breakpoint()
  bp.address = 0xC100
  setPC(bp.address)
  bp.memoryBank = "CXXX-CARD"
  bpMap.clear()
  bpMap.set(bp.address, bp)
  memSet(0xC007, 1)  // enable Internal $CXXX ROM
  memSet(0xC00A, 1)  // enable Internal $C300 ROM
  expect(hitBreakpoint()).toEqual(false)
  memSet(0xC006, 1)  // enable peripheral card ROM
  expect(hitBreakpoint()).toEqual(true)

  bp.address = 0xC300
  setPC(bp.address)
  bpMap.clear()
  bpMap.set(bp.address, bp)
  memSet(0xC007, 1)  // enable Internal $CXXX ROM
  memSet(0xC00B, 1)  // enable $C300 slot ROM (has no effect since INTCXROM is on)
  expect(hitBreakpoint()).toEqual(false)
  memSet(0xC006, 1)  // enable peripheral card ROM
  expect(hitBreakpoint()).toEqual(true)
  memSet(0xC00A, 1)  // enable Internal $C300 ROM (should now have an effect)
  expect(hitBreakpoint()).toEqual(false)

  // INTCXROM   INTC8ROM   $C800-CFFF
  //    0           0         slot
  //    0           1       internal
  //    1           0       internal
  //    1           1       internal
  bp.address = 0xC900
  setPC(bp.address)
  bpMap.clear()
  bpMap.set(bp.address, bp)
  memSet(0xC007, 1)  // enable Internal $CXXX ROM
  expect(hitBreakpoint()).toEqual(false)
  memSet(0xC006, 1)  // enable peripheral card ROM
  memGet(0xCFFF, false)  // reset INTC8ROM to be false
  expect(hitBreakpoint()).toEqual(true)
  // Accessing $C300 sets INTC8ROM, which should switch back to internal ROM
  memGet(0xC300, false)
  expect(hitBreakpoint()).toEqual(false)
})


// ************ Watchpoints memory bank ************

test('watchpoints memory bank', () => {
  bpMap.clear()
  const bp = new Breakpoint()
  bp.address = 0x3000

  // First test with "any" memory bank setting
  bp.watchpoint = true
  bp.memget = true
  bpMap.set(bp.address, bp)
  // no memGet has happened yet, so shouldn't hit watchpoint
  expect(hitBreakpoint()).toEqual(false)
  memGet(bp.address, true)
  expect(hitBreakpoint()).toEqual(true)
  memSet(bp.address, 0x20)
  expect(hitBreakpoint()).toEqual(true)
  memSet(0xC003, 1)  // enable Aux memory $200-$BFFF
  memGet(bp.address, true)
  expect(hitBreakpoint()).toEqual(true)
  memSet(bp.address, 0x20)
  expect(hitBreakpoint()).toEqual(true)
})

test('watchpoints memory bank MAIN', () => {
  bpMap.clear()
  const bp = new Breakpoint()
  bp.address = 0x3000
  bp.watchpoint = true
  bp.memget = true
  bp.memoryBank = "MAIN"
  bpMap.set(bp.address, bp)
  // no memGet has happened yet, so shouldn't hit watchpoint
  expect(hitBreakpoint()).toEqual(false)
  memSet(0xC002, 1)  // enable Main memory $200-$BFFF
  memGet(bp.address, true)
  expect(hitBreakpoint()).toEqual(true)
  memSet(bp.address, 0x01)
  expect(hitBreakpoint()).toEqual(true)
  memSet(0xC003, 1)  // enable Aux memory $200-$BFFF
  // This should not hit watchpoint because memGet happened in Aux memory
  memGet(bp.address, true)
  expect(hitBreakpoint()).toEqual(false)
  memSet(bp.address, 0x01)
  expect(hitBreakpoint()).toEqual(false)
})

test('watchpoints memory bank AUX', () => {
  bpMap.clear()
  const bp = new Breakpoint()
  bp.address = 0x3000
  bp.watchpoint = true
  bp.memget = true
  bp.memoryBank = "AUX"
  bpMap.set(bp.address, bp)
  // no memGet has happened yet, so shouldn't hit watchpoint
  expect(hitBreakpoint()).toEqual(false)
  memSet(0xC002, 1)  // enable Main memory $200-$BFFF
  memGet(bp.address, true)
  expect(hitBreakpoint()).toEqual(false)
  memSet(bp.address, 0x01)
  expect(hitBreakpoint()).toEqual(false)
  memSet(0xC003, 1)  // enable Aux memory $200-$BFFF
  // This should hit watchpoint because memGet happened in Aux memory
  memGet(bp.address, true)
  expect(hitBreakpoint()).toEqual(true)
  memSet(bp.address, 0x01)
  expect(hitBreakpoint()).toEqual(true)
})

test('watchpoints memory bank ROM', () => {
  bpMap.clear()
  const bp = new Breakpoint()
  bp.address = 0xFF00
  bp.watchpoint = true
  bp.memget = true
  bp.memoryBank = "ROM"
  bpMap.set(bp.address, bp)
  // no memGet has happened yet, so shouldn't hit watchpoint
  expect(hitBreakpoint()).toEqual(false)
  memSet(0xC082, 1)  // enable ROM
  memGet(bp.address, true)
  expect(hitBreakpoint()).toEqual(true)
  memSet(0xC083, 1)  // enable R/W RAM, bank 2
  memGet(bp.address, true)
  expect(hitBreakpoint()).toEqual(false)
  memSet(0xC08A, 1)  // enable ROM
  memGet(bp.address, true)
  expect(hitBreakpoint()).toEqual(true)
  memSet(0xC08B, 1)  // enable R/W RAM, bank 1
  memGet(bp.address, true)
  expect(hitBreakpoint()).toEqual(false)
})

test('watchpoints memory bank MAIN-DXXX-1', () => {
  bpMap.clear()
  const bp = new Breakpoint()
  bp.address = 0xD800
  bp.watchpoint = true
  bp.memget = true
  bp.memoryBank = "MAIN-DXXX-1"
  bpMap.set(bp.address, bp)
  // no memGet has happened yet, so shouldn't hit watchpoint
  expect(hitBreakpoint()).toEqual(false)

  memSet(0xC082, 1)  // enable ROM
  memGet(bp.address, true)
  expect(hitBreakpoint()).toEqual(false)

  memSet(0xC08B, 1)  // enable R/W RAM, bank 1
  memGet(bp.address, true)
  expect(hitBreakpoint()).toEqual(true)
  memSet(bp.address, 0x01)
  expect(hitBreakpoint()).toEqual(true)

  memSet(0xC083, 1)  // enable R/W RAM, bank 2
  memGet(bp.address, true)
  expect(hitBreakpoint()).toEqual(false)
  memSet(bp.address, 0x01)
  expect(hitBreakpoint()).toEqual(false)

  memSet(0xC088, 1)  // enable read only RAM, bank 1
  memGet(bp.address, true)
  expect(hitBreakpoint()).toEqual(true)
  memSet(bp.address, 0x01)   // should not be able to write
  expect(hitBreakpoint()).toEqual(false)

  memSet(0xC08B, 1)  // enable R/W RAM, bank 1
  memSet(0xC009, 1)  // enable Aux memory $0-$1FF, $D000-$FFFF
  memGet(bp.address, true)
  expect(hitBreakpoint()).toEqual(false)
  memSet(0xC008, 1)  // enable Main memory $0-$1FF, $D000-$FFFF
  memGet(bp.address, true)
  expect(hitBreakpoint()).toEqual(true)
})


test('watchpoints memory bank MAIN-DXXX-2', () => {
  bpMap.clear()
  const bp = new Breakpoint()
  bp.address = 0xD800
  bp.watchpoint = true
  bp.memget = true
  bp.memoryBank = "MAIN-DXXX-2"
  bpMap.set(bp.address, bp)
  // no memGet has happened yet, so shouldn't hit watchpoint
  expect(hitBreakpoint()).toEqual(false)

  memSet(0xC082, 1)  // enable ROM
  memGet(bp.address, true)
  expect(hitBreakpoint()).toEqual(false)

  memSet(0xC083, 1)  // enable R/W RAM, bank 2
  memGet(bp.address, true)
  expect(hitBreakpoint()).toEqual(true)
  memSet(bp.address, 0x01)
  expect(hitBreakpoint()).toEqual(true)

  memSet(0xC08B, 1)  // enable R/W RAM, bank 1
  memGet(bp.address, true)
  expect(hitBreakpoint()).toEqual(false)
  memSet(bp.address, 0x01)
  expect(hitBreakpoint()).toEqual(false)

  memSet(0xC080, 1)  // enable read only RAM, bank 2
  memGet(bp.address, true)
  expect(hitBreakpoint()).toEqual(true)
  memSet(bp.address, 0x01)   // should not be able to write
  expect(hitBreakpoint()).toEqual(false)

  memSet(0xC083, 1)  // enable R/W RAM, bank 2
  memSet(0xC009, 1)  // enable Aux memory $0-$1FF, $D000-$FFFF
  memGet(bp.address, true)
  expect(hitBreakpoint()).toEqual(false)
  memSet(0xC008, 1)  // enable Main memory $0-$1FF, $D000-$FFFF
  memGet(bp.address, true)
  expect(hitBreakpoint()).toEqual(true)
})

test('watchpoints memory bank AUX-DXXX-1', () => {
  bpMap.clear()
  const bp = new Breakpoint()
  bp.address = 0xD800
  bp.watchpoint = true
  bp.memget = true
  bp.memoryBank = "AUX-DXXX-1"
  memSet(0xC009, 1)  // enable Aux memory $0-$1FF, $D000-$FFFF
  bpMap.set(bp.address, bp)
  // no memGet has happened yet, so shouldn't hit watchpoint
  expect(hitBreakpoint()).toEqual(false)

  memSet(0xC082, 1)  // enable ROM
  memGet(bp.address, true)
  expect(hitBreakpoint()).toEqual(false)

  memSet(0xC08B, 1)  // enable R/W RAM, bank 1
  memGet(bp.address, true)
  expect(hitBreakpoint()).toEqual(true)
  memSet(bp.address, 0x01)
  expect(hitBreakpoint()).toEqual(true)

  memSet(0xC083, 1)  // enable R/W RAM, bank 2
  memGet(bp.address, true)
  expect(hitBreakpoint()).toEqual(false)
  memSet(bp.address, 0x01)
  expect(hitBreakpoint()).toEqual(false)

  memSet(0xC088, 1)  // enable read only RAM, bank 1
  memGet(bp.address, true)
  expect(hitBreakpoint()).toEqual(true)
  memSet(bp.address, 0x01)   // should not be able to write
  expect(hitBreakpoint()).toEqual(false)

  memSet(0xC08B, 1)  // enable R/W RAM, bank 1
  memSet(0xC008, 1)  // enable Main memory $0-$1FF, $D000-$FFFF
  memGet(bp.address, true)
  expect(hitBreakpoint()).toEqual(false)
  memSet(0xC009, 1)  // enable Aux memory $0-$1FF, $D000-$FFFF
  memGet(bp.address, true)
  expect(hitBreakpoint()).toEqual(true)
  memSet(0xC008, 1)  // enable Main memory $0-$1FF, $D000-$FFFF
})


test('watchpoints memory bank AUX-DXXX-2', () => {
  bpMap.clear()
  const bp = new Breakpoint()
  bp.address = 0xD800
  bp.watchpoint = true
  bp.memget = true
  bp.memoryBank = "AUX-DXXX-2"
  bpMap.set(bp.address, bp)
  memSet(0xC009, 1)  // enable Aux memory $0-$1FF, $D000-$FFFF
  // no memGet has happened yet, so shouldn't hit watchpoint
  expect(hitBreakpoint()).toEqual(false)

  memSet(0xC082, 1)  // enable ROM
  memGet(bp.address, true)
  expect(hitBreakpoint()).toEqual(false)

  memSet(0xC083, 1)  // enable R/W RAM, bank 2
  memGet(bp.address, true)
  expect(hitBreakpoint()).toEqual(true)
  memSet(bp.address, 0x01)
  expect(hitBreakpoint()).toEqual(true)

  memSet(0xC08B, 1)  // enable R/W RAM, bank 1
  memGet(bp.address, true)
  expect(hitBreakpoint()).toEqual(false)
  memSet(bp.address, 0x01)
  expect(hitBreakpoint()).toEqual(false)

  memSet(0xC080, 1)  // enable read only RAM, bank 2
  memGet(bp.address, true)
  expect(hitBreakpoint()).toEqual(true)
  memSet(bp.address, 0x01)   // should not be able to write
  expect(hitBreakpoint()).toEqual(false)

  memSet(0xC083, 1)  // enable R/W RAM, bank 2
  memSet(0xC008, 1)  // enable Main memory $0-$1FF, $D000-$FFFF
  memGet(bp.address, true)
  expect(hitBreakpoint()).toEqual(false)
  memSet(0xC009, 1)  // enable Aux memory $0-$1FF, $D000-$FFFF
  memGet(bp.address, true)
  expect(hitBreakpoint()).toEqual(true)
  memSet(0xC008, 1)  // enable Main memory $0-$1FF, $D000-$FFFF
})

test('memory banks Internal $CXXX ROM', () => {
  bpMap.clear()
  const bp = new Breakpoint()
  bp.address = 0xC2FF
  bp.watchpoint = true
  bp.memget = true
  bp.memoryBank = "CXXX-ROM"
  bpMap.set(bp.address, bp)
  // no memGet has happened yet, so shouldn't hit watchpoint
  expect(hitBreakpoint()).toEqual(false)

  memSet(0xC007, 1)  // enable Internal $CXXX ROM
  memSet(0xC00A, 1)  // enable Internal $C300 ROM
  memGet(bp.address, true)
  expect(hitBreakpoint()).toEqual(true)
  memSet(0xC006, 1)  // enable peripheral card ROM
  memGet(bp.address, true)
  expect(hitBreakpoint()).toEqual(false)

  bp.address = 0xC300
  bpMap.clear()
  bpMap.set(bp.address, bp)
  memSet(0xC007, 1)  // enable Internal $CXXX ROM
  memSet(0xC00B, 1)  // enable $C300 slot ROM (has no effect since INTCXROM is on)
  memGet(bp.address, true)
  expect(hitBreakpoint()).toEqual(true)
  memSet(0xC006, 1)  // enable peripheral card ROM
  memGet(bp.address, true)
  expect(hitBreakpoint()).toEqual(false)
  memSet(0xC00A, 1)  // enable Internal $C300 ROM (should now have an effect)
  memGet(bp.address, true)
  expect(hitBreakpoint()).toEqual(true)
})

test('memory banks Peripheral card ROM', () => {
  bpMap.clear()
  const bp = new Breakpoint()
  bp.address = 0xC2FF
  bp.watchpoint = true
  bp.memget = true
  bp.memoryBank = "CXXX-CARD"
  bpMap.set(bp.address, bp)
  // no memGet has happened yet, so shouldn't hit watchpoint
  expect(hitBreakpoint()).toEqual(false)

  memSet(0xC007, 1)  // enable Internal $CXXX ROM
  memSet(0xC00A, 1)  // enable Internal $C300 ROM
  memGet(bp.address, true)
  expect(hitBreakpoint()).toEqual(false)
  memSet(0xC006, 1)  // enable peripheral card ROM
  memGet(bp.address, true)
  expect(hitBreakpoint()).toEqual(true)

  bp.address = 0xC300
  setPC(bp.address)
  bpMap.clear()
  bpMap.set(bp.address, bp)
  memSet(0xC007, 1)  // enable Internal $CXXX ROM
  memSet(0xC00B, 1)  // enable $C300 slot ROM (has no effect since INTCXROM is on)
  memGet(bp.address, true)
  expect(hitBreakpoint()).toEqual(false)
  memSet(0xC006, 1)  // enable peripheral card ROM
  memGet(bp.address, true)
  expect(hitBreakpoint()).toEqual(true)
  memSet(0xC00A, 1)  // enable Internal $C300 ROM (should now have an effect)
  memGet(bp.address, true)
  expect(hitBreakpoint()).toEqual(false)
})
