import { memGet, memSet, toHex } from "./motherboard"
// var startTime = performance.now()

export let PStatus = 0;
export let PC = 0;
export let Accum = 0;
export let XReg = 0;
export let YReg = 0;
export let SP = 0;

export enum MODE {
  IMPLIED,  // BRK
  IMM,      // LDA #$01
  ZP_REL,   // LDA $C0 or BCC $FF
  ZP_X,     // LDA $C0,X
  ZP_Y,     // LDX $C0,Y
  ABS,      // LDA $1234
  ABS_X,    // LDA $1234,X
  ABS_Y,    // LDA $1234,Y
  IND_X,    // LDA ($FF,X) or JMP ($1234,X)
  IND_Y,    // LDA ($FF),Y
  IND       // JMP ($1234) or LDA ($C0)
}

export const incrementPC = (value: number) => {
  PC = (PC + value + 65536) % 65536
}

export const setPC = (value: number) => {
  PC = value
}

export const setAccum = (value: number) => {
  Accum = value
}

export const setXregister = (value: number) => {
  XReg = value
}

export const setYregister = (value: number) => {
  YReg = value
}

export const getPStatusString = () => {
  const result = ((PStatus & 0x80) ? 'N' : 'n') +
    ((PStatus & 0x40) ? 'V' : 'v') +
    '-' +
    ((PStatus & 0x10) ? 'B' : 'b') +
    ((PStatus & 0x8) ? 'D' : 'd') +
    ((PStatus & 0x4) ? 'I' : 'i') +
    ((PStatus & 0x2) ? 'Z' : 'z') +
    ((PStatus & 0x1) ? 'C' : 'c')
  return result
}

export const setPStatus = (value: number) => {
  PStatus = value | 0b00100000
}

export const setSP = (value: number) => {
  SP = value
}

const stack = new Array<string>(256).fill('')

export const getStack = () => {
  const result = new Array<string>()
  for (let i = 0xFF; i > SP; i--) {
    let value = "$" + toHex(memGet(0x100 + i))
    let cmd = stack[i]
    if ((stack[i].length > 3) && (i - 1) > SP) {
      if (stack[i-1] === "JSR" || stack[i-1] === "BRK") {
        i--
        value += toHex(memGet(0x100 + i))
      } else {
        cmd = ''
      }
    }
    value = (value + "   ").substring(0, 6)
    result.push(toHex(0x100 + i, 4) + ": " + value + cmd)
  }
  return result
}

const pushStack = (call: string, value: number) => {
  stack[SP] = call
  memSet(0x100 + SP, value)
  SP = (SP + 255) % 256
}

const popStack = () => {
  SP = (SP + 1) % 256;
  return memGet(0x100 + SP);
}

export const isCarry = () => { return ((PStatus & 0x01) !== 0); }
const setCarry = (set = true) => PStatus = set ? PStatus | 1 :
  PStatus & 0b11111110

const isZero = () => { return ((PStatus & 0x02) !== 0); }
const setZero = (set = true) => PStatus = set ? PStatus | 2 :
  PStatus & 0b11111101

// const isInterrupt = () => { return ((PStatus & 0x04) !== 0); }
const setInterrupt = (set = true) => PStatus = set ? PStatus | 4 :
  PStatus & 0b11111011

const isDecimal = () => { return ((PStatus & 0x08) !== 0); }
const BCD = () => (isDecimal() ? 1 : 0)
const setDecimal = (set = true) => PStatus = set ? PStatus | 8 :
  PStatus & 0b11110111

export const isBreak = () => { return ((PStatus & 0x10) !== 0); }
export const setBreak = (set = true) => PStatus = set ? PStatus | 0x10 :
  PStatus & 0b11101111

const isOverflow = () => { return ((PStatus & 0x40) !== 0); }
const setOverflow = (set = true) => PStatus = set ? PStatus | 0x40 :
  PStatus & 0b10111111

const isNegative = () => { return ((PStatus & 0x80) !== 0); }
const setNegative = (set = true) => PStatus = set ? PStatus | 0x80 :
  PStatus & 0b01111111

const checkStatus = (value: number) => {
  setZero(value === 0);
  setNegative(value >= 128);
}

interface PCodeFunc {
  (valueLo: number, valueHi: number): number;
}

export interface PCodeInstr {
    name: string
    mode: MODE
    PC: number
    execute: PCodeFunc
}

// A hack to determine if this is a relative instruction.
export const isRelativeInstr = (instr: string) => instr.startsWith('B') && instr !== "BIT" && instr !== "BRK"

