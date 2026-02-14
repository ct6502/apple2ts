import { getCurrentMachineName, memGetC000, memSetC000 } from "./memory"
import { clearKeyStrobe, popKey } from "./devices/keyboard"
import { passClickSpeaker } from "./worker2main"
import { resetJoystick, checkJoystickValues } from "./devices/joystick"
import { s6502 } from "./instructions"
import { toHex } from "../common/utility"

type tSetFunc = ((addr: number, cycleCount: number) => void) | null

type SoftSwitch = {
  offAddr: number
  onAddr: number
  isSetAddr: number
  writeOnly: boolean
  isSet: boolean
  setFunc: tSetFunc
}

const sswitchArray: Array<SoftSwitch> = []

const NewSwitch = (offAddr: number, onAddr: number, isSetAddr: number,
  writeOnly = false,
  setFunc: tSetFunc = null): SoftSwitch => {
  const result: SoftSwitch = {
    offAddr: offAddr,
    onAddr: onAddr,
    isSetAddr: isSetAddr,
    writeOnly: writeOnly,
    isSet: false,
    setFunc: setFunc,
  }
  if (offAddr >= 0xC000) {
    sswitchArray[offAddr - 0xC000] = result
  }
  if (onAddr >= 0xC000) {
    sswitchArray[onAddr - 0xC000] = result
  } 
  if (isSetAddr >= 0xC000) {
    sswitchArray[isSetAddr - 0xC000] = result
  } 
  return result
}

// Random number generator for bus noise on the cassette, speaker, and joystick
// soft switches. On the Apple II, tests show that when graphics are on, the
// random numbers tend to oscillate between 0 and 0xA0. When graphics are off,
// the numbers range from 0 to 0xFF. However, issue #117
// (https://github.com/ct6502/apple2ts/issues/117) involved a game that was
// broken by the random numbers being too high. So we will limit the random
// numbers to 0-0xB4 for now. This is still random enough for games like
// Castle Wolfenstein (which rely on the cassette noise).
const rand = () => Math.floor(0xB4 * Math.random())

// let prevCount = 0

// Understanding the Apple IIe, Jim Sather, p. 5-23
// Writing to high RAM is enabled when the HRAMWRT' soft switch is reset.
// The controlling MPU program must set the PRE-WRITE soft switch before it
// can reset HRAMWRT'. PRE-WRITE is set by odd read access in the $C08Xrange.
// It is reset by even read access or any write access in the $C08X range.
// HRAMWRT' is reset by odd read access in the $C08X range when PRE-WRITE is set.
// It is set by even access in the $C08X range. Any other type of access
// causes HRAMWRT' to hold its current state.
export const handleBankedRAM = (addr: number, calledFromMemSet: boolean) => {
  // Only keep bits 0, 1, 3 of the 0xC08* number
  addr &= 0b1011
  // These addresses need to be read twice in succession to activate write.
  if (calledFromMemSet) {
    SWITCHES.BSR_PREWRITE.isSet = false
  } else {
    if (addr & 1) {
      if (SWITCHES.BSR_PREWRITE.isSet) {
        // PRE-WRITE is already set, so now we can enable write.
        SWITCHES.BSR_WRITE.isSet = true
      } else {
        // Set PRE-WRITE
        SWITCHES.BSR_PREWRITE.isSet = true
      }
    } else {
      // Reset PRE-WRITE and HRAMWRT by even read access or any write access in the $C08X range.
      SWITCHES.BSR_PREWRITE.isSet = false
      SWITCHES.BSR_WRITE.isSet = false
    }
  }
  // Set soft switches for reading the bank-switched RAM status
  SWITCHES.BSRBANK2.isSet = (addr <= 3)
  SWITCHES.BSRREADRAM.isSet = [0, 3, 8, 0x0B].includes(addr)
}

