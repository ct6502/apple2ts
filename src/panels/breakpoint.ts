import {
  faCircleHalfStroke as iconBreakpointExtra,
  faCircle as iconBreakpointEnabled,
} from "@fortawesome/free-solid-svg-icons";
import {faCircle as iconBreakpointDisabled} from "@fortawesome/free-regular-svg-icons";
import { toHex } from "../emulator/utility/utility"

interface IBreakpoint {
  address: number
  watchpoint: boolean
  disabled: boolean
  hidden: boolean
  once: boolean
  memget: boolean
  memset: boolean
  expression: string
  hitcount: number
  nhits: number
}

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
  return "breakpoint-style" + (bp.watchpoint ? " watch-point" : "")
}

export const getBreakpointString = (bp: Breakpoint) => {
  let result = toHex(bp.address, 4)
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

export class Breakpoint implements IBreakpoint {
  address: number;
  watchpoint: boolean;
  disabled: boolean;
  hidden: boolean;
  once: boolean;
  memget: boolean;
  memset: boolean;
  expression: string;
  hitcount: number;
  nhits: number;

  constructor() {
    this.address = 0
    this.watchpoint = false
    this.disabled = false
    this.hidden = false
    this.once = false
    this.memget = false
    this.memset = true
    this.expression = ''
    this.hitcount = 0
    this.nhits = 0
  }
}

export type Breakpoints = Map<number, Breakpoint>
