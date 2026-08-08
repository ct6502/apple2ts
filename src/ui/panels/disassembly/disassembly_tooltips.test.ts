import {
  getAddressWrapMask,
  getMemoryOperation,
  getDisassemblyWriteValue,
  formatIndexedAddressNotation,
  formatPreIndexedAddressNotation,
  formatMemoryTooltip,
  getDisassemblyTooltip as resolveDisassemblyTooltip,
  getDisassemblyTooltipLines,
  getDisassemblyTooltipMessages,
  getZeroPagePointer,
  isolateTechnicalNotation,
  joinDisassemblyTooltipLines,
  renderDisassemblyTooltipMessages,
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

  test("lets translations place invariant notation within complete memory tooltips", () => {
    const selectedLanguage = {
      disassembly: {
        memory: {
          effectiveAddress: "{{notation}} ← Adresse effective",
          value: "{{notation}} ← Valeur",
        },
      },
    }
    const translate = (key: string, params?: Record<string, string>) =>
      translateFromCatalogs(selectedLanguage, en, key, params)
    const addressNotation = formatPreIndexedAddressNotation(
      "$20", "$03", "$23", "$1234",
    )
    const indexedNotation = formatIndexedAddressNotation("$2000", "$03", "$2003")

    expect(addressNotation).toBe("$1234 = ($23), $23 = $20 + $03")
    expect(indexedNotation).toBe("$2003 = $2000 + $03")
    expect(formatMemoryTooltip("effectiveAddress", indexedNotation, translateEnglish))
      .toBe(`Effective address: ${isolateTechnicalNotation(indexedNotation)}`)
    expect(formatMemoryTooltip("effectiveAddress", addressNotation, translate))
      .toBe(`${isolateTechnicalNotation(addressNotation)} ← Adresse effective`)
    expect(formatMemoryTooltip("value", "$42", translate))
      .toBe(`${isolateTechnicalNotation("$42")} ← Valeur`)
  })

  test("makes wrapped indexed-address arithmetic explicit", () => {
    expect(getAddressWrapMask(0xFE, 0x01, 0xFF)).toBeUndefined()
    expect(getAddressWrapMask(0xFF, 0x02, 0xFF)).toBe("$FF")
    expect(getAddressWrapMask(0xFFFE, 0x01, 0xFFFF)).toBeUndefined()
    expect(getAddressWrapMask(0xFFFF, 0x01, 0xFFFF)).toBe("$FFFF")

    expect(formatIndexedAddressNotation("$FF", "$02", "$01", "$FF"))
      .toBe("$01 = ($FF + $02) & $FF")
    expect(formatIndexedAddressNotation("$FFFF", "$01", "$0000", "$FFFF"))
      .toBe("$0000 = ($FFFF + $01) & $FFFF")
    expect(formatPreIndexedAddressNotation("$FF", "$02", "$01", "$C030", "$FF"))
      .toBe("$C030 = ($01), $01 = ($FF + $02) & $FF")
  })

  test("isolates notation and renders each translated message on its own line", () => {
    expect(isolateTechnicalNotation("$C073 = $C070 + $03"))
      .toBe("\u2066$C073 = $C070 + $03\u2069")
    expect(joinDisassemblyTooltipLines(
      "Effective address: \u2066$C073 = $C070 + $03\u2069",
      "Start paddle timers",
      "Select auxiliary expansion bank $03 using RamWorks addressing",
    )).toBe([
      "Effective address: \u2066$C073 = $C070 + $03\u2069",
      "Start paddle timers",
      "Select auxiliary expansion bank $03 using RamWorks addressing",
    ].join("\n"))
  })

  test("distinguishes Apple IIe reads from writes in the keyboard/MMU range", () => {
    expect(getDisassemblyTooltip("APPLE2EE", 0xC003, "LDA", 0xDD))
      .toBe("Keyboard: \"]\"\nKeyboard strobe: SET (MSB = 1)")
    expect(getDisassemblyTooltip("APPLE2EE", 0xC003, "STA", 0xDD))
      .toBe("Select auxiliary memory for reads")
  })

  test("treats the low Apple II+ range as keyboard mirrors", () => {
    expect(getDisassemblyTooltip("APPLE2P", 0xC003, "LDA", 0x5D))
      .toBe("Keyboard: \"]\"\nKeyboard strobe: CLEAR (MSB = 0)")
    expect(getDisassemblyTooltip("APPLE2P", 0xC003, "STA", 0x5D))
      .toBe("INFO: This write has no effect on Apple II+")
    expect(getDisassemblyTooltip("APPLE2P", 0xC01A, "LDA", 0xF4))
      .toBe("Clear keyboard strobe")
    expect(getDisassemblyTooltip("APPLE2P", 0xC01A, "STA", 0xF4))
      .toBe("Clear keyboard strobe")
  })

  test("decodes Apple IIe status from the MSB without displaying bus bits", () => {
    expect(getDisassemblyTooltip("APPLE2EU", 0xC01A, "LDA", 0xF4))
      .toBe("Text mode: ON (MSB = 1)")
    expect(getDisassemblyTooltip("APPLE2EU", 0xC01A, "LDA", 0x74))
      .toBe("Text mode: OFF (MSB = 0)")
    expect(getDisassemblyTooltip("APPLE2EU", 0xC01A, "STA", 0xF4))
      .toBe("Clear keyboard strobe")
    expect(getDisassemblyTooltip("APPLE2EU", 0xC019, "LDA", 0x00))
      .toBe("Vertical blank: ACTIVE (MSB = 0)")
    expect(getDisassemblyTooltip("APPLE2EU", 0xC019, "LDA", 0x80))
      .toBe("Vertical blank: INACTIVE (MSB = 1)")
    expect(getDisassemblyTooltip("APPLE2EU", 0xC016, "LDA", 0x00))
      .toBe("Zero page, stack, and bank-switched RAM: MAIN (MSB = 0)")
    expect(getDisassemblyTooltip("APPLE2EU", 0xC016, "LDA", 0x80))
      .toBe("Zero page, stack, and bank-switched RAM: AUXILIARY (MSB = 1)")
    expect(getDisassemblyTooltip("APPLE2EU", 0xC018, "LDA", 0x80))
      .toBe("PAGE2 selects main or auxiliary display memory (MSB = 1)")
    expect(getDisassemblyTooltip("APPLE2EU", 0xC01C, "LDA", 0x00))
      .toBe("Display-memory selection: PAGE 1 OR MAIN (MSB = 0)")
    expect(getDisassemblyTooltip("APPLE2EU", 0xC01C, "LDA", 0x80))
      .toBe("Display-memory selection: PAGE 2 OR AUXILIARY (MSB = 1)")
    expect(getDisassemblyTooltipLines(
      "APPLE2EU", 0xC01A, "LDA", -1, translateEnglish,
    )).toEqual([])
  })

  test("reports the any-key-down flag and clear-strobe action on separate lines", () => {
    expect(getDisassemblyTooltip("APPLE2EE", 0xC010, "LDA", 0x80))
      .toBe("Any-key-down flag: SET (MSB = 1)\nClear keyboard strobe")
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

  test("identifies the Apple2TS emulator register", () => {
    expect(getDisassemblyTooltip("APPLE2EE", 0xC04F, "LDA", 0x00))
      .toBe("INFO: Apple2TS emulator identifier: $CD")
  })

  test("renders complete switch-effect messages and parameterized data", () => {
    expect(getDisassemblyTooltip("APPLE2EE", 0xC001, "STA", 0))
      .toBe("Make PAGE2 select main or auxiliary display memory")
    expect(getDisassemblyTooltip("APPLE2EE", 0xC006, "STA", 0))
      .toBe("Select slot ROM for $C100-$CFFF")
    expect(getDisassemblyTooltip("APPLE2EE", 0xC009, "STA", 0))
      .toBe("Select auxiliary zero page, stack, and bank-switched RAM")
    expect(getDisassemblyTooltip("APPLE2EE", 0xC00D, "STA", 0))
      .toBe("Set display width to 80 columns")
    expect(getDisassemblyTooltip("APPLE2EE", 0xC00F, "STA", 0))
      .toBe("Select alternate character set")
    expect(getDisassemblyTooltip("APPLE2EE", 0xC053, "STA", 0))
      .toBe("Select mixed graphics/text")
    expect(getDisassemblyTooltip("APPLE2P", 0xC055, "STA", 0))
      .toBe("Select display page 2")
    expect(getDisassemblyTooltip("APPLE2EE", 0xC055, "STA", 0))
      .toBe("Select display page 2, or auxiliary display memory with 80STORE")
    expect(getDisassemblyTooltip("APPLE2EE", 0xC057, "STA", 0))
      .toBe("Select hi-res graphics")
  })

  test("supports localized complete clauses and English fallback", () => {
    const selectedLanguage = {
      disassembly: {
        display: {
          selectGraphicsMode: "Cambiar a modo gráfico",
          textModeStatusOn: "Modo texto: ACTIVADO (MSB = 1)",
        },
        languageCard: {
          selectBank: "Tarjeta de lenguaje: Seleccionar banco {{bank}}",
        },
        keyboard: {
          anyKeyDownSet: "Indicador de tecla pulsada: ACTIVO (MSB = 1)",
          clearStrobe: "Borrar indicador del teclado",
        },
        transWarp: {
          oneMhz: "TransWarp — Seleccionar 1 MHz",
        },
        notice: {
          unknownWrite: "AVISO — Esta instrucción escribe un valor desconocido",
        },
        speaker: {
          toggleOutput: "Alternar salida del altavoz",
        },
      },
    }
    const translate = (key: string, params?: Record<string, string>) =>
      translateFromCatalogs(selectedLanguage, en, key, params)

    expect(resolveDisassemblyTooltip("APPLE2EE", 0xC030, "LDA", 0, translate))
      .toBe("Alternar salida del altavoz")
    expect(resolveDisassemblyTooltip("APPLE2EE", 0xC050, "LDA", 0, translate))
      .toBe("Cambiar a modo gráfico")
    expect(resolveDisassemblyTooltip("APPLE2EE", 0xC01A, "LDA", 0x80, translate))
      .toBe("Modo texto: ACTIVADO (MSB = 1)")
    expect(resolveDisassemblyTooltip("APPLE2EE", 0xC010, "LDA", 0x80, translate))
      .toBe("Indicador de tecla pulsada: ACTIVO (MSB = 1)\nBorrar indicador del teclado")
    expect(resolveDisassemblyTooltip("APPLE2EE", 0xC083, "LDA", 0, translate)
      ?.split("\n")[0]).toBe("Tarjeta de lenguaje: Seleccionar banco 2")
    expect(resolveDisassemblyTooltip("APPLE2EE", 0xC074, "STA", 0x01, translate)
      ?.split("\n")[1]).toBe("TransWarp — Seleccionar 1 MHz")
    expect(resolveDisassemblyTooltip("APPLE2EE", 0xC074, "INC", 0x7F, translate)
      ?.split("\n")[1])
      .toBe("AVISO — Esta instrucción escribe un valor desconocido")
  })

  test("resolves semantic messages before applying a language", () => {
    const textModeMessages = getDisassemblyTooltipMessages("APPLE2EU", 0xC01A, "LDA", 0x80)
    const auxiliaryBankMessages = getDisassemblyTooltipMessages(
      "APPLE2EE", 0xC073, "STA", 0x0C,
    )

    expect(textModeMessages).toEqual([{key: "disassembly.display.textModeStatusOn"}])
    expect(renderDisassemblyTooltipMessages(textModeMessages ?? [], translateEnglish))
      .toEqual(["Text mode: ON (MSB = 1)"])
    expect(auxiliaryBankMessages).toEqual([
      {key: "disassembly.gameIO.startPaddleTimers"},
      {
        key: "disassembly.auxMemory.selectExpansionBank",
        params: {bank: "$0C", addressing: "RamWorks"},
      },
    ])
  })

  test("decodes input state from the MSB only", () => {
    expect(getDisassemblyTooltip("APPLE2EE", 0xC061, "LDA", 0xFF))
      .toBe("Pushbutton 0: PRESSED (MSB = 1)")
    expect(getDisassemblyTooltip("APPLE2EE", 0xC061, "LDA", 0x7F))
      .toBe("Pushbutton 0: RELEASED (MSB = 0)")
    expect(getDisassemblyTooltip("APPLE2EE", 0xC06D, "LDA", 0x80))
      .toBe("Paddle 1 timer mirror: ACTIVE (MSB = 1)")
  })

  test("separates model-specific annunciator and double-hi-res implications", () => {
    expect(getDisassemblyTooltip("APPLE2EE", 0xC05E, "LDA", 0))
      .toBe("Disable annunciator 3\nEnable DHIRES")
    expect(getDisassemblyTooltip("APPLE2EE", 0xC05F, "STA", 0))
      .toBe("Enable annunciator 3\nDisable DHIRES")
    expect(getDisassemblyTooltip("APPLE2P", 0xC05E, "LDA", 0))
      .toBe("Disable annunciator 3")
    expect(getDisassemblyTooltip("APPLE2P", 0xC05F, "STA", 0))
      .toBe("Enable annunciator 3")
  })

  test("describes the paddle trigger at every $C07x mirror", () => {
    for (const machine of ["APPLE2P", "APPLE2EU", "APPLE2EE"] as const) {
      for (let address = 0xC070; address <= 0xC07F; address++) {
        expect(getDisassemblyTooltip(machine, address, "LDA", 0))
          .toBe("Start paddle timers")
        expect(getDisassemblyTooltip(machine, address, "STA", 0)?.split("\n")[0])
          .toBe("Start paddle timers")
      }
    }
  })

  test("separates auxiliary-bank addressing from the paddle-timer effect", () => {
    expect(getDisassemblyTooltip("APPLE2EE", 0xC073, "LDA", 12))
      .toBe("Start paddle timers")
    expect(getDisassemblyTooltip("APPLE2EE", 0xC073, "STA", 12))
      .toBe("Start paddle timers\nSelect auxiliary expansion bank $0C using RamWorks addressing")
    expect(getDisassemblyTooltip("APPLE2EU", 0xC071, "STA", 1))
      .toBe("Start paddle timers\nSelect auxiliary expansion bank $01 using Neptune addressing")
    expect(getDisassemblyTooltip("APPLE2EE", 0xC073, "STA", 0))
      .toBe("Start paddle timers\nSelect auxiliary expansion bank $00 using RamWorks addressing")
    expect(getDisassemblyTooltip("APPLE2EE", 0xC073, "STA", -1))
      .toBe("Start paddle timers")
    expect(getDisassemblyTooltip("APPLE2P", 0xC073, "STA", 12))
      .toBe("Start paddle timers")
  })

  test("decodes both documented $C074 accelerator-control conventions", () => {
    expect(getDisassemblyTooltip("APPLE2EE", 0xC074, "LDA", 0xE0))
      .toBe("Start paddle timers")
    expect(getDisassemblyTooltip("APPLE2EE", 0xC074, "STA", 0x00)).toBe([
      "Start paddle timers",
      "TransWarp: Select configured maximum speed",
      "Laser 128EX: Select 1 MHz maximum CPU speed",
      "Laser 128EX: Disable automatic 1 MHz slowdown for port 7 disk access (write-once bit 5)",
    ].join("\n"))
    expect(getDisassemblyTooltip("APPLE2EE", 0xC074, "STA", 0x01)?.split("\n")[1])
      .toBe("TransWarp: Select 1 MHz")
    expect(getDisassemblyTooltip("APPLE2EE", 0xC074, "STA", 0x03)?.split("\n")[1])
      .toBe("TransWarp: Disable acceleration until cold boot")
    expect(getDisassemblyTooltip("APPLE2EE", 0xC074, "STA", 0x40)?.split("\n")[1])
      .toBe("Laser 128EX: Select 1 MHz maximum CPU speed")
    expect(getDisassemblyTooltip("APPLE2EE", 0xC074, "STA", 0xA0)).toBe([
      "Start paddle timers",
      "Laser 128EX: Select 2.3 MHz maximum CPU speed",
      "Laser 128EX: Enable automatic 1 MHz slowdown for port 7 disk access (write-once bit 5)",
    ].join("\n"))
    expect(getDisassemblyTooltip("APPLE2EE", 0xC074, "STA", 0xC0)?.split("\n")[1])
      .toBe("Laser 128EX: Select 3.6 MHz maximum CPU speed")
    expect(getDisassemblyTooltip("APPLE2EE", 0xC074, "STA", -1))
      .toBe("Start paddle timers")
  })

  test("classifies every Laser 128EX speed and disk-slowdown bit pattern", () => {
    for (let value = 0; value <= 0xFF; value++) {
      const lines = getDisassemblyTooltip("APPLE2EE", 0xC074, "STA", value)?.split("\n")
      const speed = value < 0x80 ? "1 MHz" : value < 0xC0 ? "2.3 MHz" : "3.6 MHz"
      const diskSlowdown = (value & 0x20) === 0 ? "Disable" : "Enable"

      expect(lines).toContain(`Laser 128EX: Select ${speed} maximum CPU speed`)
      expect(lines).toContain(
        `Laser 128EX: ${diskSlowdown} automatic 1 MHz slowdown for port 7 disk access (write-once bit 5)`,
      )
      if (value !== 0 && value !== 1 && value !== 3) {
        expect(lines?.some((line) => line.startsWith("TransWarp:"))).toBe(false)
      }
      expect(lines?.[0]).toBe("Start paddle timers")
    }
  })

  test("separates each language-card implication", () => {
    expect(getDisassemblyTooltip("APPLE2P", 0xC083, "LDA", 0))
      .toBe([
        "Language Card: Select bank 2",
        "Language Card: Use RAM for reads",
        "Language Card: Arm or enable writes",
      ].join("\n"))
    expect(getDisassemblyTooltip("APPLE2P", 0xC083, "STA", 0))
      .toBe([
        "Language Card: Select bank 2",
        "Language Card: Use RAM for reads",
        "Language Card: Reset prewrite latch",
      ].join("\n"))
    expect(getDisassemblyTooltipLines(
      "APPLE2P", 0xC083, "LDA", 0, translateEnglish,
    )).toEqual([
      "Language Card: Select bank 2",
      "Language Card: Use RAM for reads",
      "Language Card: Arm or enable writes",
    ])
    expect(getDisassemblyTooltipLines(
      "APPLE2EE", 0xC083, "LDA", 0, translateEnglish,
    )).toEqual([
      "Language Card: Select bank 2",
      "Language Card: Use RAM for reads",
      "Language Card: Arm or enable writes",
    ])
  })

  test("does not fall back to a raw value for known read-modify-write cases", () => {
    expect(getDisassemblyTooltip("APPLE2EE", 0xC030, "INC", 0x5D))
      .toBe("WARNING: This instruction triggers the soft switch multiple times")
    expect(getDisassemblyTooltip("APPLE2EE", 0xC030, "STA", 0x5D, "$C030,X"))
      .toBe("WARNING: This instruction triggers the soft switch multiple times")
  })

  test("preserves $C07x intent for indexed stores and read-modify-write accesses", () => {
    expect(getDisassemblyTooltip("APPLE2EE", 0xC074, "STA", 0x01, "$C074,X")).toBe([
      "Start paddle timers",
      "WARNING: This instruction triggers the soft switch multiple times",
      "TransWarp: Select 1 MHz",
      "Laser 128EX: Select 1 MHz maximum CPU speed",
      "Laser 128EX: Disable automatic 1 MHz slowdown for port 7 disk access (write-once bit 5)",
    ].join("\n"))
    expect(getDisassemblyTooltip("APPLE2EE", 0xC073, "STZ", 0x00, "$C073,X")).toBe([
      "Start paddle timers",
      "WARNING: This instruction triggers the soft switch multiple times",
      "Select auxiliary expansion bank $00 using RamWorks addressing",
    ].join("\n"))
    expect(getDisassemblyTooltip("APPLE2EE", 0xC072, "INC", 0x7F)).toBe([
      "Start paddle timers",
    ].join("\n"))
    expect(getDisassemblyTooltip("APPLE2EU", 0xC071, "INC", 0x7F)).toBe([
      "Start paddle timers",
      "WARNING: This instruction writes an unknown value",
    ].join("\n"))
    expect(getDisassemblyTooltip("APPLE2EE", 0xC073, "INC", 0x7F)).toBe([
      "Start paddle timers",
      "WARNING: This instruction writes an unknown value",
    ].join("\n"))
    expect(getDisassemblyTooltip("APPLE2P", 0xC073, "INC", 0x7F))
      .toBe("Start paddle timers")
    expect(getDisassemblyTooltip("APPLE2EE", 0xC074, "INC", 0x7F)).toBe([
      "Start paddle timers",
      "WARNING: This instruction writes an unknown value",
    ].join("\n"))
  })

  test("returns undefined only for addresses outside the machine table", () => {
    expect(getDisassemblyTooltip("APPLE2EE", 0x2000, "LDA", 0x42)).toBeUndefined()
    expect(DISASSEMBLY_TOOLTIP_ROWS.length).toBeGreaterThan(100)
  })
})
