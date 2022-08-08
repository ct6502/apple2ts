import { toHex } from "./utility"
import { doReset, processInstruction } from "./motherboard";
import { bank0 } from "./memory";
import { doBranch, s6502, setPC, isBreak, setBreak } from "./instructions";
import { parseAssembly } from "./assembler";

doReset()

test('doBranch', () => {
  setPC(0x2000)
  doBranch(true, 0);
  expect(s6502.PC).toEqual(0x2000);
  doBranch(true, 1);
  expect(s6502.PC).toEqual(0x2001);
  doBranch(true, 127);
  expect(s6502.PC).toEqual(0x2001 + 127);
  doBranch(true, 255);
  expect(s6502.PC).toEqual(0x2001 + 126);
  doBranch(true, 128);
  expect(s6502.PC).toEqual(0x1FFF);
  doBranch(true, 1);
  expect(s6502.PC).toEqual(0x2000);
});

const testInstr = (instr: string[], accumExpect: number, pstat: number) => {
  const start = 0x2000
  let pcode = parseAssembly(start, instr)
  bank0.set(pcode, start)
  setPC(start)
  setBreak(false)
  while (s6502.PC < start + pcode.length) {
    processInstruction()
    if (isBreak()) {
      break
    }
  }
  expect(s6502.Accum).toEqual(accumExpect)
  expect(s6502.PStatus).toEqual(pstat | 0b00100000)
}

const N = 0b10000000
const V = 0b01000000
// const B = 0b00010000
const D = 0b00001000
// const I = 0b00000100
const Z = 0b00000010
const C = 0b00000001

test('CLI',   () => testInstr([' CLI'], 0x00, 0))

test('ADC SEC',    () => testInstr([' SEC', ' LDA #$00', ' ADC #$00'], 0x01, 0))
test('ADC Zero',   () => testInstr([' CLC', ' LDA #$00', ' ADC #$00'], 0x00, Z))

test('SBC SEC1',   () => testInstr([' SEC', ' LDA #$80', ' SBC #$80'], 0x00, Z | C))
test('SBC CLC1',   () => testInstr([' CLC', ' LDA #$80', ' SBC #$80'], 0xFF, N))
test('SBC CLC2',   () => testInstr([' CLC', ' LDA #$80', ' SBC #$7F'], 0x00, V | Z | C))

// See table http://www.righto.com/2012/12/the-6502-overflow-flag-explained.html
test('ADC CLC',    () => testInstr([' CLC', ' LDA #$50', ' ADC #$10'], 0x60, 0))
test('ADC Over-',  () => testInstr([' CLC', ' LDA #$50', ' ADC #$50'], 0xA0, N | V))
test('ADC Neg',    () => testInstr([' CLC', ' LDA #$50', ' ADC #$90'], 0xE0, N))
test('ADC Carry',  () => testInstr([' CLC', ' LDA #$50', ' ADC #$D0'], 0x20, C))
test('ADC Neg2',   () => testInstr([' CLC', ' LDA #$D0', ' ADC #$10'], 0xE0, N))
test('ADC Carry2', () => testInstr([' CLC', ' LDA #$D0', ' ADC #$50'], 0x20, C))
test('ADC Over+',  () => testInstr([' CLC', ' LDA #$D0', ' ADC #$90'], 0x60, V | C))
test('ADC Neg3',   () => testInstr([' CLC', ' LDA #$D0', ' ADC #$D0'], 0xA0, N | C))

test('SBC CLC',    () => testInstr([' SEC', ' LDA #$50', ' SBC #$F0'], 0x60, 0))
test('SBC Over-',  () => testInstr([' SEC', ' LDA #$50', ' SBC #$B0'], 0xA0, N | V))
test('SBC Neg',    () => testInstr([' SEC', ' LDA #$50', ' SBC #$70'], 0xE0, N))
test('SBC Carry',  () => testInstr([' SEC', ' LDA #$50', ' SBC #$30'], 0x20, C))
test('SBC Neg2',   () => testInstr([' SEC', ' LDA #$D0', ' SBC #$F0'], 0xE0, N))
test('SBC Carry2', () => testInstr([' SEC', ' LDA #$D0', ' SBC #$B0'], 0x20, C))
test('SBC Over+',  () => testInstr([' SEC', ' LDA #$D0', ' SBC #$70'], 0x60, V | C))
test('SBC Neg3',   () => testInstr([' SEC', ' LDA #$D0', ' SBC #$30'], 0xA0, N | C))

test('CLC',   () => testInstr([' CLC'], 0xA0, N))

const ldaX =
` LDX #$E9
  LDY #$81
  STY $3104
  LDY #$04
  STY $003A
  LDY #$31
  STY $003B
  LDA ($51,X)
`;
test('LDA ($aa,X)', () => testInstr(ldaX.split("\n"), 0x81, N))

const ldaY =
` LDY #$E9
  LDX #$BB
  STX $403A
  LDX #$51
  STX $00A4
  LDX #$3F
  STX $00A5
  LDA ($A4),Y
`;
test('LDA ($aa),Y', () => testInstr(ldaY.split("\n"), 0xBB, N))

const ldaII =
` LDX #$AA
  STX $3F51
  LDX #$51
  STX $00A4
  LDX #$3F
  STX $00A5
  LDA ($A4)
`;

