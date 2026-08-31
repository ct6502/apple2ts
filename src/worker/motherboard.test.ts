import { BREAKPOINT_RESULT, breakpointMap, doSetBreakpoints, hitBreakpoint, processInstruction } from "./cpu6502"
import { getHires, memGet, memory, updateAddressTables } from "./memory"
import { s6502, setPC } from "./instructions"
import { hiresLineToAddress, RamWorksMemoryStart, RUN_MODE, TEST_DEBUG, TEST_GRAPHICS } from "../common/utility"
import { parseAssembly } from "./utility/assembler"
import { doBoot, doLoadBinary, doReset, doRunBinary, doSetCycleCount, doSetMachineName, doSetRunMode, doSetSiriusJoyport, doSetSpeedMode, doSetState6502, getExternalMachineState, resetCpuSpeedForTesting } from "./motherboard"
import { SWITCHES } from "./softswitches"
import { setIsTesting } from "./worker2main"
import { BreakpointMap, BreakpointNew } from "../common/breakpoint"
import { getCurrentDriveState } from "./devices/drivestate"
import * as worker2main from "./worker2main"
import { getSiriusJoyport } from "./devices/sirius_joyport"

// Make sure we don't accidentally leave debug mode on.
test("debugMode", () => {
  expect(TEST_DEBUG).toEqual(false)
  expect(TEST_GRAPHICS).toEqual(false)
})

describe("Sirius reset", () => {
  beforeEach(() => {
    jest.useFakeTimers()
    setIsTesting()
    doSetCycleCount(0)
    doSetSiriusJoyport(true)
    doReset()
  })

  afterEach(() => {
    doSetSiriusJoyport(false)
    jest.clearAllTimers()
    jest.useRealTimers()
  })

  test("a live disable cancels delayed re-enable", () => {
    expect(getSiriusJoyport()).toBe(false)

    doSetSiriusJoyport(false)

    expect(getSiriusJoyport()).toBe(false)
    expect(jest.getTimerCount()).toBe(0)
  })

  test("a live enable waits for reset protection", () => {
    doSetSiriusJoyport(true)
    expect(getSiriusJoyport()).toBe(false)
    expect(jest.getTimerCount()).toBe(1)

    doSetCycleCount(1001)
    jest.advanceTimersByTime(50)
    expect(getSiriusJoyport()).toBe(true)
  })

  test("enabling after a disabled reset waits for reset protection", () => {
    doSetSiriusJoyport(false)
    doReset()

    doSetSiriusJoyport(true)

    expect(getSiriusJoyport()).toBe(false)
    expect(jest.getTimerCount()).toBe(1)
  })

  test("disabling and re-enabling does not bypass reset protection", () => {
    doSetSiriusJoyport(false)
    doSetSiriusJoyport(true)

    expect(getSiriusJoyport()).toBe(false)
    expect(jest.getTimerCount()).toBe(1)
  })

  test("restores an unchanged setting after startup", () => {
    doSetCycleCount(1001)
    jest.advanceTimersByTime(50)

    expect(getSiriusJoyport()).toBe(true)
  })

  test("a second reset restarts delayed re-enable", () => {
    doSetCycleCount(999)
    doReset()
    doSetCycleCount(1001)
    jest.advanceTimersByTime(50)
    expect(getSiriusJoyport()).toBe(false)

    doSetCycleCount(2000)
    jest.advanceTimersByTime(50)
    expect(getSiriusJoyport()).toBe(true)
  })
})