export const SWITCHES = {
  STORE80: NewSwitch(0xC000, 0xC001, 0xC018, true),
  RAMRD: NewSwitch(0xC002, 0xC003, 0xC013, true),
  RAMWRT: NewSwitch(0xC004, 0xC005, 0xC014, true),
  INTCXROM: NewSwitch(0xC006, 0xC007, 0xC015, true),
  INTC8ROM: NewSwitch(0xC02A, 0, 0),  // Fake soft switch; add here so it is saved/restored
  ALTZP: NewSwitch(0xC008, 0xC009, 0xC016, true),
  SLOTC3ROM: NewSwitch(0xC00A, 0xC00B, 0xC017, true),
  COLUMN80: NewSwitch(0xC00C, 0xC00D, 0xC01F, true),
  ALTCHARSET: NewSwitch(0xC00E, 0xC00F, 0xC01E, true),
  KBRDSTROBE: NewSwitch(0xC010, 0, 0, false),  // we will clear the keystrobe in checkSoftSwitches
  BSRBANK2: NewSwitch(0, 0, 0xC011),    // status location, not a switch
  BSRREADRAM: NewSwitch(0, 0, 0xC012),  // status location, not a switch
  VBL: NewSwitch(0, 0, 0xC019),  // vertical blanking status location, not a switch
  CASSOUT: NewSwitch(0xC020, 0, 0),  // random value filled in checkSoftSwitches
  SPEAKER: NewSwitch(0xC030, 0, 0, false, (addr, cycleCount) => {
    memSetC000(0xC030, rand())
    passClickSpeaker(cycleCount)
  }),
  GCSTROBE: NewSwitch(0xC040, 0, 0),    // strobe output to game connector
  EMUBYTE: NewSwitch(0, 0, 0xC04F, false, () => {memSetC000(0xC04F, 0xCD)}),
  TEXT: NewSwitch(0xC050, 0xC051, 0xC01A),
  MIXED: NewSwitch(0xC052, 0xC053, 0xC01B),
  PAGE2: NewSwitch(0xC054, 0xC055, 0xC01C),
  HIRES: NewSwitch(0xC056, 0xC057, 0xC01D),
  AN0: NewSwitch(0xC058, 0xC059, 0),  // random value filled in checkSoftSwitches
  AN1: NewSwitch(0xC05A, 0xC05B, 0),  // random value filled in checkSoftSwitches
  AN2: NewSwitch(0xC05C, 0xC05D, 0),  // random value filled in checkSoftSwitches
  // Watch out - the addresses are in reverse order - $C05E is AN3 "off" but double hires "on"
  DHIRES: NewSwitch(0xC05F, 0xC05E, 0),
  CASSIN1: NewSwitch(0, 0, 0xC060, false, () => {memSetC000(0xC060, rand())}),
  PB0: NewSwitch(0, 0, 0xC061),  // status location, not a switch
  PB1: NewSwitch(0, 0, 0xC062),  // status location, not a switch
  PB2: NewSwitch(0, 0, 0xC063),  // status location, not a switch
  JOYSTICK0: NewSwitch(0, 0, 0xC064, false,
    (addr, cycleCount) => {checkJoystickValues(cycleCount)}),
  JOYSTICK1: NewSwitch(0, 0, 0xC065, false,
      (addr, cycleCount) => {checkJoystickValues(cycleCount)}),
  JOYSTICK2: NewSwitch(0, 0, 0xC066, false,
    (addr, cycleCount) => {checkJoystickValues(cycleCount)}),
  JOYSTICK3: NewSwitch(0, 0, 0xC067, false,
    (addr, cycleCount) => {checkJoystickValues(cycleCount)}),
  CASSIN2: NewSwitch(0, 0, 0xC068, false, () => {memSetC000(0xC068, rand())}),
  FASTCHIP_LOCK: NewSwitch(0xC06A, 0, 0),   // used by Total Replay
  FASTCHIP_ENABLE: NewSwitch(0xC06B, 0, 0), // used by Total Replay
  FASTCHIP_SPEED: NewSwitch(0xC06D, 0, 0),  // used by Total Replay
  JOYSTICKRESET: NewSwitch(0, 0, 0xC070, false, (addr, cycleCount) => {
    resetJoystick(cycleCount)
    memSetC000(0xC070, rand())
  }),
  BANKSEL: NewSwitch(0xC073, 0, 0),  // Applied Engineering RamWorks
  LASER128EX: NewSwitch(0xC074, 0, 0),  // used by Total Replay (ignored)
  VIDEO7_160: NewSwitch(0xC078, 0xC079, 0),  // Video7 fake softswitch
  VIDEO7_MONO: NewSwitch(0xC07A, 0xC07B, 0),  // Video7 fake softswitch
  VIDEO7_MIXED: NewSwitch(0xC07C, 0xC07D, 0),  // Video7 fake softswitch
  // 0xC080...0xC08F are banked RAM soft switches and are handled manually
  // We don't need entries here, except for our special BSR_PREWRITE and BSR_WRITE.
  // We will put these in 0xC080 and 0xC088 so they get saved and restored.
  BSR_PREWRITE: NewSwitch(0xC080, 0, 0),
  BSR_WRITE: NewSwitch(0xC088, 0, 0),
}

