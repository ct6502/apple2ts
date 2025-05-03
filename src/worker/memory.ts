import { SWITCHES, checkSoftSwitches } from "./softswitches"
import { s6502 } from "./instructions"
import { romBase64 as romBase64e } from "./roms/rom_2e"
import { romBase64 as romBase64u } from "./roms/rom_2e_unenhanced"
// import { edmBase64 } from "./roms/edm_2e"
import { Buffer } from "buffer"
// import { isDebugging } from "./motherboard";
import { RamWorksMemoryStart, RamWorksPage, ROMpage, ROMmemoryStart, hiresLineToAddress, toHex } from "../common/utility"
import { isWatchpoint, setWatchpointBreak } from "./cpu6502"
import { noSlotClock } from "./nsc"

// 0x00000: main memory
// 0x10000...13FFF: ROM (including page $C0 soft switches)
// 0x14000...146FF: Peripheral card ROM $C100-$C7FF
// 0x14700...17EFF: Slots 1-7 (8*256 byte $C800-$CFFF range for each card)
// 0x17F00...: AUX/RamWorks memory (AUX is RamWorks bank 0)
// Bank1 of $D000-$DFFF is stored at 0x*D000-0x*DFFF (* 0 for main, 1 for aux)
// Bank2 of $D000-$DFFF is stored at 0x*C000-0x*CFFF (* 0 for main, 1 for aux)

const SLOTindex = 0x140
const SLOTC8index = 0x147
const SLOTstart = 256 * SLOTindex
const SLOTC8start = 256 * SLOTC8index

// Start out with only 64K of AUX memory.
// This is the maximum bank number. Each index represents 64K.
export let RamWorksMaxBank = 0
const BaseMachineMemory = RamWorksMemoryStart
export let memory = (new Uint8Array(BaseMachineMemory + (RamWorksMaxBank + 1) * 0x10000)).fill(0)

// Fake status flag indicating which slot has access to $C800-$CFFF.
//   0: No slot selected but INTC8ROM is off
// 1-7: Slot number for peripheral ROM
// 255: No slot: INTC8ROM was forced on by SLOTC3ROM switch and access to $C3xx
export const C800SlotGet = () => {
  return memGetC000(0xC02A)
}

const C800SlotSet = (slot: number) => {
  memSetC000(0xC02A, slot)
}

export const RamWorksBankGet = () => {
  return memGetC000(0xC073)
}

const RamWorksBankSet = (bank: number) => {
  memSetC000(0xC073, bank)
}

// Mappings from real Apple II address to memory array above.
// 256 pages of memory, from $00xx to $FFxx.
// Include one extra slot, to avoid needing memory checks for > 65535.
export const addressGetTable = (new Array<number>(257)).fill(0)
const addressSetTable = (new Array<number>(257)).fill(0)

export const doSetRom = (machineName: MACHINE_NAME) => {
  let romStr = ""
  switch (machineName) {
    case "APPLE2EU":
      romStr = romBase64u
      break
    case "APPLE2EE":
      romStr = romBase64e
      break
  }
  // For now, comment out the use of the Extended Debugging Monitor
  // It's unclear what the benefit is, especially since we have a separate
  // TypeScript debugger. And there is a risk that some programs might
  // behave differently with the EDM.
  // if (isDebugging) romStr = edmBase64
  const rom64 = romStr.replace(/\n/g, "")
  const rom = new Uint8Array(
    Buffer.from(rom64, "base64")
  )
  // Hack: The IIe enhanced checks 3 bytes in each slot to determine if there
  // is a disk drive. If memory locations $Cx01, $Cx03, and $Cx05 contain
  // the values $20, $00, $03 then it's a disk drive (hard drive or floppy).
  // The IIe unenhanced checks 4 bytes. The last byte checked is at $C707 and
  // is expected to be $3C. However, the value will only be $3C for a
  // floppy drive. A SmartPort hard drive will have the value $00.
  // The result is that on an unenhanced IIe, the SmartPort hard drive will
  // be skipped and the machine will always try to boot slot 6.
  // To work around this, hack the monitor ROM to only check the first
  // 3 bytes. This will allow the SmartPort hard drive to be booted.
  if (machineName === "APPLE2EU") {
    // Change LDA #$07 to LDA #$05
    rom[0xFABB - 0xC000] = 0x05
  }
  memory.set(rom, ROMmemoryStart)
}

