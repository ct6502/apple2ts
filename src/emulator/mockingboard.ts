import { interruptRequest, nonMaskableInterrupt, registerCycleCountCallback } from "./cpu6502";
import { cycleCount } from "./instructions";
import { debugSlot, setSlotIOCallback } from "./memory"
import { passMockingboard } from "./worker2main"

// const code = new Uint8Array(256).fill(0x60);
let currentSlot = 0

export const enableMockingboard = (enable = true, slot = 4) => {
  if (!enable)
    return
  currentSlot = slot
  setSlotIOCallback(slot, handleMockingboard)
  registerCycleCountCallback(cycleCountCallback)
}


const registers = [Array<number>(16).fill(0),
  Array<number>(16).fill(0)]
let PORT_A_DATA = [0, 0]
let REGISTER_LATCH = [0, 0]
let AUX_CONTROL = [0, 0]
const INTERRUPT_FLAGS = [0, 0]
let T1_DIDFIRE = [false, false]
let T2_DIDFIRE = [false, false]
let INTERRUPT_ENABLE = [128, 128]
let T1_LATCH_LOW = [0, 0]
let T1_LATCH_HIGH = [0, 0]
let T1_COUNTER_LOW = [0, 0]
let T1_COUNTER_HIGH = [0, 0]
let T2_LATCH_LOW = [0, 0]
let T2_COUNTER_LOW = [0, 0]
let T2_COUNTER_HIGH = [0, 0]
const TIMER1 = 64
const TIMER2 = 32

// Used for tests only
export const _getRegisters = (chip: Chip6522) => {
  return registers[chip]
}

const T1enabled = (chip: number) => (INTERRUPT_ENABLE[chip] & TIMER1) !== 0
const T1continuous = (chip: number) => (AUX_CONTROL[chip] & 64) !== 0

const handleTimerT1 = (chip: Chip6522, cycleDelta: number) => {
  T1_COUNTER_LOW[chip] -= cycleDelta
  if (T1_COUNTER_LOW[chip] < 0) {
    T1_COUNTER_LOW[chip] = (T1_COUNTER_LOW[chip] % 256) + 256
    T1_COUNTER_HIGH[chip]--
    if (T1_COUNTER_HIGH[chip] < 0) {
      T1_COUNTER_HIGH[chip] += 256
      if (T1enabled(chip)) {
//        console.log(`T1: ${T1enabled(chip)} ${T1_DIDFIRE[chip]} ${T1continuous(chip)}`)
      }
      if (T1enabled(chip) && (!T1_DIDFIRE[chip] || T1continuous(chip))) {
        T1_DIDFIRE[chip] = true
        INTERRUPT_FLAGS[chip] |= (128 | TIMER1)
        handleInterruptFlag(chip ? 1 : 0, -1)
        if (T1continuous(chip)) {
          T1_COUNTER_LOW[chip] = T1_LATCH_LOW[chip]
          T1_COUNTER_HIGH[chip] = T1_LATCH_HIGH[chip]
        }
      }
    }
  }
}

const T2enabled = (chip: number) => (INTERRUPT_ENABLE[chip] & TIMER2) !== 0

const handleTimerT2 = (chip: Chip6522, cycleDelta: number) => {
  T2_COUNTER_LOW[chip] -= cycleDelta
  if (T2_COUNTER_LOW[chip] < 0) {
    T2_COUNTER_LOW[chip] = (T2_COUNTER_LOW[chip] % 256) + 256
    T2_COUNTER_HIGH[chip]--
    if (T2_COUNTER_HIGH[chip] < 0) {
      T2_COUNTER_HIGH[chip] += 256
      if (T2enabled(chip)) {
//        console.log(`T2: ${T2enabled(chip)} ${T2_DIDFIRE[chip]}`)
      }
      if (T2enabled(chip) && !T2_DIDFIRE[chip]) {
        T2_DIDFIRE[chip] = true
        INTERRUPT_FLAGS[chip] |= TIMER2
        handleInterruptFlag(chip, -1)
      }
    }
  }
}

let prevCycleCount = 0

const cycleCountCallback = () => {
  const cycleDelta = cycleCount - prevCycleCount
  for (let chip = 0; chip <= 1; chip++) {
    handleTimerT1(chip ? 1 : 0, cycleDelta)
    handleTimerT2(chip ? 1 : 0, cycleDelta)
  }
  prevCycleCount = cycleCount
}

const handleCommand = (chip: Chip6522, value: number) => {
  switch (value) {
    case 0:   // RESET command
      registers[chip].fill(0)
      passMockingboard({chip, params: registers[chip]})
      break
    case 7:   // LATCH command, save the appropriate register number
      REGISTER_LATCH[chip] = PORT_A_DATA[chip]
      break
    case 6:   // WRITE command
      // Store the stashed value in the previously-latched register
      if (REGISTER_LATCH[chip] >= 0 && REGISTER_LATCH[chip] <= 15) {
        registers[chip][REGISTER_LATCH[chip]] = PORT_A_DATA[chip]
        if (REGISTER_LATCH[chip] === 15) {
          passMockingboard({chip, params: registers[chip]})
        }
      }
      break
    case 4:   // Inactive
      // Do I need to do something here?
      break
    default:
      break
  }
}

