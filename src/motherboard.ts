import {
  s6502,
  set6502State,
  setAccum,
  setXregister,
  setYregister,
  setPStatus,
  setSP,
  setPC,
  pcodes,
  MODE,
  isRelativeInstr,
  address,
  incrementPC,
  getStack,
  getPStatusString,
} from "./instructions"
import { romBase64 } from "./roms/rom_2e"
import { slot_disk2 } from "./roms/slot_disk2_cx00"
// import { slot_omni } from "./roms/slot_omni_cx00"
import { Buffer } from "buffer"
import { popKey } from "./keyboard"
import { clickSpeaker } from "./speaker"
import { resetJoystick, checkJoystickValues } from "./joystick"
import {
  handleDriveSoftSwitches,
  doResetDrive,
  doPauseDrive,
} from "./diskdrive"

// Bank2 of $D000-$DFFF is stored in bank0/1 at 0xD000-0xDFFF
// Bank1 of $D000-$DFFF is stored in bank0/1 at 0xC000-0xCFFF
export let bank0 = new Uint8Array(65536)
export let bank1 = new Uint8Array(65536)
export let memC000 = new Uint8Array(256)
const empty = new Uint8Array(256).fill(255)
let slots = [
  empty,
  empty, // Buffer.from(slot_omni.replaceAll("\n", ""), "base64"),
  empty,
  empty,
  empty,
  Buffer.from(slot_disk2.replaceAll("\n", ""), "base64"),
  empty,
]

export enum STATE {
  IDLE,
  NEED_BOOT,
  NEED_RESET,
  IS_RUNNING,
  PAUSED,
}

// let prevMemory = Buffer.from(bank0)

export const getApple2State = () => {
  const softSwitches: { [name: string]: boolean } = {}
  for (const key in SWITCHES) {
    softSwitches[key] = SWITCHES[key as keyof typeof SWITCHES].isSet
  }
  const memory = Buffer.from(bank0)
  // let memdiff: { [addr: number]: number } = {};
  // for (let i = 0; i < memory.length; i++) {
  //   if (prevMemory[i] !== memory[i]) {
  //     memdiff[i] = memory[i]
  //   }
  // }
  // prevMemory = memory
  return {
    s6502: s6502,
    softSwitches: softSwitches,
    memory: memory.toString("base64"),
    memc000: Buffer.from(memC000).toString("base64"),
  }
}

export const setApple2State = (newState: any) => {
  set6502State(newState.s6502)
  const softSwitches: { [name: string]: boolean } = newState.softSwitches
  for (const key in softSwitches) {
    const keyTyped = key as keyof typeof SWITCHES
    SWITCHES[keyTyped].isSet = softSwitches[key]
  }
  bank0 = Buffer.from(newState.memory, "base64")
  memC000 = Buffer.from(newState.memc000, "base64")
}

let cycleCount = 0

export let DEBUG_ADDRESS = -1 // 0xBFB6
let doDebug = false
let doDebugZeroPage = false

export const doReset = () => {
  setAccum(0)
  setXregister(0)
  setYregister(0)
  setPStatus(0b00100100)
  setSP(0xFF)
  memC000.fill(0)
  for (const key in SWITCHES) {
    const keyTyped = key as keyof typeof SWITCHES
    SWITCHES[keyTyped].isSet = false
  }
  SWITCHES.TEXT.isSet = true
  handleBankedRAM(0xC082)
  setPC(memGet(0xFFFD) * 256 + memGet(0xFFFC))
  doResetDrive()
}

export const doPause = (resume = false) => {
  doPauseDrive(resume)
}

const rom = new Uint8Array(
  Buffer.from(romBase64.replaceAll("\n", ""), "base64")
)

export const doBoot6502 = () => {
  bank0.fill(0xFF)
  bank1.fill(0xFF)
  doReset()
}

type tSetFunc = ((addr: number) => void) | null

type softSwitch = {
  offAddr: number
  onAddr: number
  isSetAddr: number
  writeOnly: boolean
  isSet: boolean
  setFunc: tSetFunc
}
const NewSwitch = (offAddr: number, isSetAddr: number,
  writeOnly = false,
  setFunc: tSetFunc = null): softSwitch => {
  return {
    offAddr: offAddr,
    onAddr: offAddr + 1,
    isSetAddr: isSetAddr,
    writeOnly: writeOnly,
    isSet: false,
    setFunc: setFunc,
  }
}
const SLOT6 = 0x60

