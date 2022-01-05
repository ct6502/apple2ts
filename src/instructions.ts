var startTime = performance.now()

export let PStatus = 0;
export let PC = 0x2000;
export let bank0 = new Uint8Array(65536).fill(46); // "."
export let Accum = 0;
export let XReg = 0;
export let YReg = 0;
export let StackPointer = 0x1FF;

export enum MODE {
  IMP,      // BRK
  IMM,      // LDA #$01
  ZP,       // LDA $C0 or BCC $FF
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

export const toHex = (value: number, ndigits = 2) => {
  return ('0000' + value.toString(16).toUpperCase()).slice(-ndigits)
}

export const getProcessorStatus = () => {
  return `${toHex(PC,4)}-  A=${toHex(Accum)} X=${toHex(XReg)} ` + 
  `Y=${toHex(YReg)} P=${toHex(PStatus)} S=${toHex(StackPointer)}`
}

const isCarry = () => { return ((PStatus & 0x01) !== 0); }
// const setCarry = () => PStatus |= 1;
// const clearCarry = () => PStatus &= 254;

const isZero = () => { return ((PStatus & 0x02) !== 0); }
const setZero = () => PStatus |= 2;
const clearZero = () => PStatus &= 253;

// const isInterrupt = () => { return ((PStatus & 0x04) !== 0); }
// const setInterrupt = () => PStatus |= 4;
// const clearInterrupt = () => PStatus &= 251;

// const isDecimal = () => { return ((PStatus & 0x08) !== 0); }
// const setDecimal = () => PStatus |= 8;
// const clearDecimal = () => PStatus &= 247;

export const isBreak = () => { return ((PStatus & 0x10) !== 0); }
export const setBreak = () => PStatus |= 0x10;
export const clearBreak = () => PStatus &= 239;

const isOverflow = () => { return ((PStatus & 0x40) !== 0); }
// const setOverflow = () => PStatus |= 0x40;
// const clearOverflow = () => PStatus &= 191;

const isNegative = () => { return ((PStatus & 0x80) !== 0); }
const setNegative = () => PStatus |= 0x80;
const clearNegative = () => PStatus &= 127;

const checkStatus = (value: number) => {
  if (value === 0) {
    setZero();
  } else {
    clearZero();
  }
  if (value >= 128) {
    setNegative();
  } else {
    clearNegative();
  }
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
const address = (vLo: number, vHi: number) => (vHi*256 + vLo)
const twoByteAdd = (vLo: number, vHi: number, offset: number) => (vHi*256 + vLo + offset + 65536) % 65536

export const pcodes = new Array<PCodeInstr>(256)

const PCODE = (name: string, mode: MODE, pcode: number, PC: number, code: PCodeFunc) => {
  if (pcodes[pcode]) {
    console.error("Duplicate instruction: " + name + " mode=" + mode)
  }
  pcodes[pcode] = {name: name, mode: mode, PC: PC, execute: code}
}

PCODE('BCC', MODE.ZP, 0x90, 2, (value) => {if (!isCarry()) {doBranch(value)}})
PCODE('BCS', MODE.ZP, 0xB0, 2, (value) => {if (isCarry()) {doBranch(value)}})
PCODE('BEQ', MODE.ZP, 0xF0, 2, (value) => {if (isZero()) {doBranch(value)}})
PCODE('BMI', MODE.ZP, 0x30, 2, (value) => {if (isNegative()) {doBranch(value)}})
PCODE('BNE', MODE.ZP, 0xD0, 2, (value) => {if (!isZero()) {doBranch(value)}})
PCODE('BPL', MODE.ZP, 0x10, 2, (value) => {if (!isNegative()) {doBranch(value)}})
PCODE('BVC', MODE.ZP, 0x50, 2, (value) => {if (!isOverflow()) {doBranch(value)}})
PCODE('BVS', MODE.ZP, 0x70, 2, (value) => {if (isOverflow()) {doBranch(value)}})

PCODE('BRK', MODE.IMP, 0x00, 1, () => {setBreak()})

PCODE('DEX', MODE.IMP, 0xCA, 1, () => {XReg = oneByteAdd(XReg, -1); checkStatus(XReg)})
PCODE('DEY', MODE.IMP, 0x88, 1, () => {YReg = oneByteAdd(YReg, -1); checkStatus(YReg)})

PCODE('INC', MODE.ABS, 0xEE, 3, (vLo, vHi) => {const addr = address(vLo, vHi); let v = bank0[addr];
  v = oneByteAdd(v, 1); bank0[addr] = v; checkStatus(v)})

PCODE('INX', MODE.IMP, 0xE8, 1, () => {XReg = oneByteAdd(XReg, 1); checkStatus(XReg)})
PCODE('INY', MODE.IMP, 0xCB, 1, () => {YReg = oneByteAdd(YReg, 1); checkStatus(YReg)})

PCODE('JMP', MODE.ABS, 0x4C, 3, (vLo, vHi) => {PC = twoByteAdd(vLo, vHi, -3)})
// 65c02 - this fixes the 6502 indirect JMP bug across page boundaries
PCODE('JMP', MODE.IND, 0x6C, 3, (vLo, vHi) => {const a = address(vLo, vHi);
  vLo = bank0[a]; vHi = bank0[(a + 1) % 65536]; PC = twoByteAdd(vLo, vHi, -3)})
PCODE('JMP', MODE.IND_X, 0x7C, 3, (vLo, vHi) => {const a = twoByteAdd(vLo, vHi, XReg);
  vLo = bank0[a]; vHi = bank0[(a + 1) % 65536]; PC = twoByteAdd(vLo, vHi, -3)})

PCODE('LDA', MODE.IMM, 0xA9, 2, (value) => {Accum = value; checkStatus(Accum)})
PCODE('LDA', MODE.ZP, 0xA5, 2, (vZP) => {Accum = bank0[vZP]; checkStatus(Accum)})
PCODE('LDA', MODE.ZP_X, 0xB5, 2, (vZP) => {Accum = bank0[oneByteAdd(vZP, XReg)];
  checkStatus(Accum)})
PCODE('LDA', MODE.ABS, 0xAD, 3, (vLo, vHi) => {Accum = bank0[address(vLo, vHi)];
  checkStatus(Accum)})
PCODE('LDA', MODE.ABS_X, 0xBD, 3, (vLo, vHi) => {Accum = bank0[twoByteAdd(vLo, vHi, XReg)];
  checkStatus(Accum)})
PCODE('LDA', MODE.ABS_Y, 0xB9, 3, (vLo, vHi) => {Accum = bank0[twoByteAdd(vLo, vHi, YReg)];
  checkStatus(Accum)})
PCODE('LDA', MODE.IND_X, 0xA1, 2, (vZP) => {Accum = 0; // bank0[twoByteAdd(vLo, vHi, YReg)];
  checkStatus(Accum)})
PCODE('LDA', MODE.IND_Y, 0xB1, 2, (vZP) => {Accum = 0; // bank0[twoByteAdd(vLo, vHi, YReg)];
  checkStatus(Accum)})
PCODE('LDA', MODE.IND, 0xB2, 2, (vZP) => {Accum = 0; // bank0[twoByteAdd(vLo, vHi, YReg)];
  checkStatus(Accum)})

PCODE('LDX', MODE.IMM, 0xA2, 2, (value) => {XReg = value; checkStatus(XReg)})
PCODE('LDX', MODE.ZP_Y, 0xB6, 2, (vZP) => {XReg = bank0[oneByteAdd(vZP, YReg)];
  checkStatus(XReg)})
PCODE('LDY', MODE.IMM, 0xA0, 2, (value) => {YReg = value; checkStatus(YReg)})

PCODE('STA', MODE.ABS, 0x8D, 3, (vLo, vHi) => {bank0[address(vLo, vHi)] = Accum;})
PCODE('STX', MODE.ABS, 0x8E, 3, (vLo, vHi) => {bank0[address(vLo, vHi)] = XReg;})
PCODE('STY', MODE.ABS, 0x8C, 3, (vLo, vHi) => {bank0[address(vLo, vHi)] = YReg;})

var endTime = performance.now()
console.log("PCODE time = " + (endTime - startTime))