const handleInterruptFlag = (chip: Chip6522, value: number) => {
  if (value >= 0) {
    // Turn off any interrupt bits that are set in our value.
    // Leave other bits alone.
    INTERRUPT_FLAGS[chip] &= (127 - (value & 127))
  }
  // Set bit 7 if any other interrupt flags are set
  if (INTERRUPT_FLAGS[chip] & 127) {
    INTERRUPT_FLAGS[chip] |= 128
  } else {
    INTERRUPT_FLAGS[chip] = 0
  }
//  console.log(`***** handleInterruptFlag chip ${chip} ${INTERRUPT_FLAGS[chip]}`)
  switch (chip) {
    case 0: interruptRequest(currentSlot, INTERRUPT_FLAGS[0] !== 0); break
    case 1: nonMaskableInterrupt(INTERRUPT_FLAGS[1] !== 0); break
  }
}

const handleInterruptEnable = (chip: Chip6522, value: number) => {
  debug = 0
  if (value < 0) return
  value = value & 255
  if (value & 128) {
    // Turn on any interrupt bits that are set in our enable register.
    // Leave other bits alone.
    INTERRUPT_ENABLE[chip] |= value
  } else {
    // Turn off any interrupt bits that are set in our enable register.
    // Leave other bits alone.
    INTERRUPT_ENABLE[chip] &= (255 - value)
  }
  // Bit 7 is always on for reading.
  INTERRUPT_ENABLE[chip] |= 128
}

let debug = 0

export const handleMockingboard: AddressCallback = (addr: number, value = -1) => {
  if (addr < 0x99C100) return -1
  if (debug < 100) {
    debug++
    debugSlot(currentSlot, addr, value)
  }
  const address = addr & 0xFF
  const chip: Chip6522 = (address & 0x80) ? 1 : 0
  switch (address) {
    case 0x00: // ORB #1, fall thru
    case 0x80: handleCommand(chip, value); break   // ORB #2
    case 0x01: // ORA #1, fall thru
    case 0x81: if (value >= 0) PORT_A_DATA[chip] = value; break
    case 0x02: break // $07 Data direction register B - output bits 1,2,4
    case 0x82: break // $07 Data direction register B - output bits 1,2,4
    case 0x03: break // $FF Data direction register A - all output
    case 0x83: break // $FF Data direction register A - all output

    case 0x04: // Timer 1 low-order counter, fall thru
    case 0x84:
      if (value >= 0) {
        T1_LATCH_LOW[chip] = value
      } else {
        // reset T1 interrupt flag
        handleInterruptFlag(chip, TIMER1)
      }
      return T1_COUNTER_LOW[chip]
    case 0x05: // Timer 1 high-order counter, fall thru
    case 0x85:
      if (value >= 0) {
        T1_LATCH_HIGH[chip] = value
        T1_COUNTER_LOW[chip] = T1_LATCH_LOW[chip]
        T1_COUNTER_HIGH[chip] = T1_LATCH_HIGH[chip]
        // Reset T1 interrupt flag
        T1_DIDFIRE[chip] = false
        handleInterruptFlag(chip, TIMER1)
      }
      return T1_COUNTER_HIGH[chip]
    case 0x06: // Timer 1 low-order latch, fall thru
    case 0x86:
      if (value >= 0) {
        T1_LATCH_LOW[chip] = value
      }
      return T1_LATCH_LOW[chip]
    case 0x07: // Timer 1 high-order latch, fall thru
    case 0x87:
      if (value >= 0) {
        T1_LATCH_HIGH[chip] = value
      }
      return T1_LATCH_HIGH[chip]

    case 0x08: // Timer 2 low-order latch/counter, fall thru
    case 0x88:
      if (value >= 0) {
        T2_LATCH_LOW[chip] = value
      } else {
        // Reset T2 interrupt flag
        handleInterruptFlag(chip, TIMER2)
      }
      return T2_COUNTER_LOW[chip]

    case 0x09: // Timer 2 high-order counter, fall thru
    case 0x89:
      if (value >= 0) {
        T2_COUNTER_HIGH[chip] = value
        T2_COUNTER_LOW[chip] = T2_LATCH_LOW[chip]
        // Reset T2 interrupt flag
        T2_DIDFIRE[chip] = false
        handleInterruptFlag(chip, TIMER2)
      }
      return T2_COUNTER_HIGH[chip]

    case 0x0A: break // Shift register (unused)
    case 0x8A: break // Shift register (unused)
    case 0x0B: // Auxiliary control register, fall thru
    case 0x8B: AUX_CONTROL[chip] = value; return AUX_CONTROL[chip]
    case 0x0C: break // Peripheral control register (unused)
    case 0x8C: break // Peripheral control register (unused)
    case 0x0D: // Interrupt flag register, fall thru
    case 0x8D: handleInterruptFlag(chip, value); return INTERRUPT_FLAGS[chip]
    case 0x0E: // Interrupt enable register, fall thru
    case 0x8E: handleInterruptEnable(chip, value); return INTERRUPT_ENABLE[chip]
    default: //debugSlot(currentSlot, addr, value)
      break;
  }
  return value
}
// $30a: $c40b = $40
// $30d: $c40e = $7f
// $399: $c40d = $c0
// $39c: $c40e = $c0
// $3a1: $c405 = $26
// $30a: $c40b = $4
// $30d: $c40e = $4