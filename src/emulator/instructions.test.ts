import { toHex } from "./utility"
import { interruptRequest, nonMaskableInterrupt, processInstruction } from "./cpu6502";
import { memory, updateAddressTables } from "./memory";
import { reset6502, doBranch, s6502, setPC, setInterruptDisabled } from "./instructions";
import { parseAssembly } from "./assembler";
import { enableMockingboard } from "./mockingboard";

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

/**
  Run a Jest test using assembly code, and then do an assertion afterwards
  on the Accumulator and Processor Status.
  @param instr A string array containing the 6502 assembly code.
  @param accumExpect The expected value for the Accumulator after the run.
  @param pstat The expected value for the Processor Status after the run.
  @param debug (Optional) Print the program counter during execution.
*/
export const runAssemblyTest = (instr: string[], accumExpect: number, pstat: number, debug=false) => {
  const irqClear = 0x1FFF
  const start = 0x2000
  // Make sure reset6502 doesn't stomp on our flags for our interrupt tests.
  const irq = s6502.flagIRQ
  const nmi = s6502.flagNMI
  reset6502()
  s6502.flagIRQ = irq
  s6502.flagNMI = nmi
  enableMockingboard()
  updateAddressTables()
  setInterruptDisabled(false)
  if (instr.length === 1) {
    instr[0] = ' ' + instr[0]
  }
  let pcode = parseAssembly(start, instr)
  memory.set(pcode, start)
  memory[irqClear] = 0x00  
  setPC(start)
  while (s6502.PC < start + pcode.length) {
    if (debug) console.log(s6502.PC.toString(16))
    processInstruction()
    // check flag for interrupt tests, to make sure we don't go into infinite loop
    if (memory[irqClear]) {
      // deassert IRQ if set
      interruptRequest(0, false)
      nonMaskableInterrupt(false)
    }
  }
  expect(s6502.Accum).toEqual(accumExpect)
  expect(s6502.PStatus).toEqual(pstat | 0x20)
}

const N = 0b10000000
const V = 0b01000000
const B = 0b00010000
const D = 0b00001000
const I = 0b00000100
const Z = 0b00000010
const C = 0b00000001

test('SEI',   () => runAssemblyTest([' SEI'], 0x00, I))
test('CLI',   () => runAssemblyTest([' SEI', ' CLI'], 0x00, 0))

test('ADC SEC',    () => runAssemblyTest([' SEC', ' LDA #$00', ' ADC #$00'], 0x01, 0))
test('ADC Zero',   () => runAssemblyTest([' LDA #$00', ' ADC #$00'], 0x00, Z))

test('SBC SEC1',   () => runAssemblyTest([' SEC', ' LDA #$80', ' SBC #$80'], 0x00, Z | C))
test('SBC CLC1',   () => runAssemblyTest([' CLC', ' LDA #$80', ' SBC #$80'], 0xFF, N))
test('SBC CLC2',   () => runAssemblyTest([' CLC', ' LDA #$80', ' SBC #$7F'], 0x00, V | Z | C))

// See table http://www.righto.com/2012/12/the-6502-overflow-flag-explained.html
test('ADC CLC',    () => runAssemblyTest([' LDA #$50', ' ADC #$10'], 0x60, 0))
test('ADC Over-',  () => runAssemblyTest([' LDA #$50', ' ADC #$50'], 0xA0, N | V))
test('ADC Neg',    () => runAssemblyTest([' LDA #$50', ' ADC #$90'], 0xE0, N))
test('ADC Carry',  () => runAssemblyTest([' LDA #$50', ' ADC #$D0'], 0x20, C))
test('ADC Neg2',   () => runAssemblyTest([' LDA #$D0', ' ADC #$10'], 0xE0, N))
test('ADC Carry2', () => runAssemblyTest([' LDA #$D0', ' ADC #$50'], 0x20, C))
test('ADC Over+',  () => runAssemblyTest([' LDA #$D0', ' ADC #$90'], 0x60, V | C))
test('ADC Neg3',   () => runAssemblyTest([' LDA #$D0', ' ADC #$D0'], 0xA0, N | C))

