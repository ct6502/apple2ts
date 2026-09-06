import assert from "node:assert/strict"
import { spawnSync } from "node:child_process"
import { mkdtempSync, readdirSync, readFileSync, rmSync, writeFileSync } from "node:fs"
import { tmpdir } from "node:os"
import { join, resolve } from "node:path"
import { afterEach, describe, it } from "node:test"

import { stageCatalogUpdate, updateCatalogs } from "./update-catalogs-lib.mjs"
import { analyzePoCatalog, compilePoCatalog } from "./po-catalog.mjs"

const temporaryDirectories = []
const weblateFixture = readFileSync(
  new URL("./fixtures/weblate-formatted.po", import.meta.url),
  "utf8",
)
const weblateSourceBefore = readFileSync(
  new URL("./fixtures/weblate-source-before.pot", import.meta.url),
  "utf8",
)
const weblateSourceAfter = readFileSync(
  new URL("./fixtures/weblate-source-after.pot", import.meta.url),
  "utf8",
)
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

  it("updates a catalog whose source filename maps to a canonical locale", () => {
    const calls = []
    const code = updateCatalogs({
      catalogDirectory: "/catalogs",
      catalogInputs: {"en-x-pirate": "/catalogs/en@pirate.po"},
      locales: ["en-x-pirate"],
      source: "/catalogs/messages.pot",
      stage: unchangedStage,
      run(command, arguments_) {
        calls.push({command, arguments_})
        return {status: 0}
      },
    })

    assert.equal(code, 0)
    assert.deepEqual(calls[1].arguments_, [
      "--previous", "--no-fuzzy-matching", "--update", "--backup=none",
      "/catalogs/en@pirate.po", "/catalogs/messages.pot",
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
    assert.ok(updated.endsWith("\n"))
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

  it("needs stable-key preparation before msgmerge", () => {
    const directory = mkdtempSync(join(tmpdir(), "apple2ts-po-update-negative-"))
    temporaryDirectories.push(directory)
    const source = join(directory, "messages.pot")
    const input = join(directory, "fr.po")
    writeFileSync(source, `msgid ""
msgstr ""
"Content-Type: text/plain; charset=UTF-8\\n"

msgctxt "disk.save"
msgid "Completely unrelated replacement wording"
msgstr ""
`)
    writeFileSync(input, `msgid ""
msgstr ""
"Content-Type: text/plain; charset=UTF-8\\n"

msgctxt "disk.save"
msgid "Save Disk"
msgstr "Enregistrer le disque"
`)

    const result = spawnSync("msgmerge", [
      "--previous",
      "--no-fuzzy-matching",
      "--update",
      "--backup=none",
      input,
      source,
    ])

    assert.equal(result.status, 0)
    const updated = readFileSync(input, "utf8")
    assert.match(updated, /msgid "Completely unrelated replacement wording"\nmsgstr ""/)
    assert.match(updated, /#~ msgstr "Enregistrer le disque"/)
  })

  it("changes semantic entries without reformatting unrelated Weblate content", () => {
    const directory = mkdtempSync(join(tmpdir(), "apple2ts-po-update-weblate-"))
    temporaryDirectories.push(directory)
    const source = join(directory, "messages.pot")
    const input = join(directory, "fr.po")
    writeFileSync(source, weblateSourceAfter)
    writeFileSync(input, weblateFixture)
    const header = weblateFixture.slice(0, weblateFixture.indexOf("#. Keep"))
    const unchanged = weblateFixture.slice(
      weblateFixture.indexOf("#, fuzzy, javascript-format"),
      weblateFixture.indexOf("#, javascript-format\n#, fuzzy\n#| msgid \"Earlier empty source\""),
    )
    assert.deepEqual(
      analyzePoCatalog(weblateSourceBefore, weblateFixture).entries
        .map(({key, status}) => ({key, status})),
      [
        {key: "disk.empty", status: "missing"},
        {key: "disk.save", status: "translated"},
        {key: "removed.entry", status: "translated"},
        {key: "tour.unchanged", status: "translated"},
      ],
    )

    const run = (command, arguments_) => {
      assert.equal(command, "msgmerge")
      if (arguments_[0] !== "--version") {
        const staged = readFileSync(arguments_.at(-2), "utf8")
        assert.equal(staged.slice(0, staged.indexOf("#. Keep")), header)
        assert.ok(staged.includes(unchanged))
      }
      return {status: 0}
    }
    assert.equal(updateCatalogs({
      catalogDirectory: directory,
      locales: ["fr"],
      source,
      run,
    }), 0)

    const updated = readFileSync(input, "utf8")
    assert.match(updated, /#, fuzzy\n#\| msgid "Save disk \{\{name\}\}"\nmsgctxt "disk\.save"\nmsgid "Save image \{\{name\}\}"/)
    assert.match(updated, /msgstr "Enregistrer le disque « \{\{name\}\} »"/)
    assert.match(updated, /#, javascript-format\nmsgctxt "disk\.empty"\nmsgid "New empty source"\nmsgstr ""/)
    assert.doesNotMatch(updated, /Earlier empty source|removed\.entry|obsolete\.entry/)
    assert.equal(updated.slice(0, updated.indexOf("#. Keep")), header)
    assert.ok(updated.includes(unchanged))
    assert.deepEqual(compilePoCatalog(updated, {sourceCatalog: weblateSourceAfter}), {
      disk: {
        save: "Enregistrer le disque « {{name}} »",
      },
      tour: {
        unchanged: "Un texte français inchangé suffisamment long pour conserver exactement son formatage Weblate.",
      },
    })
    const save = analyzePoCatalog(weblateSourceAfter, updated).entries
      .find(entry => entry.key === "disk.save")
    assert.deepEqual(save, {
      key: "disk.save",
      status: "translated",
      source: "Save image {{name}}",
      translation: "Enregistrer le disque « {{name}} »",
      fuzzy: true,
      previousSource: "Save disk {{name}}",
    })

    assert.equal(updateCatalogs({
      catalogDirectory: directory,
      locales: ["fr"],
      source,
      run,
    }), 0)
    assert.equal(readFileSync(input, "utf8"), updated)
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

  it("rejects valid PO entries without supported blank-line separation", () => {
    const directory = mkdtempSync(join(tmpdir(), "apple2ts-po-update-layout-"))
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
    const original = `msgid ""
msgstr ""
"Content-Type: text/plain; charset=UTF-8\\n"
msgctxt "disk.save"
msgid "Save Disk"
msgstr "Enregistrer"
`
    writeFileSync(source, sourceText)
    writeFileSync(input, original)
    let message = ""

    assert.equal(updateCatalogs({
      catalogDirectory: directory,
      locales: ["fr"],
      source,
      run: () => ({status: 0}),
      stderr: {write(value) { message += value }},
    }), 1)
    assert.match(message, /must separate PO entries with blank lines/)
    assert.equal(readFileSync(input, "utf8"), original)
    assert.deepEqual(readdirSync(directory).sort(), ["fr.po", "messages.pot"])
  })

  it("rejects active plural entries without modifying the original", () => {
    const directory = mkdtempSync(join(tmpdir(), "apple2ts-po-update-plural-"))
    temporaryDirectories.push(directory)
    const source = join(directory, "messages.pot")
    const input = join(directory, "fr.po")
    const original = `msgid ""
msgstr ""
"Content-Type: text/plain; charset=UTF-8\\n"
"Plural-Forms: nplurals=2; plural=n > 1;\\n"

msgctxt "disk.count"
msgid "One disk"
msgid_plural "{{count}} disks"
msgstr[0] "Un disque"
msgstr[1] "{{count}} disques"
`
    writeFileSync(source, original)
    writeFileSync(input, original)
    let message = ""

    assert.equal(updateCatalogs({
      catalogDirectory: directory,
      locales: ["fr"],
      source,
      run: () => ({status: 0}),
      stderr: {write(value) { message += value }},
    }), 1)
    assert.match(message, /Plural messages are not supported: disk\.count/)
    assert.equal(readFileSync(input, "utf8"), original)
    assert.deepEqual(readdirSync(directory).sort(), ["fr.po", "messages.pot"])
  })

  it("leaves metadata-only changes raw until msgmerge", () => {
    const directory = mkdtempSync(join(tmpdir(), "apple2ts-po-update-metadata-"))
    temporaryDirectories.push(directory)
    const source = join(directory, "messages.pot")
    const input = join(directory, "fr.po")
    const original = `msgid ""
msgstr ""
"Content-Type: text/plain; charset=UTF-8\\n"

#: old.ts:1
#, fuzzy
#| msgid "Earlier wording"
msgctxt "disk.save"
msgid "Save Disk"
msgstr "Enregistrer"
`
    writeFileSync(source, original.replace("#: old.ts:1", "#: new.ts:2"))
    writeFileSync(input, original)

    assert.equal(updateCatalogs({
      catalogDirectory: directory,
      locales: ["fr"],
      source,
      stage(arguments_) {
        const staged = stageCatalogUpdate(arguments_)
        assert.equal(readFileSync(staged.input, "utf8"), original)
        return staged
      },
    }), 0)
    const updated = readFileSync(input, "utf8")
    assert.match(updated, /#: new\.ts:2/)
    assert.deepEqual(
      analyzePoCatalog(readFileSync(source, "utf8"), updated).entries[0],
      {
        key: "disk.save",
        status: "translated",
        source: "Save Disk",
        translation: "Enregistrer",
        fuzzy: true,
        previousSource: "Earlier wording",
      },
    )
  })

  it("cleans staging and preserves the original after replacement fails", () => {
    const directory = mkdtempSync(join(tmpdir(), "apple2ts-po-update-replace-"))
    temporaryDirectories.push(directory)
    const source = join(directory, "messages.pot")
    const input = join(directory, "fr.po")
    const original = `msgid ""
msgstr ""
"Content-Type: text/plain; charset=UTF-8\\n"

msgctxt "disk.save"
msgid "Save Disk"
msgstr "Enregistrer"
`
    writeFileSync(source, original.replace("Save Disk", "Load Disk"))
    writeFileSync(input, original)
    let message = ""

    assert.equal(updateCatalogs({
      catalogDirectory: directory,
      locales: ["fr"],
      source,
      run: () => ({status: 0}),
      stage(arguments_) {
        const staged = stageCatalogUpdate(arguments_)
        return {...staged, commit() { throw new Error("replacement denied") }}
      },
      stderr: {write(value) { message += value }},
    }), 1)
    assert.match(message, /Unable to replace fr\.po: replacement denied/)
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
