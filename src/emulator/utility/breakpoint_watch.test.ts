import { doSetBreakpoints, hitBreakpoint } from "../cpu6502";
import { setPC } from "../instructions";
import { memGet, memSet } from "../memory";
import { Breakpoint, BreakpointMap } from "./breakpoint";

const bpMap: BreakpointMap = new BreakpointMap()
doSetBreakpoints(bpMap)

// ************ Watchpoints - test all properties ************

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
  memGet(0xC082)  // enable ROM
  memGet(bp.address, true)
  expect(hitBreakpoint()).toEqual(true)
  memGet(0xC083)  // enable R/W RAM, bank 2
  memGet(bp.address, true)
  expect(hitBreakpoint()).toEqual(false)
  memGet(0xC08A)  // enable ROM
  memGet(bp.address, true)
  expect(hitBreakpoint()).toEqual(true)
  memGet(0xC08B)  // enable R/W RAM, bank 1
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

  memGet(0xC082)  // enable ROM
  memGet(bp.address, true)
  expect(hitBreakpoint()).toEqual(false)

  memGet(0xC08B)  // enable R/W RAM, bank 1
  memGet(0xC08B)  // enable R/W RAM, bank 1
  memGet(bp.address, true)
  expect(hitBreakpoint()).toEqual(true)
  memSet(bp.address, 0x01)
  expect(hitBreakpoint()).toEqual(true)

  memGet(0xC083)  // enable R/W RAM, bank 2
  memGet(0xC083)  // enable R/W RAM, bank 2
  memGet(bp.address, true)
  expect(hitBreakpoint()).toEqual(false)
  memSet(bp.address, 0x01)
  expect(hitBreakpoint()).toEqual(false)

  memGet(0xC088)  // enable read only RAM, bank 1
  memGet(bp.address, true)
  expect(hitBreakpoint()).toEqual(true)
  memSet(bp.address, 0x01)   // should not be able to write
  expect(hitBreakpoint()).toEqual(false)

  memGet(0xC08B)  // enable R/W RAM, bank 1
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

  memGet(0xC082)  // enable ROM
  memGet(bp.address, true)
  expect(hitBreakpoint()).toEqual(false)

  memGet(0xC083)  // enable R/W RAM, bank 2
  memGet(0xC083)  // enable R/W RAM, bank 2
  memGet(bp.address, true)
  expect(hitBreakpoint()).toEqual(true)
  memSet(bp.address, 0x01)
  expect(hitBreakpoint()).toEqual(true)

  memGet(0xC08B)  // enable R/W RAM, bank 1
  memGet(bp.address, true)
  expect(hitBreakpoint()).toEqual(false)
  memSet(bp.address, 0x01)
  expect(hitBreakpoint()).toEqual(false)

  memGet(0xC080)  // enable read only RAM, bank 2
  memGet(bp.address, true)
  expect(hitBreakpoint()).toEqual(true)
  memSet(bp.address, 0x01)   // should not be able to write
  expect(hitBreakpoint()).toEqual(false)

  memGet(0xC083)  // enable R/W RAM, bank 2
  memGet(0xC083)  // enable R/W RAM, bank 2
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

  memGet(0xC082)  // enable ROM
  memGet(bp.address, true)
  expect(hitBreakpoint()).toEqual(false)

  memGet(0xC08B)  // enable R/W RAM, bank 1
  memGet(0xC08B)  // enable R/W RAM, bank 1
  memGet(bp.address, true)
  expect(hitBreakpoint()).toEqual(true)
  memSet(bp.address, 0x01)
  expect(hitBreakpoint()).toEqual(true)

  memGet(0xC083)  // enable R/W RAM, bank 2
  memGet(bp.address, true)
  expect(hitBreakpoint()).toEqual(false)
  memSet(bp.address, 0x01)
  expect(hitBreakpoint()).toEqual(false)

  memGet(0xC088)  // enable read only RAM, bank 1
  memGet(bp.address, true)
  expect(hitBreakpoint()).toEqual(true)
  memSet(bp.address, 0x01)   // should not be able to write
  expect(hitBreakpoint()).toEqual(false)

  memGet(0xC08B)  // enable R/W RAM, bank 1
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

  memGet(0xC082)  // enable ROM
  memGet(bp.address, true)
  expect(hitBreakpoint()).toEqual(false)

  memGet(0xC083)  // enable R/W RAM, bank 2
  memGet(0xC083)  // enable R/W RAM, bank 2
  memGet(bp.address, true)
  expect(hitBreakpoint()).toEqual(true)
  memSet(bp.address, 0x01)
  expect(hitBreakpoint()).toEqual(true)

  memGet(0xC08B)  // enable R/W RAM, bank 1
  memGet(bp.address, true)
  expect(hitBreakpoint()).toEqual(false)
  memSet(bp.address, 0x01)
  expect(hitBreakpoint()).toEqual(false)

  memGet(0xC080)  // enable read only RAM, bank 2
  memGet(bp.address, true)
  expect(hitBreakpoint()).toEqual(true)
  memSet(bp.address, 0x01)   // should not be able to write
  expect(hitBreakpoint()).toEqual(false)

  memGet(0xC083)  // enable R/W RAM, bank 2
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
