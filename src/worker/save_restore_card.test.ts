import { DEFAULT_SLOT_CONFIG } from "../common/utility"
import { interruptRequest } from "./cpu6502"
import { memGetSlotROM, memSetSlotROM } from "./memory"
import { handleMockingboard, resetMockingboard } from "./devices/mockingboard"
import { configureMachine, doSetSlotConfig } from "./motherboard"
import { getApple2State, setApple2State } from "./save_restore"
import { setIsTesting } from "./worker2main"
import { s6502 } from "./instructions"

afterEach(() => interruptRequest(4, false))

test("v2 save state preserves Mockingboard registers and timers", () => {
  setIsTesting()
  doSetSlotConfig({...DEFAULT_SLOT_CONFIG})
  configureMachine()
  resetMockingboard(4)
  memSetSlotROM(4, 0x04, 0x34)
  memSetSlotROM(4, 0x05, 0x12)
  memSetSlotROM(4, 0x20, 0x56)
  memSetSlotROM(4, 0x13, 0x40)
  memSetSlotROM(4, 0x0D, 0x40)
  memSetSlotROM(4, 0x0E, 0x40)
  handleMockingboard(0xC488, 0x37) // second VIA's Timer 2 low latch
  memSetSlotROM(4, 0x91, 3) // independent sound-register selection

  const saved = getApple2State()
  resetMockingboard(4)
  setApple2State(saved, 2)

  expect(memGetSlotROM(4, 0x04)).toBe(0x34)
  expect(memGetSlotROM(4, 0x05)).toBe(0x12)
  expect(memGetSlotROM(4, 0x20)).toBe(0x56)
  expect(memGetSlotROM(4, 0x13)).toBe(0x40)
  expect(memGetSlotROM(4, 0x0D)).toBe(0xC0)
  expect(s6502.flagIRQ & (1 << 4)).not.toBe(0)
  handleMockingboard(0xC489, 0x12) // load Timer 2 from the restored latch
  expect(memGetSlotROM(4, 0x88)).toBe(0x37)
  expect(memGetSlotROM(4, 0x91)).toBe(3)
})
