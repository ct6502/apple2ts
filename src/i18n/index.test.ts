import { I18n, translateFromCatalogs } from "./index"

describe("translateFromCatalogs", () => {
  const english = {
    debug: {
      tooltip: "English value: {{value}}",
      englishOnly: "English fallback",
      repeated: "{{value}} then {{value}}",
      separateValues: "{{first}} then {{second}}",
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

  test("replaces every occurrence of a template variable", () => {
    expect(translateFromCatalogs({}, english, "debug.repeated", {value: "$03"}))
      .toBe("$03 then $03")
  })

  test("does not interpolate placeholder text inside a replacement value", () => {
    expect(translateFromCatalogs({}, english, "debug.separateValues", {
      first: "{{second}}",
      second: "$03",
    })).toBe("{{second}} then $03")
  })
})

const createStorage = (saved: string | null) => {
  let value = saved
  return {
    getItem: jest.fn(() => value),
    setItem: jest.fn((_key: string, nextValue: string) => {
      value = nextValue
    }),
  }
}

describe("Portuguese language identity", () => {
  test("migrates the saved pt preference to pt-BR", () => {
    const storage = createStorage("pt")
    const i18n = new I18n(storage, "en-US")

    expect(i18n.getLanguage()).toBe("pt-BR")
    expect(storage.setItem).toHaveBeenCalledWith("apple2ts-language", "pt-BR")
  })

  test.each([
    ["pt-BR", "pt-BR"],
    ["pt", "pt-BR"],
    ["pt-PT", "pt-BR"],
    ["pt-AO", "pt-BR"],
  ])("detects browser language %s as %s", (browserLanguage, expectedLanguage) => {
    const i18n = new I18n(createStorage(null), browserLanguage)

    expect(i18n.getLanguage()).toBe(expectedLanguage)
  })

  test.each([
    ["es-MX", "es"],
    ["zh", "zh-TW"],
    ["zh-Hant-HK", "zh-TW"],
    ["zh-Hans-SG", "zh-CN"],
    ["est", "en"],
  ])("uses exact primary-language matching for %s", (browserLanguage, expectedLanguage) => {
    const i18n = new I18n(createStorage(null), browserLanguage)

    expect(i18n.getLanguage()).toBe(expectedLanguage)
  })
})
