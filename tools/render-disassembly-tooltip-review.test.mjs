import { test } from "node:test"
import assert from "node:assert/strict"
import fs from "node:fs/promises"
import {
  createCatalogTranslator,
  renderDisassemblyTooltipReview,
} from "./render-disassembly-tooltip-review.mjs"

test("rejects incomplete review translations", () => {
  const translate = createCatalogTranslator({
    complete: "Value = {{value}}",
    incomplete: "Value = {{value}}; State = {{state}}",
  })

  assert.equal(translate("complete", {value: "$42"}), "Value = $42")
  assert.throws(() => translate("missing"), /Missing review translation: missing/)
  assert.throws(
    () => translate("incomplete", {value: "$42"}),
    /Unresolved review translation parameter: incomplete/,
  )
})

test("renders concrete tooltip examples from the resolver", async () => {
  const review = await renderDisassemblyTooltipReview()

  assert.match(review, /^# Disassembly tooltip review$/m)
  assert.match(review, /The Value column uses representative runtime values only to make conditional tooltip text concrete/)
  assert.match(review, /\| \$C000–\$C00F \| II\* \| Read \| \$5D \| Keyboard = "`\]`"; Strobe is `CLEAR` \(bit 7 = `0`\) \|/)
  assert.match(review, /\| \$C000 \| IIe \| Write \| {2}\| Disable PAGE2 display-memory banking \|/)
  assert.match(review, /\| \$C071 \| IIe \| Write \| \$03 \| Select auxiliary bank \$03 using Neptune addressing; start paddle timers \|/)
  assert.match(review, /\| \$C073 \| IIe \| Write \| \$03 \| Select auxiliary bank \$03 using RamWorks addressing; start paddle timers \|/)
  assert.match(review, /Write ignored on Apple II\+/)
  assert.match(review, /\| \$C010–\$C01F \| II\+ \| Read\/write \| {2}\| Clear keyboard strobe \|/)
  assert.doesNotMatch(review, /No tooltip|N\/A/)
})

test("renders a machine-specific review without a Type column", async () => {
  const review = await renderDisassemblyTooltipReview({
    machines: ["APPLE2P"],
    title: "Apple II+ disassembly tooltip review",
    includeType: false,
  })

  assert.match(review, /^# Apple II\+ disassembly tooltip review$/m)
  assert.match(review, /^\| Range \| Access \| Value \| Tooltip \|$/m)
  assert.doesNotMatch(review, /\| Type \|/)
  assert.match(review, /\| \$C010–\$C01F \| Read\/write \| {2}\| Clear keyboard strobe \|/)
  assert.doesNotMatch(review, /Language Card Bank/)
})

test("keeps checked-in machine reviews synchronized with the resolver", async () => {
  const reviews = [
    {
      path: "../docs/reviews/disassembly-tooltips-apple2p.md",
      machines: ["APPLE2P"],
      title: "Apple II+ disassembly tooltip review",
    },
    {
      path: "../docs/reviews/disassembly-tooltips-apple2e.md",
      machines: ["APPLE2EU", "APPLE2EE"],
      title: "Apple IIe disassembly tooltip review",
    },
  ]

  for (const review of reviews) {
    const expected = await renderDisassemblyTooltipReview({
      machines: review.machines,
      title: review.title,
      includeType: false,
    })
    const checkedIn = await fs.readFile(new URL(review.path, import.meta.url), "utf8")
    assert.equal(checkedIn, expected)
  }
})
