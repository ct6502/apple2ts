import { SWITCHES, checkSoftSwitches } from "./softswitches";
import { cycleCount } from "./instructions"
import { handleDriveSoftSwitches } from "./diskdata"
import { romBase64 } from "./roms/rom_2e"
import { Buffer } from "buffer";
import { handleGameSetup } from "./game_mappings";

// 00000: main memory
// 10000: aux memory 
// 20000...23FFF: ROM
// 24000...246FF: Slots 1-7
// Bank1 of $D000-$DFFF is stored at 0x*D000-0x*DFFF (* 0 for main, 1 for aux)
// Bank2 of $D000-$DFFF is stored at 0x*C000-0x*CFFF (* 0 for main, 1 for aux)
export let memory = (new Uint8Array(600 * 256)).fill(0)

// Mappings from real Apple II address to memory array above.
// 256 pages of memory, from $00xx to $FFxx.
// Include one extra slot, to avoid needing memory checks for > 65535.
const addressGetTable = (new Array<number>(257)).fill(0)
const addressSetTable = (new Array<number>(257)).fill(0)

const ROMindexMinusC0 = 0x200 - 0xC0
const SLOTindexMinusC1 = 0x240 - 0xC1
const AUXindex = 0x100
const ROMstartMinusC000 = 256 * ROMindexMinusC0
const SLOTstartMinusC100 = 256 * SLOTindexMinusC1
const AUXstart = 256 * AUXindex

const updateMainAuxMemoryTable = () => {
  const offsetAuxRead = SWITCHES.RAMRD.isSet ? AUXindex : 0
  const offsetAuxWrite = SWITCHES.RAMWRT.isSet ? AUXindex : 0
  const offsetPage2 = SWITCHES.PAGE2.isSet ? AUXindex : 0
  const offsetTextPageRead = SWITCHES.STORE80.isSet ? offsetPage2 : offsetAuxRead
  const offsetTextPageWrite = SWITCHES.STORE80.isSet ? offsetPage2 : offsetAuxWrite
  const offsetHgrPageRead = (SWITCHES.STORE80.isSet && SWITCHES.HIRES.isSet) ? offsetPage2 : offsetAuxRead
  const offsetHgrPageWrite = (SWITCHES.STORE80.isSet && SWITCHES.HIRES.isSet) ? offsetPage2 : offsetAuxWrite
  for (let i = 2; i < 256; i++) {
    addressGetTable[i] = i + offsetAuxRead;
    addressSetTable[i] = i + offsetAuxWrite;
  }
  for (let i = 4; i <= 7; i++) {
    addressGetTable[i] = i + offsetTextPageRead;
    addressSetTable[i] = i + offsetTextPageWrite;
  }
  for (let i = 0x20; i <= 0x3F; i++) {
    addressGetTable[i] = i + offsetHgrPageRead;
    addressSetTable[i] = i + offsetHgrPageWrite;
  }
}

const updateReadBankSwitchedRamTable = () => {
  const offsetZP = SWITCHES.ALTZP.isSet ? AUXindex : 0
  addressGetTable[0] = offsetZP;
  addressGetTable[1] = 1 + offsetZP;
  addressSetTable[0] = offsetZP;
  addressSetTable[1] = 1 + offsetZP;
  if (SWITCHES.BSRREADRAM.isSet) {
    for (let i = 0xD0; i <= 0xFF; i++) {
      addressGetTable[i] = i + offsetZP;
    }
    if (!SWITCHES.BSRBANK2.isSet) {
      // Bank1 of $D000-$DFFF is actually in 0xC0...0xCF
      for (let i = 0xD0; i <= 0xDF; i++) {
        addressGetTable[i] = i - 0x10 + offsetZP;
      }
    }
  } else {
    // ROM ($C000...$FFFF) is in 0x200...0x23F
    for (let i = 0xC0; i <= 0xFF; i++) {
      addressGetTable[i] = ROMindexMinusC0 + i;
    }
  }
}

const updateWriteBankSwitchedRamTable = () => {
  const offsetZP = SWITCHES.ALTZP.isSet ? AUXindex : 0
  const writeRAM = SWITCHES.WRITEBSR1.isSet || SWITCHES.WRITEBSR2.isSet ||
    SWITCHES.RDWRBSR1.isSet || SWITCHES.RDWRBSR2.isSet
  if (writeRAM) {
    for (let i = 0xD0; i <= 0xFF; i++) {
      addressSetTable[i] = i + offsetZP;
    }
    if (!SWITCHES.BSRBANK2.isSet) {
      // Bank1 of $D000-$DFFF is actually in 0xC0...0xCF
      for (let i = 0xD0; i <= 0xDF; i++) {
        addressSetTable[i] = i - 0x10 + offsetZP;
      }
    }
  } else {
    // ROM is not writeable
    for (let i = 0xC0; i <= 0xFF; i++) {
      addressSetTable[i] = -1;
    }
  }
}

const updateSlotRomTable = () => {
  // Read peripheral slot ROM
  if (!SWITCHES.INTCXROM.isSet) {
    // TODO: Currently, $C800-$CFFF is not being filled in for cards.
    for (let i = 0xC1; i <= 0xC7; i++) {
      addressGetTable[i] = SLOTindexMinusC1 + i;
    }
  }
  if (!SWITCHES.SLOTC3ROM.isSet) {
    addressGetTable[0xC3] = ROMindexMinusC0 + 0xC3
  }
}

