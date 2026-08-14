import assert from "node:assert/strict"
import {
  globSync,
  mkdtempSync,
  readFileSync,
  readdirSync,
  rmSync,
  writeFileSync,
} from "node:fs"
import { tmpdir } from "node:os"
import { basename, extname, join, relative, resolve } from "node:path"
import { describe, it } from "node:test"
import ts from "typescript"

import {
  catalogDirectory,
  catalogs,
  discoverCatalogs,
  localeExportName,
  outputDirectory,
  sourceCatalog,
} from "./catalog-config.mjs"
import {
  createLanguageDefinitions,
  createLanguageRegistrySource,
} from "./language-registry.mjs"
import { compilePoCatalog } from "./po-catalog.mjs"

const localeNames = entries => entries.map(entry => entry.locale).sort()
const fileStems = (directory, extension) => readdirSync(directory)
  .filter(file => extname(file) === extension)
  .map(file => basename(file, extension))
  .sort()

const translationCatalog = language => `msgid ""\nmsgstr ""\n"Language: ${language}\\n"\n"Content-Type: text/plain; charset=utf-8\\n"\n\nmsgctxt "test.message"\nmsgid "Message"\nmsgstr ""\n`

const withCatalogDirectory = callback => {
  const directory = mkdtempSync(join(tmpdir(), "apple2ts-i18n-catalogs-"))
  try {
    callback(directory)
  } finally {
    rmSync(directory, {recursive: true, force: true})
  }
}

const flattenKeys = (catalog, prefix = "", keys = new Set()) => {
  for (const [name, value] of Object.entries(catalog)) {
    const key = prefix ? `${prefix}.${name}` : name
    if (typeof value === "string") keys.add(key)
    else flattenKeys(value, key, keys)
  }
  return keys
}

const translationKeyCalls = sourceFile => {
  const calls = []
  const visit = node => {
    if (ts.isCallExpression(node)) {
      const callee = node.expression
      const isTranslationCall = ts.isIdentifier(callee)
        ? callee.text === "t"
        : ts.isPropertyAccessExpression(callee)
          && ts.isIdentifier(callee.expression)
          && callee.expression.text === "i18n"
          && callee.name.text === "t"
      const argument = node.arguments[0]
      if (isTranslationCall) {
        const {line} = sourceFile.getLineAndCharacterOfPosition(node.getStart())
        calls.push({
          key: argument
            && (ts.isStringLiteral(argument) || ts.isNoSubstitutionTemplateLiteral(argument))
            ? argument.text
            : undefined,
          line: line + 1,
        })
      }
    }
    ts.forEachChild(node, visit)
  }
  visit(sourceFile)
  return calls
}

describe("catalog configuration", () => {
  it("covers every translator and generated catalog", () => {
    const configured = localeNames(catalogs)
    assert.deepEqual(
      fileStems(catalogDirectory, ".po"),
      configured.filter(locale => locale !== "en"),
    )
    assert.deepEqual(
      fileStems(outputDirectory, ".ts"),
      [...configured, "registry"].sort(),
    )
  })

  it("registers every generated language catalog for the runtime", () => {
    const registrySource = readFileSync(resolve(outputDirectory, "registry.ts"), "utf8")
    const runtimeCatalogs = [...registrySource.matchAll(
      /from "\.\/([^"\n]+)"/g,
    )].map(match => match[1]).sort()

    assert.deepEqual(runtimeCatalogs, localeNames(catalogs))
  })

  it("makes a newly discovered PO catalog selectable with safe defaults", () => {
    withCatalogDirectory(directory => {
      writeFileSync(resolve(directory, "eo.po"), translationCatalog("eo"))
      const discovered = discoverCatalogs({directory, source: sourceCatalog})
      const definitions = createLanguageDefinitions(discovered, {})
      const esperanto = definitions.find(({locale}) => locale === "eo")

      assert.equal(esperanto?.name, "eo")
      assert.equal(esperanto?.flag, "🌐")

      const registry = createLanguageRegistrySource(discovered, {
        policies: {},
        savedAliases: {},
        browserAliases: [],
        fallbacks: {},
      })
      assert.match(registry, /import \{ catalogEo \} from "\.\/eo"/)
      assert.match(
        registry,
        /id: "eo", name: "eo", flag: "🌐", catalog: catalogEo/,
      )
    })
  })

  it("normalizes Weblate's Pirate locale to canonical BCP 47", () => {
    withCatalogDirectory(directory => {
      writeFileSync(
        resolve(directory, "en@pirate.po"),
        translationCatalog("en@pirate"),
      )
      const discovered = discoverCatalogs({directory, source: sourceCatalog})
      const pirate = discovered.find(({locale}) => locale === "en-x-pirate")

      assert.equal(pirate?.exportName, "catalogEnXPirate")
      assert.equal(pirate?.input, resolve(directory, "en@pirate.po"))
    })
  })

  it("prefixes generated exports that would otherwise be reserved words", () => {
    assert.equal(Intl.getCanonicalLocales("new")[0], "new")
    assert.equal(localeExportName("new"), "catalogNew")
  })

  it("rejects invalid, mismatched, and duplicate locale identities", () => {
    withCatalogDirectory(directory => {
      writeFileSync(resolve(directory, "not_a_locale.po"), translationCatalog("not_a_locale"))
      assert.throws(
        () => discoverCatalogs({directory, source: sourceCatalog}),
        /not a valid BCP 47 locale/,
      )
    })

    withCatalogDirectory(directory => {
      writeFileSync(resolve(directory, "fr.po"), translationCatalog("de"))
      assert.throws(
        () => discoverCatalogs({directory, source: sourceCatalog}),
        /Catalog fr\.po identifies itself as de/,
      )
    })

    withCatalogDirectory(directory => {
      writeFileSync(resolve(directory, "fr-CA.po"), translationCatalog("fr-CA"))
      writeFileSync(resolve(directory, "fr-FR.po"), translationCatalog("fr-CA"))
      assert.throws(
        () => discoverCatalogs({directory, source: sourceCatalog}),
        /Duplicate catalog locale: fr-CA/,
      )
    })
  })

  it("rejects language policy that references a missing catalog", () => {
    assert.throws(
      () => createLanguageDefinitions(catalogs, {
        ...Object.fromEntries(catalogs.map(({locale}) => [locale, {}])),
        eo: {name: "Esperanto"},
      }),
      /Language policy references missing catalog: eo/,
    )
  })

  it("defines every literal translation key used by application source", () => {
    const englishKeys = flattenKeys(compilePoCatalog(
      readFileSync(sourceCatalog),
      {sourceLanguage: true},
    ))
    const missing = []

    for (const file of globSync("src/**/*.{ts,tsx}")) {
      if (file.endsWith(".test.ts") || file.endsWith(".test.tsx")) continue
      const sourceFile = ts.createSourceFile(
        file,
        readFileSync(file, "utf8"),
        ts.ScriptTarget.Latest,
        true,
        file.endsWith(".tsx") ? ts.ScriptKind.TSX : ts.ScriptKind.TS,
      )
      for (const {key, line} of translationKeyCalls(sourceFile)) {
        const location = `${relative(".", file)}:${line}`
        if (key === undefined) {
          missing.push(`${location}: translation key must be a string literal`)
        } else if (!englishKeys.has(key)) {
          missing.push(`${location}: missing ${key}`)
        }
      }
    }

    assert.deepEqual(missing, [])
  })
})