test("run binary resets hardware before loading and starting the program", () => {
  jest.useFakeTimers()
  setIsTesting()
  const drive = getCurrentDriveState()
  const previousFilename = drive.filename
  const previousMotorRunning = drive.motorRunning

  try {
    drive.filename = "mounted.woz"
    drive.motorRunning = true
    s6502.Accum = 0x99

    // Keep execution at the distinct entry address after the first refresh.
    const program = new Uint8Array([0xEA, 0x4C, 0x01, 0x60])
    doRunBinary(0x6000, program, 0x6001)

    expect(memory.slice(0x6000, 0x6004)).toEqual(program)
    expect(s6502.PC).toEqual(0x6001)
    expect(s6502.Accum).toEqual(0)
    expect(getExternalMachineState().runMode).toEqual(RUN_MODE.RUNNING)
    expect(drive.motorRunning).toEqual(false)
    expect(drive.filename).toEqual("mounted.woz")
  } finally {
    doSetRunMode(RUN_MODE.PAUSED, false)
    resetCpuSpeedForTesting()
    drive.filename = previousFilename
    drive.motorRunning = previousMotorRunning
    jest.clearAllTimers()
    jest.useRealTimers()
  }
})

test("load binary changes memory without changing execution or device state", () => {
  setIsTesting()
  const drive = getCurrentDriveState()
  const previousMotorRunning = drive.motorRunning
  const previousPC = s6502.PC
  const previousAccum = s6502.Accum
  const previousRunMode = getExternalMachineState().runMode

  try {
    s6502.PC = 0x4321
    s6502.Accum = 0x99
    drive.motorRunning = true
    const program = new Uint8Array([0xEA, 0x60])

    doLoadBinary(0x6000, program)

    expect(memory.slice(0x6000, 0x6002)).toEqual(program)
    expect(s6502.PC).toEqual(0x4321)
    expect(s6502.Accum).toEqual(0x99)
    expect(getExternalMachineState().runMode).toEqual(previousRunMode)
    expect(drive.motorRunning).toEqual(true)
  } finally {
    s6502.PC = previousPC
    s6502.Accum = previousAccum
    drive.motorRunning = previousMotorRunning
  }
})