export const updateAddressTables = () => {
  updateMainAuxMemoryTable()
  updateReadBankSwitchedRamTable()
  updateWriteBankSwitchedRamTable()
  updateSlotRomTable()
  // Scale all of our mappings up by 256 to get to offsets in memory array.
  for (let i = 0; i < 256; i++) {
    addressGetTable[i] = 256 * addressGetTable[i];
    addressSetTable[i] = 256 * addressSetTable[i];
  }
}

export const specialJumpTable = new Map<number, () => void>();

export const setSlotDriver = (slot: number, driver: Uint8Array, jump = 0, fn = () => {}) => {
  memory.set(driver, SLOTstartMinusC100 + 0xC000 + slot * 0x100)
  if (jump) {
    specialJumpTable.set(jump, fn)
  }
}

export const memoryReset = () => {
  memory.fill(0xFF, 0, 0x1FFFF)
  const rom64 = romBase64.replace(/\n/g, "")
  const rom = new Uint8Array(
    Buffer.from(rom64, "base64")
  )
  memory.set(rom, ROMstartMinusC000 + 0xC000)
  updateAddressTables()
}

// Fill all pages of either main or aux memory with 0, 1, 2,...
export const memorySetForTests = (aux = false) => {
  memoryReset()
  const offset = aux ? AUXstart : 0
  for (let i=0; i <= 0xFF; i++) {
    memory.fill(i, i * 256 + offset, (i + 1) * 256 + offset)
  }
}

// Set $C007: FF to see this code
// Hack to change the cursor
// rom[0xC26F - 0xC000] = 161
// rom[0xC273 - 0xC000] = 161
// Hack to speed up the cursor
// rom[0xC288 - 0xC000] = 0x20

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
  checkSoftSwitches(addr, false, cycleCount)
  if (addr >= SWITCHES.DRVSM0.offAddr && addr <= SWITCHES.DRVWRITE.onAddr) {
    return handleDriveSoftSwitches(addr, -1)
  }
  updateAddressTables()
  return memory[ROMstartMinusC000 + addr]
}

export const memGet = (addr: number, code=0): number => {
  const page = addr >>> 8
  if (page === 0xC0) {
    return memGetSoftSwitch(addr, code)
  }
  const shifted = addressGetTable[page]
  return memory[shifted + (addr & 255)]
}

export const memSet = (addr: number, value: number) => {
  const page = addr >>> 8
  if (page === 0xC0) {
    if (addr >= SWITCHES.DRVSM0.offAddr && addr <= SWITCHES.DRVWRITE.onAddr) {
      handleDriveSoftSwitches(addr, value)
    } else {
      checkSoftSwitches(addr, true, cycleCount)
      updateAddressTables()
    }
    return
  }
  const shifted = addressSetTable[page]
  if (shifted < 0) return
  memory[shifted + (addr & 255)] = value
}

export const memGetC000 = (addr: number) => {
  return memory[ROMstartMinusC000 + addr]
}

export const memSetC000 = (addr: number, value: number, repeat = 1) => {
  const start = ROMstartMinusC000 + addr
  memory.fill(value, start, start + repeat)
}

const TEXT_PAGE1 = 0x400
const TEXT_PAGE2 = 0x800
const offset = [
  0, 0x80, 0x100, 0x180, 0x200, 0x280, 0x300, 0x380, 0x28, 0xA8, 0x128, 0x1A8,
  0x228, 0x2A8, 0x328, 0x3A8, 0x50, 0xD0, 0x150, 0x1D0, 0x250, 0x2D0, 0x350,
  0x3D0,
]

export const getTextPage = (getLores = false) => {
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
        textPage[joffset + 2 * i + 1] = memory[pageOffset + offset[j] + i]
        textPage[joffset + 2 * i] = memory[AUXstart + pageOffset + offset[j] + i]
      }
    }
    return textPage
  } else {
    const pageOffset = SWITCHES.PAGE2.isSet ? TEXT_PAGE2 : TEXT_PAGE1
    const textPage = new Uint8Array(40 * (jend - jstart))
    for (let j = jstart; j < jend; j++) {
      const joffset = 40 * (j - jstart)
      let start = pageOffset + offset[j]
      textPage.set(memory.slice(start, start + 40), joffset)
    }
    return textPage
  }
}

export const getTextPageAsString = () => {
  return Buffer.from(getTextPage().map((n) => (n &= 127))).toString()
}

export const getHires = () => {
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
        hgrPage[j * 80 + 2 * i + 1] = memory[addr + i]
        hgrPage[j * 80 + 2 * i] = memory[AUXstart + addr + i]
      }
    }
    return hgrPage
  } else {
    const pageOffset = SWITCHES.PAGE2.isSet ? 0x4000 : 0x2000
    const hgrPage = new Uint8Array(40 * nlines)
    for (let j = 0; j < nlines; j++) {
      const addr = pageOffset + 40 * Math.trunc(j / 64) +
        1024 * (j % 8) + 128 * (Math.trunc(j / 8) & 7)
      hgrPage.set(memory.slice(addr, addr + 40), j * 40)
    }
    return hgrPage
  }
}

export const getDataBlock = (addr: number) => {
  const offset = addressGetTable[addr >>> 8]
  return memory.slice(offset, offset + 512)
}

export const setDataBlock = (addr: number, data: Uint8Array) => {
  const offset = addressSetTable[addr >>> 8] + (addr & 255)
  memory.set(data, offset)
  handleGameSetup()
}

export const matchMemory = (addr: number, data: number[]) => {
  for (let i = 0; i < data.length; i++) {
   if (memGet(addr + i) !== data[i]) return false
  }
  return true
}