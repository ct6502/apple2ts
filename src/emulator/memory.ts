import { SWITCHES, checkSoftSwitches } from "./softswitches";
import { cycleCount } from "./instructions"
import { handleDriveSoftSwitches } from "./diskdata"
import { romBase64 } from "./roms/rom_2e"
import { disk2driver } from "./roms/slot_disk2_cx00"
import { Buffer } from "buffer";

// Bank1 of $D000-$DFFF is stored in mainMem (and auxMem) at 0xC000-0xCFFF
// Bank2 of $D000-$DFFF is stored in mainMem (and auxMem) at 0xD000-0xDFFF
export let mainMem = new Uint8Array(65536)
export let auxMem = new Uint8Array(65536)
export let memC000 = new Uint8Array(256)
const empty = new Uint8Array(256).fill(255)
let slots = [
  empty,
  empty,
  empty,
  empty,
  empty,
  disk2driver,
  empty,
]

export const setSlotDriver = (slot: number, driver: Uint8Array) => {
  slots[slot - 1] = driver
}

const rom = new Uint8Array(
  Buffer.from(romBase64.replaceAll("\n", ""), "base64")
)

// Set $C007: FF to see this code
// Hack to change the cursor
// rom[0xC26F - 0xC000] = 161
// rom[0xC273 - 0xC000] = 161
// Hack to speed up the cursor
// rom[0xC288 - 0xC000] = 0x20

// let nn = 0

export const readWriteAuxMem = (addr: number, write = false) => {
  let useAux = write ? SWITCHES.RAMWRT.isSet : SWITCHES.RAMRD.isSet
  if (addr <= 0x1FF || addr >= 0xC000) {
    useAux = SWITCHES.ALTZP.isSet
  } else if (addr >= 0x400 && addr <= 0x7FF) {
    if (SWITCHES.STORE80.isSet) {
      useAux = SWITCHES.PAGE2.isSet
    }
  } else if (addr >= 0x2000 && addr <= 0x3FFF) {
    if (SWITCHES.STORE80.isSet) {
      if (SWITCHES.HIRES.isSet) {
        useAux = SWITCHES.PAGE2.isSet
      }
    }
  }
  return useAux
}

