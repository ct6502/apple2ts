import { SWITCHES, checkSoftSwitches } from "./softswitches";
import { cycleCount, s6502 } from "./instructions"
import { romBase64 } from "./roms/rom_2e"
import { Buffer } from "buffer";
import { handleGameSetup } from "./game_mappings";
import { inVBL } from "./motherboard";

// 0x00000: main memory
// 0x10000: aux memory 
// 0x20000...23FFF: ROM (including page $C0 soft switches)
// 0x24000...246FF: Peripheral card ROM $C100-$C7FF
// 0x24700...27EFF: Slots 1-7 (8*256 byte $C800-$CFFF range for each card)
// Bank1 of $D000-$DFFF is stored at 0x*D000-0x*DFFF (* 0 for main, 1 for aux)
// Bank2 of $D000-$DFFF is stored at 0x*C000-0x*CFFF (* 0 for main, 1 for aux)
export let memory = (new Uint8Array(0x27F00)).fill(0)

// Mappings from real Apple II address to memory array above.
// 256 pages of memory, from $00xx to $FFxx.
// Include one extra slot, to avoid needing memory checks for > 65535.
const addressGetTable = (new Array<number>(257)).fill(0)
const addressSetTable = (new Array<number>(257)).fill(0)

const ROMindex = 0x200
const SLOTindex = 0x240
const SLOTC8index = 0x247
const AUXindex = 0x100
const ROMstart = 256 * ROMindex
const SLOTstart = 256 * SLOTindex
const SLOTC8start = 256 * SLOTC8index
const AUXstart = 256 * AUXindex
let   C800Slot = 0

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
    // ROM ($D000...$FFFF) is in 0x210...0x23F
    for (let i = 0xD0; i <= 0xFF; i++) {
      addressGetTable[i] = ROMindex + i - 0xC0;
    }
  }
}

const updateWriteBankSwitchedRamTable = () => {
  const offsetZP = SWITCHES.ALTZP.isSet ? AUXindex : 0
  const writeRAM = SWITCHES.WRITEBSR1.isSet || SWITCHES.WRITEBSR2.isSet ||
    SWITCHES.RDWRBSR1.isSet || SWITCHES.RDWRBSR2.isSet
  // Start out with Slot ROM and regular ROM as not writeable
  for (let i = 0xC0; i <= 0xFF; i++) {
    addressSetTable[i] = -1;
  }
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
  }
}

const slotIsActive = (slot: number) => {
  if (SWITCHES.INTCXROM.isSet) return false
  // SLOTC3ROM switch only has an effect if INTCXROM is off
  return (slot !== 3) ? true : SWITCHES.SLOTC3ROM.isSet
}

// Below description modified from AppleWin source
//
// INTC8ROM: Unreadable soft switch (UTAIIe:5-28)
// . Set:   On access to $C3XX with SLOTC3ROM reset
//			- "From this point, $C800-$CFFF will stay assigned to motherboard ROM until
//			   an access is made to $CFFF or until the MMU detects a system reset."
// . Reset: On access to $CFFF or an MMU reset
//
// - Acts like a card in slot 3, except it doesn't require CFFF to activate like
//   a slot.
//
// INTCXROM   INTC8ROM   $C800-CFFF
//    0           0         slot   
//    0           1       internal 
//    1           0       internal 
//    1           1       internal 

const slotC8IsActive = () => {
  if (SWITCHES.INTCXROM.isSet || SWITCHES.INTC8ROM.isSet) return false
  // Will happen for one cycle after $CFFF in slot ROM,
  // or if $CFFF was accessed outside of slot ROM space.
  if (C800Slot <= 0) return false
  return true
}

const manageC800 = (slot: number) => {

  if (slot < 8) {
    if (SWITCHES.INTCXROM.isSet)
      return

    // This combination forces INTC8ROM on
    if (slot === 3 && !SWITCHES.SLOTC3ROM.isSet) {
      if (!SWITCHES.INTC8ROM.isSet) {
        SWITCHES.INTC8ROM.isSet = true
        C800Slot = -1
        updateAddressTables()
      }
    }
    if (C800Slot === 0) {
      // If C800Slot is zero, then set it to first card accessed
      C800Slot = slot
      updateAddressTables();
    }
  } else {
    // if slot > 7 then it was an access to $CFFF
    // accessing $CFFF resets everything WRT C8
    SWITCHES.INTC8ROM.isSet = false
    C800Slot = 0
    updateAddressTables()
  }
}

