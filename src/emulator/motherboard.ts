// Chris Torrence, 2022
import { Buffer } from "buffer"
import { passMachineState } from "./worker2main"
import { s6502, setState6502, reset6502, setCycleCount, setPC, get6502StateString, getStackString } from "./instructions"
import { RUN_MODE, TEST_DEBUG } from "./utility/utility"
import { getDriveSaveState, restoreDriveSaveState, resetDrive, doPauseDrive } from "./devices/drivestate"
// import { slot_omni } from "./roms/slot_omni_cx00"
import { SWITCHES } from "./softswitches";
import { memory, memGet, getTextPage, getHires, memoryReset,
  updateAddressTables, setMemoryBlock, getZeroPage } from "./memory"
import { setButtonState, handleGamepads } from "./devices/joystick"
import { parseAssembly } from "./utility/assembler";
import { code } from "./utility/assemblycode"
import { handleGameSetup } from "./games/game_mappings"
import { clearInterrupts, doSetBreakpointSkipOnce, processInstruction, setStepOut } from "./cpu6502"
import { enableSerialCard, resetSerial } from "./devices/superserial/serial"
import { enableMouseCard } from "./devices/mouse"
import { enablePassportCard, resetPassport } from "./devices/passport/passport"
import { enableMockingboard, resetMockingboard } from "./devices/mockingboard"
import { resetMouse, onMouseVBL } from "./devices/mouse"
import { enableDiskDrive } from "./devices/diskdata"
import { getDisassembly, getInstruction, verifyAddressWithinDisassembly } from "./utility/disassemble"

// let timerID: any | number = 0
let startTime = 0
let prevTime = 0
let normalSpeed = true
let speed = 0
export let isDebugging = TEST_DEBUG
let disassemblyAddr = -1
let refreshTime = 16.6881 // 17030 / 1020.488
let timeDelta = 0
let cpuRunMode = RUN_MODE.IDLE
let iRefresh = 0
let takeSnapshot = false
let iTempState = 0
const maxState = 60
const saveStates: Array<EmulatorSaveState> = []
export let inVBL = false

// methods to capture start and end of VBL for other devices that may need it (mouse)
const startVBL = (): void => {
  inVBL = true
  onMouseVBL()
}

const endVBL = (): void => {
  inVBL = false
}

const getApple2State = (): Apple2SaveState => {
  // Make a copy
  const save6502 = JSON.parse(JSON.stringify(s6502))
  const softSwitches: { [name: string]: boolean } = {}
  for (const key in SWITCHES) {
    softSwitches[key] = SWITCHES[key as keyof typeof SWITCHES].isSet
  }
  const membuffer = Buffer.from(memory)
  // let memdiff: { [addr: number]: number } = {};
  // for (let i = 0; i < memory.length; i++) {
  //   if (prevMemory[i] !== memory[i]) {
  //     memdiff[i] = memory[i]
  //   }
  // }
  // prevMemory = memory
  return {
    s6502: save6502,
    softSwitches: softSwitches,
    memory: membuffer.toString("base64"),
  }
}

const setApple2State = (newState: Apple2SaveState) => {
  const new6502: STATE6502 = JSON.parse(JSON.stringify(newState.s6502))
  setState6502(new6502)
  const softSwitches: { [name: string]: boolean } = newState.softSwitches
  for (const key in softSwitches) {
    const keyTyped = key as keyof typeof SWITCHES
    try {
      SWITCHES[keyTyped].isSet = softSwitches[key]    
    } catch (error) {
      null
    }
  }
  memory.set(Buffer.from(newState.memory, "base64"))
  updateAddressTables()
  handleGameSetup(true)
}

// export const doRequestSaveState = () => {
//   passSaveState(doGetSaveState())
// }

export const doGetSaveState = (full = false): EmulatorSaveState => {
  const state = { emulator: null,
    state6502: getApple2State(),
    driveState: getDriveSaveState(full),
    snapshots: null
  }
  return state
//  return Buffer.from(compress(JSON.stringify(state)), 'ucs2').toString('base64')
}

