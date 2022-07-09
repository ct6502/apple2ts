import { Accum, XReg, YReg, SP,
  setAccum, setXregister, setYregister, setPStatus, setSP, setPC,
  pcodes, PC, MODE, isRelativeInstr,
  address, incrementPC, getStack, getPStatusString } from './instructions'
import { romBase64 } from "./roms/rom_2e";
import { slot_disk2 } from "./roms/slot_disk2_cx00";
import { slot_omni } from "./roms/slot_omni_cx00";
import { Buffer } from "buffer";
import { popKey } from "./keyboard"
import { clickSpeaker } from "./speaker"
import { resetJoystick, checkJoystickValues } from './joystick';
import { handleDriveSoftSwitches, doResetDrive, doPauseDrive } from "./diskdrive"

export let bank0 = new Uint8Array(65536)
const empty = new Uint8Array(256).fill(255)
let slots = [
  empty,
  Buffer.from(slot_omni.replaceAll('\n', ''), 'base64'),
  empty,
  empty,
  empty,
  Buffer.from(slot_disk2.replaceAll('\n', ''), 'base64'),
  empty]

export enum STATE {
  IDLE,
  NEED_BOOT,
  NEED_RESET,
  IS_RUNNING,
  PAUSED
}

let cycleCount = 0;

export let doDebug = false
let doDebugZeroPage = false
export const setDebug = (debug = true) => doDebug = debug;

export const doReset = () => {
  setAccum(0)
  setXregister(0)
  setYregister(0)
  setPStatus(0b00100100)
  setSP(0xFF)
  setPC(bank0[0xFFFD] * 256 + bank0[0xFFFC])
  SWITCHES.TEXT.isSet = true
  doResetDrive()
}

export const doPause = (resume = false) => {
  doPauseDrive(resume)
}

const rom = new Uint8Array(Buffer.from(romBase64.replaceAll('\n', ''), 'base64'))

export const doBoot6502 = () => {
  bank0.fill(0xFF)
  bank0.set(rom, 0xC000)
  doReset()
}

const setINTCXROM = () => {
  if (SWITCHES.INTCXROM.isSet) {
    bank0.set(rom.slice(0x100, 0x800), 0xC100)
  } else {
    for (let slot = 1; slot <= 7; slot++) {
      bank0.set(slots[slot - 1], 0xC000 + 256 * slot)
    }
    setSLOTC3ROM()
  }
}

const setSLOTC3ROM = () => {
  if (SWITCHES.SLOTC3ROM.isSet && !SWITCHES.INTCXROM.isSet) {
    bank0.set(slots[2], 0xC300)
  } else {
    bank0.set(rom.slice(0x300, 0x100), 0xC300)
  }
}

type softSwitch = {
  offAddr: number
  onAddr: number
  isSetAddr: number
  writeOnly: boolean
  isSet: boolean
  setFunc: (cycleCount: number) => void
}
const NewSwitch = (offAddr: number, isSetAddr: number,
  writeOnly = false, setFunc = () => {}): softSwitch => {
  return {offAddr: offAddr, onAddr: offAddr + 1, isSetAddr: isSetAddr,
    writeOnly: writeOnly, isSet: false, setFunc: setFunc}
}
const SLOT6 = 0x60

const rand = () => Math.floor(256*Math.random())

