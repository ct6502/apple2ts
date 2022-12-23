// Chris Torrence, 2022
import { Buffer } from "buffer"
import { passMachineState } from "./worker2main"
import { s6502, set6502State, reset6502, pcodes,
  incrementPC, cycleCount, incrementCycleCount } from "./instructions"
import { STATE, getProcessorStatus, getInstrString, debugZeroPage } from "./utility"
import { getDriveState, setDriveState, doResetDrive, doPauseDrive } from "./diskdata"
// import { slot_omni } from "./roms/slot_omni_cx00"
import { SWITCHES } from "./softswitches";
import { memGet, mainMem, auxMem, memC000, getTextPage, getHires } from "./memory"
import { setButtonState, handleGamepad } from "./joystick"
import { parseAssembly } from "./assembler";
import { code } from "./assemblycode"

// let timerID: any | number = 0
let startTime = 0
let prevTime = 0
let normalSpeed = true
let speed = 0
let refreshTime = 16.6881 // 17030 / 1020.488
let timeDelta = 0
let cpuState = STATE.IDLE
let iCycle = 0
let saveTimeSlice = false
let iSaveState = 0
let iTempState = 0
let maxState = 60
let saveStates = Array<string>(maxState).fill('')
// let prevMemory = Buffer.from(mainMem)
// let DEBUG_ADDRESS = -1 // 0x9631
let doDebug = false
let doDebugZeroPage = false
const instrTrail = new Array<string>(1000)
let posTrail = 0

const getApple2State = (): SAVEAPPLE2STATE => {
  const softSwitches: { [name: string]: boolean } = {}
  for (const key in SWITCHES) {
    softSwitches[key] = SWITCHES[key as keyof typeof SWITCHES].isSet
  }
  const memory = Buffer.from(mainMem)
  const memAux = Buffer.from(auxMem)
  // let memdiff: { [addr: number]: number } = {};
  // for (let i = 0; i < memory.length; i++) {
  //   if (prevMemory[i] !== memory[i]) {
  //     memdiff[i] = memory[i]
  //   }
  // }
  // prevMemory = memory
  return {
    s6502: s6502,
    softSwitches: softSwitches,
    memory: memory.toString("base64"),
    memAux: memAux.toString("base64"),
    memc000: Buffer.from(memC000).toString("base64"),
  }
}

const setApple2State = (newState: SAVEAPPLE2STATE) => {
  set6502State(newState.s6502)
  const softSwitches: { [name: string]: boolean } = newState.softSwitches
  for (const key in softSwitches) {
    const keyTyped = key as keyof typeof SWITCHES
    try {
      SWITCHES[keyTyped].isSet = softSwitches[key]    
    } catch (error) {
    }
  }
  mainMem.set(Buffer.from(newState.memory, "base64"))
  memC000.set(Buffer.from(newState.memc000, "base64"))
  if (newState.memAux !== undefined) {
    auxMem.set(Buffer.from(newState.memAux, "base64"))
  }
}

// export const doRequestSaveState = () => {
//   passSaveState(doGetSaveState())
// }

export const doGetSaveState = () => {
  const state = { state6502: getApple2State(), driveState: getDriveState() }
  return JSON.stringify(state)
//  return Buffer.from(compress(JSON.stringify(state)), 'ucs2').toString('base64')
}

export const doRestoreSaveState = (sState: string) => {
  const state = JSON.parse(sState);
  setApple2State(state.state6502 as SAVEAPPLE2STATE)
  setDriveState(state.driveState)
  updateExternalMachineState()
}

const doBoot = () => {
  mainMem.fill(0xFF)
  auxMem.fill(0x00)
  doReset()
  if (code.length > 0) {
    let pcode = parseAssembly(0x300, code.split("\n"));
    mainMem.set(pcode, 0x300);
  }
  doSetCPUState(STATE.RUNNING)
}

const doReset = () => {
  memC000.fill(0)
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
  doSetCPUState(STATE.RUNNING)
}

export const doSetNormalSpeed = (normal: boolean) => {
  normalSpeed = normal
  refreshTime = normalSpeed ? 16.6881 : 0
  resetCycleCounter()
}

