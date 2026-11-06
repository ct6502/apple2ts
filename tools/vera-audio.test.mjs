import { test } from "node:test"
import assert from "node:assert/strict"
import { makeProcessor, referenceRenderSample } from "./fixtures/vera-psg-reference.mjs"

for (const rate of [44100, 48000, 96000]) {
  test(`PSG output and hidden oscillator state match the original at ${rate} Hz`, () => {
    const current = makeProcessor(rate)
    const reference = makeProcessor(rate)
    reference.renderSample = referenceRenderSample
    let seed = 12345
    const random = () => { seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0; return seed }
    for (let sample = 0; sample < 16000; sample++) {
      if (sample % 17 === 0) {
        const reg = random() >>> 16 & 63
        const value = random() >>> 16 & 255
        current.writeReg(reg, value)
        reference.writeReg(reg, value)
      }
      const a = current.renderSample()
      const b = reference.renderSample()
      assert.equal(a.left, b.left)
      assert.equal(a.right, b.right)
    }
    assert.equal(current.noiseState, reference.noiseState)
    assert.deepEqual(Array.from(current.channels, ch => [ch.phase, ch.noiseval]),
      Array.from(reference.channels, ch => [ch.phase, ch.noiseval]))
  })
}

test("disabled FM avoids WASM synthesis work", () => {
  const processor = makeProcessor(48000)
  let rendered = false
  processor.fmModule = { _ymfm_render() { rendered = true } }
  processor.fmEnabled = false
  assert.equal(processor.renderFm(128), null)
  assert.equal(rendered, false)
})
