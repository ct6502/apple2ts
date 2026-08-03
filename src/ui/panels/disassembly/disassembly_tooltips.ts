type MemoryOperation = "read" | "write" | "read-modify-write" | "multiple-access"
export type TooltipTranslator = (key: string, params?: Record<string, string>) => string

type EnglishCatalog = (typeof import("../../../i18n/languages/en"))["en"]
type TooltipCatalog = EnglishCatalog["debug"]["disassemblyTooltips"]
type TooltipTextKey = keyof TooltipCatalog["text"]
type TooltipLabelKey = keyof TooltipCatalog["labels"]
type TooltipStateKey = keyof TooltipCatalog["states"]
export type TooltipFormatKey = keyof TooltipCatalog["formats"]

const tooltipKey = <Group extends keyof TooltipCatalog>(
  group: Group,
  key: Extract<keyof TooltipCatalog[Group], string>,
) => `debug.disassemblyTooltips.${group}.${key}`

type TooltipDescriptor =
  | {kind: "text", key: TooltipTextKey}
  | {
    kind: "bit7"
    labelKey: TooltipLabelKey
    clearKey: TooltipStateKey
    setKey: TooltipStateKey
    actionKey?: TooltipTextKey
  }
  | {kind: "keyboard"}
  | {kind: "aux-bank-selector", addressing: string}

type DisassemblyTooltipRow = {
  machines: readonly MACHINE_NAME[]
  address: number
  // Used when either a read or write access has the same effect.
  access?: TooltipDescriptor
  read?: TooltipDescriptor
  write?: TooltipDescriptor
}

type DisassemblyTooltipRangeDefinition = Omit<DisassemblyTooltipRow, "address"> & {
  addresses: readonly number[]
}
type DisassemblyTooltipDefinition = DisassemblyTooltipRow | DisassemblyTooltipRangeDefinition

const ALL_MACHINES: readonly MACHINE_NAME[] = ["APPLE2P", "APPLE2EU", "APPLE2EE"]
const APPLE2EX: readonly MACHINE_NAME[] = ["APPLE2EU", "APPLE2EE"]
const APPLE2P: readonly MACHINE_NAME[] = ["APPLE2P"]

const text = (key: TooltipTextKey): TooltipDescriptor => ({kind: "text", key})
const bit7 = (
  labelKey: TooltipLabelKey,
  clearKey: TooltipStateKey,
  setKey: TooltipStateKey,
  actionKey?: TooltipTextKey,
): TooltipDescriptor =>
  ({kind: "bit7", labelKey, clearKey, setKey, actionKey})
const keyboard = (): TooltipDescriptor => ({kind: "keyboard"})
const auxiliaryBankSelector = (addressing: string): TooltipDescriptor =>
  ({kind: "aux-bank-selector", addressing})

const addressRange = (start: number, end: number) =>
  Array.from({length: end - start + 1}, (_, offset) => start + offset)
const addresses = (...values: number[]) => values
const define = (
  machines: readonly MACHINE_NAME[],
  addresses: readonly number[],
  descriptors: Omit<DisassemblyTooltipRow, "machines" | "address">,
): DisassemblyTooltipDefinition => ({machines, addresses, ...descriptors})

// These shared descriptors are intentionally one semantic source for every
// matching address.
const KEYBOARD_READ = keyboard()
const CLEAR_KEYBOARD_STROBE = text("clearKeyboardStrobe")
const WRITE_IGNORED_ON_APPLE2P = text("writeIgnoredOnAppleIiPlus")
const NEPTUNE_AUX_BANK_SELECTOR = auxiliaryBankSelector("Neptune")
const RAMWORKS_AUX_BANK_SELECTOR = auxiliaryBankSelector("RamWorks")

