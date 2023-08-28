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
}


// $30a: $c40b = $40
// $30d: $c40e = $7f
// $399: $c40d = $c0
// $39c: $c40e = $c0
// $3a1: $c405 = $26
// 3    ORB      EQU   $C400      ;PORT B
// 4    ORA      EQU   $C401      ;PORT A
// 7    * ADDRESSES FOR SECOND 6522
// 8    ORB2     EQU   $C480      ;PORT B
// 9    ORA2     EQU   $C481      ;PORT A
const registers = [Array<number>(16).fill(0),
  Array<number>(16).fill(0)]
type Channel = 0 | 1
let PORT_A_DATA = [0, 0]
let REGISTER_LATCH = [0, 0]

const handleCommand = (chip: Channel, value: number) => {
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

export const handleMockingboard: AddressCallback = (addr: number, value = -1) => {
  if (addr < 0xC100) return -1
//  debugSlot(currentSlot, addr, value)
  const address = addr & 0xFF
  switch (address) {
    case 0x04: // fall thru
    case 0x84: return 255 - (cycleCount % 256)
    case 0x02: break // $07 6522-1 Data direction register B - always enable
    case 0x03: break // $FF 6522-1 Data direction register A - always enable
    case 0x82: break // $07 6522-2 Data direction register B - always enable
    case 0x83: break // $FF 6522-2 Data direction register A - always enable
    case 0x00: handleCommand(0, value); break   // ORB #1
    case 0x80: handleCommand(1, value); break   // ORB #2
    case 0x01: if (value >= 0) PORT_A_DATA[0] = value; break
    case 0x81: if (value >= 0) PORT_A_DATA[1] = value; break
    default: debugSlot(currentSlot, addr, value)
      break;
  }
  return -1
}
