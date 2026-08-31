import { BREAKPOINT_RESULT, breakpointMap, doSetBreakpoints, hitBreakpoint, processInstruction } from "./cpu6502"
import { getAuxCardEnabled, getHires, memGet, memSet, memory, setAuxCardEnabled, updateAddressTables } from "./memory"
import { s6502, setPC } from "./instructions"
import { hiresLineToAddress, RamWorksMemoryStart, RUN_MODE, TEST_DEBUG, TEST_GRAPHICS } from "../common/utility"
import { parseAssembly } from "./utility/assembler"
import { doBoot, doLoadBinary, doReset, doRunBinary, doSetCycleCount, doSetMachineName, doSetRunMode, doSetSiriusJoyport, doSetSpeedMode, doSetState6502, doStepOver, doWriteMemory, getExternalMachineState, getExternalMemoryView, resetCpuSpeedForTesting } from "./motherboard"
import { SWITCHES } from "./softswitches"
import { setIsTesting } from "./worker2main"
import { BreakpointMap, BreakpointNew } from "../common/breakpoint"
import { getCurrentDriveState } from "./devices/drivestate"
import * as worker2main from "./worker2main"
import { getSiriusJoyport } from "./devices/sirius_joyport"

const getExecutionSnapshot = () => {
  const execution = getExternalMachineState().execution
  if (!execution) throw new Error("Expected an execution snapshot")
  return execution
}

// Make sure we don't accidentally leave debug mode on.
test("debugMode", () => {
  expect(TEST_DEBUG).toEqual(false)
  expect(TEST_GRAPHICS).toEqual(false)
})

test("physical memory inspection requires a stable paused worker", () => {
  setIsTesting()
  doSetRunMode(RUN_MODE.PAUSED, false)
  expect(getExternalMemoryView({address: 0, length: 1, space: "main"}).bytes).toHaveLength(1)
  expect(() => getExternalMemoryView({address: 0, length: 1, space: "main", auxBank: 0}))
    .toThrow("Auxiliary bank is valid only for auxiliary memory")

  doSetRunMode(RUN_MODE.RUNNING, false)
  expect(() => getExternalMemoryView({address: 0, length: 1, space: "active"}))
    .toThrow("Memory is available only while the emulator is paused")
  expect(() => getExternalMemoryView({address: 0, length: 1, space: "main"}))
    .toThrow("Memory is available only while the emulator is paused")

  doSetRunMode(RUN_MODE.PAUSED, false)
  doSetRunMode(RUN_MODE.IDLE, false)
})

