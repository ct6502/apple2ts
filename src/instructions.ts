import { rom } from "./roms/rom_2+.base64";
import { Buffer } from "buffer";

// var startTime = performance.now()

export let PStatus = 0b00100100;
export let PC = 0x2000;
export let bank0 = new Uint8Array(65536).fill(46); // "."
export let Accum = 0;
export let XReg = 0;
export let YReg = 0;
export let SP = 0xFF;

bank0.set(Buffer.from(rom.replaceAll('\n', ''), 'base64'), 0xC000)

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

export const setXregister = (value: number) => {
  XReg = value
}

const pushStack = (value: number) => {
  bank0[0x100 + SP] = value;
  SP = (SP + 255) % 256;
}

const popStack = () => {
  SP = (SP + 1) % 256;
  return bank0[0x100 + SP];
}

export const toHex = (value: number, ndigits = 2) => {
  return ('0000' + value.toString(16).toUpperCase()).slice(-ndigits)
}

export const getProcessorStatus = () => {
  return `${toHex(PC,4)}-  A=${toHex(Accum)} X=${toHex(XReg)} ` + 
  `Y=${toHex(YReg)} P=${toHex(PStatus)} S=${toHex(SP)}`
}


const modeString = (mode: MODE) => {
  let prefix = ''
  let suffix = ''
  switch (mode) {
    case MODE.IMM:
      prefix = '#'
      break
    case MODE.ZP_X:
    case MODE.ABS_X:
      suffix = ",X"
      break;
    case MODE.ZP_Y:
    case MODE.ABS_Y:
      suffix = ",Y"
      break;
    case MODE.IND:
      prefix = '('
      suffix = ")"
      break
    case MODE.IND_X:
      prefix = '('
      suffix = ",X)"
      break
    case MODE.IND_Y:
      prefix = '('
      suffix = "),Y"
      break
  }
  return [prefix, suffix]
}


export const getInstrString = (instr: number, vLo: number, vHi: number) => {
  const code = pcodes[instr]
  let result = toHex(instr) + " "
  if (code) {
    let [prefix, suffix] = modeString(code.mode)
    if (code.PC >= 2) {
      prefix = `    ${code.name}   ${prefix}$`
      result += `${toHex(vLo)} `
    }
    switch (code.PC) {
      case 1:
        result += `         ${code.name}`
        break;
      case 2:
        result += `  ${prefix}${toHex(vLo)}${suffix}`
        break;
      case 3:
        result += `${toHex(vHi)}${prefix}${toHex(address(vLo, vHi), 4)}${suffix}`
        break;
    }
  } else {
    result += "         ???"
  }
  return result
}


export const isCarry = () => { return ((PStatus & 0x01) !== 0); }
const setCarry = (set = true) => PStatus = set ? PStatus | 1 : PStatus & 254

const isZero = () => { return ((PStatus & 0x02) !== 0); }
const setZero = (set = true) => PStatus = set ? PStatus | 2 : PStatus & 253

// const isInterrupt = () => { return ((PStatus & 0x04) !== 0); }
const setInterrupt = (set = true) => PStatus = set ? PStatus | 4 : PStatus & 251

// const isDecimal = () => { return ((PStatus & 0x08) !== 0); }
const setDecimal = (set = true) => PStatus = set ? PStatus | 8 : PStatus & 247

export const isBreak = () => { return ((PStatus & 0x10) !== 0); }
export const setBreak = (set = true) => PStatus = set ? PStatus | 0x10 : PStatus & 239

const isOverflow = () => { return ((PStatus & 0x40) !== 0); }
const setOverflow = (set = true) => PStatus = set ? PStatus | 0x40 : PStatus & 191

const isNegative = () => { return ((PStatus & 0x80) !== 0); }
const setNegative = (set = true) => PStatus = set ? PStatus | 0x80 : PStatus & 127

const checkStatus = (value: number) => {
  setZero(value === 0);
  setNegative(value >= 128);
}

const doADC = (value: number) => {
  let tmp = Accum + value + (isCarry() ? 1 : 0)
  setCarry(tmp >= 256)
  tmp = tmp % 256
  const bothPositive = (Accum <= 127 && value <= 127)
  const bothNegative = (Accum >= 128 && value >= 128)
  setOverflow(tmp >= 128 ? bothPositive : bothNegative)
  Accum = tmp
  checkStatus(Accum)
}

