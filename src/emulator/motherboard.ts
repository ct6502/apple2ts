// Chris Torrence, 2022
import { Buffer } from "buffer"
import { passMachineState } from "./worker2main"
import { s6502, set6502State, reset6502, setCycleCount, stack, setPC } from "./instructions"
import { STATE, toHex } from "./utility"
import { getDriveSaveState, restoreDriveSaveState, doResetDrive, doPauseDrive } from "./drivestate"
// import { slot_omni } from "./roms/slot_omni_cx00"
import { SWITCHES } from "./softswitches";
import { memory, memGet, getTextPage, getHires,  setSlotDriver, memoryReset,
  updateAddressTables, setMemoryBlock } from "./memory"
import { setButtonState, handleGamepads } from "./joystick"
import { parseAssembly } from "./assembler";
import { code } from "./assemblycode"
import { disk2driver } from "./roms/slot_disk2_cx00"
import { handleGameSetup } from "./game_mappings"
import { doSetDebug, doSetRunToRTS, processInstruction } from "./cpu6502"

// let timerID: any | number = 0
let startTime = 0
let prevTime = 0
let normalSpeed = true
let speed = 0
let refreshTime = 16.6881 // 17030 / 1020.488
let timeDelta = 0
let cpuState = STATE.IDLE
let iRefresh = 0
let saveTimeSlice = false
let iSaveState = 0
let iTempState = 0
let maxState = 60
let saveStates = Array<EmulatorSaveState>(maxState)
export let inVBL = false

// methods to capture start and end of VBL for other devices that may need it (mouse)
const startVBL = (): void => {
}

const endVBL = (): void => {
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
  set6502State(JSON.parse(JSON.stringify(newState.s6502)))
  const softSwitches: { [name: string]: boolean } = newState.softSwitches
  for (const key in softSwitches) {
    const keyTyped = key as keyof typeof SWITCHES
    try {
      SWITCHES[keyTyped].isSet = softSwitches[key]    
    } catch (error) {
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

const registerDiskDriver = () => {
  setSlotDriver(6, Uint8Array.from(disk2driver))
}

const doBoot = (setDrive = true) => {
  setCycleCount(0)
  memoryReset()
  if (setDrive) registerDiskDriver()
  if (code.length > 0) {
    let pcode = parseAssembly(0x300, code.split("\n"));
    memory.set(pcode, 0x300);
  }
//  testTiming()
  doReset()
}

const doReset = () => {
//  memoryReset()
  for (const key in SWITCHES) {
    const keyTyped = key as keyof typeof SWITCHES
    SWITCHES[keyTyped].isSet = false
  }
  SWITCHES.TEXT.isSet = true
  // Reset banked RAM
  memGet(0xC082)
  reset6502()
  doResetDrive()
  setButtonState()
}

export const doSetNormalSpeed = (normal: boolean) => {
  normalSpeed = normal
  refreshTime = normalSpeed ? 16.6881 : 0
  resetRefreshCounter()
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
  doSetDebug()
  if (cpuState === STATE.IDLE) {
    doBoot()
    cpuState = STATE.PAUSED
  }
  processInstruction(true)
  cpuState = STATE.PAUSED
  updateExternalMachineState()
}

export const doStepOver = () => {
  doSetDebug()
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
  doSetDebug()
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
  cpuState = cpuStateIn
  if (cpuState === STATE.PAUSED || cpuState === STATE.RUNNING) {
    doPauseDrive(cpuState === STATE.RUNNING)
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
    // Do not register our disk driver, just boot/reset to BASIC prompt.
    doBoot(false)
    doSetCPUState(STATE.NEED_RESET)
    // Wait a bit for the cpu to boot and go to prompt.
    setTimeout(() => {
      // Now register our disk driver, after we've booted.
      registerDiskDriver()
      loadBlock()
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
    let cmd = stack[i]
    if ((stack[i].length > 3) && (i - 1) > s6502.StackPtr) {
      if (stack[i-1] === "JSR" || stack[i-1] === "BRK") {
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

const getDebugString = () => {
  return ''
  // const status = Array<String>(16).fill("")
  // // const stackString = getStackString()
  // // for (let i = 0; i < Math.min(20, stackString.length); i++) {
  // //   status[i] = stackString[i]
  // // }
  // for (let j = 0; j < 16; j++) {
  //   let s = toHex(16 * j) + ":"
  //   for (let i = 0; i < 16; i++) {
  //     s += " " + toHex(mainMem[j * 16 + i])
  //   }
  //   status[j] = s
  // }
  // return status.join('\n')
}

const updateExternalMachineState = () => {
  const state: MachineState = {
    state: cpuState,
    speed: speed,
    altChar: SWITCHES.ALTCHARSET.isSet,
    textPage: getTextPage(),
    lores: getTextPage(true),
    hires: getHires(),
    zeroPageStack: getDebugString(),
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
  while (true) {
    const cycles = processInstruction();
    if (cycles < 0) break
    cycleTotal += cycles;
    if (cycleTotal >= 12480) {
      if (inVBL === false) {
        inVBL = true
        startVBL()
      }
    }
    if (cycleTotal >= 17030) {
      inVBL = false
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
