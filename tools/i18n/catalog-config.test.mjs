import assert from "node:assert/strict"
import { globSync, readFileSync, readdirSync } from "node:fs"
import { basename, extname, relative, resolve } from "node:path"
import { describe, it } from "node:test"
import ts from "typescript"

import {
  catalogDirectory,
  catalogs,
  outputDirectory,
  sourceCatalog,
} from "./catalog-config.mjs"
import { compilePoCatalog } from "./po-catalog.mjs"

const localeNames = entries => entries.map(entry => entry.locale).sort()
const fileStems = (directory, extension) => readdirSync(directory)
  .filter(file => extname(file) === extension)
  .map(file => basename(file, extension))
  .sort()

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
        : ts.isPropertyAccessExpression(callee) && callee.name.text === "t"
      const argument = node.arguments[0]
      if (isTranslationCall && argument
          && (ts.isStringLiteral(argument) || ts.isNoSubstitutionTemplateLiteral(argument))) {
        calls.push(argument.text)
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
    assert.deepEqual(fileStems(outputDirectory, ".ts"), configured)
  })

  it("covers every language catalog imported by the runtime", () => {
    const runtimeSource = readFileSync(resolve("src/i18n/index.ts"), "utf8")
    const runtimeCatalogs = [...runtimeSource.matchAll(
      /from "\.\/languages\/([^"\n]+)"/g,
    )].map(match => match[1]).sort()

    assert.deepEqual(runtimeCatalogs, localeNames(catalogs))
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
      for (const key of translationKeyCalls(sourceFile)) {
        if (!englishKeys.has(key)) missing.push(`${relative(".", file)}: ${key}`)
      }
    }

    assert.deepEqual(missing, [])
  })
})
