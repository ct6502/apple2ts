import assert from "node:assert/strict"
import { readFileSync, readdirSync } from "node:fs"
import { basename, extname, resolve } from "node:path"
import { describe, it } from "node:test"

import {
  catalogDirectory,
  catalogs,
  outputDirectory,
} from "./catalog-config.mjs"

const localeNames = entries => entries.map(entry => entry.locale).sort()
const fileStems = (directory, extension) => readdirSync(directory)
  .filter(file => extname(file) === extension)
  .map(file => basename(file, extension))
  .sort()

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
})
