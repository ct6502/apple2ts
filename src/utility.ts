
export enum STATE {
  IDLE,
  NEED_BOOT,
  NEED_RESET,
  IS_RUNNING,
  PAUSED,
}

export enum MODE {
  IMPLIED,  // BRK
  IMM,      // LDA #$01
  ZP_REL,   // LDA $C0 or BCC $FF
  ZP_X,     // LDA $C0,X
  ZP_Y,     // LDX $C0,Y
  ABS,      // LDA $1234
  ABS_X,    // LDA $1234,X
  ABS_Y,    // LDA $1234,Y
  IND_X,    // LDA ($FF,X) or JMP ($1234,X)
  IND_Y,    // LDA ($FF),Y
  IND       // JMP ($1234) or LDA ($C0)
}

// A hack to determine if this is a relative instruction.
export const isRelativeInstr = (instr: string) => instr.startsWith('B') && instr !== "BIT" && instr !== "BRK"

// export const toBinary = (value: number, ndigits = 8) => {
//   return ("0000000000000000" + value.toString(2)).slice(-ndigits)
// }

const address = (vLo: number, vHi: number) => (vHi*256 + vLo)

export const toHex = (value: number, ndigits = 2) => {
  if (value > 0xFF) {
    ndigits = 4
  }
  return ("0000" + value.toString(16).toUpperCase()).slice(-ndigits)
}

const getPStatusString = (P: number) => {
  const result = ((P & 0x80) ? 'N' : 'n') +
    ((P & 0x40) ? 'V' : 'v') +
    '-' +
    ((P & 0x10) ? 'B' : 'b') +
    ((P & 0x8) ? 'D' : 'd') +
    ((P & 0x4) ? 'I' : 'i') +
    ((P & 0x2) ? 'Z' : 'z') +
    ((P & 0x1) ? 'C' : 'c')
  return result
}

export const getProcessorStatus = (s6502: STATE6502) => {
  return (
    `A=${toHex(s6502.Accum)} X=${toHex(s6502.XReg)} ` +
    `Y=${toHex(s6502.YReg)} P=${toHex(s6502.PStatus)} ${getPStatusString(s6502.PStatus)} S=${toHex(s6502.StackPtr)}`
  )
}

const getStack = (s6502: STATE6502, stack: Array<string>, stackvalues: Uint8Array) => {
  const result = new Array<string>()
  for (let i = 0xFF; i > s6502.StackPtr; i--) {
    let value = "$" + toHex(stackvalues[i])
    let cmd = stack[i]
    if ((stack[i].length > 3) && (i - 1) > s6502.StackPtr) {
      if (stack[i-1] === "JSR" || stack[i-1] === "BRK") {
        i--
        value += toHex(stackvalues[i])
      } else {
        cmd = ''
      }
    }
    value = (value + "   ").substring(0, 6)
    result.push(toHex(0x100 + i, 4) + ": " + value + cmd)
  }
  return result
}

export const getStatus = (s6502: STATE6502, stack: Array<string>, mem: Uint8Array) => {
  const status = Array<String>(40).fill("")
  const stackString = getStack(s6502, stack, mem.slice(256, 512))
  for (let i = 0; i < Math.min(20, stackString.length); i++) {
    status[i] = stackString[i]
  }
  for (let j = 0; j < 16; j++) {
    let s = "<b>" + toHex(16 * j) + "</b>:"
    for (let i = 0; i < 16; i++) {
      s += " " + toHex(mem[j * 16 + i])
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

export const getInstrString = (code: PCodeInstr, vLo: number, vHi: number, PC: number) => {
  let result = `${toHex(PC,4)}`
  if (code) {
    let [prefix, suffix] = modeString(code.mode)
    if (code.PC >= 2) {
      prefix = `   ${code.name}   ${prefix}$`
    }
    if (isRelativeInstr(code.name)) {
      // The extra +2 is for the branch instruction itself
      const addr = PC + 2 + (vLo > 127 ? vLo - 256 : vLo)
      result += `${prefix}${toHex(addr, 4)}${suffix}`
    } else {
      switch (code.PC) {
        case 1:
          result += `   ${code.name}`
          break
        case 2:
          result += `${prefix}${toHex(vLo)}${suffix}`
          break
        case 3:
          result += `${prefix}${toHex(address(vLo, vHi),4)}${suffix}`
          break
      }
    }
  } else {
    result += "         ???"
  }
  return result
}

export const getPrintableChar = (value: number, isAltCharSet: boolean) => {
  let v1 = value
  if (isAltCharSet) {
    if ((v1 >= 0 && v1 <= 31) || (v1 >= 64 && v1 <= 95)) {
      v1 += 64
    } else if (v1 >= 128 && v1 <= 159) {
      v1 -= 64
    } else if (v1 >= 160) {
      v1 -= 128
    }
  } else {
    // Shift Ctrl chars and second ASCII's into correct ASCII range
    if ((v1 >= 0 && v1 <= 0x1f) || (v1 >= 0x60 && v1 <= 0x9f)) {
      v1 += 64
    }
    v1 &= 0b01111111
  }
  return v1
}

let zpPrev = new Uint8Array(1)
export const debugZeroPage = (zp: Uint8Array) => {
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

export const toASCII = (s: String) => s.split('').map(char => char.charCodeAt(0))
export const uint16toBytes = (n: number) => [n & 0xFF, (n >>> 8) & 0xFF]
export const uint32toBytes = (n: number) => [n & 0xFF, (n >>> 8) & 0xFF,
  (n >>> 16) & 0xFF, (n >>> 24) & 0xFF]