const expandDefinitions = (
  definitions: readonly DisassemblyTooltipDefinition[],
): readonly DisassemblyTooltipRow[] => {
  const rows = new Map<string, DisassemblyTooltipRow>()
  for (const definition of definitions) {
    const definitionAddresses = "address" in definition
      ? [definition.address]
      : definition.addresses
    for (const machine of definition.machines) {
      for (const address of definitionAddresses) {
        const key = `${machine}:${address}`
        const row = rows.get(key) ?? {machines: [machine], address}
        for (const field of ["access", "read", "write"] as const) {
          const descriptor = definition[field]
          if (!descriptor) continue
          if (row[field]) throw new Error(`Duplicate disassembly tooltip descriptor: ${key}:${field}`)
          row[field] = descriptor
        }
        rows.set(key, row)
      }
    }
  }
  return [...rows.values()]
}

// Keep these authored definitions explicit. The derived rows below remain the
// resolver's complete machine/address/operation inventory.
const DISASSEMBLY_TOOLTIP_DEFINITIONS: readonly DisassemblyTooltipDefinition[] = [
  // Apple IIe keyboard reads and write-only memory switches.
  define(APPLE2EX, addressRange(0xC000, 0xC00F), {read: KEYBOARD_READ}),
  define(APPLE2EX, addresses(0xC000), {write: text("disablePage2DisplayMemoryBanking")}),
  define(APPLE2EX, addresses(0xC001), {write: text("enablePage2DisplayMemoryBanking")}),
  define(APPLE2EX, addresses(0xC002), {write: text("selectMainMemoryForReads")}),
  define(APPLE2EX, addresses(0xC003), {write: text("selectAuxiliaryMemoryForReads")}),
  define(APPLE2EX, addresses(0xC004), {write: text("selectMainMemoryForWrites")}),
  define(APPLE2EX, addresses(0xC005), {write: text("selectAuxiliaryMemoryForWrites")}),
  define(APPLE2EX, addresses(0xC006), {write: text("selectSlotRomForC100Cfff")}),
  define(APPLE2EX, addresses(0xC007), {write: text("selectInternalRomForC100Cfff")}),
  define(APPLE2EX, addresses(0xC008), {write: text("selectMainZeroPageAndStack")}),
  define(APPLE2EX, addresses(0xC009), {write: text("selectAuxiliaryZeroPageAndStack")}),
  define(APPLE2EX, addresses(0xC00A), {write: text("selectInternalRomForC300C3ff")}),
  define(APPLE2EX, addresses(0xC00B), {write: text("selectSlot3Rom")}),
  define(APPLE2EX, addresses(0xC00C), {write: text("select40ColumnDisplay")}),
  define(APPLE2EX, addresses(0xC00D), {write: text("select80ColumnDisplay")}),
  define(APPLE2EX, addresses(0xC00E), {write: text("selectPrimaryCharacterSet")}),
  define(APPLE2EX, addresses(0xC00F), {write: text("selectAlternateCharacterSet")}),

  // On the Apple II+, $C000-$C00F are keyboard mirrors rather than IIe
  // memory-management switches. Writes are ignored.
  define(APPLE2P, addressRange(0xC000, 0xC00F), {
    read: KEYBOARD_READ,
    write: WRITE_IGNORED_ON_APPLE2P,
  }),

  define(APPLE2EX, addresses(0xC010), {
    read: bit7("anyKeyDown", "no", "yes", "clearKeyboardStrobe"),
    write: CLEAR_KEYBOARD_STROBE,
  }),
  define(APPLE2P, addresses(0xC010), {access: CLEAR_KEYBOARD_STROBE}),

  // On the II+, the strobe-clear access is mirrored across this range. The
  // returned byte has no useful diagnostic meaning, but every access clears
  // the keyboard strobe.
  define(APPLE2P, addressRange(0xC011, 0xC01F), {
    access: CLEAR_KEYBOARD_STROBE,
  }),

  // Apple IIe status reads. Writes in this range clear the keyboard strobe.
  define(APPLE2EX, addressRange(0xC011, 0xC01F), {write: CLEAR_KEYBOARD_STROBE}),
  {machines: APPLE2EX, address: 0xC011,
    read: bit7("languageCardBank", "1", "2")},
  {machines: APPLE2EX, address: 0xC012,
    read: bit7("languageCardReadSource", "rom", "ram")},
  {machines: APPLE2EX, address: 0xC013,
    read: bit7("auxiliaryMemoryReads", "off", "on")},
  {machines: APPLE2EX, address: 0xC014,
    read: bit7("auxiliaryMemoryWrites", "off", "on")},
  {machines: APPLE2EX, address: 0xC015,
    read: bit7("internalCxRom", "off", "on")},
  {machines: APPLE2EX, address: 0xC016,
    read: bit7("auxiliaryZeroPageAndStack", "off", "on")},
  {machines: APPLE2EX, address: 0xC017,
    read: bit7("slot3Rom", "off", "on")},
  {machines: APPLE2EX, address: 0xC018,
    read: bit7("page2DisplayMemoryBanking", "off", "on")},
  {machines: APPLE2EX, address: 0xC019,
    read: bit7("verticalBlank", "active", "inactive")},
  {machines: APPLE2EX, address: 0xC01A,
    read: bit7("textMode", "off", "on")},
  {machines: APPLE2EX, address: 0xC01B,
    read: bit7("mixedDisplay", "off", "on")},
  {machines: APPLE2EX, address: 0xC01C,
    read: bit7("displayPage", "1", "2")},
  {machines: APPLE2EX, address: 0xC01D,
    read: bit7("hiResMode", "off", "on")},
  {machines: APPLE2EX, address: 0xC01E,
    read: bit7("alternateCharacterSet", "off", "on")},
  {machines: APPLE2EX, address: 0xC01F,
    read: bit7("80ColumnDisplay", "off", "on")},

  {machines: ALL_MACHINES, address: 0xC020,
    access: text("toggleCassetteOutput")},
  {machines: ALL_MACHINES, address: 0xC030,
    access: text("toggleSpeakerOutput")},
  {machines: ALL_MACHINES, address: 0xC040,
    access: text("pulseGamePortStrobe")},
  {machines: ALL_MACHINES, address: 0xC04F,
    access: text("apple2tsEmulationMarkerAlwaysCd")},

  // Display and annunciator action switches.
  {machines: ALL_MACHINES, address: 0xC050,
    access: text("selectGraphicsMode")},
  {machines: ALL_MACHINES, address: 0xC051,
    access: text("selectTextMode")},
  {machines: ALL_MACHINES, address: 0xC052,
    access: text("selectFullScreenDisplay")},
  {machines: ALL_MACHINES, address: 0xC053,
    access: text("selectMixedGraphicsText")},
  {machines: ALL_MACHINES, address: 0xC054,
    access: text("selectDisplayPage1")},
  {machines: ALL_MACHINES, address: 0xC055,
    access: text("selectDisplayPage2")},
  {machines: ALL_MACHINES, address: 0xC056,
    access: text("selectLoResGraphics")},
  {machines: ALL_MACHINES, address: 0xC057,
    access: text("selectHiResGraphics")},
  {machines: ALL_MACHINES, address: 0xC058,
    access: text("disableAnnunciator0")},
  {machines: ALL_MACHINES, address: 0xC059,
    access: text("enableAnnunciator0")},
  {machines: ALL_MACHINES, address: 0xC05A,
    access: text("disableAnnunciator1")},
  {machines: ALL_MACHINES, address: 0xC05B,
    access: text("enableAnnunciator1")},
  {machines: ALL_MACHINES, address: 0xC05C,
    access: text("disableAnnunciator2")},
  {machines: ALL_MACHINES, address: 0xC05D,
    access: text("enableAnnunciator2")},
  {machines: APPLE2EX, address: 0xC05E,
    access: text("disableAnnunciator3EnableDhires")},
  {machines: APPLE2EX, address: 0xC05F,
    access: text("enableAnnunciator3DisableDhires")},
  {machines: APPLE2P, address: 0xC05E,
    access: text("disableAnnunciator3")},
  {machines: APPLE2P, address: 0xC05F,
    access: text("enableAnnunciator3")},

  // Inputs. Writes have no useful state to display, so their matched cells are
  // intentionally empty and suppress the generic raw-byte tooltip.
  {machines: ALL_MACHINES, address: 0xC060,
    read: text("sampleCassetteInput")},
  {machines: ALL_MACHINES, address: 0xC061,
    read: bit7("pushbutton0", "released", "pressed")},
  {machines: ALL_MACHINES, address: 0xC062,
    read: bit7("pushbutton1", "released", "pressed")},
  {machines: ALL_MACHINES, address: 0xC063,
    read: bit7("pushbutton2", "released", "pressed")},
  {machines: ALL_MACHINES, address: 0xC064,
    read: bit7("paddle0Timer", "expired", "active")},
  {machines: ALL_MACHINES, address: 0xC065,
    read: bit7("paddle1Timer", "expired", "active")},
  {machines: ALL_MACHINES, address: 0xC066,
    read: bit7("paddle2Timer", "expired", "active")},
  {machines: ALL_MACHINES, address: 0xC067,
    read: bit7("paddle3Timer", "expired", "active")},
  {machines: ALL_MACHINES, address: 0xC068,
    read: text("sampleCassetteInputMirror")},
  {machines: ALL_MACHINES, address: 0xC069,
    read: bit7("pushbutton0Mirror", "released", "pressed")},
  {machines: ALL_MACHINES, address: 0xC06A,
    read: bit7("pushbutton1Mirror", "released", "pressed")},
  {machines: ALL_MACHINES, address: 0xC06B,
    read: bit7("pushbutton2Mirror", "released", "pressed")},
  {machines: ALL_MACHINES, address: 0xC06C,
    read: bit7("paddle0TimerMirror", "expired", "active")},
  {machines: ALL_MACHINES, address: 0xC06D,
    read: bit7("paddle1TimerMirror", "expired", "active")},
  {machines: ALL_MACHINES, address: 0xC06E,
    read: bit7("paddle2TimerMirror", "expired", "active")},
  {machines: ALL_MACHINES, address: 0xC06F,
    read: bit7("paddle3TimerMirror", "expired", "active")},
  {machines: ALL_MACHINES, address: 0xC070,
    access: text("startPaddleTimers")},

  // Auxiliary-card conventions. The instruction tells us the convention and
  // requested bank byte, not whether a configured device accepts it.
  define(APPLE2EX, addresses(0xC071), {write: NEPTUNE_AUX_BANK_SELECTOR}),
  define(APPLE2EX, addresses(0xC073), {write: RAMWORKS_AUX_BANK_SELECTOR}),
  {machines: ALL_MACHINES, address: 0xC074,
    access: text("laser128exCompatibilityNotEmulated")},
  // Language Card switches. Odd reads arm and then enable writes; writes reset
  // the prewrite latch but otherwise preserve the current write-enable state.
  {machines: ALL_MACHINES, address: 0xC080,
    read: text("selectLcBank2UseRamForReadsDisableWrites"),
    write: text("selectLcBank2UseRamForReadsResetPrewriteLatch")},
  {machines: ALL_MACHINES, address: 0xC081,
    read: text("selectLcBank2UseRomForReadsArmEnableWrites"),
    write: text("selectLcBank2UseRomForReadsResetPrewriteLatch")},
  {machines: ALL_MACHINES, address: 0xC082,
    read: text("selectLcBank2UseRomForReadsDisableWrites"),
    write: text("selectLcBank2UseRomForReadsResetPrewriteLatch")},
  {machines: ALL_MACHINES, address: 0xC083,
    read: text("selectLcBank2UseRamForReadsArmEnableWrites"),
    write: text("selectLcBank2UseRamForReadsResetPrewriteLatch")},
  {machines: ALL_MACHINES, address: 0xC084,
    read: text("selectLcBank2UseRamForReadsDisableWrites"),
    write: text("selectLcBank2UseRamForReadsResetPrewriteLatch")},
  {machines: ALL_MACHINES, address: 0xC085,
    read: text("selectLcBank2UseRomForReadsArmEnableWrites"),
    write: text("selectLcBank2UseRomForReadsResetPrewriteLatch")},
  {machines: ALL_MACHINES, address: 0xC086,
    read: text("selectLcBank2UseRomForReadsDisableWrites"),
    write: text("selectLcBank2UseRomForReadsResetPrewriteLatch")},
  {machines: ALL_MACHINES, address: 0xC087,
    read: text("selectLcBank2UseRamForReadsArmEnableWrites"),
    write: text("selectLcBank2UseRamForReadsResetPrewriteLatch")},
  {machines: ALL_MACHINES, address: 0xC088,
    read: text("selectLcBank1UseRamForReadsDisableWrites"),
    write: text("selectLcBank1UseRamForReadsResetPrewriteLatch")},
  {machines: ALL_MACHINES, address: 0xC089,
    read: text("selectLcBank1UseRomForReadsArmEnableWrites"),
    write: text("selectLcBank1UseRomForReadsResetPrewriteLatch")},
  {machines: ALL_MACHINES, address: 0xC08A,
    read: text("selectLcBank1UseRomForReadsDisableWrites"),
    write: text("selectLcBank1UseRomForReadsResetPrewriteLatch")},
  {machines: ALL_MACHINES, address: 0xC08B,
    read: text("selectLcBank1UseRamForReadsArmEnableWrites"),
    write: text("selectLcBank1UseRamForReadsResetPrewriteLatch")},
  {machines: ALL_MACHINES, address: 0xC08C,
    read: text("selectLcBank1UseRamForReadsDisableWrites"),
    write: text("selectLcBank1UseRamForReadsResetPrewriteLatch")},
  {machines: ALL_MACHINES, address: 0xC08D,
    read: text("selectLcBank1UseRomForReadsArmEnableWrites"),
    write: text("selectLcBank1UseRomForReadsResetPrewriteLatch")},
  {machines: ALL_MACHINES, address: 0xC08E,
    read: text("selectLcBank1UseRomForReadsDisableWrites"),
    write: text("selectLcBank1UseRomForReadsResetPrewriteLatch")},
  {machines: ALL_MACHINES, address: 0xC08F,
    read: text("selectLcBank1UseRamForReadsArmEnableWrites"),
    write: text("selectLcBank1UseRamForReadsResetPrewriteLatch")},
]

