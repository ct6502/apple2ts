// Each memory bank object has a human-readable name, a min/max address range
// where the bank is valid, and a function to determine if the bank is enabled.
export const MEMORY_BANKS: MemoryBanks = {}

// Should never be invoked but we need it for the droplist in the Edit Breakpoint dialog.
MEMORY_BANKS[""] = {name: "Any", min: 0, max: 0xFFFF}

// These all have an optional "enabled" function. We do not want to fill that in
// here because the logic depends upon the state of the soft switches.
// Intead, we will add the function calls within the cpu6502 file.
MEMORY_BANKS["MAIN"] = {name: "Main RAM ($0 - $FFFF)", min: 0, max: 0xFFFF}
MEMORY_BANKS["AUX"] = {name: "Auxiliary RAM ($0 - $FFFF)", min: 0x0000, max: 0xFFFF}
MEMORY_BANKS["ROM"] = {name: "ROM ($D000 - $FFFF)", min: 0xD000, max: 0xFFFF}
MEMORY_BANKS["MAIN-DXXX-1"] = {name: "Main D000 Bank 1 ($D000 - $DFFF)", min: 0xD000, max: 0xDFFF}
MEMORY_BANKS["MAIN-DXXX-2"] = {name: "Main D000 Bank 2 ($D000 - $DFFF)", min: 0xD000, max: 0xDFFF}
MEMORY_BANKS["AUX-DXXX-1"] = {name: "Aux D000 Bank 1 ($D000 - $DFFF)", min: 0xD000, max: 0xDFFF}
MEMORY_BANKS["AUX-DXXX-2"] = {name: "Aux D000 Bank 2 ($D000 - $DFFF)", min: 0xD000, max: 0xDFFF}
MEMORY_BANKS["CXXX-ROM"] = {name: "Internal ROM ($C100 - $CFFF)", min: 0xC100, max: 0xCFFF}
MEMORY_BANKS["CXXX-CARD"] = {name: "Peripheral Card ROM ($C100 - $CFFF)", min: 0xC100, max: 0xCFFF}

export const MemoryBankKeys = Object.keys(MEMORY_BANKS)
export const MemoryBankNames: string[] = Object.values(MEMORY_BANKS).map(bank => bank.name)