export const doGetSaveStateWithSnapshots = (): EmulatorSaveState => {
  const state = { emulator: null,
    state6502: getApple2State(),
    driveState: getDriveSaveState(true),
    snapshots: saveStates
  }
  return state
//  return Buffer.from(compress(JSON.stringify(state)), 'ucs2').toString('base64')
}

export const doSetState6502 = (newState: STATE6502) => {
  if (newState.PC !== s6502.PC) {
    disassemblyAddr = newState.PC
  }
  setState6502(newState)
  updateExternalMachineState()
}

export const doRestoreSaveState = (sState: EmulatorSaveState) => {
  doReset()
  setApple2State(sState.state6502)
  restoreDriveSaveState(sState.driveState)
  disassemblyAddr = s6502.PC
  if (sState.snapshots) {
    saveStates.length = 0
    saveStates.push(...sState.snapshots)
    iTempState = saveStates.length
  }
  updateExternalMachineState()
}

// const testTiming = () => {
//   let t0 = performance.now()
//   for (let j = 0; j < 10000; j++) {
//     for (let i = 0; i < 0xBFFF; i++) {
//       memGet(i)    
//     }
//   }
//   let tdiff = performance.now() - t0
//   console.log(`memGet time = ${tdiff}`)
//   t0 = performance.now()
//   for (let j = 0; j < 10000; j++) {
//     for (let i = 0; i < 0xBFFF; i++) {
//       memSet(i, 255)    
//     }
//   }
//   tdiff = performance.now() - t0
//   console.log(`memSet time = ${tdiff}`)
// }

let didConfiguration = false
const configureMachine = () => {
  if (didConfiguration) return
  didConfiguration = true
  enableSerialCard()
  enablePassportCard(true, 2)
  enableMouseCard(true, 5)
  enableMockingboard(true, 4)
  //enableMockingboard(false, 5)
  enableDiskDrive()
}

const resetMachine = () => {
  resetDrive()
  setButtonState()
  resetMouse()
  resetPassport()
  resetSerial()
  resetMockingboard(4)
  //resetMockingboard(5)
}

const doBoot = () => {
  setCycleCount(0)
  memoryReset()
  configureMachine()
  if (code.length > 0) {
    const pcode = parseAssembly(0x300, code.split("\n"));
    memory.set(pcode, 0x300);
  }
//  testTiming()
  doReset()
}

const doReset = () => {
  clearInterrupts()
  for (const key in SWITCHES) {
    const keyTyped = key as keyof typeof SWITCHES
    SWITCHES[keyTyped].isSet = false
  }
  SWITCHES.TEXT.isSet = true
  // Reset banked RAM
  memGet(0xC082)
  reset6502()
  resetMachine()
}

export const doSetNormalSpeed = (normal: boolean) => {
  normalSpeed = normal
  refreshTime = normalSpeed ? 16.6881 : 0
  resetRefreshCounter()
}

export const doSetIsDebugging = (enable: boolean) => {
  isDebugging = enable
}

export const doSetDisassembleAddress = (addr: number) => {
  disassemblyAddr = addr
  updateExternalMachineState()
  if (addr === RUN_MODE.PAUSED) disassemblyAddr = s6502.PC
}

const getGoBackwardIndex = () => {
  const newTmp = iTempState - 1
  if (newTmp < 0 || !saveStates[newTmp]) {
    return -1
  }
  return newTmp
}

const getGoForwardIndex = () => {
  const newTmp = iTempState + 1
  if (newTmp >= saveStates.length || !saveStates[newTmp]) {
    return -1
  }
  return newTmp
}

const doSnapshot = () => {
  if (saveStates.length === maxState) {
    saveStates.shift()
  }
  saveStates.push(doGetSaveState())
  // This is at the current "time" and is just past our recently-saved state.
  iTempState = saveStates.length
}

