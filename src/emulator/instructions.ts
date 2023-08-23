import { toHex, MODE } from "./utility"
import { memGet, memSet } from "./memory"
// var startTime = performance.now()

export let s6502: STATE6502 = {
  PStatus: 0,
  PC: 0,
  Accum: 0,
  XReg: 0,
  YReg: 0,
  StackPtr: 0
}

export const setX = (value: number) => {
  s6502.XReg = value
}

export const setY = (value: number) => {
  s6502.YReg = value
}

export let cycleCount = 0

export const setCycleCount = (cycles: number) => { cycleCount = cycles }

export const set6502State = (new6502: any) => {
  s6502 = new6502
}

export const reset6502 = () => {
  s6502.Accum = 0
  s6502.XReg = 0
  s6502.YReg = 0
  s6502.PStatus = 0b00100100  // bit 2 (Interrupt) + bit 5 (unused)
  s6502.StackPtr = 0xFF
  setPC(memGet(0xFFFD) * 256 + memGet(0xFFFC))
}

export const incrementPC = (value: number) => {
  setPC((s6502.PC + value + 65536) % 65536)
}

export const setPC = (value: number) => {
  s6502.PC = value
}

const setPStatus = (value: number) => {
  s6502.PStatus = value | 0b00110000
}

export const stack = new Array<string>(256).fill('')

const pushStack = (call: string, value: number) => {
  stack[s6502.StackPtr] = call
  memSet(0x100 + s6502.StackPtr, value)
  s6502.StackPtr = (s6502.StackPtr + 255) % 256
}

const popStack = () => {
  s6502.StackPtr = (s6502.StackPtr + 1) % 256;
  const value = memGet(0x100 + s6502.StackPtr);
  if (isNaN(value)) {
    throw new Error("illegal stack value");
  }
  return value
}

export const isCarry = () => { return ((s6502.PStatus & 0x01) !== 0); }
export const setCarry = (set = true) => s6502.PStatus = set ? s6502.PStatus | 1 :
  s6502.PStatus & 0b11111110

const isZero = () => { return ((s6502.PStatus & 0x02) !== 0); }
const setZero = (set = true) => s6502.PStatus = set ? s6502.PStatus | 2 :
  s6502.PStatus & 0b11111101

const isInterruptDisabled = () => { return ((s6502.PStatus & 0x04) !== 0); }
export const setInterruptDisabled = (set = true) => s6502.PStatus = set ? s6502.PStatus | 4 :
  s6502.PStatus & 0b11111011

const isDecimal = () => { return ((s6502.PStatus & 0x08) !== 0); }
const BCD = () => (isDecimal() ? 1 : 0)
const setDecimal = (set = true) => s6502.PStatus = set ? s6502.PStatus | 8 :
  s6502.PStatus & 0b11110111

export const isBreak = () => { return ((s6502.PStatus & 0x10) !== 0); }
const setBreak = (set = true) => s6502.PStatus = set ? s6502.PStatus | 0x10 :
  s6502.PStatus & 0b11101111

const isOverflow = () => { return ((s6502.PStatus & 0x40) !== 0); }
const setOverflow = (set = true) => s6502.PStatus = set ? s6502.PStatus | 0x40 :
  s6502.PStatus & 0b10111111

const isNegative = () => { return ((s6502.PStatus & 0x80) !== 0); }
const setNegative = (set = true) => s6502.PStatus = set ? s6502.PStatus | 0x80 :
  s6502.PStatus & 0b01111111

const checkStatus = (value: number) => {
  setZero(value === 0);
  setNegative(value >= 128);
}

// Return number of clock cycles taken
export const doBranch = (takeBranch: boolean, offset: number) => {
  if (takeBranch) {
    const oldPC = s6502.PC
    incrementPC((offset > 127) ? (offset - 256) : offset)
    return 3 + pageBoundary(oldPC, s6502.PC)
  }
  return 2
}

const oneByteAdd = (value: number, offset: number) => (value + offset + 256) % 256
const address = (vLo: number, vHi: number) => (vHi*256 + vLo)
const twoByteAdd = (vLo: number, vHi: number, offset: number) => (vHi*256 + vLo + offset + 65536) % 65536
const pageBoundary = (addr1: number, addr2: number) => (((addr1 >> 8) !== (addr2 >> 8)) ? 1 : 0)

export const pcodes = new Array<PCodeInstr>(256)

const PCODE = (name: string, mode: MODE, pcode: number, PC: number, code: PCodeFunc) => {
  console.assert(!pcodes[pcode], "Duplicate instruction: " + name + " mode=" + mode)
  pcodes[pcode] = {name: name, pcode: pcode, mode: mode, PC: PC, execute: code}
}

const doIndirectYinstruction = (vZP: number,
  doInstruction: (addr: number) => void,
  addBCD: boolean) => {
  const vLo = memGet(vZP)
  const vHi = memGet((vZP + 1) % 256)
  const addr = twoByteAdd(vLo, vHi, s6502.YReg)
  doInstruction(addr)
  let cycles = 5 + pageBoundary(addr, address(vLo, vHi))
  if (addBCD) cycles += BCD()
  return cycles
}

const doIndirectInstruction = (vZP: number,
  doInstruction: (addr: number) => void,
  addBCD: boolean) => {
  const vLo = memGet(vZP)
  const vHi = memGet((vZP + 1) % 256)
  const addr = address(vLo, vHi)
  doInstruction(addr)
  let cycles = 5
  if (addBCD) cycles += BCD()
  return cycles
}

