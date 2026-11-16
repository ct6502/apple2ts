import { getMachineProfile, getProfileDefaultSlotConfig, getProfileSlotChoices, type ProfileSlotChoice } from "./machine_profile"

export const RAM_OPTIONS = [64, 512, 1024, 4096, 8192] as const

export const SLOT_NUMBERS = [1, 2, 3, 4, 5, 6, 7] as const
export type SlotNumber = typeof SLOT_NUMBERS[number]

export type SlotOption = {
  card: SLOT_CARD_ID
  ramSizeKb?: typeof RAM_OPTIONS[number]
}

export const getSlotOptions = (slot: SlotNumber, machine: MACHINE_NAME): SlotOption[] => {
  const profile = getMachineProfile(machine)
  return getProfileSlotChoices(profile, machine, slot).map((choice: ProfileSlotChoice) =>
    choice.ramSizeKb === undefined
      ? {card: choice.card}
      : {card: choice.card, ramSizeKb: choice.ramSizeKb as typeof RAM_OPTIONS[number]},
  )
}

// Any value that is not valid for the machine (including configurations saved
// by older builds, where "none" meant "built-in function" in a IIgs slot) falls
// back to that slot's default.
export const sanitizeSlotConfig = (config: SlotConfig, machine: MACHINE_NAME): SlotConfig => {
  const profile = getMachineProfile(machine)
  const defaults = getProfileDefaultSlotConfig(profile, machine)
  const next = { ...config }
  for (const slot of SLOT_NUMBERS) {
    const allowed = getSlotOptions(slot, machine).map(o => o.card)
    if (!allowed.includes(next[slot])) {
      const defaultCard = defaults[slot]
      next[slot] = allowed.includes(defaultCard) ? defaultCard : "none"
    }
  }
  return next
}
