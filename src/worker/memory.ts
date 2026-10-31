import { SWITCHES, checkSoftSwitches } from "./softswitches"
import { s6502 } from "./instructions"
import { romBase64 as romBase64p } from "./roms/rom_2+"
import { romBase64 as romBase64e } from "./roms/rom_2e"
import { romBase64 as romBase64u } from "./roms/rom_2e_unenhanced"
import { romBase64 as romBase64gs } from "./roms/rom_gs"
import { romGsSystemBase64 } from "./roms/rom_gs_system"
import { romGsSystem03Base64 } from "./roms/rom_gs_system03"
// import { edmBase64 } from "./roms/edm_2e"
import { Buffer } from "buffer"
// import { isDebugging } from "./motherboard";
import { RamWorksMemoryStart, RamWorksPage, ROMpage, ROMmemoryStart, hiresLineToAddress } from "../common/utility"
import { isWatchpoint, observeMemoryWrite, setWatchpointBreak } from "./cpu6502"
import { noSlotClock } from "./nsc"
import { adbLogEnabled, noteAdbLog } from "./iigs_adb"
import { getCpuPc } from "./cpu_pc"
import { videoTerm } from "./devices/videoterm"
import { vidhd } from "./devices/vidhd"
import { isDebugging, setIigsSpeedRegister, getIigsVideoClock, getIigsFrameUnits, isIigsSlowMode } from "./motherboard"
import { iigsClock } from "./iigs_clock"
import { iigsADB } from "./iigs_adb"
import { iigsEnsoniq, docAccess } from "./devices/iigs_ensoniq"
import { iwmAdvance35, iwmFloppySpinning, iwmFlushWrites35, iwmGetSense35, iwmReadDataRegister, iwmReadHandshake35, iwmReadSense525, iwmReset35Lines, iwmResetTiming, iwmStepHead, iwmWriteDataRegister35 } from "./devices/diskdata"
import { getDriveDataByIndex, getDriveStateByIndex } from "./devices/drivestate"

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
// The RamWorks banks are followed by one extra page of 0xFF, which stands in
// for a bank number that has no memory behind it (see auxGetPage).
const memorySize = () => BaseMachineMemory + (RamWorksMaxBank + 1) * 0x10000 + 0x100
const unpopulatedPage = () => memorySize() / 256 - 1
export let memory = (new Uint8Array(memorySize())).fill(0)

const slotHasCard = (new Uint8Array(8)).fill(0)

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
  if (currentMachineName === "APPLE2GS") return 0
  return memGetC000(0xC073)
}

const RamWorksBankSet = (bank: number) => {
  memSetC000(0xC073, bank)
}

// Mappings from real Apple II address to memory array above.
// 256 pages of memory, from $00xx to $FFxx.
// Include one extra slot, to avoid needing memory checks for > 65535.
export const addressGetTable = new Uint32Array(257)
const addressSetTable = new Uint32Array(257)
const ADDRESS_GUARD = 0xFFFFFF

// Table entries for page i of the selected aux bank. The bank select register
// latches whatever is written to it, so a bank number beyond the installed
// memory selects no RAM at all: nothing drives the bus on a read (modeled as
// 0xFF) and a write goes nowhere. On a real RamWorks the bank bits go
// straight to the chip selects, so a partly populated card simply has holes.
const auxBankIsPopulated = () => RamWorksBankGet() <= RamWorksMaxBank
const auxGetPage = (i: number) => auxBankIsPopulated() ?
  (RamWorksPage + RamWorksBankGet() * 256 + i) : unpopulatedPage()
const auxSetPage = (i: number) => auxBankIsPopulated() ?
  (RamWorksPage + RamWorksBankGet() * 256 + i) : ADDRESS_GUARD

let currentMachineName: MACHINE_NAME = "APPLE2EE"

export const heatMapMemGet = new Float64Array(0x10000)
export const heatMapMemSet = new Float64Array(0x10000)
// Tracked incrementally as the heat maps are written, so the UI never has to
// rescan all 65536 entries per frame just to find the peak.
let heatMapMemGetMaxValue = 0
let heatMapMemGetMaxIndex = 0
let heatMapMemSetMaxValue = 0
let heatMapMemSetMaxIndex = 0

export const getHeatMapMemGet = (): Float64Array => {
  if (isDebugging) {
    return heatMapMemGet
  }
  return new Float64Array()
}

export const getHeatMapMemSet = (): Float64Array => {
  if (isDebugging) {
    return heatMapMemSet
  }
  return new Float64Array()
}

export const getHeatMapMemGetMax = () => {
  return { value: heatMapMemGetMaxValue, index: heatMapMemGetMaxIndex }
}

export const getHeatMapMemSetMax = () => {
  return { value: heatMapMemSetMaxValue, index: heatMapMemSetMaxIndex }
}

export const resetHeatMapMemGet = () => {
  heatMapMemGet.fill(0)
  heatMapMemGetMaxValue = 0
  heatMapMemGetMaxIndex = 0
}

export const resetHeatMapMemSet = () => {
  heatMapMemSet.fill(0)
  heatMapMemSetMaxValue = 0
  heatMapMemSetMaxIndex = 0
}

export const getCurrentMachineName = () => {
  return currentMachineName
}

export let gsROM = new Uint8Array(0);
// Apple IIgs system ROM (ROM 01: 128KB at banks $FE-$FF, ROM 03: 256KB at
// banks $FC-$FF). gsROM is the Mega II (IIe) ROM used by the //e machines;
// the IIgs boots from gsSystemROM.
export let gsSystemROM = new Uint8Array(0);
let iigsRomVersion: IigsRomVersion = "01"
// Bank of the first ROM bank in gsSystemROM ($FE for ROM 01, $FC for ROM 03)
// and the file offset of its last bank, which is the IIe-compatibility ROM
// and the source of the language-card / internal-ROM overlay reads.
let iigsRomFirstBank = 0xFE
let iigsRomBankFFOffset = 0x10000
export const setIigsRomVersion = (version: IigsRomVersion) => {
  if (version === iigsRomVersion) return false
  iigsRomVersion = version
  return true
}
// gssquared treats any image with four ROM banks as a ROM 03.
export const isIigsRom03 = () => gsSystemROM.length >= 0x40000
export const iigsRegisters = new Uint8Array(256);
export const megaIIAux = new Uint8Array(65536);
export const megaIIMain = new Uint8Array(65536);
iigsRegisters[0x36] = 0x80; // Default fast speed
// $C02D SLTROMSEL: bit N = 1 maps slot N's card ROM, 0 leaves the motherboard's
// slot firmware mapped. Reset value is 0 (gssquared mmu_iigs); the slot
// configuration sets it at boot and on reset.
export let iigsSlotRegister = 0;
export const setIigsSlotRegister = (val: number) => { iigsSlotRegister = val; };
// IIgs interrupt state, mirroring web-a2e's iigs_memory: $C046 reports which
// sources are pending (bit3 VBL, bit4 quarter-second) plus bit7 = "a source
// is pending AND enabled". The flags survive reads; only $C047 clears them.
let vblPending = false;
let quarterSecondPending = false;
let sccRegSelect = [0, 0]; // [Channel B ($C038), Channel A ($C039)]
let vgcIntReg = 0; // $C023: bit 0: ext int en, bit 1: scanline en, bit 2: 1-sec en, bit 5: scanline asserted, bit 6: 1-sec asserted, bit 7: vgc irq asserted

export const iigsSignalVbl = () => { vblPending = true; };
export const iigsSignalQuarterSecond = () => { quarterSecondPending = true; };
export const iigsSignalOneSecond = () => {
  vgcIntReg |= 0x40; // Bit 6 = 1-sec asserted
  if (vgcIntReg & 0x04) { // Bit 2 = 1-sec enable
    vgcIntReg |= 0x80;
  }
  iigsRegisters[0x23] = vgcIntReg;
};
export const iigsSignalScanline = () => {
  vgcIntReg |= 0x20; // Bit 5 = scanline asserted
  if (vgcIntReg & 0x02) { // Bit 1 = scanline enable
    vgcIntReg |= 0x80;
  }
  iigsRegisters[0x23] = vgcIntReg;
};
export const iigsGetVblPending = () => vblPending;
export const iigsClearInterrupts = () => {
  vblPending = false;
  quarterSecondPending = false;
  sccRegSelect[0] = 0;
  sccRegSelect[1] = 0;
  vgcIntReg = 0;
  iigsRegisters[0x23] = 0;
  (globalThis as any).cpu?.clearIrq?.();
};

export const iigsInterruptPending = (): boolean => {
  if (iigsADB.interruptPending()) return true;
  if (vblPending && (iigsRegisters[0x41] & 0x08)) return true;
  if (quarterSecondPending && (iigsRegisters[0x41] & 0x10)) return true;
  if (vgcIntReg & 0x80) return true;
  // Ensoniq ES5503 sound interrupt pending
  if (iigsEnsoniq.irqPending()) return true;
  return false;
};

// The Mega II video scanner counters, exposed to the CPU at $C02E/$C02F.
// Format per the Apple IIgs Hardware Reference / gssquared Docs/VideoScanner.md:
//   9-bit vertical counter: visible rows count $100-$1BF, VBL rows $1C0-$1FF
//   and the final six rows wrap to $1FA-$1FF. $C02E returns the top 8 of the
//   9 bits ($80-$DF visible, $E0-$FF in VBL); $C02F the low bit in bit 7 plus
//   the 7-bit horizontal counter in bits 0-6.
// Software polls $C02E inside a tight `LDA $C02E / CMP #$E8 / BNE` to catch a
// spot in VBL for flicker-free drawing (Tass Times cursor refresh froze forever
// because this register read a static 0), so it must track the frame clock.
// The frame layout mirrors motherboard.ts: the first vblCycles of every frame
// are the VBL rows (that is what $C019/VBLIRQ are keyed to), then 192 visible
// rows.
function noteVcountRead(v: number): void {
  shrDbg.vcountReads++;
  if (shrDbg.trace && shrDbg.vcountVals.size < 512) shrDbg.vcountVals.add(v);
}

const readIigsVideoCounter = (wantHorz: boolean): number => {
  // Video-clock position, not cycleCount: $C036 slow mode changes how many CPU
  // cycles fit in a frame but must not move the beam (see iigsVideoClock).
  const frameCycles = getIigsFrameUnits();
  const vblCycles = Math.round((12460 / 46727) * frameCycles);
  const cyc = getIigsVideoClock() % frameCycles;
  let vert: number;
  if (cyc < vblCycles) {
    // VBL rows 192-261: 64 values at $1C0-$1FF then the 6-value wrap $1FA-$1FF.
    const line = Math.min(70, Math.floor(cyc / (vblCycles / 70)));
    vert = line < 64 ? 0x1c0 + line : 0x1fa + (line - 64);
  } else {
    const cyclesPerLine = ((frameCycles - vblCycles) / 192) || 1;
    const line = Math.min(191, Math.floor((cyc - vblCycles) / cyclesPerLine));
    vert = 0x100 + line;
  }
  if (wantHorz) {
    // Horizontal counter: 65 values per row, $00 then $40-$7F (hbl first).
    const cyclesPerLine = ((frameCycles - vblCycles) / 192) || 1;
    const h = Math.floor(cyc % cyclesPerLine);
    const hstep = Math.floor(h * 65 / cyclesPerLine);
    const horz = hstep === 0 ? 0 : Math.min(0x7f, 0x40 + hstep - 1);
    const v = ((vert & 1) << 7) | horz;
    noteVcountRead(v);
    return v;
  }
  const v = (vert >> 1) & 0xff;
  noteVcountRead(v);
  return v;
};

// CPU cycles per 3.5" disk bit cell (2 µs). The IWM clocks the media off
// machine time, not off CPU cycles, so a 2.8 MHz fast-mode CPU gets ~5.6 cycles
// per bit while the 1.02 MHz clock gets ~2. Using the slow-mode figure at 2.8
// MHz would let the write LSS demand a byte every 16 CPU cycles while the ROM's
// write loop needs ~45, so every field would be clocked out with zero-filled
// underrun gaps.
const iigsDiskBitCellCycles = () => isIigsSlowMode()
  ? 0.00012 * 17030
  : 0.00012 * getIigsFrameUnits()

