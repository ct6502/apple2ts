import { KeyboardEvent } from "react"

export enum STATE {
  IDLE,
  NEED_BOOT,
  NEED_RESET,
  RUNNING,
  PAUSED,
}

export enum MSG_WORKER {
  MACHINE_STATE,
  CLICK,
  DRIVE_PROPS,
  DRIVE_SOUND,
  SAVE_STATE,
  RUMBLE,
  HELP_TEXT,
}

export enum MSG_MAIN {
  STATE,
  DEBUG,
  BREAKPOINT,
  STEP_INTO,
  STEP_OVER,
  STEP_OUT,
  SPEED,
  TIME_TRAVEL,
  RESTORE_STATE,
  KEYBUFFER,
  APPLE_PRESS,
  APPLE_RELEASE,
  GET_SAVE_STATE,
  DRIVE_PROPS,
  GAMEPAD,
  SET_BINARY_BLOCK,
}

export enum COLOR_MODE {
  COLOR,
  NOFRINGE,
  GREEN,
  AMBER
}

export enum ARROW {
  LEFT,
  RIGHT,
  UP,
  DOWN
}

export const colorToName = (mode: COLOR_MODE) => {
  return ["Color", "Color (no fringe)", "Green", "Amber"][mode]
}

export const nameToColorMode = (name: string) => {
  switch (name) {
    case "Color (no fringe)": return COLOR_MODE.NOFRINGE
    case "Green": return COLOR_MODE.GREEN
    case "Amber": return COLOR_MODE.AMBER
    default: return COLOR_MODE.COLOR
  }
}

export enum DRIVE {
  REQUEST_AUDIO,
  MOTOR_OFF,
  MOTOR_ON,
  TRACK_END,
  TRACK_SEEK,
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

export const convertAppleKey = (e: KeyboardEvent, uppercase=false) => {
  let key = 0
  if (e.key.length === 1) {
    if (e.metaKey || e.altKey) {
      return 0
    }
    key = e.key.charCodeAt(0)
    if (e.ctrlKey) {
      if (key >= 0x40 && key <= 0x7E) {
        key &= 0b00011111
      } else {
        return 0
      }
    } else if (uppercase) {
      key = e.key.toUpperCase().charCodeAt(0)
    }
  } else {
    const keymap: { [key: string]: number } = {
      Enter: 13,
      ArrowRight: 21,
      ArrowLeft: 8,
      Backspace: 8,
      ArrowUp: 11,
      ArrowDown: 10,
      Escape: 27,
      Tab: 9,
      Shift: -1,
      Control: -1
    };
    if (e.key === "Backspace" && e.shiftKey) {
      key = 0x7F
    } else if (e.key in keymap) {
      key = keymap[e.key]
    }
  }
  return key
};

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

export const replaceSuffix = (fname: String, suffix: String) => {
  const i = fname.lastIndexOf('.') + 1
  return fname.substring(0, i) + suffix
}

let crcTable = new Uint32Array(256).fill(0)

const makeCRCTable = () => {
  let c;
  for (let n =0; n < 256; n++) {
    c = n;
    for (let k =0; k < 8; k++) {
      c = ((c&1) ? (0xEDB88320 ^ (c >>> 1)) : (c >>> 1));
    }
    crcTable[n] = c;
  }
}

export const crc32 = (data: Uint8Array, offset = 0) => {
  if (crcTable[255] === 0) {
    makeCRCTable()
  }
  let crc = 0 ^ (-1);
  for (let i = offset; i < data.length; i++) {
    crc = (crc >>> 8) ^ crcTable[(crc ^ data[i]) & 0xFF];
  }

  return (crc ^ (-1)) >>> 0;
};
