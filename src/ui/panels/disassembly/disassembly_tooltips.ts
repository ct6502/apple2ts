type MemoryOperation = "read" | "write" | "read-modify-write" | "multiple-access"
type AddressWrapMask = "$FF" | "$FFFF"
export type TooltipTranslator = (key: string, params?: Record<string, string>) => string

type EnglishCatalog = (typeof import("../../../i18n/languages/en"))["en"]
type TooltipCatalog = EnglishCatalog["disassembly"]
type TooltipGroup = {
  [Key in keyof TooltipCatalog]: TooltipCatalog[Key] extends Record<string, string>
    ? Key
    : never
}[keyof TooltipCatalog]
type TooltipGroupedKey = {
  [Group in TooltipGroup]:
    `${Extract<Group, string>}.${Extract<keyof TooltipCatalog[Group], string>}`
}[TooltipGroup]
type TooltipGroupedMessageKey<Group extends TooltipGroup> =
  Group extends TooltipGroup
    ? Extract<keyof TooltipCatalog[Group], string>
    : never

type TooltipGroupedMessagePath = `disassembly.${TooltipGroupedKey}`
export type DisassemblyMessageKey = TooltipGroupedMessagePath
export type DisassemblyTooltipMessage = {
  key: DisassemblyMessageKey
  params?: Record<string, string>
}
type TooltipGroupedMessageDescriptor<Group extends TooltipGroup> = {
  kind: "grouped-message"
  group: Group
  key: TooltipGroupedMessageKey<Group>
  params?: Record<string, string>
}
type AnyTooltipGroupedMessageDescriptor = {
  [Group in TooltipGroup]: TooltipGroupedMessageDescriptor<Group>
}[TooltipGroup]

type TooltipDescriptor =
  | AnyTooltipGroupedMessageDescriptor
  | {kind: "sequence", parts: readonly TooltipDescriptor[]}
  | {kind: "msb-choice", zero: TooltipDescriptor, one: TooltipDescriptor}
  | {kind: "keyboard"}
  | {kind: "aux-bank-selector", addressing: string}
  | {kind: "accelerator-control"}

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

const sequence = (...parts: readonly TooltipDescriptor[]): TooltipDescriptor =>
  ({kind: "sequence", parts})
const keyboard = (): TooltipDescriptor => ({kind: "keyboard"})
const auxiliaryBankSelector = (addressing: string): TooltipDescriptor =>
  ({kind: "aux-bank-selector", addressing})
const acceleratorControl = (): TooltipDescriptor => ({kind: "accelerator-control"})
const groupedMessage = <Group extends TooltipGroup>(
  group: Group,
  key: TooltipGroupedMessageKey<Group>,
  params?: Record<string, string>,
): TooltipGroupedMessageDescriptor<Group> => ({kind: "grouped-message", group, key, params})
const msbMessages = <Group extends TooltipGroup>(
  group: Group,
  zero: TooltipGroupedMessageKey<Group>,
  one: TooltipGroupedMessageKey<Group>,
  params?: Record<string, string>,
): TooltipDescriptor => ({
  kind: "msb-choice",
  zero: groupedMessage(group, zero, params) as AnyTooltipGroupedMessageDescriptor,
  one: groupedMessage(group, one, params) as AnyTooltipGroupedMessageDescriptor,
})
const setAnnunciator = (
  number: "0" | "1" | "2" | "3",
  action: "disable" | "enable",
): TooltipDescriptor => groupedMessage("annunciator", action, {
  number,
})
const setDisplayWidth = (columns: "40" | "80"): TooltipDescriptor =>
  groupedMessage("display", "setWidth", {columns})
const selectRomForRange = (
  source: "internal" | "slot",
  range: string,
): TooltipDescriptor => groupedMessage(
  "rom",
  source,
  {range},
)
type LanguageCardWriteMode = "disable-writes" | "reset-prewrite-latch" | "arm-or-enable-writes"
const LANGUAGE_CARD_WRITE_KEYS: Record<
  LanguageCardWriteMode,
  TooltipGroupedMessageKey<"languageCard">
> = {
  "disable-writes": "disableWrites",
  "reset-prewrite-latch": "resetPrewriteLatch",
  "arm-or-enable-writes": "armOrEnableWrites",
}
const languageCard = (
  bank: "1" | "2",
  readSource: "ram" | "rom",
  writeMode: LanguageCardWriteMode,
): TooltipDescriptor => sequence(
  groupedMessage("languageCard", "selectBank", {bank}),
  groupedMessage("languageCard", readSource === "ram" ? "useRamForReads" : "useRomForReads"),
  groupedMessage("languageCard", LANGUAGE_CARD_WRITE_KEYS[writeMode]),
)