SWITCHES.TEXT.isSet = true

// Video7 procesing based on
//   patent: https://patents.google.com/patent/US4631692 (AN3/80COL/clock)
//   docs  : https://mirrors.apple2.org.za/ftp.apple.asimov.net/documentation/hardware/video/Video-7%20RGB-SL7.pdf
// Basic description: AN3 clocks the value of /80COL into two flipflops in series.
//                    These two new "flag" registers form 4 new states for video modes.
//                    Docs also indicate that 80Store needs to be set before starting.
// AN3 starts ON
let v7clock : boolean = true // starts set
let v7flags : number = 0  // default according to docs is 3, but we aren't
                          // always emulating the video7, so leave at zero
// Use AN3 set/reset logic, not the DHIRES SSwitch
const video7clock = (onoff: boolean) => {
  // not sure if 80store is necessary
  if (v7clock !== onoff && SWITCHES.STORE80.isSet) {
    if (onoff) {
      SWITCHES.VIDEO7_160.isSet = false
      SWITCHES.VIDEO7_MONO.isSet = false
      SWITCHES.VIDEO7_MIXED.isSet = false

      // clock in the inverse value of COLUMN80
      v7flags = (v7flags << 1) & 2
      v7flags |= SWITCHES.COLUMN80.isSet ? 0 : 1

      switch (v7flags) {
        case 0: {
          break
        }
        case 1: {
          SWITCHES.VIDEO7_160.isSet = true
          break
        }
        case 2: {
          SWITCHES.VIDEO7_MIXED.isSet = true
          break
        }
        case 3: {
          SWITCHES.VIDEO7_MONO.isSet = true
          break
        }
      }
    }

    v7clock = onoff
  }
}

// When debugging is enabled, don't print out these softswitches since they
// occur so frequently...
const skipDebugFlags = [0xC000, 0xC001, 0xC00D, 0xC00F, 0xC010, 0xC030, 0xC054, 0xC055, 0xC01F]

export const checkSoftSwitches = (addr: number,
  calledFromMemSet: boolean, cycleCount: number) => {
    // Set this address to something (like 0) to enable debugging of softswitches.
  if (addr > 0xFFFFF && !skipDebugFlags.includes(addr)) {
    const s = memGetC000(addr) > 0x80 ? 1 : 0
    console.log(`${cycleCount} $${toHex(s6502.PC)}: $${toHex(addr)} [${s}] ${calledFromMemSet ? "write" : ""}`)
  }
  // Apple II+ compatibility: treat $C000-$C01F as keyboard/strobe and bus noise.
  // Do not use IIe MMU/status semantics in this range.
  if (getCurrentMachineName() === "APPLE2P" && addr <= 0xC01F) {
    if (!calledFromMemSet && addr <= 0xC00F) {
      popKey()
    }
    if (addr === 0xC010) {
      clearKeyStrobe()
    } else if (addr !== 0xC000) {
      memSetC000(addr, rand())
    }
    return
  }

  // Handle banked-RAM soft switches, since these have duplicate addresses
  // and need to call our special function.
  if (addr >= 0xC080 && addr <= 0xC08F) {
    // $C084...87 --> $C080...83, $C08C...8F --> $C088...8B
    handleBankedRAM(addr & ~4, calledFromMemSet)
    return
  }
  const sswitch1 = sswitchArray[addr - 0xC000]
  if (!sswitch1) {
    console.error("Unknown softswitch " + toHex(addr))
    memSetC000(addr, rand())
    return
  }
  // All addresses from $C000-C00F will read the keyboard and keystrobe
  if (addr <= 0xC00F) {
    if (!calledFromMemSet) {
      popKey()
    }
  } else if (addr === 0xC010 || (addr <= 0xC01F && calledFromMemSet)) {
    // R/W to $C010 or any write to $C011-$C01F will clear the keyboard strobe
    clearKeyStrobe()
  }
  if (sswitch1.setFunc) {
    sswitch1.setFunc(addr, cycleCount)
    return
  }

  // Check AN3 toggle for Video7
  // note reversed logic because we want AN3 state
  if (addr === SWITCHES.DHIRES.offAddr)
    video7clock(true)
  else if (addr === SWITCHES.DHIRES.onAddr)
    video7clock(false)

  if (addr === sswitch1.offAddr || addr === sswitch1.onAddr) {
    if (!sswitch1.writeOnly || calledFromMemSet) {
      // If we have overridden this switch, don't actually set the real
      // switch value - instead just change our cached value so it gets restored
      // to its new state when the Memory Dump panel is changed to a non-HGR bank.
      if (overriddenSwitches[sswitch1.offAddr - 0xC000] !== undefined) {
        overriddenSwitches[sswitch1.offAddr - 0xC000] = (addr === sswitch1.onAddr)
      } else {
        sswitch1.isSet = (addr === sswitch1.onAddr)
      }
    }
    if (sswitch1.isSetAddr) {
      const value = memGetC000(sswitch1.isSetAddr)
      memSetC000(sswitch1.isSetAddr, sswitch1.isSet ? (value | 0x80) : (value & 0x7F))
    }
    // Many games expect random "noise" from these soft switches.
    if (addr >= 0xC020) memSetC000(addr, rand())
  } else if (addr === sswitch1.isSetAddr) {
    const value = memGetC000(addr)
    memSetC000(addr, sswitch1.isSet ? (value | 0x80) : (value & 0x7F))
  }
}