test('SBC CLC',    () => runAssemblyTest([' SEC', ' LDA #$50', ' SBC #$F0'], 0x60, 0))
test('SBC Over-',  () => runAssemblyTest([' SEC', ' LDA #$50', ' SBC #$B0'], 0xA0, N | V))
test('SBC Neg',    () => runAssemblyTest([' SEC', ' LDA #$50', ' SBC #$70'], 0xE0, N))
test('SBC Carry',  () => runAssemblyTest([' SEC', ' LDA #$50', ' SBC #$30'], 0x20, C))
test('SBC Neg2',   () => runAssemblyTest([' SEC', ' LDA #$D0', ' SBC #$F0'], 0xE0, N))
test('SBC Carry2', () => runAssemblyTest([' SEC', ' LDA #$D0', ' SBC #$B0'], 0x20, C))
test('SBC Over+',  () => runAssemblyTest([' SEC', ' LDA #$D0', ' SBC #$70'], 0x60, V | C))
test('SBC Neg3',   () => runAssemblyTest([' SEC', ' LDA #$D0', ' SBC #$30'], 0xA0, N | C))

test('CLC',   () => runAssemblyTest([' LDA #$FF', ' ADC #$A1', ' CLC'], 0xA0, N))

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
test('LDA ($aa,X)', () => runAssemblyTest(ldaX.split("\n"), 0x81, N))

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
test('LDA ($aa),Y', () => runAssemblyTest(ldaY.split("\n"), 0xBB, N))

const ldaII =
` LDX #$AA
  STX $3F51
  LDX #$51
  STX $00A4
  LDX #$3F
  STX $00A5
  LDA ($A4)
`;

test('LDA ($aa)', () => runAssemblyTest(ldaII.split("\n"), 0xAA, N))

test('LDA #$01', () => runAssemblyTest([' LDA #$01'], 0x01, 0))

test('SED', () => runAssemblyTest([' SED', ' LDA #$99'], 0x99, N | D))

const doSED_ADC = (v1: number, v2 = 0) => {
  let instr = [
    ' SED',
    ' LDA #$' + toHex(v1),
    ' ADC #$' + toHex(v2)]
  return instr
}
test('SED ADC 0', () => runAssemblyTest(doSED_ADC(0), 0x0, Z | D))
test('SED ADC 1', () => runAssemblyTest(doSED_ADC(1), 0x01, D))
test('SED ADC 9', () => runAssemblyTest(doSED_ADC(9), 0x09, D))
test('SED ADC 10', () => runAssemblyTest(doSED_ADC(0x10), 0x10, D))
test('SED ADC 1D', () => runAssemblyTest(doSED_ADC(0x1D), 0x23, D))
test('SED ADC 99', () => runAssemblyTest(doSED_ADC(0x99), 0x99, N | D))
test('SED ADC BD', () => runAssemblyTest(doSED_ADC(0xBD), 0x23, C | D))
test('SED ADC FF', () => runAssemblyTest(doSED_ADC(0xFF), 0x65, C | D))

test('SED ADC 0,1', () => runAssemblyTest(doSED_ADC(0, 1), 0x01, D))
test('SED ADC 0,9', () => runAssemblyTest(doSED_ADC(0, 9), 0x09, D))
test('SED ADC 0,10', () => runAssemblyTest(doSED_ADC(0, 0x10), 0x10, D))
test('SED ADC 0,1D', () => runAssemblyTest(doSED_ADC(0, 0x1D), 0x23, D))
test('SED ADC 0,99', () => runAssemblyTest(doSED_ADC(0, 0x99), 0x99, N | D))
test('SED ADC 0,BD', () => runAssemblyTest(doSED_ADC(0, 0xBD), 0x23, C | D))
test('SED ADC 0,FF', () => runAssemblyTest(doSED_ADC(0, 0xFF), 0x65, C | D))

test('SED ADC 99,1', () => runAssemblyTest(doSED_ADC(0x99, 1), 0x0, Z | C | D))
test('SED ADC 35,35', () => runAssemblyTest(doSED_ADC(0x35, 0x35), 0x70, D))
test('SED ADC 45,45', () => runAssemblyTest(doSED_ADC(0x45, 0x45), 0x90, N | V | D))
test('SED ADC 50,50', () => runAssemblyTest(doSED_ADC(0x50, 0x50), 0x0, V | Z | C | D))
test('SED ADC 99,99', () => runAssemblyTest(doSED_ADC(0x99, 0x99), 0x98, N | V | C | D))
test('SED ADC B1,C1', () => runAssemblyTest(doSED_ADC(0xB1, 0xC1), 0xD2, N | V | C | D))

