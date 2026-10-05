import { getInstructionString } from "../../../common/util_disassemble"
import { getSymbolTables } from "../../../common/utility"
import { handleGetCurrentMemory, handleGetMachineName, handleGetSoftSwitches, handleGetState6502 } from "../../main2worker"

let instructions: Array<PCodeInstr1> = []
export const set6502Instructions = (instr: Array<PCodeInstr1>) => {
  instructions = instr
}

let nlines = 100  // should this be an argument?

export const setLinesVisible = (lines: number) => {
  nlines = lines
}

let disassemblyAddressStart = -1
let highlightedAddress = -1
let visitedAddresses: number[] = [1000]
let currentAddressIndex: number = 1

export const getDisassemblyAddressStart = () => {
  return disassemblyAddressStart
}

export const setDisassemblyAddressStart = (addr: number, updateVisitedAddresses = false) => {
  // console.log("setDisassemblyAddress ", addr.toString(16))
  disassemblyAddressStart = Math.max(0, Math.min(0xFFFF, addr))
  if (updateVisitedAddresses) {
    if (addr !== visitedAddresses[currentAddressIndex]) {
      visitedAddresses = visitedAddresses.slice(0, currentAddressIndex + 1)
      visitedAddresses.push(addr)
      currentAddressIndex = visitedAddresses.length - 1
    }
  }
}

export const ensureDisassemblyContainsAddress = (addr: number, updateVisitedAddresses: boolean, highlightAddress = false) => {
  if (highlightAddress) {
    highlightedAddress = addr
  }
  let containedWithin = false
  if (addr >= disassemblyAddressStart && addr < disassemblyAddressStart + 3 * nlines) {
    const disArray = getDisassembly(disassemblyAddressStart)
    for (let i = 0; i < disArray.length; i++) {
      const lineAddr = parseInt(disArray[i], 16)
      if (lineAddr === addr) {
        containedWithin = true
        break
      }
    }
  }
  if (!containedWithin) {
    setDisassemblyAddressStart(addr - Math.floor(nlines / 2), updateVisitedAddresses)
  }
}

export const getHighlightedAddress = () => {
  return highlightedAddress
}

// Flag that the next time the disassembly is rendered, it should update to the current PC.
// The disassembly is required to call checkDisassemblyNeedUpdatePC first.
let needUpdatePC = false

export const setDisassemblyNeedUpdatePC = () => {
  needUpdatePC = true
}

export const checkDisassemblyNeedUpdatePC = () => {
  if (needUpdatePC) {
    needUpdatePC = false
    const pc = handleGetState6502().PC
    ensureDisassemblyContainsAddress(pc, true)
  }
}

export const getVisitedAddresses = () => {
  return visitedAddresses
}

export const getCurrentAddressIndex = () => {
  return currentAddressIndex
}

export const setVisitedAddresses = (addresses: number[]) => {
  visitedAddresses = addresses
}

export const setCurrentAddressIndex = (index: number) => {
  currentAddressIndex = index
}

export const getDisassembly = (startAddress: number, endAddress = -1) => {
  let addr = (startAddress !== -1) ? startAddress : disassemblyAddressStart
  if (addr < 0 || addr > 0xFFFF) return [""]
  const lines = endAddress !== -1 ? Math.min(endAddress - addr + 1, 0xFFFF) : nlines
  const r = Array<string>(lines)
  const memory = handleGetCurrentMemory()
  for (let i = 0; i < lines; i++) {
    if (addr > 0xFFFF) {
      r[i] = ""
      continue
    }
    if (addr >> 8 === 0xC0) {
      // Retrieve $C0xx soft switch values
      const instr = memory[addr]
      const code =  instructions[instr]
      r[i] = getInstructionString(addr, code, 0x00, 0x00, -1)
      addr++
      continue
    }
    const instr = memory[addr]
    if (instr === null) {
      r[i] = ""
      continue
    }
    const code = instructions[instr]
    if (!code) {
      return r
    }
    const vLo = memory[(addr + 1) % 0x10000]
    const vHi = memory[(addr + 2) % 0x10000]
    // Do not want the branch to be marked as taken or not taken here
    r[i] = getInstructionString(addr, code, vLo, vHi, -1)
    addr += code.bytes
    if (endAddress !== -1 && addr > endAddress) break
  }
  return r
}