export const SWITCHES = {
  STORE80: NewSwitch(0xC000, 0xC018, true),
  INTCXROM: NewSwitch(0xC006, 0xC015, true, setINTCXROM),
  SLOTC3ROM: NewSwitch(0xC00A, 0xC017, true, setSLOTC3ROM),
  COLUMN80: NewSwitch(0xC00C, 0xC01F, true),
  KBRDSTROBE: NewSwitch(0xC010, 0, false,
    () => {bank0[0xC000] &= 0b01111111; popKey()}),
  CASSETTE: NewSwitch(0xC020, 0, false, () => {
    bank0[0xC020] = rand()}),
  SPEAKER: NewSwitch(0xC030, 0, false,
    () => {bank0[0xC030] = rand(); clickSpeaker(cycleCount)}),
  TEXT: NewSwitch(0xC050, 0xC01A),
  MIXED: NewSwitch(0xC052, 0xC01B),
  PAGE2: NewSwitch(0xC054, 0xC01C),
  HIRES: NewSwitch(0xC056, 0xC01D),
  JOYSTICK12: NewSwitch(0xC064, 0, false,
    () => {checkJoystickValues(cycleCount)}),
  JOYSTICKRESET: NewSwitch(0xC070, 0, false,
    () => {resetJoystick(cycleCount)}),
  DRVSM0: NewSwitch(0xC080 + SLOT6, 0),
  DRVSM1: NewSwitch(0xC082 + SLOT6, 0),
  DRVSM2: NewSwitch(0xC084 + SLOT6, 0),
  DRVSM3: NewSwitch(0xC086 + SLOT6, 0),
  DRIVE: NewSwitch(0xC088 + SLOT6, 0),
  DRVSEL: NewSwitch(0xC08A + SLOT6, 0),
  DRVDATA: NewSwitch(0xC08C + SLOT6, 0),
  DRVWRITE: NewSwitch(0xC08E + SLOT6, 0),
}

const checkSoftSwitches = (addr: number, isMemSet: boolean) => {
  for (const [, sswitch] of Object.entries(SWITCHES)) {
    if (addr === sswitch.offAddr || addr === sswitch.onAddr) {
      if (sswitch.writeOnly === isMemSet) {
        sswitch.isSet = addr === sswitch.onAddr
        if (sswitch.isSetAddr > 0) {
          bank0[sswitch.isSetAddr] = sswitch.isSet ? 0x8D : 0x0D
        }
        sswitch.setFunc(cycleCount)
      }
      return
    }
  }
}

export const memGet = (addr: number, value=-1): number => {
  if (addr >= 0xC000) {
    if (addr >= 0xC080 && addr <= 0xC08F) {
      console.error(`unhandled softswitch $${toHex(addr, 4)}`)
    } else {
      checkSoftSwitches(addr, false)
      if (addr >= SWITCHES.DRVSM0.offAddr && addr <= SWITCHES.DRVWRITE.onAddr) {
        return handleDriveSoftSwitches(addr, value, cycleCount)
      }
    }
  }
  return bank0[addr]
}

export const memSet = (addr: number, value: number) => {
  if (addr >= 0xC000 && addr <= 0xC0FF) {
    memGet(addr, value)
    checkSoftSwitches(addr, true)
  } else if (addr < 0xC000) {
    bank0[addr] = value
  }
}

export const toBinary = (value: number, ndigits=8) => {
  return ('0000000000000000' + value.toString(2)).slice(-ndigits)
}

export const toHex = (value: number, ndigits = 2) => {
  return ('0000' + value.toString(16).toUpperCase()).slice(-ndigits)
}

export const getProcessorStatus = () => {
  return `${toHex(PC,4)}-  A=${toHex(Accum)} X=${toHex(XReg)} ` + 
  `Y=${toHex(YReg)} P=${getPStatusString()} S=${toHex(SP)}`
}

const modeString = (mode: MODE) => {
  let prefix = ''
  let suffix = ''
  switch (mode) {
    case MODE.IMM:
      prefix = '#'
      break
    case MODE.ZP_X:
    case MODE.ABS_X:
      suffix = ",X"
      break;
    case MODE.ZP_Y:
    case MODE.ABS_Y:
      suffix = ",Y"
      break;
    case MODE.IND:
      prefix = '('
      suffix = ")"
      break
    case MODE.IND_X:
      prefix = '('
      suffix = ",X)"
      break
    case MODE.IND_Y:
      prefix = '('
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
      const addr = PC + 2 + ((vLo > 127) ? (vLo - 256) : vLo)
      result += `  ${prefix}${toHex(addr, 4)}${suffix}`
    } else {
      switch (code.PC) {
        case 1:
          result += `         ${code.name}`
          break;
        case 2:
          result += `  ${prefix}${toHex(vLo)}${suffix}`
          break;
        case 3:
          result += `${toHex(vHi)}${prefix}${toHex(address(vLo, vHi), 4)}${suffix}`
          break;
      }
    }
  } else {
    result += "         ???"
  }
  return result
}