const doSED_SBC = (v1: number, v2 = 0) => {
  let instr = [
    ' SED',
    ' SEC',
    ' LDA #$' + toHex(v1),
    ' SBC #$' + toHex(v2)]
  return instr
}
test('SED SBC 0', () => runAssemblyTest(doSED_SBC(0), 0x0, Z | C | D))
test('SED SBC 1', () => runAssemblyTest(doSED_SBC(1), 0x01, C | D))
test('SED SBC 9', () => runAssemblyTest(doSED_SBC(9), 0x09, C | D))
test('SED SBC 10', () => runAssemblyTest(doSED_SBC(0x10), 0x10, C | D))
test('SED SBC 1D', () => runAssemblyTest(doSED_SBC(0x1D), 0x1D, C | D))
test('SED SBC 99', () => runAssemblyTest(doSED_SBC(0x99), 0x99, N | C | D))
test('SED SBC BD', () => runAssemblyTest(doSED_SBC(0xBD), 0xBD, N | C | D))
test('SED SBC FF', () => runAssemblyTest(doSED_SBC(0xFF), 0xFF, N | C | D))

test('SED SBC 0,1', () => runAssemblyTest(doSED_SBC(0, 1), 0x99, N | D))
test('SED SBC 0,9', () => runAssemblyTest(doSED_SBC(0, 9), 0x91, N | D))
test('SED SBC 0,10', () => runAssemblyTest(doSED_SBC(0, 0x10), 0x90, N | D))
test('SED SBC 0,1D', () => runAssemblyTest(doSED_SBC(0, 0x1D), 0x7D, D))
test('SED SBC 0,99', () => runAssemblyTest(doSED_SBC(0, 0x99), 0x01, D))
test('SED SBC 0,BD', () => runAssemblyTest(doSED_SBC(0, 0xBD), 0xDD, N | D))
test('SED SBC 0,FF', () => runAssemblyTest(doSED_SBC(0, 0xFF), 0x9B, N | D))

test('SED SBC 99,1', () => runAssemblyTest(doSED_SBC(0x99, 1), 0x98, N | C | D))
test('SED SBC 90,70', () => runAssemblyTest(doSED_SBC(0x90, 0x70), 0x20, V | C | D))
test('SED SBC 70,90', () => runAssemblyTest(doSED_SBC(0x70, 0x90), 0x80, N | V | D))
test('SED SBC 90,85', () => runAssemblyTest(doSED_SBC(0x90, 0x85), 0x05, C | D))
test('SED SBC 85,90', () => runAssemblyTest(doSED_SBC(0x85, 0x90), 0x95, N | D))
test('SED SBC C1,B1', () => runAssemblyTest(doSED_SBC(0xC1, 0xB1), 0x10, C | D))
test('SED SBC B1,C1', () => runAssemblyTest(doSED_SBC(0xB1, 0xC1), 0x90, N | D))

/***************** 65c02 instructions *****************/

const indirect = (prefix: string, accum: number, mem: number, suffix: string) => {
  const instr = `
  ${prefix}
  LDA #$01
  STA $12
  LDA #$30
  STA $13
  LDA #${mem}
  STA $3001
  LDA #${accum}
  ${suffix}
`
  return instr.split('\n')
}
test('ADC ($12)', () => runAssemblyTest(indirect('', 0x7E, 0xAF, 'ADC ($12)'), 0x2D, C))
test('ADC ($12) SED', () => runAssemblyTest(indirect('SED', 0x75, 0x25, 'ADC ($12)'), 0x00, V | Z | C | D))
test('AND ($12)', () => runAssemblyTest(indirect('', 0x3F, 0xFC, 'AND ($12)'), 0x3C, 0))
test('CMP ($12)', () => runAssemblyTest(indirect('', 0xFC, 0x3F, 'CMP ($12)'), 0xFC, C | N))
test('EOR ($12)', () => runAssemblyTest(indirect('', 0x3F, 0xFC, 'EOR ($12)'), 0xC3, N))
test('LDA ($12)', () => runAssemblyTest(indirect('', 0x99, 0xFC, 'LDA ($12)'), 0xFC, N))
test('ORA ($12)', () => runAssemblyTest(indirect('', 0x0E, 0xFC, 'ORA ($12)'), 0xFE, N))
test('SBC ($12)', () => runAssemblyTest(indirect('SEC', 0xFF, 0xC0, 'SBC ($12)'), 0x3F, C))
test('SBC ($12) SED', () => runAssemblyTest(indirect('SEC\n  SED', 0x75, 0x25, 'SBC ($12)'), 0x50, C | D))
test('STA ($12)', () => runAssemblyTest(indirect('', 0xF1, 0xC0, 'STA ($12)\n LDA $3001'), 0xF1, N))