export const doGoBackInTime = () => {
  let newTmp = getGoBackwardIndex()
  if (newTmp < 0) return
  doSetRunMode(RUN_MODE.PAUSED)
  setTimeout(() => {
    // if this is the first time we're called, make sure our current
    // state is up to date
    if (iTempState === saveStates.length) {
      doSnapshot()
      newTmp = Math.max(iTempState - 2, 0)
    }
    iTempState = newTmp
    doRestoreSaveState(saveStates[iTempState])
  }, 50)
}

export const doGoForwardInTime = () => {
  const newTmp = getGoForwardIndex()
  if (newTmp < 0) return
  doSetRunMode(RUN_MODE.PAUSED)
  setTimeout(() => {
    iTempState = newTmp
    doRestoreSaveState(saveStates[newTmp])
  }, 50)
}

export const doGotoTimeTravelIndex = (index: number) => {
  if (index < 0 || index >= saveStates.length) return
  doSetRunMode(RUN_MODE.PAUSED)
  setTimeout(() => {
    iTempState = index
    doRestoreSaveState(saveStates[index])
  }, 50)
}

const getTimeTravelThumbnails = () => {
  const result: Array<TimeTravelThumbnail> = []
  for (let i = 0; i < saveStates.length; i++) {
    result[i] = {s6502: saveStates[i].state6502.s6502}
  }
  return result
}

let timeout: NodeJS.Timeout | null = null

// Set a flag and save our slice at the end of the next 6502 display cycle.
// Otherwise we risk saving in the middle of a keystroke.
export const doTakeSnapshot = (collapseEvents = false) => {
  if (timeout) {
    clearTimeout(timeout)
  }
  if (collapseEvents) {
    timeout = setTimeout(() => {takeSnapshot = true; timeout = null}, 100)
  } else {
    takeSnapshot = true
  }
}

export const doStepInto = () => {
  doSetBreakpointSkipOnce()
  if (cpuRunMode === RUN_MODE.IDLE) {
    doBoot()
    cpuRunMode = RUN_MODE.PAUSED
  }
  processInstruction()
  doSetRunMode(RUN_MODE.PAUSED)
}

export const doStepOver = () => {
  doSetBreakpointSkipOnce()
  if (cpuRunMode === RUN_MODE.IDLE) {
    doBoot()
    cpuRunMode = RUN_MODE.PAUSED
  }
  if (memGet(s6502.PC, false) === 0x20) {
    // If we're at a JSR then briefly step in, then step out.
    processInstruction()
    doStepOut()
  } else {
    // Otherwise just do a single step.
    doStepInto()
  }
}

export const doStepOut = () => {
  doSetBreakpointSkipOnce()
  if (cpuRunMode === RUN_MODE.IDLE) {
    doBoot()
    cpuRunMode = RUN_MODE.PAUSED
  }
  setStepOut()
  doSetRunMode(RUN_MODE.RUNNING)
}

const resetRefreshCounter = () => {
  iRefresh = 0
  prevTime = performance.now()
  startTime = prevTime
}

export const doSetRunMode = (cpuRunModeIn: RUN_MODE) => {
  configureMachine()
  cpuRunMode = cpuRunModeIn
  if (cpuRunMode === RUN_MODE.PAUSED) {
    doPauseDrive()
    if (!verifyAddressWithinDisassembly(disassemblyAddr, s6502.PC)) {
      disassemblyAddr = s6502.PC
    }
  } else if (cpuRunMode === RUN_MODE.RUNNING) {
    doPauseDrive(true)
    doSetBreakpointSkipOnce()
    // If we go back in time and then resume running, remove all future states.
    while (saveStates.length > 0 && iTempState < (saveStates.length - 1)) saveStates.pop()
    iTempState = saveStates.length
  }
  updateExternalMachineState()
  resetRefreshCounter()
  if (speed === 0) {
    speed = 1
    doTakeSnapshot()
    doAdvance6502Timer()
  }
}

