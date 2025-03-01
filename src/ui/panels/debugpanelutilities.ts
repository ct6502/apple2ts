import { ADDR_MODE, isBranchInstruction, toHex } from "../../common/utility"
import { handleGetAddressGetTable, handleGetDisassemblyAddress, handleGetMemoryDump } from "../main2worker"

let instructions: Array<PCodeInstr1>
export const set6502Instructions = (instr: Array<PCodeInstr1>) => {
  instructions = instr
}

const nlines = 40  // should this be an argument?

const decodeBranch = (addr: number, vLo: number) => {
  // The extra +2 is for the branch instruction itself
  return addr + 2 + (vLo > 127 ? vLo - 256 : vLo)
}

const getInstructionString = (addr: number, code: PCodeInstr1,
  vLo: number, vHi: number) => {
  let value = ""
  let hex = `${toHex(code.pcode)}`
  let sLo = ""
  let sHi = ""
  switch (code.bytes) {
    case 1: hex += "      "; break
    case 2: sLo = toHex(vLo); hex += ` ${sLo}   `; break
    case 3: sLo = toHex(vLo); sHi = toHex(vHi); hex += ` ${sLo} ${sHi}`; break
  }
  const vRel = isBranchInstruction(code.name) ? toHex(decodeBranch(addr, vLo), 4) : sLo
  switch (code.mode) {
    case ADDR_MODE.IMPLIED: break  // BRK
    case ADDR_MODE.IMM: value = ` #$${sLo}`; break      // LDA #$01
    case ADDR_MODE.ZP_REL: value = ` $${vRel}`; break   // LDA $C0 or BCC $FF
    case ADDR_MODE.ZP_X: value = ` $${sLo},X`; break     // LDA $C0,X
    case ADDR_MODE.ZP_Y: value = ` $${sLo},Y`; break     // LDX $C0,Y
    case ADDR_MODE.ABS: value = ` $${sHi}${sLo}`; break      // LDA $1234
    case ADDR_MODE.ABS_X: value = ` $${sHi}${sLo},X`; break    // LDA $1234,X
    case ADDR_MODE.ABS_Y: value = ` $${sHi}${sLo},Y`; break    // LDA $1234,Y
    case ADDR_MODE.IND_X: value = ` ($${sHi.trim()}${sLo},X)`; break    // LDA ($FF,X) or JMP ($1234,X)
    case ADDR_MODE.IND_Y: value = ` ($${sLo}),Y`; break    // LDA ($FF),Y
    case ADDR_MODE.IND: value = ` ($${sHi.trim()}${sLo})`; break       // JMP ($1234) or LDA ($C0)
  }
  return `${toHex(addr, 4)}: ${hex}  ${code.name}${value}`
}

const memGetRaw = (addr: number): number => {
  const page = addr >>> 8
  const shifted = handleGetAddressGetTable()[page]
  return handleGetMemoryDump()[shifted + (addr & 255)]
}

export const getDisassembly = () => {
  let addr = handleGetDisassemblyAddress()
  if (addr < 0 || addr > 0xFFFF) return ""
  addr = Math.min(addr, 0xFFFF - nlines + 1)
  let r = ""
  for (let i=0; i < nlines; i++) {
    if (addr > 0xFFFF) {
      r += "\n"
      continue
    }
    const instr = memGetRaw(addr)
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
