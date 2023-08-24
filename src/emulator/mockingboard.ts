import { cycleCount } from "./instructions";
import { debugSlot, setSlotIOCallback } from "./memory"

// const code = new Uint8Array(256).fill(0x60);
let currentSlot = 0

export const enableMockingboard = (enable = true, slot = 4) => {
  if (!enable)
    return
  currentSlot = slot
  setSlotIOCallback(slot, handleMockingboard)
}

export const handleMockingboard: AddressCallback = (addr: number, value = -1) => {
  if (addr < 0xC100) return -1
  debugSlot(currentSlot, addr, value)
  const address = addr & 0xFF
  switch (address) {
    case 0x04: // fall thru
    case 0x84: return 255 - (cycleCount % 256)
    default:
      break;
  }
  return -1
}
