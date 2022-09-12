import { SWITCHES, checkSoftSwitches } from "./softswitches";
import { cycleCount } from "./instructions"
import { handleDriveSoftSwitches } from "./diskdrive"
import { romBase64 } from "./roms/rom_2e"
import { slot_disk2 } from "./roms/slot_disk2_cx00"
import { Buffer } from "buffer";

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

const rom = new Uint8Array(
  Buffer.from(romBase64.replaceAll("\n", ""), "base64")
)

// Set $C007: FF to see this code
// Hack to change the cursor
// rom[0xC26F - 0xC000] = 161
// rom[0xC273 - 0xC000] = 161
// Hack to speed up the cursor
// rom[0xC288 - 0xC000] = 0x20

const memGetSoftSwitch = (addr: number): number => {
  // $C019 Vertical blanking status (0 = vertical blanking, 1 = beam on)
  if (addr === 0xC019) {
    // Return "low" for 70 scan lines out of 262 (70 * 65 cycles = 4550)
    return ((cycleCount % 17030) > 12480) ? 0x0D : 0x8D
  }
  checkSoftSwitches(addr, false, cycleCount)
  if (addr >= SWITCHES.DRVSM0.offAddr && addr <= SWITCHES.DRVWRITE.onAddr) {
    return handleDriveSoftSwitches(addr, -1)
  }
  return memC000[addr - 0xC000]
}

const memGetBankC000 = (addr: number): number => {
  if (SWITCHES.INTCXROM.isSet) {
    return rom[addr - 0xC000]
  }
  // TODO: This should return the card's ROM, not regular ROM.
  if (addr >= 0xC800) {
    return rom[addr - 0xC000]
  }
  if ((addr >= 0xC300 && addr <= 0xC3FF) && !SWITCHES.SLOTC3ROM.isSet) {
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
  if (addr >= 0xD000) {
    if (!SWITCHES.BSRREADRAM.isSet) {
      return rom[addr - 0xC000]
    }
    // Bank1 of $D000-$DFFF is stored in $C000, so adjust address if necessary
    if (addr <= 0xDFFF && !SWITCHES.BSRBANK2.isSet) {
      addr -= 0x1000
    }
  }

  let readAuxMem = SWITCHES.RAMRD.isSet

  if (addr <= 0x1FF || addr >= 0xC000) {
    readAuxMem = SWITCHES.ALTZP.isSet
  } else if (addr >= 0x400 && addr <= 0x7FF) {
    if (SWITCHES.STORE80.isSet) {
      readAuxMem = SWITCHES.PAGE2.isSet
    }
  } else if (addr >= 0x2000 && addr <= 0x3FFF) {
    if (SWITCHES.STORE80.isSet) {
      if (SWITCHES.HIRES.isSet) {
        readAuxMem = SWITCHES.PAGE2.isSet
      }
    }
  }

  return (readAuxMem ? bank1[addr] : bank0[addr])
}

export const memSet = (addr: number, value: number) => {
  if (addr >= 0xC000 && addr <= 0xC0FF) {
    checkSoftSwitches(addr, false, cycleCount)
    if (addr >= SWITCHES.DRVSM0.offAddr && addr <= SWITCHES.DRVWRITE.onAddr) {
      handleDriveSoftSwitches(addr, value)
    }
    checkSoftSwitches(addr, true, cycleCount)
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
    if (addr <= 0xDFFF && !SWITCHES.BSRBANK2.isSet) {
      addr -= 0x1000
    }
  }

  let writeAuxMem = SWITCHES.RAMWRT.isSet

  if (addr <= 0x1FF || addr >= 0xC000) {
    writeAuxMem = SWITCHES.ALTZP.isSet
  } else if (addr >= 0x400 && addr <= 0x7FF) {
    if (SWITCHES.STORE80.isSet) {
      writeAuxMem = SWITCHES.PAGE2.isSet
    }
  } else if (addr >= 0x2000 && addr <= 0x3FFF) {
    if (SWITCHES.STORE80.isSet) {
      if (SWITCHES.HIRES.isSet) {
        writeAuxMem = SWITCHES.PAGE2.isSet
      }
    }
  }

  if (writeAuxMem) {
    bank1[addr] = value
  } else {
    bank0[addr] = value
  }
}

const TEXT_PAGE1 = 0x400
const TEXT_PAGE2 = 0x800
const offset = [
  0, 0x80, 0x100, 0x180, 0x200, 0x280, 0x300, 0x380, 0x28, 0xA8, 0x128, 0x1A8,
  0x228, 0x2A8, 0x328, 0x3A8, 0x50, 0xD0, 0x150, 0x1D0, 0x250, 0x2D0, 0x350,
  0x3D0,
]

export function getTextPage() {
  const pageOffSet = SWITCHES.PAGE2.isSet ? TEXT_PAGE2 : TEXT_PAGE1
  if (SWITCHES.COLUMN80.isSet) {
    const textPage = new Uint8Array(80 * 24).fill(0xA0)
    for (let j = 0; j < 24; j++) {
      for (let i = 0; i < 40; i++) {
        textPage[j * 80 + 2 * i + 1] = bank0[pageOffSet + offset[j] + i]
        textPage[j * 80 + 2 * i] = bank1[pageOffSet + offset[j] + i]
      }
    }
    return textPage
  }
  const textPage = new Uint8Array(40 * 24)
  for (let j = 0; j < 24; j++) {
    let start = pageOffSet + offset[j]
    textPage.set(bank0.slice(start, start + 40), j * 40)
  }
  return textPage
}

export function getHGR() {
  const offset = SWITCHES.PAGE2.isSet ? 0x4000 : 0x2000
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
