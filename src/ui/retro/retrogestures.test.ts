import { getPanelSwipeKey } from "./retrogestures"

describe("Retro control-panel gestures", () => {
  test.each([
    [0, -24, "ArrowUp"],
    [0, 24, "ArrowDown"],
    [-24, 0, "ArrowLeft"],
    [24, 0, "ArrowRight"],
  ])("maps swipe (%i, %i) to %s", (deltaX, deltaY, key) => {
    expect(getPanelSwipeKey(deltaX, deltaY)).toBe(key)
  })

  test("ignores movement below the swipe threshold", () => {
    expect(getPanelSwipeKey(12, -23)).toBeUndefined()
  })
})