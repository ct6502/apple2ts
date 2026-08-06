#!/usr/bin/env node

import { resolve } from "node:path"
import process from "node:process"

import { run } from "./po-catalog-cli.mjs"

const root = resolve(import.meta.dirname, "../..")
const catalogDirectory = resolve(root, "src/i18n/catalogs")
const outputDirectory = resolve(root, "src/i18n/languages")
const source = resolve(catalogDirectory, "messages.pot")

const catalogs = [
  {locale: "en", exportName: "en", sourceLanguage: true},
  {locale: "de", exportName: "de"},
  {locale: "es", exportName: "es"},
  {locale: "fr", exportName: "fr"},
  {locale: "it", exportName: "it"},
  {locale: "ja", exportName: "ja"},
  {locale: "ko", exportName: "ko"},
  {locale: "nl", exportName: "nl"},
  {locale: "pt-BR", exportName: "ptBR"},
  {locale: "ru", exportName: "ru"},
  {locale: "sv", exportName: "sv"},
  {locale: "zh-CN", exportName: "zhCN"},
  {locale: "zh-TW", exportName: "zhTW"},
]

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
      ...(sourceLanguage ? ["--source-language"] : ["--source", source]),
      "--input", sourceLanguage ? source : resolve(catalogDirectory, `${locale}.po`),
      "--export", exportName,
      "--output", resolve(outputDirectory, `${locale}.ts`),
      ...(check ? ["--check"] : []),
    ])
    if (code !== 0) result = code
  }

  process.exitCode = result
}
