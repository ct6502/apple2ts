import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { isBranchInstruction, ROMmemoryStart, toHex } from "../../../common/utility"
import {
  handleGetAddressGetTable,
  handleGetMachineName,
  handleGetMemoryDump,
  handleGetState6502,
} from "../../main2worker"
import { faCheck, faTimes } from "@fortawesome/free-solid-svg-icons"
import { getSymbolForAddress } from "./disassembly_utilities"
import { willTakeBranch } from "../../../common/util_disassemble"
import {
  formatIndexedAddressNotation,
  formatPreIndexedAddressNotation,
  formatMemoryTooltip,
  getDisassemblyTooltip,
  getDisassemblyWriteValue,
  getAddressWrapMask,
  getZeroPagePointer,
  isolateTechnicalNotation,
  joinDisassemblyTooltipLines,
} from "./disassembly_tooltips"
import type { TooltipTranslator } from "./disassembly_tooltips"

// const fWeight = (opcode: string) => {
//   if ((["BPL", "BMI", "BVC", "BVS", "BCC", "BCS", "BNE", "BEQ", "JSR", "JMP", "RTS"]).includes(opcode)) return "bold"
//   return ""
// }

const borderStyle = (opcode: string) => {
  if ((["JMP", "RTS", "RTI"]).includes(opcode)) return "disassembly-separator"
  return ""
}

const getShiftedMemoryValue = (addr: number) => {
  if (addr >= 0) {
    const memory = handleGetMemoryDump()
    if (memory.length > 1) {
      const addressGetTable = handleGetAddressGetTable()
      const page = addr >>> 8
      // Retrieve $C0xx soft switch values
      if (page === 0xC0) {
        return memory[ROMmemoryStart + (addr & 255)]
      }
      const shifted = addressGetTable[page]
      addr = shifted + (addr & 255)
      if (addr < memory.length) {
        return memory[addr]
      }
    }
  }
  return -1
}

const getOperandTooltip = (
  opcode: string,
  operand: string,
  addr: number,
  instructionAddress: number,
  translate: TooltipTranslator,
) => {
  const formatEffectiveAddressTooltip = (notation: string) =>
    formatMemoryTooltip("effectiveAddress", notation, translate)
  let addressDescription = ""
  let effectiveAddress = addr
  let value = -1
  if (operand.includes(",X)")) {
    const xreg = handleGetState6502().XReg
    // pre-indexing: add X to the address before finding the actual address
    const preIndex = (addr + xreg) & 0xFF
    const addrInd = getZeroPagePointer(preIndex, getShiftedMemoryValue)
    effectiveAddress = addrInd
    value = getShiftedMemoryValue(effectiveAddress)
    addressDescription = formatEffectiveAddressTooltip(formatPreIndexedAddressNotation(
      `$${toHex(addr)}`,
      `$${toHex(xreg)}`,
      `$${toHex(preIndex)}`,
      `$${toHex(effectiveAddress)}`,
      getAddressWrapMask(addr, xreg, 0xFF),
    ))
  } else if (operand.includes("),Y")) {
    const yreg = handleGetState6502().YReg
    // post-indexing: find the address from memory and then add Y
    const addrInd = getZeroPagePointer(addr, getShiftedMemoryValue)
    effectiveAddress = (addrInd + yreg) & 0xFFFF
    value = getShiftedMemoryValue(effectiveAddress)
    addressDescription = formatEffectiveAddressTooltip(formatIndexedAddressNotation(
      `$${toHex(addrInd)}`, `$${toHex(yreg)}`, `$${toHex(effectiveAddress)}`,
      getAddressWrapMask(addrInd, yreg, 0xFFFF),
    ))
  } else if (operand.includes(",X")) {
    const xreg = handleGetState6502().XReg
    const mask = /\$[0-9A-Fa-f]{2},X/.test(operand) ? 0xFF : 0xFFFF
    effectiveAddress = (addr + xreg) & mask
    value = getShiftedMemoryValue(effectiveAddress)
    addressDescription = formatEffectiveAddressTooltip(formatIndexedAddressNotation(
      `$${toHex(addr)}`, `$${toHex(xreg)}`, `$${toHex(effectiveAddress)}`,
      getAddressWrapMask(addr, xreg, mask),
    ))
  } else if (operand.includes(",Y")) {
    const yreg = handleGetState6502().YReg
    const mask = /\$[0-9A-Fa-f]{2},Y/.test(operand) ? 0xFF : 0xFFFF
    effectiveAddress = (addr + yreg) & mask
    value = getShiftedMemoryValue(effectiveAddress)
    addressDescription = formatEffectiveAddressTooltip(formatIndexedAddressNotation(
      `$${toHex(addr)}`, `$${toHex(yreg)}`, `$${toHex(effectiveAddress)}`,
      getAddressWrapMask(addr, yreg, mask),
    ))
  } else if (operand.includes(")")) {
    const addrInd = getZeroPagePointer(addr, getShiftedMemoryValue)
    effectiveAddress = addrInd
    value = getShiftedMemoryValue(effectiveAddress)
    addressDescription = formatEffectiveAddressTooltip(`$${toHex(effectiveAddress)}`)
  } else if (operand.includes("$")) {
    value = getShiftedMemoryValue(effectiveAddress)
  }

  const state = handleGetState6502()
  const needsCurrentRegisterValue = ["STA", "STX", "STY"].includes(opcode)
  const writeValue = needsCurrentRegisterValue && instructionAddress !== state.PC
    ? -1
    : getDisassemblyWriteValue(opcode, value, state)
  const semanticTooltip = getDisassemblyTooltip(
    handleGetMachineName(), effectiveAddress, opcode, writeValue, translate,
    operand,
  )
  if (semanticTooltip !== undefined) {
    return joinDisassemblyTooltipLines(addressDescription, semanticTooltip)
  }

  const valueDescription = value >= 0
    ? formatMemoryTooltip("value", `$${toHex(value)}`, translate)
    : ""
  return joinDisassemblyTooltipLines(addressDescription, valueDescription)
}


