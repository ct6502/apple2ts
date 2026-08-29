import { runAssemblyTest } from "../instructions.test"
import { interruptRequest } from "../cpu6502"
import { s6502 } from "../instructions"
import { memory } from "../memory"
import { ROMmemoryStart } from "../../common/utility"
import { disablePassRegisters, resetMockingboard } from "./mockingboard"

test("temp", () => {})

const slot = 4

const N = 0b10000000
// const V = 0b01000000
// const B = 0b00010000
// const D = 0b00001000
const I = 0b00000100
const Z = 0b00000010
const C = 0b00000001

// Dynamically set the enable register to a specific value,
// then load the enable register into the Accumulator.
const ldaE_V = (chip: number, value: number) => {
  const X = chip ? "8" : "0"
  return `
  LDA #$${value.toString(16)}
  STA $C${slot}${X}E
  LDA $C${slot}${X}E
`.split("\n")
}

// Dynamically set the interrupt flag register to a specific value,
// then load the interrupt register into the Accumulator.
const ldaD_V = (chip: number, value: number) => {
  const X = chip ? "8" : "0"
  return `
  LDA #$${value.toString(16)}
  STA $C${slot}${X}D
  LDA $C${slot}${X}D
`.split("\n")
}

// None of these tests should affect the flags register.
for (let chip = 0; chip <= 1; chip++) {
  const X = chip ? "8" : "0"
  const ldaE = `LDA $C${slot}${X}E`
  const ldaD = `LDA $C${slot}${X}D`
  test("start E", () => runAssemblyTest([ldaE], 128, N))
  test("start D", () => runAssemblyTest([ldaD], 0, Z))

  // Turn off some interrupt flags (already all off so should not have an affect)
  test("erase E 1", () => runAssemblyTest(ldaE_V(chip, 127), 128, N))
  test("erase E 2", () => runAssemblyTest([ldaD], 0, Z))
  test("erase E 3", () => runAssemblyTest(ldaE_V(chip, 0), 128, N))
  test("erase E 4", () => runAssemblyTest([ldaD], 0, Z))

  // Set some flags in the enable register
  test("set E 5", () => runAssemblyTest(ldaE_V(chip, 0b11010101), 0b11010101, N))
  test("check D 5", () => runAssemblyTest([ldaD], 0, Z))

  // Turn off some flags using enable register
  test("set E 6", () => runAssemblyTest(ldaE_V(chip, 0b01010000), 0b10000101, N))
  test("check D 6", () => runAssemblyTest([ldaD], 0, Z))

  // Turn off all flags using enable register
  test("set E 7", () => runAssemblyTest(ldaE_V(chip, 0b01111111), 128, N))
  test("check D 7", () => runAssemblyTest([ldaD], 0, Z))
}

// Try to turn off some interrupt flags (already all off so no affect)
for (let chip = 0; chip <= 1; chip++) {
  const X = chip ? "8" : "0"
  const ldaD = `LDA $C${slot}${X}D`
  test("start D 2", () => runAssemblyTest([ldaD], 0, Z))
  test("erase D 2", () => runAssemblyTest(ldaD_V(chip, 0b10101010), 0, Z))
}

const latchRegister = (chip: number, reg: number, data: number) => {
  const X = chip ? "8" : "0"
  const RA = ((chip ? 0xA0 : 0x20) + reg).toString(16)
  return `
  LDA #$${reg.toString(16)}
  STA $C${slot}${X}1   ; ORA
  LDA #$07       ; Latch command
  STA $C${slot}${X}0   ; ORB
  LDA #$04       ; Inactive
  STA $C${slot}${X}0   ; ORB
  LDA #$${data.toString(16)}
  STA $C${slot}${X}1   ; ORA
  LDA #$06       ; Write command
  STA $C${slot}${X}0   ; ORB
  LDA #$04       ; Inactive
  STA $C${slot}${X}0   ; ORB
  LDA $C${slot}${RA}   ; read register (hack)
`.split("\n")
}