export const resetSoftSwitches = () => {
  for (const key in SWITCHES) {
    const keyTyped = key as keyof typeof SWITCHES
    // If we have overridden this switch, don't actually set the real
    // switch value - instead just change our cached value so it gets restored
    // to its new state when the Memory Dump panel is changed to a non-HGR bank.
    if (overriddenSwitches[SWITCHES[keyTyped].offAddr - 0xC000] !== undefined) {
      overriddenSwitches[SWITCHES[keyTyped].offAddr - 0xC000] = false
    } else {
      SWITCHES[keyTyped].isSet = false
    }
  }
  if (overriddenSwitches[SWITCHES.TEXT.offAddr - 0xC000] !== undefined) {
    overriddenSwitches[SWITCHES.TEXT.offAddr - 0xC000] = true
  } else {
    SWITCHES.TEXT.isSet = true
  }
}

// An array of the original state of the soft switches, indexed by offAddress - 0xC000.
// This is needed for the Memory Dump panel, when displaying HGR page 1/2.
// These switches will get set back to their original values (and the array will be cleared)
// when the Memory Dump panel is set to a non-HGR memory bank.
const overriddenSwitches: Array<boolean> = []

export const overrideSoftSwitch = (addr: number) => {
  if (addr >= 0xC080 && addr <= 0xC08F) {
    handleBankedRAM(addr & ~4, false)
    return
  }
  const sswitch1 = sswitchArray[addr - 0xC000]
  if (!sswitch1) {
    console.error("overrideSoftSwitch: Unknown softswitch " + toHex(addr))
    return
  }
  // If we have already cached this switch, don't override it again.
  // Otherwise we will never get back to our original state.
  // That can happen in the Memory Dump panel if the user chooses HGR page 1,
  // then HGR page 2.
  if (overriddenSwitches[sswitch1.offAddr - 0xC000] === undefined) {
    overriddenSwitches[sswitch1.offAddr - 0xC000] = sswitch1.isSet
  }
  sswitch1.isSet = (addr === sswitch1.onAddr)
}

export const restoreSoftSwitches = () => {
  overriddenSwitches.forEach((isSet, index) => {
    if (isSet !== undefined) {
      sswitchArray[index].isSet = isSet
    }
  })
  overriddenSwitches.length = 0
}


// Create an array of softswitch descriptions on the fly.
// We only need to do this once.
const SoftSwitchDescriptions: Array<string> = []

export const getSoftSwitchDescriptions = () => {
  if (SoftSwitchDescriptions.length === 0) {
    for (const key in SWITCHES) {
      const sswitch = SWITCHES[key as keyof typeof SWITCHES]
      const isSwitch = sswitch.onAddr > 0
      const writeOnly = sswitch.writeOnly ? " (write)" : ""
      if (sswitch.offAddr > 0) {
        const addr = toHex(sswitch.offAddr) + " " + key
        SoftSwitchDescriptions[sswitch.offAddr] = addr + (isSwitch ? "-OFF" : "") + writeOnly
      }
      if (sswitch.onAddr > 0) {
        const addr = toHex(sswitch.onAddr) + " " + key
          SoftSwitchDescriptions[sswitch.onAddr] = addr + "-ON" + writeOnly
      }
      if (sswitch.isSetAddr > 0) {
        const addr = toHex(sswitch.isSetAddr) + " " + key
        SoftSwitchDescriptions[sswitch.isSetAddr] = addr + "-STATUS" + writeOnly
      }
    }
  }
  SoftSwitchDescriptions[0xC000] = "C000 KBRD/STORE80-OFF"
  return SoftSwitchDescriptions
}