test("load binary writes main RAM independently of auxiliary-memory mappings", () => {
  const previousAltZp = SWITCHES.ALTZP.isSet
  const previousPage2 = SWITCHES.PAGE2.isSet
  const previousRamWrite = SWITCHES.RAMWRT.isSet
  const previousStore80 = SWITCHES.STORE80.isSet
  const touchedAddresses = [0x01FF, RamWorksMemoryStart + 0x01FF, 0x0200, 0x03FF, RamWorksMemoryStart + 0x0400, 0x0400]
  const previousMemory = touchedAddresses.map((address) => memory[address])

  try {
    SWITCHES.ALTZP.isSet = true
    SWITCHES.RAMWRT.isSet = false
    updateAddressTables()
    doLoadBinary(0x01FF, new Uint8Array([0xA1, 0xB2]))
    expect(memory[0x01FF]).toEqual(0xA1)
    expect(memory[0x0200]).toEqual(0xB2)
    expect(memory[RamWorksMemoryStart + 0x01FF]).toEqual(previousMemory[1])

    SWITCHES.ALTZP.isSet = false
    SWITCHES.STORE80.isSet = true
    SWITCHES.PAGE2.isSet = true
    updateAddressTables()
    doLoadBinary(0x03FF, new Uint8Array([0xC3, 0xD4]))
    expect(memory[0x03FF]).toEqual(0xC3)
    expect(memory[0x0400]).toEqual(0xD4)
    expect(memory[RamWorksMemoryStart + 0x0400]).toEqual(previousMemory[4])
  } finally {
    SWITCHES.ALTZP.isSet = previousAltZp
    SWITCHES.PAGE2.isSet = previousPage2
    SWITCHES.RAMWRT.isSet = previousRamWrite
    SWITCHES.STORE80.isSet = previousStore80
    touchedAddresses.forEach((address, index) => {
      memory[address] = previousMemory[index]
    })
    updateAddressTables()
  }
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

test("speed operations complete after applying their mode", () => {
  setIsTesting()
  const previousState = getExternalMachineState()
  doSetRunMode(RUN_MODE.PAUSED)
  const passMachineState = jest.spyOn(worker2main, "passMachineState")
  const passOperationResult = jest.spyOn(worker2main, "passWorkerOperationResult")

  try {
    doSetSpeedMode(3)
    expect(passMachineState).toHaveBeenLastCalledWith(expect.objectContaining({
      speedMode: 3,
    }))
    expect(passOperationResult).not.toHaveBeenCalled()
    passMachineState.mockClear()

    doSetSpeedMode(4, 7)

    expect(getExternalMachineState().speedMode).toEqual(4)
    expect(passMachineState).toHaveBeenCalledWith(expect.objectContaining({
      speedMode: 4,
    }))
    expect(passOperationResult).toHaveBeenCalledWith(7)
    expect(passMachineState.mock.invocationCallOrder[0]).toBeLessThan(
      passOperationResult.mock.invocationCallOrder[0],
    )
  } finally {
    passMachineState.mockRestore()
    passOperationResult.mockRestore()
    doSetSpeedMode(previousState.speedMode)
    doSetRunMode(previousState.runMode)
  }
})

test("run changes complete after publishing their state", () => {
  const previousState = getExternalMachineState()
  const passMachineState = jest.spyOn(worker2main, "passMachineState")
  const passOperationResult = jest.spyOn(worker2main, "passWorkerOperationResult")

  try {
    doSetRunMode(RUN_MODE.PAUSED, true, 7)
    expect(passMachineState).toHaveBeenCalledWith(expect.objectContaining({
      runMode: RUN_MODE.PAUSED,
    }))
    expect(passOperationResult).toHaveBeenCalledWith(7)
    expect(passMachineState.mock.invocationCallOrder[0]).toBeLessThan(
      passOperationResult.mock.invocationCallOrder[0],
    )
  } finally {
    passMachineState.mockRestore()
    passOperationResult.mockRestore()
    doSetRunMode(previousState.runMode)
  }
})

test("CPU state changes complete after publishing their state", () => {
  const previousState = {...s6502}
  const passMachineState = jest.spyOn(worker2main, "passMachineState")
  const passOperationResult = jest.spyOn(worker2main, "passWorkerOperationResult")
  const nextState = {...previousState, PC: 0x6000, Accum: 0x42}

  try {
    doSetState6502(nextState, 9)
    expect(passMachineState).toHaveBeenCalledWith(expect.objectContaining({
      s6502: expect.objectContaining({PC: 0x6000, Accum: 0x42}),
    }))
    expect(passOperationResult).toHaveBeenCalledWith(9)
    expect(passMachineState.mock.invocationCallOrder[0]).toBeLessThan(
      passOperationResult.mock.invocationCallOrder[0],
    )
  } finally {
    passMachineState.mockRestore()
    passOperationResult.mockRestore()
    doSetState6502(previousState)
  }
})

test("memory blocks complete after all bytes are applied", () => {
  setIsTesting()
  const address = 0x6000
  const previousMemory = memory.slice(address, address + 3)
  const passOperationResult = jest.spyOn(worker2main, "passWorkerOperationResult")
  passOperationResult.mockImplementation((operationId) => {
    expect(operationId).toEqual(11)
    expect(memory.slice(address, address + 3)).toEqual(new Uint8Array([0xA9, 0x42, 0x60]))
  })

  try {
    doLoadBinary(address, new Uint8Array([0xA9, 0x42, 0x60]), 11)
    expect(passOperationResult).toHaveBeenCalledTimes(1)
  } finally {
    memory.set(previousMemory, address)
    passOperationResult.mockRestore()
  }
})

test("invalid binary loads fail before changing memory", () => {
  setIsTesting()
  const previousValue = memory[0xBFFF]
  memory[0xBFFF] = 0x11
  const passOperationResult = jest.spyOn(worker2main, "passWorkerOperationResult")

  try {
    doLoadBinary(0xBFFF, new Uint8Array([0x22, 0x33]), 12)
    expect(memory[0xBFFF]).toEqual(0x11)
    expect(passOperationResult).toHaveBeenCalledWith(
      12,
      "Binary block must fit within main RAM at $0000-$BFFF",
    )
  } finally {
    memory[0xBFFF] = previousValue
    passOperationResult.mockRestore()
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
