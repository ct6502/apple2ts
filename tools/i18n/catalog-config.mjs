import { readFileSync, readdirSync } from "node:fs"
import { extname, resolve } from "node:path"

import { po as poParser } from "gettext-parser"

const root = resolve(import.meta.dirname, "../..")

export const catalogDirectory = resolve(root, "src/i18n/catalogs")
export const outputDirectory = resolve(root, "src/i18n/languages")
export const sourceCatalog = resolve(catalogDirectory, "messages.pot")

export const localeExportName = locale => locale.replace(
  /-([a-zA-Z0-9])/g,
  (_match, character) => character.toUpperCase(),
)

const canonicalLocale = (locale, description) => {
  let canonical
  try {
    [canonical] = Intl.getCanonicalLocales(locale)
  } catch {
    throw new Error(`${description} is not a valid BCP 47 locale: ${locale}`)
  }
  if (canonical !== locale) {
    throw new Error(`${description} must use canonical BCP 47 form ${canonical}: ${locale}`)
  }
  return canonical
}

export const discoverCatalogs = ({
  directory = catalogDirectory,
  source = sourceCatalog,
} = {}) => {
  const discovered = [{
    locale: "en",
    exportName: "en",
    input: source,
    sourceLanguage: true,
  }]
  const identities = new Set(["en"])

  for (const file of readdirSync(directory).sort()) {
    if (extname(file) !== ".po") continue
    const locale = file.slice(0, -3)
    const identity = canonicalLocale(locale, `Catalog filename ${file}`)
    const input = resolve(directory, file)
    let parsed
    try {
      parsed = poParser.parse(readFileSync(input), {validation: true})
    } catch (error) {
      throw new Error(`Unable to parse catalog ${file}: ${error.message}`)
    }
    const headerLanguage = parsed.headers.Language
    if (!headerLanguage) {
      throw new Error(`Catalog ${file} is missing its Language header`)
    }
    const headerIdentity = canonicalLocale(
      headerLanguage,
      `Language header in ${file}`,
    )
    if (identities.has(headerIdentity)) {
      throw new Error(`Duplicate catalog locale: ${headerIdentity}`)
    }
    if (headerIdentity !== identity) {
      throw new Error(`Catalog ${file} identifies itself as ${headerLanguage}`)
    }
    identities.add(identity)
    discovered.push({
      locale: identity,
      exportName: localeExportName(identity),
      input,
      sourceLanguage: false,
    })
  }

  return discovered
}

export const catalogs = discoverCatalogs()
