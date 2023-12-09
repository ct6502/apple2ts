import { interruptRequest, nonMaskableInterrupt, registerCycleCountCallback } from "../cpu6502";
import { s6502 } from "../instructions";
import { debugSlot, memGetSlotROM, memSetSlotROM, setSlotIOCallback } from "../memory"
import { passMockingboard } from "../worker2main"

export const enableMockingboard = (enable = true, slot = 4) => {
  if (!enable)
    return
  setSlotIOCallback(slot, handleMockingboard)
  registerCycleCountCallback(cycleCountCallback, slot)
}

const ORB = [0x0, 0x80]
const ORA = [0x1, 0x81]
const DDRB = [0x02, 0x82]
const DDRA = [0x03, 0x83]
const T1CL = [0x4, 0x84] // CL/CH = counter low/high
const T1CH = [0x5, 0x85]
const T1LL = [0x6, 0x86] // LL/LH = latch low/high
const T1LH = [0x7, 0x87]
const T2CL = [0x8, 0x88]
const T2CH = [0x9, 0x89]
const SHR = [0xA, 0x8A]
const ACR = [0xB, 0x8B]
const PCR = [0xC, 0x8C]
const IFR = [0xD, 0x8D]
const IER = [0xE, 0x8E]

// these are not part of 6522 registers, but store them in our ROM
// so they get saved with the state.
const T2LL = [0x10, 0x91]
const REG_LATCH = [0x11, 0x91]
const TIMER_FIRED = [0x12, 0x92]
const REG = [0x20, 0xA0]   // $C420...C42F and $C4A0...$C4AF

const TIMER1 = 64
const TIMER2 = 32

export const resetMockingboard = (slot = 4) => {
  // Clear out all our old parameters and interrupt flags.
  // Otherwise we hang on a reset or reboot.
  for (let addr = 0; addr <= 255; addr++) {
    memSetSlotROM(slot, addr, 0)
  }
  // Stop the music.
  for (let chip = 0; chip <= 1; chip++) {
    doPassRegisters(slot, chip)
  }
}

const T1enabled = (slot: number, chip: number) => (memGetSlotROM(slot, IER[chip]) & TIMER1) !== 0
const T1fired = (slot: number, chip: number) => (memGetSlotROM(slot, TIMER_FIRED[chip]) & TIMER1) !== 0
const T1continuous = (slot: number, chip: number) => (memGetSlotROM(slot, ACR[chip]) & TIMER1) !== 0

const handleTimerT1 = (slot: number, chip: number, cycleDelta: number) => {
  let t1low = memGetSlotROM(slot, T1CL[chip]) - cycleDelta
  memSetSlotROM(slot, T1CL[chip], t1low)
  if (t1low < 0) {
    t1low = (t1low % 256) + 256
    memSetSlotROM(slot, T1CL[chip], t1low)
    let t1high = memGetSlotROM(slot, T1CH[chip])
    t1high--
    memSetSlotROM(slot, T1CH[chip], t1high)
    if (t1high < 0) {
      t1high += 256
      memSetSlotROM(slot, T1CH[chip], t1high)
      // if (T1enabled(chip)) {
      //   console.log(`T1: ${T1enabled(chip)} ${T1fired(chip)} ${T1continuous(chip)}`)
      // }
      if (T1enabled(slot, chip) && (!T1fired(slot, chip) || T1continuous(slot, chip))) {
        const fired = memGetSlotROM(slot, TIMER_FIRED[chip])
        memSetSlotROM(slot, TIMER_FIRED[chip], fired | TIMER1)
        const ifr = memGetSlotROM(slot, IFR[chip])
        memSetSlotROM(slot, IFR[chip], ifr | TIMER1)
        handleInterruptFlag(slot, chip, -1)
        if (T1continuous(slot, chip)) {
          const t1NewHigh = memGetSlotROM(slot, T1LH[chip])
          const t1NewLow = memGetSlotROM(slot, T1LL[chip])
          memSetSlotROM(slot, T1CL[chip], t1NewLow)
          memSetSlotROM(slot, T1CH[chip], t1NewHigh)
        }
      }
    }
  }
}

const T2enabled = (slot: number, chip: number) => (memGetSlotROM(slot, IER[chip]) & TIMER2) !== 0
const T2fired = (slot: number, chip: number) => (memGetSlotROM(slot, TIMER_FIRED[chip]) & TIMER2) !== 0

