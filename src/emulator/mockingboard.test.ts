import { parseAssembly } from "./assembler"
import { doSetDebug } from "./cpu6502"
import { runAssemblyTest } from "./instructions.test"
import { memSet, memory } from "./memory"
import { _getRegisters } from "./mockingboard"

test("temp", () => {})

const N = 0b10000000
// const V = 0b01000000
// const B = 0b00010000
// const D = 0b00001000
// const I = 0b00000100
const Z = 0b00000010
const C = 0b00000001

// Dynamically set the enable register to a specific value,
// then load the enable register into the Accumulator.
const ldaE_V = (chip: Chip6522 | number, value: number) => {
  const X = chip ? '8' : '0'
  return `
  LDA #$${value.toString(16)}
  STA $C4${X}E
  LDA $C4${X}E
`.split(`\n`)
}

// Dynamically set the interrupt flag register to a specific value,
// then load the interrupt register into the Accumulator.
const ldaD_V = (chip: Chip6522 | number, value: number) => {
  const X = chip ? '8' : '0'
  return `
  LDA #$${value.toString(16)}
  STA $C4${X}D
  LDA $C4${X}D
`.split(`\n`)
}

// None of these tests should affect the flags register.
for (let chip = 0; chip <= 1; chip++) {
  const X = chip ? '8' : '0'
  const ldaE = `LDA $C4${X}E`
  const ldaD = `LDA $C4${X}D`
  test('start E', () => runAssemblyTest([ldaE], 128, N))
  test('start D', () => runAssemblyTest([ldaD], 0, Z))

  // Turn off some interrupt flags (already all off so should not have an affect)
  test('erase E 1', () => runAssemblyTest(ldaE_V(chip, 127), 128, N))
  test('erase E 2', () => runAssemblyTest([ldaD], 0, Z))
  test('erase E 3', () => runAssemblyTest(ldaE_V(chip, 0), 128, N))
  test('erase E 4', () => runAssemblyTest([ldaD], 0, Z))

  // Set some flags in the enable register
  test('set E 5', () => runAssemblyTest(ldaE_V(chip, 0b11010101), 0b11010101, N))
  test('check D 5', () => runAssemblyTest([ldaD], 0, Z))

  // Turn off some flags using enable register
  test('set E 6', () => runAssemblyTest(ldaE_V(chip, 0b01010000), 0b10000101, N))
  test('check D 6', () => runAssemblyTest([ldaD], 0, Z))

  // Turn off all flags using enable register
  test('set E 7', () => runAssemblyTest(ldaE_V(chip, 0b01111111), 128, N))
  test('check D 7', () => runAssemblyTest([ldaD], 0, Z))
}

// Try to turn off some interrupt flags (already all off so no affect)
for (let chip = 0; chip <= 1; chip++) {
  const X = chip ? '8' : '0'
  const ldaD = `LDA $C4${X}D`
  test('start D 2', () => runAssemblyTest([ldaD], 0, Z))
  test('erase D 2', () => runAssemblyTest(ldaD_V(chip, 0b10101010), 0, Z))
}

const latchRegister = (chip: Chip6522, register: number) => {
  const X = chip ? '8' : '0'
  return `
  LDA #$${register.toString(16)}
  STA $C4${X}1   ; ORA
  LDA #$07       ; Latch command
  STA $C4${X}0   ; ORB
  LDA #$04       ; Inactive
  STA $C4${X}0   ; ORB
`.split(`\n`)
}

const writeRegister = (chip: Chip6522, data: number) => {
  const X = chip ? '8' : '0'
  return `
  LDA #$${data.toString(16)}
  STA $C4${X}1   ; ORA
  LDA #$06       ; Write command
  STA $C4${X}0   ; ORB
  LDA #$04       ; Inactive
  STA $C4${X}0   ; ORB
`.split(`\n`)
}

