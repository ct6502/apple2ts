import { DEFAULT_SLOT_CONFIG_GS } from "./utility"

// Apple IIgs slot model.
//
// The IIgs Control Panel assigns each slot either a built-in function (Printer
// Port, Modem Port, 80-column text, Mouse Port, Smart Port, Disk Port) or
// "Your Card". A built-in function leaves SLTROMSEL ($C02D) clear so the
// motherboard's own slot firmware at $FF:C100-$CFFF stays mapped; a card sets
// the bit and the card's ROM answers instead. Slot 3 has its own switch
// (SLOTC3ROM) and never appears in $C02D.

export const IIGS_BUILTIN_SLOTS = [
  "gsPrinter",
  "gsModem",
  "gsText80",
  "gsMouse",
  "gsSmartPort",
  "gsDiskPort",
] as const

export type IigsBuiltinSlot = typeof IIGS_BUILTIN_SLOTS[number]

export const isIigsBuiltinSlot = (card: SLOT_CARD_ID): card is IigsBuiltinSlot =>
  (IIGS_BUILTIN_SLOTS as readonly string[]).includes(card)

export const getIigsSlotDefault = (slot: 1 | 2 | 3 | 4 | 5 | 6 | 7): SLOT_CARD_ID =>
  DEFAULT_SLOT_CONFIG_GS[slot]

// $C02D SLTROMSEL: bit N = 1 maps the ROM of the card in slot N, bit N = 0
// leaves the motherboard's slot firmware mapped.
export const iigsSlotRegisterFor = (config: SlotConfig): number => {
  let register = 0
  for (let slot = 1; slot <= 7; slot++) {
    if (slot === 3) continue
    if (!isIigsBuiltinSlot(config[slot as 1 | 2 | 3 | 4 | 5 | 6 | 7])) {
      register |= 1 << slot
    }
  }
  return register
}
