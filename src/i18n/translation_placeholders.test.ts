import { AllLanguages, LanguageCatalogs } from "./index"

type Catalog = Record<string, unknown>

const catalogs = AllLanguages
  .filter(locale => locale !== "en")
  .map(locale => [locale, LanguageCatalogs[locale]] as const)

const flattenStrings = (
  value: Catalog,
  prefix = "",
  result = new Map<string, string>(),
) => {
  for (const [key, child] of Object.entries(value)) {
    const path = prefix ? `${prefix}.${key}` : key
    if (typeof child === "string") {
      result.set(path, child)
    } else if (child && typeof child === "object") {
      flattenStrings(child as Catalog, path, result)
    }
  }
  return result
}

const templateVariables = (value: string) =>
  [...value.matchAll(/{{([^{}]+)}}/g)]
    .map(match => match[1])
    .sort()

describe("translation template variables", () => {
  const english = flattenStrings(LanguageCatalogs.en)

  test("requires the runtime's exact placeholder spelling", () => {
    expect(templateVariables("{{ value }}")).not.toEqual(templateVariables("{{value}}"))
  })

  test.each(catalogs)("%s retains every English template variable", (_locale, catalog) => {
    const translated = flattenStrings(catalog)

    for (const [key, englishValue] of english) {
      const translatedValue = translated.get(key)
      if (translatedValue === undefined) continue

      expect({
        key,
        variables: templateVariables(translatedValue),
      }).toEqual({
        key,
        variables: templateVariables(englishValue),
      })
    }
  })
})
