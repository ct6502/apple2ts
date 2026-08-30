type SlotCardStateHandler = {
  card: SLOT_CARD_ID,
  save: () => unknown,
  restore: (state: unknown) => void,
}

const handlers = new Map<number, SlotCardStateHandler>()

export const clearSlotCardStateHandlers = () => handlers.clear()

export const registerSlotCardState = (
  slot: number,
  card: SLOT_CARD_ID,
  save: () => unknown,
  restore: (state: unknown) => void,
) => handlers.set(slot, {card, save, restore})

export const getSlotCardSaveState = (): SlotCardSaveState[] =>
  Array.from(handlers, ([slot, handler]) => ({
    slot,
    card: handler.card,
    state: handler.save(),
  }))

export const restoreSlotCardSaveState = (states: SlotCardSaveState[] | undefined) => {
  for (const saved of states ?? []) {
    const handler = handlers.get(saved.slot)
    if (handler?.card === saved.card) handler.restore(saved.state)
  }
}
