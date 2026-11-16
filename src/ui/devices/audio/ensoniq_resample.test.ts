import { resampleDocBlock, playEnsoniqSamples, resetEnsoniqAudio, type DocResampleState } from "./iigs_ensoniq_audio"

// The DOC posts one block per emulated refresh (439 frames at 26320 Hz) and that
// rate is not an integer divisor of the device rate, so a block is 800.7 device
// frames. Resampling each block on its own - which is what happens when the
// AudioContext resamples a separately-started source - restarts the interpolation
// phase at every boundary and drops the fraction: a discontinuity 60 times a
// second, i.e. the clicking noise over the music. gssquared hits the same thing
// with SDL ("feeding SDL small chunks at the raw DOC rate made SDL's internal
// chunk resampler glitch audibly") and carries the read position across blocks.
// These tests pin that carry and the transport that uses it.
const SRC_RATE = 26320
const DEV_RATE = 48000
const BLOCK = 439
const BLOCK_FRAMES = BLOCK * DEV_RATE / SRC_RATE

const freshState = (): DocResampleState => ({ pos: 0, tailL: 0, tailR: 0 })

// A tone with real slew at the top of the band, so a fraction-of-a-frame phase
// error shows up as an amplitude step rather than a shrug.
const tone = (startFrame: number, frames: number): Int16Array => {
  const out = new Int16Array(frames * 2)
  for (let i = 0; i < frames; i++) {
    const t = (startFrame + i) / SRC_RATE
    const s = 0.45 * Math.sin(2 * Math.PI * 3000 * t) + 0.45 * Math.sin(2 * Math.PI * 9000 * t)
    const v = Math.round(s * 32767)
    out[i * 2] = v
    out[i * 2 + 1] = v
  }
  return out
}

const blocks = (n: number) => Array.from({ length: n }, (_, k) => tone(k * BLOCK, BLOCK))

const run = (src: Int16Array[], carried: boolean) => {
  const state = freshState()
  const stream: number[] = []
  const boundaries = new Set<number>()
  for (const b of src) {
    boundaries.add(stream.length)
    const o = resampleDocBlock(b, BLOCK, SRC_RATE, DEV_RATE, carried ? state : freshState())
    for (let i = 0; i < o.length; i += 2) stream.push(o[i])
  }
  const flat = Float32Array.from(stream)
  const jump = (at: (index: number) => boolean) => {
    let worst = 0
    for (let i = 1; i < flat.length; i++) {
      if (!at(i)) continue
      const d = Math.abs(flat[i] - flat[i - 1])
      if (d > worst) worst = d
    }
    return worst
  }
  return {
    length: stream.length,
    edge: jump((i) => boundaries.has(i)),
    inside: jump((i) => !boundaries.has(i)),
  }
}

test("carrying the resample phase leaves the block boundaries no worse than the interior", () => {
  const src = blocks(60)
  const { length, edge, inside } = run(src, true)
  expect(edge).toBeLessThan(inside * 1.05)

  // No sample invented or dropped: the schedule cannot drift. Only the reads
  // inside the final block's deferred window (under two) are still owed to a
  // following block that never arrives.
  expect(Math.abs(length - src.length * BLOCK_FRAMES)).toBeLessThan(2)
})

test("resampling each block on its own skips frames at every boundary", () => {
  const src = blocks(60)
  const { length, edge, inside } = run(src, false)
  // The phase restart is an amplitude step, not a slope: well above the interior.
  expect(edge).toBeGreaterThan(inside * 1.5)
  // And ~1.7 of the 800.7 device frames per block never get emitted.
  expect(src.length * BLOCK_FRAMES - length).toBeGreaterThan(src.length)
})

test("the transport resamples to the AudioContext rate and schedules the blocks back to back", () => {
  const created: Array<{ frames: number; rate: number }> = []
  const starts: number[] = []
  class FakeContext {
    sampleRate = DEV_RATE
    currentTime = 0
    state = "running"
    destination = {}
    createGain() { return { gain: { value: 1 }, connect: () => {} } }
    resume() { return Promise.resolve() }
    close() { return Promise.resolve() }
    createBufferSource() {
      return { buffer: null, connect: () => {}, start: (t: number) => starts.push(t) }
    }
    createBuffer(ch: number, frames: number, rate: number) {
      created.push({ frames, rate })
      const data = [new Float32Array(frames), new Float32Array(frames)]
      return {
        numberOfChannels: ch, length: frames, sampleRate: rate,
        getChannelData: (i: number) => data[i],
      }
    }
  }
  ;(globalThis as unknown as { window: Record<string, unknown> }).window.AudioContext = FakeContext

  resetEnsoniqAudio()
  const src = blocks(10)
  for (const b of src) playEnsoniqSamples(b, SRC_RATE)

  // Never hand the context a DOC-rate buffer - it would resample per source.
  expect(created.length).toBe(10)
  for (const c of created) expect(c.rate).toBe(DEV_RATE)
  const total = created.reduce((a, c) => a + c.frames, 0)
  expect(Math.abs(total - 10 * BLOCK_FRAMES)).toBeLessThan(2)

  // Contiguous playback: each block starts exactly where the previous one ends.
  let next = starts[0]
  for (let i = 0; i < created.length; i++) {
    expect(starts[i]).toBeCloseTo(next, 9)
    next += created[i].frames / DEV_RATE
  }
})