interface PCodeFunc {
  (valueLo: number, valueHi: number): void;
}

export interface PCodeInstr {
    name: string
    mode: MODE
    PC: number
    execute: PCodeFunc
}

export const doBranch = (offset: number) => {
  PC += ((offset > 127) ? (offset - 256) : offset);
}

const oneByteAdd = (value: number, offset: number) => (value + offset + 256) % 256
export const address = (vLo: number, vHi: number) => (vHi*256 + vLo)
const twoByteAdd = (vLo: number, vHi: number, offset: number) => (vHi*256 + vLo + offset + 65536) % 65536

export const pcodes = new Array<PCodeInstr>(256)

const PCODE = (name: string, mode: MODE, pcode: number, PC: number, code: PCodeFunc) => {
  if (pcodes[pcode]) {
    console.error("Duplicate instruction: " + name + " mode=" + mode)
  }
  pcodes[pcode] = {name: name, mode: mode, PC: PC, execute: code}
}

PCODE('ADC', MODE.IMM, 0x69, 2, (value) => doADC(value))
PCODE('ADC', MODE.ZP_REL, 0x65, 2, (vZP) => doADC(bank0[vZP]))

PCODE('AND', MODE.IMM, 0x29, 2, (value) => {Accum &= value; checkStatus(Accum)})

const doASL = (addr: number) => {
  let v = bank0[addr]
  setCarry((v & 128) === 128)
  v <<= 1
  checkStatus(v)
  bank0[addr] = v}
PCODE('ASL', MODE.IMPLIED, 0x0A, 1, () => {setCarry((Accum & 128) === 128);
  Accum <<= 1; checkStatus(Accum)})
PCODE('ASL', MODE.ZP_REL, 0x06, 2, (vZP) => doASL(vZP))
PCODE('ASL', MODE.ZP_X, 0x16, 2, (vZP) => doASL(oneByteAdd(vZP, XReg)))
PCODE('ASL', MODE.ABS, 0x0E, 3, (vLo, vHi) => doASL(address(vLo, vHi)))
PCODE('ASL', MODE.ABS_X, 0x1E, 3, (vLo, vHi) => doASL(twoByteAdd(vLo, vHi, XReg)))

PCODE('BCC', MODE.ZP_REL, 0x90, 2, (value) => {if (!isCarry()) {doBranch(value)}})
PCODE('BCS', MODE.ZP_REL, 0xB0, 2, (value) => {if (isCarry()) {doBranch(value)}})
PCODE('BEQ', MODE.ZP_REL, 0xF0, 2, (value) => {if (isZero()) {doBranch(value)}})
PCODE('BMI', MODE.ZP_REL, 0x30, 2, (value) => {if (isNegative()) {doBranch(value)}})
PCODE('BNE', MODE.ZP_REL, 0xD0, 2, (value) => {if (!isZero()) {doBranch(value)}})
PCODE('BPL', MODE.ZP_REL, 0x10, 2, (value) => {if (!isNegative()) {doBranch(value)}})
PCODE('BVC', MODE.ZP_REL, 0x50, 2, (value) => {if (!isOverflow()) {doBranch(value)}})
PCODE('BVS', MODE.ZP_REL, 0x70, 2, (value) => {if (isOverflow()) {doBranch(value)}})

const doBit = (value: number) => {
  setZero((Accum & value) === 0);
  setNegative((value & 0b10000000) !== 0);
  setOverflow((value & 0b01000000) !== 0);
}
PCODE('BIT', MODE.ZP_REL, 0x24, 2, (vZP) => doBit(bank0[vZP]))
PCODE('BIT', MODE.ABS, 0x2C, 3, (vLo, vHi) => doBit(bank0[address(vLo, vHi)]))

PCODE('BRK', MODE.IMPLIED, 0x00, 1, () => {setBreak()})

PCODE('CLC', MODE.IMPLIED, 0x18, 1, () => {setCarry(false)})
PCODE('CLD', MODE.IMPLIED, 0xD8, 1, () => {setDecimal(false)})
PCODE('CLI', MODE.IMPLIED, 0x58, 1, () => {setInterrupt(false)})
PCODE('CLV', MODE.IMPLIED, 0xB8, 1, () => {setOverflow(false)})

