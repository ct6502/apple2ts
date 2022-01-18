import {processInstruction} from "./interp";
import {bank0, doBranch, PC, setPC, Accum, PStatus} from "./instructions";
import {parseAssembly} from "./assembler";

test('doBranch', () => {
  setPC(0x2000)
  doBranch(0);
  expect(PC).toEqual(0x2000);
  doBranch(1);
  expect(PC).toEqual(0x2001);
  doBranch(127);
  expect(PC).toEqual(0x2001 + 127);
  doBranch(255);
  expect(PC).toEqual(0x2001 + 126);
  doBranch(128);
  expect(PC).toEqual(0x1FFF);
  doBranch(1);
  expect(PC).toEqual(0x2000);
});

const testInstr = (instr: string[], accum: number, pstat: number) => {
  const start = 0x2000
  let pcode = parseAssembly(start, instr)
  bank0.set(pcode, start)
  setPC(start)
  while (PC < start + pcode.length) {
    processInstruction()
  }
  expect(Accum).toEqual(accum)
  expect(PStatus).toEqual(pstat)
}

test('ADC SEC',    () => testInstr([' SEC', ' LDA #$00', ' ADC #$00'], 0x01, 0b00000000))
test('ADC Zero',   () => testInstr([' CLC', ' LDA #$00', ' ADC #$00'], 0x00, 0b00000010))

test('SBC SEC1',   () => testInstr([' SEC', ' LDA #$80', ' SBC #$80'], 0x00, 0b00000011))
test('SBC CLC1',   () => testInstr([' CLC', ' LDA #$80', ' SBC #$80'], 0xFF, 0b10000000))
test('SBC CLC2',   () => testInstr([' CLC', ' LDA #$80', ' SBC #$7F'], 0x00, 0b01000011))

// See table http://www.righto.com/2012/12/the-6502-overflow-flag-explained.html
test('ADC CLC',    () => testInstr([' CLC', ' LDA #$50', ' ADC #$10'], 0x60, 0b00000000))
test('ADC Over-',  () => testInstr([' CLC', ' LDA #$50', ' ADC #$50'], 0xA0, 0b11000000))
test('ADC Neg',    () => testInstr([' CLC', ' LDA #$50', ' ADC #$90'], 0xE0, 0b10000000))
test('ADC Carry',  () => testInstr([' CLC', ' LDA #$50', ' ADC #$D0'], 0x20, 0b00000001))
test('ADC Neg2',   () => testInstr([' CLC', ' LDA #$D0', ' ADC #$10'], 0xE0, 0b10000000))
test('ADC Carry2', () => testInstr([' CLC', ' LDA #$D0', ' ADC #$50'], 0x20, 0b00000001))
test('ADC Over+',  () => testInstr([' CLC', ' LDA #$D0', ' ADC #$90'], 0x60, 0b01000001))
test('ADC Neg3',   () => testInstr([' CLC', ' LDA #$D0', ' ADC #$D0'], 0xA0, 0b10000001))

test('SBC CLC',    () => testInstr([' SEC', ' LDA #$50', ' SBC #$F0'], 0x60, 0b00000000))
test('SBC Over-',  () => testInstr([' SEC', ' LDA #$50', ' SBC #$B0'], 0xA0, 0b11000000))
test('SBC Neg',    () => testInstr([' SEC', ' LDA #$50', ' SBC #$70'], 0xE0, 0b10000000))
test('SBC Carry',  () => testInstr([' SEC', ' LDA #$50', ' SBC #$30'], 0x20, 0b00000001))
test('SBC Neg2',   () => testInstr([' SEC', ' LDA #$D0', ' SBC #$F0'], 0xE0, 0b10000000))
test('SBC Carry2', () => testInstr([' SEC', ' LDA #$D0', ' SBC #$B0'], 0x20, 0b00000001))
test('SBC Over+',  () => testInstr([' SEC', ' LDA #$D0', ' SBC #$70'], 0x60, 0b01000001))
test('SBC Neg3',   () => testInstr([' SEC', ' LDA #$D0', ' SBC #$30'], 0xA0, 0b10000001))
