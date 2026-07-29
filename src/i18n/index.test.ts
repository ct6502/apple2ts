import { translateFromCatalogs } from "./index"

describe("translateFromCatalogs", () => {
  const english = {
    debug: {
      tooltip: "English value: {{value}}",
      englishOnly: "English fallback",
    },
  }

  test("uses the selected-language translation when it exists", () => {
    const selectedLanguage = {
      debug: {
        tooltip: "Localized value: {{value}}",
      },
    }

    expect(translateFromCatalogs(selectedLanguage, english, "debug.tooltip", {value: "$03"}))
      .toBe("Localized value: $03")
  })

  test("falls back to English when the selected language lacks a key", () => {
    expect(translateFromCatalogs({}, english, "debug.englishOnly"))
      .toBe("English fallback")
  })

  test("returns the key path when neither catalog contains a key", () => {
    expect(translateFromCatalogs({}, english, "debug.missing"))
      .toBe("debug.missing")
  })
})