// Return number of clock cycles taken
export const doBranch = (takeBranch: boolean, offset: number) => {
  if (takeBranch) {
    const oldPC = PC
    incrementPC((offset > 127) ? (offset - 256) : offset)
    return 3 + pageBoundary(oldPC, PC)
  }
  return 2
}

const oneByteAdd = (value: number, offset: number) => (value + offset + 256) % 256
export const address = (vLo: number, vHi: number) => (vHi*256 + vLo)
const twoByteAdd = (vLo: number, vHi: number, offset: number) => (vHi*256 + vLo + offset + 65536) % 65536
const pageBoundary = (addr1: number, addr2: number) => (((addr1 >> 8) !== (addr2 >> 8)) ? 1 : 0)

export const pcodes = new Array<PCodeInstr>(256)

const PCODE = (name: string, mode: MODE, pcode: number, PC: number, code: PCodeFunc) => {
  if (pcodes[pcode]) {
    console.error("Duplicate instruction: " + name + " mode=" + mode)
  }
  pcodes[pcode] = {name: name, mode: mode, PC: PC, execute: code}
}

const doIndirectYinstruction = (vZP: number,
  doInstruction: (addr: number) => void,
  addBCD = false) => {
  const vLo = memGet(vZP)
  const vHi = memGet((vZP + 1) % 256)
  const addr = twoByteAdd(vLo, vHi, YReg)
  doInstruction(addr)
  let cycles = 5 + pageBoundary(addr, address(vLo, vHi))
  if (addBCD) cycles += BCD()
  return cycles
}

// 300: F8 18 B8 A9 BD 69 00 D8 00
const doADC_BCD = (value: number) => {
  let ones = (Accum & 0x0F) + (value & 0x0F) + (isCarry() ? 1 : 0)
  // Handle illegal BCD hex values by wrapping to "tens" digit
  if (ones >= 0xA) {
    ones += 6
  }
  let tmp = (Accum & 0xF0) + (value & 0xF0) + ones
  // Pretend we're doing normal addition to set overflow flag
  const bothPositive = (Accum <= 127 && value <= 127)
  const bothNegative = (Accum >= 128 && value >= 128)
  setOverflow((tmp & 0xFF) >= 128 ? bothPositive : bothNegative)
  // Handle illegal BCD hex values by wrapping to "hundreds" digit
  setCarry(tmp >= 0xA0)
  if (isCarry()) {
    tmp += 0x60
  }
  Accum = tmp & 0xFF
  // Assume we're a 65c02 and set the zero flag properly.
  // This doesn't happen on a 6502 for BCD mode.
  checkStatus(Accum)
}

const doADC_HEX = (value: number) => {
  let tmp = Accum + value + (isCarry() ? 1 : 0)
  setCarry(tmp >= 256)
  tmp = tmp % 256
  const bothPositive = (Accum <= 127 && value <= 127)
  const bothNegative = (Accum >= 128 && value >= 128)
  setOverflow(tmp >= 128 ? bothPositive : bothNegative)
  Accum = tmp
  checkStatus(Accum)
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
  {doADC(oneByteAdd(vZP, XReg)); return 4 + BCD()})
PCODE('ADC', MODE.ABS, 0x6D, 3, (vLo, vHi) =>
  {doADC(address(vLo, vHi)); return 4 + BCD()})
PCODE('ADC', MODE.ABS_X, 0x7D, 3, (vLo, vHi) =>
  {const addr = twoByteAdd(vLo, vHi, XReg);
  doADC(addr); return 4 + BCD() + pageBoundary(addr, address(vLo, vHi))})
PCODE('ADC', MODE.ABS_Y, 0x79, 3, (vLo, vHi) =>
  {const addr = twoByteAdd(vLo, vHi, YReg);
  doADC(addr); return 4 + BCD() + pageBoundary(addr, address(vLo, vHi))})
PCODE('ADC', MODE.IND_X, 0x61, 2, (vOffset) =>
  {const vZP = oneByteAdd(vOffset, XReg);
  doADC(address(memGet(vZP), memGet(vZP + 1))); return 6 + BCD()})
PCODE('ADC', MODE.IND_Y, 0x71, 2, (vZP) => doIndirectYinstruction(vZP, doADC, true))

const doAND = (addr: number) => {
  Accum &= memGet(addr)
  checkStatus(Accum)}