// Loop thru each chip and each register, doing a latch + write in assembly
// Currently there is no "read" from my Mockingboard driver so just use
// a helper routine to get the registers.
for (let chip = 0; chip <= 1; chip++) {
  const expected = new Array<number>(16).fill(0)
  const c: Chip6522 = chip as Chip6522
  for (let reg = 0; reg < 16; reg++) {
    test(`latch/write ${chip} ${reg}`, () => {
      latchRegister(c, reg)
      const data = 0xC0 + reg
      writeRegister(c, data)
      const result = _getRegisters(c)
      expect(result).toEqual(expected)
    })
  }
}

const lda04a = (chip: number, timer: number) => {
  const X = chip ? '8' : '0'
  const T = timer ? '8' : '4'
  return `
    SEC
    LDA $C4${X}${T}   ; this takes 4 cycles
    SBC $C4${X}${T}
    CLC   ; carry flag is "random" after subtracting the timer countdown
    `.split(`\n`)
}

const lda04b = (chip: number, timer: number) => {
  const X = chip ? '8' : '0'
  const T = timer ? '8' : '4'
  return `
  LDA #$${X}${T}
  STA $80
  LDA #$C4
  STA $81
  LDY #$0
  SEC
  LDA ($80),Y   ; this takes 5 cycles
  SBC $C4${X}${T}
  CLC   ; carry flag is "random" after subtracting the timer countdown
  `.split(`\n`)
}

const lda04c = (chip: number, timer: number) => {
  const X = chip ? '8' : '0'
  const T = timer ? '9' : '5'
  return `
      LDY #$FF
      LDA $C4${X}${T}
      STA $00
      NOP
LOOP  DEY
      BNE LOOP
      SEC
      LDA $00
      SBC $C4${X}${T}
      CLC   ; carry flag is "random" after subtracting the timer countdown
`.split(`\n`)
}

// Test our Timer T1 and T2 counters
for (let chip = 0; chip <= 1; chip++) {
  for (let timer = 0; timer <= 1; timer++) {
    test(`lda04a-${chip}-T${timer + 1}`, () => runAssemblyTest(lda04a(chip, timer), 4, 0))
    test(`lda04b-${chip}-T${timer + 1}`, () => runAssemblyTest(lda04b(chip, timer), 5, 0))
    // There are ~1283 cycles between $C405 reads, so our high-order counter
    // should go down by 5.
    test(`lda04c-${chip}-T${timer + 1}`, () => runAssemblyTest(lda04c(chip, timer), 5, 0))
  }
}

const interrupt = (chip: number, timer: number) => {
  const X = chip ? '8' : '0'
  const L = timer ? '8' : '4'
  const H = timer ? '9' : '5'
  const bit = timer ? 'A0' : 'C0'  // bit 7 (enable) + bit 5 or 6
  const code = `
      JMP SKIP
      BIT $C4${X}${L} ; $2003 read low-order counter to reset the interrupt flag
      PLP
      SEC           ; set flag to get out of our loop early
      PHP
      RTI
SKIP  LDA #$7F      ; turn off all timer enable bits
      STA $C4${X}E
      LDA #$${bit}  ; turn on timer enable bit
      STA $C4${X}E
      LDY #$20      ; Interrupt should fire before this counts down to zero
      LDA #$99
      STA $C4${X}${L}
      STZ $C4${X}${H}   ; transfer both latches into counters and "start" the timer
      CLC
LOOP  DEY        ; 2 + 2 + 3 = 7 cycles for this loop
      BCS DONE   ;
      BNE LOOP   ;
DONE  TYA`
  return code.split(`\n`)
}

for (let chip = 0; chip <= 1; chip++) {
  for (let timer = 0; timer <= 1; timer++) {
    test(`interrupt-${chip}-T${timer + 1}`, () => {
      // Force our fake ROM's NMI and IRQ vectors to point to our handler
      memory[0x23FFA] = 0x03
      memory[0x23FFB] = 0x20
      memory[0x23FFE] = 0x03
      memory[0x23FFF] = 0x20
//      doSetDebug()
      runAssemblyTest(interrupt(chip, timer), 0x0A, C)
    })
  }
}
