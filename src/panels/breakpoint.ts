interface IBreakpoint {
  address: number
  disabled: boolean
  hidden: boolean
  once: boolean
  expression: string
  hitcount: number
  nhits: number
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

export const checkBreakpointExpression = (expression: string) => {
  // Make these all negative so boolean expressions (e.g. A == 0 && X == 1)
  // won't accidently short circuit and look like valid expressions.
  const A = -1, X = -2, Y = -3, S = -4, P = -5
  const memGet = (addr: number) => {return -addr}
  try {
    expression = convertBreakpointExpression(expression)
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
  disabled: boolean;
  hidden: boolean;
  once: boolean;
  expression: string;
  hitcount: number;
  nhits: number;

  constructor() {
    this.address = 0
    this.disabled = false
    this.hidden = false
    this.once = false
    this.expression = ''
    this.hitcount = 0
    this.nhits = 0
  }
}

export type Breakpoints = Map<number, Breakpoint>
