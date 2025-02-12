import { doInterruptRequest, doNonMaskableInterrupt, getLastJSR, incrementPC, pcodes, s6502, setCycleCount } from "./instructions"
import { memGet, memGetRaw, specialJumpTable } from "./memory"
import { doSetRunMode } from "./motherboard"
import { SWITCHES } from "./softswitches"
import { BRK_ILLEGAL_6502, BRK_ILLEGAL_65C02, BRK_INSTR, Breakpoint, BreakpointMap } from "../common/breakpoint"
import { RUN_MODE } from "../common/utility"
import { MEMORY_BANKS } from "../common/memorybanks"

// let prevMemory = Buffer.from(mainMem)
// let DEBUG_ADDRESS = -1 // 0x9631
let breakpointSkipOnce = false
let doWatchpointBreak = false
// let doDebugZeroPage = false
// const instrTrail = new Array<string>(1000)
// let posTrail = 0
export let breakpointMap: BreakpointMap = new BreakpointMap()
let runToRTS = false

export const doSetBreakpointSkipOnce = () => {
  breakpointSkipOnce = true
}

export const setStepOut = () => {
  // If we have a new Step Out, remove any old "hit once" breakpoints
  const bpTmp = new BreakpointMap(breakpointMap)
  bpTmp.forEach((bp, key) => {
    if (bp.once) breakpointMap.delete(key)
  });
  const addr = getLastJSR()
  if (addr < 0) return
  if (breakpointMap.get(addr)) return
  const bp = new Breakpoint()
  bp.address = addr
  bp.once = true
  bp.hidden = true
  breakpointMap.set(addr, bp)
}

export const doSetBreakpoints = (bp: BreakpointMap) => {
  // This will automatically erase any "hit once" breakpoints, which is okay.
  breakpointMap = bp
}

// These MEMORY_BANKS structures are defined within the common directory,
// so they can be used by the UI and Worker threads. But we need to fill in
// the actual function code here, since the values rely on the SWITCHES state.
let b_filledInMembankFunctions = false

const fillInMemoryBankFunctions = () => {
  b_filledInMembankFunctions = true
  MEMORY_BANKS["MAIN"].enabled = (addr = 0) => {
    if (addr >= 0xD000) {
      // We are not using our AUX card and we are using bank-switched RAM
      return !SWITCHES.ALTZP.isSet && SWITCHES.BSRREADRAM.isSet
    } else if (addr >= 0x200) {
      // Just look at our regular Main/Aux switch
      return !SWITCHES.RAMRD.isSet
    }
    // For $0-$1FF, look at the AUX ALTZP switch
    return !SWITCHES.ALTZP.isSet
  }
  MEMORY_BANKS["AUX"].enabled = (addr = 0) => {
    if (addr >= 0xD000) {
      // We are using our AUX card and we are also using bank-switched RAM
      return SWITCHES.ALTZP.isSet && SWITCHES.BSRREADRAM.isSet
    } else if (addr >= 0x200) {
      // Just look at our regular Main/Aux switch
      return SWITCHES.RAMRD.isSet
    }
    // For $0-$1FF, look at the AUX ALTZP switch
    return SWITCHES.ALTZP.isSet
  }
  MEMORY_BANKS["ROM"].enabled = () => {return !SWITCHES.BSRREADRAM.isSet}
  MEMORY_BANKS["MAIN-DXXX-1"].enabled = () => { return !SWITCHES.ALTZP.isSet && SWITCHES.BSRREADRAM.isSet && !SWITCHES.BSRBANK2.isSet }
  MEMORY_BANKS["MAIN-DXXX-2"].enabled = () => {return !SWITCHES.ALTZP.isSet && SWITCHES.BSRREADRAM.isSet && SWITCHES.BSRBANK2.isSet}
  MEMORY_BANKS["AUX-DXXX-1"].enabled = () => { return SWITCHES.ALTZP.isSet && SWITCHES.BSRREADRAM.isSet && !SWITCHES.BSRBANK2.isSet }
  MEMORY_BANKS["AUX-DXXX-2"].enabled = () => {return SWITCHES.ALTZP.isSet && SWITCHES.BSRREADRAM.isSet && SWITCHES.BSRBANK2.isSet}

  MEMORY_BANKS["CXXX-ROM"].enabled = (addr = 0) => {
    if (addr >= 0xC300 && addr <= 0xC3FF) {
      return SWITCHES.INTCXROM.isSet || !SWITCHES.SLOTC3ROM.isSet
    } else if (addr >= 0xC800) {
      return SWITCHES.INTCXROM.isSet || SWITCHES.INTC8ROM.isSet
    }
    return SWITCHES.INTCXROM.isSet
  }

  MEMORY_BANKS["CXXX-CARD"].enabled = (addr = 0) => {
    if (addr >= 0xC300 && addr <= 0xC3FF) {
      return SWITCHES.INTCXROM.isSet ? false : SWITCHES.SLOTC3ROM.isSet
    } else if (addr >= 0xC800) {
      // Both switches need to be off for addresses $C800-$CFFF to come from cards
      return !SWITCHES.INTCXROM.isSet && !SWITCHES.INTC8ROM.isSet
    }
    return !SWITCHES.INTCXROM.isSet
  }
}