const handleTimerT2 = (slot: number, chip: number, cycleDelta: number) => {
  // If Timer2 is in pulse-counting mode just bail
  if ((memGetSlotROM(slot, ACR[chip]) & TIMER2) !== 0) return
  let t2low = memGetSlotROM(slot, T2CL[chip]) - cycleDelta
  memSetSlotROM(slot, T2CL[chip], t2low)
  if (t2low < 0) {
    t2low = (t2low % 256) + 256
    memSetSlotROM(slot, T2CL[chip], t2low)
    let t2high = memGetSlotROM(slot, T2CH[chip])
    t2high--
    memSetSlotROM(slot, T2CH[chip], t2high)
    if (t2high < 0) {
      t2high += 256
      memSetSlotROM(slot, T2CH[chip], t2high)
//      if (T2enabled(chip)) {
//        console.log(`T2: ${T2enabled(chip)} ${T2_DIDFIRE[chip]}`)
//      }
      if (T2enabled(slot, chip) && !T2fired(slot, chip)) {
        const fired = memGetSlotROM(slot, TIMER_FIRED[chip])
        memSetSlotROM(slot, TIMER_FIRED[chip], fired | TIMER2)
        const ifr = memGetSlotROM(slot, IFR[chip])
        memSetSlotROM(slot, IFR[chip], ifr | TIMER2)
        handleInterruptFlag(slot, chip, -1)
      }
    }
  }
}

const prevCycleCount = new Array<number>(8).fill(0)

const cycleCountCallback = (slot: number) => {
  const cycleDelta = s6502.cycleCount - prevCycleCount[slot]
  for (let chip = 0; chip <= 1; chip++) {
    handleTimerT1(slot, chip, cycleDelta)
    handleTimerT2(slot, chip, cycleDelta)
  }
  prevCycleCount[slot] = s6502.cycleCount
}

const getRegisters = (slot: number, chip: number) => {
  const registers: number[] = []
  for (let reg = 0; reg <= 15; reg++) {
    registers[reg] = memGetSlotROM(slot, REG[chip] + reg)
  }
  return registers
}

const compareArrays = (a: number[], b: number[]) =>
  a.length === b.length && a.every((x, i) => x === b[i]);

const prev: MockingboardSound = {slot: -1, chip: -1, params: [-1]}

let doPassRegisters = (slot: number, chip: number) => {
  const params = getRegisters(slot, chip)
  if (slot === prev.slot && chip === prev.chip && compareArrays(params, prev.params)) return
  prev.slot = slot
  prev.chip = chip
  prev.params = params
  passMockingboard({slot, chip, params})
}

// Needed for tests, because they don't run in a worker thread.
export const disablePassRegisters = () => {
  doPassRegisters = () => {null}
}

const handleCommand = (slot: number, chip: number) => {
  const orb = memGetSlotROM(slot, ORB[chip])
  // Some programs (Ultima 5) pass extra bits, so just remove them
  switch (orb & 7) {
    case 0:   // RESET command
      for (let reg = 0; reg <= 15; reg++) {
        memSetSlotROM(slot, REG[chip] + reg, 0)
      }
      doPassRegisters(slot, chip)
      break
    case 7:   // LATCH command, save the appropriate register number
      memSetSlotROM(slot, REG_LATCH[chip], memGetSlotROM(slot, ORA[chip]))
      break
    case 6: {  // WRITE command
      // Store the stashed value in the previously-latched register
      const reg =  memGetSlotROM(slot, REG_LATCH[chip])
      const value = memGetSlotROM(slot, ORA[chip])
      if (reg >= 0 && reg <= 15) {
        memSetSlotROM(slot, REG[chip] + reg, value)
        doPassRegisters(slot, chip)
      }
      break
    }
    case 4:   // Inactive
      // Do I need to do something here?
      break
    default:
      break
  }
}

const handleInterruptFlag = (slot: number, chip: number, value: number) => {
  let ifr = memGetSlotROM(slot, IFR[chip])
  if (value >= 0) {
    // Turn off any interrupt bits that are set in our value.
    // Leave other bits alone.
    ifr &= (127 - (value & 127))
    memSetSlotROM(slot, IFR[chip], ifr)
  }
  switch (chip) {
    case 0: interruptRequest(slot, ifr !== 0); break
    case 1: nonMaskableInterrupt(ifr !== 0); break
  }
}