PCODE('AND', MODE.IMM, 0x29, 2, (value) => {Accum &= value; checkStatus(Accum); return 2})
PCODE('AND', MODE.ZP_REL, 0x25, 2, (vZP) => {doAND(vZP); return 3})
PCODE('AND', MODE.ZP_X, 0x35, 2, (vZP) => {doAND(oneByteAdd(vZP, XReg)); return 4})
PCODE('AND', MODE.ABS, 0x2D, 3, (vLo, vHi) => {doAND(address(vLo, vHi)); return 4})
PCODE('AND', MODE.ABS_X, 0x3D, 3, (vLo, vHi) => {const addr = twoByteAdd(vLo, vHi, XReg);
  doAND(addr); return 4 + pageBoundary(addr, address(vLo, vHi))})
PCODE('AND', MODE.ABS_Y, 0x39, 3, (vLo, vHi) => {const addr = twoByteAdd(vLo, vHi, YReg);
  doAND(addr); return 4 + pageBoundary(addr, address(vLo, vHi))})
PCODE('AND', MODE.IND_X, 0x21, 2, (vOffset) => {const vZP = oneByteAdd(vOffset, XReg);
  doAND(address(memGet(vZP), memGet(vZP + 1))); return 6})
PCODE('AND', MODE.IND_Y, 0x31, 2, (vZP) => doIndirectYinstruction(vZP, doAND))

const doASL = (addr: number) => {
  let v = memGet(addr)
  setCarry((v & 128) === 128)
  v = (v << 1) % 256
  memSet(addr, v)
  checkStatus(v)}
PCODE('ASL', MODE.IMPLIED, 0x0A, 1, () => {setCarry((Accum & 128) === 128);
  Accum = (Accum << 1) % 256; checkStatus(Accum); return 2})