export const setRamWorks = (size: number) => {
  // Clamp to 64K...16M and make sure it is a multiple of 64K
  size = Math.max(64, Math.min(8192, size))
  const oldMaxBank = RamWorksMaxBank
  // For 64K this will be zero
  RamWorksMaxBank = Math.floor(size / 64) - 1

  // Nothing to do?
  if (RamWorksMaxBank === oldMaxBank) return

  // If our current bank index is out of range, just reset it
  if (RamWorksBankGet() > RamWorksMaxBank) {
    RamWorksBankSet(0)
    updateAddressTables()
  }

  // Reallocate memory and copy the old memory
  const newMemSize = BaseMachineMemory + (RamWorksMaxBank + 1) * 0x10000
  if (RamWorksMaxBank < oldMaxBank) {
    // We are shrinking memory, just keep the first part
    memory = memory.slice(0, newMemSize)
  } else {
    // We are expanding memory, copy the old memory
    const memtemp = memory
    memory = (new Uint8Array(newMemSize)).fill(0xFF)
    memory.set(memtemp)
  }
}

const updateMainAuxMemoryTable = () => {
  const offsetAuxRead = SWITCHES.RAMRD.isSet ? (RamWorksPage + RamWorksBankGet() * 256) : 0
  const offsetAuxWrite = SWITCHES.RAMWRT.isSet ? (RamWorksPage + RamWorksBankGet() * 256) : 0
  const offsetPage2 = SWITCHES.PAGE2.isSet ? (RamWorksPage + RamWorksBankGet() * 256) : 0
  const offsetTextPageRead = SWITCHES.STORE80.isSet ? offsetPage2 : offsetAuxRead
  const offsetTextPageWrite = SWITCHES.STORE80.isSet ? offsetPage2 : offsetAuxWrite
  const offsetHgrPageRead = (SWITCHES.STORE80.isSet && SWITCHES.HIRES.isSet) ? offsetPage2 : offsetAuxRead
  const offsetHgrPageWrite = (SWITCHES.STORE80.isSet && SWITCHES.HIRES.isSet) ? offsetPage2 : offsetAuxWrite
  for (let i = 2; i < 256; i++) {
    addressGetTable[i] = i + offsetAuxRead
    addressSetTable[i] = i + offsetAuxWrite
  }
  for (let i = 4; i <= 7; i++) {
    addressGetTable[i] = i + offsetTextPageRead
    addressSetTable[i] = i + offsetTextPageWrite
  }
  for (let i = 0x20; i <= 0x3F; i++) {
    addressGetTable[i] = i + offsetHgrPageRead
    addressSetTable[i] = i + offsetHgrPageWrite
  }
}

const updateReadBankSwitchedRamTable = () => {
  // if (SWITCHES.ALTZP.isSet) {  // DEBUG
  //   console.log(`RamWorksPage: ${toHex(RamWorksPage)}, RamWorksBankGet(): ${RamWorksBankGet()}`)
  // }
  const offsetZP = SWITCHES.ALTZP.isSet ? (RamWorksPage + RamWorksBankGet() * 256) : 0
  addressGetTable[0] = offsetZP
  addressGetTable[1] = 1 + offsetZP
  addressSetTable[0] = offsetZP
  addressSetTable[1] = 1 + offsetZP
  if (SWITCHES.BSRREADRAM.isSet) {
    for (let i = 0xD0; i <= 0xFF; i++) {
      addressGetTable[i] = i + offsetZP
    }
    if (!SWITCHES.BSRBANK2.isSet) {
      // Bank1 of $D000-$DFFF is actually in 0xC0...0xCF
      for (let i = 0xD0; i <= 0xDF; i++) {
        addressGetTable[i] = i - 0x10 + offsetZP
      }
    }
  } else {
    // ROM ($D000...$FFFF)
    for (let i = 0xD0; i <= 0xFF; i++) {
      addressGetTable[i] = ROMpage + i - 0xC0
    }
  }
}