// 300: F8 18 B8 A9 BD 69 00 D8 00
const doADC_BCD = (value: number) => {
  let ones = (s6502.Accum & 0x0F) + (value & 0x0F) + (isCarry() ? 1 : 0)
  // Handle illegal BCD hex values by wrapping to "tens" digit
  if (ones >= 0xA) {
    ones += 6
  }
  let tmp = (s6502.Accum & 0xF0) + (value & 0xF0) + ones
  // Pretend we're doing normal addition to set overflow flag
  const bothPositive = (s6502.Accum <= 127 && value <= 127)
  const bothNegative = (s6502.Accum >= 128 && value >= 128)
  setOverflow((tmp & 0xFF) >= 128 ? bothPositive : bothNegative)
  // Handle illegal BCD hex values by wrapping to "hundreds" digit
  setCarry(tmp >= 0xA0)
  if (isCarry()) {
    tmp += 0x60
  }
  s6502.Accum = tmp & 0xFF
  // Assume we're a 65c02 and set the zero flag properly.
  // This doesn't happen on a 6502 for BCD mode.
  checkStatus(s6502.Accum)
}

const doADC_HEX = (value: number) => {
  let tmp = s6502.Accum + value + (isCarry() ? 1 : 0)
  setCarry(tmp >= 256)
  tmp = tmp % 256
  const bothPositive = (s6502.Accum <= 127 && value <= 127)
  const bothNegative = (s6502.Accum >= 128 && value >= 128)
  setOverflow(tmp >= 128 ? bothPositive : bothNegative)
  s6502.Accum = tmp
  checkStatus(s6502.Accum)
}

const doADC = (addr: number) => {
  if (isDecimal()) {
    doADC_BCD(memGet(addr))
  } else {
    doADC_HEX(memGet(addr))
  }
}

PCODE('ADC', MODE.IMM, 0x69, 2, (value) => {
  if (BCD()) {doADC_BCD(value)} else {doADC_HEX(value)}; return 2 + BCD()})
PCODE('ADC', MODE.ZP_REL, 0x65, 2, (vZP) => {doADC(vZP); return 3 + BCD()})
PCODE('ADC', MODE.ZP_X, 0x75, 2, (vZP) =>
  {doADC(oneByteAdd(vZP, s6502.XReg)); return 4 + BCD()})
PCODE('ADC', MODE.ABS, 0x6D, 3, (vLo, vHi) =>
  {doADC(address(vLo, vHi)); return 4 + BCD()})
PCODE('ADC', MODE.ABS_X, 0x7D, 3, (vLo, vHi) =>
  {const addr = twoByteAdd(vLo, vHi, s6502.XReg);
  doADC(addr); return 4 + BCD() + pageBoundary(addr, address(vLo, vHi))})
PCODE('ADC', MODE.ABS_Y, 0x79, 3, (vLo, vHi) =>
  {const addr = twoByteAdd(vLo, vHi, s6502.YReg);
  doADC(addr); return 4 + BCD() + pageBoundary(addr, address(vLo, vHi))})
PCODE('ADC', MODE.IND_X, 0x61, 2, (vOffset) =>
  {const vZP = oneByteAdd(vOffset, s6502.XReg);
  doADC(address(memGet(vZP), memGet(vZP + 1))); return 6 + BCD()})
PCODE('ADC', MODE.IND_Y, 0x71, 2, (vZP) => doIndirectYinstruction(vZP, doADC, true))
PCODE('ADC', MODE.IND, 0x72, 2, (vZP) => doIndirectInstruction(vZP, doADC, true))

const doAND = (addr: number) => {
  s6502.Accum &= memGet(addr)
  checkStatus(s6502.Accum)}
PCODE('AND', MODE.IMM, 0x29, 2, (value) => {s6502.Accum &= value; checkStatus(s6502.Accum); return 2})
PCODE('AND', MODE.ZP_REL, 0x25, 2, (vZP) => {doAND(vZP); return 3})
PCODE('AND', MODE.ZP_X, 0x35, 2, (vZP) => {doAND(oneByteAdd(vZP, s6502.XReg)); return 4})
PCODE('AND', MODE.ABS, 0x2D, 3, (vLo, vHi) => {doAND(address(vLo, vHi)); return 4})
PCODE('AND', MODE.ABS_X, 0x3D, 3, (vLo, vHi) => {const addr = twoByteAdd(vLo, vHi, s6502.XReg);
  doAND(addr); return 4 + pageBoundary(addr, address(vLo, vHi))})
PCODE('AND', MODE.ABS_Y, 0x39, 3, (vLo, vHi) => {const addr = twoByteAdd(vLo, vHi, s6502.YReg);
  doAND(addr); return 4 + pageBoundary(addr, address(vLo, vHi))})
PCODE('AND', MODE.IND_X, 0x21, 2, (vOffset) => {const vZP = oneByteAdd(vOffset, s6502.XReg);
  doAND(address(memGet(vZP), memGet(vZP + 1))); return 6})
PCODE('AND', MODE.IND_Y, 0x31, 2, (vZP) => doIndirectYinstruction(vZP, doAND, false))
PCODE('AND', MODE.IND, 0x32, 2, (vZP) => doIndirectInstruction(vZP, doAND, false))

const doASL = (addr: number) => {
  let v = memGet(addr)
  memGet(addr)  // extra strobe of the address (Sather IIe p. 4-27)
  setCarry((v & 128) === 128)
  v = (v << 1) % 256
  memSet(addr, v)
  checkStatus(v)}
PCODE('ASL', MODE.IMPLIED, 0x0A, 1, () => {setCarry((s6502.Accum & 128) === 128);
  s6502.Accum = (s6502.Accum << 1) % 256; checkStatus(s6502.Accum); return 2})
PCODE('ASL', MODE.ZP_REL, 0x06, 2, (vZP) => {doASL(vZP); return 5})
PCODE('ASL', MODE.ZP_X, 0x16, 2, (vZP) => {doASL(oneByteAdd(vZP, s6502.XReg)); return 6})
PCODE('ASL', MODE.ABS, 0x0E, 3, (vLo, vHi) => {doASL(address(vLo, vHi)); return 6})
PCODE('ASL', MODE.ABS_X, 0x1E, 3, (vLo, vHi) => {const addr = twoByteAdd(vLo, vHi, s6502.XReg);
  doASL(addr);
  return 6 + pageBoundary(addr, address(vLo, vHi))})