const jmpIndexedAbsIndirect =
`     JMP skip
      LDA #$99   ; $2003
      JMP done
skip  LDA #$03
      STA $3002
      LDA #$20
      STA $3003
      LDX #$02
      JMP ($3000,X)   ; JMP -> $2003
      LDA #$01    ; should not reach here
done  NOP
`;
test('JMP ($3000,X)', () => runAssemblyTest(jmpIndexedAbsIndirect.split('\n'), 0x99, N))

test('DEC', () => runAssemblyTest([' LDA #$99', ' DEC'], 0x98, N))
test('INC', () => runAssemblyTest([' LDA #$99', ' INC'], 0x9A, N))

test('BIT #$F0', () => runAssemblyTest([' LDA #$0F', ' BIT #$F0'], 0x0F, Z | V | N))
test('BIT #$80', () => runAssemblyTest([' LDA #$0F', ' BIT #$80'], 0x0F, Z | N))
test('BIT #$70', () => runAssemblyTest([' LDA #$0F', ' BIT #$70'], 0x0F, Z | V))
test('BIT #$FF', () => runAssemblyTest([' LDA #$0F', ' BIT #$FF'], 0x0F, V | N))
const bitZP_X =
` LDY #$F0
  STY $14
  LDA #$0F
  LDX #$02
  BIT $12,X
`;
test('BIT $12,X', () => runAssemblyTest(bitZP_X.split('\n'), 0x0F, Z | V | N))
const bitABS_X =
` LDY #$F0
  STY $1236
  LDA #$0F
  LDX #$02
  BIT $1234,X
`;
test('BIT $1234,X', () => runAssemblyTest(bitABS_X.split('\n'), 0x0F, Z | V | N))

const BRA =
`    BRA $03
     JMP done  ; should not reach here
     LDA #$C0
done NOP
`;
test('BRA', () => runAssemblyTest(BRA.split('\n'), 0xC0, N))

test('PHX', () => runAssemblyTest([' LDX #$99', ' PHX', ' PLA'], 0x99, N))
test('PHY', () => runAssemblyTest([' LDY #$98', ' PHY', ' PLA'], 0x98, N))
test('PLX', () => runAssemblyTest([' LDX #$97', ' PHX', ' PLX', ' TXA'], 0x97, N))
test('PLY', () => runAssemblyTest([' LDY #$97', ' PHY', ' PLY', ' TYA'], 0x97, N))

const STZ_ZP =
` LDA #$01
  STA $02
  STZ $02
  LDA $02
`;
test('STZ $FF', () => runAssemblyTest(STZ_ZP.split('\n'), 0x0, Z))
const STZ_ZP_X =
` LDA #$01
  STA $12
  LDX #$10
  STZ $02,X
  LDA $12
`;
test('STZ $FF,X', () => runAssemblyTest(STZ_ZP_X.split('\n'), 0x0, Z))
const STZ_ABS =
` LDA #$01
  STA $1234
  STZ $1234
  LDA $1234
`;
test('STZ $FFFF', () => runAssemblyTest(STZ_ABS.split('\n'), 0x0, Z))
const STZ_ABS_X =
` LDA #$01
  STA $1244
  LDX #$10
  STZ $1234,X
  LDA $1244
`;
test('STZ $FFFF,X', () => runAssemblyTest(STZ_ABS_X.split('\n'), 0x0, Z))

const TEST_BCD =
`BIN    EQU $0
BCD     EQU $2
        LDA #$80
        STA BIN
        LDA #$00
        STA BIN+1
        SED              ; Switch to decimal mode
        LDA #0           ; Ensure the result is clear
        STA BCD+0
        STA BCD+1
        STA BCD+2
        LDX #16          ; The number of source bits
CNVBIT  ASL BIN+0        ; Shift out one bit
        ROL BIN+1
        LDA BCD+0        ; And add into result
        ADC BCD+0
        STA BCD+0
        LDA BCD+1        ; propagating any carry
        ADC BCD+1
        STA BCD+1
        LDA BCD+2        ; ... thru whole result
        ADC BCD+2
        STA BCD+2
        DEX              ; And repeat for next bit
        BNE CNVBIT
        CLD              ; Back to binary
        LDA BCD
`;
test('TEST_BCD', () => runAssemblyTest(TEST_BCD.split('\n'), 0x28, 0))

