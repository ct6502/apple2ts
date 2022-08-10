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
  checkSoftSwitches(addr, false, cycleCount)
  if (addr >= SWITCHES.DRVSM0.offAddr && addr <= SWITCHES.DRVWRITE.onAddr) {
    return handleDriveSoftSwitches(addr, -1)
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
