import {
  faCircleHalfStroke as iconBreakpointExtra,
  faCircle as iconBreakpointEnabled,
} from "@fortawesome/free-solid-svg-icons";
import {faCircle as iconBreakpointDisabled} from "@fortawesome/free-regular-svg-icons";
import { ADDR_MODE, toHex } from "./utility"
import { opCodes } from "../../panels/opcodes";

export const BRK_INSTR = 0x10000
export const BRK_ILLEGAL = 0x10100

export const getBreakpointIcon = (bp: Breakpoint) => {
  if (bp.disabled) {
    return iconBreakpointDisabled
  }
  if (bp.expression || bp.hitcount > 1) {
    return iconBreakpointExtra
  }
  return iconBreakpointEnabled
}

export const getBreakpointStyle = (bp: Breakpoint) => {
  return "breakpoint-style" + (bp.watchpoint ? " watch-point" : "") +
    (bp.instruction ? " break-instruction" : "")
}

export const getBreakpointString = (bp: Breakpoint) => {
  let result = ''
  if (bp.instruction) {
    const opcode = opCodes[bp.address & 0xFF]
    result = (bp.address === BRK_ILLEGAL) ? 'Any illegal' : opcode.name
    const value4 = (bp.hexvalue >= 0) ? toHex(bp.hexvalue, 4) : 'zzzz'
    const value2 = (bp.hexvalue >= 0) ? toHex(bp.hexvalue, 2) : 'zz'
    switch (opcode.mode) {
      case ADDR_MODE.IMPLIED: break
      case ADDR_MODE.IMM: result += ' #$' + value2; break
      case ADDR_MODE.ZP_REL: result += ' $' + value2; break
      case ADDR_MODE.ZP_X: result += ' $' + value2 + ',X'; break
      case ADDR_MODE.ZP_Y: result += ' $' + value2 + ',Y'; break
      case ADDR_MODE.ABS: result += ' $' + value4; break
      case ADDR_MODE.ABS_X: result += ' $' + value4 + ',X'; break
      case ADDR_MODE.ABS_Y: result += ' $' + value4 + ',Y'; break
      case ADDR_MODE.IND_X:
        result += ' ($' + (opcode.name === 'JMP' ? value4 : value2) + ',X)'
        break
      case ADDR_MODE.IND_Y: result += ' ($' + value2 + '),Y'; break
      case ADDR_MODE.IND:
        result += ' ($' + (opcode.name === 'JMP' ? value4 : value2) + ')'
        break
    }
  } else {
    result = toHex(bp.address, 4)
  }
  if (bp.watchpoint) {
    if (bp.memset) result += ' write'
    if (bp.memget) result += ' read'
  } else {
    if (bp.hitcount > 1) {
      result += ` hit=${bp.hitcount}`
    }
    if (bp.expression) {
      result += ` (${bp.expression.replace(/ /g, '')})`
    }
  }
  return result
}

export const convertBreakpointExpression = (expression: string) => {
  let expr = expression.toUpperCase()
  // Convert Apple II #$12 to 0x12
  expr = expr.replace(/#\$/g, "0x")
  // #12 is just a decimal-based integer, so delete the #
  expr = expr.replace(/#/g, "")
  // Assume any other $1234 is a memory address, so get the value
  expr = expr.replace(/\$([0-9A-F]+)/g, "memGet(0x$1)")
  return expr
}

const verifyMemGets = (expression: string) => {
  // Create a regular expression that matches memGet(*) where * is any number
  const regex = /memGet\(0x([0-9A-F]+)\)/g;
  // Find all matches in the expression
  const matches = [...expression.matchAll(regex)];
  // Iterate over the matches and check if the number is less than 65536
  for (const match of matches) {
    const number = parseInt(match[1], 16);
    if (number > 65535) {
      return false
    }
  }
  return true
}

export const checkBreakpointExpression = (expression: string) => {
  // Make these all negative so boolean expressions (e.g. A == 0 && X == 1)
  // won't accidently short circuit and look like valid expressions.
  if (expression.trim() === '') return ''
  const A = -1, X = -2, Y = -3, S = -4, P = -5
  const memGet = (addr: number) => {return -addr}
  try {
    expression = convertBreakpointExpression(expression)
    if (!verifyMemGets(expression)) {
      return "Memory address out of range"
    }
    const type = typeof eval(expression)
    // This is a hack to avoid TypeScript errors about undefined variables
    // for the A, X, Y, S, P, and memGet functions
    if (type === 'bigint') return (A + X + Y + S + P + memGet(1)).toString()
    const goodExpression = typeof eval(expression) === 'boolean'
    return goodExpression ? '' : "Expression must evaluate to true or false"
  } catch (e) {
    return "Syntax error in expression"
  }
}

export class Breakpoint {
  address: number;
  watchpoint: boolean;
  instruction: boolean;
  disabled: boolean;
  hidden: boolean;
  once: boolean;
  memget: boolean;
  memset: boolean;
  expression: string;
  hexvalue: number;
  hitcount: number;
  nhits: number;
  memoryBank: string;

  constructor() {
    this.address = 0
    this.watchpoint = false
    this.instruction = false
    this.disabled = false
    this.hidden = false
    this.once = false
    this.memget = false
    this.memset = true
    this.expression = ''
    this.hexvalue = -1
    this.hitcount = 1
    this.nhits = 0
    this.memoryBank = ''
  }
}

export class BreakpointMap extends Map<number, Breakpoint> {
  set(key: number, value: Breakpoint): this {
    // Your custom logic here
    // For example, you might want to sort the keys each time you set a new entry:
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