test("physical memory inspection preserves CPU and execution state", () => {
  setIsTesting()
  const previousCpu = {...s6502}
  const previousRunMode = getExternalMachineState().runMode
  const previousAuxCardEnabled = getAuxCardEnabled()

  try {
    Object.assign(s6502, {
      PC: 0x4321,
      Accum: 0x11,
      XReg: 0x22,
      YReg: 0x33,
      StackPtr: 0x44,
      PStatus: 0xA5,
    })
    doSetRunMode(RUN_MODE.PAUSED, false)
    setAuxCardEnabled(true)
    const expectedCpu = {...s6502}

    getExternalMemoryView({address: 0x03A4, length: 1, space: "main"})
    expect(s6502).toEqual(expectedCpu)
    expect(getExternalMachineState().runMode).toEqual(RUN_MODE.PAUSED)

    getExternalMemoryView({address: 0x03A4, length: 1, space: "aux", auxBank: 0})
    expect(s6502).toEqual(expectedCpu)
    expect(getExternalMachineState().runMode).toEqual(RUN_MODE.PAUSED)
  } finally {
    Object.assign(s6502, previousCpu)
    doSetRunMode(previousRunMode, false)
    setAuxCardEnabled(previousAuxCardEnabled)
  }
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

test("execution snapshots record transitions and the breakpoint that stopped execution", () => {
  jest.useFakeTimers()
  setIsTesting()
  const previousState = getExternalMachineState()
  const previousBytes = memory.slice(0x6000, 0x6002)
  const breakpoints = new BreakpointMap()
  const breakpoint = BreakpointNew()
  breakpoint.address = 0x6001
  breakpoint.once = true
  breakpoints.set(breakpoint.address, breakpoint)
  const failureBreakpoint = BreakpointNew()
  failureBreakpoint.address = 0x6002
  breakpoints.set(failureBreakpoint.address, failureBreakpoint)

  try {
    doSetRunMode(RUN_MODE.PAUSED, false)
    const initialSequence = getExecutionSnapshot().executionSequence
    doSetRunMode(RUN_MODE.RUNNING, false)
    const running = getExecutionSnapshot()
    expect(running).toEqual(expect.objectContaining({
      executionSequence: initialSequence + 1,
      state: "running",
      pauseReason: null,
      breakpoint: null,
    }))

    memory.set([0xEA, 0xEA], 0x6000)
    setPC(0x6000)
    s6502.Accum = 0x41
    s6502.XReg = 0x42
    s6502.YReg = 0x43
    s6502.StackPtr = 0xF0
    s6502.PStatus = 0x24
    doSetBreakpoints(breakpoints)
    expect(processInstruction()).toEqual(2)
    expect(processInstruction()).toEqual(-1)

    const stopped = getExecutionSnapshot()
    expect(stopped).toEqual(expect.objectContaining({
      executionSequence: running.executionSequence + 1,
      state: "paused",
      pauseReason: "breakpoint",
      breakpoint: {breakpointId: "bp:24577", address: 0x6001},
      PC: 0x6001,
      A: 0x41,
      X: 0x42,
      Y: 0x43,
      S: 0xF0,
      PStatus: 0x24,
      machineName: previousState.machineName,
      memoryConfiguration: expect.objectContaining({ramWorksKb: previousState.extraRamSize}),
    }))
    expect(breakpointMap.has(0x6001)).toBe(false)
    expect(breakpointMap.has(0x6002)).toBe(true)

    doSetRunMode(RUN_MODE.PAUSED, false)
    expect(getExecutionSnapshot().executionSequence).toEqual(stopped.executionSequence)

    doSetRunMode(RUN_MODE.NEED_BOOT, false)
    expect(getExternalMachineState().execution).toEqual(stopped)
    doSetRunMode(RUN_MODE.NEED_RESET, false)
    expect(getExternalMachineState().execution).toEqual(stopped)
    doSetRunMode(RUN_MODE.RUNNING, false)
    expect(getExternalMachineState().execution).toEqual(expect.objectContaining({
      executionSequence: stopped.executionSequence + 1,
      state: "running",
      pauseReason: null,
    }))

    const runningSequence = getExecutionSnapshot().executionSequence
    doSetRunMode(RUN_MODE.NEED_BOOT, false)
    doSetRunMode(RUN_MODE.NEED_RESET, false)
    doSetRunMode(RUN_MODE.RUNNING, false)
    expect(getExecutionSnapshot().executionSequence).toEqual(runningSequence)

  } finally {
    doSetBreakpoints(new BreakpointMap())
    memory.set(previousBytes, 0x6000)
    doSetRunMode(previousState.runMode, false)
    resetCpuSpeedForTesting()
    jest.clearAllTimers()
    jest.useRealTimers()
  }
})

test("media-driven idle transitions publish one authoritative idle stop", () => {
  jest.useFakeTimers()
  setIsTesting()
  const previousRunMode = getExternalMachineState().runMode

  try {
    doSetRunMode(RUN_MODE.RUNNING, false)
    const runningSequence = getExecutionSnapshot().executionSequence
    doSetRunMode(RUN_MODE.IDLE, false)
    const idle = getExecutionSnapshot()
    expect(idle).toEqual(expect.objectContaining({
      executionSequence: runningSequence + 1,
      state: "paused",
      pauseReason: "idle",
      breakpoint: null,
    }))

    doSetRunMode(RUN_MODE.IDLE, false)
    expect(getExternalMachineState().execution).toEqual(idle)
    doSetRunMode(RUN_MODE.NEED_BOOT, false)
    expect(getExternalMachineState().execution).toEqual(idle)
    doSetRunMode(RUN_MODE.NEED_RESET, false)
    expect(getExternalMachineState().execution).toEqual(idle)
  } finally {
    doSetRunMode(previousRunMode, false)
    resetCpuSpeedForTesting()
    jest.clearAllTimers()
    jest.useRealTimers()
  }
})

test("execution snapshots identify the watchpoint that stopped execution", () => {
  jest.useFakeTimers()
  setIsTesting()
  const watchpointAddress = 0x03A4
  const previousByte = memGet(watchpointAddress, false)
  const previousProgram = memory.slice(0x6000, 0x6003)
  const watchpoints = new BreakpointMap()
  const watchpoint = BreakpointNew()
  watchpoint.address = watchpointAddress
  watchpoint.watchpoint = true
  watchpoints.set(watchpointAddress, watchpoint)

  try {
    doSetBreakpoints(watchpoints)
    doSetRunMode(RUN_MODE.RUNNING, false)
    memory.set([0x20, 0x00, 0x60], 0x6000)
    setPC(0x6000)
    memSet(watchpointAddress, 0x5A)
    doStepOver()
    expect(getExternalMachineState().execution).toEqual(expect.objectContaining({
      state: "paused",
      pauseReason: "watchpoint",
      breakpoint: {breakpointId: `bp:${watchpointAddress}`, address: watchpointAddress},
    }))
  } finally {
    doSetBreakpoints(new BreakpointMap())
    memory.set(previousProgram, 0x6000)
    memSet(watchpointAddress, previousByte)
    doSetRunMode(RUN_MODE.PAUSED, false)
    resetCpuSpeedForTesting()
    jest.clearAllTimers()
    jest.useRealTimers()
  }
})

test("execution snapshots report hidden stepping traps as steps", () => {
  jest.useFakeTimers()
  setIsTesting()
  const previousState = getExternalMachineState()
  const previousBytes = memory.slice(0x6000, 0x6003)
  const breakpoints = new BreakpointMap()
  const stepTrap = BreakpointNew()
  stepTrap.address = 0x6002
  stepTrap.hidden = true
  stepTrap.once = true
  breakpoints.set(stepTrap.address, stepTrap)

  try {
    doSetBreakpoints(breakpoints)
    doSetRunMode(RUN_MODE.RUNNING, false)
    memory.set([0xA9, 0x00, 0xEA], 0x6000)
    setPC(0x6000)
    expect(processInstruction()).toEqual(2)
    expect(s6502.PC).toEqual(0x6002)
    expect(breakpointMap.has(0x6002)).toEqual(true)
    expect(processInstruction()).toEqual(-1)
    expect(getExternalMachineState().execution).toEqual(expect.objectContaining({
      state: "paused",
      pauseReason: "step",
      breakpoint: null,
      PC: 0x6002,
    }))
  } finally {
    doSetBreakpoints(new BreakpointMap())
    memory.set(previousBytes, 0x6000)
    doSetRunMode(previousState.runMode, false)
    resetCpuSpeedForTesting()
    jest.clearAllTimers()
    jest.useRealTimers()
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

test("mapped memory writes use active soft switches before completing", () => {
  setIsTesting()
  const address = 0x0200
  const auxAddress = RamWorksMemoryStart + address
  const previousMain = memory[address]
  const previousAux = memory[auxAddress]
  const previousRamWrite = SWITCHES.RAMWRT.isSet
  const passMachineState = jest.spyOn(worker2main, "passMachineState")
  const passOperationResult = jest.spyOn(worker2main, "passWorkerOperationResult")

  try {
    SWITCHES.RAMWRT.isSet = false
    updateAddressTables()
    memory[address] = 0x11
    memory[auxAddress] = 0x22

    doWriteMemory(0xC005, Uint8Array.of(0), 12)
    expect(SWITCHES.RAMWRT.isSet).toEqual(true)
    expect(passOperationResult).toHaveBeenCalledWith(12)
    passMachineState.mockClear()
    passOperationResult.mockClear()

    doWriteMemory(address, Uint8Array.of(0x42), 13)
    expect(memory[address]).toEqual(0x11)
    expect(memory[auxAddress]).toEqual(0x42)
    expect(passOperationResult).toHaveBeenCalledWith(13)
    expect(passMachineState.mock.invocationCallOrder[0]).toBeLessThan(
      passOperationResult.mock.invocationCallOrder[0],
    )
  } finally {
    SWITCHES.RAMWRT.isSet = previousRamWrite
    updateAddressTables()
    memory[address] = previousMain
    memory[auxAddress] = previousAux
    passMachineState.mockRestore()
    passOperationResult.mockRestore()
  }
})

test("mapped memory writes report worker errors", () => {
  setIsTesting()
  const passOperationResult = jest.spyOn(worker2main, "passWorkerOperationResult")
  const oldState = SWITCHES.RAMWRT.isSet

  try {
    Object.defineProperty(SWITCHES.RAMWRT, "isSet", {
      configurable: true,
      get: () => oldState,
      set: () => { throw new Error("switch failed") },
    })

    doWriteMemory(0xC005, Uint8Array.of(0), 14)
    expect(passOperationResult).toHaveBeenCalledWith(
      14,
      "Memory write processed 0 of 1 bytes; the next byte and earlier writes may have taken effect. switch failed",
    )
  } finally {
    Object.defineProperty(SWITCHES.RAMWRT, "isSet", {
      configurable: true,
      writable: true,
      value: oldState,
    })
    updateAddressTables()
    passOperationResult.mockRestore()
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