// IWM (Integrated Woz Machine) state for Apple IIgs ($C0E0-$C0EF)
let iwmQ6 = false;
let iwmQ7 = false;
let iwmMotorOn = false;
let iwmDriveSelect = 0;
let iwmMode = 0;
// EN35: 0 = the 5.25" drive pair in slot 6, 1 = the 3.5" pair in slot 5.
// On the IIgs this is a bit of the Disk Control Port ($C031), not an IWM
// register - the IWM simply reroutes /ENBL to the selected family.
let iwmEnable35 = false
// Disk Control Port ($C031) state. Only EN35 (bit 6) is wired up so far; HDSEL
// (bit 7) selects the side/track on a 3.5" drive and is passed through.
let iwmDiskRegister = 0
// First drive-state index of each IIgs floppy slot: 2 = slot 6 (5.25"),
// 4 = slot 5 (3.5"). Mirrors FLOPPY_BASE_INDEX in devices/drivestate.ts, which
// we cannot import from here without a new module-level cycle.
const IWM_FLOPPY_BASE = { 5: 4, 6: 2 }
export const iigsGetIwmDriveSelect = () => iwmDriveSelect
// True when the given drive-state index holds decodable floppy media.
export const iigsFloppyHasMedia = (index: number) => {
  const ds = getDriveStateByIndex(index)
  return !ds.hardDrive && getDriveDataByIndex(index).length > 0
}
export const iigsGetIwmEnable35 = () => iwmEnable35
export const iigsSetIwmEnable35 = (enable35: boolean) => {
  if (iwmEnable35 === enable35) return
  // Leaving the 3.5" family ends any write session on the selected drive.
  if (iwmEnable35) iwmFlushWrites35(IWM_FLOPPY_BASE[5] + iwmDriveSelect)
  iwmEnable35 = enable35
  iwmDiskRegister = enable35 ? (iwmDiskRegister | 0x40) : (iwmDiskRegister & ~0x40)
  // Switching families moves /ENBL, so restart the sequencer for the newly
  // selected drive rather than letting it shift a stale partial nibble.
  iwmResetTiming()
}
// $C031 write: the Disk Control Port drives the IIgs floppy drives.
export const iigsWriteDiskControlPort = (value: number) => {
  iwmDiskRegister = value
  iigsSetIwmEnable35((value & 0x40) !== 0)
}
export const iigsResetIwm = () => {
  if (iwmEnable35) iwmFlushWrites35(IWM_FLOPPY_BASE[5] + iwmDriveSelect)
  iwmQ6 = false
  iwmQ7 = false
  iwmMotorOn = false
  iwmDriveSelect = 0
  iwmMode = 0
  iwmEnable35 = false
  iwmDiskRegister = 0
  iwmResetTiming()
  iwmReset35Lines()
}

