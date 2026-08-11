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

  it("preserves source message order in generated catalogs", () => {
    const orderedSource = po(`
msgctxt "zebra.last"
msgid "Last"
msgstr ""

msgctxt "alpha.first"
msgid "First"
msgstr ""
`)

    assert.deepEqual(
      Object.keys(compilePoCatalog(orderedSource, {sourceLanguage: true})),
      ["zebra", "alpha"],
    )
    assert.deepEqual(
      Object.keys(compilePoCatalog(po(`
msgctxt "alpha.first"
msgid "First"
msgstr "Premier"

msgctxt "zebra.last"
msgid "Last"
msgstr "Dernier"
`), {sourceCatalog: orderedSource})),
      ["zebra", "alpha"],
    )
  })

  it("includes active fuzzy translations", () => {
    const catalog = compilePoCatalog(po(`
msgctxt "controls.boot"
msgid "Boot"
msgstr "Démarrer"

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
      disk: {
        save: "Enregistrer le disque",
      },
    })
  })

  it("omits empty translations for runtime English fallback", () => {
    const catalog = compilePoCatalog(po(`
msgctxt "controls.reset"
msgid "Reset"
msgstr ""
`), {sourceCatalog: english})

    assert.deepEqual(catalog, {})
  })

  it("includes fuzzy translations when flags occupy multiple lines", () => {
    const catalog = compilePoCatalog(po(`
#, fuzzy
#, python-brace-format
msgctxt "controls.boot"
msgid "Boot"
msgstr "Ancien démarrage"
`), {sourceCatalog: english})

    assert.deepEqual(catalog, {
      controls: {
        boot: "Ancien démarrage",
      },
    })
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

  it("accepts the runtime's complete nonempty brace-free placeholder grammar", () => {
    const source = po(`
msgctxt "debug.runtimeGrammar"
msgid "{{user-name}} then {{ spaced name }}"
msgstr ""
`)
    const catalog = compilePoCatalog(po(`
#, fuzzy
msgctxt "debug.runtimeGrammar"
msgid "{{user-name}} then {{ spaced name }}"
msgstr "{{ spaced name }} puis {{user-name}}"
`), {sourceCatalog: source})

    assert.deepEqual(catalog, {
      debug: {
        runtimeGrammar: "{{ spaced name }} puis {{user-name}}",
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
        + "{{address}}: source=1, translation=0; {{value}}: source=2, translation=1; "
        + "{{wrong}}: source=0, translation=1",
      ),
    )
  })

  it("validates placeholders in fuzzy translations", () => {
    assert.throws(
      () => compilePoCatalog(po(`
#, fuzzy
msgctxt "debug.repeated"
msgid "{{value}} then {{value}} at {{address}}"
msgstr "{{value}} puis {{wrong}}"
`), {sourceCatalog: english}),
      new Error(
        "Placeholder mismatch for debug.repeated: "
        + "{{address}}: source=1, translation=0; {{value}}: source=2, translation=1; "
        + "{{wrong}}: source=0, translation=1",
      ),
    )
  })

  it("rejects malformed placeholders", () => {
    assert.throws(
      () => compilePoCatalog(po(`
#, fuzzy
msgctxt "debug.disassemblyTooltips.formats.value"
msgid "value = {{value}}"
msgstr "valeur = {{value}"
`), {sourceCatalog: english}),
      new Error(
        "Placeholder mismatch for debug.disassemblyTooltips.formats.value: "
        + "translation contains malformed placeholder syntax; "
        + "{{value}}: source=1, translation=0",
      ),
    )
  })

  it("validates component-owned single-brace placeholders", () => {
    const source = po(`
msgctxt "tour.nextLabelWithProgress"
msgid "Next (Step {step} of {steps})"
msgstr ""
`)
    assert.throws(
      () => compilePoCatalog(po(`
#, fuzzy
msgctxt "tour.nextLabelWithProgress"
msgid "Next (Step {step} of {steps})"
msgstr "Suivant (Étape {step})"
`), {sourceCatalog: source}),
      new Error(
        "Placeholder mismatch for tour.nextLabelWithProgress: "
        + "{steps}: source=1, translation=0",
      ),
    )
  })

  it("rejects boundary newlines in source messages and translations", () => {
    assert.throws(
      () => compilePoCatalog(po(`
msgctxt "controls.boot"
msgid "Boot"
msgstr "\\nBoot"
`), {sourceCatalog: english}),
      new Error(
        "Boundary newlines are not allowed for controls.boot: "
        + "translation leading newlines=1",
      ),
    )

    assert.throws(
      () => compilePoCatalog(po(`
msgctxt "controls.boot"
msgid "Boot\\n"
msgstr ""
`), {sourceLanguage: true}),
      new Error(
        "Boundary newlines are not allowed for controls.boot: "
        + "source trailing newlines=1",
      ),
    )

    assert.throws(
      () => compilePoCatalog(po(`
msgctxt "controls.boot"
msgid "\\n\\nBoot"
msgstr "\\nDémarrer"
`), {sourceCatalog: po(`
msgctxt "controls.boot"
msgid "\\n\\nBoot"
msgstr ""
`)}),
      new Error(
        "Boundary newlines are not allowed for controls.boot: "
        + "source leading newlines=2; translation leading newlines=1",
      ),
    )
  })

  it("allows translator-controlled internal newlines", () => {
    const source = po(`
msgctxt "controls.boot"
msgid "Boot\\nnow"
msgstr ""
`)
    const translation = po(`
msgctxt "controls.boot"
msgid "Boot\\nnow"
msgstr "Démarrer\\nmaintenant"
`)

    assert.deepEqual(compilePoCatalog(translation, {sourceCatalog: source}), {
      controls: {boot: "Démarrer\nmaintenant"},
    })
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

  it("treats inherited object-property names as ordinary semantic-key segments", () => {
    assert.equal(Object.prototype.toString.poCatalogValue, undefined)

    const catalog = compilePoCatalog(po(`
msgctxt "toString.poCatalogValue"
msgid "Safe"
msgstr ""
`), {sourceLanguage: true})

    assert.deepEqual(catalog, {
      toString: {
        poCatalogValue: "Safe",
      },
    })
    assert.equal(Object.prototype.toString.poCatalogValue, undefined)
  })

  it("ignores incomplete obsolete entries during compilation and reports them safely", () => {
    const translation = po(`
msgctxt "controls.boot"
msgid "Boot"
msgstr "Démarrer"

#~ msgctxt "obsolete.message"
#~ msgid "Old message"
`)

    assert.deepEqual(compilePoCatalog(translation, {sourceCatalog: english}), {
      controls: {
        boot: "Démarrer",
      },
    })
    assert.deepEqual(analyzePoCatalog(english, translation).obsolete, [{
      key: "obsolete.message",
      source: "Old message",
      translation: "",
    }])
  })

  it("rejects obsolete entries when a fully merged catalog is required", () => {
    assert.throws(
      () => compilePoCatalog(`${english}
#~ msgctxt "obsolete.message"
#~ msgid "Old message"
#~ msgstr "Ancien message"
`, {requireMerged: true, sourceCatalog: english}),
      new Error(
        "Catalog contains an obsolete message: obsolete.message. "
        + "Update the supplied translation catalog from its source catalog.",
      ),
    )
  })

  it("rejects obsolete entries in the source catalog", () => {
    assert.throws(
      () => compilePoCatalog(`${english}
#~ msgctxt "obsolete.message"
#~ msgid "Old message"
`, {sourceLanguage: true}),
      new Error(
        "Catalog contains an obsolete message: obsolete.message. "
        + "Remove obsolete messages from the source catalog.",
      ),
    )
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
        + "expected \"Save Disk Image\", received \"Save Disk\". "
        + "Update the supplied translation catalog from its source catalog.",
      ),
    )
  })

  it("directs contributors to update catalogs with orphaned active entries", () => {
    assert.throws(
      () => compilePoCatalog(po(`
msgctxt "controls.boot"
msgid "Boot"
msgstr "Démarrer"

msgctxt "removed.message"
msgid "Removed"
msgstr "Supprimé"
`), {sourceCatalog: english}),
      new Error(
        "Translation has no current source message: removed.message. "
        + "Update the supplied translation catalog from its source catalog.",
      ),
    )
  })

  it("can require every source message to exist in the translation catalog", () => {
    assert.throws(
      () => compilePoCatalog(po(`
msgctxt "controls.boot"
msgid "Boot"
msgstr "Démarrer"
`), {requireMerged: true, sourceCatalog: english}),
      new Error(
        "Translation catalog has not been merged for: controls.reset. "
        + "Update the supplied translation catalog from its source catalog.",
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
      unmerged: 1,
      missing: 0,
      "stale-source": 0,
      "boundary-newline": 0,
      "placeholder-mismatch": 1,
      "english-identical": 1,
      translated: 2,
      orphaned: 1,
      fuzzy: 1,
    })
    assert.deepEqual(
      report.entries.map(({key, status}) => ({key, status})),
      [
        {key: "controls.boot", status: "translated"},
        {key: "controls.reset", status: "english-identical"},
        {key: "debug.disassemblyTooltips.formats.value", status: "unmerged"},
        {key: "debug.repeated", status: "placeholder-mismatch"},
        {key: "disk.save", status: "translated"},
        {key: "orphan.message", status: "orphaned"},
      ],
    )
    assert.deepEqual(report.obsolete, [{
      key: "obsolete.message",
      source: "Old message",
      translation: "Ancien message",
    }])
  })

  it("reports fuzzy review state and retained previous English separately", () => {
    const report = analyzePoCatalog(english, po(`
#, fuzzy
#| msgid "Save Disk"
msgctxt "disk.save"
msgid "Save Disk Image"
msgstr "Enregistrer le disque"
`))

    assert.deepEqual(
      report.entries.find(({key}) => key === "disk.save"),
      {
        key: "disk.save",
        status: "translated",
        source: "Save Disk Image",
        translation: "Enregistrer le disque",
        fuzzy: true,
        previousSource: "Save Disk",
      },
    )
    assert.equal(report.counts.fuzzy, 1)
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
        fuzzy: false,
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
      `// Generated by npm run generate-i18n-catalogs. Do not edit directly.

export const fr = {
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
