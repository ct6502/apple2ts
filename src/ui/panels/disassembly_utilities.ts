import { getInstructionString } from "../../common/util_disassemble"
import { DISASSEMBLE_VISIBLE } from "../../common/utility"
import { handleGetAddressGetTable, handleGetMemoryDump, handleGetState6502 } from "../main2worker"

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

export const getDisassembly = () => {
  let addr = disassemblyAddress >= 0 ? disassemblyAddress : handleGetState6502().PC
  // console.log("getDisassembly ", disassemblyAddress.toString(16), handleGetState6502().PC.toString(16))
  if (addr < 0 || addr > 0xFFFF) return ""
  addr = Math.min(addr, 0xFFFF - nlines + 1)
  let r = ""
  for (let i=0; i < nlines; i++) {
    if (addr > 0xFFFF) {
      r += "\n"
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
