import { doSetBreakpoints, hitBreakpoint } from "../cpu6502"
import { setPC, setX } from "../instructions"
import { memGet, memSet } from "../memory"
import { Breakpoint, BreakpointMap } from "../../common/breakpoint"

const bpMap: BreakpointMap = new BreakpointMap()
doSetBreakpoints(bpMap)

// ************ Breakpoints - test all properties ************

test("hitBreakpoint", () => {
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
  bp.expression1.register = "X"
  bp.expression1.operator = "=="
  bp.expression1.value = 0x20
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
  bp.expression1.register = "A"
  bp.expression1.operator = "=="
  bp.expression1.value = 0x99
  bp.expressionOperator = "&&"
  bp.expression2.register = "X"
  bp.expression2.operator = "=="
  bp.expression2.value = 0x20
  expect(hitBreakpoint()).toEqual(false)
  bp.expressionOperator = "||"
  expect(hitBreakpoint()).toEqual(true)
  bp.expression1.register = ""
  expect(hitBreakpoint()).toEqual(true)
})


// ************ Breakpoints memory bank ************

test("memory banks address range", () => {
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

test("memory banks MAIN", () => {
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

test("memory banks AUX", () => {
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

test("memory banks ROM", () => {
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

test("memory banks MAIN-DXXX-1", () => {
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

test("memory banks MAIN-DXXX-2", () => {
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

test("memory banks AUX-DXXX-1", () => {
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

test("memory banks AUX-DXXX-2", () => {
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

test("memory banks Internal $CXXX ROM", () => {
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

test("memory banks Peripheral card ROM", () => {
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
