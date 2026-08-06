import { test } from "node:test"
import assert from "node:assert/strict"
import fs from "node:fs/promises"
import {
  createCatalogTranslator,
  renderDisassemblyTranslationKeyReview,
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
  assert.match(review, /\| \$C000–\$C00F \| II\* \| Read \| \$5D \| Keyboard: "`\]`"<br>Keyboard strobe: `CLEAR` \(MSB = `0`\) \|/)
  assert.match(review, /\| \$C000 \| IIe \| Write \| {2}\| Make PAGE2 select display page 1 or 2 \|/)
  assert.match(review, /\| \$C00D \| IIe \| Write \| {2}\| Set display width to 80 columns \|/)
  assert.match(review, /\| \$C018 \| IIe \| Read \| \$80 \| PAGE2 selects main or auxiliary display memory \(MSB = `1`\) \|/)
  assert.match(review, /\| \$C05E \| IIe \| Read\/write \| {2}\| Disable annunciator 3<br>Enable DHIRES \|/)
  assert.match(review, /\| \$C071 \| IIe \| Write \| \$03 \| Start paddle timers<br>Select auxiliary expansion bank \$03 using Neptune addressing \|/)
  assert.match(review, /\| \$C073 \| IIe \| Write \| \$03 \| Start paddle timers<br>Select auxiliary expansion bank \$03 using RamWorks addressing \|/)
  assert.match(review, /\| \$C074 \| II\* \| Write \| \$A0 \| Start paddle timers<br>Laser 128EX: Select 2\.3 MHz maximum CPU speed<br>Laser 128EX: Enable automatic 1 MHz slowdown for port 7 disk access \(write-once bit 5\) \|/)
  assert.match(review, /\| \$C083 \| II\* \| Read \| {2}\| Language Card: Select bank 2<br>Language Card: Use RAM for reads<br>Language Card: Arm or enable writes \|/)
  assert.match(review, /\| \$C075–\$C07F \| II\* \| Read\/write \| {2}\| Start paddle timers \|/)
  assert.match(review, /INFO: This write has no effect on Apple II\+/)
  assert.match(review, /\| \$C010–\$C01F \| II\+ \| Read\/write \| {2}\| Clear keyboard strobe \|/)
  assert.match(review, /\| \$C060–\$C06F \| II\* \| Write \| {2}\| _No semantic tooltip_ \|/)
  assert.match(review, /^## Instruction-sensitive cases$/m)
  assert.match(review, /^\| Instruction \| Type \| Write value \| Tooltip \|$/m)
  assert.match(review, /\| `INC \$C030` \| II\* \| — \| WARNING: This instruction triggers the soft switch multiple times \|/)
  assert.match(review, /\| `STA \$C070,X \(X = \$03\)` \| IIe \| \$03 \| Start paddle timers<br>WARNING: This instruction triggers the soft switch multiple times<br>Select auxiliary expansion bank \$03 using RamWorks addressing \|/)
  assert.match(review, /\| `INC \$C073` \| IIe \| UNKNOWN \| Start paddle timers<br>WARNING: This instruction writes an unknown value \|/)
  assert.match(review, /\| `STA \$C070,X \(X = \$04\)` \| II\* \| \$01 \| Start paddle timers<br>WARNING: This instruction triggers the soft switch multiple times<br>TransWarp: Select 1 MHz<br>Laser 128EX: Select 1 MHz maximum CPU speed<br>Laser 128EX: Disable automatic 1 MHz slowdown for port 7 disk access \(write-once bit 5\) \|/)
  assert.match(review, /\| `INC \$C074` \| II\* \| UNKNOWN \| Start paddle timers<br>WARNING: This instruction writes an unknown value \|/)
  assert.doesNotMatch(review, /N\/A/)
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
  assert.match(review, /^\| Instruction \| Write value \| Tooltip \|$/m)
  assert.match(review, /\| \$C010–\$C01F \| Read\/write \| {2}\| Clear keyboard strobe \|/)
  assert.doesNotMatch(review, /Language Card Bank/)
})

test("renders the disassembly translation-key hierarchy", async () => {
  const review = await renderDisassemblyTranslationKeyReview()

  assert.match(review, /^# Disassembly translation-key structure review$/m)
  assert.match(review, /^## Longest relative key paths$/m)
  assert.match(review, /98 strings: 0 direct strings and 98 strings in 14 named groups/)
  assert.doesNotMatch(review, /^## Direct strings$/m)
  assert.doesNotMatch(review, /^## diagnostic$/m)
  assert.match(review, /\| `notice\.emulatorIdentifier` \| INFO: Apple2TS emulator identifier: \$CD \| — \|/)
  assert.match(review, /\| `notice\.noWriteEffect` \| INFO: This write has no effect on {{machine}} \| machine \|/)
  assert.match(review, /\| `notice\.multipleTriggers` \| WARNING: This instruction triggers the soft switch multiple times \| — \|/)
  assert.match(review, /\| `notice\.unknownWrite` \| WARNING: This instruction writes an unknown value \| — \|/)
  assert.match(review, /\| `displayMemory\.80storeStatusOn` \| PAGE2 selects main or auxiliary display memory \(MSB = 1\) \| — \|/)
  assert.match(review, /\| `display\.textModeStatusOn` \| Text mode: ON \(MSB = 1\) \| — \|/)
  assert.match(review, /\| `gameIO\.buttonPressed` \| Pushbutton {{number}}: PRESSED \(MSB = 1\) \| number \|/)
  assert.doesNotMatch(review, /Label`|## states$|## devices$/m)
  assert.match(review, /\| `display\.selectGraphicsMode` \| Select graphics mode \| — \|/)
  assert.match(review, /\| `memory\.effectiveAddress` \| Effective address: {{notation}} \| notation \|/)
  assert.match(review, /\| `annunciator\.enable` \| Enable annunciator {{number}} \| number \|/)
  assert.match(review, /\| `auxMemory\.altzpStatusAuxiliary` \| Zero page, stack, and bank-switched RAM: AUXILIARY \(MSB = 1\) \| — \|/)
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

  const expectedKeys = await renderDisassemblyTranslationKeyReview()
  const checkedInKeys = await fs.readFile(
    new URL("../docs/reviews/disassembly-translation-keys.md", import.meta.url),
    "utf8",
  )
  assert.equal(checkedInKeys, expectedKeys)
})
