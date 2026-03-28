import { ADDR_MODE, isBranchInstruction, toHex } from "./utility"

const decodeBranch = (addr: number, vLo: number) => {
  // The extra +2 is for the branch instruction itself
  return addr + 2 + (vLo > 127 ? vLo - 256 : vLo)
}

export const willTakeBranch = (opcode: string, PStatus: number) => {
  // Will we take the branch (at least given our current 6502 state)?
  if (PStatus < 0) return false
  let takebranch = false
  switch (opcode) {
    case "BCS": takebranch = (PStatus & 0x01) !== 0; break
    case "BCC": takebranch = (PStatus & 0x01) === 0; break
    case "BEQ": takebranch = (PStatus & 0x02) !== 0; break
    case "BNE": takebranch = (PStatus & 0x02) === 0; break
    case "BMI": takebranch = (PStatus & 0x80) !== 0; break
    case "BPL": takebranch = (PStatus & 0x80) === 0; break
    case "BVS": takebranch = (PStatus & 0x40) !== 0; break
    case "BVC": takebranch = (PStatus & 0x40) === 0; break
    case "BRA": takebranch = true; break
  }
  return takebranch
}

export const getInstructionString = (addr: number, code: PCodeInstr1,
  vLo: number, vHi: number, PStatus: number) => {
  if (addr >> 8 === 0xC0) {
    let codename = "---"
    if (addr >= 0xC010 && addr <= 0xC01F) {
      codename = code.pcode >= 0x80 ? "ON" : "OFF"
    }
    return `${toHex(addr, 4)}: ${toHex(code.pcode)}        ${codename}`
  }
  let value = ""
  let hex = `${toHex(code.pcode)}`
  let sLo = ""
  let sHi = ""
  switch (code.bytes) {
    case 1: hex += "      "; break
    case 2: sLo = toHex(vLo); hex += ` ${sLo}   `; break
    case 3: sLo = toHex(vLo); sHi = toHex(vHi); hex += ` ${sLo} ${sHi}`; break
  }
  let takebranch = ""
  if (PStatus >= 0 && isBranchInstruction(code.name)) {
    takebranch = willTakeBranch(code.name, PStatus) ? "  ✓" : "  ✗"
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
  return `${toHex(addr, 4)}: ${hex}  ${code.name}${value}${takebranch}`
}

export const TraceSettingsDefault: TraceSettings = {
  numLines: 10000,
  collapseLoops: true,
  ignoreRegisters: false,
}
