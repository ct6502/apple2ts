// Explicit machine-family profiles.
//
// The emulator supports two hardware families. The classic family is the
// software-compatible Apple II+ / IIe board; the GS family is the 65816 machine
// with its own ROM, memory map, ADB and built-in slot functions. Product targets
// may expose only one family, but hardware capabilities must come from the
// machine profile rather than from scattered `machine === "APPLE2GS"` checks.
//
// Keep this file free of UI/i18n dependencies: both the worker and the UI read
// it. Labels in `speed.options` may hold a translation key (`labelKey`) or a
// literal hardware clock (`label`).

export type MachineFamily = "classic" | "gs"

export type ProfileName = "classic_profile" | "gs_profile"

export type SlotIndex = 1 | 2 | 3 | 4 | 5 | 6 | 7

export interface ProfileSlotChoice {
  card: SLOT_CARD_ID
  ramSizeKb?: number
}

export interface ProfileSpeedOption {
  mode: number
  cyclesPerRefresh: number
  labelKey?: string
  label?: string
  mcpLabel: string
}

export interface ProfileSlots {
  options: Record<SlotIndex, ProfileSlotChoice[]>
  defaults: Partial<Record<MACHINE_NAME, SlotConfig>>
}

export interface ProfileSpeed {
  refreshTime: number
  defaultMode: number
  options: ProfileSpeedOption[]
}

export interface MachineCapabilities {
  family: MachineFamily
  isGS: boolean
  hasVeraCard: boolean
  hasAuxSlot3: boolean
  hasVideotermSlot3: boolean
  hasSoftCard: boolean
  hasPassport: boolean
  hasMouseCard: boolean
  hasMockingboard: boolean
  hasBuiltinSlotFunctions: boolean
  hasSuperHiRes: boolean
  hasEnsoniqDoc: boolean
  hasIigsRom: boolean
  hasThreeInchBay: boolean
  hasAdbKeyboard: boolean
  hasAdbMouse: boolean
}

export interface ProfileBootDisk {
  // Drive indices in the same order as the emulator's drive state:
  // 0/1 = slot 7 block storage, 2/3 = slot 6 5.25", 4/5 = slot 5 3.5".
  driveIndices: {
    smartPort: number[]
    floppy525: number[]
    floppy35: number[]
  }
  diskPortSlot: number
  hardDriveSlot: number
  supports35Inch: boolean
}

export interface MachineProfile {
  profileName: ProfileName
  family: MachineFamily
  machines: MACHINE_NAME[]
  defaultMachine: MACHINE_NAME
  slots: ProfileSlots
  speed: ProfileSpeed
  capabilities: MachineCapabilities
  bootDisk: ProfileBootDisk
}

const CLASSIC_SLOT_DEFAULTS: Partial<Record<MACHINE_NAME, SlotConfig>> = {
  APPLE2P: {1: "ssc", 2: "none", 3: "videoterm", 4: "mockingboard", 5: "mouse", 6: "disk2", 7: "smartport"},
  APPLE2EU: {1: "ssc", 2: "none", 3: "aux", 4: "mockingboard", 5: "mouse", 6: "disk2", 7: "smartport"},
  APPLE2EE: {1: "ssc", 2: "none", 3: "aux", 4: "mockingboard", 5: "mouse", 6: "disk2", 7: "smartport"},
}

const GS_SLOT_DEFAULTS: Partial<Record<MACHINE_NAME, SlotConfig>> = {
  APPLE2GS: {1: "gsPrinter", 2: "gsModem", 3: "gsText80", 4: "gsMouse", 5: "gsSmartPort", 6: "gsDiskPort", 7: "smartport"},
}

const CLASSIC_SLOT_OPTIONS: Record<SlotIndex, ProfileSlotChoice[]> = {
  1: [{card: "none"}, {card: "ssc"}],
  2: [{card: "none"}, {card: "vera"}, {card: "passport"}, {card: "softcard"}],
  3: [
    {card: "none"},
    ...[64, 512, 1024, 4096, 8192].map(ramSizeKb => ({card: "aux" as const, ramSizeKb})),
    {card: "vidhd"},
  ],
  4: [{card: "none"}, {card: "mouse"}, {card: "mockingboard"}, {card: "vera"}, {card: "softcard"}],
  5: [{card: "none"}, {card: "mouse"}, {card: "mockingboard"}, {card: "softcard"}],
  6: [{card: "none"}, {card: "disk2"}],
  7: [{card: "none"}, {card: "smartport"}],
}

