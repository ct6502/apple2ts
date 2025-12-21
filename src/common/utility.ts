import { KeyboardEvent } from "react"

export const TEST_DEBUG = false
export const TEST_GRAPHICS = false
export const MAX_SNAPSHOTS = 30
const FILE_OPEN_SUFFIXES = ".a2ts,.bin,.a,.bas"
const FLOPPY_DISK_SUFFIXES = ".dsk,.woz,.do"
const HARD_DRIVE_SUFFIXES = ".2mg,.hdv,.po"
export const FILE_SUFFIXES_DISK = `${FLOPPY_DISK_SUFFIXES},${HARD_DRIVE_SUFFIXES}`
export const FILE_SUFFIXES_ALL = `${FILE_OPEN_SUFFIXES},${FILE_SUFFIXES_DISK}`
export const MAX_DRIVES = 4
export const DISK_CONVERSION_SUFFIXES = new Map<string, string>([[".dsk", ".woz"]])

// Put memory offset constants here so we can use them in the worker and main thread.
// We used to have these in the memory.ts file, but when we imported that into
// the main thread, it also created an unnecessary memory buffer array.
export const ROMpage = 0x100
export const RamWorksPage = 0x17F
export const ROMmemoryStart = 256 * ROMpage
export const RamWorksMemoryStart = 256 * RamWorksPage

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
  SHOW_APPLE_MOUSE,
  MBOARD_SOUND,
  COMM_DATA,
  MIDI_DATA,
  ENHANCED_MIDI,
  REQUEST_THUMBNAIL,
  SOFTSWITCH_DESCRIPTIONS,
  INSTRUCTIONS,
}

export enum MSG_MAIN {
  RUN_MODE,
  STATE6502,
  DEBUG,
  GAME_MODE,
  SHOW_DEBUG_TAB,
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
  KEYRELEASE,
  MOUSEEVENT,
  PASTE_TEXT,
  APPLE_PRESS,
  APPLE_RELEASE,
  GET_SAVE_STATE,
  GET_SAVE_STATE_SNAPSHOTS,
  DRIVE_PROPS,
  DRIVE_NEW_DATA,
  GAMEPAD,
  SET_BINARY_BLOCK,
  SET_CYCLECOUNT,
  SET_MEMORY,
  COMM_DATA,
  MIDI_DATA,
  RAMWORKS,
  MACHINE_NAME,
  SOFTSWITCHES,
}

export enum COLOR_MODE {
  COLOR,
  NOFRINGE,
  GREEN,
  AMBER,
  BLACKANDWHITE,
  INVERSEBLACKANDWHITE
}

export enum ARROW {
  LEFT,
  RIGHT,
  UP,
  DOWN
}

export enum UI_THEME {
  CLASSIC,
  DARK,
  MINIMAL
}

export const themeToName = (theme: UI_THEME) => {
  return [
    "Classic",
    "Dark",
    "Minimal"][theme]
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
  return ["Color", "Color (no fringe)", "Green", "Amber", "Black and White", "Black and White (inverse)"][mode]
}

export const nameToColorMode = (name: string) => {
  switch (name) {
    case "Color (no fringe)": return COLOR_MODE.NOFRINGE
    case "Green": return COLOR_MODE.GREEN
    case "Amber": return COLOR_MODE.AMBER
    case "Black and White": return COLOR_MODE.BLACKANDWHITE
    case "Black and White (inverse)": return COLOR_MODE.INVERSEBLACKANDWHITE
    default: return COLOR_MODE.COLOR
  }
}

export enum DRIVE {
  MOTOR_OFF,
  MOTOR_ON,
  TRACK_END,
  TRACK_SEEK,
}

export enum CLOUD_SYNC {
  INACTIVE,
  ACTIVE,
  PENDING,
  INPROGRESS,
  FAILED
}

export enum DISASSEMBLE_VISIBLE {
  RESET,
  ADDRESS,
  CURRENT_PC
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
export const isBranchInstruction = (instr: string) => instr.startsWith("B") && instr !== "BIT" && instr !== "BRK"

// export const toBinary = (value: number, ndigits = 8) => {
//   return ("0000000000000000" + value.toString(2)).slice(-ndigits)
// }

export const toHex = (value: number, ndigits = 2) => {
  if (value > 0xFF) {
    ndigits = 4
  }
  return ("0000" + value.toString(16).toUpperCase()).slice(-ndigits)
}

export const convertAppleKey = (e: KeyboardEvent, uppercase: boolean,
  ctrlKeyMode: number, cout: number) => {
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
      Backspace: 0x7F,  // Apple II Delete (rubout) key
      ArrowUp: 11,
      ArrowDown: 10,
      Escape: 27,
      Tab: 9,
      Shift: -1,
      Control: -1
    }
    // The default behavior for the "delete" key on the Apple II is to send
    // a rubout. This is expected by Appleworks, A2osX, and A2DeskTop.
    // However, if we are using the default COUT routine then send a backspace
    // character instead of rubout. This will work better in Applesoft BASIC.
    // Since there may be cases where this is wrong, if the shift key is down
    // then still send the rubout character.
    // If this is still a problem, we may need to add a settings option,
    // but I'm hoping to avoid that.
    if (e.key === "Backspace" && cout === 0xFD1B && !e.shiftKey) {
      key = 8
    } else if (e.key in keymap) {
      key = keymap[e.key]
    }
  }
  return key
}

