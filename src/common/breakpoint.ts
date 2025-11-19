import {
  faCircleHalfStroke as iconBreakpointExtra,
  faCircle as iconBreakpointEnabled,
} from "@fortawesome/free-solid-svg-icons"
import {faCircle as iconBreakpointDisabled} from "@fortawesome/free-regular-svg-icons"
import { ADDR_MODE, toHex } from "./utility"
import { opCodes } from "./opcodes"

export const BRK_INSTR = 0x10000
export const BRK_ILLEGAL_65C02 = 0x10100
export const BRK_ILLEGAL_6502 = 0x10200

export const getBreakpointIcon = (bp: Breakpoint) => {
  if (bp.disabled) {
    return iconBreakpointDisabled
  }
  if (bp.expression1.register !== "" || bp.hitcount > 1) {
    return iconBreakpointExtra
  }
  return iconBreakpointEnabled
}

export const getBreakpointStyle = (bp: Breakpoint) => {
  return "breakpoint-style" + (bp.watchpoint ? " watch-point" : "") +
    (bp.instruction ? " break-instruction" : "")
}

export const getBreakpointString = (bp: Breakpoint) => {
  let result = ""
  if (bp.instruction) {
    const opcode = opCodes[bp.address & 0xFF]
    if (bp.address === BRK_ILLEGAL_65C02) {
      result = "Any illegal 65C02"
    } else if (bp.address === BRK_ILLEGAL_6502) {
      result = "Any illegal 6502"
    } else {
      result = opcode.name
    }
    const value4 = (bp.hexvalue >= 0) ? toHex(bp.hexvalue, 4) : "zzzz"
    const value2 = (bp.hexvalue >= 0) ? toHex(bp.hexvalue, 2) : "zz"
    switch (opcode.mode) {
      case ADDR_MODE.IMPLIED: break
      case ADDR_MODE.IMM: result += " #$" + value2; break
      case ADDR_MODE.ZP_REL: result += " $" + value2; break
      case ADDR_MODE.ZP_X: result += " $" + value2 + ",X"; break
      case ADDR_MODE.ZP_Y: result += " $" + value2 + ",Y"; break
      case ADDR_MODE.ABS: result += " $" + value4; break
      case ADDR_MODE.ABS_X: result += " $" + value4 + ",X"; break
      case ADDR_MODE.ABS_Y: result += " $" + value4 + ",Y"; break
      case ADDR_MODE.IND_X:
        result += " ($" + (opcode.name === "JMP" ? value4 : value2) + ",X)"
        break
      case ADDR_MODE.IND_Y: result += " ($" + value2 + "),Y"; break
      case ADDR_MODE.IND:
        result += " ($" + (opcode.name === "JMP" ? value4 : value2) + ")"
        break
    }
  } else {
    result = (bp.address >= 0) ? toHex(bp.address, 4) : "Any"
  }
  if (bp.watchpoint) {
    if (bp.memget) result += " read"
    if (bp.memset) result += " write"
  } else {
    if (bp.hitcount > 1) {
      result += ` hit=${bp.hitcount}`
    }
    if (bp.expression1.register !== "") {
      result += " (expression)"
    }
  }
  return result
}

// export const convertBreakpointExpression = (expression: string) => {
//   let expr = expression.toUpperCase()
//   // Convert Apple II #$12 to 0x12
//   expr = expr.replace(/#\$/g, "0x")
//   // #12 is just a decimal-based integer, so delete the #
//   expr = expr.replace(/#/g, "")
//   // Assume any other $1234 is a memory address, so get the value
//   expr = expr.replace(/\$([0-9A-F]+)/g, "memGet(0x$1)")
//   return expr
// }


export const BreakpointNew = (): Breakpoint => {
  const defaultExpression: BreakpointExpression =
    { register: "", address: 0x300, operator: "==", value: 0x80 }
  const defaultAction: BreakpointAction = {
    action: "",
    register: "A",
    address: 0x300,
    value: 0x00
  }
  return {
    address: -1,  // any address (useful for expressions)
    watchpoint: false,
    instruction: false,
    disabled: false,
    hidden: false,
    once: false,
    memget: false,
    memset: true,
    expression1: {...defaultExpression},
    expression2: {...defaultExpression},
    expressionOperator: "",
    hexvalue: -1,
    hitcount: 1,
    nhits: 0,
    memoryBank: "",
    action1: {...defaultAction},
    action2: {...defaultAction},
    halt: false
  }
}

export class BreakpointMap extends Map<number, Breakpoint> {
  set(key: number, value: Breakpoint): this {
    // Sort the keys each time we add a new entry
    const entries = [...this.entries()]
    entries.push([key, value])
    entries.sort((a, b) => a[0] - b[0])
    super.clear()
    for (const [k, v] of entries) {
      super.set(k, v)
    }

    return this
  }
}

// export type BreakpointMap = Map<number, Breakpoint>
