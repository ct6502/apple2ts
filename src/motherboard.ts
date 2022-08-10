import { Buffer } from "buffer"
import { s6502, set6502State, reset6502, pcodes,
  incrementPC, cycleCount, incrementCycleCount } from "./instructions"
import { toHex, getProcessorStatus, getInstrString, debugZeroPage } from "./utility"
// import { slot_omni } from "./roms/slot_omni_cx00"
import { SWITCHES } from "./softswitches";
import { doResetDrive, doPauseDrive } from "./diskdrive"
import { memGet, bank0, bank1, memC000 } from "./memory"


// let prevMemory = Buffer.from(bank0)

export const getApple2State = () => {
  const softSwitches: { [name: string]: boolean } = {}
  for (const key in SWITCHES) {
    softSwitches[key] = SWITCHES[key as keyof typeof SWITCHES].isSet
  }
  const memory = Buffer.from(bank0)
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
    memc000: Buffer.from(memC000).toString("base64"),
  }
}

export const setApple2State = (newState: any) => {
  set6502State(newState.s6502)
  const softSwitches: { [name: string]: boolean } = newState.softSwitches
  for (const key in softSwitches) {
    const keyTyped = key as keyof typeof SWITCHES
    SWITCHES[keyTyped].isSet = softSwitches[key]
  }
  bank0.set(Buffer.from(newState.memory, "base64"))
  memC000.set(Buffer.from(newState.memc000, "base64"))
}

export let DEBUG_ADDRESS = -1 // 0xBFB6
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
}

export const doPause = (resume = false) => {
  doPauseDrive(resume)
}

export const doBoot6502 = () => {
  bank0.fill(0xFF)
  bank1.fill(0xFF)
  doReset()
}


const skipPCs = [0xC28B, 0xC28E, 0xC27D, 0xC27F]

export const processInstruction = () => {
  let cycles = 0
  const PC1 = s6502.PC
  const instr = memGet(s6502.PC)
  const vLo = s6502.PC < 0xFFFF ? memGet(s6502.PC + 1) : 0
  const vHi = s6502.PC < 0xFFFE ? memGet(s6502.PC + 2) : 0
  const code = pcodes[instr]
  if (code) {
    if (PC1 === DEBUG_ADDRESS) {
      doDebug = true
    }
    // Do not output during the Apple II's WAIT subroutine
    if (doDebug && (PC1 < 0xFCA8 || PC1 > 0xFCB3)) {
      if (skipPCs.includes(PC1)) {
        console.log("----")
      } else {
        const out = `${getProcessorStatus(s6502)}  ${getInstrString(code, vLo, vHi, s6502.PC)}  ${cycleCount}`
        console.log(out)
      }
      if (doDebugZeroPage) {
        debugZeroPage(bank0.slice(0, 256))
      }
    }
    cycles = code.execute(vLo, vHi)
    if (!(s6502.Accum >= 0 && s6502.Accum <= 255)) {
      const a = s6502.Accum
      console.error("out of bounds, accum = " + a)
    }
    incrementCycleCount(cycles)
    incrementPC(code.PC)
  } else {
    console.error("Missing instruction: $" + toHex(instr) + " PC=" + toHex(s6502.PC, 4))
    cycles = pcodes[0].execute(vLo, vHi)
  }
  return cycles
}
