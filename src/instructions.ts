export let PStatus = 0;
export let PC = 0x2000;
export let bank0 = new Uint8Array(65536).fill(46); // "."
export let Accum = 0;
export let XReg = 0;
export let YReg = 0;
export let StackPointer = 0x1FF;

export enum MODE {
  IMPLIED,
  IMM,
  ZP,  // also same as "Relative"
  ZP_X,
  ABS,
  ABS_X,
  ABS_Y,
  IND_X,
  IND_Y,
  IND,
  IND_REL,
  ABS_IND
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
    PC: number
    execute: PCodeFunc
    mode?: MODE
}

export const doBranch = (offset: number) => {
  PC += ((offset > 127) ? (offset - 256) : offset);
}

const oneByteAdd = (value: number, offset: number) => (value + offset + 256) % 256
const address = (vLo: number, vHi: number) => (vHi*256 + vLo)
const twoByteAdd = (vLo: number, vHi: number, offset = 0) => (vHi*256 + vLo + offset + 65536) % 65536

const PCODE = (name: string, PC: number, code: PCodeFunc, mode: MODE = MODE.IMPLIED) => {
  return {name: name, PC: PC, execute: code, mode: mode}
}

export const pcodes = new Array<PCodeInstr>(256);
pcodes[0x90] = PCODE('BCC', 2, (value) => {if (!isCarry()) {doBranch(value)}}, MODE.ZP)
pcodes[0xB0] = PCODE('BCS', 2, (value) => {if (isCarry()) {doBranch(value)}}, MODE.ZP)
pcodes[0xF0] = PCODE('BEQ', 2, (value) => {if (isZero()) {doBranch(value)}}, MODE.ZP)
pcodes[0x30] = PCODE('BMI', 2, (value) => {if (isNegative()) {doBranch(value)}}, MODE.ZP)
pcodes[0xD0] = PCODE('BNE', 2, (value) => {if (!isZero()) {doBranch(value)}}, MODE.ZP)
pcodes[0x10] = PCODE('BPL', 2, (value) => {if (!isNegative()) {doBranch(value)}}, MODE.ZP)
pcodes[0x50] = PCODE('BVC', 2, (value) => {if (!isOverflow()) {doBranch(value)}}, MODE.ZP)
pcodes[0x70] = PCODE('BVS', 2, (value) => {if (isOverflow()) {doBranch(value)}}, MODE.ZP)

pcodes[0x00] = PCODE('BRK', 1, () => {setBreak();})

pcodes[0xCA] = PCODE('DEX', 1, () => {XReg = oneByteAdd(XReg, -1);
  checkStatus(XReg)});
pcodes[0x88] = PCODE('DEY', 1, () => {YReg = oneByteAdd(YReg, -1); checkStatus(YReg)})

pcodes[0xEE] = PCODE('INC', 3, (vLo, vHi) => {const addr = address(vLo, vHi); let v = bank0[addr];
  v = oneByteAdd(v, 1); bank0[addr] = v; checkStatus(v)}, MODE.ABS)

pcodes[0xE8] = PCODE('INX', 1, () => {XReg = oneByteAdd(XReg, 1); checkStatus(XReg)})
pcodes[0xCB] = PCODE('INY', 1, () => {YReg = oneByteAdd(YReg, -1); checkStatus(YReg)})

pcodes[0x4C] = PCODE('JMP', 3, (vLo, vHi) => {PC = twoByteAdd(vLo, vHi, -3)}, MODE.ABS)

pcodes[0xA9] = PCODE('LDA', 2, (value) => {Accum = value; checkStatus(Accum)}, MODE.IMM)
pcodes[0xA5] = PCODE('LDA', 2, (vZeroPage) => {Accum = bank0[vZeroPage]; checkStatus(Accum)}, MODE.ZP)
pcodes[0xB5] = PCODE('LDA', 2, (vZeroPage) => {Accum = bank0[oneByteAdd(vZeroPage, XReg)]; checkStatus(Accum)}, MODE.ZP_X)
pcodes[0xAD] = PCODE('LDA', 3, (vLo, vHi) => {Accum = bank0[address(vLo, vHi)]; checkStatus(Accum)}, MODE.ABS)
pcodes[0xAD] = PCODE('LDA', 3, (vLo, vHi) => {Accum = bank0[address(vLo, vHi)]; checkStatus(Accum)}, MODE.ABS)

pcodes[0xA2] = PCODE('LDX', 2, (value) => {XReg = value; checkStatus(XReg)}, MODE.IMM)
pcodes[0xA0] = PCODE('LDY', 2, (value) => {YReg = value; checkStatus(YReg)}, MODE.IMM)

pcodes[0x8D] = PCODE('STA', 3, (vLo, vHi) => {bank0[address(vLo, vHi)] = Accum;}, MODE.ABS)
pcodes[0x8E] = PCODE('STX', 3, (vLo, vHi) => {bank0[address(vLo, vHi)] = XReg;}, MODE.ABS)
pcodes[0x8C] = PCODE('STY', 3, (vLo, vHi) => {bank0[address(vLo, vHi)] = YReg;}, MODE.ABS)