const brk =
` BRK
  LDA #$99   ; should not reach here
  PHA        ; should not reach here
  PLA        ; BRK should jump to here - get saved processor status
`;
test('BRK',   () => {
  // Force our fake ROM's BRK/IRQ vector to point to our handler
  memory[0x23FFE] = 0x04
  memory[0x23FFF] = 0x20
  // Interrupt flag should be set.
  runAssemblyTest(brk.split("\n"), B | 0x20, I | B)
})

const brk_rti =
`    BRK
     NOP        ; BRK returns to original PC+2, so add a dummy instruction
     LDA #$33   ; $2002 - should reach here after RTI
     JMP done
     PLA        ; $2007 - BRK should jump here - get saved processor status
     PHA
     RTI
done NOP
`;
test('BRK with RTI',   () => {
  // Force our fake ROM's BRK/IRQ vector to point to our handler
  memory[0x23FFE] = 0x07
  memory[0x23FFF] = 0x20
  // Interrupt flag should be clear.
  runAssemblyTest(brk_rti.split("\n"), 0x33, 0)
})

const irqmasked =
`    SEI
     LDA #$33   ; should just go to this line
     JMP done
     LDA #$99   ; $2006 - should not reach here
     STA $1FFF  ; Clear IRQ just in case test fails
done NOP
`;
test('IRQ masked',   () => {
  // Force our fake ROM's BRK/IRQ vector to point to our handler
  memory[0x23FFE] = 0x06
  memory[0x23FFF] = 0x20
  // This should interrupt right after our first instruction
  interruptRequest()
  runAssemblyTest(irqmasked.split("\n"), 0x33, I)
})

const irqenabled =
`    CLI
     LDA #$99   ; should NOT go to this line
     JMP done
     LDA #$22   ; $2006 - SHOULD reach here
     STA $1FFF  ; Clear IRQ
done NOP
`;
test('IRQ enabled',   () => {
  // Force our fake ROM's BRK/IRQ vector to point to our handler
  memory[0x23FFE] = 0x06
  memory[0x23FFF] = 0x20
  // This should interrupt right after our first instruction
  interruptRequest()
  runAssemblyTest(irqenabled.split("\n"), 0x22, I)
})

const irq_rti =
`    CLI
     ADC #$11   ; should go here next
     JMP done
     LDA #$22   ; $2006 - should reach here first
     STA $1FFF  ; Clear IRQ
     RTI
done NOP
`;
test('IRQ with RTI',   () => {
  // Force our fake ROM's BRK/IRQ vector to point to our handler
  memory[0x23FFE] = 0x06
  memory[0x23FFF] = 0x20
  // This should interrupt right after our first instruction
  interruptRequest()
  runAssemblyTest(irq_rti.split("\n"), 0x33, 0)
})

const nmi =
`    CLC
     LDA #$99   ; should NOT go to this line
     JMP done
     LDA #$22   ; $2006 - SHOULD reach here
     STA $1FFF  ; Clear IRQ
     SEC        ; no RTI so this should still be set
done NOP
`;
test('NMI',   () => {
  // Force our fake ROM's BRK/IRQ vector to point to our handler
  memory[0x23FFA] = 0x06
  memory[0x23FFB] = 0x20
  // This should interrupt right after our first instruction
  nonMaskableInterrupt()
  runAssemblyTest(nmi.split("\n"), 0x22, I | C)
})

const nmi_rti =
`    SEC
     ADC #$11   ; should go here next
     JMP done
     LDA #$22   ; $2006 - should reach here first
     STA $1FFF  ; Clear IRQ
     CLC
     RTI        ; This should restore P and set the carry again
done NOP
`;
test('NMI with RTI',   () => {
  // Force our fake ROM's BRK/IRQ vector to point to our handler
  memory[0x23FFA] = 0x06
  memory[0x23FFB] = 0x20
  // This should interrupt right after our first instruction
  nonMaskableInterrupt()
  runAssemblyTest(nmi_rti.split("\n"), 0x34, 0)
})