const updateSlotRomTable = () => {
  // ROM ($C000...$CFFF) is in 0x200...0x20F
  addressGetTable[0xC0] = ROMindex - 0xC0
  for (let slot = 1; slot <= 7; slot++) {
    const page = 0xC0 + slot
    addressGetTable[page] = slot +
      (slotIsActive(slot) ? (SLOTindex - 1) : ROMindex)
  }

  // Fill in $C800-CFFF for cards
  if (slotC8IsActive()) {
    const slotC8 = SLOTC8index + 8 * (C800Slot - 1)
    for (let i = 0; i <= 7; i++) {
      const page = 0xC8 + i
      addressGetTable[page] = slotC8 + i;
    }
  }
  else {
    for (let i = 0xC8; i <= 0xCF; i++) {
      addressGetTable[i] = ROMindex + i - 0xC0;
    }
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

// Used for jumping to custom TS functions when program counter hits an address.
export const specialJumpTable = new Map<number, () => void>();

// Custom callbacks for mem get/set to $C090-$C0FF slot I/O and $C100-$C7FF.
const slotIOCallbackTable = new Array<AddressCallback>(8)

// Value = -1 indicates that this was a read/get operation
const checkSlotIO = (addr: number, value = -1) => {
  const slot = ((addr >> 8) === 0xC0) ? ((addr - 0xC080) >> 4) : ((addr >> 8) - 0xC0)
  if (addr >= 0xC100) {
    manageC800(slot)
    if (!slotIsActive(slot))
      return
  }
  const fn = slotIOCallbackTable[slot]
  if (fn !== undefined) {
    const result = fn(addr, value)
    if (result >= 0) {
      // Set value in either slot memory or $C000 softswitch memory
      const offset = (addr >= 0xC100) ? (SLOTstart - 0x100) : ROMstart
      memory[addr - 0xC000 + offset] = result
    }
  }
}

/**
 * Add peripheral card IO callback.
 *
 * @param slot - The slot number 1-7.
 * @param fn - A function to jump to when IO of this slot is accessed
 */
export const setSlotIOCallback = (slot: number, fn: AddressCallback) => {
  slotIOCallbackTable[slot] = fn;
}

/**
 * Add peripheral card ROM.
 *
 * @param slot - The slot number 1-7.
 * @param driver - The ROM code for the driver.
 *                 Range 0x00-0xff is the slot Cx00 space driver
 *                 Anything above is considered C800 space to be activated for this card.
 * @param jump - (optional) If the program counter equals this address, then `fn` will be called.
 * @param fn - (optional) The function to jump to.
 */
export const setSlotDriver = (slot: number, driver: Uint8Array, jump = 0, fn = () => {}) => {
  memory.set(driver.slice(0, 0x100), SLOTstart + (slot - 1) * 0x100)
  if (driver.length > 0x100) {
    // only allow up to 2k for C8 range
    const end = (driver.length > 0x900) ? 0x900 : driver.length;
    const addr = SLOTC8start + (slot - 1) * 0x800
    memory.set(driver.slice(0x100,end), addr)
  }
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
  memory.set(rom, ROMstart)
  C800Slot = 0
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

const memGetSoftSwitch = (addr: number): number => {
  // $C019 Vertical blanking status (0 = vertical blanking, 1 = beam on)
  if (addr === 0xC019) {
    // Return "low" for 70 scan lines out of 262 (70 * 65 cycles = 4550)
    return inVBL ? 0x0D : 0x8D
  }
  if (addr >= 0xC090) {
    checkSlotIO(addr)
  } else {
    checkSoftSwitches(addr, false, cycleCount)
  }
  if (addr >= 0xC050) {
    updateAddressTables()
  }
  return memory[ROMstart + addr - 0xC000]
}

export const memGetSlotROM = (slot: number, addr: number) => {
  const offset = SLOTstart + (slot - 1) * 0x100 + (addr & 0xFF)
  return memory[offset]
}

export const memSetSlotROM = (slot: number, addr: number, value: number) => {
  if (value >= 0) {
    const offset = SLOTstart + (slot - 1) * 0x100 + (addr & 0xFF)
    memory[offset] = value & 0xFF
  }
}

export const debugSlot = (slot: number, addr: number, value = -1) => {
  if (!slotIsActive(slot)) return
  if (((addr - 0xC080) >> 4) === slot || ((addr >> 8) - 0xC0) === slot) {
    let s = `******************** $${s6502.PC.toString(16)}: $${addr.toString(16)}`
    if (value >= 0) s += ` = $${value.toString(16)}`
    console.log(s)
  }
}

export const memGet = (addr: number): number => {
  const page = addr >>> 8
  // debugSlot(4, addr)
  if (page === 0xC0) {
    return memGetSoftSwitch(addr)
  }
  if (page >= 0xC1 && page <= 0xC7) {
    checkSlotIO(addr)
  } else if (addr === 0xCFFF) {
    manageC800(0xFF);
  }
  const shifted = addressGetTable[page]
  return memory[shifted + (addr & 255)]
}

const memSetSoftSwitch = (addr: number, value: number) => {
  if (addr >= 0xC090) {
    checkSlotIO(addr, value)
  } else {
    checkSoftSwitches(addr, true, cycleCount)
  }
  if (addr <= 0xC00F || addr >= 0xC050) {
    updateAddressTables()
  }
}

export const memSet = (addr: number, value: number) => {
  const page = addr >>> 8
  // debugSlot(4, addr, value)
  if (page === 0xC0) {
    memSetSoftSwitch(addr, value)
  } else {
    if (page >= 0xC1 && page <= 0xC7) {
      checkSlotIO(addr, value)
    } else if (addr === 0xCFFF) {
      manageC800(0xFF);
    }
    const shifted = addressSetTable[page]
    // This will prevent us from setting slot ROM or motherboard ROM
    if (shifted < 0) return
    memory[shifted + (addr & 255)] = value
  }
}

export const memGetC000 = (addr: number) => {
  return memory[ROMstart + addr - 0xC000]
}

export const memSetC000 = (addr: number, value: number, repeat = 1) => {
  const start = ROMstart + addr - 0xC000
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

export const setMemoryBlock = (addr: number, data: Uint8Array) => {
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
