#!/usr/bin/env node

import { mkdir } from "node:fs/promises"
import { resolve } from "node:path"
import process from "node:process"

import {
  catalogDirectory,
  catalogs,
  outputDirectory,
  sourceCatalog,
} from "./catalog-config.mjs"
import { run } from "./po-catalog-cli.mjs"

const arguments_ = process.argv.slice(2)
if (arguments_.length > 1 || (arguments_.length === 1 && arguments_[0] !== "--check")) {
  process.stderr.write("Usage: node tools/i18n/generate-catalogs.mjs [--check]\n")
  process.exitCode = 2
} else {
  const check = arguments_[0] === "--check"
  let result = 0
  let generatedCatalogHintWritten = false

  if (!check) {
    await mkdir(outputDirectory, {recursive: true})
  }

  for (const {locale, exportName, sourceLanguage = false} of catalogs) {
    try {
      const code = await run([
        "compile",
        ...(sourceLanguage ? ["--source-language"] : ["--source", sourceCatalog]),
        ...(!sourceLanguage ? ["--require-merged"] : []),
        "--input", sourceLanguage ? sourceCatalog : resolve(catalogDirectory, `${locale}.po`),
        "--export", exportName,
        "--output", resolve(outputDirectory, `${locale}.ts`),
        ...(check ? ["--check"] : []),
      ])
      if (code !== 0) {
        result = code
        if (check && !generatedCatalogHintWritten) {
          process.stderr.write("Run npm run generate-i18n-catalogs.\n")
          generatedCatalogHintWritten = true
        }
      }
    } catch (error) {
      process.stderr.write(`Catalog generation failed for ${locale}: ${error.message}\n`)
      if (!sourceLanguage) {
        process.stderr.write(
          "If English messages changed, run npm run update-i18n-catalogs.\n",
        )
      }
      result = 2
      break
    }
  }

  process.exitCode = result
}