const rand = () => Math.floor(256 * Math.random())

const handleBankedRAM = (addr: number) => {
  // Only keep bits 0, 1, 3 of the 0xC08* number
  addr &= 0b1011
  const BSRBANK2 = (addr <= 3)
  const BSRREADRAM = [0, 3, 8, 0x0B].includes(addr)
  // Set soft switches for reading the bank-switched RAM status
  memC000[0x11] = BSRBANK2 ? 0x8D : 0x0D
  memC000[0x12] = BSRREADRAM ? 0x8D : 0x0D
  SWITCHES.READBSR2.isSet = addr === 0
  SWITCHES.WRITEBSR2.isSet = addr === 1
  SWITCHES.OFFBSR2.isSet = addr === 2
  SWITCHES.RDWRBSR2.isSet = addr === 3
  SWITCHES.READBSR1.isSet = addr === 8
  SWITCHES.WRITEBSR1.isSet = addr === 9
  SWITCHES.OFFBSR1.isSet = addr === 0x0A
  SWITCHES.RDWRBSR1.isSet = addr === 0x0B
}

export const SWITCHES = {
  STORE80: NewSwitch(0xC000, 0xC018, true),
  RAMRD: NewSwitch(0xC002, 0xC013, true),
  RAMWRT: NewSwitch(0xC004, 0xC014, true),
  INTCXROM: NewSwitch(0xC006, 0xC015, true),
  ALTZP: NewSwitch(0xC008, 0xC016, true),
  SLOTC3ROM: NewSwitch(0xC00A, 0xC017, true),
  COLUMN80: NewSwitch(0xC00C, 0xC01F, true),
  ALTCHARSET: NewSwitch(0xC00E, 0xC01E, true),
  KBRDSTROBE: NewSwitch(0xC010, 0, false, () => {
    memC000[0] &= 0b01111111
    popKey()
  }),
  BSRBANK2: NewSwitch(0, 0xC011),    // status location, not a switch
  BSRREADRAM: NewSwitch(0, 0xC012),  // status location, not a switch
  CASSETTE: NewSwitch(0xC020, 0, false, () => {
    memC000[0x20] = rand()
  }),
  SPEAKER: NewSwitch(0xC030, 0, false, () => {
    memC000[0x30] = rand()
    clickSpeaker(cycleCount)
  }),
  TEXT: NewSwitch(0xC050, 0xC01A),
  MIXED: NewSwitch(0xC052, 0xC01B),
  PAGE2: NewSwitch(0xC054, 0xC01C),
  HIRES: NewSwitch(0xC056, 0xC01D),
  AN0: NewSwitch(0xC058, 0),
  AN1: NewSwitch(0xC05A, 0),
  AN2: NewSwitch(0xC05C, 0),
  AN3: NewSwitch(0xC05E, 0),
  PB0: NewSwitch(0, 0xC061),  // status location, not a switch
  PB1: NewSwitch(0, 0xC062),  // status location, not a switch
  PB2: NewSwitch(0, 0xC063),  // status location, not a switch
  JOYSTICK12: NewSwitch(0xC064, 0, false, () => {
    checkJoystickValues(cycleCount)
  }),
  JOYSTICKRESET: NewSwitch(0xC070, 0, false, () => {
    resetJoystick(cycleCount)
  }),
  READBSR2: NewSwitch(0xC080, 0, false, (addr) => {handleBankedRAM(addr)}),
  WRITEBSR2: NewSwitch(0xC081, 0, false, (addr) => {handleBankedRAM(addr)}),
  OFFBSR2: NewSwitch(0xC082, 0, false, (addr) => {handleBankedRAM(addr)}),
  RDWRBSR2: NewSwitch(0xC083, 0, false, (addr) => {handleBankedRAM(addr)}),
  READBSR1: NewSwitch(0xC088, 0, false, (addr) => {handleBankedRAM(addr)}),
  WRITEBSR1: NewSwitch(0xC089, 0, false, (addr) => {handleBankedRAM(addr)}),
  OFFBSR1: NewSwitch(0xC08A, 0, false, (addr) => {handleBankedRAM(addr)}),
  RDWRBSR1: NewSwitch(0xC08B, 0, false, (addr) => {handleBankedRAM(addr)}),
  DRVSM0: NewSwitch(0xC080 + SLOT6, 0),
  DRVSM1: NewSwitch(0xC082 + SLOT6, 0),
  DRVSM2: NewSwitch(0xC084 + SLOT6, 0),
  DRVSM3: NewSwitch(0xC086 + SLOT6, 0),
  DRIVE: NewSwitch(0xC088 + SLOT6, 0),
  DRVSEL: NewSwitch(0xC08A + SLOT6, 0),
  DRVDATA: NewSwitch(0xC08C + SLOT6, 0),
  DRVWRITE: NewSwitch(0xC08E + SLOT6, 0),
}