export const getDisassemblyBeforeStart = (linesBefore: number) => {
  const startAddress = Math.max(0, disassemblyAddressStart - linesBefore * 4)
  return getDisassembly(startAddress, disassemblyAddressStart - 1)
}

// export const getLineOfDisassembly = (line: number) => {
//   const disArray = getDisassembly().split("\n")
//   if (disArray.length <= 1) {
//     return -1
//   }
//   const firstLine = parseInt(disArray[0].slice(0, disArray[0].indexOf(":")), 16)
//   if (line < firstLine) return -1
//   const last = disArray[disArray.length - 2]
//   const lastLine = parseInt(last.slice(0, last.indexOf(": ")), 16)
//   if (line > lastLine) return -1
//   const iend = Math.min(disArray.length - 1, nlines - 1)
//   for (let i = 0; i <= iend; i++) {
//     const addr = parseInt(disArray[i].slice(0, disArray[i].indexOf(":")), 16)
//     if (addr === line) return i
//   }
//   return -1
// }


export const getSymbolForAddress = (addr: number) => {
  const [machineSymbolTable, userSymbolTable] = getSymbolTables(handleGetMachineName())
  // This is a bit of a hack - see if we are in the ROM range, and if we are,
  // then see if our ROM is enabled or disabled.
  if (addr >= 0xE000) {
    const switches = handleGetSoftSwitches()
    if (switches.BSRREADRAM || switches.BSR_WRITE) {
      // ROM is disabled, just return the user symbol (if any)
      return userSymbolTable ? userSymbolTable.get(addr) : null
    }
  }
  // Return the user symbol (if any)
  if (userSymbolTable && userSymbolTable.has(addr)) {
    return userSymbolTable.get(addr)
  }
  // Return the machine symbol (or undefined)
  return machineSymbolTable.get(addr)
}


const getJumpAsPlaintext = (opcode: string, operand: string) => {
  const ops = operand.split(/(\$[0-9A-Fa-f]{4})/)
  let addr = (ops.length > 1) ? parseInt(ops[1].slice(1), 16) : -1
  if (ops.length === 3 && addr >= 0) {
    const s6502 = handleGetState6502()
    if (ops[2].includes(")")) {
      const memory = handleGetCurrentMemory()
      if (memory.length > 1) {
        // pre-indexing: add X to the address before finding the JMP address
        if (ops[2].includes(",X")) addr += s6502.XReg
        addr = memory[addr] + 256 * memory[addr + 1]
      }
    }
    ops[1] = getSymbolForAddress(addr) || ops[1]
    return `${ops[0]}${ops[1]}${ops[2]}`
  }
  return ""
}

const getOperandPlaintext = (opcode: string, operand: string) => {
  if (["BPL", "BMI", "BVC", "BVS", "BCC",
    "BCS", "BNE", "BEQ", "BRA", "JSR", "JMP"].includes(opcode)) {
    const result = getJumpAsPlaintext(opcode, operand)
    if (result) return result
  }
  if (!operand.startsWith("#$")) {
    const ops = operand.split(/(\$[0-9A-Fa-f]{2,4})/)
    const addr = (ops.length > 1) ? parseInt(ops[1].slice(1), 16) : -1
    if (addr >= 0) {
      const symbol = getSymbolForAddress(addr)
      if (symbol) {
        operand = ops[0] + symbol + (ops[2] || "")
      }
    }
  }
  return `${(operand + "         ").slice(0, 10)}`
}

export const getLineAsPlaintext = (line: string) => {
  const opcode = line.slice(16, 19)
  const addr = parseInt(line.slice(0, 4), 16)
  const symbol = getSymbolForAddress(addr) || ""
  let hexcodes = line.slice(0, 16) + "       "
  hexcodes = hexcodes.substring(0, 23 - symbol.length) + symbol + " "
  return `${hexcodes}${opcode} ${getOperandPlaintext(opcode, line.slice(20))}`.trim()
}

