import { DEFAULT_SLOT_CONFIG } from "./utility"
import { getIigsSlotDefault } from "./iigs_slots"

export const RAM_OPTIONS = [64, 512, 1024, 4096, 8192] as const

export const SLOT_NUMBERS = [1, 2, 3, 4, 5, 6, 7] as const
export type SlotNumber = typeof SLOT_NUMBERS[number]

export type SlotOption = {
  card: SLOT_CARD_ID
  ramSizeKb?: typeof RAM_OPTIONS[number]
}

export const getSlotOptions = (slot: SlotNumber, machine: MACHINE_NAME): SlotOption[] => {
  if (machine === "APPLE2GS") {
    // Built-in functions follow the Control Panel: slots 1-6 normally run the
    // motherboard's own firmware. Only the cards the emulator implements are
    // offered as alternatives ("Your Card").
    switch (slot) {
      case 1:
        return [{ card: "gsPrinter" }, { card: "ssc" }]
      case 2:
        return [{ card: "gsModem" }]
      case 3:
        return [{ card: "gsText80" }]
      case 4:
        return [{ card: "gsMouse" }, { card: "mockingboard" }]
      case 5:
        return [{ card: "gsSmartPort" }]
      case 6:
        return [{ card: "gsDiskPort" }]
      case 7:
        return [{ card: "none" }, { card: "smartport" }]
    }
  }
  if (slot === 3) {
    return machine === "APPLE2P"
      ? [{ card: "none" }, { card: "videoterm" }, { card: "vidhd" }]
      : [
        { card: "none" },
        ...RAM_OPTIONS.map(ramSizeKb => ({ card: "aux" as const, ramSizeKb })),
        { card: "vidhd" },
      ]
  }
  const options: Record<SlotNumber, SLOT_CARD_ID[]> = {
    1: ["none", "ssc"],
    2: ["none", "vera", "passport", "softcard"],
    3: [],
    4: ["none", "mouse", "mockingboard", "vera", "softcard"],
    5: ["none", "mouse", "mockingboard", "softcard"],
    6: ["none", "disk2"],
    7: ["none", "smartport"],
  }
  return options[slot].map(card => ({ card }))
}

// Any value that is not valid for the machine (including configurations saved
// by older builds, where "none" meant "built-in function" in a IIgs slot) falls
// back to that slot's default.
export const sanitizeSlotConfig = (config: SlotConfig, machine: MACHINE_NAME): SlotConfig => {
  const next = { ...config }
  for (const slot of SLOT_NUMBERS) {
    const allowed = getSlotOptions(slot, machine).map(o => o.card)
    if (!allowed.includes(next[slot])) {
      const defaultCard = machine === "APPLE2GS"
        ? getIigsSlotDefault(slot)
        : (machine === "APPLE2P" && slot === 3 ? "videoterm" : DEFAULT_SLOT_CONFIG[slot])
      next[slot] = allowed.includes(defaultCard) ? defaultCard : "none"
    }
  }
  return next
}