const addressRange = (start: number, end: number) =>
  Array.from({length: end - start + 1}, (_, offset) => start + offset)
const addresses = (...values: number[]) => values
const define = (
  machines: readonly MACHINE_NAME[],
  addresses: readonly number[],
  descriptors: Omit<DisassemblyTooltipRow, "machines" | "address">,
): DisassemblyTooltipDefinition => ({machines, addresses, ...descriptors})

const LANGUAGE_CARD_SWITCHES = [
  [0xC080, "2", "ram", "disable-writes"],
  [0xC081, "2", "rom", "arm-or-enable-writes"],
  [0xC082, "2", "rom", "disable-writes"],
  [0xC083, "2", "ram", "arm-or-enable-writes"],
  [0xC084, "2", "ram", "disable-writes"],
  [0xC085, "2", "rom", "arm-or-enable-writes"],
  [0xC086, "2", "rom", "disable-writes"],
  [0xC087, "2", "ram", "arm-or-enable-writes"],
  [0xC088, "1", "ram", "disable-writes"],
  [0xC089, "1", "rom", "arm-or-enable-writes"],
  [0xC08A, "1", "rom", "disable-writes"],
  [0xC08B, "1", "ram", "arm-or-enable-writes"],
  [0xC08C, "1", "ram", "disable-writes"],
  [0xC08D, "1", "rom", "arm-or-enable-writes"],
  [0xC08E, "1", "rom", "disable-writes"],
  [0xC08F, "1", "ram", "arm-or-enable-writes"],
] as const satisfies readonly (readonly [number, "1" | "2", "ram" | "rom", LanguageCardWriteMode])[]

const defineLanguageCardSwitches = (
  machines: readonly MACHINE_NAME[],
): readonly DisassemblyTooltipDefinition[] => LANGUAGE_CARD_SWITCHES.map(([
  address, bank, readSource, readAccessWriteMode,
]) => ({
  machines,
  address,
  read: languageCard(bank, readSource, readAccessWriteMode),
  write: languageCard(bank, readSource, "reset-prewrite-latch"),
}))

