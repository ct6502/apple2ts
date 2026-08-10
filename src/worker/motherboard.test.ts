import { BREAKPOINT_RESULT, breakpointMap, doSetBreakpoints, hitBreakpoint, processInstruction } from "./cpu6502"
import { getHires, memGet, memory, updateAddressTables } from "./memory"
import { s6502, setPC } from "./instructions"
import { hiresLineToAddress, RUN_MODE, TEST_DEBUG, TEST_GRAPHICS } from "../common/utility"
import { parseAssembly } from "./utility/assembler"
import { doBoot, doSetCycleCount, doSetMachineName, doSetRunMode, doSetSpeedMode, getExternalMachineState, resetCpuSpeedForTesting } from "./motherboard"
import { SWITCHES } from "./softswitches"
import { setIsTesting } from "./worker2main"
import { BreakpointMap, BreakpointNew } from "../common/breakpoint"

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
    expect(SWITCHES.VBLINV.isSet).toEqual(false)
  } finally {
    doSetRunMode(RUN_MODE.PAUSED)
    SWITCHES.TEXT.isSet = oldText
    SWITCHES.HIRES.isSet = oldHires
    SWITCHES.PAGE2.isSet = oldPage2
    jest.clearAllTimers()
    jest.useRealTimers()
  }
})

// Weird "no delay mode" (issue #24) should not be available on the Apple II+
test("noDelayMode", () => {
  SWITCHES.COLUMN80.isSet = false
  SWITCHES.DHIRES.isSet = true
  const state1 = getExternalMachineState()
  expect(state1.noDelayMode).toEqual(true)
  doSetMachineName("APPLE2P")
  SWITCHES.COLUMN80.isSet = false
  SWITCHES.DHIRES.isSet = true
  const state2 = getExternalMachineState()
  expect(state2.noDelayMode).toEqual(false)
  doSetMachineName("APPLE2EE")
  SWITCHES.COLUMN80.isSet = false
  SWITCHES.DHIRES.isSet = true
  const state3 = getExternalMachineState()
  expect(state3.noDelayMode).toEqual(true)
})

test("test VBL $C019 value", () => {
  jest.useFakeTimers()
  setIsTesting()
  try {
    doBoot()
    resetCpuSpeedForTesting()
    doSetRunMode(RUN_MODE.RUNNING)
    const stepMs = 100  // 1000 steps × 1ms = 1 second
    let countWithinVBL = 0
    const refreshMax = 1000
    for (let refresh = 1; refresh <= refreshMax; refresh++) {
      jest.advanceTimersByTime(stepMs)
      if (refresh > 10) {
        doSetRunMode(RUN_MODE.NEED_RESET)
      }
      // The cycle count will steadily increase and we will "randomly" be
      // either within or outside of the vertical blank period
      const withinVBL = (s6502.cycleCount % 17030) < 4550
      if (withinVBL) {
        countWithinVBL++
      }
      expect(memGet(0xC019)).toEqual(withinVBL ? 0x00 : 0x80)
    }
    // within VBL should be 4550 / 17030 ≈ 0.267 of the time
    expect(countWithinVBL).toBeGreaterThan(0.2 * refreshMax)
    expect(countWithinVBL).toBeLessThan(0.31 * refreshMax)
  } finally {
    doSetRunMode(RUN_MODE.PAUSED)
    jest.clearAllTimers()
    jest.useRealTimers()
  }
})

test.each([
  ["$C061", SWITCHES.PB0.isSetAddr],
  ["$C062", SWITCHES.PB1.isSetAddr],
  ["$0038", 0x0038],
  ["$0039", 0x0039],
])("machine-state polling does not consume a watchpoint at %s", (_label, address) => {
  const breakpoints = new BreakpointMap()
  const breakpoint = BreakpointNew()
  breakpoint.address = address
  breakpoint.watchpoint = true
  breakpoint.memget = true
  breakpoint.once = true
  breakpoints.set(breakpoint.address, breakpoint)
  doSetBreakpoints(breakpoints)

  try {
    getExternalMachineState()
    expect(breakpointMap.get(breakpoint.address)).toBe(breakpoint)
    expect(hitBreakpoint()).toEqual(BREAKPOINT_RESULT.NO_BREAK)
  } finally {
    doSetBreakpoints(new BreakpointMap())
  }
})
