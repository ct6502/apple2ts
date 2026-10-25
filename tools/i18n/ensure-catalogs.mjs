#!/usr/bin/env node

// Regenerates the TypeScript catalogs, and if they are out of date with
// messages.pot, first merges the POT changes into every PO catalog with
// `npm run update-i18n-catalogs`. This keeps `npm run build` (and other
// commands) working after English messages change, without hiding real
// failures: if the merge itself fails, the original error is reported.

import { spawnSync } from "node:child_process"
import { resolve } from "node:path"
import process from "node:process"

const scriptsDirectory = import.meta.dirname

const runCatalogScript = (script, { capture = true } = {}) => spawnSync(
  process.execPath,
  [resolve(scriptsDirectory, script)],
  capture ? {encoding: "utf8"} : {stdio: "inherit"},
)

const writeCaptured = (stream, result) => {
  const text = `${result.stdout ?? ""}${result.stderr ?? ""}`
  if (text) stream.write(text)
}

const generate = () => runCatalogScript("generate-catalogs.mjs")

const firstAttempt = generate()
if (firstAttempt.status === 0) {
  process.exitCode = 0
} else {
  process.stdout.write(
    "i18n: catalogs are out of date with messages.pot; merging them automatically...\n",
  )

  const update = runCatalogScript("update-catalogs.mjs", {capture: false})
  if (update.status !== 0) {
    writeCaptured(process.stderr, firstAttempt)
    process.stderr.write(
      "i18n: automatic catalog update failed. " +
      "Fix the problem above, then run npm run update-i18n-catalogs.\n",
    )
    process.exitCode = update.status ?? 1
  } else {
    const secondAttempt = generate()
    if (secondAttempt.status !== 0) {
      writeCaptured(process.stderr, secondAttempt)
    }
    process.exitCode = secondAttempt.status ?? 1
  }
}