PCODE('BCC', MODE.ZP_REL, 0x90, 2, (value) => doBranch(!isCarry(), value))
PCODE('BCS', MODE.ZP_REL, 0xB0, 2, (value) => doBranch(isCarry(), value))
PCODE('BEQ', MODE.ZP_REL, 0xF0, 2, (value) => doBranch(isZero(), value))
PCODE('BMI', MODE.ZP_REL, 0x30, 2, (value) => doBranch(isNegative(), value))
PCODE('BNE', MODE.ZP_REL, 0xD0, 2, (value) => doBranch(!isZero(), value))
PCODE('BPL', MODE.ZP_REL, 0x10, 2, (value) => doBranch(!isNegative(), value))
PCODE('BVC', MODE.ZP_REL, 0x50, 2, (value) => doBranch(!isOverflow(), value))
PCODE('BVS', MODE.ZP_REL, 0x70, 2, (value) => doBranch(isOverflow(), value))
PCODE('BRA', MODE.ZP_REL, 0x80, 2, (value) => doBranch(true, value))

const doBit = (value: number) => {
  setZero((s6502.Accum & value) === 0);
  setNegative((value & 0b10000000) !== 0);
  setOverflow((value & 0b01000000) !== 0);
}
PCODE('BIT', MODE.ZP_REL, 0x24, 2, (vZP) => {doBit(memGet(vZP)); return 3})
PCODE('BIT', MODE.ABS, 0x2C, 3, (vLo, vHi) => {doBit(memGet(address(vLo, vHi))); return 4})
PCODE('BIT', MODE.IMM, 0x89, 2, (value) => {doBit(value); return 2})
PCODE('BIT', MODE.ZP_X, 0x34, 2, (vZP) => {doBit(memGet(oneByteAdd(vZP, s6502.XReg))); return 4})
PCODE('BIT', MODE.ABS_X, 0x3C, 3, (vLo, vHi) => {const addr = twoByteAdd(vLo, vHi, s6502.XReg);
  doBit(memGet(addr)); return 4 + pageBoundary(addr, address(vLo, vHi))})

const doInterrupt = (name: string, addr: number, pcOffset = 0) => {
  // I don't think the real Apple IIe switches back to main ROM $C300
  // Comment these out and see if we run into problems
  // memSet(0xC006, 0)  // slot ROM $C100-$CFFF
  // memSet(0xC00A, 0)  // main ROM $C300-$C3FF
  const PCreturn = (s6502.PC + pcOffset) % 65536
  const vLo = memGet(addr)
  const vHi = memGet(addr + 1)
  pushStack(`${name} $` + toHex(vHi) + toHex(vLo), Math.trunc(PCreturn / 256))
  pushStack(name, PCreturn % 256)
  pushStack("P", s6502.PStatus)
  setDecimal(false)  // 65c02 only
  setInterruptDisabled()
  // Since we're in the middle of the BRK, set our new program counter to
  // be one less than our vector address. Don't do this for IRQ and NMI.
  setPC(twoByteAdd(vLo, vHi, name === "BRK" ? -1 : 0));
}
const doBrk = () => {
  setBreak()
  doInterrupt("BRK", 0xFFFE, 2)
  return 7
}
PCODE('BRK', MODE.IMPLIED, 0x00, 1, doBrk)

export const doInterruptRequest = () => {
  if (isInterruptDisabled()) return
  setBreak(false)
  doInterrupt("IRQ", 0xFFFE)
}

export const doNonMaskableInterrupt = () => {
  setBreak(false)
  doInterrupt("NMI", 0xFFFA)
}

PCODE('CLC', MODE.IMPLIED, 0x18, 1, () => {setCarry(false); return 2})
PCODE('CLD', MODE.IMPLIED, 0xD8, 1, () => {setDecimal(false); return 2})
PCODE('CLI', MODE.IMPLIED, 0x58, 1, () => {setInterruptDisabled(false); return 2})
PCODE('CLV', MODE.IMPLIED, 0xB8, 1, () => {setOverflow(false); return 2})

const doCMP = (addr: number) => {
  const value = memGet(addr)
  setCarry(s6502.Accum >= value)
  checkStatus((s6502.Accum - value + 256) % 256)
}
const doCMP1 = (addr: number) => {
  const value = memGet(addr)
  setCarry(s6502.Accum >= value)
  checkStatus((s6502.Accum - value + 256) % 256)
}
PCODE('CMP', MODE.IMM, 0xC9, 2, (value) => {setCarry(s6502.Accum >= value);
  checkStatus((s6502.Accum - value + 256) % 256); return 2})
PCODE('CMP', MODE.ZP_REL, 0xC5, 2, (vZP) => {doCMP(vZP); return 3})
PCODE('CMP', MODE.ZP_X, 0xD5, 2, (vZP) => {doCMP(oneByteAdd(vZP, s6502.XReg)); return 4})
PCODE('CMP', MODE.ABS, 0xCD, 3, (vLo, vHi) => {doCMP(address(vLo, vHi)); return 4})
PCODE('CMP', MODE.ABS_X, 0xDD, 3, (vLo, vHi) => {const addr = twoByteAdd(vLo, vHi, s6502.XReg);
  doCMP1(addr); return 4 + pageBoundary(addr, address(vLo, vHi))})
PCODE('CMP', MODE.ABS_Y, 0xD9, 3, (vLo, vHi) => {const addr = twoByteAdd(vLo, vHi, s6502.YReg);
  doCMP(addr); return 4 + pageBoundary(addr, address(vLo, vHi))})
PCODE('CMP', MODE.IND_X, 0xC1, 2, (vOffset) => {const vZP = oneByteAdd(vOffset, s6502.XReg);
  doCMP(address(memGet(vZP), memGet(vZP + 1))); return 6})
PCODE('CMP', MODE.IND_Y, 0xD1, 2, (vZP) => doIndirectYinstruction(vZP, doCMP, false))
PCODE('CMP', MODE.IND, 0xD2, 2, (vZP) => doIndirectInstruction(vZP, doCMP, false))

