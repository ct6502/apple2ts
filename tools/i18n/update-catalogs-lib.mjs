import { spawnSync } from "node:child_process"
import { resolve } from "node:path"
import process from "node:process"

const unavailableMessage = "GNU gettext msgmerge is required to update PO catalogs.\n"

export const updateCatalogs = ({
  catalogDirectory,
  locales,
  source,
  run = spawnSync,
  stderr = process.stderr,
} = {}) => {
  const probe = run("msgmerge", ["--version"], {encoding: "utf8"})
  if (probe.error?.code === "ENOENT") {
    stderr.write(unavailableMessage)
    return 2
  }
  if (probe.error || probe.status !== 0) {
    stderr.write("Unable to run GNU gettext msgmerge.\n")
    return 2
  }

  for (const locale of locales) {
    const result = run("msgmerge", [
      "--previous",
      "--update",
      "--backup=none",
      resolve(catalogDirectory, `${locale}.po`),
      source,
    ], {stdio: "inherit"})

    if (result.error?.code === "ENOENT") {
      stderr.write(unavailableMessage)
      return 2
    }
    if (result.error || result.status !== 0) {
      stderr.write(`msgmerge failed while updating ${locale}.po.\n`)
      return result.status || 1
    }
  }

  return 0
}
