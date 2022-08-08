import { s6502, pcodes, MODE, isRelativeInstr,
  address, stack } from "./instructions"
import { bank0, memGet } from "./memory"

// export const toBinary = (value: number, ndigits = 8) => {
//   return ("0000000000000000" + value.toString(2)).slice(-ndigits)
// }

export const toHex = (value: number, ndigits = 2) => {
  if (value > 0xFF) {
    ndigits = 4
  }
  return ("0000" + value.toString(16).toUpperCase()).slice(-ndigits)
}

const getPStatusString = () => {
  const result = ((s6502.PStatus & 0x80) ? 'N' : 'n') +
    ((s6502.PStatus & 0x40) ? 'V' : 'v') +
    '-' +
    ((s6502.PStatus & 0x10) ? 'B' : 'b') +
    ((s6502.PStatus & 0x8) ? 'D' : 'd') +
    ((s6502.PStatus & 0x4) ? 'I' : 'i') +
    ((s6502.PStatus & 0x2) ? 'Z' : 'z') +
    ((s6502.PStatus & 0x1) ? 'C' : 'c')
  return result
}

export const getProcessorStatus = () => {
  return (
    `${toHex(s6502.PC, 4)}-  A=${toHex(s6502.Accum)} X=${toHex(s6502.XReg)} ` +
    `Y=${toHex(s6502.YReg)} P=${getPStatusString()} S=${toHex(s6502.StackPtr)}`
  )
}

const getStack = () => {
  const result = new Array<string>()
  for (let i = 0xFF; i > s6502.StackPtr; i--) {
    let value = "$" + toHex(memGet(0x100 + i))
    let cmd = stack[i]
    if ((stack[i].length > 3) && (i - 1) > s6502.StackPtr) {
      if (stack[i-1] === "JSR" || stack[i-1] === "BRK") {
        i--
        value += toHex(memGet(0x100 + i))
      } else {
        cmd = ''
      }
    }
    value = (value + "   ").substring(0, 6)
    result.push(toHex(0x100 + i, 4) + ": " + value + cmd)
  }
  return result
}

export const getStatus = () => {
  const status = Array<String>(40).fill("")
  const stack = getStack()
  for (let i = 0; i < Math.min(20, stack.length); i++) {
    status[i] = stack[i]
  }
  for (let j = 0; j < 16; j++) {
    let s = "<b>" + toHex(16 * j) + "</b>:"
    for (let i = 0; i < 16; i++) {
      s += " " + toHex(bank0[j * 16 + i])
    }
    status[status.length - 16 + j] = s
  }
  return status.join("<br/>")
}

const modeString = (mode: MODE) => {
  let prefix = ""
  let suffix = ""
  switch (mode) {
    case MODE.IMM:
      prefix = "#"
      break
    case MODE.ZP_X:
    case MODE.ABS_X:
      suffix = ",X"
      break
    case MODE.ZP_Y:
    case MODE.ABS_Y:
      suffix = ",Y"
      break
    case MODE.IND:
      prefix = "("
      suffix = ")"
      break
    case MODE.IND_X:
      prefix = "("
      suffix = ",X)"
      break
    case MODE.IND_Y:
      prefix = "("
      suffix = "),Y"
      break
  }
  return [prefix, suffix]
}

export const getInstrString = (instr: number, vLo: number, vHi: number) => {
  const code = pcodes[instr]
  let result = toHex(instr) + " "
  if (code) {
    let [prefix, suffix] = modeString(code.mode)
    if (code.PC >= 2) {
      prefix = `    ${code.name}   ${prefix}$`
      result += `${toHex(vLo)} `
    }
    if (isRelativeInstr(code.name)) {
      // The extra +2 is for the branch instruction itself
      const addr = s6502.PC + 2 + (vLo > 127 ? vLo - 256 : vLo)
      result += `  ${prefix}${toHex(addr, 4)}${suffix}`
    } else {
      switch (code.PC) {
        case 1:
          result += `         ${code.name}`
          break
        case 2:
          result += `  ${prefix}${toHex(vLo)}${suffix}`
          break
        case 3:
          result += `${toHex(vHi)}${prefix}${toHex(
            address(vLo, vHi),
            4
          )}${suffix}`
          break
      }
    }
  } else {
    result += "         ???"
  }
  return result
}

let zpPrev = new Uint8Array(1)
export const debugZeroPage = () => {
  const zp = bank0.slice(0, 256)
  if (zpPrev.length === 1) zpPrev = zp
  let diff = ""
  for (let i = 0; i < 256; i++) {
    if (zp[i] !== zpPrev[i]) {
      diff += " " + toHex(i) + ":" + toHex(zpPrev[i]) + ">" + toHex(zp[i])
    }
  }
  if (diff !== "") console.log(diff)
  zpPrev = zp
}
