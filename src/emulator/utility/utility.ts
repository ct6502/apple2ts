import { KeyboardEvent } from "react"

export const TEST_DEBUG = true
export const TEST_GRAPHICS = false
export const MAX_SNAPSHOTS = 30
export const FILE_SUFFIXES = ".a2ts,.hdv,.2mg,.dsk,.woz,.po,.do,.bin"

// Put memory offset constants here so we can use them in the worker and main thread.
// We used to have these in the memory.ts file, but when we imported that into
// the main thread, it also created an unnecessary memory buffer array.
export const ROMpage = 0x100
export const RamWorksPage = 0x17F
export const ROMmemoryStart = 256 * ROMpage
export const RamWorksMemoryStart = 256 * RamWorksPage

export const COLORS = {
  LIGHT: {
    TEXT: '#000000',
    BG: '#BFBB98',
    PANEL: '#C9C5A0',
    ACTIVE: '#898677',
    INPUT: '#eee',
    OPCODE: '#000000',
    ADDRESS: '#006400',
    IMMEDIATE: '#646400',
    HIGHLIGHT: '#FFFF00',
  },
  DARK: {
    TEXT: '#DDD',
    BG: '#181818',
    PANEL: '#222',
    ACTIVE: '#555',
    INPUT: '#444',
    OPCODE: '#dcdcaf',
    ADDRESS: '#00C000',
    IMMEDIATE: '#80FF00',
    HIGHLIGHT: '#966C23',
  }
}

export enum RUN_MODE {
  IDLE = 0,
  RUNNING = -1,
  PAUSED = -2,
  NEED_BOOT = -3,
  NEED_RESET = -4,
}

export enum MSG_WORKER {
  MACHINE_STATE,
  CLICK,
  DRIVE_PROPS,
  DRIVE_SOUND,
  SAVE_STATE,
  RUMBLE,
  HELP_TEXT,
  SHOW_MOUSE,
  MBOARD_SOUND,
  COMM_DATA,
  MIDI_DATA,
  REQUEST_THUMBNAIL,
}

export enum MSG_MAIN {
  RUN_MODE,
  STATE6502,
  DEBUG,
  DISASSEMBLE_ADDR,
  BREAKPOINTS,
  STEP_INTO,
  STEP_OVER,
  STEP_OUT,
  SPEED,
  TIME_TRAVEL_STEP,
  TIME_TRAVEL_INDEX,
  TIME_TRAVEL_SNAPSHOT,
  THUMBNAIL_IMAGE,
  RESTORE_STATE,
  KEYPRESS,
  MOUSEEVENT,
  PASTE_TEXT,
  APPLE_PRESS,
  APPLE_RELEASE,
  GET_SAVE_STATE,
  GET_SAVE_STATE_SNAPSHOTS,
  DRIVE_PROPS,
  GAMEPAD,
  SET_BINARY_BLOCK,
  SET_MEMORY,
  COMM_DATA,
  MIDI_DATA,
  RamWorks,
  SOFTSWITCHES,
}

export enum COLOR_MODE {
  COLOR,
  NOFRINGE,
  GREEN,
  AMBER,
  BLACKANDWHITE,
}

export enum ARROW {
  LEFT,
  RIGHT,
  UP,
  DOWN
}

export type MouseEventSimple = {
  x : number; // 0.0 -> 1.0
  y : number; // 0.0 -> 1.0
  //    -1:  on mouse move
  //  0x00:  button 0 up
  //  0x10:  button 0 down
  //  0x01:  button 1 up
  //  0x11:  button 1 down
  buttons : number;
}

export const colorToName = (mode: COLOR_MODE) => {
  return ["Color", "Color (no fringe)", "Green", "Amber", "Black and White"][mode]
}

export const nameToColorMode = (name: string) => {
  switch (name) {
    case "Color (no fringe)": return COLOR_MODE.NOFRINGE
    case "Green": return COLOR_MODE.GREEN
    case "Amber": return COLOR_MODE.AMBER
    case "Black and White": return COLOR_MODE.BLACKANDWHITE
    default: return COLOR_MODE.COLOR
  }
}

export enum DRIVE {
  MOTOR_OFF,
  MOTOR_ON,
  TRACK_END,
  TRACK_SEEK,
}

export enum ADDR_MODE {
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

export const default6502State = (): STATE6502 => {
  return {
    cycleCount: 0,
    PStatus: 0,
    PC: 0,
    Accum: 0,
    XReg: 0,
    YReg: 0,
    StackPtr: 0,
    flagIRQ: 0,
    flagNMI: false
  }
}

// A hack to determine if this is a relative instruction.
export const isBranchInstruction = (instr: string) => instr.startsWith('B') && instr !== "BIT" && instr !== "BRK"

// export const toBinary = (value: number, ndigits = 8) => {
//   return ("0000000000000000" + value.toString(2)).slice(-ndigits)
// }

export const toHex = (value: number, ndigits = 2) => {
  if (value > 0xFF) {
    ndigits = 4
  }
  return ("0000" + value.toString(16).toUpperCase()).slice(-ndigits)
}

export const convertAppleKey = (e: KeyboardEvent, uppercase: boolean, ctrlKeyMode: number) => {
  let key = 0
  if (e.altKey && e.key !== "Alt") {
    e.key = String.fromCharCode(e.keyCode)
  }
  if (e.key.length === 1) {
    key = e.key.charCodeAt(0)
    if (e.ctrlKey || ctrlKeyMode > 0) {
      if (key >= 0x40 && key <= 0x7E) {
        key &= 0b00011111
      } else {
        return 0
      }
    } else if (uppercase) {
      key = String.fromCharCode(key).toUpperCase().charCodeAt(0)
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

export const toASCII = (s: string) => s.split('').map(char => char.charCodeAt(0))
export const uint16toBytes = (n: number) => [n & 0xFF, (n >>> 8) & 0xFF]
export const uint32toBytes = (n: number) => [n & 0xFF, (n >>> 8) & 0xFF,
  (n >>> 16) & 0xFF, (n >>> 24) & 0xFF]

export const replaceSuffix = (fname: string, suffix: string) => {
  const i = fname.lastIndexOf('.') + 1
  return fname.substring(0, i) + suffix
}

const crcTable = new Uint32Array(256).fill(0)

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

export const lockedKeyStyle = (mode: number) => {
  return `push-button key-button ${(['', 'button-active', 'button-locked'])[mode]}`
}

export const hiresLineToAddress = (pageOffset: number, line: number) => {
  return pageOffset + 40 * Math.trunc(line / 64) +
    1024 * (line % 8) + 128 * (Math.trunc(line / 8) & 7)
}

export const hiresAddressToLine = (addr: number) => {
  const base = addr & 0x1FFF
  // This give 0, 1, or 2 for the 3 different regions of the screen.
  // (The Math.min clips the extra 8 screen holes at the end of the 3rd line)
  const groupOf3 = Math.trunc((Math.min(base & 0x7F, 0x77)) / 40)
  // This gives the smaller chunks of 8 lines each within the groups of 8.
  const chunkOf8 = Math.trunc((base & 0x3FF) / 128)
  // This gives the individual lines within each chunk of 8, which oddly
  // enough have the largest address spacing of 0x400 between each line.
  const individualLine = Math.trunc(base / 1024)
  const result = 64 * groupOf3 + 8 * chunkOf8 + individualLine
  return result
}

// for (let i = 0; i < 192; i++) {
//   const addr = hiresLineToAddress(0x2000, i)
//   const line = hiresAddressToLine(addr + 1)
//   if (i !== line) console.log("ERROR")
// }