const getJumpLink = (opcode: string, operand: string, onJumpClick: (addr: number) => void) => {
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

    // Will we take the branch (at least given our current 6502 state)?
    let takebranch = null
    const yes = <FontAwesomeIcon icon={faCheck} style={{ color: "green", marginLeft: "17px" }} />
    const no = <FontAwesomeIcon icon={faTimes} style={{ color: "red", marginLeft: "17px" }} />
    if (isBranchInstruction(opcode)) {
      takebranch = willTakeBranch(opcode, s6502.PStatus) ? yes : no
    }
    return <span>{ops[0]}<span className="disassembly-link"
        title={isolateTechnicalNotation(`$${toHex(addr)}`)}
        onClick={() => {onJumpClick(addr)}}>{ops[1]}</span>
      <span>{ops[2]}</span>
      {takebranch}
      </span>
  }
  return null
}

const getOperand = (
  opcode: string,
  operand: string,
  instructionAddress: number,
  onJumpClick: (addr: number) => void,
  onMemoryClick: (addr: number) => void,
  translate: TooltipTranslator,
) => {
  if (["BPL", "BMI", "BVC", "BVS", "BCC",
    "BCS", "BNE", "BEQ", "BRA", "JSR", "JMP"].includes(opcode)) {
    const result = getJumpLink(opcode, operand, onJumpClick)
    if (result) return result
  }
  let className = ""
  let title = ""
  if (operand.startsWith("#$")) {
    const value = parseInt(operand.slice(2), 16)
    let char = ""
    if (value < 256) {
      let cvalue = value & 0x7F
      const caret = (cvalue <= 31) ? "^" : ""
      if (cvalue <= 31) cvalue += 64
      char = ` = "${caret}${String.fromCharCode(cvalue)}"`
    }
    title += isolateTechnicalNotation(
      `${value.toString()} = ${(value | 256).toString(2).slice(1)}${char}`,
    )
    className = "disassembly-immediate"
  } else {
    const ops = operand.split(/(\$[0-9A-Fa-f]{2,4})/)
    const addr = (ops.length > 1) ? parseInt(ops[1].slice(1), 16) : -1
    if (addr >= 0) {
      className = "disassembly-address"
      title += getOperandTooltip(opcode, operand, addr, instructionAddress, translate)
      const symbol = getSymbolForAddress(addr)
      if (symbol) {
        operand = ops[0] + symbol + (ops[2] || "")
      }
      operand = (operand + "         ").slice(0, 10)
      return <span title={title} onClick={() => {onMemoryClick(addr)}} className={className}>{operand}</span>
    }
  }
  operand = (operand + "         ").slice(0, 10)
  return <span title={title} className={className}>{operand}</span>
}

export const getChromacodedLine = (
  line: string,
  width: number,
  onJumpClick: (addr: number) => void,
  onMemoryClick: (addr: number) => void,
  translate: TooltipTranslator,
) => {
  const opcode = line.slice(16, 19)
  const addr = parseInt(line.slice(0, 4), 16)
  let symbol = getSymbolForAddress(addr) || ""
  const hexcodes = line.slice(0, 14).trim()
  const maxSymLengthWithoutShift = Math.max((width + 2) / 2, 24) - hexcodes.length
  // Right justify the symbol but if it is too long then just shove over the
  // operand and don't add extra spaces after the hex codes.
  symbol = " ".repeat(Math.max(2, maxSymLengthWithoutShift - symbol.length)) + symbol + " "
  return <span className={borderStyle(opcode)}>{hexcodes}{symbol}
    <span className="disassembly-opcode">{opcode} </span>
    {getOperand(opcode, line.slice(20), addr, onJumpClick, onMemoryClick, translate)}</span>
}