// Loop thru each chip and each register, doing a latch + write in assembly
// Currently there is no "read" from my Mockingboard driver so just use
// a helper routine to get the registers.
for (let chip = 1; chip <= 1; chip++) {
  disablePassRegisters()
  for (let reg = 0; reg <= 15; reg++) {
    const data = 0x10 + chip * 16 + reg
    const code = latchRegister(chip, reg, data)
    test(`latch/write ${chip} ${reg}`, () => runAssemblyTest(code, data, 0))
  }
}

const lda04a = (chip: number, timer: number) => {
  const X = chip ? "8" : "0"
  const T = timer ? "8" : "4"
  return `
    SEC
    LDA $C${slot}${X}${T}   ; this takes 4 cycles
    SBC $C${slot}${X}${T}
    CLC   ; carry flag is "random" after subtracting the timer countdown
    `.split("\n")
}

const lda04b = (chip: number, timer: number) => {
  const X = chip ? "8" : "0"
  const T = timer ? "8" : "4"
  return `
  LDA #$${X}${T}
  STA $80
  LDA #$C${slot}
  STA $81
  LDY #$0
  SEC
  LDA ($80),Y   ; this takes 5 cycles
  SBC $C${slot}${X}${T}
  CLC   ; carry flag is "random" after subtracting the timer countdown
  `.split("\n")
}

const lda04c = (chip: number, timer: number) => {
  const X = chip ? "8" : "0"
  const T = timer ? "9" : "5"
  return `
      LDY #$FF
      LDA $C${slot}${X}${T}
      STA $00
      NOP
LOOP  DEY
      BNE LOOP
      SEC
      LDA $00
      SBC $C${slot}${X}${T}
      CLC   ; carry flag is "random" after subtracting the timer countdown
`.split("\n")
}

// Test our Timer T1 and T2 counters
for (let chip = 0; chip <= 1; chip++) {
  for (let timer = 0; timer <= 1; timer++) {
    test(`lda04a-${chip}-T${timer + 1}`, () => runAssemblyTest(lda04a(chip, timer), 4, 0))
    test(`lda04b-${chip}-T${timer + 1}`, () => runAssemblyTest(lda04b(chip, timer), 5, 0))
    // There are ~1283 cycles between $C${slot}05 reads, so our high-order counter
    // should go down by 5.
    test(`lda04c-${chip}-T${timer + 1}`, () => runAssemblyTest(lda04c(chip, timer), 5, 0))
  }
}

const pollTimerWithInterruptDisabled = (timer: number) => {
  const L = timer ? "8" : "4"
  const H = timer ? "9" : "5"
  return `
      LDA #$7F
      STA $C${slot}0E   ; disable all VIA interrupts
      STA $C${slot}0D   ; clear all pending interrupt flags
      LDA #$00
      STA $C${slot}0B   ; use timed Timer 2 mode and one-shot Timer 1 mode
      LDA #$08
      STA $C${slot}0${L}
      STZ $C${slot}0${H}   ; load and start the timer
      LDY #$04
LOOP  DEY
      BNE LOOP
      LDA $C${slot}0D   ; poll IFR before a counter read can clear the flag
  `.split("\n")
}

test.each([
  ["Timer 1", 0, 0x40],
  ["Timer 2", 1, 0x20],
])("%s sets its IFR flag while its interrupt is disabled", (_name, timer, flag) => {
  runAssemblyTest(pollTimerWithInterruptDisabled(timer), flag, 0)
})

