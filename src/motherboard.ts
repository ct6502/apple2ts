import { Accum, XReg, YReg, PStatus, SP,
  setAccum, setXregister, setYregister, setPStatus, setSP, setPC,
  pcodes, PC, MODE,
  address, incrementPC } from './instructions'
import { rom } from "./roms/rom_2+.base64";
import { Buffer } from "buffer";
import { popKey } from "./keyboard"
import { clickSpeaker } from "./speaker"
import { handleDriveSwitch, doResetDrive } from "./diskdrive"

export let bank0 = new Uint8Array(65536)

let doDebug = false
export const setDebug = (debug = true) => doDebug = debug;

export const doReset = () => {
  setAccum(0)
  setXregister(0)
  setYregister(0)
  setPStatus(0b00100100)
  setSP(0xFF)
  setPC(bank0[0xFFFD] * 256 + bank0[0xFFFC]);
  doResetDrive()
}

export const doBoot6502 = () => {
  bank0.fill(0xFF)
  bank0.set(Buffer.from(rom.replaceAll('\n', ''), 'base64'), 0xC000)
  doReset()
}

type softSwitch = {
  addrOff: number
  addrOn: number
  set: boolean
}
const NewSwitch = (addrOff: number, addrOn = addrOff + 1, set = false): softSwitch => {
  return {addrOff: addrOff, addrOn: addrOn, set: set}
}
const SLOT6 = 0x60

export const SWITCHES = {
  TEXT: NewSwitch(0xC050, 0xC051, true),
  MIXED: NewSwitch(0xC052),
  PAGE2: NewSwitch(0xC054),
  HIRES: NewSwitch(0xC056),
  DRVSM0: NewSwitch(0xC080 + SLOT6),
  DRVSM1: NewSwitch(0xC082 + SLOT6),
  DRVSM2: NewSwitch(0xC084 + SLOT6),
  DRVSM3: NewSwitch(0xC086 + SLOT6),
  DRIVE: NewSwitch(0xC088 + SLOT6),
  DRVSEL: NewSwitch(0xC08A + SLOT6),
  DRVDATA: NewSwitch(0xC08C + SLOT6),
  DRVWRITE: NewSwitch(0xC08E + SLOT6),
}

export const memGet = (addr: number) => {
  if (addr >= 0xC000) {
    if (addr === 0xC010) {
      bank0[0xC000] &= 0x01111111
      popKey()
    } else if (addr === 0xC030) {
      clickSpeaker()
    } else {
      for (const [, sswitch] of Object.entries(SWITCHES)) {
        if (addr === sswitch.addrOff) {
          sswitch.set = false
          break
        } else if (addr === sswitch.addrOn) {
          sswitch.set = true
          break
        }
      }
      if (addr >= SWITCHES.DRVSM0.addrOff && addr <= SWITCHES.DRVWRITE.addrOn) {
        handleDriveSwitch(addr)
      }
    }
  }
  return bank0[addr]
}

export const memSet = (address: number, value: number) => {
  if (address >= 0xC000) {
    memGet(address)
    return
  }
  bank0[address] = value
}

const toBinary = (value: number) => {
  return ('00000000' + value.toString(2)).slice(-8)
}

export const toHex = (value: number, ndigits = 2) => {
  return ('0000' + value.toString(16).toUpperCase()).slice(-ndigits)
}

export const getProcessorStatus = () => {
  return `${toHex(PC,4)}-  A=${toHex(Accum)} X=${toHex(XReg)} ` + 
  `Y=${toHex(YReg)} P=${toBinary(PStatus)} S=${toHex(SP)}`
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

export const processInstruction = () => {
  let cycles = 0;
  const instr = bank0[PC]
  const vLo = PC < 0xFFFF ? bank0[PC + 1] : 0
  const vHi = PC < 0xFFFE ? bank0[PC + 2] : 0
  const code = pcodes[instr];
  // Don't print debug during the Apple WAIT subroutine
  // const PClocal = PC
  // const bank0local = bank0
  if (code) {
    const PC1 = PC
    // if (PC1 === 0xC638) {
    //    doDebug = true
    //    console.log("stop!")
    // }
    cycles = code.execute(vLo, vHi);
    // Do not output during the Apple II's WAIT subroutine
    if (doDebug && (PC1 < 0xFCA8 || PC1 > 0xFCB3)) {
      const out = `${getProcessorStatus()}  ${getInstrString(instr, vLo, vHi)}`;
      console.log(out);
    }
    if (Accum > 255 || Accum < 0) {
      console.error("Out of bounds")
      return 0
    }
    incrementPC(code.PC);
  } else {
    console.error("Missing instruction: $" + toHex(instr) + " PC=" + toHex(PC, 4))
    return 0
  }
  return cycles
}