test('LDA ($aa)', () => testInstr(ldaII.split("\n"), 0xAA, N))

test('LDA #$01', () => testInstr([' LDA #$01'], 0x01, 0))

test('SED', () => testInstr([' SED', ' LDA #$99'], 0x99, N | D))

const doSED_ADC = (v1: number, v2 = 0) => {
  let instr = [
    ' SED',
    ' CLC',
    ' CLV',
    ' LDA #$' + toHex(v1),
    ' ADC #$' + toHex(v2),
    ' CLD']
  return instr
}
test('SED ADC 0', () => testInstr(doSED_ADC(0), 0x0, Z))
test('SED ADC 1', () => testInstr(doSED_ADC(1), 0x01, 0))
test('SED ADC 9', () => testInstr(doSED_ADC(9), 0x09, 0))
test('SED ADC 10', () => testInstr(doSED_ADC(0x10), 0x10, 0))
test('SED ADC 1D', () => testInstr(doSED_ADC(0x1D), 0x23, 0))
test('SED ADC 99', () => testInstr(doSED_ADC(0x99), 0x99, N))
test('SED ADC BD', () => testInstr(doSED_ADC(0xBD), 0x23, C))
test('SED ADC FF', () => testInstr(doSED_ADC(0xFF), 0x65, C))

test('SED ADC 0,1', () => testInstr(doSED_ADC(0, 1), 0x01, 0))
test('SED ADC 0,9', () => testInstr(doSED_ADC(0, 9), 0x09, 0))
test('SED ADC 0,10', () => testInstr(doSED_ADC(0, 0x10), 0x10, 0))
test('SED ADC 0,1D', () => testInstr(doSED_ADC(0, 0x1D), 0x23, 0))
test('SED ADC 0,99', () => testInstr(doSED_ADC(0, 0x99), 0x99, N))
test('SED ADC 0,BD', () => testInstr(doSED_ADC(0, 0xBD), 0x23, C))
test('SED ADC 0,FF', () => testInstr(doSED_ADC(0, 0xFF), 0x65, C))

test('SED ADC 99,1', () => testInstr(doSED_ADC(0x99, 1), 0x0, Z | C))
test('SED ADC 35,35', () => testInstr(doSED_ADC(0x35, 0x35), 0x70, 0))
test('SED ADC 45,45', () => testInstr(doSED_ADC(0x45, 0x45), 0x90, N | V))
test('SED ADC 50,50', () => testInstr(doSED_ADC(0x50, 0x50), 0x0, V | Z | C))
test('SED ADC 99,99', () => testInstr(doSED_ADC(0x99, 0x99), 0x98, N | V | C))
test('SED ADC B1,C1', () => testInstr(doSED_ADC(0xB1, 0xC1), 0xD2, N | V | C))

const doSED_SBC = (v1: number, v2 = 0) => {
  let instr = [
    ' SED',
    ' SEC',
    ' CLV',
    ' LDA #$' + toHex(v1),
    ' SBC #$' + toHex(v2),
    ' CLD']
  return instr
}
test('SED SBC 0', () => testInstr(doSED_SBC(0), 0x0, Z | C))
test('SED SBC 1', () => testInstr(doSED_SBC(1), 0x01, C))
test('SED SBC 9', () => testInstr(doSED_SBC(9), 0x09, C))
test('SED SBC 10', () => testInstr(doSED_SBC(0x10), 0x10, C))
test('SED SBC 1D', () => testInstr(doSED_SBC(0x1D), 0x1D, C))
test('SED SBC 99', () => testInstr(doSED_SBC(0x99), 0x99, N | C))
test('SED SBC BD', () => testInstr(doSED_SBC(0xBD), 0xBD, N | C))
test('SED SBC FF', () => testInstr(doSED_SBC(0xFF), 0xFF, N | C))

test('SED SBC 0,1', () => testInstr(doSED_SBC(0, 1), 0x99, N))
test('SED SBC 0,9', () => testInstr(doSED_SBC(0, 9), 0x91, N))
test('SED SBC 0,10', () => testInstr(doSED_SBC(0, 0x10), 0x90, N))
test('SED SBC 0,1D', () => testInstr(doSED_SBC(0, 0x1D), 0x7D, 0))
test('SED SBC 0,99', () => testInstr(doSED_SBC(0, 0x99), 0x01, 0))
test('SED SBC 0,BD', () => testInstr(doSED_SBC(0, 0xBD), 0xDD, N))
test('SED SBC 0,FF', () => testInstr(doSED_SBC(0, 0xFF), 0x9B, N))

test('SED SBC 99,1', () => testInstr(doSED_SBC(0x99, 1), 0x98, N | C))
test('SED SBC 90,70', () => testInstr(doSED_SBC(0x90, 0x70), 0x20, V | C))
test('SED SBC 70,90', () => testInstr(doSED_SBC(0x70, 0x90), 0x80, N | V))
test('SED SBC 90,85', () => testInstr(doSED_SBC(0x90, 0x85), 0x05, C))
test('SED SBC 85,90', () => testInstr(doSED_SBC(0x85, 0x90), 0x95, N))
test('SED SBC C1,B1', () => testInstr(doSED_SBC(0xC1, 0xB1), 0x10, C))
test('SED SBC B1,C1', () => testInstr(doSED_SBC(0xB1, 0xC1), 0x90, N))