const checkSoftSwitches = (addr: number, calledFromMemSet: boolean) => {
  for (const [, sswitch] of Object.entries(SWITCHES)) {
    if (addr === sswitch.offAddr || addr === sswitch.onAddr) {
      // Set switch if both true (memSet and writeOnly) or both false
      if (calledFromMemSet === sswitch.writeOnly) {
        if (sswitch.setFunc) {
          sswitch.setFunc(addr)
          } else {
          sswitch.isSet = addr === sswitch.onAddr
          if (sswitch.isSetAddr > 0) {
            memC000[sswitch.isSetAddr - 0xC000] = sswitch.isSet ? 0x8D : 0x0D
          }
        }
      }
      return
    }
    if (addr === sswitch.isSetAddr) {
      return
    }
  }
  console.error("Unknown softswitch " + toHex(addr))
}

const memGetSoftSwitch = (addr: number): number => {
  checkSoftSwitches(addr, false)
  if (addr >= SWITCHES.DRVSM0.offAddr && addr <= SWITCHES.DRVWRITE.onAddr) {
    return handleDriveSoftSwitches(addr, -1, cycleCount)
  }
  return memC000[addr - 0xC000]
}

const memGetBankC000 = (addr: number): number => {
  const isSlot3 = addr >= 0xC300 && addr <= 0xC3FF
  if (SWITCHES.INTCXROM.isSet || (isSlot3 && !SWITCHES.SLOTC3ROM.isSet)) {
    return rom[addr - 0xC000]
  }
  // TODO: This should return the card's ROM, not regular ROM.
  if (addr >= 0xC800) {
    return rom[addr - 0xC000]
  }
  const slot = Math.floor((addr - 0xC100) / 256)
  return slots[slot][addr - 0xC100 - 256 * slot]
}

export const memGet = (addr: number): number => {
  if (addr >= 0xC000 && addr <= 0xC0FF) {
    return memGetSoftSwitch(addr)
  }
  if (addr >= 0xC100 && addr <= 0xCFFF) {
    return memGetBankC000(addr)
  }
  // TODO: This should return either ROM or banked memory.
  if (addr >= 0xD000) {
    if (memC000[0x12] < 0x80) {
      return rom[addr - 0xC000]
    }
    // Bank1 of $D000-$DFFF is stored in $C000, so adjust address if necessary
    if (addr <= 0xDFFF && memC000[0x11] < 0x80) {
      addr -= 0x1000
    }
  }
  if (addr <= 0x1FF || addr >= 0xC000) {
    return (SWITCHES.ALTZP.isSet ? bank1[addr] : bank0[addr])
  }
  return (SWITCHES.RAMRD.isSet ? bank1[addr] : bank0[addr])
}

