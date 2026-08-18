#!/usr/bin/env node

import { mkdir, readFile, readdir, unlink, writeFile } from "node:fs/promises"
import { resolve } from "node:path"
import process from "node:process"

import {
  catalogs,
  outputDirectory,
  sourceCatalog,
} from "./catalog-config.mjs"
import { run } from "./po-catalog-cli.mjs"
import { createLanguageRegistrySource } from "./language-registry.mjs"

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

  for (const {locale, exportName, input, sourceLanguage = false} of catalogs) {
    try {
      const code = await run([
        "compile",
        ...(sourceLanguage ? ["--source-language"] : ["--source", sourceCatalog]),
        ...(!sourceLanguage ? ["--require-merged"] : []),
        "--input", input,
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

  if (result === 0) {
    const registry = createLanguageRegistrySource(catalogs)
    const registryPath = resolve(outputDirectory, "registry.ts")
    const expected = new Set([
      ...catalogs.map(({locale}) => `${locale}.ts`),
      "registry.ts",
    ])
    if (check) {
      let current
      try {
        current = await readFile(registryPath, "utf8")
      } catch {
        current = undefined
      }
      if (current !== registry) {
        process.stderr.write(`Generated language registry is stale: ${registryPath}\n`)
        if (!generatedCatalogHintWritten) {
          process.stderr.write("Run npm run generate-i18n-catalogs.\n")
        }
        result = 1
      }
      for (const file of await readdir(outputDirectory)) {
        if (file.endsWith(".ts") && !expected.has(file)) {
          process.stderr.write(`Unexpected generated language file: ${file}\n`)
          result = 1
        }
      }
    } else {
      await writeFile(registryPath, registry)
      process.stdout.write(`Generated language registry: ${registryPath}\n`)

      for (const file of await readdir(outputDirectory)) {
        if (file.endsWith(".ts") && !expected.has(file)) {
          await unlink(resolve(outputDirectory, file))
        }
      }
    }
  }

  process.exitCode = result
}
