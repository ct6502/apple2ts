import { SWITCHES } from "../worker/softswitches"

// Each memory bank object has a human-readable name, a min/max address range

// where the bank is valid, and a function to determine if the bank is enabled.
export const MEMORY_BANKS: MemoryBanks = {}

// Should never be invoked but we need it for the droplist in the Edit Breakpoint dialog.
MEMORY_BANKS[""] = {name: "Any", min: 0, max: 0xFFFF, enabled: () => {return true}}

MEMORY_BANKS["MAIN"] = {name: "Main RAM ($0 - $FFFF)", min: 0, max: 0xFFFF,
  enabled: (addr = 0) => {
    if (addr >= 0xD000) {
      // We are not using our AUX card and we are using bank-switched RAM
      return !SWITCHES.ALTZP.isSet && SWITCHES.BSRREADRAM.isSet
    } else if (addr >= 0x200) {
      // Just look at our regular Main/Aux switch
      return !SWITCHES.RAMRD.isSet
    }
    // For $0-$1FF, look at the AUX ALTZP switch
    return !SWITCHES.ALTZP.isSet}
}

MEMORY_BANKS["AUX"] = {name: "Auxiliary RAM ($0 - $FFFF)", min: 0x0000, max: 0xFFFF,
  enabled: (addr = 0) => {
    if (addr >= 0xD000) {
      // We are using our AUX card and we are also using bank-switched RAM
      return SWITCHES.ALTZP.isSet && SWITCHES.BSRREADRAM.isSet
    } else if (addr >= 0x200) {
      // Just look at our regular Main/Aux switch
      return SWITCHES.RAMRD.isSet
    }
    // For $0-$1FF, look at the AUX ALTZP switch
    return SWITCHES.ALTZP.isSet}
}

MEMORY_BANKS["ROM"] = {name: "ROM ($D000 - $FFFF)", min: 0xD000, max: 0xFFFF,
  enabled: () => {return !SWITCHES.BSRREADRAM.isSet}}

MEMORY_BANKS["MAIN-DXXX-1"] = {name: "Main D000 Bank 1 ($D000 - $DFFF)", min: 0xD000, max: 0xDFFF,
  enabled: () => { return !SWITCHES.ALTZP.isSet && SWITCHES.BSRREADRAM.isSet && !SWITCHES.BSRBANK2.isSet }}

MEMORY_BANKS["MAIN-DXXX-2"] = {name: "Main D000 Bank 2 ($D000 - $DFFF)", min: 0xD000, max: 0xDFFF,
  enabled: () => {return !SWITCHES.ALTZP.isSet && SWITCHES.BSRREADRAM.isSet && SWITCHES.BSRBANK2.isSet}}

MEMORY_BANKS["AUX-DXXX-1"] = {name: "Aux D000 Bank 1 ($D000 - $DFFF)", min: 0xD000, max: 0xDFFF,
  enabled: () => { return SWITCHES.ALTZP.isSet && SWITCHES.BSRREADRAM.isSet && !SWITCHES.BSRBANK2.isSet }}

MEMORY_BANKS["AUX-DXXX-2"] = {name: "Aux D000 Bank 2 ($D000 - $DFFF)", min: 0xD000, max: 0xDFFF,
  enabled: () => {return SWITCHES.ALTZP.isSet && SWITCHES.BSRREADRAM.isSet && SWITCHES.BSRBANK2.isSet}}

MEMORY_BANKS["CXXX-ROM"] = {name: "Internal ROM ($C100 - $CFFF)", min: 0xC100, max: 0xCFFF,
  enabled: (addr = 0) => {
    if (addr >= 0xC300 && addr <= 0xC3FF) {
      return SWITCHES.INTCXROM.isSet || !SWITCHES.SLOTC3ROM.isSet
    } else if (addr >= 0xC800) {
      return SWITCHES.INTCXROM.isSet || SWITCHES.INTC8ROM.isSet
    }
    return SWITCHES.INTCXROM.isSet}
}

MEMORY_BANKS["CXXX-CARD"] = {name: "Peripheral Card ROM ($C100 - $CFFF)", min: 0xC100, max: 0xCFFF,
  enabled: (addr = 0) => {
    if (addr >= 0xC300 && addr <= 0xC3FF) {
      return SWITCHES.INTCXROM.isSet ? false : SWITCHES.SLOTC3ROM.isSet
    } else if (addr >= 0xC800) {
      // Both switches need to be off for addresses $C800-$CFFF to come from cards
      return !SWITCHES.INTCXROM.isSet && !SWITCHES.INTC8ROM.isSet
    }
    return !SWITCHES.INTCXROM.isSet}
}

export const MemoryBankKeys = Object.keys(MEMORY_BANKS);
export const MemoryBankNames: string[] = Object.values(MEMORY_BANKS).map(bank => bank.name);
