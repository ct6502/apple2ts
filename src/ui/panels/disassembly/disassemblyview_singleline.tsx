import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { getSymbolTables, ROMmemoryStart, toHex } from "../../../common/utility"
import { handleGetAddressGetTable, handleGetMachineName, handleGetMemoryDump, handleGetSoftSwitches, handleGetState6502 } from "../../main2worker"
import { faCheck, faTimes } from "@fortawesome/free-solid-svg-icons"

// const fWeight = (opcode: string) => {
//   if ((["BPL", "BMI", "BVC", "BVS", "BCC", "BCS", "BNE", "BEQ", "JSR", "JMP", "RTS"]).includes(opcode)) return "bold"
//   return ""
// }

const borderStyle = (opcode: string) => {
  if ((["JMP", "RTS"]).includes(opcode)) return "disassembly-separator"
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

const getOperandTooltip = (operand: string, addr: number) => {
  let title = ""
  if (operand.includes(",X)")) {
    const xreg = handleGetState6502().XReg
    // pre-indexing: add X to the address before finding the actual address
    const preIndex = addr + xreg
    const addrInd = getShiftedMemoryValue(preIndex) + 256 * getShiftedMemoryValue(preIndex + 1)
    const value = getShiftedMemoryValue(addrInd)
    title = `($${toHex(addr)} + $${toHex(xreg)} = $${toHex(preIndex)}) => address = $${toHex(addrInd)}  value = $${toHex(value)}`
  } else if (operand.includes("),Y")) {
    const yreg = handleGetState6502().YReg
    // post-indexing: find the address from memory and then add Y
    const addrInd = getShiftedMemoryValue(addr) + 256 * getShiftedMemoryValue(addr + 1)
    const addrNew = addrInd + yreg
    const value = getShiftedMemoryValue(addrNew)
    title = `address $${toHex(addrInd)} + $${toHex(yreg)} = $${toHex(addrNew)}  value = $${toHex(value)}`
  } else if (operand.includes(",X")) {
    const xreg = handleGetState6502().XReg
    const addrNew = addr + xreg
    const value = getShiftedMemoryValue(addrNew)
    title = `address $${toHex(addr)} + $${toHex(xreg)} = $${toHex(addrNew)}  value = $${toHex(value)}`
  } else if (operand.includes(",Y")) {
    const yreg = handleGetState6502().YReg
    const addrNew = addr + yreg
    const value = getShiftedMemoryValue(addrNew)
    title = `address $${toHex(addr)} + $${toHex(yreg)} = $${toHex(addrNew)}  value = $${toHex(value)}`
  } else if (operand.includes(")")) {
    const addrInd = getShiftedMemoryValue(addr) + 256 * getShiftedMemoryValue(addr + 1)
    const value = getShiftedMemoryValue(addrInd)
    title = `address = $${toHex(addrInd)}  value = $${toHex(value)}`
  } else if (operand.includes("$")) {
    const value = getShiftedMemoryValue(addr)
    title = `value = $${toHex(value)}`
  }
  return title
}


const getSymbolForAddress = (addr: number) => {
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
    switch (opcode) {
      case "BCS": takebranch = (s6502.PStatus & 0x01) ? yes : no; break
      case "BCC": takebranch = !(s6502.PStatus & 0x01) ? yes : no; break
      case "BEQ": takebranch = (s6502.PStatus & 0x02) ? yes : no; break
      case "BNE": takebranch = !(s6502.PStatus & 0x02) ? yes : no; break
      case "BMI": takebranch = (s6502.PStatus & 0x80) ? yes : no; break
      case "BPL": takebranch = !(s6502.PStatus & 0x80) ? yes : no; break
      case "BVS": takebranch = (s6502.PStatus & 0x40) ? yes : no; break
      case "BVC": takebranch = !(s6502.PStatus & 0x40) ? yes : no; break
      case "BRA": takebranch = yes; break
    }
    return <span>{ops[0]}<span className="disassembly-link"
        title={`$${toHex(addr)}`}
        onClick={() => {onJumpClick(addr)}}>{ops[1]}</span>
      <span>{ops[2]}</span>
      {takebranch}
      </span>
  }
  return null
}

const getOperand = (opcode: string, operand: string, onJumpClick: (addr: number) => void) => {
  if (["BPL", "BMI", "BVC", "BVS", "BCC",
    "BCS", "BNE", "BEQ", "BRA", "JSR", "JMP"].includes(opcode)) {
    const result = getJumpLink(opcode, operand, onJumpClick)
    if (result) return result
  }
  let className = ""
  let title = ""
  if (operand.startsWith("#$")) {
    const value = parseInt(operand.slice(2), 16)
    title += value.toString() + " = " + (value | 256).toString(2).slice(1)
    className = "disassembly-immediate"
  } else {
    const ops = operand.split(/(\$[0-9A-Fa-f]{2,4})/)
    const addr = (ops.length > 1) ? parseInt(ops[1].slice(1), 16) : -1
    if (addr >= 0) {
      className = "disassembly-address"
      title += getOperandTooltip(operand, addr)
      const symbol = getSymbolForAddress(addr)
      if (symbol) {
        operand = ops[0] + symbol + (ops[2] || "")
      }
    }
  }
  return <span title={title} className={className}>{(operand + "         ").slice(0, 10)}</span>
}

export const getChromacodedLine = (line: string, onJumpClick: (addr: number) => void) => {
  const opcode = line.slice(16, 19)
  const addr = parseInt(line.slice(0, 4), 16)
  const symbol = getSymbolForAddress(addr) || ""
  let hexcodes = line.slice(0, 16) + "       "
  hexcodes = hexcodes.substring(0, 23 - symbol.length) + symbol + " "
  return <span className={borderStyle(opcode)}>{hexcodes}
    <span className="disassembly-opcode">{opcode} </span>
    {getOperand(opcode, line.slice(20), onJumpClick)}</span>
}
