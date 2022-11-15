import { Buffer } from "buffer"
import { s6502, set6502State, reset6502, pcodes,
  incrementPC, cycleCount, incrementCycleCount } from "./instructions"
import { toHex, getProcessorStatus, getInstrString, debugZeroPage } from "./utility"
// import { slot_omni } from "./roms/slot_omni_cx00"
import { SWITCHES } from "./softswitches";
import { doResetDrive, doPauseDrive } from "./diskinterface"
import { memGet, mainMem, auxMem, memC000 } from "./memory"
import { setButtonState } from "./joystick"


// let prevMemory = Buffer.from(mainMem)

export const getApple2State = () => {
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

export const setApple2State = (newState: any) => {
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

export let DEBUG_ADDRESS = -1 // 0x9631
let doDebug = false
let doDebugZeroPage = false

export const doReset = () => {
  reset6502()
  memC000.fill(0)
  for (const key in SWITCHES) {
    const keyTyped = key as keyof typeof SWITCHES
    SWITCHES[keyTyped].isSet = false
  }
  SWITCHES.TEXT.isSet = true
  // Reset banked RAM
  memGet(0xC082)
  doResetDrive()
  setButtonState()
}

export const doPause = (resume = false) => {
  doPauseDrive(resume)
}

export const doBoot6502 = () => {
  mainMem.fill(0xFF)
  auxMem.fill(0x00)
  doReset()
}

const instrTrail = new Array<string>(1000)
let posTrail = 0

export const processInstruction = () => {
  let cycles = 0
  const PC1 = s6502.PC
  const instr = memGet(s6502.PC)
  const vLo = s6502.PC < 0xFFFF ? memGet(s6502.PC + 1) : 0
  const vHi = s6502.PC < 0xFFFE ? memGet(s6502.PC + 2) : 0
  const code = pcodes[instr]
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
  } else {
    instrTrail.slice(posTrail).forEach(s => console.log(s));
    instrTrail.slice(0, posTrail).forEach(s => console.log(s));
    console.error("Missing instruction: $" + toHex(instr) + " PC=" + toHex(s6502.PC, 4))
    return 0;
    // memGet(0xC082)
    // cycles = pcodes[0].execute(vLo, vHi)
    // incrementCycleCount(cycles)
    // incrementPC(pcodes[0].PC)
  }
  return cycles
}
