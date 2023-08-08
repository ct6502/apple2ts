import { cycleCount, incrementPC, pcodes, s6502, setCycleCount } from "./instructions"
import { memGet, specialJumpTable } from "./memory"
import { doSetCPUState } from "./motherboard"
import { SWITCHES } from "./softswitches"
import { STATE, getInstrString, getProcessorStatus } from "./utility"

// let prevMemory = Buffer.from(mainMem)
// let DEBUG_ADDRESS = -1 // 0x9631
let doDebug = false
// let doDebugZeroPage = false
const instrTrail = new Array<string>(1000)
let posTrail = 0
let breakpoint = -1
let runToRTS = false

export const doSetDebug = (debug = true) => {
  doDebug = debug
}

export const doSetRunToRTS = (run = true) => {
  runToRTS = run
}

export const doSetBreakpoint = (breakpt: number) => {
  breakpoint = breakpt
//  if (breakpoint !== 0) doDebug = true
}

// let memZP = new Uint8Array(256).fill(0)
// const checkZeroPageDiff = () => {
//   const mem = getDataBlock(0)
//   const diff = new Uint8Array(256)
//   let ndiff = 0
//   for (let i=0; i < 256; i++) {
//     diff[i] = mem[i] - memZP[i]
//     memZP[i] = mem[i]
//     if (diff[i]) ndiff++
//   }
//   const skip = [0x4E, 0xEB, 0xEC, 0xED, 0xF9, 0xFA, 0xFB, 0xFC]
//   for (let i = 0; i < skip.length; i++) {
//     if (diff[skip[i]]) {
//       diff[skip[i]] = 0
//       ndiff--
//     }
//   }
//   let s = ''
//   if (ndiff > 0 && ndiff < 127) {
//     for (let i=0; i < 256; i++) {
//       if (diff[i]) s += ` ${toHex(i)}:${toHex(diff[i])}`
//     }
//     console.log(s)
//   }
// }

const outputInstructionTrail = () => {
  instrTrail.slice(posTrail).forEach(s => console.log(s));
  instrTrail.slice(0, posTrail).forEach(s => console.log(s));
}

export const processInstruction = (step = false) => {
  let cycles = 0
  let PC1 = s6502.PC
  const instr = memGet(s6502.PC)
  const vLo = memGet(s6502.PC + 1)
  const vHi = memGet(s6502.PC + 2)
  let code =  pcodes[instr]
  if (PC1 === breakpoint && !step) {
    doSetCPUState(STATE.PAUSED)
    return -1
  }
  // HACK
  const fn = specialJumpTable.get(PC1)
  if (fn && !SWITCHES.INTCXROM.isSet) {
    fn()
  }
  // END HACK
  cycles = code.execute(vLo, vHi)
  // Do not output during the Apple II's WAIT subroutine
  if (doDebug && (PC1 < 0xFCA8 || PC1 > 0xFCB3) && PC1 < 0xFF47) {
    if (PC1 === 0xFFFFF) {
      outputInstructionTrail()
    }
    const ins = getInstrString(code, vLo, vHi, PC1) + '            '
    const out = `${ins.slice(0, 22)}  ${getProcessorStatus(s6502)}`
    instrTrail[posTrail] = out
    posTrail = (posTrail + 1) % instrTrail.length
    console.log(out)
  }
  incrementPC(code.PC)
  setCycleCount(cycleCount + cycles)
  if (runToRTS && code.pcode === 0x60) {
    runToRTS = false
    doSetCPUState(STATE.PAUSED)
    return -1
  }
  return cycles
}