const handleInterruptEnable = (slot: number, chip: number, value: number) => {
  let ier = memGetSlotROM(slot, IER[chip])
  if (value >= 0) {
    value = value & 255
    if (value & 128) {
      // Turn on any interrupt bits that are set in our enable register.
      // Leave other bits alone.
      ier |= value
    } else {
      // Turn off any interrupt bits that are set in our enable register.
      // Leave other bits alone.
      ier &= (255 - value)
    }
  }
  // Bit 7 is always on for reading.
  ier |= 128
  memSetSlotROM(slot, IER[chip], ier)
}

let debug = 1000

export const handleMockingboard: AddressCallback = (addr: number, value = -1) => {
  if (addr < 0xC100) return -1
  const slot = (addr & 0xF00) >> 8
  const address = addr & 0xFF
  if (debug < 500) {//} && ((address >= 0x4 && address < 0x80) || address >= 0x84)) {
    debug++
    const oldvalue = memGetSlotROM(slot, address)
    debugSlot(slot, addr, oldvalue, value)
  }
  const chip = (address & 0x80) ? 1 : 0
  switch (address) {
    case ORB[chip]: // ORB
      if (value >= 0) {
        memSetSlotROM(slot, ORB[chip], value)
        handleCommand(slot, chip)
      }
      break
    case ORA[chip]: // Output register A
    case DDRB[chip]: // $07 Data direction register B - output bits 1,2,4
    case DDRA[chip]: // $FF Data direction register A - all output
    case SHR[chip]: // Shift register (unused)
    case ACR[chip]: // Auxiliary control register
    case PCR[chip]: // Peripheral control register (unused)
      memSetSlotROM(slot, address, value)
      break
    case T1CL[chip]: // Timer 1 low-order counter
      if (value >= 0) {
        // Copy counter into latch
        memSetSlotROM(slot, T1LL[chip], value)
      }
      // Reset T1 interrupt (Note that a "write" also does a "read")
      handleInterruptFlag(slot, chip, TIMER1)
      break
    case T1CH[chip]: // Timer 1 high-order counter, fall thru
      if (value >= 0) {
        memSetSlotROM(slot, T1LH[chip], value)
        memSetSlotROM(slot, T1CL[chip], memGetSlotROM(slot, T1LL[chip]))
        memSetSlotROM(slot, T1CH[chip], value)
        // Reset T1 interrupt flag
        const fired = memGetSlotROM(slot, TIMER_FIRED[chip])
        memSetSlotROM(slot, TIMER_FIRED[chip], fired & ~TIMER1)
        handleInterruptFlag(slot, chip, TIMER1)
      }
      break
    case T1LL[chip]: // Timer 1 low-order latch
      if (value >= 0) {
        memSetSlotROM(slot, address, value)
        // This seems weird (and contradicts the datasheet?) but writing into
        // the low-order latch also does a read from the low-order counter,
        // and hence resets the interrupt flag. This was the only
        // way to get Ultima 5 to play music.
        handleInterruptFlag(slot, chip, TIMER1)
      }
      break
    case T1LH[chip]: // Timer 1 high-order latch
      if (value >= 0) {
        memSetSlotROM(slot, address, value)
      }
      break
    case T2CL[chip]: // Timer 2 low-order latch/counter
      if (value >= 0) {
        memSetSlotROM(slot, T2LL[chip], value)
      }
      // Reset T2 interrupt (Note that a "write" also does a "read")
      handleInterruptFlag(slot, chip, TIMER2)
      break
    case T2CH[chip]: // Timer 2 high-order counter
      if (value >= 0) {
        memSetSlotROM(slot, T2CH[chip], value)
        memSetSlotROM(slot, T2CL[chip], memGetSlotROM(slot, T2LL[chip]))
        // Reset T2 interrupt flag
        const fired = memGetSlotROM(slot, TIMER_FIRED[chip])
        memSetSlotROM(slot, TIMER_FIRED[chip], fired & ~TIMER2)
        handleInterruptFlag(slot, chip, TIMER2)
      }
      break
    case IFR[chip]: // Interrupt flag register
      if (value >= 0) {
        handleInterruptFlag(slot, chip, value)
      }
      break
    case IER[chip]: // Interrupt enable register
      handleInterruptEnable(slot, chip, value)
      break
    default: // debugSlot(slot, addr, value)
      break;
  }
  return -1
}