export const DISASSEMBLY_TOOLTIP_ROWS = expandDefinitions(DISASSEMBLY_TOOLTIP_DEFINITIONS)

const tooltipRowsByMachineAndAddress = new Map<string, DisassemblyTooltipRow>()

for (const row of DISASSEMBLY_TOOLTIP_ROWS) {
  for (const machine of row.machines) {
    const key = `${machine}:${row.address}`
    if (tooltipRowsByMachineAndAddress.has(key)) {
      throw new Error(`Duplicate disassembly tooltip row: ${key}`)
    }
    tooltipRowsByMachineAndAddress.set(key, row)
  }
}

const STORE_OPCODES = new Set(["STA", "STX", "STY", "STZ"])
const READ_MODIFY_WRITE_OPCODES = new Set(["ASL", "DEC", "INC", "LSR", "ROL", "ROR", "TRB", "TSB"])

export const getMemoryOperation = (opcode: string, operand = ""): MemoryOperation => {
  // Apple2TS models an extra soft-switch strobe for absolute,X STA and STZ.
  if (["STA", "STZ"].includes(opcode) && /\$[0-9A-Fa-f]{4},X/.test(operand)) {
    return "multiple-access"
  }
  if (STORE_OPCODES.has(opcode)) return "write"
  if (READ_MODIFY_WRITE_OPCODES.has(opcode)) return "read-modify-write"
  return "read"
}