const doCPX = (addr: number) => {
  const value = memGet(addr)
  setCarry(s6502.XReg >= value)
  checkStatus((s6502.XReg - value + 256) % 256)
}
PCODE('CPX', MODE.IMM, 0xE0, 2, (value) => {setCarry(s6502.XReg >= value);
  checkStatus((s6502.XReg - value + 256) % 256); return 2})
PCODE('CPX', MODE.ZP_REL, 0xE4, 2, (vZP) => {doCPX(vZP); return 3})
PCODE('CPX', MODE.ABS, 0xEC, 3, (vLo, vHi) => {doCPX(address(vLo, vHi)); return 4})

const doCPY = (addr: number) => {
  const value = memGet(addr)
  setCarry(s6502.YReg >= value)
  checkStatus((s6502.YReg - value + 256) % 256)
}
PCODE('CPY', MODE.IMM, 0xC0, 2, (value) => {setCarry(s6502.YReg >= value);
  checkStatus((s6502.YReg - value + 256) % 256); return 2})
PCODE('CPY', MODE.ZP_REL, 0xC4, 2, (vZP) => {doCPY(vZP); return 3})
PCODE('CPY', MODE.ABS, 0xCC, 3, (vLo, vHi) => {doCPY(address(vLo, vHi)); return 4})

const doDEC = (addr: number) => {
  const v = oneByteAdd(memGet(addr), -1)
  memSet(addr, v)
  checkStatus(v)
}
PCODE('DEC', MODE.IMPLIED, 0x3A, 1, () => {s6502.Accum = oneByteAdd(s6502.Accum, -1);
  checkStatus(s6502.Accum); return 2})
PCODE('DEC', MODE.ZP_REL, 0xC6, 2, (vZP) => {doDEC(vZP); return 5})
PCODE('DEC', MODE.ZP_X, 0xD6, 2, (vZP) => {doDEC(oneByteAdd(vZP, s6502.XReg)); return 6})
PCODE('DEC', MODE.ABS, 0xCE, 3, (vLo, vHi) => {doDEC(address(vLo, vHi)); return 6})
PCODE('DEC', MODE.ABS_X, 0xDE, 3, (vLo, vHi) => {
  const addr = twoByteAdd(vLo, vHi, s6502.XReg)
  memGet(addr)  // extra strobe of the address (Sather IIe p. 4-27)
  doDEC(addr)
  return 7})

PCODE('DEX', MODE.IMPLIED, 0xCA, 1, () => {s6502.XReg = oneByteAdd(s6502.XReg, -1);
  checkStatus(s6502.XReg); return 2})
PCODE('DEY', MODE.IMPLIED, 0x88, 1, () => {s6502.YReg = oneByteAdd(s6502.YReg, -1);
  checkStatus(s6502.YReg); return 2})

const doEOR = (addr: number) => {
  s6502.Accum ^= memGet(addr)
  checkStatus(s6502.Accum)
}
PCODE('EOR', MODE.IMM, 0x49, 2, (value) => {s6502.Accum ^= value; checkStatus(s6502.Accum); return 2})
PCODE('EOR', MODE.ZP_REL, 0x45, 2, (vZP) => {doEOR(vZP); return 3})
PCODE('EOR', MODE.ZP_X, 0x55, 2, (vZP) => {doEOR(oneByteAdd(vZP, s6502.XReg)); return 4})
PCODE('EOR', MODE.ABS, 0x4D, 3, (vLo, vHi) => {doEOR(address(vLo, vHi)); return 4})
PCODE('EOR', MODE.ABS_X, 0x5D, 3, (vLo, vHi) => {const addr = twoByteAdd(vLo, vHi, s6502.XReg);
  doEOR(addr); return 4 + pageBoundary(addr, address(vLo, vHi))})
PCODE('EOR', MODE.ABS_Y, 0x59, 3, (vLo, vHi) => {const addr = twoByteAdd(vLo, vHi, s6502.YReg);
  doEOR(addr); return 4 + pageBoundary(addr, address(vLo, vHi))})
PCODE('EOR', MODE.IND_X, 0x41, 2, (vOffset) => {const vZP = oneByteAdd(vOffset, s6502.XReg);
  doEOR(address(memGet(vZP), memGet(vZP + 1))); return 6})
PCODE('EOR', MODE.IND_Y, 0x51, 2, (vZP) => doIndirectYinstruction(vZP, doEOR, false))
PCODE('EOR', MODE.IND, 0x52, 2, (vZP) => doIndirectInstruction(vZP, doEOR, false))

const doINC = (addr: number) => {
  const v = oneByteAdd(memGet(addr), 1)
  memSet(addr, v)
  checkStatus(v)
}
PCODE('INC', MODE.IMPLIED, 0x1A, 1, () => {s6502.Accum = oneByteAdd(s6502.Accum, 1);
  checkStatus(s6502.Accum); return 2})
PCODE('INC', MODE.ZP_REL, 0xE6, 2, (vZP) => {doINC(vZP); return 5})
PCODE('INC', MODE.ZP_X, 0xF6, 2, (vZP) => {doINC(oneByteAdd(vZP, s6502.XReg)); return 6})
PCODE('INC', MODE.ABS, 0xEE, 3, (vLo, vHi) => {doINC(address(vLo, vHi)); return 6})
PCODE('INC', MODE.ABS_X, 0xFE, 3, (vLo, vHi) => {
  const addr = twoByteAdd(vLo, vHi, s6502.XReg)
  memGet(addr)  // extra strobe of the address (Sather IIe p. 4-27)
  doINC(addr)
  return 7})

PCODE('INX', MODE.IMPLIED, 0xE8, 1, () => {s6502.XReg = oneByteAdd(s6502.XReg, 1);
  checkStatus(s6502.XReg); return 2})
PCODE('INY', MODE.IMPLIED, 0xC8, 1, () => {s6502.YReg = oneByteAdd(s6502.YReg, 1);
  checkStatus(s6502.YReg); return 2})