PCODE('CMP', MODE.IMM, 0xC9, 2, (value) => {const tmp = Accum - value;
  setCarry(tmp >= 0); checkStatus(tmp)})

PCODE('DEX', MODE.IMPLIED, 0xCA, 1, () => {XReg = oneByteAdd(XReg, -1); checkStatus(XReg)})
PCODE('DEY', MODE.IMPLIED, 0x88, 1, () => {YReg = oneByteAdd(YReg, -1); checkStatus(YReg)})

PCODE('INC', MODE.ABS, 0xEE, 3, (vLo, vHi) => {const addr = address(vLo, vHi); let v = bank0[addr];
  v = oneByteAdd(v, 1); bank0[addr] = v; checkStatus(v)})

PCODE('INX', MODE.IMPLIED, 0xE8, 1, () => {XReg = oneByteAdd(XReg, 1); checkStatus(XReg)})
PCODE('INY', MODE.IMPLIED, 0xCB, 1, () => {YReg = oneByteAdd(YReg, 1); checkStatus(YReg)})

PCODE('JMP', MODE.ABS, 0x4C, 3, (vLo, vHi) => {PC = twoByteAdd(vLo, vHi, -3)})
// 65c02 - this fixes the 6502 indirect JMP bug across page boundaries
PCODE('JMP', MODE.IND, 0x6C, 3, (vLo, vHi) => {const a = address(vLo, vHi);
  vLo = bank0[a]; vHi = bank0[(a + 1) % 65536]; PC = twoByteAdd(vLo, vHi, -3)})
PCODE('JMP', MODE.IND_X, 0x7C, 3, (vLo, vHi) => {const a = twoByteAdd(vLo, vHi, XReg);
  vLo = bank0[a]; vHi = bank0[(a + 1) % 65536]; PC = twoByteAdd(vLo, vHi, -3)})

PCODE('JSR', MODE.ABS, 0x20, 3, (vLo, vHi) => {
  pushStack(Math.trunc((PC + 2) / 256)); pushStack((PC + 2) % 256);
  PC = twoByteAdd(vLo, vHi, -3)})

PCODE('LDA', MODE.IMM, 0xA9, 2, (value) => {Accum = value; checkStatus(Accum)})
PCODE('LDA', MODE.ZP_REL, 0xA5, 2, (vZP) => {Accum = bank0[vZP]; checkStatus(Accum)})
PCODE('LDA', MODE.ZP_X, 0xB5, 2, (vZP) => {Accum = bank0[oneByteAdd(vZP, XReg)];
  checkStatus(Accum)})
PCODE('LDA', MODE.ABS, 0xAD, 3, (vLo, vHi) => {Accum = bank0[address(vLo, vHi)];
  checkStatus(Accum)})
PCODE('LDA', MODE.ABS_X, 0xBD, 3, (vLo, vHi) => {Accum = bank0[twoByteAdd(vLo, vHi, XReg)];
  checkStatus(Accum)})
PCODE('LDA', MODE.ABS_Y, 0xB9, 3, (vLo, vHi) => {Accum = bank0[twoByteAdd(vLo, vHi, YReg)];
  checkStatus(Accum)})
PCODE('LDA', MODE.IND_X, 0xA1, 2, (vOffset) => {const vZP = oneByteAdd(vOffset, XReg);
  Accum = bank0[address(bank0[vZP], bank0[vZP + 1])]; checkStatus(Accum)})
PCODE('LDA', MODE.IND_Y, 0xB1, 2, (vZP) => {
  Accum = bank0[twoByteAdd(bank0[vZP], bank0[vZP + 1], YReg)]; checkStatus(Accum)})
PCODE('LDA', MODE.IND, 0xB2, 2, (vZP) => {
  Accum = bank0[address(bank0[vZP], bank0[vZP + 1])]; checkStatus(Accum)})

PCODE('LDX', MODE.IMM, 0xA2, 2, (value) => {XReg = value; checkStatus(XReg)})
PCODE('LDX', MODE.ZP_Y, 0xB6, 2, (vZP) => {XReg = bank0[oneByteAdd(vZP, YReg)];
  checkStatus(XReg)})
PCODE('LDY', MODE.IMM, 0xA0, 2, (value) => {YReg = value; checkStatus(YReg)})

