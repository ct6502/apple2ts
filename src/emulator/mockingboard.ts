import { cycleCount } from "./instructions";
import { setSlotDriver } from "./memory"

const code = new Uint8Array(256).fill(0x60);
let currentSlot = 0

export const enableMockingboard = (enable = true, slot = 4) => {
  if (!enable)
    return
  currentSlot = slot
//  const addr = 0xC004 + slot * 0x100
//  setSlotIO(addr, handleMockingboardRead)
}

export const handleMockingboard = (addr: number, value = -1) => {
  code[0x04] = 255 - (cycleCount % 256)
  code[0x84] = code[0x04]
  setSlotDriver(currentSlot, code)
}
