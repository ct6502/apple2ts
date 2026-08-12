import assert from "node:assert/strict"
import { mkdtempSync, readdirSync, readFileSync, rmSync, writeFileSync } from "node:fs"
import { tmpdir } from "node:os"
import { join, resolve } from "node:path"
import { afterEach, describe, it } from "node:test"

import { updateCatalogs } from "./update-catalogs-lib.mjs"
import { analyzePoCatalog, compilePoCatalog } from "./po-catalog.mjs"

const temporaryDirectories = []
const unchangedStage = ({input}) => ({
  input,
  commit() {},
  cleanup() {},
})

const options = {
  catalogDirectory: "/catalogs",
  locales: ["de", "pt-BR"],
  source: "/catalogs/messages.pot",
  stage: unchangedStage,
}

afterEach(() => {
  for (const directory of temporaryDirectories.splice(0)) {
    rmSync(directory, {recursive: true, force: true})
  }
})

describe("updateCatalogs", () => {
  it("updates every locale while retaining previous English for fuzzy review", () => {
    const calls = []
    const code = updateCatalogs({
      ...options,
      run(command, arguments_, runOptions) {
        calls.push({command, arguments_, runOptions})
        return {status: 0}
      },
    })

    assert.equal(code, 0)
    assert.deepEqual(calls, [
      {
        command: "msgmerge",
        arguments_: ["--version"],
        runOptions: {encoding: "utf8"},
      },
      {
        command: "msgmerge",
        arguments_: [
          "--previous", "--no-fuzzy-matching", "--update", "--backup=none",
          resolve("/catalogs/de.po"), "/catalogs/messages.pot",
        ],
        runOptions: {stdio: "inherit"},
      },
      {
        command: "msgmerge",
        arguments_: [
          "--previous", "--no-fuzzy-matching", "--update", "--backup=none",
          resolve("/catalogs/pt-BR.po"), "/catalogs/messages.pot",
        ],
        runOptions: {stdio: "inherit"},
      },
    ])
  })

  it("retains a translation when stable-key English wording changes completely", () => {
    const directory = mkdtempSync(join(tmpdir(), "apple2ts-po-update-"))
    temporaryDirectories.push(directory)
    const source = join(directory, "messages.pot")
    const input = join(directory, "fr.po")
    const sourceText = `msgid ""
msgstr ""
"Content-Type: text/plain; charset=UTF-8\\n"

msgctxt "disk.save"
msgid "Completely unrelated replacement wording"
msgstr ""
`
    writeFileSync(source, sourceText)
    writeFileSync(input, `msgid ""
msgstr ""
"Content-Type: text/plain; charset=UTF-8\\n"

msgctxt "disk.save"
msgid "Save Disk"
msgstr "Enregistrer le disque"
`)

    const code = updateCatalogs({
      catalogDirectory: directory,
      locales: ["fr"],
      source,
      run: () => ({status: 0}),
    })

    assert.equal(code, 0)
    const updated = readFileSync(input, "utf8")
    assert.deepEqual(compilePoCatalog(updated, {sourceCatalog: sourceText}), {
      disk: {save: "Enregistrer le disque"},
    })
    assert.deepEqual(
      analyzePoCatalog(sourceText, updated).entries[0],
      {
        key: "disk.save",
        status: "translated",
        source: "Completely unrelated replacement wording",
        translation: "Enregistrer le disque",
        fuzzy: true,
        previousSource: "Save Disk",
      },
    )
  })

  it("removes messages absent from the source instead of making them obsolete", () => {
    const directory = mkdtempSync(join(tmpdir(), "apple2ts-po-update-removed-"))
    temporaryDirectories.push(directory)
    const source = join(directory, "messages.pot")
    const input = join(directory, "fr.po")
    const sourceText = `msgid ""
msgstr ""
"Content-Type: text/plain; charset=UTF-8\\n"

msgctxt "disk.save"
msgid "Save Disk"
msgstr ""
`
    writeFileSync(source, sourceText)
    writeFileSync(input, `msgid ""
msgstr ""
"Content-Type: text/plain; charset=UTF-8\\n"

msgctxt "disk.save"
msgid "Save Disk"
msgstr "Enregistrer le disque"

msgctxt "help.removed"
msgid "Removed help"
msgstr "Aide supprimée"

#~ msgctxt "help.alreadyObsolete"
#~ msgid "Already obsolete"
#~ msgstr "Déjà obsolète"
`)

    const code = updateCatalogs({
      catalogDirectory: directory,
      locales: ["fr"],
      source,
      run: () => ({status: 0}),
    })

    assert.equal(code, 0)
    const updated = readFileSync(input, "utf8")
    assert.deepEqual(compilePoCatalog(updated, {sourceCatalog: sourceText}), {
      disk: {save: "Enregistrer le disque"},
    })
    assert.deepEqual(analyzePoCatalog(sourceText, updated).obsolete, [])
    assert.doesNotMatch(updated, /help\.(?:removed|alreadyObsolete)/)

    assert.equal(updateCatalogs({
      catalogDirectory: directory,
      locales: ["fr"],
      source,
      run: () => ({status: 0}),
    }), 0)
    assert.equal(readFileSync(input, "utf8"), updated)
  })

  it("preserves the original catalog and removes staging after msgmerge fails", () => {
    const directory = mkdtempSync(join(tmpdir(), "apple2ts-po-update-failure-"))
    temporaryDirectories.push(directory)
    const source = join(directory, "messages.pot")
    const input = join(directory, "fr.po")
    const original = `msgid ""
msgstr ""
"Content-Type: text/plain; charset=UTF-8\\n"

msgctxt "disk.save"
msgid "Save Disk"
msgstr "Enregistrer le disque"
`
    writeFileSync(source, original.replace("Save Disk", "Replacement"))
    writeFileSync(input, original)
    let calls = 0

    const code = updateCatalogs({
      catalogDirectory: directory,
      locales: ["fr"],
      source,
      run: () => ({status: calls++ === 0 ? 0 : 1}),
      stderr: {write() {}},
    })

    assert.equal(code, 1)
    assert.equal(readFileSync(input, "utf8"), original)
    assert.deepEqual(readdirSync(directory).sort(), ["fr.po", "messages.pot"])
  })

  it("fails clearly without modifying catalogs when msgmerge is unavailable", () => {
    let message = ""
    let calls = 0
    const code = updateCatalogs({
      ...options,
      run() {
        calls += 1
        return {error: {code: "ENOENT"}}
      },
      stderr: {write(value) { message += value }},
    })

    assert.equal(code, 2)
    assert.equal(calls, 1)
    assert.equal(message, "GNU gettext msgmerge is required to update PO catalogs.\n")
  })

  it("stops at the first catalog that msgmerge cannot update", () => {
    let message = ""
    let calls = 0
    const code = updateCatalogs({
      ...options,
      run() {
        calls += 1
        return {status: calls === 3 ? 1 : 0}
      },
      stderr: {write(value) { message += value }},
    })

    assert.equal(code, 1)
    assert.equal(calls, 3)
    assert.equal(
      message,
      "msgmerge failed while updating pt-BR.po. Already updated: de.po.\n",
    )
  })

  it("reports partial progress if msgmerge disappears during an update", () => {
    let message = ""
    let calls = 0
    const code = updateCatalogs({
      ...options,
      run() {
        calls += 1
        return calls === 3 ? {error: {code: "ENOENT"}} : {status: 0}
      },
      stderr: {write(value) { message += value }},
    })

    assert.equal(code, 2)
    assert.equal(calls, 3)
    assert.equal(
      message,
      "GNU gettext msgmerge is required to update PO catalogs. "
      + "Already updated: de.po.\n",
    )
  })
})