PCODE('JMP', MODE.ABS, 0x4C, 3, (vLo, vHi) => {setPC(twoByteAdd(vLo, vHi, -3)); return 3})
// 65c02 - this fixes the 6502 indirect JMP bug across page boundaries
PCODE('JMP', MODE.IND, 0x6C, 3, (vLo, vHi) => {const a = address(vLo, vHi);
  vLo = memGet(a); vHi = memGet((a + 1) % 65536); setPC(twoByteAdd(vLo, vHi, -3)); return 6})
PCODE('JMP', MODE.IND_X, 0x7C, 3, (vLo, vHi) => {const a = twoByteAdd(vLo, vHi, s6502.XReg);
  vLo = memGet(a); vHi = memGet((a + 1) % 65536); setPC(twoByteAdd(vLo, vHi, -3)); return 6})

PCODE('JSR', MODE.ABS, 0x20, 3, (vLo, vHi) => {
  // Push the (address - 1) of the next instruction
  const PC2 = (s6502.PC + 2) % 65536
  pushStack("JSR $" + toHex(vHi) + toHex(vLo), Math.trunc(PC2 / 256));
  pushStack("JSR", PC2 % 256);
  setPC(twoByteAdd(vLo, vHi, -3)); return 6})

const doLDA = (addr: number) => {
  s6502.Accum = memGet(addr)
  checkStatus(s6502.Accum)
}
PCODE('LDA', MODE.IMM, 0xA9, 2, (value) => {s6502.Accum = value; checkStatus(s6502.Accum); return 2})
PCODE('LDA', MODE.ZP_REL, 0xA5, 2, (vZP) => {doLDA(vZP); return 3})
PCODE('LDA', MODE.ZP_X, 0xB5, 2, (vZP) => {doLDA(oneByteAdd(vZP, s6502.XReg)); return 4})
PCODE('LDA', MODE.ABS, 0xAD, 3, (vLo, vHi) => {doLDA(address(vLo, vHi)); return 4})
PCODE('LDA', MODE.ABS_X, 0xBD, 3, (vLo, vHi) => {const addr = twoByteAdd(vLo, vHi, s6502.XReg);
  doLDA(addr); return 4 + pageBoundary(addr, address(vLo, vHi))})
PCODE('LDA', MODE.ABS_Y, 0xB9, 3, (vLo, vHi) => {const addr = twoByteAdd(vLo, vHi, s6502.YReg);
  doLDA(addr); return 4 + pageBoundary(addr, address(vLo, vHi))})
PCODE('LDA', MODE.IND_X, 0xA1, 2, (vOffset) => {const vZP = oneByteAdd(vOffset, s6502.XReg);
  doLDA(address(memGet(vZP), memGet((vZP + 1) % 256))); return 6})
PCODE('LDA', MODE.IND_Y, 0xB1, 2, (vZP) => doIndirectYinstruction(vZP, doLDA, false))
PCODE('LDA', MODE.IND, 0xB2, 2, (vZP) => doIndirectInstruction(vZP, doLDA, false))

const doLDX = (addr: number) => {
  s6502.XReg = memGet(addr)
  checkStatus(s6502.XReg)
}
PCODE('LDX', MODE.IMM, 0xA2, 2, (value) => {s6502.XReg = value; checkStatus(s6502.XReg); return 2})
PCODE('LDX', MODE.ZP_REL, 0xA6, 2, (vZP) => {doLDX(vZP); return 3})
PCODE('LDX', MODE.ZP_Y, 0xB6, 2, (vZP) => {doLDX(oneByteAdd(vZP, s6502.YReg)); return 4})
PCODE('LDX', MODE.ABS, 0xAE, 3, (vLo, vHi) => {doLDX(address(vLo, vHi)); return 4})
PCODE('LDX', MODE.ABS_Y, 0xBE, 3, (vLo, vHi) => {const addr = twoByteAdd(vLo, vHi, s6502.YReg);
  doLDX(addr); return 4 + pageBoundary(addr, address(vLo, vHi))})

const doLDY = (addr: number) => {
  s6502.YReg = memGet(addr)
  checkStatus(s6502.YReg)
}
PCODE('LDY', MODE.IMM, 0xA0, 2, (value) => {s6502.YReg = value; checkStatus(s6502.YReg); return 2})
PCODE('LDY', MODE.ZP_REL, 0xA4, 2, (vZP) => {doLDY(vZP); return 3})
PCODE('LDY', MODE.ZP_X, 0xB4, 2, (vZP) => {doLDY(oneByteAdd(vZP, s6502.XReg)); return 4})
PCODE('LDY', MODE.ABS, 0xAC, 3, (vLo, vHi) => {doLDY(address(vLo, vHi)); return 4})
PCODE('LDY', MODE.ABS_X, 0xBC, 3, (vLo, vHi) => {const addr = twoByteAdd(vLo, vHi, s6502.XReg);
  doLDY(addr); return 4 + pageBoundary(addr, address(vLo, vHi))})

const doLSR = (addr: number) => {
  let v = memGet(addr)
  memGet(addr)  // extra strobe of the address (Sather IIe p. 4-27)
  setCarry((v & 1) === 1)
  v >>= 1
  memSet(addr, v)
  checkStatus(v)}
PCODE('LSR', MODE.IMPLIED, 0x4A, 1, () => {setCarry((s6502.Accum & 1) === 1);
  s6502.Accum >>= 1; checkStatus(s6502.Accum); return 2})
PCODE('LSR', MODE.ZP_REL, 0x46, 2, (vZP) => {doLSR(vZP); return 5})
PCODE('LSR', MODE.ZP_X, 0x56, 2, (vZP) => {doLSR(oneByteAdd(vZP, s6502.XReg)); return 6})
PCODE('LSR', MODE.ABS, 0x4E, 3, (vLo, vHi) => {doLSR(address(vLo, vHi)); return 6})
PCODE('LSR', MODE.ABS_X, 0x5E, 3, (vLo, vHi) => {const addr = twoByteAdd(vLo, vHi, s6502.XReg);
  doLSR(addr);
  return 6 + pageBoundary(addr, address(vLo, vHi))})