export const convertTextPageValueToASCII = (value: number, isAltCharSet: boolean, hasMouseText: boolean) => {
  let v1 = value
  if (v1 >= 0 && v1 <= 31) {
    // Shift Ctrl chars into ASCII A-Z range
    // They will be displayed as inverse
    v1 += 64
  } else if (v1 >= 160) {
    // Normal text, just strip the high bit to convert to standard ASCII range
    v1 &= 0b01111111
  } else if (isAltCharSet) {
    if (hasMouseText && v1 >= 64 && v1 <= 95) {
      // Shift Mousetext chars into extended ASCII range.
      // (These are flashing chars in the normal char set.)
      v1 += 64
    } else if (v1 >= 128) {
      // 128...159 need to be shifted down to their ASCII display value.
      v1 -= 64
    }
    // 32...63 are unchanged and will be displayed as inverse.
    // 96...127 are unchanged and will be displayed as inverse.
  } else {
    // 32...95 are displayed as their actual ASCII values but will be either
    // inverse (32-63) or flashing (64-95).
    // 96...127 need to be shifted down to their ASCII display value and
    // will be displayed as flashing.
    // 128...159 also need to be shifted down to their ASCII display value
    // but will be displayed as normal.
    if (v1 >= 96) {
      v1 -= 64
    }
  }
  return String.fromCodePoint(v1 === 0x83 ? 0xEBE7 : (v1 >= 127 ? (0xE000 + v1) : v1))
}

const zpPrev = new Uint8Array(256).fill(0)

export const debugZeroPage = (zp: Uint8Array) => {
  let diff = ""
  for (let i = 0; i < 256; i++) {
    if (zp[i] !== zpPrev[i]) {
      diff += " " + toHex(i) + ":" + toHex(zpPrev[i]) + ">" + toHex(zp[i])
      zpPrev[i] = zp[i]
    }
  }
  if (diff !== "") console.log(diff)
}

export const toASCII = (s: string) => s.split("").map(char => char.charCodeAt(0))
export const uint16toBytes = (n: number) => [n & 0xFF, (n >>> 8) & 0xFF]
export const uint32toBytes = (n: number) => [n & 0xFF, (n >>> 8) & 0xFF,
  (n >>> 16) & 0xFF, (n >>> 24) & 0xFF]

export const replaceSuffix = (fname: string, suffix: string) => {
  const i = fname.lastIndexOf(".") + 1
  return fname.substring(0, i) + suffix
}

const crcTable = new Uint32Array(256).fill(0)

const makeCRCTable = () => {
  let c
  for (let n =0; n < 256; n++) {
    c = n
    for (let k =0; k < 8; k++) {
      c = ((c&1) ? (0xEDB88320 ^ (c >>> 1)) : (c >>> 1))
    }
    crcTable[n] = c
  }
}

export const crc32 = (data: Uint8Array, offset = 0) => {
  if (crcTable[255] === 0) {
    makeCRCTable()
  }
  let crc = 0 ^ (-1)
  for (let i = offset; i < data.length; i++) {
    crc = (crc >>> 8) ^ crcTable[(crc ^ data[i]) & 0xFF]
  }

  return (crc ^ (-1)) >>> 0
}

export const lockedKeyStyle = (mode: number) => {
  return `push-button key-button ${(["", "button-active", "button-locked"])[mode]}`
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


let machineSymbolTable = new Map<number, string>()
let machineName_cached = ""
let fetchingTable = false
let userSymbolTable = new Map<number, string>()


const processSymbolData = (text: string) => {
  const lines = text.split("\n")
  const symbolMap = new Map<number, string>()

  lines.forEach(line => {
    const trimmedLine = line.trim()
    // Skip empty lines or lines that start with a semicolon after trimming
    if (trimmedLine === "" || trimmedLine.startsWith(";")) {
      return
    }
    // Split the line into address and symbol
    const parts = trimmedLine.split(/\s+/)
    if (parts.length >= 2) {
      const address = parseInt(parts[0], 16)
      const symbol = parts[1]
      symbolMap.set(address, symbol)
    }
  })

  return symbolMap
}

const fetchAndProcessSymbolFile = async (url: string): Promise<Map<number, string>> => {
  const response = await fetch(url)
  const text = await response.text()
  return processSymbolData(text)
}

const loadAndProcessSymbolFile = async (file: File) => {
  const fileread = new FileReader()
  fileread.onload = function (ev) {
    if (ev.target) {
      const result = processSymbolData(ev.target.result as string)
      if (result.size === 0) {
        console.error("No symbols found in file")
      }
      userSymbolTable = result
    } else {
      console.error("File read error")
    }
  }
  fileread.onerror = function () {
    console.error("File read error")
  }
  fileread.readAsText(file)
}


export const loadUserSymbolTable = (file: File) => {
  userSymbolTable = new Map<number, string>()
  loadAndProcessSymbolFile(file)
}
// KNOWN GOOD POINT


export const getSymbolTables = (machineName: string) => {

  if (machineName_cached !== machineName) {
    machineSymbolTable = new Map<number, string>()
    machineName_cached = machineName
  }

  if (machineSymbolTable.size === 0 && !fetchingTable) {
    fetchingTable = true
    const url = "/symbol_tables/" + machineName.toLowerCase() + ".sym"
    fetchAndProcessSymbolFile(url).then(symbolMap => {
      machineSymbolTable = symbolMap
      fetchingTable = false
    }).catch(error => {
      console.error("Error fetching or processing the symbol file:", error)
    })
  }

  return [machineSymbolTable, userSymbolTable]
}

export const isHardDriveImage = (filename: string) => {
  const f = filename.toLowerCase()
  return f.endsWith(".hdv") || f.endsWith(".po") || f.endsWith(".2mg")
}

