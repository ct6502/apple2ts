#!/usr/bin/env node

import process from "node:process"

import { catalogDirectory, catalogs, sourceCatalog } from "./catalog-config.mjs"
import { updateCatalogs } from "./update-catalogs-lib.mjs"

if (process.argv.length !== 2) {
  process.stderr.write("Usage: node tools/i18n/update-catalogs.mjs\n")
  process.exitCode = 2
} else {
  process.exitCode = updateCatalogs({
    catalogDirectory,
    locales: catalogs.filter(catalog => !catalog.sourceLanguage).map(catalog => catalog.locale),
    source: sourceCatalog,
  })
}