PCODE('NOP', MODE.IMPLIED, 0xEA, 1, () => {return 2})

const doORA = (addr: number) => {
  s6502.Accum |= memGet(addr)
  checkStatus(s6502.Accum)
}
PCODE('ORA', MODE.IMM, 0x09, 2, (value) => {s6502.Accum |= value; checkStatus(s6502.Accum); return 2})
PCODE('ORA', MODE.ZP_REL, 0x05, 2, (vZP) => {doORA(vZP); return 3})
PCODE('ORA', MODE.ZP_X, 0x15, 2, (vZP) => {doORA(oneByteAdd(vZP, s6502.XReg)); return 4})
PCODE('ORA', MODE.ABS, 0x0D, 3, (vLo, vHi) => {doORA(address(vLo, vHi)); return 4})
PCODE('ORA', MODE.ABS_X, 0x1D, 3, (vLo, vHi) => {const addr = twoByteAdd(vLo, vHi, s6502.XReg);
  doORA(addr); return 4 + pageBoundary(addr, address(vLo, vHi))})
PCODE('ORA', MODE.ABS_Y, 0x19, 3, (vLo, vHi) => {const addr = twoByteAdd(vLo, vHi, s6502.YReg);
  doORA(addr); return 4 + pageBoundary(addr, address(vLo, vHi))})
PCODE('ORA', MODE.IND_X, 0x01, 2, (vOffset) => {const vZP = oneByteAdd(vOffset, s6502.XReg);
  doORA(address(memGet(vZP), memGet(vZP + 1))); return 6})
PCODE('ORA', MODE.IND_Y, 0x11, 2, (vZP) => doIndirectYinstruction(vZP, doORA, false))
PCODE('ORA', MODE.IND, 0x12, 2, (vZP) => doIndirectInstruction(vZP, doORA, false))

PCODE('PHA', MODE.IMPLIED, 0x48, 1, () => {pushStack("PHA", s6502.Accum); return 3})
PCODE('PHP', MODE.IMPLIED, 0x08, 1, () => {pushStack("PHP", s6502.PStatus | 0x10); return 3})
PCODE('PHX', MODE.IMPLIED, 0xDA, 1, () => {pushStack("PHX", s6502.XReg); return 3})
PCODE('PHY', MODE.IMPLIED, 0x5A, 1, () => {pushStack("PHY", s6502.YReg); return 3})
PCODE('PLA', MODE.IMPLIED, 0x68, 1, () => {s6502.Accum = popStack(); checkStatus(s6502.Accum); return 4})
PCODE('PLP', MODE.IMPLIED, 0x28, 1, () => {setPStatus(popStack()); return 4})
PCODE('PLX', MODE.IMPLIED, 0xFA, 1, () => {s6502.XReg = popStack(); checkStatus(s6502.XReg); return 4})
PCODE('PLY', MODE.IMPLIED, 0x7A, 1, () => {s6502.YReg = popStack(); checkStatus(s6502.YReg); return 4})

const doROL = (addr: number) => {
  let v = memGet(addr)
  memGet(addr)  // extra strobe of the address (Sather IIe p. 4-27)
  const bit0 = isCarry() ? 1 : 0;
  setCarry((v & 128) === 128)
  v = ((v << 1) % 256) | bit0
  memSet(addr, v)
  checkStatus(v)}
PCODE('ROL', MODE.IMPLIED, 0x2A, 1, () => {const bit0 = isCarry() ? 1 : 0;
  setCarry((s6502.Accum & 128) === 128);
  s6502.Accum = ((s6502.Accum << 1) % 256) | bit0; checkStatus(s6502.Accum); return 2})
PCODE('ROL', MODE.ZP_REL, 0x26, 2, (vZP) => {doROL(vZP); return 5})
PCODE('ROL', MODE.ZP_X, 0x36, 2, (vZP) => {doROL(oneByteAdd(vZP, s6502.XReg)); return 6})
PCODE('ROL', MODE.ABS, 0x2E, 3, (vLo, vHi) => {doROL(address(vLo, vHi)); return 6})
PCODE('ROL', MODE.ABS_X, 0x3E, 3, (vLo, vHi) => {const addr = twoByteAdd(vLo, vHi, s6502.XReg);
  doROL(addr);
  return 6 + pageBoundary(addr, address(vLo, vHi))})

const doROR = (addr: number) => {
  let v = memGet(addr)
  memGet(addr)  // extra strobe of the address (Sather IIe p. 4-27)
  const bit7 = isCarry() ? 128 : 0;
  setCarry((v & 1) === 1)
  v = (v >> 1) | bit7
  memSet(addr, v)
  checkStatus(v)}
PCODE('ROR', MODE.IMPLIED, 0x6A, 1, () => {const bit7 = isCarry() ? 128 : 0;
  setCarry((s6502.Accum & 1) === 1);
  s6502.Accum = (s6502.Accum >> 1) | bit7; checkStatus(s6502.Accum); return 2})
PCODE('ROR', MODE.ZP_REL, 0x66, 2, (vZP) => {doROR(vZP); return 5})
PCODE('ROR', MODE.ZP_X, 0x76, 2, (vZP) => {doROR(oneByteAdd(vZP, s6502.XReg)); return 6})
PCODE('ROR', MODE.ABS, 0x6E, 3, (vLo, vHi) => {doROR(address(vLo, vHi)); return 6})
PCODE('ROR', MODE.ABS_X, 0x7E, 3, (vLo, vHi) => {const addr = twoByteAdd(vLo, vHi, s6502.XReg);
  doROR(addr);
  return 6 + pageBoundary(addr, address(vLo, vHi))})

PCODE('RTI', MODE.IMPLIED, 0x40, 1, () => {
  setPStatus(popStack())
  // We don't really care what the break bit is set to, since it will only
  // get looked at after a BRK/IRQ, which will set it automatically.
  setBreak(false)
  setPC(address(popStack(), popStack()) - 1); return 6})

PCODE('RTS', MODE.IMPLIED, 0x60, 1, () => {setPC(address(popStack(), popStack())); return 6})

