import {
  doSetRom, gsSystemROM, iigsRegisters, megaIIAux, megaIIMain, memGet24, memSet24,
  memory, setIigsRomVersion, updateAddressTables,
} from "./memory"
import { SWITCHES } from "./softswitches"

// The IIgs MMU windows compared against gssquared v1.1 (mmu_iigs.cpp and
// iigsmmutest/tests.hpp): ROMBANK's A14 shift on ROM 01, the language-card
// bank placement, the AUXHGR shadow predicate and the $C029/$C02D read-back
// masks.  The ROM image is the real 128 KB ROM 01 that doSetRom installs.

const ROM_FF = 0x10000 // IIe compatibility bank inside the ROM 01 image

const resetGs = () => {
  setIigsRomVersion("01")
  doSetRom("APPLE2GS")
  megaIIAux.fill(0)
  megaIIMain.fill(0)
  iigsRegisters.fill(0)
  iigsRegisters[0x36] = 0x80 // default fast speed
  SWITCHES.BSRREADRAM.isSet = false
  SWITCHES.BSR_WRITE.isSet = false
  SWITCHES.BSRBANK2.isSet = false
  SWITCHES.ALTZP.isSet = false
  SWITCHES.INTCXROM.isSet = false
  SWITCHES.AUXRAMWRITE.isSet = false
  SWITCHES.AUXRAMREAD.isSet = false
  updateAddressTables()
}

describe("ROMBANK ($C028 / $C068 bit 1)", () => {
  test("$C028 toggles the bit on both reads and writes and ignores the data", () => {
    resetGs()
    expect(iigsRegisters[0x68] & 0x02).toBe(0)

    memSet24(0x00C028, 0xFF) // any value toggles, none is stored
    expect(iigsRegisters[0x68] & 0x02).toBe(0x02)
    expect(memGet24(0x00C068) & 0x02).toBe(0x02)

    memGet24(0x00C028) // a read toggles as well
    expect(iigsRegisters[0x68] & 0x02).toBe(0)

    memGet24(0x00C028)
    expect(iigsRegisters[0x68] & 0x02).toBe(0x02)
  })

  test("$C068 bit 1 is reported back from the state register", () => {
    resetGs()
    memSet24(0x00C068, 0x0E)
    expect(memGet24(0x00C068) & 0x0F).toBe(0x0E)
    memSet24(0x00C068, 0x0C)
    expect(memGet24(0x00C068) & 0x0F).toBe(0x0C)
  })

  test("ROM 01 masks A14 off the $D000-$FFFF and $C1xx-$CFFF windows", () => {
    resetGs()
    expect(memGet24(0x00D000)).toBe(gsSystemROM[ROM_FF + 0xD000])
    expect(memGet24(0x00E000)).toBe(gsSystemROM[ROM_FF + 0xE000])

    memSet24(0x00C028, 0x00)
    // $D000-$FFFF reads $9000-$BFFF of the same bank; the firmware window at
    // $C071-$C07F reads $8071-$807F (gssquared mega_rom_offset).
    expect(memGet24(0x00D000)).toBe(gsSystemROM[ROM_FF + 0x9000])
    expect(memGet24(0x00E000)).toBe(gsSystemROM[ROM_FF + 0xA000])
    expect(memGet24(0x00C071)).toBe(gsSystemROM[ROM_FF + 0xC071 - 0x4000])
    expect(memGet24(0x00C100)).toBe(gsSystemROM[ROM_FF + 0xC100 - 0x4000])

    // Direct bank $FE/$FF reads are not displaced.
    expect(memGet24(0xFFD000)).toBe(gsSystemROM[ROM_FF + 0xD000])
  })

  test("ROM 03 stores the bit but never moves a window", () => {
    setIigsRomVersion("03")
    doSetRom("APPLE2GS")
    iigsRegisters.fill(0)
    const rom03FF = 0x30000
    try {
      memSet24(0x00C068, 0x0F)
      expect(memGet24(0x00C068) & 0x0F).toBe(0x0F)
      expect(memGet24(0x00D000)).toBe(gsSystemROM[rom03FF + 0xD000])
      expect(memGet24(0x00C100)).toBe(gsSystemROM[rom03FF + 0xC100])
    } finally {
      setIigsRomVersion("01")
    }
  })
})

