#!/usr/bin/env node

process.stderr.write(
  "i18n_master.cjs is deprecated and did not change any files.\n"
  + "Add English keys to src/i18n/languages/en.ts and add only real translations "
  + "to the applicable locale files. Missing locale keys fall back to English.\n",
)
process.exitCode = 1
