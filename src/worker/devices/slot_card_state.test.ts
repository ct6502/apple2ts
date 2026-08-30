import {
  clearSlotCardStateHandlers,
  getSlotCardSaveState,
  registerSlotCardState,
  restoreSlotCardSaveState,
} from "./slot_card_state"

beforeEach(clearSlotCardStateHandlers)

test("saves and restores registered card state", () => {
  let value = 42
  registerSlotCardState(4, "mockingboard", () => value, state => { value = state as number })

  const saved = getSlotCardSaveState()
  value = 0
  restoreSlotCardSaveState(saved)

  expect(saved).toEqual([{slot: 4, card: "mockingboard", state: 42}])
  expect(value).toBe(42)
})

test("does not restore state into a different card", () => {
  let restored = false
  registerSlotCardState(4, "mouse", () => null, () => { restored = true })

  restoreSlotCardSaveState([{slot: 4, card: "mockingboard", state: null}])

  expect(restored).toBe(false)
})

test("accepts save files without card state", () => {
  registerSlotCardState(4, "mockingboard", () => null, () => {
    throw new Error("restore should not run")
  })

  restoreSlotCardSaveState(undefined)
})