const checkMemoryBank = (bankKey: string, address: number) => {
  if (!b_filledInMembankFunctions) {
    fillInMemoryBankFunctions()
  }
  const bank = MEMORY_BANKS[bankKey]
  if (address < bank.min || address > bank.max) return false
  if (bank.enabled && !bank?.enabled(address)) return false
  return true
}

export const isWatchpoint = (addr: number, value: number, set: boolean) => {
  const bp = breakpointMap.get(addr)
  if (!bp || !bp.watchpoint || bp.disabled) return false
  if (bp.hexvalue >= 0 && bp.hexvalue !== value) return false
  if (bp.memoryBank && !checkMemoryBank(bp.memoryBank, addr)) return false
  return set ? bp.memset : bp.memget
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

// const outputInstructionTrail = () => {
//   instrTrail.slice(posTrail).forEach(s => console.log(s));
//   instrTrail.slice(0, posTrail).forEach(s => console.log(s));
// }

export const interruptRequest = (slot = 0, set = true) => {
  // IRQ is level sensitive, so it is always active while true
  if (set) {
    s6502.flagIRQ |= (1<<slot)
  } else {
    s6502.flagIRQ &= ~(1<<slot)
  }
  s6502.flagIRQ &= 0xff
}

export const nonMaskableInterrupt = (set = true) => {
  // NMI is edge sensitive, and is only activated on positive transition.
  // That also means if multiple cards activate NMI at the same time
  // there will be only 1 NMI transition and interrupt, so multiple slot state is
  // not required.
  s6502.flagNMI = set === true
}

export const clearInterrupts = () => {
  s6502.flagIRQ = 0
  s6502.flagNMI = false
}

const cycleCountCallbacks: Array<(userdata: number) => void> = []
const cycleCountCBdata: Array<number> = []
export const registerCycleCountCallback = (fn: (userdata: number) => void, userdata: number) => {
  cycleCountCallbacks.push(fn)
  cycleCountCBdata.push(userdata)
}
const processCycleCountCallbacks = () => {
  for (let i = 0; i < cycleCountCallbacks.length; i++) {
    cycleCountCallbacks[i](cycleCountCBdata[i])    
  }
}

const checkBreakpointSingleExpression = (expr: BreakpointExpression) => {
  let val = 0
  switch (expr.register) {
    case '$': val = memGetRaw(expr.address); break
    case 'A': val = s6502.Accum; break
    case 'X': val = s6502.XReg; break
    case 'Y': val = s6502.YReg; break
    case 'S': val = s6502.StackPtr; break
    case 'P': val = s6502.PStatus; break
    // case 'I': return s6502.flagIRQ
  }
  switch (expr.operator) {
    case '==': return val === expr.value
    case '!=': return val !== expr.value
    case '<': return val < expr.value
    case '<=': return val <= expr.value
    case '>': return val > expr.value
    case '>=': return val >= expr.value
  }
}

export const checkBreakpointExpression = (bp: Breakpoint) => {
  const passes1 = checkBreakpointSingleExpression(bp.expression1)
  // Short circuit second expression if we can
  if (bp.expressionOperator === '') return passes1
  if (bp.expressionOperator === '&&' && !passes1) return false
  if (bp.expressionOperator === '||' && passes1) return true
  // Otherwise, whether we pass depends upon the second expression
  const passes2 = checkBreakpointSingleExpression(bp.expression2)
  return passes2
}

export const setWatchpointBreak = () => {
  doWatchpointBreak = true
}

// This is only exported for breakpoint testing
export const hitBreakpoint = (instr = -1, hexvalue = -1) => {
  if (doWatchpointBreak) {
    doWatchpointBreak = false
    return true
  }
  if (breakpointMap.size === 0 || breakpointSkipOnce) return false
  const bp = breakpointMap.get(s6502.PC) ||
    breakpointMap.get(-1) ||
    breakpointMap.get(instr | BRK_INSTR) ||
    (instr >= 0 && breakpointMap.get(BRK_ILLEGAL_65C02)) ||
    (instr >= 0 && breakpointMap.get(BRK_ILLEGAL_6502))
  if (!bp || bp.disabled || bp.watchpoint) return false
  if (bp.instruction) {
    // See if we need to have a matching value, but watch out for our special
    // BRK_ILLEGAL, which will break on any illegal opcode regardless of value.
    if (bp.address === BRK_ILLEGAL_65C02) {
      if (pcodes[instr].name !== '???') return false
    } else if (bp.address === BRK_ILLEGAL_6502) {
      if (pcodes[instr].is6502) return false
    } else if (hexvalue >= 0 && bp.hexvalue >= 0) {
      if (bp.hexvalue !== hexvalue) return false
    }
  }
  if (bp.expression1.register !== '') {
    const doBP = checkBreakpointExpression(bp)
    if (!doBP) return false
  }
  if (bp.hitcount > 1) {
    bp.nhits++
    if (bp.nhits < bp.hitcount) return false
    bp.nhits = 0
  }
  // Be sure to use the current program counter when checking memory bank,
  // so that it works for both regular breakpoints and instruction breakpoints.
  if (bp.memoryBank && !checkMemoryBank(bp.memoryBank, s6502.PC)) return false
  if (bp.once) breakpointMap.delete(s6502.PC)
  return true
}

export const processInstruction = () => {
  let cycles = 0
  const PC1 = s6502.PC
  // Do not trigger watchpoints. Those should only trigger on true read/writes.
  const instr = memGet(s6502.PC, false)
  const code =  pcodes[instr]
  // Make sure we only get these instruction bytes if necessary.
  // Do not trigger watchpoints. Those should only trigger on true read/writes.
  const vLo = (code.bytes > 1) ? memGet(s6502.PC + 1, false) : -1
  const vHi = (code.bytes > 2) ? memGet(s6502.PC + 2, false) : 0
  if (hitBreakpoint(instr, (vHi << 8) + vLo)) {
    doSetRunMode(RUN_MODE.PAUSED)
    return -1
  }
  breakpointSkipOnce = false
  const fn = specialJumpTable.get(PC1)
  if (fn && !SWITCHES.INTCXROM.isSet) {
    fn()
  }
  cycles = code.execute(vLo, vHi)
  // Do not output during the Apple II's WAIT subroutine
  // if (doDebug < 1000 && (PC1 < 0xFCA8 || PC1 > 0xFCB3) && PC1 < 0xFF47) {
  //   doDebug++
  //   if (PC1 === 0xFFFFF) {
  //     outputInstructionTrail()
  //   }
  //   const ins = getInstrString(code, vLo, vHi, PC1) + '            '
  //   const out = `${s6502.cycleCount}  ${ins.slice(0, 22)}  ${getProcessorStatus()}`
  //   instrTrail[posTrail] = out
  //   posTrail = (posTrail + 1) % instrTrail.length
  //   console.log(out)
  // }
  incrementPC(code.bytes)
  setCycleCount(s6502.cycleCount + cycles)
  processCycleCountCallbacks()
  // NMI has higher priority, and is edge sensitive
  if (s6502.flagNMI) {
    // reset flag after a single activation
    s6502.flagNMI = false
    cycles = doNonMaskableInterrupt()
    setCycleCount(s6502.cycleCount + cycles)
  }
  if (s6502.flagIRQ) {
    const intcycles = doInterruptRequest()
    if (intcycles > 0) {
      setCycleCount(s6502.cycleCount + intcycles)
      cycles = intcycles
    }
  }
  if (runToRTS && code.pcode === 0x60) {
    runToRTS = false
    doSetRunMode(RUN_MODE.PAUSED)
    return -1
  }
  return cycles
}