// 300: F8 38 B8 A9 00 E9 00 D8 00
const doSBC_BCD = (value: number) => {
  // On 65c02, do normal hex subtraction to set the carry & overflow flags.
  const vtmp = 255 - value
  let tmp = s6502.Accum + vtmp + (isCarry() ? 1 : 0)
  const newCarry = (tmp >= 256)
  const bothPositive = (s6502.Accum <= 127 && vtmp <= 127)
  const bothNegative = (s6502.Accum >= 128 && vtmp >= 128)
  setOverflow((tmp % 256) >= 128 ? bothPositive : bothNegative)

  let ones = (s6502.Accum & 0x0F) - (value & 0x0F) + (isCarry() ? 0 : -1)
  tmp = s6502.Accum - value + (isCarry() ? 0 : -1)
  if (tmp < 0) {
    tmp -= 0x60
  }
  if (ones < 0) {
    tmp -= 0x06
  }
  s6502.Accum = tmp & 0xFF
  // Assume we're a 65c02 and set the zero flag properly.
  // This doesn't happen on a 6502 for BCD mode.
  checkStatus(s6502.Accum)
  setCarry(newCarry)
}

const doSBC = (addr: number) => {
  if (BCD()) {
    doSBC_BCD(memGet(addr))
  } else {
    doADC_HEX(255 - memGet(addr))
  }
}

PCODE('SBC', MODE.IMM, 0xE9, 2, (value) => {
  if (BCD()) {doSBC_BCD(value)} else {doADC_HEX(255 - value)}
  return 2 + BCD()})
PCODE('SBC', MODE.ZP_REL, 0xE5, 2, (vZP) =>
  {doSBC(vZP); return 3 + BCD()})
PCODE('SBC', MODE.ZP_X, 0xF5, 2, (vZP) =>
  {doSBC(oneByteAdd(vZP, s6502.XReg)); return 4 + BCD()})
PCODE('SBC', MODE.ABS, 0xED, 3, (vLo, vHi) =>
  {doSBC(address(vLo, vHi)); return 4 + BCD()})
PCODE('SBC', MODE.ABS_X, 0xFD, 3, (vLo, vHi) =>
  {const addr = twoByteAdd(vLo, vHi, s6502.XReg);
  doSBC(addr); return 4 + BCD() + pageBoundary(addr, address(vLo, vHi))})
PCODE('SBC', MODE.ABS_Y, 0xF9, 3, (vLo, vHi) =>
  {const addr = twoByteAdd(vLo, vHi, s6502.YReg);
  doSBC(addr); return 4 + BCD() + pageBoundary(addr, address(vLo, vHi))})
PCODE('SBC', MODE.IND_X, 0xE1, 2, (vOffset) =>
  {const vZP = oneByteAdd(vOffset, s6502.XReg);
  doSBC(address(memGet(vZP), memGet(vZP + 1))); return 6 + BCD()})
PCODE('SBC', MODE.IND_Y, 0xF1, 2, (vZP) =>
  doIndirectYinstruction(vZP, doSBC, true))
PCODE('SBC', MODE.IND, 0xF2, 2, (vZP) =>
  doIndirectInstruction(vZP, doSBC, true))

PCODE('SEC', MODE.IMPLIED, 0x38, 1, () => {setCarry(); return 2})
PCODE('SED', MODE.IMPLIED, 0xF8, 1, () => {setDecimal(); return 2})
PCODE('SEI', MODE.IMPLIED, 0x78, 1, () => {setInterruptDisabled(); return 2})

// Zero Page     STA $44       $85  2   3
// Zero Page,X   STA $44,X     $95  2   4
// Absolute      STA $4400     $8D  3   4
// Absolute,X    STA $4400,X   $9D  3   5
// Absolute,Y    STA $4400,Y   $99  3   5
// Indirect,X    STA ($44,X)   $81  2   6
// Indirect,Y    STA ($44),Y   $91  2   6
PCODE('STA', MODE.ZP_REL, 0x85, 2, (vZP) => {memSet(vZP, s6502.Accum); return 3})
PCODE('STA', MODE.ZP_X, 0x95, 2, (vZP) => {memSet(oneByteAdd(vZP, s6502.XReg), s6502.Accum); return 4})
PCODE('STA', MODE.ABS, 0x8D, 3, (vLo, vHi) => {memSet(address(vLo, vHi), s6502.Accum); return 4})
PCODE('STA', MODE.ABS_X, 0x9D, 3, (vLo, vHi) => {
  const addr = twoByteAdd(vLo, vHi, s6502.XReg)
  memGet(addr)  // extra strobe of the address (Sather IIe p. 4-27)
  memSet(addr, s6502.Accum)
  return 5})
PCODE('STA', MODE.ABS_Y, 0x99, 3, (vLo, vHi) => {memSet(twoByteAdd(vLo, vHi, s6502.YReg), s6502.Accum); return 5})
PCODE('STA', MODE.IND_X, 0x81, 2, (vOffset) => {const vZP = oneByteAdd(vOffset, s6502.XReg);
  memSet(address(memGet(vZP), memGet(vZP + 1)), s6502.Accum); return 6})
const doSTA = (addr: number) => {
  memSet(addr, s6502.Accum)
}
// STA ($FF),Y take 6 cycles, doesn't depend upon page boundary
PCODE('STA', MODE.IND_Y, 0x91, 2, (vZP) => {doIndirectYinstruction(vZP, doSTA, false); return 6})
PCODE('STA', MODE.IND, 0x92, 2, (vZP) => doIndirectInstruction(vZP, doSTA, false))

PCODE('STX', MODE.ZP_REL, 0x86, 2, (vZP) => {memSet(vZP, s6502.XReg); return 3})
PCODE('STX', MODE.ZP_Y, 0x96, 2, (vZP) => {memSet(oneByteAdd(vZP, s6502.YReg), s6502.XReg); return 4})
PCODE('STX', MODE.ABS, 0x8E, 3, (vLo, vHi) => {memSet(address(vLo, vHi), s6502.XReg); return 4})