const doLSR = (addr: number) => {
  let v = bank0[addr]
  setCarry((v & 1) === 1)
  v >>= 1
  checkStatus(v)
  bank0[addr] = v}
PCODE('LSR', MODE.IMPLIED, 0x4A, 1, () => {setCarry((Accum & 1) === 1);
  Accum >>= 1; checkStatus(Accum)})
PCODE('LSR', MODE.ZP_REL, 0x46, 2, (vZP) => doLSR(vZP))
PCODE('LSR', MODE.ZP_X, 0x56, 2, (vZP) => doLSR(oneByteAdd(vZP, XReg)))
PCODE('LSR', MODE.ABS, 0x4E, 3, (vLo, vHi) => doLSR(address(vLo, vHi)))
PCODE('LSR', MODE.ABS_X, 0x5E, 3, (vLo, vHi) => doLSR(twoByteAdd(vLo, vHi, XReg)))

PCODE('NOP', MODE.IMPLIED, 0xEA, 1, () => {})

PCODE('ORA', MODE.IMM, 0x09, 2, (value) => {Accum |= value; checkStatus(Accum)})
PCODE('ORA', MODE.ZP_REL, 0x05, 2, (vZP) => {Accum |= bank0[vZP]; checkStatus(Accum)})

PCODE('PHA', MODE.IMPLIED, 0x48, 1, () => pushStack(Accum))
PCODE('PHP', MODE.IMPLIED, 0x08, 1, () => pushStack(PStatus))
PCODE('PHX', MODE.IMPLIED, 0xDA, 1, () => pushStack(XReg))
PCODE('PHY', MODE.IMPLIED, 0x5A, 1, () => pushStack(YReg))
PCODE('PLA', MODE.IMPLIED, 0x68, 1, () => {Accum = popStack(); checkStatus(Accum)})
PCODE('PLP', MODE.IMPLIED, 0x28, 1, () => PStatus = popStack())
PCODE('PLX', MODE.IMPLIED, 0xFA, 1, () => {XReg = popStack(); checkStatus(XReg)})
PCODE('PLY', MODE.IMPLIED, 0x7A, 1, () => {YReg = popStack(); checkStatus(YReg)})

PCODE('RTS', MODE.IMPLIED, 0x60, 1, () => {PC = address(popStack(), popStack())})

PCODE('SBC', MODE.IMM, 0xE9, 2, (value) => doADC(255 - value))

PCODE('SEC', MODE.IMPLIED, 0x38, 1, () => {setCarry()})

// Zero Page     STA $44       $85  2   3
// Zero Page,X   STA $44,X     $95  2   4
// Absolute      STA $4400     $8D  3   4
// Absolute,X    STA $4400,X   $9D  3   5
// Absolute,Y    STA $4400,Y   $99  3   5
// Indirect,X    STA ($44,X)   $81  2   6
// Indirect,Y    STA ($44),Y   $91  2   6
PCODE('STA', MODE.ZP_REL, 0x85, 2, (vZP) => bank0[vZP] = Accum)
PCODE('STA', MODE.ZP_X, 0x95, 2, (vZP) => bank0[oneByteAdd(vZP, XReg)] = Accum)
PCODE('STA', MODE.ABS, 0x8D, 3, (vLo, vHi) => bank0[address(vLo, vHi)] = Accum)

PCODE('STX', MODE.ZP_REL, 0x86, 2, (vZP) => bank0[vZP] = XReg)
PCODE('STX', MODE.ZP_Y, 0x96, 2, (vZP) => bank0[oneByteAdd(vZP, YReg)] = XReg)
PCODE('STX', MODE.ABS, 0x8E, 3, (vLo, vHi) => bank0[address(vLo, vHi)] = XReg)

PCODE('STY', MODE.ZP_REL, 0x84, 2, (vZP) => bank0[vZP] = YReg)
PCODE('STY', MODE.ZP_X, 0x94, 2, (vZP) => bank0[oneByteAdd(vZP, XReg)] = YReg)
PCODE('STY', MODE.ABS, 0x8C, 3, (vLo, vHi) => bank0[address(vLo, vHi)] = YReg)

PCODE('TAY', MODE.IMPLIED, 0xA8, 1, () => {YReg = Accum; checkStatus(Accum)})

// var endTime = performance.now()
// console.log("PCODE time = " + (endTime - startTime))