export const doSetRom = (machineName: MACHINE_NAME) => {
  currentMachineName = machineName
  let romStr = ""
  switch (machineName) {
    case "APPLE2P":
      romStr = romBase64p
      break
    case "APPLE2EU":
      romStr = romBase64u
      break
    case "APPLE2EE":
      romStr = romBase64e
      break
    case "APPLE2GS":
      const rom64_gs = romBase64gs.replace(/[\n\r\s]/g, "");
      gsROM = new Uint8Array(Buffer.from(rom64_gs, "base64"));
      const rom64_sys = (iigsRomVersion === "03" ? romGsSystem03Base64 : romGsSystemBase64)
        .replace(/[\n\r\s]/g, "");
      gsSystemROM = new Uint8Array(Buffer.from(rom64_sys, "base64"));
      const romBanks = gsSystemROM.length >> 16;
      iigsRomFirstBank = 0x100 - romBanks;
      iigsRomBankFFOffset = (romBanks - 1) << 16;
      memory.set(gsSystemROM.subarray(iigsRomBankFFOffset + 0xC000, iigsRomBankFFOffset + 0x10000), ROMmemoryStart);
      updateAddressTables();
      return;
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
  // The II+ and IIe unenhanced checks 4 bytes. The last byte checked is at
  // $C707 and is expected to be $3C. However, the value will only be $3C for a
  // floppy drive. A SmartPort hard drive will have the value $00.
  // The result is that on a II+ or unenhanced IIe, the SmartPort hard drive
  // will be skipped and the machine will always try to boot slot 6.
  // To work around this, hack the monitor ROM to only check the first
  // 3 bytes. This will allow the SmartPort hard drive to be booted.
  // Change LDA #$07 to LDA #$05, do for all ROMs.
  rom[0xFABB - 0xC000] = 0x05
  memory.set(rom, ROMmemoryStart)
}

export let gsRAM = new Uint8Array(8 * 1024 * 1024);

// Debug-only (?adbtrace=1): record the program counter of every CPU read of
// the mouse/button hole addresses plus the bank-$E1 mirrors GS/OS can reach
// with DB=$E1. This answers "which code reads the button state" without
// opcode decoding (see AGENTS.md §41 traps).
const probeAddresses = new Set([0x000478, 0x000578, 0x0004f8, 0x0005f8, 0x000678,
  0x000778, 0x00067c, 0x00077c, 0xe102b8, 0xe102ba, 0xe102bc, 0xe102be,
  0xe10778, 0xe1077c, 0xe10478, 0xe104f8, 0xe10578, 0xe105f8, 0xe10190,
  0xe10191, 0xe10192, 0xe10193]);
const maybeProbe = (address: number, bank: number, offset: number) => {
  if (bank === 0x00 && offset >= 0x0478 && offset <= 0x077f) {
    noteAdbLog("probe", address);
    return;
  }
  if (bank === 0xe1 && (probeAddresses.has(address) || (offset >= 0xe0 && offset <= 0xff))) {
    noteAdbLog("probe", address);
  }
};


export const memGet24 = (address: number): number => {
    let bank = (address >> 16) & 0xFF;
    const offset = address & 0xFFFF;
    if (adbLogEnabled) maybeProbe(address, bank, offset);

    // $C035 bit 6 set: banks $00/$01 are pure fast RAM across $C000-$CFFF.
    // Bank $00 picks main or aux by ALTZP; bank $01 is always the aux bank.
    if ((bank === 0x00 || bank === 0x01) && offset >= 0xC000 && offset < 0xD000 &&
        !isIigsIolcShadowed()) {
        const aux = bank === 0x01 || (auxCardEnabled && SWITCHES.ALTZP.isSet)
        return memory[(aux ? RamWorksMemoryStart : 0) + offset];
    }

    // Apple IIgs ROM mapping: ROM 01 is 128KB in banks $FE-$FF, ROM 03 is
    // 256KB in banks $FC-$FF (bank $FC at image offset 0). The Mega II banks
    // $E0/$E1 and the shadowed banks $00/$01 read the *last* ROM bank (the
    // IIe-compatibility ROM) through their language-card window when RDROM is
    // set — matching gssquared rom_bank_ff_offset().
    if (gsSystemROM && gsSystemROM.length > 0) {
        if (bank >= iigsRomFirstBank && bank <= 0xFF) {
            return gsSystemROM[((bank - iigsRomFirstBank) << 16) | offset];
        }
        if (bank === 0x00 || bank === 0xE0 || bank === 0xE1) {
            if (offset >= 0xD000 && !SWITCHES.BSRREADRAM.isSet) {
                return gsSystemROM[iigsRomBankFFOffset + offset];
            }
            // $C071-$C07F: BRK/IRQ firmware (JML to the interrupt manager).
            // $C100-$CFFF: slot card space or internal ROM pages.
            if (offset >= 0xC071 && offset <= 0xC07F) return gsSystemROM[iigsRomBankFFOffset + offset];
            if (offset >= 0xC100 && offset <= 0xCFFF) {
                if (offset < 0xC800) {
                    const slot = (offset >> 8) & 0x0F;
                    manageC800(slot);
                    if (SWITCHES.INTCXROM.isSet) return gsSystemROM[iigsRomBankFFOffset + offset];
                    const isCard = (slot === 3) ? SWITCHES.SLOTC3ROM.isSet : ((iigsSlotRegister & (1 << slot)) !== 0);
                    if (isCard) return memGet(offset, false);
                    return gsSystemROM[iigsRomBankFFOffset + offset];
                } else {
                    if (offset === 0xCFFF) manageC800(0xFF);
                    if (SWITCHES.INTCXROM.isSet || internalC8ROMIsActive()) return gsSystemROM[iigsRomBankFFOffset + offset];
                    return memGet(offset, false);
                }
            }
        }
    }

    // Bank E0: Mega II Main
    if (bank === 0xE0) {
        if (offset >= 0xC000 && offset < 0xD000) {
            return memGet(offset, false);
        }
        if (offset >= 0xD000) {
            if (!SWITCHES.BSRREADRAM.isSet) {
                return gsSystemROM ? gsSystemROM[iigsRomBankFFOffset + offset] : (gsROM[(0xFF << 16) | offset] || 0);
            }
            if (offset < 0xE000 && !SWITCHES.BSRBANK2.isSet) {
                return megaIIMain[offset - 0x1000];
            }
            return megaIIMain[offset];
        }
        return megaIIMain[offset];
    }

    // Bank E1: Mega II Aux
    if (bank === 0xE1) {
        // For $C000-$CFFF I/O region, use memGet which handles soft switches
        if (offset >= 0xC000 && offset < 0xD000) {
            return memGet(offset, false);
        }
        // For $D000-$FFFF, check if ROM is enabled via language card switches
        if (offset >= 0xD000) {
            // If RDROM is set, read from ROM
            if (!SWITCHES.BSRREADRAM.isSet) {
                return gsSystemROM ? gsSystemROM[iigsRomBankFFOffset + offset] : (gsROM[(bank << 16) | offset] || 0);
            }
            // Otherwise read from language card RAM
            if (offset < 0xE000 && !SWITCHES.BSRBANK2.isSet) {
                return megaIIAux[offset - 0x1000];
            }
            return megaIIAux[offset];
        }
        // For $0000-$BFFF, direct RAM access (linearize the SHR window)
        return megaIIAux[isIigsAuxLinear() ? iigsAuxLinearToPhys(offset) : offset];
    }

    // Bank 00: Standard Apple IIe memory map (including ROM and Soft Switches)
    if (bank === 0x00) {
        return memGet(offset, false);
    }
    
    // Bank 01: Direct, absolute access to Aux Memory (65816 Fast RAM Bank 01)
    if (bank === 0x01) {
        if (offset >= 0xC000 && offset < 0xD000) {
            return memGet(offset, false); // I/O
        }
        if (offset >= 0xD000 && !(iigsRegisters[0x35] & 0x40)) {
            // If RDROM is set, read from ROM
            if (!SWITCHES.BSRREADRAM.isSet) {
                return gsSystemROM ? gsSystemROM[iigsRomBankFFOffset + offset] : (gsROM[(0xFF << 16) | offset] || 0);
            }
            // Language card region when shadowed
            if (offset < 0xE000 && !SWITCHES.BSRBANK2.isSet) {
                return memory[RamWorksMemoryStart + offset - 0x1000];
            }
            return memory[RamWorksMemoryStart + offset];
        }
        return memory[RamWorksMemoryStart + offset];
    }
    
    // Bank 02-7F: 8MB of pure, linear 65816 Fast RAM
    if (bank >= 0x02 && bank < 0x80) {
        return gsRAM[(bank << 16) | offset];
    }
    
    return 0;
}

// Which fast-RAM bank a bank-$00 write actually lands in, after the IIe aux
// switches (gssquared calc_aux_write). The Mega II shadow target follows this
// effective bank, not the CPU bank.
const iigsEffectiveAuxWrite = (offset: number): boolean => {
    if (!auxCardEnabled) return false
    const page = offset >>> 8
    if (SWITCHES.STORE80.isSet && page >= 0x04 && page <= 0x07) return SWITCHES.PAGE2.isSet
    if (SWITCHES.STORE80.isSet && SWITCHES.HIRES.isSet && page >= 0x20 && page <= 0x3f) {
        return SWITCHES.PAGE2.isSet
    }
    if (SWITCHES.ALTZP.isSet && (page <= 0x01 || page >= 0xc0)) return true
    return SWITCHES.AUXRAMWRITE.isSet && page >= 0x02
}

// Mirror a write into the Mega II RAM the video scanner reads (gssquared
// bank_shadow_write). Main text/hires pages shadow into Mega II main; the aux
// $2000-$9FFF window shadows into Mega II aux and is interleaved while that
// window is linearized. $2000-$5FFF is both the AUXHGR and SHR window, so it
// needs either inhibit flag clear; $6000-$9FFF is SHR only.
const shadowIigsWrite = (offset: number, data: number, aux: boolean) => {
    const shadow = iigsRegisters[0x35]
    if (offset >= 0x0400 && offset < 0x0800) {
        if (!(shadow & 0x01)) (aux ? megaIIAux : megaIIMain)[offset] = data
        return
    }
    if (offset >= 0x0800 && offset < 0x0c00) {
        if (!(shadow & 0x20)) (aux ? megaIIAux : megaIIMain)[offset] = data
        return
    }
    if (offset < 0x2000 || offset >= 0xa000) return
    if (aux) {
        if (!(shadow & 0x08) || (offset < 0x6000 && !(shadow & 0x10))) {
            megaIIAux[isIigsAuxLinear() ? iigsAuxLinearToPhys(offset) : offset] = data
        }
    } else if (offset < 0x4000) {
        if (!(shadow & 0x02)) megaIIMain[offset] = data
    } else if (offset < 0x6000) {
        if (!(shadow & 0x04)) megaIIMain[offset] = data
    }
}

// $C036 bit 4 (SPEED_SHADOW_ALL) gives banks $02-$7F the Mega II shadow handlers
// banks $00/$01 always get (gssquared set_ram_shadow_banks/bank_shadow_write).
// GS/OS's copy helper at 08:8A5F brackets a blit with $C035 = $57 and
// $C036 |= $10 for that reason: the CPU bank picks the target, odd = Mega II aux
// (while $C029 bit 0 latches the bank), even = main.
const shadowIigsBankWrite = (bank: number, offset: number, data: number) => {
    const page = offset >>> 8
    if (isIigsIolcShadowed()) {
        // With IOLC shadowing on, the I/O page and the language card belong to
        // the Mega II rather than to this bank's fast RAM.
        if (page >= 0xc0 && page <= 0xcf) {
            memSet(offset, data)
            return
        }
        if (page >= 0xd0 && !SWITCHES.BSR_WRITE.isSet) return
    }
    const shadow = iigsRegisters[0x35]
    const odd = (bank & 1) !== 0
    const addr17 = (odd ? 0x10000 : 0) | offset
    let shadowed = false
    if (offset >= 0x0400 && offset < 0x0800) shadowed = !(shadow & 0x01)
    else if (offset >= 0x0800 && offset < 0x0c00) shadowed = !(shadow & 0x20)
    else if (!odd && offset >= 0x2000 && offset < 0x4000) shadowed = !(shadow & 0x02)
    else if (!odd && offset >= 0x4000 && offset < 0x6000) shadowed = !(shadow & 0x04)
    // $2000-$5FFF is both the AUXHGR and SHR window, so either inhibit clear
    // is enough; SHR is checked first, as in gssquared shadow_is_enabled().
    if (!shadowed && addr17 >= 0x12000 && addr17 < 0x1a000) shadowed = !(shadow & 0x08)
    if (!shadowed && addr17 >= 0x12000 && addr17 < 0x16000) shadowed = !(shadow & 0x10)
    if (shadowed) {
        if (odd && (iigsRegisters[0x29] & 0x01)) {
            megaIIAux[isIigsAuxLinear() ? iigsAuxLinearToPhys(offset) : offset] = data
        } else {
            megaIIMain[offset] = data
        }
    }
    gsRAM[(bank << 16) | offset] = data
}

export const memSet24 = (address: number, data: number) => {
    let bank = (address >> 16) & 0xFF;
    const offset = address & 0xFFFF;
    if (adbLogEnabled && ((bank === 0x00 && offset >= 0x0478 && offset <= 0x077f) ||
        (bank === 0xe1 && (probeAddresses.has(address) || (offset >= 0xe0 && offset <= 0xff))))) {
        noteAdbLog("uprobe", address, data);
    }

    // See memGet24: inhibited IOLC shadowing exposes fast RAM at $C000-$CFFF.
    if ((bank === 0x00 || bank === 0x01) && offset >= 0xC000 && offset < 0xD000 &&
        !isIigsIolcShadowed()) {
        const aux = bank === 0x01 || (auxCardEnabled && SWITCHES.ALTZP.isSet)
        memory[(aux ? RamWorksMemoryStart : 0) + offset] = data;
        return;
    }

    // Bank E0: Mega II Main
    if (bank === 0xE0) {
        if (offset >= 0xC000 && offset < 0xD000) {
            memSet(offset, data);
            return;
        }
        if (offset >= 0xD000) {
            if (SWITCHES.BSR_WRITE.isSet) {
                const targetOffset = (offset < 0xE000 && !SWITCHES.BSRBANK2.isSet) ? (offset - 0x1000) : offset;
                megaIIMain[targetOffset] = data;
            }
            return;
        }
        megaIIMain[offset] = data;
        if (offset >= 0x2000 && offset < 0xa000) shrDbg.e0++
        return;
    }

    // Bank E1: Mega II Aux
    if (bank === 0xE1) {
        // I/O region
        if (offset >= 0xC000 && offset < 0xD000) {
            memSet(offset, data);
            return;
        }
        // Language card region
        if (offset >= 0xD000) {
            // Check if language card RAM is writable
            if (SWITCHES.BSR_WRITE.isSet) {
                const targetOffset = (offset < 0xE000 && !SWITCHES.BSRBANK2.isSet) ? (offset - 0x1000) : offset;
                megaIIAux[targetOffset] = data;
            }
            return;
        }
        // Regular RAM
        // The SHR window is linearized in CPU space but interleaved in the
        // physical Mega II aux array, so direct bank $E1 accesses have to be
        // folded back. gssquared's megaiiRead/megaiiWrite do exactly this.
        if (offset >= 0x2000 && offset < 0xa000) {
            shrDbg.e1++
            if (shrDbg.trace) noteShrWrite(getCpuPc(), offset)
        }
        megaIIAux[isIigsAuxLinear() ? iigsAuxLinearToPhys(offset) : offset] = data;
        return;
    }

    // Bank 00: IIe memory map. memSet() already routes the byte to main or aux
    // through the switch table; the Mega II shadow must follow that same
    // effective bank. Shadowing every bank-$00 write into Mega II main left
    // RAMWRT/80STORE blits (SHR, DHGR) invisible to the video scanner.
    if (bank === 0x00) {
        memSet(offset, data)
        const aux = iigsEffectiveAuxWrite(offset)
        if (offset >= 0x2000 && offset < 0x6000) {
            if (aux) {
                shrDbg.b00aux++
                if (shrDbg.trace && offset < 0xa000) noteShrWrite(getCpuPc(), offset)
            } else {
                shrDbg.b00++
            }
        } else if (aux && offset >= 0x6000 && offset < 0xa000) {
            shrDbg.b00aux++
            if (shrDbg.trace) noteShrWrite(getCpuPc(), offset)
        }
        shadowIigsWrite(offset, data, aux)
        return
    }

    // Bank 01: Direct, absolute access to Aux Memory (65816 Fast RAM Bank 01)
    if (bank === 0x01) {
        if (offset >= 0xC000 && offset < 0xD000) {
            memSet(offset, data); // I/O
            return;
        }
        if (offset >= 0xD000 && !(iigsRegisters[0x35] & 0x40)) {
            // Language card region when shadowed
            if (SWITCHES.BSR_WRITE.isSet) {
                const targetOffset = (offset < 0xE000 && !SWITCHES.BSRBANK2.isSet) ? (offset - 0x1000) : offset;
                memory[RamWorksMemoryStart + targetOffset] = data;
            }
            return;
        }
        memory[RamWorksMemoryStart + offset] = data;
        // Super Hi-Res ($2000-$9FFF) shadowing into Mega II Bank E1. The aux
        // window is linearized in CPU space and interleaved physically, so the
        // shadow target has to be folded like a direct $E1 access.
        if (offset >= 0x2000 && offset < 0xA000 && !(iigsRegisters[0x35] & 0x08)) {
            shrDbg.b01++
            megaIIAux[isIigsAuxLinear() ? iigsAuxLinearToPhys(offset) : offset] = data;
        }
        return;
    }
    
    // Bank 02-7F: 8MB of pure, linear 65816 Fast RAM. $C036 bit 4 optionally
    // mirrors writes into the Mega II RAM the video scanner reads.
    if (bank >= 0x02 && bank < 0x80) {
        if (iigsRegisters[0x36] & 0x10) {
            shadowIigsBankWrite(bank, offset, data)
        } else {
            gsRAM[(bank << 16) | offset] = data;
        }
    }
}

// The IIgs ROM installs its interrupt manager (JML $FF79C8) into E1:$0010-$0013
// and enables VBL interrupts during its interrupt-init routine (ff:78 region).
// That routine is never reached by the observed boot path, so the ROM's own
// BRKs (ff:a0ef/ff:b61d) storm into E1:$0010=0. Installing the manager + INTEN
// here mirrors what the ROM would do, so interrupts are serviced instead.
export const iigsInitInterrupts = () => {
    // The IIgs ROM's interrupt-init (ff:78a0-7927) and interrupt manager read
    // bank $00 zero-page / low memory, which memoryReset() fills with 0xFF.
    // With 0xFF in those locations the ROM's interrupt-init installs the full
    // interrupt manager (JML $FFB7CC) whose dispatch loop spins and never
    // reaches the OS event loop. Zero the low memory the boot path reads so
    // the machine proceeds like the harness (which starts from a zeroed
    // memory array).
    for (let i = 0; i < 0x2000; i++) memSet24(0x000000 + i, 0);
    // Bank $00:$7000-$70FF is the interrupt manager's scratch area.
    for (let i = 0; i < 0x100; i++) memSet24(0x007000 + i, 0);
    // The ROM's interrupt-init reads $700C (JML low) / $7008 (mid) / $700A
    // (high) and writes them to E1:0011-13, so E1:0010 becomes JML <that
    // address>. Pre-set them to $FF79C8 so that routine produces the same
    // interrupt manager entry we install below, instead of JML $FFFFFF.
    memSet24(0x00700c, 0xc8);
    memSet24(0x007008, 0x79);
    memSet24(0x00700a, 0xff);
    megaIIAux.fill(0x00);
    megaIIMain.fill(0x00);
    iigsClock.reset(true);

    // E1:$0010-$0013 = JML $FF79C8 (the ROM's minimal interrupt manager: it
    // reads $C023 / $7006 and RTIs, acknowledging the IRQ without re-entering)
    memSet24(0xE10010, 0x5c);
    memSet24(0xE10011, 0xc8);
    memSet24(0xE10012, 0x79);
    memSet24(0xE10013, 0xff);

    // Apple IIgs Toolbox Dispatchers in Bank E1 ($E10000..$E1000F)
    // Matches ROM FE:0051..005F (JML $FE00AF, JML $FE00A3, JML $FE0075, JML $FE0069)
    memSet24(0xE10000, 0x5c); memSet24(0xE10001, 0xaf); memSet24(0xE10002, 0x00); memSet24(0xE10003, 0xfe);
    memSet24(0xE10004, 0x5c); memSet24(0xE10005, 0xa3); memSet24(0xE10006, 0x00); memSet24(0xE10007, 0xfe);
    memSet24(0xE10008, 0x5c); memSet24(0xE10009, 0x75); memSet24(0xE1000A, 0x00); memSet24(0xE1000B, 0xfe);
    memSet24(0xE1000C, 0x5c); memSet24(0xE1000D, 0x69); memSet24(0xE1000E, 0x00); memSet24(0xE1000F, 0xfe);

    // Apple IIgs Interrupt Dispatchers in Bank E1 ($E10014..$E1007F)
    // By default, every vector is initialized to JML $FFB5DE (SEC; RTL - unclaimed)
    for (let addr = 0xE10014; addr <= 0xE1007C; addr += 4) {
      memSet24(addr, 0x5c);
      memSet24(addr + 1, 0xde);
      memSet24(addr + 2, 0xb5);
      memSet24(addr + 3, 0xff);
    }

    // VBL Task Dispatcher at $E10030: JML $FE9874
    // (ROM VBL dispatcher: increments $E100DC, runs the VBL task queue, clears $C047)
    memSet24(0xE10030, 0x5c);
    memSet24(0xE10031, 0x74);
    memSet24(0xE10032, 0x98);
    memSet24(0xE10033, 0xfe);

    // ADB mouse-data handler at $E10034: JML $FEC5C8
    // The ROM's interrupt manager dispatches here when $C027 has data available
    // AND the mouse interrupt is enabled (bit 6). The ROM never installs this
    // vector itself (no STA $E10034 anywhere in the ROM), so without this the
    // ADB mouse dispatch (FF:B97F) lands on the unclaimed stub ($FFB5DE) and
    // the ROM cursor task (FF:9CE2) is never invoked from the IRQ path.
    memSet24(0xE10034, 0x5c);
    memSet24(0xE10035, 0xc8);
    memSet24(0xE10036, 0xc5);
    memSet24(0xE10037, 0xfe);

    // System Task / Event Dispatcher at $E10070: JML $FFB5E2 (CLC; RTL)
    memSet24(0xE10070, 0x5c);
    memSet24(0xE10071, 0xe2);
    memSet24(0xE10072, 0xb5);
    memSet24(0xE10073, 0xff);

    // VBL interrupt active flag at $E100D7 (bit 3 set = VBL active & claimed)
    memSet24(0xE100D7, 0x08);

    // Matches ROM FE:0061..0067 copied to $E10180..$E10187
    memSet24(0xE10180, 0x22); memSet24(0xE10181, 0x68); memSet24(0xE10182, 0x00); memSet24(0xE10183, 0xe1);
    memSet24(0xE10184, 0x5c); memSet24(0xE10185, 0x0b); memSet24(0xE10186, 0xbf); memSet24(0xE10187, 0xff);

    // Apple IIgs Tool Locator function table pointers ($E103C0..$E103CA)
    // Initialized by TLStartUp ($FE0011..$FE0030) pointing to ROM Tool tables
    memSet24(0xE103C0, 0x2f); memSet24(0xE103C1, 0x01); memSet24(0xE103C2, 0xfe);
    memSet24(0xE103C4, 0xef); memSet24(0xE103C5, 0x01); memSet24(0xE103C6, 0xfe);
    memSet24(0xE103C8, 0x2f); memSet24(0xE103C9, 0x01); memSet24(0xE103CA, 0xfe);
    // Reset INTEN ($C041) to 0 at power-on / cold boot (interrupts disabled)
    iigsRegisters[0x41] = 0x00;
    // $C02D is owned by the slot configuration (motherboard
    // applyIigsSlotConfig) and must not be reset behind its back.
    iigsClearInterrupts();
    iigsResetIwm();
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
  const newMemSize = memorySize()
  if (RamWorksMaxBank < oldMaxBank) {
    // We are shrinking memory, just keep the first part
    memory = memory.slice(0, newMemSize)
  } else {
    // We are expanding memory, copy the old memory
    const memtemp = memory
    memory = (new Uint8Array(newMemSize)).fill(0xFF)
    memory.set(memtemp.subarray(0, memtemp.length - 0x100))
  }
  memory.fill(0xFF, newMemSize - 0x100)
}

let auxCardEnabled = true
export const setAuxCardEnabled = (enabled: boolean) => {
  auxCardEnabled = enabled
  updateAddressTables()
}
export const getAuxCardEnabled = () => auxCardEnabled

const updateMainAuxMemoryTable = () => {
  const auxRead = auxCardEnabled && SWITCHES.AUXRAMREAD.isSet
  const auxWrite = auxCardEnabled && SWITCHES.AUXRAMWRITE.isSet
  const auxPage2 = auxCardEnabled && SWITCHES.PAGE2.isSet
  const auxTextPageRead = (auxCardEnabled && SWITCHES.STORE80.isSet) ? auxPage2 : auxRead
  const auxTextPageWrite = (auxCardEnabled && SWITCHES.STORE80.isSet) ? auxPage2 : auxWrite
  const auxHgrPageRead = (auxCardEnabled && SWITCHES.STORE80.isSet && SWITCHES.HIRES.isSet) ? auxPage2 : auxRead
  const auxHgrPageWrite = (auxCardEnabled && SWITCHES.STORE80.isSet && SWITCHES.HIRES.isSet) ? auxPage2 : auxWrite
  for (let i = 2; i < 256; i++) {
    addressGetTable[i] = auxRead ? auxGetPage(i) : i
    addressSetTable[i] = auxWrite ? auxSetPage(i) : i
  }
  for (let i = 4; i <= 7; i++) {
    addressGetTable[i] = auxTextPageRead ? auxGetPage(i) : i
    addressSetTable[i] = auxTextPageWrite ? auxSetPage(i) : i
  }
  for (let i = 0x20; i <= 0x3F; i++) {
    addressGetTable[i] = auxHgrPageRead ? auxGetPage(i) : i
    addressSetTable[i] = auxHgrPageWrite ? auxSetPage(i) : i
  }
}

const updateReadBankSwitchedRamTable = () => {
  // if (SWITCHES.ALTZP.isSet) {  // DEBUG
  //   console.log(`RamWorksPage: ${toHex(RamWorksPage)}, RamWorksBankGet(): ${RamWorksBankGet()}`)
  // }
  const altZP = auxCardEnabled && SWITCHES.ALTZP.isSet
  addressGetTable[0] = altZP ? auxGetPage(0) : 0
  addressGetTable[1] = altZP ? auxGetPage(1) : 1
  addressSetTable[0] = altZP ? auxSetPage(0) : 0
  addressSetTable[1] = altZP ? auxSetPage(1) : 1
  if (SWITCHES.BSRREADRAM.isSet) {
    for (let i = 0xD0; i <= 0xFF; i++) {
      addressGetTable[i] = altZP ? auxGetPage(i) : i
    }
    if (!SWITCHES.BSRBANK2.isSet) {
      // Bank1 of $D000-$DFFF is actually in 0xC0...0xCF
      for (let i = 0xD0; i <= 0xDF; i++) {
        addressGetTable[i] = altZP ? auxGetPage(i - 0x10) : i - 0x10
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
  const altZP = auxCardEnabled && SWITCHES.ALTZP.isSet
  const writeRAM = SWITCHES.BSR_WRITE.isSet
  // Start out with Slot ROM and regular ROM as not writeable
  for (let i = 0xC0; i <= 0xFF; i++) {
    addressSetTable[i] = ADDRESS_GUARD
  }
  if (writeRAM) {
    for (let i = 0xD0; i <= 0xFF; i++) {
      addressSetTable[i] = altZP ? auxSetPage(i) : i
    }
    if (!SWITCHES.BSRBANK2.isSet) {
      // Bank1 of $D000-$DFFF is actually in 0xC0...0xCF
      for (let i = 0xD0; i <= 0xDF; i++) {
        addressSetTable[i] = altZP ? auxSetPage(i - 0x10) : i - 0x10
      }
    }
  }
}

const slotIsActive = (slot: number) => {
  if (SWITCHES.INTCXROM.isSet) return false
  if (currentMachineName === "APPLE2GS") {
    return (slot !== 3) ? ((iigsSlotRegister & (1 << slot)) !== 0) : SWITCHES.SLOTC3ROM.isSet
  }
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
  addressGetTable[0xC0] = ROMpage
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
// Indexed by program counter — lookups happen on EVERY opcode fetch in bank 00
// (the GS/OS hot path), so an array dereference beats Map hashing.
export const specialJumpTable: Array<(() => void) | undefined> = new Array(0x10000).fill(undefined)

// Custom callbacks for mem get/set to $C090-$C0FF slot I/O and $C100-$C7FF.
const slotIOCallbackTable = new Array<AddressCallback | undefined>(8)

// Determines whether slot has C800 space ROM or not
const slotIOC8Space = new Uint8Array(8)

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
  slotHasCard[slot] = 1
  slotIOCallbackTable[slot] = fn
}

export const clearSlot = (slot: number) => {
  if (slot < 1 || slot > 7) return
  memory.fill(0, SLOTstart + (slot - 1) * 0x100, SLOTstart + slot * 0x100)
  memory.fill(0, SLOTC8start + (slot - 1) * 0x800, SLOTC8start + slot * 0x800)
  slotHasCard[slot] = 0
  slotIOC8Space[slot] = 0
  slotIOCallbackTable[slot] = undefined
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
  slotHasCard[slot] = driver.some(byte => byte !== 0) ? 1 : 0
  if (driver.length > 0x100) {
    // only allow up to 2k for C8 range
    const end = (driver.length > 0x900) ? 0x900 : driver.length
    const addr = SLOTC8start + (slot - 1) * 0x800
    memory.set(driver.slice(0x100,end), addr)
    // mark this slot as having C8 space
    slotIOC8Space[slot] = 0xff
  }
  if (jump) {
    specialJumpTable[jump] = fn
  }
}

export const memoryReset = () => {
  // Reset memory but skip over the ROM and peripheral card areas
  memory.fill(0xFF, 0, 0x10000)
  // Everything past here is RamWorks memory
  memory.fill(0xFF, BaseMachineMemory)
  megaIIAux.fill(0x00)
  megaIIMain.fill(0x00)

  // Real Apple II RAM does not power up as a uniform 0xFF: it settles into
  // a repeating 0xFF,0xFF,0x00,0x00 byte pattern (see js/util.ts's
  // allocMem(), borrowed from AppleWin). Applesoft's floating-point
  // mantissa-shift routine (ROR $9E / ROR $9F / ROR $A0 / ROR $A1 / ROR
  // $AC at $E891, confirmed by ROM disassembly) depends on this: under a
  // uniform 0xFF fill, $9E and $9F hold unrealistic values that corrupt
  // the first floating-point operation any auto-run program performs,
  // raising a spurious "?OVERFLOW ERROR" for any program whose first
  // statement evaluates a negative numeric literal (e.g. `CALL -936`).
  // $A0/$A1/$AC already land on the pattern's 0xFF positions, so only
  // these two bytes need correcting.
  //
  // This is deliberately narrow -- not a general switch to the realistic
  // pattern for all of memory -- because getApple2State()/setApple2State()
  // (save_restore.ts) use a uniform 0xFF as the sentinel "page not
  // written" value for sparse session-snapshot encoding. Filling all of
  // memory with the realistic pattern would defeat that optimization and
  // corrupt restoring session snapshots saved before this fix.
  memory[0x9E] = 0x00
  memory[0x9F] = 0x00
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
  let useAux = write ? SWITCHES.AUXRAMWRITE.isSet : SWITCHES.AUXRAMREAD.isSet
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
  if (addr === 0xC029 && vidhd.enabled) {
    return vidhd.readSoftSwitch()
  }
  if (vidhd.enabled && ((addr >> 4) === (0xC08 + vidhd.slot))) {
    return vidhd.readIO(addr)
  }
  if (addr === 0xC058 && videoTerm.enabled) {
    // Videx Soft Video Switch: AN0 off -> switch to 40-col display
    videoTerm.active = false
  } else if (addr === 0xC059 && videoTerm.enabled) {
    // Videx Soft Video Switch: AN0 on -> switch to Videx 80-col display
    videoTerm.active = true
  }
  
  // Apple IIgs: $C071-$C07F is firmware, not I/O! It holds the 8-bit BRK/IRQ
  // handler code that jumps to the 16-bit interrupt manager in bank $E1.
  // This must read from Bank $FF ROM (not Bank $FE).
  if (currentMachineName === "APPLE2GS" && addr >= 0xC071 && addr <= 0xC07F) {
      if (gsSystemROM && gsSystemROM.length > 0) {
          // Last bank of the system ROM (ROM 01: FF@0x10000, ROM 03:
          // FF@0x30000); this is the IIe-compatibility image.
          return gsSystemROM[iigsRomBankFFOffset + addr];
      }
  }
  
  // NOTE: The generic path below already implements the $C011-$C01F status
  // reads correctly (checkSoftSwitches sets/clears bit 7 in the $C000 page
  // for each switch's isSetAddr). Replacing that with explicit status bits
  // (as gssquared does) changes the value the guest sees for the *other* bits
  // of the ROM byte, which measurably altered GS/OS's palette output.

  // Apple IIgs hardware registers ($C020-$C04F)
  if (currentMachineName === "APPLE2GS" && addr >= 0xC020 && addr <= 0xC04F) {
      // Handle specific IIgs hardware
      switch (addr) {
          case 0xC031: // Disk Control Port
              // Bit 6 (EN35) selects the 3.5" drive family in slot 5 vs the
              // 5.25" pair in slot 6; bit 7 (HDSEL) is the 3.5" head/side
              // selector. The IWM reroutes /ENBL when EN35 changes, so the
              // logic state sequencer has to restart for the new drive.
              return iwmDiskRegister

          case 0xC024: // ADB Mouse Data
              return iigsADB.readMouseData();

          case 0xC025: // ADB Modifiers
              return iigsADB.readModifiers();

          case 0xC027: // ADB Status
              // Bit 5 = data available, Bit 2 = keyboard data. The controller
              // finishes commands instantly, so it reports what is really
              // pending. The firmware polls bit 5 before every read, and the
              // OS waits for it during ADB init, so the ADB must produce
              // responses to the init commands (writeCommand -> completeCommand).
              return iigsADB.readStatus();

          case 0xC023: // VGC interrupt status
              return vgcIntReg;

          case 0xC02E: // Vertical counter
          case 0xC02F: // Horizontal / Vertical counter
              vgcIntReg &= ~0x20;
              if (!((vgcIntReg & 0x04) && (vgcIntReg & 0x40))) {
                  vgcIntReg &= ~0x80;
              }
              iigsRegisters[0x23] = vgcIntReg;
              if (!iigsInterruptPending()) {
                  (globalThis as any).cpu?.clearIrq?.();
              }
              return readIigsVideoCounter(addr === 0xC02F);

          case 0xC026: // ADB Data
              return iigsADB.readData();

          case 0xC029: // NEWVIDEO
              return iigsRegisters[0x29];

          case 0xC02D: // SLTROMSEL
              return iigsSlotRegister;

          case 0xC033: // Clock Data
              return iigsClock.readData();

          case 0xC034: // Clock Control (top 4 bits) + Border Color (bottom 4 bits)
              return iigsClock.readControl();

          case 0xC038: { // SCC Channel B Control
              const reg = sccRegSelect[0];
              sccRegSelect[0] = 0;
              if (reg === 0) return 0x04; // RR0: Tx buffer empty
              return 0x00; // All other registers including RR3 (interrupt pending) return 0
          }

          case 0xC039: { // SCC Channel A Control
              const reg = sccRegSelect[1];
              sccRegSelect[1] = 0;
              if (reg === 0) return 0x04; // RR0: Tx buffer empty
              return 0x00; // All other registers including RR3 (interrupt pending) return 0
          }

          case 0xC03A: // SCC Channel B Data
          case 0xC03B: // SCC Channel A Data
              return 0x00;

          case 0xC03C: // DOC Sound Control
              docAccess.reads++
              docAccess.control++
              return iigsEnsoniq.readControl();

          case 0xC03D: // DOC Sound Data (DOC regs / RAM depending on control bit 6)
              docAccess.reads++
              docAccess.data++
              return iigsEnsoniq.readData();

          case 0xC03E: // DOC Sound Address Low
              docAccess.reads++
              docAccess.addrLow++
              return iigsEnsoniq.readAddrLow();

          case 0xC03F: // DOC Sound Address High
              docAccess.reads++
              docAccess.addrHigh++
              return iigsEnsoniq.readAddrHigh();

          case 0xC041: // INTEN
              return iigsRegisters[0x41] & 0x1F;

          case 0xC046: {
              // $C046 INTFLAG (web-a2e interruptStatusRegister): bit3 = VBL
              // pending, bit4 = quarter-second pending, bit7 = "some source is
              // pending AND enabled in $C041". Flags report what happened
              // regardless of the enable bits; only a $C047 write clears them.
              // The boot gate at ff:8552/ff:8555 does `lda $c046` in 8-bit
              // accumulator mode and `bmi` on bit 7 to take the interrupt
              // manager installer at ff:8549 -> ff:854b (jsr $a1b8), which
              // copies the E1 interrupt stubs into E1:$0010/$0080. Without a
              // pending VBL the installer is skipped, E1:$0010 stays 0x00
              // (BRK) and every interrupt storms.
              let val = 0;
              if (vblPending) val |= 0x08;
              if (quarterSecondPending) val |= 0x10;
              const en = iigsRegisters[0x41];
              if ((vblPending && (en & 0x08)) || (quarterSecondPending && (en & 0x10))) {
                  val |= 0x80;
              }
              // ADB interrupt is NOT gated by INTEN (web-a2e: adb.interruptPending()
              // only needs its own enable bits from $C027 writes).
              if (iigsADB.interruptPending()) val |= 0x80;
              return val;
          }

          case 0xC030:
              // Speaker toggle. The cone toggles on BOTH reads and writes
              // ($FBE0 BELL is an LDA, not a STA), and Case 27A fixed only the
              // write side ($C030 in memSet24). Measured: Applesoft
              // "PRINT CHR$(7)" executes at the IIgs prompt without reaching
              // clickSpeaker, because this read branch had no $C030 case.
              // The generic Apple II path calls checkSoftSwitches on reads
              // already; the IIgs window must do the same here.
              checkSoftSwitches(0xC030, false, s6502.cycleCount)
              return iigsRegisters[0x30]

          case 0xC047:
              vblPending = false;
              quarterSecondPending = false;
              return iigsRegisters[0x47] | 0x80;

          default:
              // Other IIgs registers - just echo what was written
              return iigsRegisters[addr & 0xFF];
      }
  }

  if (currentMachineName === "APPLE2GS" && addr >= 0xC0E0 && addr <= 0xC0EF) {
    const reg = addr & 0x0F;
    switch (reg) {
      case 0x08: iwmMotorOn = false; break;
      case 0x09: iwmMotorOn = true; break;
      case 0x0A: iwmDriveSelect = 0; break;
      case 0x0B: iwmDriveSelect = 1; break;
      case 0x0C: iwmQ6 = false; break;
      case 0x0D: iwmQ6 = true; break;
      case 0x0E: iwmQ7 = false; break;
      case 0x0F: iwmQ7 = true; break;
    }
    const iwmDriveIndex = IWM_FLOPPY_BASE[iwmEnable35 ? 5 : 6] + iwmDriveSelect;
    // $C031 bit 7 is SEL/HDSEL: the fourth bit of the 3.5" status/control
    // selector (the 5.25" family ignores it).
    const iwmHdsel = (iwmDiskRegister >> 7) & 1;
    // The 3.5" spindle turns continuously, so the media clock has to be brought
    // up to "now" on every IWM access, not only on data-register ones: a
    // status or mode access still lets the disc rotate under the head.
    if (iwmEnable35) {
      iwmAdvance35(iwmDriveIndex,
        iwmFloppySpinning(iwmDriveIndex, iwmMotorOn), iigsDiskBitCellCycles())
    }
    // $C0E0-$C0E7 are the head stepper lines (CA0-CA2 plus LSTRB). They apply on
    // every access, not just reads, because firmware strobes them either way.
    if (reg <= 7) {
      iwmStepHead(iwmDriveIndex, reg, iwmMotorOn, iwmHdsel)
    }
    if (!iwmQ7) {
      if (iwmQ6) {
        // Read status register: bits 0-4 mode, bit 5 motor/enable. On a 3.5"
        // drive bit 7 is the selected status function's output, not the 5.25
        // write-protect sense.
        let status = iwmMode & 0x1F;
        if (iwmMotorOn) status |= 0x20;
        if (iwmEnable35) {
          status |= iwmGetSense35(iwmDriveIndex, iwmHdsel) << 7;
          // The ROM reads the status register once after its final write
          // handshake wait; persist anything the burst wrote.
          iwmFlushWrites35(iwmDriveIndex);
        } else {
          // 5.25" family: bit 7 is the write-protect sense. An empty bay and
          // an asserted PHASE1 both read 1 (gssquared read_sense); ROM 03's
          // power-on drive probe polls this bit and hangs at $FF:5820
          // otherwise.
          status |= iwmReadSense525(iwmDriveIndex) << 7;
        }
        return status;
      } else {
        // Data register. The Logic State Sequencer shifts continuously, so
        // advance it to "now" and return whatever it has latched.
        //
        // Only do that when the selected drive family actually holds media.
        // With an empty bay we keep returning the ROM byte the IWM data
        // register used to mirror: the IIgs power-on disk self-test reads this
        // register before any drive is enabled, and feeding it a live bit
        // stream there derails the boot (see gssquared IWM2.hpp on the ROM03
        // power-on disk self-test).
        if (iigsFloppyHasMedia(iwmDriveIndex)) {
          const spinning = iwmFloppySpinning(iwmDriveIndex, iwmMotorOn);
          // The 5.25" Logic State Sequencer is clocked by the CPU, not by wall
          // time: gssquared's Floppy525_woz counts 4 CPU cycles per bit cell in
          // every speed mode (only the 3.5" drive, which uses get_vid_cycles(),
          // follows machine time). Keeping the Disk II bit model in raw cycles
          // preserves the ROM's D5-AA-96 sync loop timing at 2.8 MHz; scaling it
          // to wall time makes the loop re-read each nibble 2.7x before the next
          // bit cell arrives and it never locks on.
          return iwmReadDataRegister(iwmDriveIndex, spinning,
            (iwmMode & 1) !== 0);
        }
        // An empty 3.5" bay reads as zero; the ROM's 5.25" self-test wants the
        // ROM byte instead.
        if (iwmEnable35) return 0;
        checkSlotIO(addr);
        return memory[ROMmemoryStart + addr - 0xC000];
      }
    } else {
      if (iwmQ6) {
        return 0;
      } else {
        // Handshake register: bit 7 (ready) | bit 6 (underrun). A 3.5" drive
        // in async mode owns these bits while it clocks a queued byte onto
        // the media. The 5.25" family never enters async mode, so the IWM's
        // idle state is ready with no underrun (gssquared reg_handshake after
        // reset is 0x80). ROM 03's write-handshake self-test polls bit 6 and
        // spins at $FF:57B7 if it reads the 0xC0 the 3.5" sync path used to
        // return here.
        if (iwmEnable35) {
          const spinning = iwmFloppySpinning(iwmDriveIndex, iwmMotorOn);
          return iwmReadHandshake35(iwmDriveIndex, spinning, iigsDiskBitCellCycles());
        }
        return 0x80;
      }
    }
  }

  // Apple IIgs STATE register ($C068)
  if (currentMachineName === "APPLE2GS" && addr === 0xC068) {
    let val = 0;
    if (SWITCHES.ALTZP.isSet) val |= 0x80;
    if (SWITCHES.PAGE2.isSet) val |= 0x40;
    if (SWITCHES.AUXRAMREAD.isSet) val |= 0x20;
    if (SWITCHES.AUXRAMWRITE.isSet) val |= 0x10;
    if (!SWITCHES.BSRREADRAM.isSet) val |= 0x08; // RDROM
    if (SWITCHES.BSRBANK2.isSet) val |= 0x04;
    if (SWITCHES.INTCXROM.isSet) val |= 0x01;
    return val;
  }

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
  if (isDebugging && checkWatchpoints) {
    const count = heatMapMemGet[addr] + 1
    heatMapMemGet[addr] = count
    if (count > heatMapMemGetMaxValue) {
      heatMapMemGetMaxValue = count
      heatMapMemGetMaxIndex = addr
    }
  }
  // debugSlot(4, addr)
  if (page === 0xC0) {
    value = memGetSoftSwitch(addr)
  } else {
    value = -1
    if (page >= 0xC1 && page <= 0xC7) {
      if (page === 0xC3 && videoTerm.enabled) {
        // Videx VideoTerm: serve ROM bytes directly without calling checkSlotIO.
        // Also support No Slot Clock (NSC) serial bit-stream read at $C3xx for NS.CLOCK.SYSTEM.
        const nscVal = noSlotClock.read(addr)
        value = (nscVal >= 0) ? nscVal : videoTerm.readMemory(addr)
      } else if (page === 0xC3 && vidhd.enabled) {
        if (SWITCHES.SLOTC3ROM.isSet && !SWITCHES.INTCXROM.isSet) {
          // SLOTC3ROM is ON ($C00B): return VidHD slot ROM bytes ($24, $EA, $4C...)
          value = vidhd.readMemory(addr)
        } else {
          // SLOTC3ROM is OFF ($C00A) or INTCXROM is ON: return internal Apple IIe 80-col ROM or NSC
          const nscVal = noSlotClock.read(addr)
          value = (nscVal >= 0) ? nscVal : -1
          checkSlotIO(addr)
        }
      } else if (page == 0xC3 && (SWITCHES.INTCXROM.isSet || !SWITCHES.SLOTC3ROM.isSet)) {
        // NSC answers in slot C3 memory to be compatible with standard ProDOS driver and A2osX
        value = noSlotClock.read(addr)
        checkSlotIO(addr)
      } else {
        // Empty slots return the floating bus, the way gssquared returns
        // floating_bus_read() for any read with no handler behind it.
        if (slotIsActive(page - 0xC0) && !slotHasCard[page - 0xC0]) {
          value = getFloatingBus()
        }
        checkSlotIO(addr)
      }
    } else if (page >= 0xC8 && page <= 0xCD && videoTerm.enabled) {
      value = videoTerm.readMemory(addr)
    } else if (addr === 0xCFFF) {
      manageC800(0xFF)
    }
    if (videoTerm.enabled && videoTerm.active && (addr === 0xFDF0 || addr === 0xFE89 || addr === 0xFB2F)) {
      // Direct execution of Monitor 40-column COUT1 ($FDF0), SETVID/PR#0 ($FE89), or INIT ($FB2F):
      // switch back to 40-column display
      videoTerm.active = false
    }
    if (value < 0) {
      const shifted = addressGetTable[page]
      value = memory[shifted + (addr & 255)]
    }
  }
  if (checkWatchpoints && isWatchpoint(addr, value, false)) {
    setWatchpointBreak(addr)
  }
  return value
}

export const memGetRaw = (addr: number): number => {
  const page = addr >>> 8
  const shifted = addressGetTable[page]
  return memory[shifted + (addr & 255)]
}

const memSetSoftSwitch = (addr: number, value: number) => {
    if (currentMachineName === "APPLE2GS" && addr >= 0xC0B0 && addr <= 0xC0BF) {
      // The IIgs Video Out Controller owns $C0B0-$C0BF. $C0B1 bits 4-5 select the
      // SHR source and, with bit 7 of $C0B5, enable 640x400 interlace, where the
      // second field is scanned from Mega II *main* RAM (gssquared
      // src/devices/voc/voc.cpp: interlace_enabled() is `(reg[1] & 0x30) == 0x30
      // && (reg[5] & 0x80)`, and voc_frame() composites E0 with E1). Nothing here
      // implements it yet, so record every write that would.
      if (shrDbg.voc.length < 128) shrDbg.voc.push((addr & 0xff), value)
    }
    // C029 (NEWVIDEO) - used by both Apple IIgs and VidHD
    if (addr === 0xC029) {
      if (vidhd.enabled || (gsROM && gsROM.length > 0)) {
        vidhd.writeSoftSwitch(value)
      }
      if (currentMachineName === "APPLE2GS" && shrDbg.newvideo.length < 64) {
        shrDbg.newvideo.push(value)
      }
      SWITCHES.NEWVIDEO.isSet = (value & 0x80) !== 0
      iigsRegisters[0x29] = value
      return
    }
    
    // Apple IIgs hardware registers ($C020-$C04F)
    if (currentMachineName === "APPLE2GS" && addr >= 0xC020 && addr <= 0xC04F) {
        // Handle specific IIgs hardware writes
        switch (addr) {
            case 0xC023: // VGC interrupt control
                vgcIntReg = (vgcIntReg & 0xF8) | (value & 0x07);
                if (((vgcIntReg & 0x02) && (vgcIntReg & 0x20)) || ((vgcIntReg & 0x04) && (vgcIntReg & 0x40))) {
                    vgcIntReg |= 0x80;
                } else {
                    vgcIntReg &= ~0x80;
                }
                iigsRegisters[0x23] = vgcIntReg;
                if (!iigsInterruptPending()) {
                    (globalThis as any).cpu?.clearIrq?.();
                }
                break;

            case 0xC026: // ADB Data (command/response queue)
                iigsADB.writeCommand(value);
                break;

            case 0xC027: // ADB Status (interrupt enables)
                iigsADB.writeStatus(value);
                break;
            
            case 0xC02D: // SLTROMSEL
                iigsSlotRegister = value & 0xFE;
                iigsRegisters[0x2D] = iigsSlotRegister;
                updateAddressTables();
                break;

            case 0xC031: // Disk Control Port (EN35 / HDSEL)
                iigsWriteDiskControlPort(value)
                break

            case 0xC030: // Speaker toggle
                // $C030 is still the Apple II toggle-a-bit speaker on the IIgs.
                // The default branch below would just stash the byte in
                // iigsRegisters and never click, because this whole $C020-$C04F
                // range short-circuits the normal softswitch path - which is why
                // the IIgs was completely silent.
                checkSoftSwitches(0xC030, true, s6502.cycleCount)
                break;

            case 0xC032: // VGC interrupt clear
                if ((value & 0x40) === 0) vgcIntReg &= ~0x40;
                if ((value & 0x20) === 0) vgcIntReg &= ~0x20;
                if (((vgcIntReg & 0x02) && (vgcIntReg & 0x20)) || ((vgcIntReg & 0x04) && (vgcIntReg & 0x40))) {
                    vgcIntReg |= 0x80;
                } else {
                    vgcIntReg &= ~0x80;
                }
                iigsRegisters[0x23] = vgcIntReg;
                iigsRegisters[0x32] = value;
                if (!iigsInterruptPending()) {
                    (globalThis as any).cpu?.clearIrq?.();
                }
                break;

            case 0xC033: // Clock Data
                iigsClock.writeData(value);
                break;
            
            case 0xC034: // Clock Control + Border Color
                iigsClock.writeControl(value);
                iigsRegisters[0x34] = value; // Also store for border color
                break;

            case 0xC036: // SPEED register: bit 7 = 1 → fast (2.8 MHz in native mode)
                // KEGS (moremem.c): bit 5 always clears; bits 6/5 are cleared by
                // any write except 0x40 on ROM 03, where bit 6 is the power-on
                // status latch.
                {
                    let speed = value & ~0x20;
                    const powerOn = value & 0x60;
                    if (powerOn !== 0 && (powerOn !== 0x40 || !isIigsRom03())) speed &= ~0x60;
                    setIigsSpeedRegister(speed);
                    iigsRegisters[0x36] = speed;
                }
                break;

            case 0xC038: // SCC Channel B Control
                if (sccRegSelect[0] === 0) {
                    sccRegSelect[0] = value & 0x0F;
                } else {
                    sccRegSelect[0] = 0;
                }
                break;

            case 0xC039: // SCC Channel A Control
                if (sccRegSelect[1] === 0) {
                    sccRegSelect[1] = value & 0x0F;
                } else {
                    sccRegSelect[1] = 0;
                }
                break;

            case 0xC03A: // SCC Channel B Data
            case 0xC03B: // SCC Channel A Data
                break;

            case 0xC03C: // DOC Sound Control
                docAccess.control++
                iigsEnsoniq.writeControl(value);
                break;
            case 0xC03D: // DOC Sound Data
                docAccess.data++
                iigsEnsoniq.writeData(value);
                break;
            case 0xC03E: // DOC Sound Address Low
                docAccess.addrLow++
                iigsEnsoniq.writeAddrLow(value);
                break;
            case 0xC03F: // DOC Sound Address High
                docAccess.addrHigh++
                iigsEnsoniq.writeAddrHigh(value);
                break;

            case 0xC041: // INTEN
                iigsRegisters[0x41] = value & 0x1F;
                if (!iigsInterruptPending()) {
                    (globalThis as any).cpu?.clearIrq?.();
                }
                break;

            case 0xC047: // CLEARINT - clears the pending interrupt flags
                vblPending = false;
                quarterSecondPending = false;
                (globalThis as any).__c047Writes = ((globalThis as any).__c047Writes || 0) + 1;
                iigsRegisters[0x47] = value;
                if (!iigsInterruptPending()) {
                    (globalThis as any).cpu?.clearIrq?.();
                }
                break;

            default:
                // Other IIgs registers - just store the value
                iigsRegisters[addr & 0xFF] = value;
                break;
        }
        return;
    }

    // Apple IIgs built-in IWM ($C0E0-$C0EF)
    if (currentMachineName === "APPLE2GS" && addr >= 0xC0E0 && addr <= 0xC0EF) {
        const reg = addr & 0x0F;
        switch (reg) {
            case 0x08: iwmMotorOn = false; break;
            case 0x09: iwmMotorOn = true; break;
            case 0x0A: iwmDriveSelect = 0; break;
            case 0x0B: iwmDriveSelect = 1; break;
            case 0x0C: iwmQ6 = false; break;
            case 0x0D: iwmQ6 = true; break;
            case 0x0E: iwmQ7 = false; break;
            case 0x0F: iwmQ7 = true; break;
        }
        // CA0-CA2/LSTRB can be driven by either a read or a write; both go
        // through the same switch decode (gssquared IWM2::decode).
        const iwmDriveIndex = IWM_FLOPPY_BASE[iwmEnable35 ? 5 : 6] + iwmDriveSelect;
        // Keep the 3.5" media clock on machine time across every access; see
        // the same call in the read path.
        if (iwmEnable35) {
            iwmAdvance35(iwmDriveIndex,
                iwmFloppySpinning(iwmDriveIndex, iwmMotorOn), iigsDiskBitCellCycles());
        }
        if (reg <= 7) {
            iwmStepHead(iwmDriveIndex, reg, iwmMotorOn, (iwmDiskRegister >> 7) & 1);
        }
        if (iwmQ6 && iwmQ7 && (reg & 1)) {
            if (!iwmMotorOn) {
                // Mode register: only writable while ENABLE is released
                // (gssquared IWM2::write). Switching out of async mode ends a
                // write session, so persist anything the burst wrote.
                if (iwmEnable35) iwmFlushWrites35(iwmDriveIndex);
                iwmMode = value & 0x1F;
            } else if (iwmEnable35 && (iwmMode & 0x02)) {
                // 3.5" async write: queue the byte; the LSS clocks it out at
                // the disk bit rate (MODE.H=1).
                iwmWriteDataRegister35(iwmDriveIndex, value,
                    iwmFloppySpinning(iwmDriveIndex, iwmMotorOn),
                    iigsDiskBitCellCycles());
            }
        }
        checkSlotIO(addr, value);
        return;
    }
  if (addr === 0xC058 && videoTerm.enabled) {
    // Videx Soft Video Switch: AN0 off -> switch to 40-col display
    videoTerm.active = false
  } else if (addr === 0xC059 && videoTerm.enabled) {
    // Videx Soft Video Switch: AN0 on -> switch to Videx 80-col display
    videoTerm.active = true
  }
  // Apple IIgs STATE register ($C068)
  if (currentMachineName === "APPLE2GS" && addr === 0xC068) {
    SWITCHES.ALTZP.isSet = (value & 0x80) !== 0;
    SWITCHES.PAGE2.isSet = (value & 0x40) !== 0;
    SWITCHES.AUXRAMREAD.isSet = (value & 0x20) !== 0;
    SWITCHES.AUXRAMWRITE.isSet = (value & 0x10) !== 0;
    SWITCHES.INTCXROM.isSet = (value & 0x01) !== 0;

    const bank2 = (value & 0x04) !== 0;
    const readRom = (value & 0x08) !== 0;
    const writeEnabled = SWITCHES.BSR_WRITE.isSet;
    const bankBase = bank2 ? 0xC080 : 0xC088;
    const select = readRom ? (writeEnabled ? 0x01 : 0x02)
                           : (writeEnabled ? 0x03 : 0x00);
    checkSoftSwitches(bankBase + select, false, (globalThis as any).s6502?.cycleCount ?? 0);
    updateAddressTables();
    iigsRegisters[0x68] = value;
    return;
  }

  // these are write-only soft switches that don't work like the others, since
  // we need the full byte of data being written
  if (currentMachineName !== "APPLE2GS" && (addr === 0xC071 || addr === 0xC073)) {
    // The 0th bank is also AUX memory. A bank past the installed memory is
    // latched too, and selects no RAM (see auxGetPage).
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
  if (isDebugging) {
    const count = heatMapMemSet[addr] + 1
    heatMapMemSet[addr] = count
    if (count > heatMapMemSetMaxValue) {
      heatMapMemSetMaxValue = count
      heatMapMemSetMaxIndex = addr
    }
  }
  // debugSlot(4, addr, value)
  if (page === 0xC0) {
    observeMemoryWrite(addr, value, "system", null)
    memSetSoftSwitch(addr, value)
  } else {
    if (addr === 0x37 && videoTerm.enabled) {
      // CSW High Byte written: $FD = Monitor COUT1 (40-col), $C3 = Slot 3 Videx (80-col)
      if (value === 0xFD) {
        videoTerm.active = false
      } else if (value === 0xC3) {
        videoTerm.active = true
      }
    }
    if (page >= 0xC1 && page <= 0xC7) {
      observeMemoryWrite(addr, value, "system", null)
      checkSlotIO(addr, value)
    } else if (page >= 0xCC && page <= 0xCD && videoTerm.enabled) {
      observeMemoryWrite(addr, value, "system", null)
      videoTerm.writeMemory(addr, value)
    } else if (addr === 0xCFFF) {
      observeMemoryWrite(addr, value, "system", null)
      manageC800(0xFF)
    }
    const shifted = addressSetTable[page]
    // This will prevent us from setting slot ROM or motherboard ROM
    if (shifted >= ADDRESS_GUARD) return
    const offset = shifted + (addr & 255)
    const effectiveSpace = offset < 0x10000
      ? "main" as const
      : offset >= RamWorksMemoryStart ? "aux" as const : "system" as const
    const effectiveAuxBank = effectiveSpace === "aux"
      ? Math.floor((offset - RamWorksMemoryStart) / 0x10000)
      : null
    observeMemoryWrite(addr, value, effectiveSpace, effectiveAuxBank)
    memory[offset] = value
  }
  if (isWatchpoint(addr, value, true)) {
    setWatchpointBreak(addr)
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

// Apple IIgs text-page sources for the video scanner.
//
// The IIgs's $C035 (STAT) shadow register decides which physical pages the
// video scanner reads for the text screen:
//   bit 0 ($01): text page 1  - clear => shadowed into Mega II main RAM
//   bit 5 ($20): text page 2  - clear => shadowed into Mega II main RAM
// 16-bit software (ProDOS 16 systems such as the SenseiPlayer disk) writes
// its screen to $E0:$0400 (Mega II main) and $E1:$0400 (Mega II aux) and
// expects the scanner to show those pages, so the renderer has to read them
// from there rather than from the fast RAM the CPU sees in banks 00/01.
const iigsTextMainSource = (pageOffset: number): Uint8Array => {
  const shadowBit = (pageOffset === TEXT_PAGE2) ? 0x20 : 0x01;
  if (!(iigsRegisters[0x35] & shadowBit)) return megaIIMain;
  return memory;
}

const iigsTextAuxSource = (): Uint8Array | null => {
  // The second half of the IIgs 80-column text screen lives in aux RAM.
  // 16-bit software (ProDOS 16 systems) writes it straight into bank $E1
  // (Mega II aux RAM = megaIIAux); 8-bit software reaches the same physical
  // page through the $C003 aux switch, which lands in the fast RAM. Use
  // whichever one the guest actually populated.
  for (let i = 0x400; i < 0x800; i++) {
    if (megaIIAux[i] !== 0x00 && megaIIAux[i] !== 0xA0) return megaIIAux;
  }
  return null;
}
const offset = [
  0, 0x80, 0x100, 0x180, 0x200, 0x280, 0x300, 0x380, 0x28, 0xA8, 0x128, 0x1A8,
  0x228, 0x2A8, 0x328, 0x3A8, 0x50, 0xD0, 0x150, 0x1D0, 0x250, 0x2D0, 0x350,
  0x3D0,
]

export const getTextPage = (getLores = false) => {
  if (videoTerm.enabled && videoTerm.active && !getLores) {
    // If we're in full graphics mode (GR, HGR2, or full HGR), return empty
    // so the graphics renderer renders the Apple II motherboard graphics.
    if (!SWITCHES.TEXT.isSet && !SWITCHES.MIXED.isSet) {
      return new Uint8Array()
    }
    // If in MIXED mode (4 lines of 40-col text at bottom), Videx Soft Video Switch
    // selects motherboard video output so the 4 lines are rendered in 40-column.
    if (!SWITCHES.TEXT.isSet && SWITCHES.MIXED.isSet) {
      // fall through to standard 40-column text page processing below
    } else {
      return videoTerm.getTextPage()
    }
  }
  let jstart = 0
  let jend = 24
  let is80column = false
  if (getLores) {
    if (SWITCHES.TEXT.isSet || SWITCHES.HIRES.isSet) {
      return new Uint8Array()
    }
    jend = SWITCHES.MIXED.isSet ? 20 : 24
    is80column = auxCardEnabled && SWITCHES.COLUMN80.isSet && SWITCHES.DHIRES.isSet
  } else {
    if (!SWITCHES.TEXT.isSet && !SWITCHES.MIXED.isSet) {
      return new Uint8Array()
    }
    if (!SWITCHES.TEXT.isSet && SWITCHES.MIXED.isSet) jstart = 20
    is80column = auxCardEnabled && SWITCHES.COLUMN80.isSet
  }

  if (is80column) {
    // Only select second 80-column text page if STORE80 is also OFF
    const pageOffset = (SWITCHES.PAGE2.isSet && !SWITCHES.STORE80.isSet) ? TEXT_PAGE2 : TEXT_PAGE1
    const textPage = new Uint8Array(80 * (jend - jstart)).fill(0xA0)
    // Apple IIgs: the text page lives in Mega II main/aux RAM when the
    // $C035 shadow bits say so, not in the fast RAM the CPU sees in banks
    // 00/01. 16-bit software (ProDOS 16, the SenseiPlay system) writes its
    // screen to $E0/$E1:$0400, and the video scanner reads the same physical
    // pages, so the renderer has to look there too.
    const iigs = currentMachineName === "APPLE2GS"
    const mainSrc = iigs ? iigsTextMainSource(pageOffset) : memory
    const auxSrc = iigs ? iigsTextAuxSource() : null
    for (let j = jstart; j < jend; j++) {
      const joffset = 80 * (j - jstart)
      for (let i = 0; i < 40; i++) {
        // Interleave the characters, aux memory comes first for each pair.
        const off = pageOffset + offset[j] + i
        textPage[joffset + 2 * i + 1] = mainSrc[off]
        textPage[joffset + 2 * i] = auxSrc ? auxSrc[off] : memory[RamWorksMemoryStart + off]
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
  const pageOffset = (SWITCHES.PAGE2.isSet && !SWITCHES.STORE80.isSet) ? TEXT_PAGE2 : TEXT_PAGE1
  const textPage = new Uint8Array(40 * (jend - jstart))
  // Apple IIgs: honour the $C035 text-page shadow (see the 80-column path).
  const mainSrc = currentMachineName === "APPLE2GS" ? iigsTextMainSource(pageOffset) : memory
  for (let j = jstart; j < jend; j++) {
    const joffset = 40 * (j - jstart)
    const start = pageOffset + offset[j]
    textPage.set(mainSrc.slice(start, start + 40), joffset)
  }
  return textPage
}

export const getTextPageAsString = () => {
  return Buffer.from(getTextPage().map((n) => (n &= 127))).toString()
}

const hiResSingle = new Uint8Array(40 * 192)
const hiResDouble = new Uint8Array(80 * 192)
let hiResCurrent = hiResSingle
let hiResLines = 192

// The floating bus holds the last byte the video scanner fetched. Every read of
// unmapped or unhandled space returns it, which is what gssquared does:
//
//   mmu.hpp:60        uint8_t floating_bus_val = 0xEE;   (power-on value)
//   mmu.hpp:176-178   set_floating_bus() / floating_bus_read()
//   VideoScannerIIgs::video_cycle()   video_byte = ram[address];
//                                     mmu->set_floating_bus(video_byte);
//   mmu_iigs.cpp:139  read_c0xx() returns floating_bus_read() by default
//   mmu.cpp:47,84     a missing page or read handler returns floating_bus_read()
//
// apple2ts returned Math.random() for empty slot $C0xx space instead. On the
// Apple IIgs slots 1-6 are empty, so every probe of, say, $C300 got a fresh
// random byte, which made the whole machine nondeterministic: the same MCS run
// crashed into a byte ramp on one start and landed in valid code on the next.
let floatingBus = 0xee
export const getFloatingBus = (): number => floatingBus
export const setFloatingBus = (value: number) => { floatingBus = value & 0xff }

export const exportMemoryToHiresLine = (line: number) => {
  const doubleRes = SWITCHES.DHIRES.isSet && SWITCHES.COLUMN80.isSet
  const video7foreground = SWITCHES.DHIRES.isSet && !SWITCHES.COLUMN80.isSet && SWITCHES.STORE80.isSet
  const video7_160 = SWITCHES.DHIRES.isSet && !SWITCHES.COLUMN80.isSet && SWITCHES.VIDEO7_160.isSet
  const video7_mono = SWITCHES.DHIRES.isSet && SWITCHES.COLUMN80.isSet && SWITCHES.VIDEO7_MONO.isSet
  // Determine which hi-res buffer to use
  if (doubleRes || video7_160 || video7_mono || video7foreground) {
    if (line === 0) {
      hiResCurrent = hiResDouble
      hiResLines = SWITCHES.MIXED.isSet ? 160 : 192
    }
    // Only select second 80-column text page if STORE80 is also OFF
    const pageOffset = (SWITCHES.PAGE2.isSet && !SWITCHES.STORE80.isSet) ? 0x4000 : 0x2000
    const addr = hiresLineToAddress(pageOffset, line)
    for (let i = 0; i < 40; i++) {
      hiResDouble[line * 80 + 2 * i + 1] = memory[addr + i]
      hiResDouble[line * 80 + 2 * i] = memory[RamWorksMemoryStart + addr + i]
    }
    setFloatingBus(hiResDouble[line * 80 + 79])
  } else {
    if (line === 0) {
      hiResCurrent = hiResSingle
      hiResLines = SWITCHES.MIXED.isSet ? 160 : 192
    }
    const pageOffset = SWITCHES.PAGE2.isSet ? 0x4000 : 0x2000
    const addr = pageOffset + 40 * Math.trunc(line / 64) +
      1024 * (line % 8) + 128 * (Math.trunc(line / 8) & 7)
    hiResSingle.set(memory.slice(addr, addr + 40), line * 40)
    setFloatingBus(hiResSingle[line * 40 + 39])
  }
}

export const getHires = () => {
  if (SWITCHES.TEXT.isSet || !SWITCHES.HIRES.isSet) {
    return new Uint8Array()
  }
  if (hiResLines === 192) {
    return hiResCurrent
  }
  if (hiResCurrent === hiResSingle) {
    return hiResCurrent.slice(0, 40 * hiResLines)
  }
  return hiResCurrent.slice(0, 80 * hiResLines)
}

// Read a block of memory (default 512 bytes = one ProDOS block) exactly as the
// CPU would see it. Each page is looked up separately in the address table,
// because consecutive Apple II pages are not always consecutive in our memory
// array. For example, bank 1 of $D000-$DFFF is stored below bank 2, so a block
// at $DF00 continues at $E000, not at the next offset in the array. The same
// applies to ALTZP ($01xx vs $02xx), 80STORE text/hires pages, and $BFxx/$C0xx.
export const getDataBlock = (addr: number, length = 512) => {
  const data = new Uint8Array(length)
  let dataOffset = 0
  while (dataOffset < length) {
    const currentAddress = (addr + dataOffset) & 0xFFFF
    const pageOffset = currentAddress & 0xFF
    const pageLength = Math.min(0x100 - pageOffset, length - dataOffset)
    const memoryOffset = addressGetTable[currentAddress >>> 8] + pageOffset
    data.set(memory.subarray(memoryOffset, memoryOffset + pageLength), dataOffset)
    dataOffset += pageLength
  }
  return data
}

// Write a block of data into memory exactly as the CPU would, one page at a
// time (see getDataBlock). Pages that are not writable (soft switches, slot
// ROM, or $D000-$FFFF when bank-switched RAM is write protected) are skipped,
// the same as memSet does for a single byte.
export const setMemoryBlock = (addr: number, data: Uint8Array) => {
  let dataOffset = 0
  while (dataOffset < data.length) {
    const currentAddress = (addr + dataOffset) & 0xFFFF
    const pageOffset = currentAddress & 0xFF
    const pageLength = Math.min(0x100 - pageOffset, data.length - dataOffset)
    const shifted = addressSetTable[currentAddress >>> 8]
    if (shifted < ADDRESS_GUARD) {
      memory.set(data.subarray(dataOffset, dataOffset + pageLength), shifted + pageOffset)
    }
    dataOffset += pageLength
  }
}

export const loadMainMemoryBlock = (addr: number, data: Uint8Array) => {
  if (!Number.isInteger(addr) || addr < 0 || addr + data.length > 0xC000) {
    throw new Error("Binary block must fit within main RAM at $0000-$BFFF")
  }
  memory.set(data, addr)
}

export const matchMemory = (addr: number, data: number[]) => {
  for (let i = 0; i < data.length; i++) {
   if (memGet(addr + i, false) !== data[i]) return false
  }
  return true
}

export const getZeroPage = () => {
  const offset = addressGetTable[0]
  const mem = memory.slice(offset, offset + 256)
  return mem
}

export const getBasePlusAuxMemory = () => {
  return memory.slice(0, RamWorksMemoryStart + 0x10000)
}

export const getCurrentMemory = () => {
  const dump = new Uint8Array(0x10000)
  for (let page = 0; page < 256; page++) {
    const offset = addressGetTable[page]
    dump.set(memory.slice(offset, offset + 256), page * 256)
  }
  return dump
}

export const getMainMemory = () => {
  return memory.slice(0, 0x10000)
}

export const getAuxMemory = () => {
  return memory.slice(RamWorksMemoryStart, RamWorksMemoryStart + 0x10000)
}

export const getHgr1Memory = () => {
  return memory.slice(0x2000, 0x4000)
}

export const getHgr2Memory = () => {
  return memory.slice(0x4000, 0x6000)
}

// $C029 NEWVIDEO bit 7 turns on the Super Hi-Res display, and doing so
// linearizes the Mega II aux window $2000-$9FFF. The physical Mega II aux
// interleave is $2000/$6000 halves, so a linear CPU address has to be folded:
//
//   x   = linear - $2000
//   phys = $2000 + ((x & 1) << 14) | (x >> 1)
//
// Without this, getShr() reads the two halves in the wrong order and the screen
// comes out as a repeating garbage tile over correct 80-column text - which is
// exactly what Music Construction Set's main screen did. See
// gssquared/src/mmus/iigs_aux_linear.hpp and mmu_iigs.hpp is_aux_linear(),
// where enabling SHR linearizes aux just as the explicit $C029 bit 6 does.
export const iigsAuxLinearToPhys = (linear: number): number => {
  if (linear < 0x2000 || linear > 0x9fff) return linear
  const x = linear - 0x2000
  return 0x2000 + (((x & 1) << 14) | (x >> 1))
}

// True when the aux $2000-$9FFF window is linearized: either $C029 bit 6 was
// set explicitly, or SHR is on (bit 7). gssquared: is_aux_linear() returns
// g_aux_linear || g_shr_enabled, with the comment that GS/OS draws its boot
// screen with $41 (linear, display off) and then switches to $81, expecting the
// mapping to persist.
export const isIigsAuxLinear = (): boolean => (iigsRegisters[0x29] & 0xc0) !== 0

// $C035 bit 6 (SHADOW_INH_IOLC) turns off I/O and language-card shadowing for
// banks $00/$01: while it is set those banks see plain fast RAM across
// $C000-$CFFF instead of the Mega II soft switches. gssquared:
// is_iolc_shadowed() == !(reg_shadow & SHADOW_INH_IOLC), bank_shadow_read/write.
export const isIigsIolcShadowed = (): boolean => (iigsRegisters[0x35] & 0x40) === 0

// Copy the SHR window out of the Mega II aux array, undoing the interleave when
// the window is linearized. vidhd.extractShrBuffer() expects the linear layout.
const extractShrFromAux = (aux: Uint8Array): Uint8Array => {
  if (!isIigsAuxLinear()) {
    return vidhd.extractShrBuffer(aux, 0)
  }
  // linear[] is indexed by the linear CPU address, so it has to reach $9FFF:
  // 0xA000 bytes, of which $2000-$9FFF is the SHR window handed on below.
  const linear = new Uint8Array(0xa000)
  for (let a = 0x2000; a <= 0x9fff; a++) {
    linear[a] = aux[iigsAuxLinearToPhys(a)]
  }
  // auxMemoryStart is the offset of the aux block, and extractShrBuffer adds
  // $2000 to it itself. `linear` already *is* the linearized $2000-$9FFF window,
  // so it must be passed as 0. Passing 0x2000 here reads linear[0x4000..0xC000],
  // which clamps to 16384 bytes, and processSuperHiRes then rejects the buffer
  // with "shrData.length < 0x8000" and never draws anything - a black screen.
  return vidhd.extractShrBuffer(linear, 0)
}

// Super Hi-Res display on ($C029 bit 7). Same bit the renderer gates on via
// SWITCHES.NEWVIDEO, exposed here so the ADB cursor sync can choose between
// closed-loop (SHR, pixel coordinates) and dead-reckoned relative deltas.
export const isIigsShrActive = (): boolean => SWITCHES.NEWVIDEO.isSet

// SCB (scan line control byte) for an SHR line. Bit 6 is the scanline
// interrupt enable: the VGC raises the scanline IRQ while it scans a line
// whose SCB has that bit set (gssquared VideoScannerIIgs.cpp
// `current_scb & 0x40`). GS/OS's Event Manager uses it to time its cursor
// draw/erase to the cursor's own scanline.
export const iigsShrScb = (line: number): number => memGet24(0xE19D00 + line)

// Super Hi-Res in 320-pixel mode: the line-0 scan control byte has bit 7 clear.
// The IIgs mouse reports its position in screen pixels, so a 320-mode program
// addresses half the horizontal counts a 640-mode one does. gssquared does the
// same `ax >>= 1` in keygloo_mouse_sync.hpp host_to_a2().
export const isIigsShr320 = (): boolean => {
  if (!SWITCHES.NEWVIDEO.isSet) return false
  const physical = isIigsAuxLinear() ? iigsAuxLinearToPhys(0x9d00) : 0x9d00
  return (megaIIAux[physical] & 0x80) === 0
}

// The 65816 ROM's live mouse position, as the guest sees it. ROM 01 publishes
// it in the text-page screen holes ($047C/$057C = X, $04FC/$05FC = Y); ROM 03
// leaves those holes at 0 and publishes it only in the bank-$E1 globals at
// $E1:0190/0191/0192/0193 (keygloo_mouse_sync.hpp read_em_mouse_pos /
// em_mouse_pos_from_bank_globals). Measurement on GS/OS 6.0.1 shows ROM 01
// maps both mirrors to the same value, so each ROM reads the source gssquared
// reads for it.
export const getIigsMousePos = (): { x: number, y: number } => {
  // ROM 03 / GS/OS 6.0.1 leaves the text-page holes at 0 and keeps the live
  // cursor in the $E1/0190-0193 bank globals (gssquared
  // keygloo_mouse_sync.hpp read_em_mouse_pos); reading the holes there pins
  // closed-loop feedback at the origin.
  if (isIigsRom03()) {
    return {
      x: megaIIAux[0x0190] | (megaIIAux[0x0192] << 8),
      y: megaIIAux[0x0191] | (megaIIAux[0x0193] << 8),
    }
  }
  return {
    x: memGet24(0x00047c) | (memGet24(0x00057c) << 8),
    y: memGet24(0x0004fc) | (memGet24(0x0005fc) << 8),
  }
}

// Is the guest's Event Manager running? gssquared uses this to decide whether
// its closed-loop mouse synchronisation is meaningful at all
// (keygloo_mouse_sync.hpp compute_em_active): the Tool Locator pointer at
// $E1/03C8 leads to the tool table, and the word at tool+24 is the Event
// Manager's "active" flag. Programs written for ProDOS 8 keep their own cursor
// and never install a Tool Locator, so the holes getIigsMousePos() reads stay
// at zero and steering against them walks their cursor off screen.
const TOOL_LOCATOR_ACTIVE_OFFSET = 6 * 4

export const iigsEventManagerActive = (): boolean => {
  if (!SWITCHES.NEWVIDEO.isSet) return false
  const toolStart = megaIIAux[0x03c8] | (megaIIAux[0x03c9] << 8) | (megaIIAux[0x03ca] << 16)
  if (toolStart < 0x20000 || toolStart >= 0x7fffe4) return false
  const addr = toolStart + TOOL_LOCATOR_ACTIVE_OFFSET
  const bank = (addr >>> 16) & 0xff
  const offset = addr & 0xffff
  // Never let a bogus pointer read a $C0xx soft switch.
  if (bank === 0 && offset >= 0xc000 && offset < 0xc100) return false
  return (memGet24(addr) | (memGet24(addr + 1) << 8)) !== 0
}

// ---- Debug-only SHR write census -------------------------------------------------
//
// A game that leaves stale sprites on screen is in one of two states, and they look
// identical from the canvas: either the emulator is displaying a buffer the game is
// not redrawing, or the game *is* redrawing the buffer we show and its own erase
// never runs. The only way to tell them apart is where the writes actually land, so
// count them. Four integers and a bounded log; polled through the existing
// ?romtrace=1 request/response path rather than pushed (AGENTS.md §26b).
export const shrDbg = {
  e1: 0,   // direct bank $E1 writes into the displayed $2000-$9FFF window
  e0: 0,   // direct bank $E0 (Mega II main) writes into that window
  b01: 0,  // bank $01 fast-RAM writes that shadowed into the SHR window
  b00: 0,  // bank $00 writes whose effective bank was main (Mega II main)
  b00aux: 0, // bank $00 writes whose effective bank was aux (Mega II aux)
  voc: [] as number[],   // $C0B0-$C0BF writes as addr,value pairs (VOC interlace)
  newvideo: [] as number[], // every $C029 write, oldest first
  // A sprite that never gets erased is often a sprite whose erase is scheduled
  // against the raster and never reaches its slot. $C02E/$C02F are the only way
  // software can see the beam, so the read count says whether a program is
  // raster-syncing at all and the value set says whether it ever gets the
  // scanline it is waiting for.
  vcountReads: 0,
  vcountVals: new Set<number>(),
  // Which instruction is storing into the displayed window, and over what
  // address range. A stale sprite is either "the erase never runs" or "the
  // erase runs somewhere else", and only the caller plus its destination span
  // separates those two. Off unless setShrDbgTrace(true) is asked for, because
  // the map lookup costs more than the four integer counters above.
  trace: false,
  writers: new Map<number, { id: number; n: number; lo: number; hi: number }>(),
  // Per-byte write count within the displayed window, saturating at 255, so a
  // pixel can be classified by how often it was stored to: 1 means the sprite
  // was drawn and never written again (no erase), 2 means something did come
  // back and wrote it (so an erase exists and either targets the wrong bytes or
  // carries the wrong data), and many means it is part of a repeatedly redrawn
  // background. The writer census cannot separate those: it only says which
  // instruction stored, summed over the whole window.
  hits: new Uint8Array(0x8000),
  // Which site stored into a byte *last*. The write count says a byte was drawn
  // and never restored; only attribution says by what. Two bytes that both end
  // up wrong can be "draw site, no erase" or "erase site, wrong data", and the
  // fix is different for each, so record the site id of the final store per byte.
  last: new Uint16Array(0x8000),
  // ... and the site that stored into it *first*. The last writer alone cannot
  // tell a redrawn pixel from a restored one; the (first, last) pair can, and it
  // is the only way to name the erase routine instead of guessing at it.
  first: new Uint16Array(0x8000),
  nextSiteId: 1,
  // The displayed window as it looked at the first dump since the last reset, so
  // "still wrong" has a fixed meaning: the picture before the sprite started
  // moving, not the previous frame.
  ref: null as Uint8Array | null,
}

export const setShrDbgTrace = (on: boolean) => {
  shrDbg.trace = on
  if (!on) {
    shrDbg.writers.clear()
    shrDbg.nextSiteId = 1
    shrDbg.last.fill(0)
    shrDbg.first.fill(0)
    shrDbg.hits.fill(0)
    shrDbg.ref = null
  }
}

const noteShrWrite = (pc: number, offset: number) => {
  const index = offset - 0x2000
  const h = shrDbg.hits[index]
  let w = shrDbg.writers.get(pc)
  if (!w) {
    if (shrDbg.writers.size > 512) return
    w = { id: shrDbg.nextSiteId++, n: 0, lo: offset, hi: offset }
    shrDbg.writers.set(pc, w)
  }
  if (h === 0) shrDbg.first[index] = w.id
  if (h < 255) shrDbg.hits[index] = h + 1
  shrDbg.last[index] = w.id
  w.n++
  if (offset < w.lo) w.lo = offset
  if (offset > w.hi) w.hi = offset
}

const shrWindowHash = (arr: Uint8Array): number => {
  let h = 0x811c9dc5
  for (let i = 0x2000; i < 0xa000; i++) {
    h ^= arr[i]
    h = Math.imul(h, 0x01000193) >>> 0
  }
  return h >>> 0
}

export const getShrDbg = () => ({
  e1: shrDbg.e1,
  e0: shrDbg.e0,
  b01: shrDbg.b01,
  b00: shrDbg.b00,
  b00aux: shrDbg.b00aux,
  voc: shrDbg.voc.slice(),
  newvideo: shrDbg.newvideo.slice(),
  auxHash: shrWindowHash(megaIIAux),
  mainHash: shrWindowHash(megaIIMain),
  c029: iigsRegisters[0x29],
  c035: iigsRegisters[0x35],
  linear: isIigsAuxLinear(),
  shrOn: SWITCHES.NEWVIDEO.isSet,
  // Raster-sync evidence: how often the beam was read, and (with the trace on)
  // which scanline values the reader actually saw.
  vcountReads: shrDbg.vcountReads,
  vcountVals: shrDbg.trace ? Array.from(shrDbg.vcountVals).sort((a, b) => a - b) : undefined,
  // Hottest storing instructions: {pc, writes, low/high offset within the window}
  // 64 sites because at 24 the census covered barely half of a busy game's
  // window writes, and the sprite draw/erase pair sits in the tail.
  writerTotal: shrDbg.e1,
  writerSites: shrDbg.writers.size,
  writers: shrDbg.trace
    ? Array.from(shrDbg.writers.entries())
        .sort((a, b) => b[1].n - a[1].n)
        .slice(0, 64)
        .map(([pc, w]) => ({ id: w.id, pc: pc.toString(16), n: w.n, lo: w.lo.toString(16), hi: w.hi.toString(16) }))
    : undefined,
})

export const resetShrDbg = () => {
  shrDbg.e1 = 0
  shrDbg.e0 = 0
  shrDbg.b01 = 0
  shrDbg.b00 = 0
  shrDbg.voc.length = 0
  shrDbg.newvideo.length = 0
  shrDbg.writers.clear()
  shrDbg.vcountReads = 0
  shrDbg.vcountVals.clear()
  shrDbg.hits.fill(0)
  shrDbg.last.fill(0)
  shrDbg.first.fill(0)
  shrDbg.nextSiteId = 1
  shrDbg.ref = null
}

// One-shot raw dump of the buffer the renderer actually displays. The counters
// above say whether writes arrive; this says what the displayed pixels really
// are, so a stale sprite can be blamed on the guest or on us without anyone
// having to look at a screenshot.
export const getShrDump = () => {
  const shr = getShr()
  const scb: number[] = []
  // getShr() is the $2000-$9FFF window, so index 0 is $2000: the scan-line
  // control bytes at CPU $9D00 are at index $7D00 and the palettes at $9E00
  // are at $7E00 (gssquared generate/AppleII.cpp:452).
  for (let y = 0; y < 200; y++) scb.push(shr[0x7d00 + y])
  let bin = ""
  for (let i = 0; i < shr.length; i += 8192) {
    bin += String.fromCharCode.apply(null, Array.from(shr.subarray(i, i + 8192)))
  }
  // The per-byte write census since the trace was armed, alongside the picture
  // it describes: comparing two dumps says which bytes changed, and this says
  // how often each was stored to, which is what separates "never erased" from
  // "erased with the wrong data".
  let hits = ""
  if (shrDbg.trace) {
    for (let i = 0; i < shrDbg.hits.length; i += 8192) {
      hits += String.fromCharCode.apply(null, Array.from(shrDbg.hits.subarray(i, i + 8192)))
    }
  }
  // Per-site attribution of the bytes that are still wrong relative to the first
  // dump taken since the census was reset. "This byte changed and was written
  // once" is only half the diagnosis: the fix differs between a draw instruction
  // whose erase never runs and an erase instruction that restores the wrong data,
  // and only the identity of the *last* storing site separates them. Computed
  // here rather than shipped as a per-byte table because the answer is ~40 rows
  // and the table would be 64KB.
  let attrib: Array<{ id: number; pc: string; from: number; n: number; lo: string; hi: string; ch1: number; ch2: number; chN: number; same: number; code: number[] }> | undefined
  let pairs: Array<{ a: string; b: string; n: number }> | undefined
  if (shrDbg.trace) {
    if (!shrDbg.ref) shrDbg.ref = shr.slice(0, 0x7d00)
    const tally = new Map<number, { ch1: number; ch2: number; chN: number; same: number }>()
    // A byte written more than once and still wrong has an *other* writer, and
    // naming it is the whole point: the first writer is the draw, the last is
    // whatever came back over it. If the second one is a restore, its code is
    // the bug; if it is the same sprite drawn again at the same place, no erase
    // exists and the game is waiting on an event that never arrives.
    const pairTally = new Map<string, number>()
    for (let i = 0; i < 0x7d00; i++) {
      if (shr[i] === shrDbg.ref[i]) continue
      const id = shrDbg.last[i]
      if (!id) continue
      let t = tally.get(id)
      if (!t) {
        t = { ch1: 0, ch2: 0, chN: 0, same: 0 }
        tally.set(id, t)
      }
      const h = shrDbg.hits[i]
      if (h <= 1) t.ch1++
      else {
        if (h === 2) t.ch2++
        else t.chN++
        const f = shrDbg.first[i]
        // "same" is the accumulation proof: this site wrote the byte at least
        // twice and nothing else ever came back over it, so the byte is not a
        // live sprite under the current drawing position but a stale image that
        // the site's own erase should have reclaimed. ch1 alone cannot say that,
        // because the byte under the sprite right now also looks like ch1.
        if (f === id) t.same++
        else {
          const key = f + ":" + id
          pairTally.set(key, (pairTally.get(key) ?? 0) + 1)
        }
      }
    }
    const pcOf = new Map<number, number>()
    for (const [pc, w] of shrDbg.writers) pcOf.set(w.id, pc)
    const hex = (id: number) => {
      const pc = pcOf.get(id)
      return pc === undefined ? "?" : (pc >>> 16).toString(16) + ":" + (pc & 0xffff).toString(16)
    }
    pairs = Array.from(pairTally.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 32)
      .map(([key, n]) => {
        const [f, l] = key.split(":")
        return { a: hex(Number(f)), b: hex(Number(l)), n }
      })
    // Every site that owns a still-wrong byte, ranked by ghost weight rather than
    // total writes: the .slice(0, 12) on the summed sort covered only 112 of the
    // 394 single-write bytes, i.e. the actual ghost owners were in the tail. Code
    // windows ship for the top 40 only, because that is what has to be read.
    attrib = Array.from(shrDbg.writers.entries())
      .filter(([, w]) => tally.has(w.id))
      .map(([pc, w]) => {
        const t = tally.get(w.id)!
        return { id: w.id, pc: pc.toString(16), from: (pc - 96) & 0xffff, n: w.n, lo: w.lo.toString(16), hi: w.hi.toString(16), ch1: t.ch1, ch2: t.ch2, chN: t.chN, same: t.same, code: [] as number[] }
      })
      // Ghost weight, not write count: a site that owns never-erased bytes is the
      // suspect even when it writes far less than the field refresh does.
      .sort((a, b) => ((b.ch1 + b.same) * 2 + b.ch2) - ((a.ch1 + a.same) * 2 + a.ch2) || (b.ch1 + b.ch2 + b.chN) - (a.ch1 + a.ch2 + a.chN))
      .slice(0, 64)
    attrib.slice(0, 40).forEach((row) => {
      // The census PC is the address *after* the operand fetch (AGENTS.md §46), so
      // the bytes of the storing instruction sit before it. A window straddling it
      // is enough to find the instruction boundary and the loop around it offline,
      // and shipping it here saves a whole browser round trip.
      const pc = parseInt(row.pc, 16)
      const bank = (pc >>> 16) & 0xff
      for (let k = 0; k < 256; k++) row.code.push(memGet24((bank << 16) | ((pc - 96 + k) & 0xffff)))
    })
  }
  return {
    len: shr.length,
    scb,
    b64: btoa(bin),
    hitsB64: shrDbg.trace ? btoa(hits) : undefined,
    attrib,
    pairs,
  }
}

export const getShr = (): Uint8Array => {
  if (gsROM && gsROM.length > 0) {
    return extractShrFromAux(megaIIAux)
  }
  if (!vidhd.enabled || !vidhd.active) {
    return new Uint8Array()
  }
  return vidhd.extractShrBuffer(memory, RamWorksMemoryStart)
}
