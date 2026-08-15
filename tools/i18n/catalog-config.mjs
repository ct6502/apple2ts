import { readFileSync, readdirSync } from "node:fs"
import { extname, resolve } from "node:path"

import { po as poParser } from "gettext-parser"

import { catalogIdentityAliases } from "./language-policies.mjs"

const root = resolve(import.meta.dirname, "../..")

export const catalogDirectory = resolve(root, "src/i18n/catalogs")
export const outputDirectory = resolve(root, "src/i18n/languages")
export const sourceCatalog = resolve(catalogDirectory, "messages.pot")

export const localeExportName = locale => locale === "en"
  ? "en"
  : `catalog${locale
    .split("-")
    .map(part => `${part[0].toUpperCase()}${part.slice(1)}`)
    .join("")}`

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

const catalogIdentity = (locale, description, aliases) => canonicalLocale(
  aliases[locale] ?? locale,
  description,
)

export const discoverCatalogs = ({
  aliases = catalogIdentityAliases,
  directory = catalogDirectory,
  source = sourceCatalog,
} = {}) => {
  const discovered = [{
    locale: "en",
    exportName: localeExportName("en"),
    input: source,
    sourceLanguage: true,
  }]
  const identities = new Set(["en"])

  for (const file of readdirSync(directory).sort()) {
    if (extname(file) !== ".po") continue
    const locale = file.slice(0, -3)
    const identity = catalogIdentity(locale, `Catalog filename ${file}`, aliases)
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
    const headerIdentity = catalogIdentity(
      headerLanguage,
      `Language header in ${file}`,
      aliases,
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
