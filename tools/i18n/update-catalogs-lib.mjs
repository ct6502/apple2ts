import { spawnSync } from "node:child_process"
import { randomUUID } from "node:crypto"
import { readFileSync, renameSync, rmSync, writeFileSync } from "node:fs"
import { resolve } from "node:path"
import process from "node:process"

import { preparePoCatalogForMerge } from "./po-catalog.mjs"

const unavailableMessage = "GNU gettext msgmerge is required to update PO catalogs."
const describeProgress = updated => updated.length === 0
  ? "No catalogs were updated."
  : `Already updated: ${updated.map(value => `${value}.po`).join(", ")}.`

export const stageCatalogUpdate = ({input, source}) => {
  const stagedInput = `${input}.${process.pid}.${randomUUID()}.tmp`
  try {
    writeFileSync(
      stagedInput,
      preparePoCatalogForMerge(
        readFileSync(source),
        readFileSync(input),
      ),
      {flag: "wx"},
    )
  } catch (error) {
    rmSync(stagedInput, {force: true})
    throw error
  }
  return {
    input: stagedInput,
    commit: () => renameSync(stagedInput, input),
    cleanup: () => rmSync(stagedInput, {force: true}),
  }
}

export const updateCatalogs = ({
  catalogDirectory,
  locales,
  source,
  run = spawnSync,
  stage = stageCatalogUpdate,
  stderr = process.stderr,
} = {}) => {
  const probe = run("msgmerge", ["--version"], {encoding: "utf8"})
  if (probe.error?.code === "ENOENT") {
    stderr.write(`${unavailableMessage}\n`)
    return 2
  }
  if (probe.error || probe.status !== 0) {
    stderr.write("Unable to run GNU gettext msgmerge.\n")
    return 2
  }

  const updated = []
  for (const locale of locales) {
    const input = resolve(catalogDirectory, `${locale}.po`)
    let staged
    try {
      staged = stage({input, source})
    } catch (error) {
      stderr.write(`Unable to stage ${locale}.po: ${error.message}. ${describeProgress(updated)}\n`)
      return 1
    }

    const result = run("msgmerge", [
      "--previous",
      "--update",
      "--backup=none",
      staged.input,
      source,
    ], {stdio: "inherit"})

    if (result.error?.code === "ENOENT") {
      staged.cleanup()
      stderr.write(`${unavailableMessage} ${describeProgress(updated)}\n`)
      return 2
    }
    if (result.error || result.status !== 0) {
      staged.cleanup()
      stderr.write(
        `msgmerge failed while updating ${locale}.po. ${describeProgress(updated)}\n`,
      )
      return result.status || 1
    }
    try {
      staged.commit()
    } catch (error) {
      staged.cleanup()
      stderr.write(`Unable to replace ${locale}.po: ${error.message}. ${describeProgress(updated)}\n`)
      return 1
    }
    updated.push(locale)
  }

  return 0
}