PCODE('ASL', MODE.ZP_REL, 0x06, 2, (vZP) => {doASL(vZP); return 5})
PCODE('ASL', MODE.ZP_X, 0x16, 2, (vZP) => {doASL(oneByteAdd(vZP, XReg)); return 6})
PCODE('ASL', MODE.ABS, 0x0E, 3, (vLo, vHi) => {doASL(address(vLo, vHi)); return 6})
PCODE('ASL', MODE.ABS_X, 0x1E, 3, (vLo, vHi) => {const addr = twoByteAdd(vLo, vHi, XReg);
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

const doBit = (addr: number) => {
  const value = memGet(addr)
  setZero((Accum & value) === 0);
  setNegative((value & 0b10000000) !== 0);
  setOverflow((value & 0b01000000) !== 0);
}
PCODE('BIT', MODE.ZP_REL, 0x24, 2, (vZP) => {doBit(vZP); return 3})
PCODE('BIT', MODE.ABS, 0x2C, 3, (vLo, vHi) => {doBit(address(vLo, vHi)); return 4})

PCODE('BRK', MODE.IMPLIED, 0x00, 1, () => {
  setBreak();
  memSet(0xC00A, 0)
  memSet(0xC006, 0)
  const PC2 = (PC + 2) % 65536
  const vLo = memGet(0xFFFE)
  const vHi = memGet(0xFFFF)
  pushStack("BRK $" + toHex(vHi) + toHex(vLo), Math.trunc(PC2 / 256))
  pushStack("BRK", PC2 % 256)
  pushStack("S", PStatus)
  setDecimal(false)  // 65c02 only
  setInterrupt()
  PC = twoByteAdd(vLo, vHi, -1);
  return 7})

PCODE('CLC', MODE.IMPLIED, 0x18, 1, () => {setCarry(false); return 2})
PCODE('CLD', MODE.IMPLIED, 0xD8, 1, () => {setDecimal(false); return 2})
PCODE('CLI', MODE.IMPLIED, 0x58, 1, () => {setInterrupt(false); return 2})
PCODE('CLV', MODE.IMPLIED, 0xB8, 1, () => {setOverflow(false); return 2})

const doCMP = (addr: number) => {
  setCarry(Accum >= memGet(addr))
  checkStatus((Accum - memGet(addr) + 256) % 256)
}
PCODE('CMP', MODE.IMM, 0xC9, 2, (value) => {setCarry(Accum >= value);
  checkStatus((Accum - value + 256) % 256); return 2})
PCODE('CMP', MODE.ZP_REL, 0xC5, 2, (vZP) => {doCMP(vZP); return 3})
PCODE('CMP', MODE.ZP_X, 0xD5, 2, (vZP) => {doCMP(oneByteAdd(vZP, XReg)); return 4})
PCODE('CMP', MODE.ABS, 0xCD, 3, (vLo, vHi) => {doCMP(address(vLo, vHi)); return 4})
PCODE('CMP', MODE.ABS_X, 0xDD, 3, (vLo, vHi) => {const addr = twoByteAdd(vLo, vHi, XReg);
  doCMP(addr); return 4 + pageBoundary(addr, address(vLo, vHi))})
PCODE('CMP', MODE.ABS_Y, 0xD9, 3, (vLo, vHi) => {const addr = twoByteAdd(vLo, vHi, YReg);
  doCMP(addr); return 4 + pageBoundary(addr, address(vLo, vHi))})
PCODE('CMP', MODE.IND_X, 0xC1, 2, (vOffset) => {const vZP = oneByteAdd(vOffset, XReg);
  doCMP(address(memGet(vZP), memGet(vZP + 1))); return 6})
PCODE('CMP', MODE.IND_Y, 0xD1, 2, (vZP) => doIndirectYinstruction(vZP, doCMP))

const doCPX = (addr: number) => {
  setCarry(XReg >= memGet(addr))
  checkStatus((XReg - memGet(addr) + 256) % 256)
}
PCODE('CPX', MODE.IMM, 0xE0, 2, (value) => {setCarry(XReg >= value);
  checkStatus((XReg - value + 256) % 256); return 2})
PCODE('CPX', MODE.ZP_REL, 0xE4, 2, (vZP) => {doCPX(vZP); return 3})
PCODE('CPX', MODE.ABS, 0xEC, 3, (vLo, vHi) => {doCPX(address(vLo, vHi)); return 4})

const doCPY = (addr: number) => {
  setCarry(YReg >= memGet(addr))
  checkStatus((YReg - memGet(addr) + 256) % 256)
}
PCODE('CPY', MODE.IMM, 0xC0, 2, (value) => {setCarry(YReg >= value);
  checkStatus((YReg - value + 256) % 256); return 2})
PCODE('CPY', MODE.ZP_REL, 0xC4, 2, (vZP) => {doCPY(vZP); return 3})
PCODE('CPY', MODE.ABS, 0xCC, 3, (vLo, vHi) => {doCPY(address(vLo, vHi)); return 4})

const doDEC = (addr: number) => {
  const v = oneByteAdd(memGet(addr), -1)
  memSet(addr, v)
  checkStatus(v)
}
PCODE('DEC', MODE.ZP_REL, 0xC6, 2, (vZP) => {doDEC(vZP); return 5})
PCODE('DEC', MODE.ZP_X, 0xD6, 2, (vZP) => {doDEC(oneByteAdd(vZP, XReg)); return 6})
PCODE('DEC', MODE.ABS, 0xCE, 3, (vLo, vHi) => {doDEC(address(vLo, vHi)); return 6})
PCODE('DEC', MODE.ABS_X, 0xDE, 3, (vLo, vHi) => {doDEC(twoByteAdd(vLo, vHi, XReg)); return 7})

PCODE('DEX', MODE.IMPLIED, 0xCA, 1, () => {XReg = oneByteAdd(XReg, -1);
  checkStatus(XReg); return 2})
PCODE('DEY', MODE.IMPLIED, 0x88, 1, () => {YReg = oneByteAdd(YReg, -1);
  checkStatus(YReg); return 2})

const doEOR = (addr: number) => {
  Accum ^= memGet(addr)
  checkStatus(Accum)
}
PCODE('EOR', MODE.IMM, 0x49, 2, (value) => {Accum ^= value; checkStatus(Accum); return 2})
PCODE('EOR', MODE.ZP_REL, 0x45, 2, (vZP) => {doEOR(vZP); return 3})
PCODE('EOR', MODE.ZP_X, 0x55, 2, (vZP) => {doEOR(oneByteAdd(vZP, XReg)); return 4})
PCODE('EOR', MODE.ABS, 0x4D, 3, (vLo, vHi) => {doEOR(address(vLo, vHi)); return 4})
PCODE('EOR', MODE.ABS_X, 0x5D, 3, (vLo, vHi) => {const addr = twoByteAdd(vLo, vHi, XReg);
  doEOR(addr); return 4 + pageBoundary(addr, address(vLo, vHi))})
PCODE('EOR', MODE.ABS_Y, 0x59, 3, (vLo, vHi) => {const addr = twoByteAdd(vLo, vHi, YReg);
  doEOR(addr); return 4 + pageBoundary(addr, address(vLo, vHi))})
PCODE('EOR', MODE.IND_X, 0x41, 2, (vOffset) => {const vZP = oneByteAdd(vOffset, XReg);
  doEOR(address(memGet(vZP), memGet(vZP + 1))); return 6})
PCODE('EOR', MODE.IND_Y, 0x51, 2, (vZP) => doIndirectYinstruction(vZP, doEOR))

const doINC = (addr: number) => {
  const v = oneByteAdd(memGet(addr), 1)
  memSet(addr, v)
  checkStatus(v)
}
PCODE('INC', MODE.ZP_REL, 0xE6, 2, (vZP) => {doINC(vZP); return 5})
PCODE('INC', MODE.ZP_X, 0xF6, 2, (vZP) => {doINC(oneByteAdd(vZP, XReg)); return 6})
PCODE('INC', MODE.ABS, 0xEE, 3, (vLo, vHi) => {doINC(address(vLo, vHi)); return 6})
PCODE('INC', MODE.ABS_X, 0xFE, 3, (vLo, vHi) => {doINC(twoByteAdd(vLo, vHi, XReg)); return 7})

PCODE('INX', MODE.IMPLIED, 0xE8, 1, () => {XReg = oneByteAdd(XReg, 1);
  checkStatus(XReg); return 2})
PCODE('INY', MODE.IMPLIED, 0xC8, 1, () => {YReg = oneByteAdd(YReg, 1);
  checkStatus(YReg); return 2})

PCODE('JMP', MODE.ABS, 0x4C, 3, (vLo, vHi) => {PC = twoByteAdd(vLo, vHi, -3); return 3})
// 65c02 - this fixes the 6502 indirect JMP bug across page boundaries
PCODE('JMP', MODE.IND, 0x6C, 3, (vLo, vHi) => {const a = address(vLo, vHi);
  vLo = memGet(a); vHi = memGet((a + 1) % 65536); PC = twoByteAdd(vLo, vHi, -3); return 6})
PCODE('JMP', MODE.IND_X, 0x7C, 3, (vLo, vHi) => {const a = twoByteAdd(vLo, vHi, XReg);
  vLo = memGet(a); vHi = memGet((a + 1) % 65536); PC = twoByteAdd(vLo, vHi, -3); return 6})

PCODE('JSR', MODE.ABS, 0x20, 3, (vLo, vHi) => {
  const PC2 = (PC + 2) % 65536
  pushStack("JSR $" + toHex(vHi) + toHex(vLo), Math.trunc(PC2 / 256));
  pushStack("JSR", PC2 % 256);
  PC = twoByteAdd(vLo, vHi, -3); return 6})

const doLDA = (addr: number) => {
  Accum = memGet(addr)
  checkStatus(Accum)
}
PCODE('LDA', MODE.IMM, 0xA9, 2, (value) => {Accum = value; checkStatus(Accum); return 2})
PCODE('LDA', MODE.ZP_REL, 0xA5, 2, (vZP) => {doLDA(vZP); return 3})
PCODE('LDA', MODE.ZP_X, 0xB5, 2, (vZP) => {doLDA(oneByteAdd(vZP, XReg)); return 4})
PCODE('LDA', MODE.ABS, 0xAD, 3, (vLo, vHi) => {doLDA(address(vLo, vHi)); return 4})
PCODE('LDA', MODE.ABS_X, 0xBD, 3, (vLo, vHi) => {const addr = twoByteAdd(vLo, vHi, XReg);
  doLDA(addr); return 4 + pageBoundary(addr, address(vLo, vHi))})
PCODE('LDA', MODE.ABS_Y, 0xB9, 3, (vLo, vHi) => {const addr = twoByteAdd(vLo, vHi, YReg);
  doLDA(addr); return 4 + pageBoundary(addr, address(vLo, vHi))})
PCODE('LDA', MODE.IND_X, 0xA1, 2, (vOffset) => {const vZP = oneByteAdd(vOffset, XReg);
  doLDA(address(memGet(vZP), memGet((vZP + 1) % 256))); return 6})
PCODE('LDA', MODE.IND_Y, 0xB1, 2, (vZP) => doIndirectYinstruction(vZP, doLDA))
PCODE('LDA', MODE.IND, 0xB2, 2, (vZP) => {
  doLDA(address(memGet(vZP), memGet((vZP + 1) % 256))); return 5})

const doLDX = (addr: number) => {
  XReg = memGet(addr)
  checkStatus(XReg)
}
PCODE('LDX', MODE.IMM, 0xA2, 2, (value) => {XReg = value; checkStatus(XReg); return 2})
PCODE('LDX', MODE.ZP_REL, 0xA6, 2, (vZP) => {doLDX(vZP); return 3})
PCODE('LDX', MODE.ZP_Y, 0xB6, 2, (vZP) => {doLDX(oneByteAdd(vZP, YReg)); return 4})
PCODE('LDX', MODE.ABS, 0xAE, 3, (vLo, vHi) => {doLDX(address(vLo, vHi)); return 4})
PCODE('LDX', MODE.ABS_Y, 0xBE, 3, (vLo, vHi) => {const addr = twoByteAdd(vLo, vHi, YReg);
  doLDX(addr); return 4 + pageBoundary(addr, address(vLo, vHi))})

const doLDY = (addr: number) => {
  YReg = memGet(addr)
  checkStatus(YReg)
}
PCODE('LDY', MODE.IMM, 0xA0, 2, (value) => {YReg = value; checkStatus(YReg); return 2})
PCODE('LDY', MODE.ZP_REL, 0xA4, 2, (vZP) => {doLDY(vZP); return 3})
PCODE('LDY', MODE.ZP_X, 0xB4, 2, (vZP) => {doLDY(oneByteAdd(vZP, XReg)); return 4})
PCODE('LDY', MODE.ABS, 0xAC, 3, (vLo, vHi) => {doLDY(address(vLo, vHi)); return 4})
PCODE('LDY', MODE.ABS_X, 0xBC, 3, (vLo, vHi) => {const addr = twoByteAdd(vLo, vHi, XReg);
  doLDY(addr); return 4 + pageBoundary(addr, address(vLo, vHi))})

const doLSR = (addr: number) => {
  let v = memGet(addr)
  setCarry((v & 1) === 1)
  v >>= 1
  memSet(addr, v)
  checkStatus(v)}
PCODE('LSR', MODE.IMPLIED, 0x4A, 1, () => {setCarry((Accum & 1) === 1);
  Accum >>= 1; checkStatus(Accum); return 2})
PCODE('LSR', MODE.ZP_REL, 0x46, 2, (vZP) => {doLSR(vZP); return 5})
PCODE('LSR', MODE.ZP_X, 0x56, 2, (vZP) => {doLSR(oneByteAdd(vZP, XReg)); return 6})
PCODE('LSR', MODE.ABS, 0x4E, 3, (vLo, vHi) => {doLSR(address(vLo, vHi)); return 6})
PCODE('LSR', MODE.ABS_X, 0x5E, 3, (vLo, vHi) => {const addr = twoByteAdd(vLo, vHi, XReg);
  doLSR(addr);
  return 6 + pageBoundary(addr, address(vLo, vHi))})

PCODE('NOP', MODE.IMPLIED, 0xEA, 1, () => {return 2})

const doORA = (addr: number) => {
  Accum |= memGet(addr)
  checkStatus(Accum)
}
PCODE('ORA', MODE.IMM, 0x09, 2, (value) => {Accum |= value; checkStatus(Accum); return 2})
PCODE('ORA', MODE.ZP_REL, 0x05, 2, (vZP) => {doORA(vZP); return 3})
PCODE('ORA', MODE.ZP_X, 0x15, 2, (vZP) => {doORA(oneByteAdd(vZP, XReg)); return 4})
PCODE('ORA', MODE.ABS, 0x0D, 3, (vLo, vHi) => {doORA(address(vLo, vHi)); return 4})
PCODE('ORA', MODE.ABS_X, 0x1D, 3, (vLo, vHi) => {const addr = twoByteAdd(vLo, vHi, XReg);
  doORA(addr); return 4 + pageBoundary(addr, address(vLo, vHi))})
PCODE('ORA', MODE.ABS_Y, 0x19, 3, (vLo, vHi) => {const addr = twoByteAdd(vLo, vHi, YReg);
  doORA(addr); return 4 + pageBoundary(addr, address(vLo, vHi))})
PCODE('ORA', MODE.IND_X, 0x01, 2, (vOffset) => {const vZP = oneByteAdd(vOffset, XReg);
  doORA(address(memGet(vZP), memGet(vZP + 1))); return 6})
PCODE('ORA', MODE.IND_Y, 0x11, 2, (vZP) => doIndirectYinstruction(vZP, doORA))

PCODE('PHA', MODE.IMPLIED, 0x48, 1, () => {pushStack("A", Accum); return 3})
PCODE('PHP', MODE.IMPLIED, 0x08, 1, () => {pushStack("S", PStatus); return 3})
PCODE('PHX', MODE.IMPLIED, 0xDA, 1, () => {pushStack("X", XReg); return 3})
PCODE('PHY', MODE.IMPLIED, 0x5A, 1, () => {pushStack("Y", YReg); return 3})
PCODE('PLA', MODE.IMPLIED, 0x68, 1, () => {Accum = popStack(); checkStatus(Accum); return 4})
PCODE('PLP', MODE.IMPLIED, 0x28, 1, () => {setPStatus(popStack()); return 4})
PCODE('PLX', MODE.IMPLIED, 0xFA, 1, () => {XReg = popStack(); checkStatus(XReg); return 4})
PCODE('PLY', MODE.IMPLIED, 0x7A, 1, () => {YReg = popStack(); checkStatus(YReg); return 4})

const doROL = (addr: number) => {
  let v = memGet(addr)
  const bit0 = isCarry() ? 1 : 0;
  setCarry((v & 128) === 128)
  v = ((v << 1) % 256) | bit0
  memSet(addr, v)
  checkStatus(v)}
PCODE('ROL', MODE.IMPLIED, 0x2A, 1, () => {const bit0 = isCarry() ? 1 : 0;
  setCarry((Accum & 128) === 128);
  Accum = ((Accum << 1) % 256) | bit0; checkStatus(Accum); return 2})
PCODE('ROL', MODE.ZP_REL, 0x26, 2, (vZP) => {doROL(vZP); return 5})
PCODE('ROL', MODE.ZP_X, 0x36, 2, (vZP) => {doROL(oneByteAdd(vZP, XReg)); return 6})
PCODE('ROL', MODE.ABS, 0x2E, 3, (vLo, vHi) => {doROL(address(vLo, vHi)); return 6})
PCODE('ROL', MODE.ABS_X, 0x3E, 3, (vLo, vHi) => {const addr = twoByteAdd(vLo, vHi, XReg);
  doROL(addr);
  return 6 + pageBoundary(addr, address(vLo, vHi))})

const doROR = (addr: number) => {
  let v = memGet(addr)
  const bit7 = isCarry() ? 128 : 0;
  setCarry((v & 1) === 1)
  v = (v >> 1) | bit7
  memSet(addr, v)
  checkStatus(v)}
PCODE('ROR', MODE.IMPLIED, 0x6A, 1, () => {const bit7 = isCarry() ? 128 : 0;
  setCarry((Accum & 1) === 1);
  Accum = (Accum >> 1) | bit7; checkStatus(Accum); return 2})
PCODE('ROR', MODE.ZP_REL, 0x66, 2, (vZP) => {doROR(vZP); return 5})
PCODE('ROR', MODE.ZP_X, 0x76, 2, (vZP) => {doROR(oneByteAdd(vZP, XReg)); return 6})
PCODE('ROR', MODE.ABS, 0x6E, 3, (vLo, vHi) => {doROR(address(vLo, vHi)); return 6})
PCODE('ROR', MODE.ABS_X, 0x7E, 3, (vLo, vHi) => {const addr = twoByteAdd(vLo, vHi, XReg);
  doROR(addr);
  return 6 + pageBoundary(addr, address(vLo, vHi))})

PCODE('RTS', MODE.IMPLIED, 0x60, 1, () => {PC = address(popStack(), popStack()); return 6})

// 300: F8 38 B8 A9 00 E9 00 D8 00
const doSBC_BCD = (value: number) => {
  // On 65c02, do normal hex subtraction to set the carry & overflow flags.
  const vtmp = 255 - value
  let tmp = Accum + vtmp + (isCarry() ? 1 : 0)
  const newCarry = (tmp >= 256)
  const bothPositive = (Accum <= 127 && vtmp <= 127)
  const bothNegative = (Accum >= 128 && vtmp >= 128)
  setOverflow((tmp % 256) >= 128 ? bothPositive : bothNegative)

  let ones = (Accum & 0x0F) - (value & 0x0F) + (isCarry() ? 0 : -1)
  tmp = Accum - value + (isCarry() ? 0 : -1)
  if (tmp < 0) {
    tmp -= 0x60
  }
  if (ones < 0) {
    tmp -= 0x06
  }
  Accum = tmp & 0xFF
  // Assume we're a 65c02 and set the zero flag properly.
  // This doesn't happen on a 6502 for BCD mode.
  checkStatus(Accum)
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
  {doSBC(oneByteAdd(vZP, XReg)); return 4 + BCD()})
PCODE('SBC', MODE.ABS, 0xED, 3, (vLo, vHi) =>
  {doSBC(address(vLo, vHi)); return 4 + BCD()})
PCODE('SBC', MODE.ABS_X, 0xFD, 3, (vLo, vHi) =>
  {const addr = twoByteAdd(vLo, vHi, XReg);
  doSBC(addr); return 4 + BCD() + pageBoundary(addr, address(vLo, vHi))})
PCODE('SBC', MODE.ABS_Y, 0xF9, 3, (vLo, vHi) =>
  {const addr = twoByteAdd(vLo, vHi, YReg);
  doSBC(addr); return 4 + BCD() + pageBoundary(addr, address(vLo, vHi))})
PCODE('SBC', MODE.IND_X, 0xE1, 2, (vOffset) =>
  {const vZP = oneByteAdd(vOffset, XReg);
  doSBC(address(memGet(vZP), memGet(vZP + 1))); return 6 + BCD()})
PCODE('SBC', MODE.IND_Y, 0xF1, 2, (vZP) =>
  doIndirectYinstruction(vZP, doSBC, true))

PCODE('SEC', MODE.IMPLIED, 0x38, 1, () => {setCarry(); return 2})
PCODE('SED', MODE.IMPLIED, 0xF8, 1, () => {setDecimal(); return 2})
PCODE('SEI', MODE.IMPLIED, 0x78, 1, () => {setInterrupt(); return 2})

// Zero Page     STA $44       $85  2   3
// Zero Page,X   STA $44,X     $95  2   4
// Absolute      STA $4400     $8D  3   4
// Absolute,X    STA $4400,X   $9D  3   5
// Absolute,Y    STA $4400,Y   $99  3   5
// Indirect,X    STA ($44,X)   $81  2   6
// Indirect,Y    STA ($44),Y   $91  2   6
PCODE('STA', MODE.ZP_REL, 0x85, 2, (vZP) => {memSet(vZP, Accum); return 3})
PCODE('STA', MODE.ZP_X, 0x95, 2, (vZP) => {memSet(oneByteAdd(vZP, XReg), Accum); return 4})
PCODE('STA', MODE.ABS, 0x8D, 3, (vLo, vHi) => {memSet(address(vLo, vHi), Accum); return 4})
PCODE('STA', MODE.ABS_X, 0x9D, 3, (vLo, vHi) => {memSet(twoByteAdd(vLo, vHi, XReg), Accum); return 5})
PCODE('STA', MODE.ABS_Y, 0x99, 3, (vLo, vHi) => {memSet(twoByteAdd(vLo, vHi, YReg), Accum); return 5})
PCODE('STA', MODE.IND_X, 0x81, 2, (vOffset) => {const vZP = oneByteAdd(vOffset, XReg);
  memSet(address(memGet(vZP), memGet(vZP + 1)), Accum); return 6})
const doSTA = (addr: number) => {
  memSet(addr, Accum)
}
// STA ($FF),Y take 6 cycles, doesn't depend upon page boundary
PCODE('STA', MODE.IND_Y, 0x91, 2, (vZP) => {doIndirectYinstruction(vZP, doSTA); return 6})

PCODE('STX', MODE.ZP_REL, 0x86, 2, (vZP) => {memSet(vZP, XReg); return 3})
PCODE('STX', MODE.ZP_Y, 0x96, 2, (vZP) => {memSet(oneByteAdd(vZP, YReg), XReg); return 4})
PCODE('STX', MODE.ABS, 0x8E, 3, (vLo, vHi) => {memSet(address(vLo, vHi), XReg); return 4})

PCODE('STY', MODE.ZP_REL, 0x84, 2, (vZP) => {memSet(vZP, YReg); return 3})
PCODE('STY', MODE.ZP_X, 0x94, 2, (vZP) => {memSet(oneByteAdd(vZP, XReg), YReg); return 4})
PCODE('STY', MODE.ABS, 0x8C, 3, (vLo, vHi) => {memSet(address(vLo, vHi), YReg); return 4})

PCODE('TAX', MODE.IMPLIED, 0xAA, 1, () => {XReg = Accum; checkStatus(XReg); return 2})
PCODE('TAY', MODE.IMPLIED, 0xA8, 1, () => {YReg = Accum; checkStatus(YReg); return 2})
PCODE('TSX', MODE.IMPLIED, 0xBA, 1, () => {XReg = SP; checkStatus(XReg); return 2})
PCODE('TXA', MODE.IMPLIED, 0x8A, 1, () => {Accum = XReg; checkStatus(Accum); return 2})
PCODE('TXS', MODE.IMPLIED, 0x9A, 1, () => {SP = XReg; return 2})
PCODE('TYA', MODE.IMPLIED, 0x98, 1, () => {Accum = YReg; checkStatus(Accum); return 2})

// var endTime = performance.now()
// console.log("PCODE time = " + (endTime - startTime))