export const memSet = (addr: number, value: number) => {
  if (addr >= 0xC000 && addr <= 0xC0FF) {
    checkSoftSwitches(addr, false)
    if (addr >= SWITCHES.DRVSM0.offAddr && addr <= SWITCHES.DRVWRITE.onAddr) {
      handleDriveSoftSwitches(addr, value, cycleCount)
    }
    checkSoftSwitches(addr, true)
    return
  }
  if (addr >= 0xC100 && addr <= 0xCFFF) {
    return
  }

  if (addr >= 0xD000) {
    const writeRAM = SWITCHES.WRITEBSR1.isSet || SWITCHES.WRITEBSR2.isSet ||
      SWITCHES.RDWRBSR1.isSet || SWITCHES.RDWRBSR2.isSet
    if (!writeRAM) {
      return
    }
    // Bank1 of $D000-$DFFF is stored in $C000, so adjust address if necessary
    if (addr <= 0xDFFF && memC000[0x11] < 0x80) {
      addr -= 0x1000
    }
  }

  if (addr <= 0x1FF || addr >= 0xC000) {
    if (SWITCHES.ALTZP.isSet) {
      bank1[addr] = value
    } else {
      bank0[addr] = value
    }
  } else {
    if (SWITCHES.RAMWRT.isSet) {
      bank1[addr] = value
    } else {
      bank0[addr] = value
    }
  }
}

export const toBinary = (value: number, ndigits = 8) => {
  return ("0000000000000000" + value.toString(2)).slice(-ndigits)
}

export const toHex = (value: number, ndigits = 2) => {
  if (value > 0xFF) {
    ndigits = 4
  }
  return ("0000" + value.toString(16).toUpperCase()).slice(-ndigits)
}

export const getProcessorStatus = () => {
  return (
    `${toHex(s6502.PC, 4)}-  A=${toHex(s6502.Accum)} X=${toHex(s6502.XReg)} ` +
    `Y=${toHex(s6502.YReg)} P=${getPStatusString()} S=${toHex(s6502.StackPtr)}`
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

const TEXT_PAGE1 = 0x400
const TEXT_PAGE2 = 0x800
const offset = [
  0, 0x80, 0x100, 0x180, 0x200, 0x280, 0x300, 0x380, 0x28, 0xA8, 0x128, 0x1A8,
  0x228, 0x2A8, 0x328, 0x3A8, 0x50, 0xD0, 0x150, 0x1D0, 0x250, 0x2D0, 0x350,
  0x3D0,
]

export function getTextPage(textPage2: boolean) {
  const textPage = new Uint8Array(960)
  for (let j = 0; j < 24; j++) {
    let start = (textPage2 ? TEXT_PAGE2 : TEXT_PAGE1) + offset[j]
    textPage.set(bank0.slice(start, start + 40), j * 40)
  }
  return textPage
}

export function getHGR(page2: boolean) {
  const offset = page2 ? 0x4000 : 0x2000
  const hgrPage = new Uint8Array(40 * 192)
  for (let j = 0; j < 192; j++) {
    const addr =
      offset +
      40 * Math.trunc(j / 64) +
      1024 * (j % 8) +
      128 * (Math.trunc(j / 8) & 7)
    hgrPage.set(bank0.slice(addr, addr + 40), j * 40)
  }
  return hgrPage
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

let zpPrev = new Uint8Array(1)
const debugZeroPage = () => {
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

export const processInstruction = () => {
  let cycles = 0
  const PC1 = s6502.PC
  const instr = memGet(s6502.PC)
  const vLo = s6502.PC < 0xFFFF ? memGet(s6502.PC + 1) : 0
  const vHi = s6502.PC < 0xFFFE ? memGet(s6502.PC + 2) : 0
  const code = pcodes[instr]
  if (code) {
    if (PC1 === DEBUG_ADDRESS) {
      doDebug = true
    }
    // Do not output during the Apple II's WAIT subroutine
    if (doDebug && (PC1 < 0xFCA8 || PC1 > 0xFCB3)) {
      const out = `${getProcessorStatus()}  ${getInstrString(instr, vLo, vHi)}`
      console.log(out)
      if (doDebugZeroPage) {
        debugZeroPage()
      }
    }
    cycles = code.execute(vLo, vHi)
    if (!(s6502.Accum >= 0 && s6502.Accum <= 255)) {
      const a = s6502.Accum
      console.error("out of bounds, accum = " + a)
    }
    cycleCount += cycles
    incrementPC(code.PC)
  } else {
    console.error("Missing instruction: $" + toHex(instr) + " PC=" + toHex(s6502.PC, 4))
    cycles = pcodes[0].execute(vLo, vHi)
  }
  return cycles
}