test("Timer 1 continuous reload permits one underflow after switching to one-shot", () => {
  runAssemblyTest(`
      SEI
      LDA #$7F
      STA $C${slot}0E   ; disable all VIA interrupts
      LDA #$40
      STA $C${slot}0D   ; clear any pending Timer 1 flag
      STA $C${slot}0B   ; continuous Timer 1 mode
      LDA #$C0
      STA $C${slot}0E   ; enable Timer 1 IRQ
      LDA #$40
      STA $C${slot}04
      STZ $C${slot}05   ; load and start Timer 1
FIRST LDA $C${slot}0D
      AND #$40
      BEQ FIRST         ; first continuous-mode underflow reloads the counter
      STZ $C${slot}0B   ; switch the reloaded interval to one-shot mode
      BIT $C${slot}04   ; acknowledge the first underflow
      LDY #$40
NEXT  LDA $C${slot}0D
      AND #$C0
      CMP #$C0          ; IFR and IRQ summary must assert on the next underflow
      BEQ SECOND
      DEY
      BNE NEXT
      LDA #$FF
      BNE DONE
SECOND BIT $C${slot}04  ; acknowledge the permitted one-shot underflow
      LDX #$00
      LDY #$00
WAIT  DEY
      BNE WAIT
      DEX
      BNE WAIT          ; wait through multiple subsequent counter wraps
      LDA $C${slot}0D
      AND #$C0          ; later one-shot underflows remain inhibited
DONE  CMP #$00
      CLV
      CLC
      CLI
  `.split("\n"), 0, Z)
})

test("a disabled timer does not clear the other VIA's interrupt", () => {
  resetMockingboard(slot)
  interruptRequest(slot, false)
  runAssemblyTest(`
      SEI
      LDA #$7F
      STA $C40E       ; disable all chip 0 interrupts
      STA $C48E       ; disable all chip 1 interrupts
      LDA #$C0
      STA $C48E       ; enable chip 1 Timer 1 interrupts
      LDA #$20
      STA $C404
      STZ $C405       ; start chip 0 Timer 1 without enabling its interrupt
      LDA #$08
      STA $C484
      STZ $C485       ; start chip 1 Timer 1
      LDY #$20
LOOP  DEY
      BNE LOOP
      LDA $C48D       ; confirm chip 1 still asserts its interrupt
  `.split("\n"), 0xC0, N | I)

  const irqActive = s6502.flagIRQ & (1 << slot)
  interruptRequest(slot, false)
  expect(irqActive).not.toBe(0)
})

const interrupt = (chip: number, timer: number) => {
  const X = chip ? "8" : "0"
  const L = timer ? "8" : "4"
  const H = timer ? "9" : "5"
  const bit = timer ? "A0" : "C0"  // bit 7 (enable) + bit 5 or 6
  const code = `
      JMP SKIP
      BIT $C${slot}${X}${L} ; $2003 read low-order counter to reset the interrupt flag
      PLP
      SEC           ; set flag to get out of our loop early
      PHP
      RTI
SKIP  LDA #$7F      ; turn off all timer enable bits
      STA $C${slot}${X}E
      LDA #$${bit}  ; turn on timer enable bit
      STA $C${slot}${X}E
      LDY #$20      ; Interrupt should fire before this counts down to zero
      LDA #$99
      STA $C${slot}${X}${L}
      STZ $C${slot}${X}${H}   ; transfer both latches into counters and "start" the timer
      CLC
LOOP  DEY        ; 2 + 2 + 3 = 7 cycles for this loop
      BCS DONE   ;
      BNE LOOP   ;
DONE  TYA`
  return code.split("\n")
}

for (let chip = 0; chip <= 1; chip++) {
  for (let timer = 0; timer <= 1; timer++) {
    test(`interrupt-${chip}-T${timer + 1}`, () => {
      // Force our fake ROM's NMI and IRQ vectors to point to our handler
      memory[ROMmemoryStart + 0x3FFA] = 0x03
      memory[ROMmemoryStart + 0x3FFB] = 0x20
      memory[ROMmemoryStart + 0x3FFE] = 0x03
      memory[ROMmemoryStart + 0x3FFF] = 0x20
//      doSetDebug()
      runAssemblyTest(interrupt(chip, timer), 0x0A, C)
    })
  }
}