PCODE('STY', MODE.ZP_REL, 0x84, 2, (vZP) => {memSet(vZP, s6502.YReg); return 3})
PCODE('STY', MODE.ZP_X, 0x94, 2, (vZP) => {memSet(oneByteAdd(vZP, s6502.XReg), s6502.YReg); return 4})
PCODE('STY', MODE.ABS, 0x8C, 3, (vLo, vHi) => {memSet(address(vLo, vHi), s6502.YReg); return 4})

PCODE('STZ', MODE.ZP_REL, 0x64, 2, (vZP) => {memSet(vZP, 0); return 3})
PCODE('STZ', MODE.ZP_X, 0x74, 2, (vZP) => {memSet(oneByteAdd(vZP, s6502.XReg), 0); return 4})
PCODE('STZ', MODE.ABS, 0x9C, 3, (vLo, vHi) => {memSet(address(vLo, vHi), 0); return 4})
PCODE('STZ', MODE.ABS_X, 0x9E, 3, (vLo, vHi) => {
  const addr = twoByteAdd(vLo, vHi, s6502.XReg)
  memGet(addr)  // extra strobe of the address (Sather IIe p. 4-27)
  memSet(addr, 0)
  return 5})

PCODE('TAX', MODE.IMPLIED, 0xAA, 1, () => {s6502.XReg = s6502.Accum; checkStatus(s6502.XReg); return 2})
PCODE('TAY', MODE.IMPLIED, 0xA8, 1, () => {s6502.YReg = s6502.Accum; checkStatus(s6502.YReg); return 2})
PCODE('TSX', MODE.IMPLIED, 0xBA, 1, () => {s6502.XReg = s6502.StackPtr; checkStatus(s6502.XReg); return 2})
PCODE('TXA', MODE.IMPLIED, 0x8A, 1, () => {s6502.Accum = s6502.XReg; checkStatus(s6502.Accum); return 2})
PCODE('TXS', MODE.IMPLIED, 0x9A, 1, () => {s6502.StackPtr = s6502.XReg; return 2})
PCODE('TYA', MODE.IMPLIED, 0x98, 1, () => {s6502.Accum = s6502.YReg; checkStatus(s6502.Accum); return 2})

// Undocumented 65c02 NOP's
// http://www.6502.org/tutorials/65c02opcodes.html
//       x2:     x3:     x4:     x7:     xB:     xC:     xF:
//      -----   -----   -----   -----   -----   -----   -----
// 0x:  2 2 .   1 1 .   . . .   1 1 a   1 1 .   . . .   1 1 c
// 1x:  . . .   1 1 .   . . .   1 1 a   1 1 .   . . .   1 1 c
// 2x:  2 2 .   1 1 .   . . .   1 1 a   1 1 .   . . .   1 1 c
// 3x:  . . .   1 1 .   . . .   1 1 a   1 1 .   . . .   1 1 c
// 4x:  2 2 .   1 1 .   2 3 g   1 1 a   1 1 .   . . .   1 1 c
// 5x:  . . .   1 1 .   2 4 h   1 1 a   1 1 .   3 8 j   1 1 c
// 6x:  2 2 .   1 1 .   . . .   1 1 a   1 1 .   . . .   1 1 c
// 7x:  . . .   1 1 .   . . .   1 1 a   1 1 .   . . .   1 1 c
// 8x:  2 2 .   1 1 .   . . .   1 1 b   1 1 .   . . .   1 1 d
// 9x:  . . .   1 1 .   . . .   1 1 b   1 1 .   . . .   1 1 d
// Ax:  . . .   1 1 .   . . .   1 1 b   1 1 .   . . .   1 1 d
// Bx:  . . .   1 1 .   . . .   1 1 b   1 1 .   . . .   1 1 d
// Cx:  2 2 .   1 1 .   . . .   1 1 b   1 1 e   . . .   1 1 d
// Dx:  . . .   1 1 .   2 4 h   1 1 b   1 1 f   3 4 i   1 1 d
// Ex:  2 2 .   1 1 .   . . .   1 1 b   1 1 .   . . .   1 1 d
// Fx:  . . .   1 1 .   2 4 h   1 1 b   1 1 .   3 4 i   1 1 d
const twoByteNops = [0x02, 0x22, 0x42, 0x62, 0x82, 0xC2, 0xE2]
twoByteNops.forEach(instr => {
  PCODE('NOPX', MODE.IMPLIED, instr, 2, () => {return 2})
});
for (let i = 0; i <= 15; i++) {
  PCODE('NOPX', MODE.IMPLIED, 3 + 16 * i, 1, () => {return 1})
  PCODE('NOPX', MODE.IMPLIED, 7 + 16 * i, 1, () => {return 1})
  PCODE('NOPX', MODE.IMPLIED, 0xB + 16 * i, 1, () => {return 1})  
  PCODE('NOPX', MODE.IMPLIED, 0xF + 16 * i, 1, () => {return 1})  
}
PCODE('NOPX', MODE.IMPLIED, 0x44, 2, () => {return 3})
PCODE('NOPX', MODE.IMPLIED, 0x54, 2, () => {return 4})
PCODE('NOPX', MODE.IMPLIED, 0xD4, 2, () => {return 4})
PCODE('NOPX', MODE.IMPLIED, 0xF4, 2, () => {return 4})
PCODE('NOPX', MODE.IMPLIED, 0x5C, 3, () => {return 8})
PCODE('NOPX', MODE.IMPLIED, 0xDC, 3, () => {return 4})
PCODE('NOPX', MODE.IMPLIED, 0xFC, 3, () => {return 4})

// Fill the rest of the 65c02 with BRK instructions. This avoids needing
// to do a check in processInstruction, and also breaks on a bad op code.
// Turns out there are only 4 of these: 0x04, 0x0C, 0x14, 0x1C
for (let i = 0; i < 256; i++) {
  if (!pcodes[i]) {
    PCODE('BRK', MODE.IMPLIED, i, 1, doBrk)
  }
}