const II_P_SLOT_3_OPTIONS: ProfileSlotChoice[] = [
  {card: "none"},
  {card: "videoterm"},
  {card: "vidhd"},
]

const GS_SLOT_OPTIONS: Record<SlotIndex, ProfileSlotChoice[]> = {
  1: [{card: "gsPrinter"}, {card: "ssc"}],
  2: [{card: "gsModem"}],
  3: [{card: "gsText80"}],
  4: [{card: "gsMouse"}, {card: "mockingboard"}],
  5: [{card: "gsSmartPort"}],
  6: [{card: "gsDiskPort"}],
  7: [{card: "none"}, {card: "smartport"}],
}

const CLASSIC_SPEED: ProfileSpeed = {
  refreshTime: 16.6881,
  defaultMode: 0,
  options: [
    {mode: -2, cyclesPerRefresh: 1703, labelKey: "retroControl.snail", mcpLabel: "0.1 MHz (Snail)"},
    {mode: -1, cyclesPerRefresh: 8515, labelKey: "retroControl.slow", mcpLabel: "0.5 MHz (Slow)"},
    {mode: 0, cyclesPerRefresh: 17030, labelKey: "retroControl.normal", mcpLabel: "1 MHz (Normal)"},
    {mode: 1, cyclesPerRefresh: 34060, labelKey: "retroControl.twoMhz", mcpLabel: "2 MHz"},
    {mode: 2, cyclesPerRefresh: 51090, labelKey: "retroControl.threeMhz", mcpLabel: "3 MHz"},
    {mode: 3, cyclesPerRefresh: 68120, labelKey: "retroControl.fast", mcpLabel: "4 MHz (Fast)"},
    {mode: 4, cyclesPerRefresh: 408720, labelKey: "retroControl.warp", mcpLabel: "Ludicrous"},
  ],
}

const GS_SPEED: ProfileSpeed = {
  refreshTime: 16.6881,
  defaultMode: 1,
  options: [
    {mode: -2, cyclesPerRefresh: 1703, labelKey: "retroControl.snail", mcpLabel: "0.1 MHz (Snail)"},
    {mode: -1, cyclesPerRefresh: 8515, labelKey: "retroControl.slow", mcpLabel: "0.5 MHz (Slow)"},
    {mode: 0, cyclesPerRefresh: 17030, label: "1.02 MHz", mcpLabel: "1.02 MHz (Normal)"},
    {mode: 1, cyclesPerRefresh: 46727, label: "2.8 MHz", mcpLabel: "2.8 MHz"},
    {mode: 2, cyclesPerRefresh: 118486, label: "7.1 MHz", mcpLabel: "7.1 MHz"},
    {mode: 3, cyclesPerRefresh: 238640, label: "14.3 MHz", mcpLabel: "14.3 MHz (Fast)"},
    {mode: 4, cyclesPerRefresh: 408720, labelKey: "retroControl.warp", mcpLabel: "Ludicrous"},
  ],
}

export const CLASSIC_PROFILE: MachineProfile = {
  profileName: "classic_profile",
  family: "classic",
  machines: ["APPLE2P", "APPLE2EU", "APPLE2EE"],
  defaultMachine: "APPLE2EE",
  slots: {
    options: CLASSIC_SLOT_OPTIONS,
    defaults: CLASSIC_SLOT_DEFAULTS,
  },
  speed: CLASSIC_SPEED,
  capabilities: {
    family: "classic",
    isGS: false,
    hasVeraCard: true,
    hasAuxSlot3: true,
    hasVideotermSlot3: true,
    hasSoftCard: true,
    hasPassport: true,
    hasMouseCard: true,
    hasMockingboard: true,
    hasBuiltinSlotFunctions: false,
    hasSuperHiRes: false,
    hasEnsoniqDoc: false,
    hasIigsRom: false,
    hasThreeInchBay: false,
    hasAdbKeyboard: false,
    hasAdbMouse: false,
  },
  bootDisk: {
    driveIndices: {smartPort: [0, 1], floppy525: [2, 3], floppy35: []},
    diskPortSlot: 6,
    hardDriveSlot: 7,
    supports35Inch: false,
  },
}

