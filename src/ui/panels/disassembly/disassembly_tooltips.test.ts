import {
  getMemoryOperation,
  getDisassemblyWriteValue,
  getDisassemblyTooltip as resolveDisassemblyTooltip,
  getZeroPagePointer,
  DISASSEMBLY_TOOLTIP_ROWS,
} from "./disassembly_tooltips"
import { translateFromCatalogs } from "../../../i18n"
import { en } from "../../../i18n/languages/en"

const translateEnglish = (key: string, params?: Record<string, string>) =>
  translateFromCatalogs(en, en, key, params)

const getDisassemblyTooltip = (
  machine: MACHINE_NAME,
  address: number,
  opcode: string,
  value: number,
  operand = "",
) => resolveDisassemblyTooltip(machine, address, opcode, value, translateEnglish, operand)

describe("disassembly tooltip table", () => {
  test("classifies memory operations by opcode", () => {
    expect(getMemoryOperation("LDA")).toBe("read")
    expect(getMemoryOperation("BIT")).toBe("read")
    expect(getMemoryOperation("STA")).toBe("write")
    expect(getMemoryOperation("STZ")).toBe("write")
    expect(getMemoryOperation("STA", "$C030,X")).toBe("multiple-access")
    expect(getMemoryOperation("INC")).toBe("read-modify-write")
    expect(getMemoryOperation("TSB")).toBe("read-modify-write")
  })

  test("uses the store source register rather than the byte at an I/O address", () => {
    const registers = {Accum: 0x03, XReg: 0x04, YReg: 0x05}
    expect(getDisassemblyWriteValue("STA", 0xA0, registers)).toBe(0x03)
    expect(getDisassemblyWriteValue("STX", 0xA0, registers)).toBe(0x04)
    expect(getDisassemblyWriteValue("STY", 0xA0, registers)).toBe(0x05)
    expect(getDisassemblyWriteValue("STZ", 0xA0, registers)).toBe(0)
    expect(getDisassemblyWriteValue("LDA", 0xA0, registers)).toBe(0xA0)
  })

  test("wraps zero-page indirect pointers from $FF to $00", () => {
    const reads: number[] = []
    const memory = new Map([[0xFF, 0x30], [0x00, 0xC0]])
    const pointer = getZeroPagePointer(0xFF, (address) => {
      reads.push(address)
      return memory.get(address) ?? 0
    })

    expect(reads).toEqual([0xFF, 0x00])
    expect(pointer).toBe(0xC030)
  })

  test("distinguishes Apple IIe reads from writes in the keyboard/MMU range", () => {
    expect(getDisassemblyTooltip("APPLE2EE", 0xC003, "LDA", 0xDD))
      .toBe("Keyboard = \"]\"; Strobe is SET (bit 7 = 1)")
    expect(getDisassemblyTooltip("APPLE2EE", 0xC003, "STA", 0xDD))
      .toBe("Select auxiliary memory for reads")
  })

  test("treats the low Apple II+ range as keyboard mirrors", () => {
    expect(getDisassemblyTooltip("APPLE2P", 0xC003, "LDA", 0x5D))
      .toBe("Keyboard = \"]\"; Strobe is CLEAR (bit 7 = 0)")
    expect(getDisassemblyTooltip("APPLE2P", 0xC003, "STA", 0x5D))
      .toBe("Write ignored on Apple II+")
    expect(getDisassemblyTooltip("APPLE2P", 0xC01A, "LDA", 0xF4))
      .toBe("Clear keyboard strobe")
    expect(getDisassemblyTooltip("APPLE2P", 0xC01A, "STA", 0xF4))
      .toBe("Clear keyboard strobe")
  })

  test("decodes Apple IIe status from bit 7 without displaying bus bits", () => {
    expect(getDisassemblyTooltip("APPLE2EU", 0xC01A, "LDA", 0xF4))
      .toBe("Text Mode = ON (bit 7 = 1)")
    expect(getDisassemblyTooltip("APPLE2EU", 0xC01A, "LDA", 0x74))
      .toBe("Text Mode = OFF (bit 7 = 0)")
    expect(getDisassemblyTooltip("APPLE2EU", 0xC01A, "STA", 0xF4))
      .toBe("Clear keyboard strobe")
    expect(getDisassemblyTooltip("APPLE2EU", 0xC019, "LDA", 0x00))
      .toBe("Vertical Blank = ACTIVE (bit 7 = 0)")
    expect(getDisassemblyTooltip("APPLE2EU", 0xC019, "LDA", 0x80))
      .toBe("Vertical Blank = INACTIVE (bit 7 = 1)")
  })

  test("reports the any-key-down flag and clear-strobe action together", () => {
    expect(getDisassemblyTooltip("APPLE2EE", 0xC010, "LDA", 0x80))
      .toBe("Any Key Down = YES (bit 7 = 1); Clear keyboard strobe")
    expect(getDisassemblyTooltip("APPLE2EE", 0xC010, "STA", 0x80))
      .toBe("Clear keyboard strobe")
    expect(getDisassemblyTooltip("APPLE2P", 0xC010, "LDA", 0x80))
      .toBe("Clear keyboard strobe")
  })

  test("describes action switches without their returned bus value", () => {
    expect(getDisassemblyTooltip("APPLE2EE", 0xC030, "LDA", 0x5D))
      .toBe("Toggle speaker output")
    expect(getDisassemblyTooltip("APPLE2EE", 0xC030, "STA", 0x5D))
      .toBe("Toggle speaker output")
    expect(getDisassemblyTooltip("APPLE2P", 0xC050, "STA", 0xA0))
      .toBe("Select graphics mode")
  })

  test("supports reordered selected-language templates and English fallback", () => {
    const selectedLanguage = {
      debug: {
        disassemblyTooltips: {
          formats: {
            bit7: "bit {{bit}}: {{state}} ← {{label}}",
            withAction: "{{action}} / {{status}}",
          },
          labels: {
            textMode: "Modo texto",
            anyKeyDown: "Tecla pulsada",
          },
          states: {
            on: "ACTIVADO",
            yes: "SÍ",
          },
          text: {
            toggleSpeakerOutput: "Alternar salida del altavoz",
            clearKeyboardStrobe: "Borrar indicador del teclado",
          },
        },
      },
    }
    const translate = (key: string, params?: Record<string, string>) =>
      translateFromCatalogs(selectedLanguage, en, key, params)

    expect(resolveDisassemblyTooltip("APPLE2EE", 0xC030, "LDA", 0, translate))
      .toBe("Alternar salida del altavoz")
    expect(resolveDisassemblyTooltip("APPLE2EE", 0xC050, "LDA", 0, translate))
      .toBe("Select graphics mode")
    expect(resolveDisassemblyTooltip("APPLE2EE", 0xC01A, "LDA", 0x80, translate))
      .toBe("bit 1: ACTIVADO ← Modo texto")
    expect(resolveDisassemblyTooltip("APPLE2EE", 0xC010, "LDA", 0x80, translate))
      .toBe("Borrar indicador del teclado / bit 1: SÍ ← Tecla pulsada")
  })

  test("decodes input state from bit 7 only", () => {
    expect(getDisassemblyTooltip("APPLE2EE", 0xC061, "LDA", 0xFF))
      .toBe("Pushbutton 0 = PRESSED (bit 7 = 1)")
    expect(getDisassemblyTooltip("APPLE2EE", 0xC061, "LDA", 0x7F))
      .toBe("Pushbutton 0 = RELEASED (bit 7 = 0)")
  })

  test("keeps model-specific annunciator and double-hi-res meanings separate", () => {
    expect(getDisassemblyTooltip("APPLE2EE", 0xC05E, "LDA", 0))
      .toBe("Disable annunciator 3; enable DHIRES")
    expect(getDisassemblyTooltip("APPLE2EE", 0xC05F, "STA", 0))
      .toBe("Enable annunciator 3; disable DHIRES")
    expect(getDisassemblyTooltip("APPLE2P", 0xC05E, "LDA", 0))
      .toBe("Disable annunciator 3")
    expect(getDisassemblyTooltip("APPLE2P", 0xC05F, "STA", 0))
      .toBe("Enable annunciator 3")
  })

  test("describes Video7 switches on every model where Apple2TS applies them", () => {
    expect(getDisassemblyTooltip("APPLE2P", 0xC079, "STA", 0))
      .toBe("Enable Video7 160-column mode")
  })

  test("describes auxiliary-bank addressing", () => {
    expect(getDisassemblyTooltip("APPLE2EE", 0xC073, "LDA", 12)).toBe("")
    expect(getDisassemblyTooltip("APPLE2EE", 0xC073, "STA", 12))
      .toBe("Select auxiliary bank $0C using RamWorks addressing; start paddle timers")
    expect(getDisassemblyTooltip("APPLE2EU", 0xC071, "STA", 1))
      .toBe("Select auxiliary bank $01 using Neptune addressing; start paddle timers")
    expect(getDisassemblyTooltip("APPLE2EE", 0xC073, "STA", 0))
      .toBe("Select auxiliary bank $00 using RamWorks addressing; start paddle timers")
    expect(getDisassemblyTooltip("APPLE2EE", 0xC073, "STA", -1))
      .toBe("Select auxiliary bank using RamWorks addressing; start paddle timers")
    expect(getDisassemblyTooltip("APPLE2P", 0xC073, "STA", 12)).toBeUndefined()
  })

  test("distinguishes language-card read and write effects", () => {
    expect(getDisassemblyTooltip("APPLE2P", 0xC083, "LDA", 0))
      .toBe("Select LC bank 2; use RAM for reads; arm/enable writes")
    expect(getDisassemblyTooltip("APPLE2P", 0xC083, "STA", 0))
      .toBe("Select LC bank 2; use RAM for reads; reset prewrite latch")
  })

  test("does not fall back to a raw value for known read-modify-write cases", () => {
    expect(getDisassemblyTooltip("APPLE2EE", 0xC030, "INC", 0x5D))
      .toBe("Trigger multiple soft-switch operations")
    expect(getDisassemblyTooltip("APPLE2EE", 0xC030, "STA", 0x5D, "$C030,X"))
      .toBe("Trigger multiple soft-switch operations")
  })

  test("returns undefined only for addresses outside the machine table", () => {
    expect(getDisassemblyTooltip("APPLE2EE", 0x2000, "LDA", 0x42)).toBeUndefined()
    expect(DISASSEMBLY_TOOLTIP_ROWS.length).toBeGreaterThan(100)
  })
})