const updateWriteBankSwitchedRamTable = () => {
  const offsetZP = SWITCHES.ALTZP.isSet ? (RamWorksPage + RamWorksBankGet() * 256) : 0
  const writeRAM = SWITCHES.BSR_WRITE.isSet
  // Start out with Slot ROM and regular ROM as not writeable
  for (let i = 0xC0; i <= 0xFF; i++) {
    addressSetTable[i] = -1
  }
  if (writeRAM) {
    for (let i = 0xD0; i <= 0xFF; i++) {
      addressSetTable[i] = i + offsetZP
    }
    if (!SWITCHES.BSRBANK2.isSet) {
      // Bank1 of $D000-$DFFF is actually in 0xC0...0xCF
      for (let i = 0xD0; i <= 0xDF; i++) {
        addressSetTable[i] = i - 0x10 + offsetZP
      }
    }
  }
}

const slotIsActive = (slot: number) => {
  if (SWITCHES.INTCXROM.isSet) return false
  // SLOTC3ROM switch only has an effect if INTCXROM is off
  return (slot !== 3) ? true : SWITCHES.SLOTC3ROM.isSet
}

// Understanding the Apple IIe, Jim Sather, p. 5-28
// INTC8ROM: Unreadable soft switch
//   Set:   On access to $C3XX with SLOTC3ROM reset
//			- "From this point, $C800-$CFFF will stay assigned to motherboard ROM until
//			   an access is made to $CFFF or until the MMU detects a system reset."
//   Reset: On access to $CFFF or an MMU reset
//
// This is like a fake peripheral card in slot 3 (the 80-column card),
// where the internal $C800-$CFFF ROM is the fake card's peripheral ROM.
//
// INTCXROM   INTC8ROM   $C800-CFFF
//    0           0         slot   
//    0           1       internal 
//    1           0       internal 
//    1           1       internal 
//
const internalC8ROMIsActive = () => {
  if (SWITCHES.INTCXROM.isSet || SWITCHES.INTC8ROM.isSet) {
    return true
  }
  // CT, I disabled this because it broke the a2audit test,
  // and I couldn't find a reference for this "one cycle".
  // If it is true that this should happen for one cycle after $CFFF,
  // then we need to add some kind of counter to turn it off.
  // Will happen for one cycle after $CFFF in slot ROM,
  // or if $CFFF was accessed outside of slot ROM space.
  // if (C800SlotGet() === 0 || C800SlotGet() === 255) {
  //   return true
  // }
  // $C800-$CFFF Slot ROM is active
  return false
}

const manageC800 = (slot: number) => {

  if (slot <= 7) {
    if (SWITCHES.INTCXROM.isSet) {
      return
    }
    // This combination forces INTC8ROM on.
    if (slot === 3 && !SWITCHES.SLOTC3ROM.isSet) {
      if (!SWITCHES.INTC8ROM.isSet) {
        SWITCHES.INTC8ROM.isSet = true
        C800SlotSet(255)
        updateAddressTables()
      }
    }

    // If C800Slot is zero, then possibly set it to first card accessed
    if (C800SlotGet() === 0) {
      // Only switch C8 space if slot has extended ROM
      // In a real system, not all cards respond to /IOSTROBE
      if (slotIOC8Space[slot])
      {
        C800SlotSet(slot)
        updateAddressTables()
      }
    }
  } else {
    // If slot > 7 then it was an access to $CFFF.
    // Accessing $CFFF resets our fake INTC8ROM to peripheral ROM.
    SWITCHES.INTC8ROM.isSet = false
    C800SlotSet(0)
    updateAddressTables()
  }
}