const TEXT_PAGE1 = 0x400;
const TEXT_PAGE2 = 0x800;
const offset = [0, 0x80, 0x100, 0x180, 0x200, 0x280, 0x300, 0x380,
  0x28, 0xA8, 0x128, 0x1A8, 0x228, 0x2A8, 0x328, 0x3A8,
  0x50, 0xD0, 0x150, 0x1D0, 0x250, 0x2D0, 0x350, 0x3D0];

export function getTextPage(textPage2: boolean) {
  const textPage = new Uint8Array(960);
  for (let j = 0; j < 24; j++) {
    let start = (textPage2 ? TEXT_PAGE2 : TEXT_PAGE1) + offset[j]
    textPage.set(bank0.slice(start, start + 40), j * 40);
  }
  return textPage;
}

export function getHGR(page2: boolean) {
  const offset = page2 ? 0x4000 : 0x2000
  const hgrPage = new Uint8Array(40 * 192);
  for (let j = 0; j < 192; j++) {
    const addr = offset + 40 * (Math.trunc(j / 64)) +
      1024 * (j % 8) + 128 * (Math.trunc(j / 8) & 7)
    hgrPage.set(bank0.slice(addr, addr + 40), j*40)
  }
  return hgrPage;
}

export const getStatus = () => {
  const status = Array<String>(40).fill('')
  const stack = getStack()
  for (let i = 0; i < Math.min(20, stack.length); i++) {
    status[i] = stack[i]
  }
  for (let j = 0; j < 16; j++) {
    let s = '<b>' + toHex(16 * j) + '</b>:'
    for (let i = 0; i < 16; i++) {
      s += ' ' + toHex(bank0[j*16 + i])
    }
    status[status.length - 16 + j] = s
  }
  return status.join('<br/>')
}

let zpPrev = new Uint8Array(1)
const debugZeroPage = () => {
  const zp = bank0.slice(0, 256)
  if (zpPrev.length === 1) zpPrev = zp
  let diff = ''
  for (let i = 0; i < 256; i++) {
    if (zp[i] !== zpPrev[i]) {
      diff += " " + toHex(i) + ":" + toHex(zpPrev[i]) + ">" + toHex(zp[i])
    }        
  }
  if (diff !== '') console.log(diff)
  zpPrev = zp
}

export const processInstruction = () => {
  let cycles = 0;
  const instr = bank0[PC]
  const vLo = PC < 0xFFFF ? bank0[PC + 1] : 0
  const vHi = PC < 0xFFFE ? bank0[PC + 2] : 0
  const code = pcodes[instr];
  if (code) {
    const PC1 = PC
    // if (vHi === 0xC0 && vLo === 0x8F) {
    //    doDebug = true
    // }
    // Do not output during the Apple II's WAIT subroutine
    if (doDebug && (PC1 < 0xFCA8 || PC1 > 0xFCB3)) {
      const out = `${getProcessorStatus()}  ${getInstrString(instr, vLo, vHi)}`;
      console.log(out);
      if (doDebugZeroPage) {
        debugZeroPage()
      }
    }
    cycles = code.execute(vLo, vHi);
    if (Accum > 255 || Accum < 0) {
      console.error("Out of bounds")
      return 0
    }
    cycleCount += cycles
    incrementPC(code.PC);
  } else {
    console.error("Missing instruction: $" + toHex(instr) + " PC=" + toHex(PC, 4))
    cycles = pcodes[0].execute(vLo, vHi);
  }
  return cycles
}
