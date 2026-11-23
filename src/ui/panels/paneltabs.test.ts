import { getPanelTabVisibility } from "./paneltabs"

const config = (overrides: Partial<SlotConfig> = {}): SlotConfig => ({
  1: "none",
  2: "none",
  3: "aux",
  4: "none",
  5: "mouse",
  6: "disk2",
  7: "smartport",
  ...overrides,
})

describe("getPanelTabVisibility", () => {
  test("offers both classic tabs on a classic machine with a VERA card in slot 2", () => {
    expect(getPanelTabVisibility("APPLE2EE", config({ 2: "vera" }))).toEqual({
      showDebugTab: true,
      showExpectinTab: true,
      showVeraTab: true,
    })
  })

  test("also detects a VERA card in slot 4", () => {
    expect(getPanelTabVisibility("APPLE2EU", config({ 4: "vera" })).showVeraTab).toBe(true)
  })

  test("hides the VERA tab when no slot holds the card", () => {
    expect(getPanelTabVisibility("APPLE2EE", config()).showVeraTab).toBe(false)
  })

  test("hides the debugger and exPectin tabs on the IIgs even with a VERA card installed", () => {
    expect(getPanelTabVisibility("APPLE2GS", config({ 2: "vera" }))).toEqual({
      showDebugTab: false,
      showExpectinTab: false,
      showVeraTab: true,
    })
  })
})