export const doSetBinaryBlock = (addr: number, data: Uint8Array, run: boolean) => {
  const loadBlock = () => {
    setMemoryBlock(addr, data)
    if (run) {
      setPC(addr)
    }
  }
  if (cpuRunMode === RUN_MODE.IDLE) {
    doSetRunMode(RUN_MODE.NEED_BOOT)
    // Wait a bit for the cpu to boot and then do reset.
    setTimeout(() => {
      doSetRunMode(RUN_MODE.NEED_RESET)
      // After giving the reset some time, load the binary block.
      setTimeout(() => {
        loadBlock()
      }, 200)
    }, 200)
  } else {
    loadBlock()
  }
}

const getDebugDump = () => {
  if (!isDebugging) return ''
  const status = [get6502StateString()]
  status.push(getZeroPage())
  const stackString = getStackString()
  for (let i = 0; i < Math.min(20, stackString.length); i++) {
    status.push(stackString[i])
  }
  return status.join('\n')
}

const doGetDisassembly = () => {
  if (cpuRunMode === RUN_MODE.RUNNING) return ''
  return getDisassembly(disassemblyAddr >= 0 ? disassemblyAddr : s6502.PC)
}

const updateExternalMachineState = () => {
  const state: MachineState = {
    runMode: cpuRunMode,
    s6502: s6502,
    speed: speed,
    altChar: SWITCHES.ALTCHARSET.isSet,
    noDelayMode: !SWITCHES.COLUMN80.isSet && !SWITCHES.AN3.isSet,
    textPage: getTextPage(),
    lores: getTextPage(true),
    hires: getHires(),
    debugDump: getDebugDump(),
    disassembly: doGetDisassembly(),
    nextInstruction: getInstruction(s6502.PC),
    button0: SWITCHES.PB0.isSet,
    button1: SWITCHES.PB1.isSet,
    canGoBackward: getGoBackwardIndex() >= 0,
    canGoForward: getGoForwardIndex() >= 0,
    maxState: maxState,
    iTempState: iTempState,
    timeTravelThumbnails: getTimeTravelThumbnails(),
  }
  passMachineState(state)
}

const doAdvance6502 = () => {
  const newTime = performance.now()
  timeDelta = newTime - prevTime
  if (timeDelta < refreshTime) return
  prevTime = newTime
  if (cpuRunMode === RUN_MODE.IDLE || cpuRunMode === RUN_MODE.PAUSED) {
    return;
  }
  if (cpuRunMode === RUN_MODE.NEED_BOOT) {
    doBoot();
    doSetRunMode(RUN_MODE.RUNNING)
  } else if (cpuRunMode === RUN_MODE.NEED_RESET) {
    doReset();
    doSetRunMode(RUN_MODE.RUNNING)
  }
  let cycleTotal = 0
  for (;;) {
    const cycles = processInstruction();
    if (cycles < 0) break
    cycleTotal += cycles;
    if (cycleTotal >= 12480) {
      if (inVBL === false) {
        startVBL()
      }
    }
    if (cycleTotal >= 17030) {
      endVBL()
      break;
    }
  }
  iRefresh++
  speed = Math.round((iRefresh * 1703) / (performance.now() - startTime)) / 100
  if (iRefresh % 2) {
    handleGamepads()
    updateExternalMachineState()
  }
  if (takeSnapshot) {
    takeSnapshot = false
//    console.log("iSaveState " + iSaveState)
    doSnapshot()
  }
}

const doAdvance6502Timer = () => {
  doAdvance6502()
  const iRefreshFinish = (iRefresh + 1)
  while (cpuRunMode === RUN_MODE.RUNNING && iRefresh !== iRefreshFinish) {
    doAdvance6502()
  }
  setTimeout(doAdvance6502Timer, cpuRunMode === RUN_MODE.RUNNING ? 0 : 20)
}