export const doGoBackInTime = () => {
  doSetCPUState(STATE.PAUSED)
  // if this is the first time we're called, make sure our current
  // state is up to date
  if (iTempState === iSaveState) {
    saveStates[iSaveState] = doGetSaveState()
  }
  const newTmp = (iTempState + maxState - 1) % maxState
  if (newTmp === iSaveState || saveStates[newTmp] === '') {
    return
  }
  iTempState = newTmp
  doRestoreSaveState(saveStates[newTmp])
}

export const doGoForwardInTime = () => {
  doSetCPUState(STATE.PAUSED)
  if (iTempState === iSaveState) {
    return
  }
  const newTmp = (iTempState + 1) % maxState
  if (saveStates[newTmp] === '') {
    return
  }
  iTempState = newTmp
  doRestoreSaveState(saveStates[newTmp])
}

export const doSaveTimeSlice = () => {
  // Set a flag and save our slice at the end of the next 6502 display cycle.
  // Otherwise we risk saving in the middle of a keystroke.
  saveTimeSlice = true
}

const resetCycleCounter = () => {
  iCycle = 0
  prevTime = performance.now()
  startTime = prevTime
}

export const doSetCPUState = (cpuStateIn: STATE) => {
  cpuState = cpuStateIn
  if (cpuState === STATE.PAUSED || cpuState === STATE.RUNNING) {
    doPauseDrive(cpuState === STATE.RUNNING)
  }
  updateExternalMachineState()
  resetCycleCounter()
  if (speed === 0) {
    doAdvance6502Timer()
  }
}

export const processInstruction = () => {
  let cycles = 0
  const PC1 = s6502.PC
  const instr = memGet(s6502.PC)
  const vLo = s6502.PC < 0xFFFF ? memGet(s6502.PC + 1) : 0
  const vHi = s6502.PC < 0xFFFE ? memGet(s6502.PC + 2) : 0
  let code = pcodes[instr]
  if (!code) {
    code = pcodes[0xEA]
  }
  if (code) {
//    const mainMem1 = mainMem
//    if (PC1 === 0x4B10) {
//      doDebug = true
//    }
//    if (PC1 === 0xFF46) {
//      doDebug = true
//    }
    cycles = code.execute(vLo, vHi)
    let out = '----'
    // Do not output during the Apple II's WAIT subroutine
    if ((PC1 < 0xFCA8 || PC1 > 0xFCB3) && PC1 < 0xFF47) {
      const cc = (cycleCount.toString() + '      ').slice(0, 10)
      const ins = getInstrString(code, vLo, vHi, PC1) + '            '
      out = `${cc}  ${ins.slice(0, 22)}  ${getProcessorStatus(s6502)}`
    }
    instrTrail[posTrail] = out
    posTrail = (posTrail + 1) % instrTrail.length
    if (doDebug) {
      console.log(out)
      if (doDebugZeroPage) {
        debugZeroPage(mainMem.slice(0, 256))
      }
    }
    // if (doDebug) {
    //   instrTrail.slice(posTrail).forEach(s => console.log(s));
    //   instrTrail.slice(0, posTrail).forEach(s => console.log(s));
    //   console.log("stop!!!")
    // }
    incrementCycleCount(cycles)
    incrementPC(code.PC)
  }
  return cycles
}

const updateExternalMachineState = () => {
  const state: MachineState = {
    state: cpuState,
    speed: speed,
    altChar: SWITCHES.ALTCHARSET.isSet,
    textPage: getTextPage(),
    lores: getTextPage(true),
    hires: getHires()
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
  } else if (cpuState === STATE.NEED_RESET) {
    doReset();
  }
  let cycleTotal = 0
  while (true) {
    const cycles = processInstruction();
    if (cycles === 0) {
      doSetCPUState(STATE.PAUSED)
      return;
    }
    cycleTotal += cycles;
    if (cycleTotal >= 17030) {
      break;
    }
  }
  iCycle++
  speed = (iCycle * 17.030) / (performance.now() - startTime)
  updateExternalMachineState()
  handleGamepad()
  if (saveTimeSlice) {
    saveTimeSlice = false
    iSaveState = (iSaveState + 1) % maxState
    iTempState = iSaveState
    console.log("iSaveState " + iSaveState)
    saveStates[iSaveState] = doGetSaveState()
  }
}

const doAdvance6502Timer = () => {
  doAdvance6502()
  if (cpuState === STATE.RUNNING) {
    const iCycleFinish = (iCycle + 9)
    while (iCycle !== iCycleFinish) {
      doAdvance6502()
    }
  }
  setTimeout(doAdvance6502Timer, 0)
}