const memGetSoftSwitch = (addr: number, code=0): number => {
  // $C019 Vertical blanking status (0 = vertical blanking, 1 = beam on)
  if (addr === 0xC019) {
    // Return "low" for 70 scan lines out of 262 (70 * 65 cycles = 4550)
    return ((cycleCount % 17030) > 12480) ? 0x0D : 0x8D
  }
  // if (code === 0xDD && addr === 0xC0EC) {
  //   let t = performance.now()
  //   for (let index = 0; index < nn; index++) {
  //     checkSoftSwitches(addr, false, cycleCount)
  //   }
  //   let t1 = (performance.now() - t)
  //   console.log(`checkSoftSwitches t=${t1}`)
  //   t = performance.now()
  //   let result = 0
  //   for (let index = 0; index < nn; index++) {
  //     if (addr >= SWITCHES.DRVSM0.offAddr && addr <= SWITCHES.DRVWRITE.onAddr) {
  //       result = handleDriveSoftSwitches(addr, -1)
  //     }
  //   }
  //   t1 = (performance.now() - t)
  //   console.log(`handleDriveSoftSwitches t=${t1}`)
  //   return result
  // } else {
    checkSoftSwitches(addr, false, cycleCount)
    if (addr >= SWITCHES.DRVSM0.offAddr && addr <= SWITCHES.DRVWRITE.onAddr) {
//      nn++
//      console.log(`${nn}`)
      return handleDriveSoftSwitches(addr, -1)
    }
//  }

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

const bankRamAdjust = (addr: number) => {
  // Bank1 of $D000-$DFFF is stored in $C000, so adjust address if necessary
  if (addr >= 0xD000 && addr <= 0xDFFF && !SWITCHES.BSRBANK2.isSet) {
    addr -= 0x1000
  }
  return addr
}

export const memGet = (addr: number, code=0): number => {
  if (addr >= 0xC000 && addr <= 0xC0FF) {
    return memGetSoftSwitch(addr, code)
  }
  if (addr >= 0xC100 && addr <= 0xCFFF) {
    return memGetBankC000(addr)
  }
  if (addr >= 0xD000) {
    if (!SWITCHES.BSRREADRAM.isSet) {
      return rom[addr - 0xC000]
    }
    addr = bankRamAdjust(addr)
  }

  return (readWriteAuxMem(addr) ? auxMem[addr] : mainMem[addr])
}

export const memSet = (addr: number, value: number) => {
  if (addr >= 0xC000 && addr <= 0xC0FF) {
    if (addr >= SWITCHES.DRVSM0.offAddr && addr <= SWITCHES.DRVWRITE.onAddr) {
      handleDriveSoftSwitches(addr, value)
    } else {
      checkSoftSwitches(addr, true, cycleCount)
    }
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
    addr = bankRamAdjust(addr)
  }

  if (readWriteAuxMem(addr, true)) {
    auxMem[addr] = value
  } else {
    mainMem[addr] = value
  }
}

const TEXT_PAGE1 = 0x400
const TEXT_PAGE2 = 0x800
const offset = [
  0, 0x80, 0x100, 0x180, 0x200, 0x280, 0x300, 0x380, 0x28, 0xA8, 0x128, 0x1A8,
  0x228, 0x2A8, 0x328, 0x3A8, 0x50, 0xD0, 0x150, 0x1D0, 0x250, 0x2D0, 0x350,
  0x3D0,
]

export function getTextPage(getLores = false) {
  let jstart = 0
  let jend = 24
  let is80column = false
  if (getLores) {
    if (SWITCHES.TEXT.isSet || SWITCHES.HIRES.isSet) {
      return new Uint8Array()
    }
    jend = SWITCHES.MIXED.isSet ? 20 : 24
    is80column = SWITCHES.COLUMN80.isSet && !SWITCHES.AN3.isSet
  } else {
    if (!SWITCHES.TEXT.isSet && !SWITCHES.MIXED.isSet) {
      return new Uint8Array()
    }
    if (!SWITCHES.TEXT.isSet && SWITCHES.MIXED.isSet) jstart = 20
    is80column = SWITCHES.COLUMN80.isSet
  }
  if (is80column) {
    // Only select second 80-column text page if STORE80 is also OFF
    const pageOffset = (SWITCHES.PAGE2.isSet && !SWITCHES.STORE80.isSet) ? TEXT_PAGE2 : TEXT_PAGE1
    const textPage = new Uint8Array(80 * (jend - jstart)).fill(0xA0)
    for (let j = jstart; j < jend; j++) {
      const joffset = 80 * (j - jstart)
      for (let i = 0; i < 40; i++) {
        textPage[joffset + 2 * i + 1] = mainMem[pageOffset + offset[j] + i]
        textPage[joffset + 2 * i] = auxMem[pageOffset + offset[j] + i]
      }
    }
    return textPage
  } else {
    const pageOffset = SWITCHES.PAGE2.isSet ? TEXT_PAGE2 : TEXT_PAGE1
    const textPage = new Uint8Array(40 * (jend - jstart))
    for (let j = jstart; j < jend; j++) {
      const joffset = 40 * (j - jstart)
      let start = pageOffset + offset[j]
      textPage.set(mainMem.slice(start, start + 40), joffset)
    }
    return textPage
  }
}

export function getHires() {
  if (SWITCHES.TEXT.isSet || !SWITCHES.HIRES.isSet) {
    return new Uint8Array()
  }
  const doubleRes = SWITCHES.COLUMN80.isSet && !SWITCHES.AN3.isSet
  const nlines = SWITCHES.MIXED.isSet ? 160 : 192
  if (doubleRes) {
    // Only select second 80-column text page if STORE80 is also OFF
    const pageOffset = (SWITCHES.PAGE2.isSet && !SWITCHES.STORE80.isSet) ? 0x4000 : 0x2000
    const hgrPage = new Uint8Array(80 * nlines)
    for (let j = 0; j < nlines; j++) {
      const addr = pageOffset + 40 * Math.trunc(j / 64) +
        1024 * (j % 8) + 128 * (Math.trunc(j / 8) & 7)
      for (let i = 0; i < 40; i++) {
        hgrPage[j * 80 + 2 * i + 1] = mainMem[addr + i]
        hgrPage[j * 80 + 2 * i] = auxMem[addr + i]
      }
    }
    return hgrPage
  } else {
    const pageOffset = SWITCHES.PAGE2.isSet ? 0x4000 : 0x2000
    const hgrPage = new Uint8Array(40 * nlines)
    for (let j = 0; j < nlines; j++) {
      const addr = pageOffset + 40 * Math.trunc(j / 64) +
        1024 * (j % 8) + 128 * (Math.trunc(j / 8) & 7)
      hgrPage.set(mainMem.slice(addr, addr + 40), j * 40)
    }
    return hgrPage
  }
}

export const getDataBlock = (addr: number) => {
  const doAux = readWriteAuxMem(addr, true)
  addr = bankRamAdjust(addr)
  const result = doAux ?
    auxMem.slice(addr, addr + 512) : mainMem.slice(addr, addr + 512)
  return result
}

export const setDataBlock = (addr: number, data: Uint8Array) => {
  const doAux = readWriteAuxMem(addr, true)
  addr = bankRamAdjust(addr)
  if (doAux) {
    auxMem.set(data, addr)
  } else {
    mainMem.set(data, addr)
  }
}