type TooltipRegisters = Pick<STATE6502, "Accum" | "XReg" | "YReg">

export const getDisassemblyWriteValue = (
  opcode: string,
  memoryValue: number,
  registers: TooltipRegisters,
) => {
  switch (opcode) {
    case "STA": return registers.Accum
    case "STX": return registers.XReg
    case "STY": return registers.YReg
    case "STZ": return 0
    default: return memoryValue
  }
}

export const getZeroPagePointer = (
  address: number,
  readByte: (address: number) => number,
) => {
  const lowAddress = address & 0xFF
  return readByte(lowAddress) + 256 * readByte((lowAddress + 1) & 0xFF)
}

const formatKeyboardCharacter = (value: number) => {
  const key = value & 0x7F
  if (key === 0x7F) return "DEL"
  if (key < 0x20) return `^${String.fromCharCode(key + 0x40)}`
  if (key === 0x22) return "\\\""
  if (key === 0x5C) return "\\\\"
  return String.fromCharCode(key)
}

const formatDescriptor = (
  descriptor: TooltipDescriptor,
  value: number,
  translate: TooltipTranslator,
) => {
  switch (descriptor.kind) {
    case "text":
      return translate(tooltipKey("text", descriptor.key))
    case "bit7": {
      const label = translate(tooltipKey("labels", descriptor.labelKey))
      if (value < 0) {
        return translate(tooltipKey("formats", "unknown"), {label})
      }
      const isSet = (value & 0x80) !== 0
      const stateKey = isSet ? descriptor.setKey : descriptor.clearKey
      const status = translate(tooltipKey("formats", "bit7"), {
        label,
        state: translate(tooltipKey("states", stateKey)),
        bit: isSet ? "1" : "0",
      })
      return descriptor.actionKey
        ? translate(tooltipKey("formats", "withAction"), {
          status,
          action: translate(tooltipKey("text", descriptor.actionKey)),
        })
        : status
    }
    case "keyboard": {
      if (value < 0) return translate(tooltipKey("formats", "keyboardUnknown"))
      const strobe = (value & 0x80) !== 0
      return translate(tooltipKey("formats", "keyboard"), {
        character: formatKeyboardCharacter(value),
        state: translate(tooltipKey("states", strobe ? "set" : "clear")),
        bit: strobe ? "1" : "0",
      })
    }
    case "aux-bank-selector":
      return value < 0
        ? translate(tooltipKey("formats", "auxiliaryBankUnknown"), {
          addressing: descriptor.addressing,
        })
        : translate(tooltipKey("formats", "auxiliaryBank"), {
          bank: `$${(value & 0xFF).toString(16).toUpperCase().padStart(2, "0")}`,
          addressing: descriptor.addressing,
        })
  }
}

// undefined means the address is not in the semantic table and should retain
// the generic value tooltip. An empty string means the address is known but
// this operation has no meaningful state or action to display.
export const getDisassemblyTooltip = (
  machine: MACHINE_NAME,
  address: number,
  opcode: string,
  value: number,
  translate: TooltipTranslator,
  operand = "",
): string | undefined => {
  const row = tooltipRowsByMachineAndAddress.get(`${machine}:${address}`)
  if (!row) return undefined

  const operation = getMemoryOperation(opcode, operand)
  if (operation === "read-modify-write" || operation === "multiple-access") {
    return translate(tooltipKey("text", "triggerMultipleSoftSwitchOperations"))
  }

  const descriptor = operation === "write"
    ? row.write ?? row.access
    : row.read ?? row.access
  return descriptor ? formatDescriptor(descriptor, value, translate) : ""
}
