import assert from "node:assert/strict"
import { describe, it } from "node:test"

import {
  analyzePoCatalog,
  compilePoCatalog,
  renderTypeScriptCatalog,
} from "./po-catalog.mjs"

const po = body => `msgid ""
msgstr ""
"Content-Type: text/plain; charset=UTF-8\\n"

${body}`

const english = po(`
msgctxt "controls.boot"
msgid "Boot"
msgstr ""

msgctxt "controls.reset"
msgid "Reset"
msgstr ""

msgctxt "debug.disassemblyTooltips.formats.value"
msgid "value = {{value}}"
msgstr ""

msgctxt "debug.repeated"
msgid "{{value}} then {{value}} at {{address}}"
msgstr ""

msgctxt "disk.save"
msgid "Save Disk Image"
msgstr ""
`)

describe("compilePoCatalog", () => {
  it("builds the current nested catalog shape from stable semantic keys", () => {
    const catalog = compilePoCatalog(english, {sourceLanguage: true})

    assert.deepEqual(catalog, {
      controls: {
        boot: "Boot",
        reset: "Reset",
      },
      debug: {
        disassemblyTooltips: {
          formats: {
            value: "value = {{value}}",
          },
        },
        repeated: "{{value}} then {{value}} at {{address}}",
      },
      disk: {
        save: "Save Disk Image",
      },
    })
  })

  it("omits missing and fuzzy translations so runtime English fallback remains authoritative", () => {
    const catalog = compilePoCatalog(po(`
msgctxt "controls.boot"
msgid "Boot"
msgstr "Démarrer"

msgctxt "controls.reset"
msgid "Reset"
msgstr ""

#, fuzzy
msgctxt "disk.save"
msgid "Save Disk Image"
msgstr "Enregistrer le disque"

#~ msgctxt "obsolete.message"
#~ msgid "Old message"
#~ msgstr "Ancien message"
`), {sourceCatalog: english})

    assert.deepEqual(catalog, {
      controls: {
        boot: "Démarrer",
      },
    })
  })

  it("omits fuzzy translations when flags occupy multiple lines", () => {
    const catalog = compilePoCatalog(po(`
#, fuzzy
#, python-brace-format
msgctxt "controls.boot"
msgid "Boot"
msgstr "Ancien démarrage"
`), {sourceCatalog: english})

    assert.deepEqual(catalog, {})
  })

  it("accepts matching repeated placeholders", () => {
    const catalog = compilePoCatalog(po(`
msgctxt "debug.repeated"
msgid "{{value}} then {{value}} at {{address}}"
msgstr "{{value}} puis {{value}} à {{address}}"
`), {sourceCatalog: english})

    assert.deepEqual(catalog, {
      debug: {
        repeated: "{{value}} puis {{value}} à {{address}}",
      },
    })
  })

  it("rejects missing, unexpected, and differently repeated placeholders", () => {
    assert.throws(
      () => compilePoCatalog(po(`
msgctxt "debug.repeated"
msgid "{{value}} then {{value}} at {{address}}"
msgstr "{{value}} puis {{wrong}}"
`), {sourceCatalog: english}),
      new Error(
        "Placeholder mismatch for debug.repeated: "
        + "address: source=1, translation=0; value: source=2, translation=1; "
        + "wrong: source=0, translation=1",
      ),
    )
  })

  it("rejects entries without stable semantic keys", () => {
    assert.throws(
      () => compilePoCatalog(po(`
msgid "Boot"
msgstr "Démarrer"
`), {sourceCatalog: english}),
      new Error("Message is missing a semantic key in msgctxt: Boot"),
    )
  })

  it("rejects semantic-key path collisions", () => {
    assert.throws(
      () => compilePoCatalog(po(`
msgctxt "controls"
msgid "Controls"
msgstr "Commandes"

msgctxt "controls.boot"
msgid "Boot"
msgstr "Démarrer"
`), {sourceLanguage: true}),
      new Error("Semantic-key path collides with a message: controls.boot"),
    )
  })

  it("rejects exact duplicate PO entries before they can overwrite each other", () => {
    assert.throws(
      () => compilePoCatalog(po(`
msgctxt "controls.boot"
msgid "Boot"
msgstr ""

msgctxt "controls.boot"
msgid "Boot"
msgstr ""
`), {sourceLanguage: true}),
      /Duplicate msgid error/,
    )
  })

  it("rejects multiple singular translation declarations", () => {
    assert.throws(
      () => compilePoCatalog(po(`
msgctxt "controls.boot"
msgid "Boot"
msgstr "Démarrer"
msgstr "Commencer"
`), {sourceCatalog: english}),
      /Translation string range error/,
    )
  })

  it("rejects semantic keys that can traverse built-in object properties", () => {
    for (const key of [
      "__proto__.polluted",
      "constructor.prototype.polluted",
      "safe.prototype.polluted",
    ]) {
      const reservedSegment = key.split(".").find(segment => (
        ["__proto__", "constructor", "prototype"].includes(segment)
      ))
      assert.throws(
        () => compilePoCatalog(po(`
msgctxt "${key}"
msgid "Unsafe"
msgstr ""
`), {sourceLanguage: true}),
        new Error(`Reserved semantic-key segment "${reservedSegment}": ${key}`),
      )
    }
  })

  it("validates complete source topology when compiling a partial translation", () => {
    const collidingEnglish = po(`
msgctxt "controls"
msgid "Controls"
msgstr ""

msgctxt "controls.boot"
msgid "Boot"
msgstr ""
`)
    assert.throws(
      () => compilePoCatalog(po(`
msgctxt "controls.boot"
msgid "Boot"
msgstr "Démarrer"
`), {sourceCatalog: collidingEnglish}),
      new Error("Semantic-key path collides with a message: controls.boot"),
    )
  })

  it("rejects translations that have not been merged with current English", () => {
    assert.throws(
      () => compilePoCatalog(po(`
msgctxt "disk.save"
msgid "Save Disk"
msgstr "Enregistrer le disque"
`), {sourceCatalog: english}),
      new Error(
        "Translation source is stale for disk.save: "
        + "expected \"Save Disk Image\", received \"Save Disk\"",
      ),
    )
  })

  it("requires the current English catalog when compiling a translation", () => {
    assert.throws(
      () => compilePoCatalog(po(`
msgctxt "controls.boot"
msgid "Boot"
msgstr "Démarrer"
`)),
      new Error("A current source catalog is required for translated catalogs"),
    )
  })
})

