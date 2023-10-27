// Chris Torrence, 2022
import { Buffer } from "buffer"
import { passMachineState } from "./worker2main"
import { s6502, set6502State, reset6502, setCycleCount, stackDump, setPC, get6502StateString } from "./instructions"
import { STATE, toHex } from "./utility/utility"
import { getDriveSaveState, restoreDriveSaveState, resetDrive, doPauseDrive } from "./devices/drivestate"
// import { slot_omni } from "./roms/slot_omni_cx00"
import { SWITCHES } from "./softswitches";
import { memory, memGet, getTextPage, getHires, memoryReset,
  updateAddressTables, setMemoryBlock, getZeroPage } from "./memory"
import { setButtonState, handleGamepads } from "./devices/joystick"
import { parseAssembly } from "./utility/assembler";
import { code } from "./utility/assemblycode"
import { handleGameSetup } from "./games/game_mappings"
import { clearInterrupts, doSetBreakpointSkipOnce, doSetRunToRTS, processInstruction } from "./cpu6502"
import { enableSerialCard } from "./devices/serial"
import { enableMouseCard } from "./devices/mouse"
import { enableMockingboard, resetMockingboard } from "./devices/mockingboard"
import { resetMouse, onMouseVBL } from "./devices/mouse"
import { enableDiskDrive } from "./devices/diskdata"
import { getDisassembly, verifyAddressWithinDisassembly } from "./utility/disassemble"

// let timerID: any | number = 0
let startTime = 0
let prevTime = 0
let normalSpeed = true
let speed = 0
let isDebugging = true
let disassemblyAddr = -1
let refreshTime = 16.6881 // 17030 / 1020.488
let timeDelta = 0
let cpuState = STATE.IDLE
let iRefresh = 0
let saveTimeSlice = false
let iSaveState = 0
let iTempState = 0
const maxState = 60
const saveStates = Array<EmulatorSaveState>(maxState)
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
  set6502State(new6502)
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
    driveState: getDriveSaveState(full)
  }
  return state
//  return Buffer.from(compress(JSON.stringify(state)), 'ucs2').toString('base64')
}

export const doRestoreSaveState = (sState: EmulatorSaveState) => {
  doReset()
  setApple2State(sState.state6502)
  restoreDriveSaveState(sState.driveState)
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
  enableMouseCard(true, 2)
  enableMockingboard(true, 4)
  enableMockingboard(true, 5)
  enableDiskDrive()
}

const resetMachine = () => {
  resetDrive()
  setButtonState()
  resetMouse()
  resetMockingboard(4)
  resetMockingboard(5)
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
  if (addr === STATE.PAUSED) disassemblyAddr = s6502.PC
}

const getGoBackwardIndex = () => {
  const newTmp = (iTempState + maxState - 1) % maxState
  if (newTmp === iSaveState || !saveStates[newTmp]) {
    return -1
  }
  return newTmp
}

const getGoForwardIndex = () => {
  if (iTempState === iSaveState) {
    return -1
  }
  const newTmp = (iTempState + 1) % maxState
  if (!saveStates[newTmp]) {
    return -1
  }
  return newTmp
}

export const doGoBackInTime = () => {
  const newTmp = getGoBackwardIndex()
  if (newTmp < 0) return
  doSetCPUState(STATE.PAUSED)
  setTimeout(() => {
    // if this is the first time we're called, make sure our current
    // state is up to date
    if (iTempState === iSaveState) {
      saveStates[iSaveState] = doGetSaveState()
    }
    iTempState = newTmp
    doRestoreSaveState(saveStates[newTmp])    
  }, 50)
}

export const doGoForwardInTime = () => {
  const newTmp = getGoForwardIndex()
  if (newTmp < 0) return
  doSetCPUState(STATE.PAUSED)
  setTimeout(() => {
    iTempState = newTmp
    doRestoreSaveState(saveStates[newTmp])
  }, 50)
}

export const doSaveTimeSlice = () => {
  // Set a flag and save our slice at the end of the next 6502 display cycle.
  // Otherwise we risk saving in the middle of a keystroke.
  saveTimeSlice = true
}

export const doStepInto = () => {
  doSetBreakpointSkipOnce()
  if (cpuState === STATE.IDLE) {
    doBoot()
    cpuState = STATE.PAUSED
  }
  processInstruction(true)
  doSetCPUState(STATE.PAUSED)
}

