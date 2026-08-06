#!/usr/bin/env node

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

  for (const {locale, exportName, sourceLanguage = false} of catalogs) {
    const code = await run([
      "compile",
      ...(sourceLanguage ? ["--source-language"] : ["--source", sourceCatalog]),
      "--input", sourceLanguage ? sourceCatalog : resolve(catalogDirectory, `${locale}.po`),
      "--export", exportName,
      "--output", resolve(outputDirectory, `${locale}.ts`),
      ...(check ? ["--check"] : []),
    ])
    if (code !== 0) result = code
  }

  process.exitCode = result
}