export const GS_PROFILE: MachineProfile = {
  profileName: "gs_profile",
  family: "gs",
  machines: ["APPLE2GS"],
  defaultMachine: "APPLE2GS",
  slots: {
    options: GS_SLOT_OPTIONS,
    defaults: GS_SLOT_DEFAULTS,
  },
  speed: GS_SPEED,
  capabilities: {
    family: "gs",
    isGS: true,
    hasVeraCard: false,
    hasAuxSlot3: false,
    hasVideotermSlot3: false,
    hasSoftCard: false,
    hasPassport: false,
    hasMouseCard: false,
    hasMockingboard: true,
    hasBuiltinSlotFunctions: true,
    hasSuperHiRes: true,
    hasEnsoniqDoc: true,
    hasIigsRom: true,
    hasThreeInchBay: true,
    hasAdbKeyboard: true,
    hasAdbMouse: true,
  },
  bootDisk: {
    driveIndices: {smartPort: [0, 1], floppy525: [2, 3], floppy35: [4, 5]},
    diskPortSlot: 6,
    hardDriveSlot: 7,
    supports35Inch: true,
  },
}

export const MACHINE_PROFILES: Record<MACHINE_NAME, MachineProfile> = {
  APPLE2P: CLASSIC_PROFILE,
  APPLE2EU: CLASSIC_PROFILE,
  APPLE2EE: CLASSIC_PROFILE,
  APPLE2GS: GS_PROFILE,
}

export const getMachineProfile = (machine: MACHINE_NAME): MachineProfile =>
  machine === "APPLE2GS" ? GS_PROFILE : CLASSIC_PROFILE

export const getMachineCapabilities = (machine: MACHINE_NAME): MachineCapabilities =>
  getMachineProfile(machine).capabilities

export const getMachineBootDisk = (machine: MACHINE_NAME): ProfileBootDisk =>
  getMachineProfile(machine).bootDisk

export const isClassicMachine = (machine: MACHINE_NAME): boolean =>
  getMachineCapabilities(machine).family === "classic"

export const isGSMachine = (machine: MACHINE_NAME): boolean =>
  getMachineCapabilities(machine).isGS

export const getProfileDefaultMachine = (profile: MachineProfile): MACHINE_NAME =>
  profile.defaultMachine

export const getProfileDefaultSlotConfig = (
  profile: MachineProfile,
  machine: MACHINE_NAME = profile.defaultMachine,
): SlotConfig => {
  const config = profile.slots.defaults[machine]
  if (config) return {...config}
  const fallback = profile.slots.defaults[profile.defaultMachine]
  if (!fallback) throw new Error(`Profile ${profile.profileName} has no default slot config`)
  return {...fallback}
}

export const getProfileSlotChoices = (
  profile: MachineProfile,
  machine: MACHINE_NAME,
  slot: SlotIndex,
): ProfileSlotChoice[] => {
  if (profile.family === "classic" && slot === 3) {
    return machine === "APPLE2P" ? II_P_SLOT_3_OPTIONS : CLASSIC_SLOT_OPTIONS[3]
  }
  return profile.slots.options[slot]
}

export const getProfileSpeedOption = (
  profile: MachineProfile,
  mode: number,
): ProfileSpeedOption | undefined => profile.speed.options.find(option => option.mode === mode)

export const getProfileSpeedOptions = (profile: MachineProfile): ProfileSpeedOption[] =>
  profile.speed.options

export const getProfileDefaultSpeedMode = (profile: MachineProfile): number =>
  profile.speed.defaultMode

export const getProfileCyclesPerRefresh = (profile: MachineProfile, mode: number): number => {
  const option = getProfileSpeedOption(profile, mode)
  if (option) return option.cyclesPerRefresh
  const fallback = getProfileSpeedOption(profile, profile.speed.defaultMode)
  return fallback?.cyclesPerRefresh ?? profile.speed.options[0].cyclesPerRefresh
}

export const getProfileSpeedLabel = (
  profile: MachineProfile,
  mode: number,
  translate: (key: string) => string,
): string => {
  const option = getProfileSpeedOption(profile, mode)
  if (!option) return ""
  if (option.label !== undefined) return option.label
  if (option.labelKey !== undefined) return translate(option.labelKey)
  return option.mcpLabel
}

export const getProfileMcpSpeedLabel = (profile: MachineProfile, mode: number): string =>
  getProfileSpeedOption(profile, mode)?.mcpLabel ?? ""