const updateSlotRomTable = () => {
  // ROM ($C000...$CFFF) is in 0x100...0x10F
  addressGetTable[0xC0] = ROMpage - 0xC0
  for (let slot = 1; slot <= 7; slot++) {
    const page = 0xC0 + slot
    addressGetTable[page] = slot +
      (slotIsActive(slot) ? (SLOTindex - 1) : ROMpage)
  }

  // Fill in $C800-CFFF for cards
  if (internalC8ROMIsActive()) {
    for (let i = 0xC8; i <= 0xCF; i++) {
      addressGetTable[i] = ROMpage + i - 0xC0
    }
  } else {
    const slotC8 = SLOTC8index + 8 * (C800SlotGet() - 1)
    for (let i = 0; i <= 7; i++) {
      const page = 0xC8 + i
      addressGetTable[page] = slotC8 + i
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
    addressGetTable[i] = 256 * addressGetTable[i]
    addressSetTable[i] = 256 * addressSetTable[i]
  }
}

// Used for jumping to custom TS functions when program counter hits an address.
export const specialJumpTable = new Map<number, () => void>()

// Custom callbacks for mem get/set to $C090-$C0FF slot I/O and $C100-$C7FF.
const slotIOCallbackTable = new Array<AddressCallback>(8)

// Determines whether slot has C800 space ROM or not
const slotIOC8Space = new Uint8Array(8)

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
      const offset = (addr >= 0xC100) ? (SLOTstart - 0x100) : ROMmemoryStart
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
  slotIOCallbackTable[slot] = fn
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
    const end = (driver.length > 0x900) ? 0x900 : driver.length
    const addr = SLOTC8start + (slot - 1) * 0x800
    memory.set(driver.slice(0x100,end), addr)
    // mark this slot as having C8 space
    slotIOC8Space[slot] = 0xff
  }
  if (jump) {
    specialJumpTable.set(jump, fn)
  }
}

export const memoryReset = () => {
  // Reset memory but skip over the ROM and peripheral card areas
  memory.fill(0xFF, 0, 0x10000)
  // Everything past here is RamWorks memory
  memory.fill(0xFF, BaseMachineMemory)
  C800SlotSet(0)
  RamWorksBankSet(0)
  updateAddressTables()
}

// Fill all pages of either main or aux memory with 0, 1, 2,...
export const memorySetForTests = (aux = false) => {
  memoryReset()
  doSetRom("APPLE2EE")
  const offset = aux ? RamWorksMemoryStart : 0
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
  if (addr >= 0xC090) {
    checkSlotIO(addr)
  } else {
    checkSoftSwitches(addr, false, s6502.cycleCount)
  }
  if (addr >= 0xC050) {
    updateAddressTables()
  }
  return memory[ROMmemoryStart + addr - 0xC000]
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

export const debugSlot = (slot: number, addr: number, oldvalue: number, value = -1) => {
  if (!slotIsActive(slot)) return
  if (((addr - 0xC080) >> 4) === slot || ((addr >> 8) - 0xC0) === slot) {
    let s = `$${s6502.PC.toString(16)}: $${addr.toString(16)} (${oldvalue})`
    if (value >= 0) s += ` = $${value.toString(16)}`
    console.log(s)
  }
}

export const memGet = (addr: number, checkWatchpoints = true): number => {
  let value = 0
  const page = addr >>> 8
  // debugSlot(4, addr)
  if (page === 0xC0) {
    value = memGetSoftSwitch(addr)
  } else {
    value = -1
    if (page >= 0xC1 && page <= 0xC7) {
      if (page == 0xC3 && (SWITCHES.INTCXROM.isSet || !SWITCHES.SLOTC3ROM.isSet)) {
        // NSC answers in slot C3 memory to be compatible with standard ProDOS driver and A2osX
        value = noSlotClock.read(addr)
      }
      checkSlotIO(addr)
    } else if (addr === 0xCFFF) {
      manageC800(0xFF)
    }
    if (value < 0) {
      const shifted = addressGetTable[page]
      value = memory[shifted + (addr & 255)]
    }
  }
  if (checkWatchpoints && isWatchpoint(addr, value, false)) {
    setWatchpointBreak()
  }
  return value
}

export const memGetRaw = (addr: number): number => {
  const page = addr >>> 8
  const shifted = addressGetTable[page]
  return memory[shifted + (addr & 255)]
}

const memSetSoftSwitch = (addr: number, value: number) => {
  // these are write-only soft switches that don't work like the others, since
  // we need the full byte of data being written
  if (addr === 0xC071 || addr === 0xC073) {
    // Out of range bank index?
    if (value > RamWorksMaxBank) return
    // The 0th bank is also AUX memory
    RamWorksBankSet(value)
  } else if (addr >= 0xC090) {
    checkSlotIO(addr, value)
  } else {
    checkSoftSwitches(addr, true, s6502.cycleCount)
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
      manageC800(0xFF)
    }
    const shifted = addressSetTable[page]
    // This will prevent us from setting slot ROM or motherboard ROM
    if (shifted < 0) return
    memory[shifted + (addr & 255)] = value
  }
  if (isWatchpoint(addr, value, true)) {
    setWatchpointBreak()
  }
}