export const doStepOver = () => {
  doSetBreakpointSkipOnce()
  if (cpuState === STATE.IDLE) {
    doBoot()
    cpuState = STATE.PAUSED
  }
  if (memGet(s6502.PC) === 0x20) {
    // If we're at a JSR then briefly step in, then step out.
    processInstruction(true)
    doStepOut()
  } else {
    // Otherwise just do a single step.
    doStepInto()
  }
}

export const doStepOut = () => {
  doSetBreakpointSkipOnce()
  if (cpuState === STATE.IDLE) {
    doBoot()
    cpuState = STATE.PAUSED
  }
  doSetRunToRTS()
  doSetCPUState(STATE.RUNNING)
}

const resetRefreshCounter = () => {
  iRefresh = 0
  prevTime = performance.now()
  startTime = prevTime
}

export const doSetCPUState = (cpuStateIn: STATE) => {
  configureMachine()
  cpuState = cpuStateIn
  if (cpuState === STATE.PAUSED) {
    doPauseDrive()
    if (!verifyAddressWithinDisassembly(disassemblyAddr, s6502.PC)) {
      disassemblyAddr = s6502.PC
    }
  } else if (cpuState === STATE.RUNNING) {
    doPauseDrive(true)
    doSetBreakpointSkipOnce()
  }
  updateExternalMachineState()
  resetRefreshCounter()
  if (speed === 0) {
    speed = 1
    doSaveTimeSlice()
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
  if (cpuState === STATE.IDLE) {
    doSetCPUState(STATE.NEED_BOOT)
    // Wait a bit for the cpu to boot and then do reset.
    setTimeout(() => {
      doSetCPUState(STATE.NEED_RESET)
      // After giving the reset some time, load the binary block.
      setTimeout(() => {
        loadBlock()
      }, 200)
    }, 200)
  } else {
    loadBlock()
  }
}

export const getStackString = () => {
  const stackvalues = memory.slice(256, 512)
  const result = new Array<string>()
  for (let i = 0xFF; i > s6502.StackPtr; i--) {
    let value = "$" + toHex(stackvalues[i])
    let cmd = stackDump[i]
    if ((stackDump[i].length > 3) && (i - 1) > s6502.StackPtr) {
      if (stackDump[i-1] === "JSR" || stackDump[i-1] === "BRK") {
        i--
        value += toHex(stackvalues[i])
      } else {
        cmd = ''
      }
    }
    value = (value + "   ").substring(0, 6)
    result.push(toHex(0x100 + i, 4) + ": " + value + cmd)
  }
  return result
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
  if (cpuState === STATE.RUNNING) return ''
  return getDisassembly(disassemblyAddr >= 0 ? disassemblyAddr : s6502.PC)
}

const updateExternalMachineState = () => {
  const state: MachineState = {
    state: cpuState,
    s6502: s6502,
    speed: speed,
    altChar: SWITCHES.ALTCHARSET.isSet,
    noDelayMode: !SWITCHES.COLUMN80.isSet && !SWITCHES.AN3.isSet,
    textPage: getTextPage(),
    lores: getTextPage(true),
    hires: getHires(),
    debugDump: getDebugDump(),
    disassembly: doGetDisassembly(),
    button0: SWITCHES.PB0.isSet,
    button1: SWITCHES.PB1.isSet,
    canGoBackward: getGoBackwardIndex() >= 0,
    canGoForward: getGoForwardIndex() >= 0
  }
  passMachineState(state)
}

const doAdvance6502 = () => {
  const newTime = performance.now()
  timeDelta = newTime - prevTime
  if (timeDelta < refreshTime) return
  prevTime = newTime
  if (cpuState === STATE.IDLE || cpuState === STATE.PAUSED) {
    return;
  }
  if (cpuState === STATE.NEED_BOOT) {
    doBoot();
    doSetCPUState(STATE.RUNNING)
  } else if (cpuState === STATE.NEED_RESET) {
    doReset();
    doSetCPUState(STATE.RUNNING)
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
  if (saveTimeSlice) {
    saveTimeSlice = false
//    console.log("iSaveState " + iSaveState)
    saveStates[iSaveState] = doGetSaveState()
    iSaveState = (iSaveState + 1) % maxState
    iTempState = iSaveState
  }
}

const doAdvance6502Timer = () => {
  doAdvance6502()
  const iRefreshFinish = (iRefresh + 1)
  while (cpuState === STATE.RUNNING && iRefresh !== iRefreshFinish) {
    doAdvance6502()
  }
  setTimeout(doAdvance6502Timer, cpuState === STATE.RUNNING ? 0 : 20)
}
