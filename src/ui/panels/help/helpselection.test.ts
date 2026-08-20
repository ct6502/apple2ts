import { isDefaultHelp } from "./helpselection"

describe("isDefaultHelp", () => {
  it.each(["", " ", "<Default>"])("recognizes the default Help sentinel %p", (helpText) => {
    expect(isDefaultHelp(helpText)).toBe(true)
  })

  it.each(["x", "Welcome to Apple2TS custom help"])(
    "does not treat custom Help %p as default Help",
    (helpText) => {
      expect(isDefaultHelp(helpText)).toBe(false)
    }
  )
})