// These shared descriptors are intentionally one semantic source for every
// matching address.
const KEYBOARD_READ = keyboard()
const CLEAR_KEYBOARD_STROBE = groupedMessage("keyboard", "clearStrobe")
const NO_WRITE_EFFECT_ON_APPLE2P = groupedMessage("notice", "noWriteEffect", {
  machine: "Apple II+",
})
const PADDLE_TRIGGER = groupedMessage("gameIO", "startPaddleTimers")
const NEPTUNE_AUX_BANK_SELECTOR = sequence(
  PADDLE_TRIGGER,
  auxiliaryBankSelector("Neptune"),
)
const RAMWORKS_AUX_BANK_SELECTOR = sequence(
  PADDLE_TRIGGER,
  auxiliaryBankSelector("RamWorks"),
)
const ACCELERATOR_CONTROL = sequence(
  PADDLE_TRIGGER,
  acceleratorControl(),
)

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
  define(APPLE2EX, addresses(0xC000), {write: groupedMessage("displayMemory", "80storeOff")}),
  define(APPLE2EX, addresses(0xC001), {write: groupedMessage("displayMemory", "80storeOn")}),
  define(APPLE2EX, addresses(0xC002), {write: groupedMessage("auxMemory", "readMain")}),
  define(APPLE2EX, addresses(0xC003), {write: groupedMessage("auxMemory", "readAuxiliary")}),
  define(APPLE2EX, addresses(0xC004), {write: groupedMessage("auxMemory", "writeMain")}),
  define(APPLE2EX, addresses(0xC005), {write: groupedMessage("auxMemory", "writeAuxiliary")}),
  define(APPLE2EX, addresses(0xC006), {write: selectRomForRange("slot", "$C100-$CFFF")}),
  define(APPLE2EX, addresses(0xC007), {write: selectRomForRange("internal", "$C100-$CFFF")}),
  define(APPLE2EX, addresses(0xC008), {write: groupedMessage("auxMemory", "altzpMain")}),
  define(APPLE2EX, addresses(0xC009), {write: groupedMessage("auxMemory", "altzpAuxiliary")}),
  define(APPLE2EX, addresses(0xC00A), {write: selectRomForRange("internal", "$C300-$C3FF")}),
  define(APPLE2EX, addresses(0xC00B), {write: selectRomForRange("slot", "$C300-$C3FF")}),
  define(APPLE2EX, addresses(0xC00C), {write: setDisplayWidth("40")}),
  define(APPLE2EX, addresses(0xC00D), {write: setDisplayWidth("80")}),
  define(APPLE2EX, addresses(0xC00E), {write: groupedMessage("display", "selectPrimaryCharset")}),
  define(APPLE2EX, addresses(0xC00F), {write: groupedMessage("display", "selectAlternateCharset")}),

  // On the Apple II+, $C000-$C00F are keyboard mirrors rather than IIe
  // memory-management switches. Writes are ignored.
  define(APPLE2P, addressRange(0xC000, 0xC00F), {
    read: KEYBOARD_READ,
    write: NO_WRITE_EFFECT_ON_APPLE2P,
  }),

  define(APPLE2EX, addresses(0xC010), {
    read: sequence(
      msbMessages("keyboard", "anyKeyDownClear", "anyKeyDownSet"),
      CLEAR_KEYBOARD_STROBE,
    ),
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
    read: msbMessages("languageCard", "bank1", "bank2")},
  {machines: APPLE2EX, address: 0xC012,
    read: msbMessages("languageCard", "readSourceRom", "readSourceRam")},
  {machines: APPLE2EX, address: 0xC013,
    read: msbMessages("auxMemory", "readStatusOff", "readStatusOn")},
  {machines: APPLE2EX, address: 0xC014,
    read: msbMessages("auxMemory", "writeStatusOff", "writeStatusOn")},
  {machines: APPLE2EX, address: 0xC015,
    read: msbMessages("rom", "intCxOff", "intCxOn")},
  {machines: APPLE2EX, address: 0xC016,
    read: msbMessages("auxMemory", "altzpStatusMain", "altzpStatusAuxiliary")},
  {machines: APPLE2EX, address: 0xC017,
    read: msbMessages("rom", "slot3Off", "slot3On")},
  {machines: APPLE2EX, address: 0xC018,
    read: msbMessages("displayMemory", "80storeStatusOff", "80storeStatusOn")},
  {machines: APPLE2EX, address: 0xC019,
    read: msbMessages("display", "verticalBlankActive", "verticalBlankInactive")},
  {machines: APPLE2EX, address: 0xC01A,
    read: msbMessages("display", "textModeStatusOff", "textModeStatusOn")},
  {machines: APPLE2EX, address: 0xC01B,
    read: msbMessages("display", "mixedDisplayStatusOff", "mixedDisplayStatusOn")},
  {machines: APPLE2EX, address: 0xC01C,
    read: msbMessages("displayMemory", "page2StatusClear", "page2StatusSet")},
  {machines: APPLE2EX, address: 0xC01D,
    read: msbMessages("display", "hiresModeStatusOff", "hiresModeStatusOn")},
  {machines: APPLE2EX, address: 0xC01E,
    read: msbMessages("display", "altCharsetStatusOff", "altCharsetStatusOn")},
  {machines: APPLE2EX, address: 0xC01F,
    read: msbMessages("display", "column80StatusOff", "column80StatusOn")},

  {machines: ALL_MACHINES, address: 0xC020,
    access: groupedMessage("cassette", "toggleOutput")},
  {machines: ALL_MACHINES, address: 0xC030,
    access: groupedMessage("speaker", "toggleOutput")},
  {machines: ALL_MACHINES, address: 0xC040,
    access: groupedMessage("gameIO", "pulseStrobe")},
  {machines: ALL_MACHINES, address: 0xC04F,
    access: groupedMessage("notice", "emulatorIdentifier")},

  // Display and annunciator action switches.
  {machines: ALL_MACHINES, address: 0xC050,
    access: groupedMessage("display", "selectGraphicsMode")},
  {machines: ALL_MACHINES, address: 0xC051,
    access: groupedMessage("display", "selectTextMode")},
  {machines: ALL_MACHINES, address: 0xC052,
    access: groupedMessage("display", "selectFullScreenDisplay")},
  {machines: ALL_MACHINES, address: 0xC053,
    access: groupedMessage("display", "selectMixedDisplay")},
  {machines: APPLE2P, address: 0xC054,
    access: groupedMessage("displayMemory", "selectPage1")},
  {machines: APPLE2EX, address: 0xC054,
    access: groupedMessage("displayMemory", "page2Clear")},
  {machines: APPLE2P, address: 0xC055,
    access: groupedMessage("displayMemory", "selectPage2")},
  {machines: APPLE2EX, address: 0xC055,
    access: groupedMessage("displayMemory", "page2Set")},
  {machines: ALL_MACHINES, address: 0xC056,
    access: groupedMessage("display", "selectLoresGraphics")},
  {machines: ALL_MACHINES, address: 0xC057,
    access: groupedMessage("display", "selectHiresGraphics")},
  {machines: ALL_MACHINES, address: 0xC058,
    access: setAnnunciator("0", "disable")},
  {machines: ALL_MACHINES, address: 0xC059,
    access: setAnnunciator("0", "enable")},
  {machines: ALL_MACHINES, address: 0xC05A,
    access: setAnnunciator("1", "disable")},
  {machines: ALL_MACHINES, address: 0xC05B,
    access: setAnnunciator("1", "enable")},
  {machines: ALL_MACHINES, address: 0xC05C,
    access: setAnnunciator("2", "disable")},
  {machines: ALL_MACHINES, address: 0xC05D,
    access: setAnnunciator("2", "enable")},
  {machines: APPLE2EX, address: 0xC05E,
    access: sequence(setAnnunciator("3", "disable"), groupedMessage("display", "enableDhires"))},
  {machines: APPLE2EX, address: 0xC05F,
    access: sequence(setAnnunciator("3", "enable"), groupedMessage("display", "disableDhires"))},
  {machines: APPLE2P, address: 0xC05E,
    access: setAnnunciator("3", "disable")},
  {machines: APPLE2P, address: 0xC05F,
    access: setAnnunciator("3", "enable")},

  // Inputs. Writes have no useful state to display, so their matched cells are
  // intentionally empty and suppress the generic raw-byte tooltip.
  {machines: ALL_MACHINES, address: 0xC060,
    read: groupedMessage("cassette", "sampleInput")},
  {machines: ALL_MACHINES, address: 0xC061,
    read: msbMessages("gameIO", "buttonReleased", "buttonPressed", {number: "0"})},
  {machines: ALL_MACHINES, address: 0xC062,
    read: msbMessages("gameIO", "buttonReleased", "buttonPressed", {number: "1"})},
  {machines: ALL_MACHINES, address: 0xC063,
    read: msbMessages("gameIO", "buttonReleased", "buttonPressed", {number: "2"})},
  {machines: ALL_MACHINES, address: 0xC064,
    read: msbMessages("gameIO", "paddleExpired", "paddleActive", {number: "0"})},
  {machines: ALL_MACHINES, address: 0xC065,
    read: msbMessages("gameIO", "paddleExpired", "paddleActive", {number: "1"})},
  {machines: ALL_MACHINES, address: 0xC066,
    read: msbMessages("gameIO", "paddleExpired", "paddleActive", {number: "2"})},
  {machines: ALL_MACHINES, address: 0xC067,
    read: msbMessages("gameIO", "paddleExpired", "paddleActive", {number: "3"})},
  {machines: ALL_MACHINES, address: 0xC068,
    read: groupedMessage("cassette", "sampleInputMirror")},
  {machines: ALL_MACHINES, address: 0xC069,
    read: msbMessages(
      "gameIO", "buttonMirrorReleased", "buttonMirrorPressed", {number: "0"},
    )},
  {machines: ALL_MACHINES, address: 0xC06A,
    read: msbMessages(
      "gameIO", "buttonMirrorReleased", "buttonMirrorPressed", {number: "1"},
    )},
  {machines: ALL_MACHINES, address: 0xC06B,
    read: msbMessages(
      "gameIO", "buttonMirrorReleased", "buttonMirrorPressed", {number: "2"},
    )},
  {machines: ALL_MACHINES, address: 0xC06C,
    read: msbMessages(
      "gameIO", "paddleMirrorExpired", "paddleMirrorActive", {number: "0"},
    )},
  {machines: ALL_MACHINES, address: 0xC06D,
    read: msbMessages(
      "gameIO", "paddleMirrorExpired", "paddleMirrorActive", {number: "1"},
    )},
  {machines: ALL_MACHINES, address: 0xC06E,
    read: msbMessages(
      "gameIO", "paddleMirrorExpired", "paddleMirrorActive", {number: "2"},
    )},
  {machines: ALL_MACHINES, address: 0xC06F,
    read: msbMessages(
      "gameIO", "paddleMirrorExpired", "paddleMirrorActive", {number: "3"},
    )},
  // The motherboard decodes every read and write in $C070-$C07F as a
  // paddle trigger. A card or clone may add another effect without replacing
  // this base Apple II behavior.
  define(ALL_MACHINES, addressRange(0xC070, 0xC07F), {access: PADDLE_TRIGGER}),

  // Auxiliary-card conventions. The instruction tells us the convention and
  // requested bank byte, not whether a configured device accepts it.
  define(APPLE2EX, addresses(0xC071), {write: NEPTUNE_AUX_BANK_SELECTOR}),
  define(APPLE2EX, addresses(0xC073), {write: RAMWORKS_AUX_BANK_SELECTOR}),
  define(ALL_MACHINES, addresses(0xC074), {write: ACCELERATOR_CONTROL}),
  // Slot 0 supplies an optional Language Card on the II+. Equivalent bank-
  // switched memory is built into the IIe motherboard. Odd reads arm and then
  // enable writes; writes reset the prewrite latch but otherwise preserve the
  // current write-enable state.
  ...defineLanguageCardSwitches(APPLE2P),
  ...defineLanguageCardSwitches(APPLE2EX),
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

export const formatPreIndexedAddressNotation = (
  base: string,
  index: string,
  pointer: string,
  effectiveAddress: string,
  wrapMask?: AddressWrapMask,
) => `${effectiveAddress} = (${pointer}), ${pointer} = ${wrapMask
  ? `(${base} + ${index}) & ${wrapMask}`
  : `${base} + ${index}`}`

export const formatIndexedAddressNotation = (
  base: string,
  index: string,
  effectiveAddress: string,
  wrapMask?: AddressWrapMask,
) => `${effectiveAddress} = ${wrapMask
  ? `(${base} + ${index}) & ${wrapMask}`
  : `${base} + ${index}`}`

export const getAddressWrapMask = (
  base: number,
  index: number,
  mask: 0xFF | 0xFFFF,
) => base + index > mask ? (mask === 0xFF ? "$FF" : "$FFFF") : undefined

const LEFT_TO_RIGHT_ISOLATE = "\u2066"
const POP_DIRECTIONAL_ISOLATE = "\u2069"

export const isolateTechnicalNotation = (notation: string) =>
  `${LEFT_TO_RIGHT_ISOLATE}${notation}${POP_DIRECTIONAL_ISOLATE}`

export const formatMemoryTooltip = (
  kind: TooltipGroupedMessageKey<"memory">,
  notation: string,
  translate: TooltipTranslator,
) => translate(`disassembly.memory.${kind}`, {
  notation: isolateTechnicalNotation(notation),
})

export const joinDisassemblyTooltipLines = (
  ...lines: readonly (string | undefined)[]
) => lines.filter(Boolean).join("\n")

const formatKeyboardCharacter = (value: number) => {
  const key = value & 0x7F
  if (key === 0x7F) return "DEL"
  if (key < 0x20) return `^${String.fromCharCode(key + 0x40)}`
  if (key === 0x22) return "\\\""
  if (key === 0x5C) return "\\\\"
  return String.fromCharCode(key)
}

const groupedTooltipMessage = <Group extends TooltipGroup>(
  group: Group,
  key: TooltipGroupedMessageKey<Group>,
  params?: Record<string, string>,
): DisassemblyTooltipMessage => ({
  key: `disassembly.${group}.${key}` as TooltipGroupedMessagePath,
  ...(params ? {params} : {}),
})
const warningMessage = (
  key: "multipleTriggers" | "unknownWrite",
): DisassemblyTooltipMessage => groupedTooltipMessage("notice", key)

export const renderDisassemblyTooltipMessages = (
  messages: readonly DisassemblyTooltipMessage[],
  translate: TooltipTranslator,
) => messages.map(({key, params}) => translate(key, params))

const resolveDescriptor = (
  descriptor: TooltipDescriptor,
  value: number,
): readonly DisassemblyTooltipMessage[] => {
  switch (descriptor.kind) {
    case "sequence":
      return descriptor.parts.flatMap((part) => resolveDescriptor(part, value))
    case "msb-choice":
      return value < 0
        ? []
        : resolveDescriptor((value & 0x80) === 0 ? descriptor.zero : descriptor.one, value)
    case "grouped-message":
      return [groupedTooltipMessage(descriptor.group, descriptor.key, descriptor.params)]
    case "keyboard": {
      if (value < 0) return []
      const strobe = (value & 0x80) !== 0
      return [
        groupedTooltipMessage("keyboard", "character", {
          character: formatKeyboardCharacter(value),
        }),
        groupedTooltipMessage("keyboard", strobe ? "strobeSet" : "strobeClear"),
      ]
    }
    case "aux-bank-selector":
      return value < 0 ? [] : [groupedTooltipMessage("auxMemory", "selectExpansionBank", {
        bank: `$${(value & 0xFF).toString(16).toUpperCase().padStart(2, "0")}`,
        addressing: descriptor.addressing,
      })]
    case "accelerator-control": {
      if (value < 0) return []

      const controlValue = value & 0xFF
      const effects: DisassemblyTooltipMessage[] = []
      switch (controlValue) {
        case 0:
          effects.push(groupedTooltipMessage("transWarp", "configuredMaximum"))
          break
        case 1:
          effects.push(groupedTooltipMessage("transWarp", "oneMhz"))
          break
        case 3:
          effects.push(groupedTooltipMessage("transWarp", "disableUntilColdBoot"))
          break
      }

      const laserSpeedKey: TooltipGroupedMessageKey<"laser128ex"> = controlValue < 0x80
        ? "oneMhz"
        : controlValue < 0xC0 ? "twoPointThreeMhz" : "threePointSixMhz"
      const laserSpeedSelection = groupedTooltipMessage("laser128ex", laserSpeedKey)
      const laserDiskSlowdown = groupedTooltipMessage(
        "laser128ex",
        (controlValue & 0x20) === 0
          ? "disableDiskSlowdown"
          : "enableDiskSlowdown",
      )

      effects.push(laserSpeedSelection, laserDiskSlowdown)
      return effects
    }
  }
}

// undefined means the address is not in the semantic table and should retain
// the generic value tooltip. An empty array means the address is known but
// this operation has no meaningful state or action to display.
export const getDisassemblyTooltipMessages = (
  machine: MACHINE_NAME,
  address: number,
  opcode: string,
  value: number,
  operand = "",
): readonly DisassemblyTooltipMessage[] | undefined => {
  const row = tooltipRowsByMachineAndAddress.get(`${machine}:${address}`)
  if (!row) return undefined

  const operation = getMemoryOperation(opcode, operand)
  if (operation === "read-modify-write" || operation === "multiple-access") {
    const warning = warningMessage("multipleTriggers")
    if (address < 0xC070 || address > 0xC07F) return [warning]

    const descriptor = row.write ?? row.access
    if (!descriptor) return [warning]
    const semanticValue = operation === "read-modify-write" ? -1 : value
    const effects = resolveDescriptor(descriptor, semanticValue)
    if (effects.length === 0) return [warning]
    const [paddleEffect, ...otherEffects] = effects
    if (address === 0xC074 && operation === "read-modify-write") {
      return [
        paddleEffect,
        warningMessage("unknownWrite"),
        ...otherEffects,
      ]
    }
    if (operation === "read-modify-write") {
      if (machine !== "APPLE2P" && (address === 0xC071 || address === 0xC073)) {
        return [
          paddleEffect,
          warningMessage("unknownWrite"),
          ...otherEffects,
        ]
      }
      return effects
    }
    return [paddleEffect, warning, ...otherEffects]
  }

  const descriptor = operation === "write"
    ? row.write ?? row.access
    : row.read ?? row.access
  return descriptor ? resolveDescriptor(descriptor, value) : []
}

export const getDisassemblyTooltipLines = (
  machine: MACHINE_NAME,
  address: number,
  opcode: string,
  value: number,
  translate: TooltipTranslator,
  operand = "",
): readonly string[] | undefined => {
  const messages = getDisassemblyTooltipMessages(machine, address, opcode, value, operand)
  return messages && renderDisassemblyTooltipMessages(messages, translate)
}

export const getDisassemblyTooltip = (
  machine: MACHINE_NAME,
  address: number,
  opcode: string,
  value: number,
  translate: TooltipTranslator,
  operand = "",
): string | undefined =>
  getDisassemblyTooltipLines(machine, address, opcode, value, translate, operand)?.join("\n")
