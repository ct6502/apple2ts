import { processInstruction } from "./cpu6502"
import { getHires, memory, updateAddressTables } from "./memory"
import { s6502, setPC } from "./instructions"
import { hiresLineToAddress, RUN_MODE, TEST_DEBUG, TEST_GRAPHICS } from "../common/utility"
import { parseAssembly } from "./utility/assembler"
import { doSetCycleCount, doSetRunMode, doSetSpeedMode } from "./motherboard"
import { SWITCHES } from "./softswitches"
import { setIsTesting } from "./worker2main"

// Make sure we don't accidentally leave debug mode on.
test("debugMode", () => {
  expect(TEST_DEBUG).toEqual(false)
  expect(TEST_GRAPHICS).toEqual(false)
})

test("processInstruction", () => {
  const pcode = parseAssembly(0x2000, [" LDA #$C0"])
  memory.set(pcode, 0x2000)
  updateAddressTables()
  setPC(0x2000)
  processInstruction()
  expect(s6502.PC).toEqual(0x2002)
  expect(s6502.Accum).toEqual(0xC0)
})

test("slow CPU refresh reaches the bottom HGR scanline", () => {
  jest.useFakeTimers()
  setIsTesting()
  const oldText = SWITCHES.TEXT.isSet
  const oldHires = SWITCHES.HIRES.isSet
  const oldPage2 = SWITCHES.PAGE2.isSet

  try {
    SWITCHES.TEXT.isSet = false
    SWITCHES.HIRES.isSet = true
    SWITCHES.PAGE2.isSet = false
    memory[hiresLineToAddress(0x2000, 191)] = 0x5A
    memory.set([0x4C, 0x00, 0x08], 0x0800) // JMP $0800
    updateAddressTables()
    setPC(0x0800)
    doSetCycleCount(0)
    doSetSpeedMode(-2)
    doSetRunMode(RUN_MODE.RUNNING)

    // The first refresh runs immediately; nine timers complete one frame.
    for (let refresh = 1; refresh < 10; refresh++) {
      jest.advanceTimersToNextTimer()
    }

    expect(getHires()[40 * 191]).toEqual(0x5A)
    expect(SWITCHES.VBL.isSet).toEqual(true)
  } finally {
    doSetRunMode(RUN_MODE.PAUSED)
    SWITCHES.TEXT.isSet = oldText
    SWITCHES.HIRES.isSet = oldHires
    SWITCHES.PAGE2.isSet = oldPage2
    jest.clearAllTimers()
    jest.useRealTimers()
  }
})
