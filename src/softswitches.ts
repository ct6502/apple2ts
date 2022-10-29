import { memC000 } from "./memory"
import { popKey } from "./keyboard"
import { clickSpeaker } from "./speaker"
import { resetJoystick, checkJoystickValues } from "./joystick"
import { toHex } from "./utility"

type tSetFunc = ((addr: number, cycleCount: number) => void) | null

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
  const result: softSwitch = {
    offAddr: offAddr,
    onAddr: offAddr + 1,
    isSetAddr: isSetAddr,
    writeOnly: writeOnly,
    isSet: false,
    setFunc: setFunc,
  }
  return result
}
const SLOT6 = 0x60

const rand = () => Math.floor(256 * Math.random())

export const handleBankedRAM = (addr: number) => {
  // Only keep bits 0, 1, 3 of the 0xC08* number
  addr &= 0b1011
  SWITCHES.READBSR2.isSet = addr === 0
  SWITCHES.WRITEBSR2.isSet = addr === 1
  SWITCHES.OFFBSR2.isSet = addr === 2
  SWITCHES.RDWRBSR2.isSet = addr === 3
  SWITCHES.READBSR1.isSet = addr === 8
  SWITCHES.WRITEBSR1.isSet = addr === 9
  SWITCHES.OFFBSR1.isSet = addr === 0x0A
  SWITCHES.RDWRBSR1.isSet = addr === 0x0B
  // Set soft switches for reading the bank-switched RAM status
  SWITCHES.BSRBANK2.isSet = (addr <= 3)
  SWITCHES.BSRREADRAM.isSet = [0, 3, 8, 0x0B].includes(addr)
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
  KBRDSTROBE: NewSwitch(0, 0xC010, false, () => {
    memC000.fill(memC000[0] & 0b01111111, 0, 32)
    popKey()
  }),
  BSRBANK2: NewSwitch(0, 0xC011),    // status location, not a switch
  BSRREADRAM: NewSwitch(0, 0xC012),  // status location, not a switch
  CASSOUT: NewSwitch(0xC020, 0, false, () => {
    memC000.fill(rand(), 0x20, 16)
  }),
  SPEAKER: NewSwitch(0xC030, 0, false, (addr, cycleCount) => {
    memC000.fill(rand(), 0x30, 16)
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
  CASSIN1: NewSwitch(0, 0xC060, false, () => {memC000[0xC060] = rand()}),
  PB0: NewSwitch(0, 0xC061),  // status location, not a switch
  PB1: NewSwitch(0, 0xC062),  // status location, not a switch
  PB2: NewSwitch(0, 0xC063),  // status location, not a switch
  JOYSTICK12: NewSwitch(0xC064, 0, false, (addr, cycleCount) => {
    checkJoystickValues(cycleCount)
  }),
  CASSIN2: NewSwitch(0, 0xC068, false, () => {memC000[0xC068] = rand()}),
  JOYSTICKRESET: NewSwitch(0xC070, 0, false, (addr, cycleCount) => {
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

// const skipDebugFlags = [0xC000, 0xC001, 0xC00D, 0xC00F, 0xC030, 0xC054, 0xC055, 0xC01F]

export const checkSoftSwitches = (addr: number,
  calledFromMemSet: boolean, cycleCount: number) => {
  // if (!skipDebugFlags.includes(addr)) {
  //   const s = memC000[addr - 0xC000] > 0x80 ? 1 : 0
  //   console.log(`${cycleCount} $${toHex(s6502.PC)}: $${toHex(addr)} [${s}] ${calledFromMemSet ? "set" : ""}`)
  // }
  for (const [, sswitch] of Object.entries(SWITCHES)) {
    if (addr === sswitch.offAddr || addr === sswitch.onAddr) {
//      if (addr !== 0xC000) console.log("addr=" + addr.toString(16))
      if ((sswitch.writeOnly && calledFromMemSet) || !sswitch.writeOnly) {
        if (sswitch.setFunc) {
          sswitch.setFunc(addr, cycleCount)
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
//      if (addr !== 0xC000) console.log("isSetAddr=" + addr.toString(16))
      if (sswitch.setFunc) {
        sswitch.setFunc(addr, cycleCount)
      } else {
        memC000[sswitch.isSetAddr - 0xC000] = sswitch.isSet ? 0x8D : 0x0D
      }
      return
    }
  }
  console.error("Unknown softswitch " + toHex(addr))
}
