import { getInstructionString } from "../../../common/util_disassemble"
import { DISASSEMBLE_VISIBLE, getSymbolTables, ROMmemoryStart } from "../../../common/utility"
import { handleGetAddressGetTable, handleGetMachineName, handleGetMemoryDump, handleGetSoftSwitches, handleGetState6502 } from "../../main2worker"

let instructions: Array<PCodeInstr1>
export const set6502Instructions = (instr: Array<PCodeInstr1>) => {
  instructions = instr
}

const nlines = 40  // should this be an argument?

let visibleMode: DISASSEMBLE_VISIBLE = DISASSEMBLE_VISIBLE.RESET

export const getDisassemblyVisibleMode = () => {
  return visibleMode
}

export const setDisassemblyVisibleMode = (mode: DISASSEMBLE_VISIBLE) => {
  visibleMode = mode
}

let disassemblyAddress = -1
export const getDisassemblyAddress = () => {
  return disassemblyAddress
}
export const setDisassemblyAddress = (addr: number) => {
  // console.log("setDisassemblyAddress ", addr.toString(16))
  disassemblyAddress = addr
}

const memGetRaw = (addr: number): number => {
  const page = addr >>> 8
  const shifted = handleGetAddressGetTable()[page]
  return handleGetMemoryDump()[shifted + (addr & 255)]
}

export const getDisassembly = (startAddress = -1, endAddress = -1) => {
  let addr = (startAddress !== -1) ? startAddress :
    disassemblyAddress >= 0 ? disassemblyAddress : handleGetState6502().PC
  if (addr < 0 || addr > 0xFFFF) return ""
  const lines = endAddress !== -1 ? 0xFFFF : nlines
  // console.log("getDisassembly ", disassemblyAddress.toString(16), handleGetState6502().PC.toString(16))
  if (startAddress === -1) addr = Math.min(addr, 0xFFFF - lines + 1)
  let r = ""
  for (let i = 0; i < lines; i++) {
    if (addr > 0xFFFF) {
      r += "\n"
      continue
    }
    if (addr >> 8 === 0xC0) {
      // Retrieve $C0xx soft switch values
      const instr = (handleGetMemoryDump())[ROMmemoryStart + addr - 0xC000]
      const code =  instructions[instr]
      r += getInstructionString(addr, code, 0x00, 0x00) + "\n"
      addr++
      continue
    }
    const instr = memGetRaw(addr)
    if (instr === null) {
      r += "\n"
      continue
    }
    const code =  instructions[instr]
    const vLo = memGetRaw((addr + 1) % 0x10000)
    const vHi = memGetRaw((addr + 2) % 0x10000)
    r += getInstructionString(addr, code, vLo, vHi) + "\n"
    addr += code.bytes
    if (endAddress !== -1 && addr > endAddress) break
  }
  return r
}

export const getLineOfDisassembly = (line: number) => {
  const disArray = getDisassembly().split("\n")
  if (disArray.length <= 1) {
    return -1
  }
  const firstLine = parseInt(disArray[0].slice(0, disArray[0].indexOf(":")), 16)
  if (line < firstLine) return -1
  const last = disArray[disArray.length - 2]
  const lastLine = parseInt(last.slice(0, last.indexOf(": ")), 16)
  if (line > lastLine) return -1
  const iend = Math.min(disArray.length - 1, nlines - 1)
  for (let i = 0; i <= iend; i++) {
    const addr = parseInt(disArray[i].slice(0, disArray[i].indexOf(":")), 16)
    if (addr === line) return i
  }
  return -1
}


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
      const memory = handleGetMemoryDump()
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