export const memGetC000 = (addr: number) => {
  return memory[ROMmemoryStart + addr - 0xC000]
}

export const memSetC000 = (addr: number, value: number, repeat = 1) => {
  const start = ROMmemoryStart + addr - 0xC000
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
    is80column = SWITCHES.COLUMN80.isSet && SWITCHES.DHIRES.isSet
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
        // Interleave the characters, aux memory comes first for each pair.
        textPage[joffset + 2 * i + 1] = memory[pageOffset + offset[j] + i]
        textPage[joffset + 2 * i] = memory[RamWorksMemoryStart + pageOffset + offset[j] + i]
      }
    }
    return textPage
  }

  // See Video-7 RGB-SL7 manual, section 7.1, p. 35
  // https://mirrors.apple2.org.za/ftp.apple.asimov.net/documentation/hardware/video/Video-7%20RGB-SL7.pdf
  const isVideo7Text = SWITCHES.DHIRES.isSet && !SWITCHES.COLUMN80.isSet && SWITCHES.STORE80.isSet
  if (isVideo7Text) {
    const textPage = new Uint8Array(80 * (jend - jstart))
    for (let j = jstart; j < jend; j++) {
      const joffset = 80 * (j - jstart)
      // Put the actual character in the first half of the line,
      // and the color information in the second half.
      let memoffset = TEXT_PAGE1 + offset[j]
      textPage.set(memory.slice(memoffset, memoffset + 40), joffset)
      memoffset += RamWorksMemoryStart
      textPage.set(memory.slice(memoffset, memoffset + 40), joffset + 40)
    }
    return textPage
  }

  // Normal 40-column text page
  const pageOffset = SWITCHES.PAGE2.isSet ? TEXT_PAGE2 : TEXT_PAGE1
  const textPage = new Uint8Array(40 * (jend - jstart))
  for (let j = jstart; j < jend; j++) {
    const joffset = 40 * (j - jstart)
    const start = pageOffset + offset[j]
    textPage.set(memory.slice(start, start + 40), joffset)
  }
  return textPage
}

export const getTextPageAsString = () => {
  return Buffer.from(getTextPage().map((n) => (n &= 127))).toString()
}

export const getHires = () => {
  if (SWITCHES.TEXT.isSet || !SWITCHES.HIRES.isSet) {
    return new Uint8Array()
  }
  const doubleRes = SWITCHES.COLUMN80.isSet && SWITCHES.DHIRES.isSet
  const nlines = SWITCHES.MIXED.isSet ? 160 : 192
  if (doubleRes) {
    // Only select second 80-column text page if STORE80 is also OFF
    const pageOffset = (SWITCHES.PAGE2.isSet && !SWITCHES.STORE80.isSet) ? 0x4000 : 0x2000
    const hgrPage = new Uint8Array(80 * nlines)
    for (let j = 0; j < nlines; j++) {
      const addr = hiresLineToAddress(pageOffset, j)
      for (let i = 0; i < 40; i++) {
        hgrPage[j * 80 + 2 * i + 1] = memory[addr + i]
        hgrPage[j * 80 + 2 * i] = memory[RamWorksMemoryStart + addr + i]
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
}

export const matchMemory = (addr: number, data: number[]) => {
  for (let i = 0; i < data.length; i++) {
   if (memGet(addr + i, false) !== data[i]) return false
  }
  return true
}

export const getZeroPage = () => {
  const status = [""]
  const offset = addressGetTable[0]
  const mem = memory.slice(offset, offset + 256)
  status[0] = "     0  1  2  3  4  5  6  7  8  9  A  B  C  D  E  F"
  for (let j = 0; j < 16; j++) {
    let s = toHex(16 * j) + ":"
    for (let i = 0; i < 16; i++) {
      s += " " + toHex(mem[j * 16 + i])
    }
    status[j + 1] = s
  }
  return status.join("\n")
}

export const getBasePlusAuxMemory = () => {
  return memory.slice(0, RamWorksMemoryStart + 0x10000)
}