describe("language-card bank placement", () => {
  test("bank 2 reads from $C000-$CFFF and bank 1 from $D000-$DFFF", () => {
    resetGs()
    SWITCHES.ALTZP.isSet = false
    memory[0xC000] = 0x19
    memory[0xD000] = 0x2B

    SWITCHES.BSRREADRAM.isSet = true
    SWITCHES.BSRBANK2.isSet = true
    updateAddressTables()
    expect(memGet24(0x00D000)).toBe(0x19) // bank 2 is physically at $C000

    SWITCHES.BSRBANK2.isSet = false
    updateAddressTables()
    expect(memGet24(0x00D000)).toBe(0x2B) // bank 1 stays at $D000
  })

  test("the write table follows the same placement", () => {
    resetGs()
    SWITCHES.BSRREADRAM.isSet = true
    SWITCHES.BSR_WRITE.isSet = true
    SWITCHES.BSRBANK2.isSet = true
    updateAddressTables()
    memSet24(0x00D400, 0x77)
    expect(memory[0xC400]).toBe(0x77)
    expect(memory[0xD400]).toBe(0x00)
  })
})

describe("AUXHGR shadow predicate", () => {
  const bank01 = 0x012000

  test("only SHR inhibited ($C035=$08) still shadows odd $2000-$5FFF", () => {
    resetGs()
    iigsRegisters[0x29] = 0
    iigsRegisters[0x35] = 0x08
    memSet24(bank01, 0x55)
    expect(megaIIAux[0x2000]).toBe(0x55)
  })

  test("HGR1 and SHR inhibited ($C035=$0A) leaves odd $2000 alone", () => {
    resetGs()
    iigsRegisters[0x29] = 0
    iigsRegisters[0x35] = 0x0a
    memSet24(bank01, 0x66)
    expect(megaIIAux[0x2000]).toBe(0x00)
  })

  test("$C035=$0A still shadows odd $4000 because HGR2 and AUXHGR are clear", () => {
    resetGs()
    iigsRegisters[0x29] = 0
    iigsRegisters[0x35] = 0x0a
    memSet24(0x014000, 0x77)
    expect(megaIIAux[0x4000]).toBe(0x77)
  })

  test("$6000-$9FFF follows SHR only", () => {
    resetGs()
    iigsRegisters[0x29] = 0
    iigsRegisters[0x35] = 0x02 // HGR1 inhibit only, SHR clear: it shadows
    memSet24(0x016000, 0x88)
    expect(megaIIAux[0x6000]).toBe(0x88)

    iigsRegisters[0x35] = 0x08 // SHR inhibited: no $6000 shadow
    memSet24(0x017000, 0x99)
    expect(megaIIAux[0x7000]).toBe(0x00)
  })
})

describe("IIgs register read-back masks", () => {
  test("$C029 keeps only bits 7,6,5,0", () => {
    resetGs()
    memSet24(0x00C029, 0xFF)
    expect(memGet24(0x00C029)).toBe(0xE1)
    expect(iigsRegisters[0x29]).toBe(0xE1)

    memSet24(0x00C029, 0x40) // bit 6 only
    expect(memGet24(0x00C029)).toBe(0x40)
  })

  test("$C02D keeps only bits 7-4,2,1", () => {
    resetGs()
    memSet24(0x00C02D, 0xFF)
    expect(memGet24(0x00C02D)).toBe(0xF6)

    memSet24(0x00C02D, 0x08) // bit 3 is not settable
    expect(memGet24(0x00C02D)).toBe(0x00)
  })
})