describe("analyzePoCatalog", () => {
  it("reports actionable and advisory translation states", () => {
    const report = analyzePoCatalog(english, po(`
msgctxt "controls.boot"
msgid "Boot"
msgstr "Démarrer"

msgctxt "controls.reset"
msgid "Reset"
msgstr "Reset"

msgctxt "debug.repeated"
msgid "{{value}} then {{value}} at {{address}}"
msgstr "{{value}} puis {{wrong}}"

#, fuzzy
msgctxt "disk.save"
msgid "Save Disk Image"
msgstr "Enregistrer le disque"

msgctxt "orphan.message"
msgid "Orphan"
msgstr "Orphelin"

#~ msgctxt "obsolete.message"
#~ msgid "Old message"
#~ msgstr "Ancien message"
`))

    assert.deepEqual(report.counts, {
      missing: 1,
      fuzzy: 1,
      "stale-source": 0,
      "placeholder-mismatch": 1,
      "english-identical": 1,
      translated: 1,
      orphaned: 1,
    })
    assert.deepEqual(
      report.entries.map(({key, status}) => ({key, status})),
      [
        {key: "controls.boot", status: "translated"},
        {key: "controls.reset", status: "english-identical"},
        {key: "debug.disassemblyTooltips.formats.value", status: "missing"},
        {key: "debug.repeated", status: "placeholder-mismatch"},
        {key: "disk.save", status: "fuzzy"},
        {key: "orphan.message", status: "orphaned"},
      ],
    )
    assert.deepEqual(report.obsolete, [{
      key: "obsolete.message",
      source: "Old message",
      translation: "Ancien message",
    }])
  })

  it("reports stale source even when the translation is empty", () => {
    const report = analyzePoCatalog(english, po(`
msgctxt "disk.save"
msgid "Save Disk"
msgstr ""
`))

    assert.deepEqual(
      report.entries.find(({key}) => key === "disk.save"),
      {
        key: "disk.save",
        status: "stale-source",
        source: "Save Disk Image",
        translationSource: "Save Disk",
        translation: "",
      },
    )
  })
})

describe("renderTypeScriptCatalog", () => {
  it("renders deterministic importable TypeScript", () => {
    assert.equal(
      renderTypeScriptCatalog("fr", {
        controls: {
          boot: "Démarrer",
        },
      }),
      `export const fr = {
  "controls": {
    "boot": "Démarrer"
  }
}
`,
    )
  })

  it("rejects invalid export names", () => {
    assert.throws(
      () => renderTypeScriptCatalog("pt-BR", {}),
      new Error("Invalid TypeScript export name: pt-BR"),
    )
  })
})
