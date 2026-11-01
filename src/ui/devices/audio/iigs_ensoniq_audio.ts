// Apple IIgs Ensoniq ES5503 audio output.
//
// The DOC produces its own sample stream (rate = clock / 8 / (oscillators + 2),
// i.e. roughly 27-37 kHz depending on how many oscillators are enabled). The
// worker renders one block per emulated video frame and posts it here; we queue
// the blocks on the AudioContext clock so playback stays smooth and gap-free
// even when the worker stutters.

import { isAudioEnabled, registerAudioContext } from "./speaker"

let audioContext: AudioContext | null = null
let outputNode: GainNode | null = null
let nextTime = 0
// True once at least one block has been scheduled, so the very first block -
// which always finds `nextTime` at or behind the clock because the context was
// only just created - is not counted as an underrun.
let streaming = false
let unregister: (() => void) | undefined
// How many blocks have actually reached playback. The DOC only renders when an
// oscillator is active, so a silent machine and a broken transport look identical
// from here unless the blocks are counted. Mirrors getSpeakerClickCount().
let blocksPlayed = 0
const resampleState: DocResampleState = { pos: 0, tailL: 0, tailR: 0 }

// Reserve to (re-)prime the schedule with, and the backlog at which we stop
// buffering and skip ahead. 60ms absorbs main-thread jitter (React render,
// paint, message backlog) without adding audible latency to a live machine.
const minLead = 0.06
const maxLead = 0.5

export const getEnsoniqBlocksPlayed = (): number => blocksPlayed

// The DOC's own rate (clock / 8 / (oscillators + 2)) is never an integer divisor
// of the device rate, so a block of N DOC frames is N*dst/src device frames --
// 800.7 for 439 frames at 26320 -> 48000. Handing the AudioContext one source per
// refresh and letting it resample each independently restarts the interpolation
// phase at every block and discards that fraction: a one-sample step 60 times a
// second, which is the clicking noise over any DOC stream. gssquared runs into
// the same thing with SDL ("feeding SDL small chunks at the raw DOC rate made
// SDL's internal chunk resampler glitch audibly") and fixes it by carrying the
// fractional read position across blocks, so the stream is resampled as one
// continuous run. Do the same here and only ever build buffers at the device
// rate, which the AudioContext copies without resampling.
export type DocResampleState = { pos: number; tailL: number; tailR: number }

export const resampleDocBlock = (
  samples: Int16Array,
  srcFrames: number,
  srcRate: number,
  dstRate: number,
  state: DocResampleState,
): Float32Array => {
  const step = srcRate / dstRate
  // `state.pos` is block-relative with one frame of history: -1 is the previous
  // block's last frame. A read in [srcFrames-1, srcFrames) needs the *next*
  // block's sample 0, so it is deferred (that is what keeps the boundary
  // interpolated instead of snapping to the block's last value).
  const last = srcFrames - 1
  const cap = Math.max(0, Math.floor((last - state.pos) / step) + 1)
  const out = new Float32Array(cap * 2)
  let pos = state.pos
  let n = 0
  while (pos < last && n < cap) {
    const i0 = Math.floor(pos)
    const frac = pos - i0
    const i1 = i0 + 1
    const s0L = i0 < 0 ? state.tailL : samples[i0 * 2]
    const s0R = i0 < 0 ? state.tailR : samples[i0 * 2 + 1]
    out[n * 2] = (s0L + (samples[i1 * 2] - s0L) * frac) / 32768
    out[n * 2 + 1] = (s0R + (samples[i1 * 2 + 1] - s0R) * frac) / 32768
    n++
    pos += step
  }
  state.pos = pos - srcFrames
  state.tailL = samples[last * 2]
  state.tailR = samples[last * 2 + 1]
  return out.subarray(0, n * 2)
}

// Debug counters for browser diagnosis (?ensoniqdbg=1 exposes them as
// window.__ensoniqDebug). A silent machine and a suspended AudioContext look
// identical from the block counter alone, and resume() rejections are otherwise
// swallowed by void.
const ensoniqDebug = {
  contextState: "none",
  resumeAttempts: 0,
  resumeFailures: 0,
  lastResumeError: "",
  playCalls: 0,
  // Transport health. `underruns` counts how often the schedule ran dry and
  // `gapSeconds` sums the silence that cost, so "the music is a little choppy"
  // becomes a number: gapSeconds / wallSeconds is the fraction of audio lost.
  underruns: 0,
  gapSeconds: 0,
  blocksScheduled: 0,
  lastLeadSeconds: 0,
}
export const getEnsoniqDebug = () => ensoniqDebug
const noteEnsoniqDebug = () => {
  if (typeof window === "undefined") return
  ;(window as unknown as { __ensoniqDebug?: unknown }).__ensoniqDebug = {
    ...ensoniqDebug,
    contextState: audioContext ? audioContext.state : "none",
  }
}

const ensureContext = (): AudioContext | null => {
  if (audioContext) return audioContext
  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const Ctor = (window as any).AudioContext || (window as any).webkitAudioContext
    if (!Ctor) return null
    const ctx = new Ctor()
    const gain = ctx.createGain()
    // Unity, matching gssquared: its DOC stream is created with
    // apply_volume=false, so nothing scales the chip's output after the
    // int16 mix. 0.6 here measured 1.66x (-3.7 dB) quieter than the
    // pre-signed-int8 build once the unsigned mix's DC offset is filtered
    // out, and that drop is what made the Tass Times title bass and drums
    // disappear by ear. The DOC mix peaks at ~0.51 of full scale, so unity
    // still leaves 6 dB of headroom.
    gain.gain.value = 1.0
    gain.connect(ctx.destination)
    audioContext = ctx
    outputNode = gain
    nextTime = ctx.currentTime
    unregister = registerAudioContext((enable) => {
      if (enable) {
        void ctx.resume()
      } else {
        void ctx.suspend()
      }
    })
    return ctx
  } catch (error) {
    console.error("Unable to create the Apple IIgs Ensoniq audio context.", error)
    return null
  }
}

export const playEnsoniqSamples = (samples: Int16Array, sampleRate: number) => {
  ensoniqDebug.playCalls++
  noteEnsoniqDebug()
  if (!isAudioEnabled()) {
    ensoniqDebug.contextState = "disabled"
    return
  }
  if (samples.length === 0) return
  blocksPlayed++
  // Exposed on the page so a headless run can distinguish "the DOC produced
  // nothing" from "the transport dropped it", which is otherwise invisible.
  if (typeof window !== "undefined") {
    ;(window as unknown as { __ensoniqBlocks?: number }).__ensoniqBlocks = blocksPlayed
  }
  const ctx = ensureContext()
  if (!ctx) {
    ensoniqDebug.contextState = "unavailable"
    return
  }
  // Browsers start a fresh context suspended until the user interacts with the
  // page. Asking for a resume on every block covers that without spamming -
  // and every rejected resume is now counted instead of swallowed, so a
  // never-unblocked transport is diagnosable (window.__ensoniqDebug).
  if (ctx.state === "suspended") {
    ensoniqDebug.resumeAttempts++
    ctx.resume().catch((error) => {
      ensoniqDebug.resumeFailures++
      ensoniqDebug.lastResumeError = String(error)
    })
  }
  const frameCount = Math.floor(samples.length / 2)
  if (frameCount <= 0 || !(sampleRate > 0)) return
  const devRate = ctx.sampleRate
  // Resample here instead of per source: see resampleDocBlock.
  const resampled = resampleDocBlock(samples, frameCount, sampleRate, devRate, resampleState)
  const outFrames = resampled.length / 2
  if (outFrames === 0) return
  let buffer: AudioBuffer
  try {
    buffer = ctx.createBuffer(2, outFrames, devRate)
  } catch {
    // A DOC rate the device cannot represent - drop this block rather than
    // stalling the emulator.
    return
  }
  const left = buffer.getChannelData(0)
  const right = buffer.getChannelData(1)
  for (let i = 0; i < outFrames; i++) {
    left[i] = resampled[i * 2]
    right[i] = resampled[i * 2 + 1]
  }
  const source = ctx.createBufferSource()
  source.buffer = buffer
  if (outputNode) {
    source.connect(outputNode)
  } else {
    source.connect(ctx.destination)
  }
  // If we have fallen behind (worker paused, tab throttled) resync instead of
  // building an ever-growing backlog, which would grow without bound.
  const now = ctx.currentTime
  const duration = outFrames / devRate
  // The lead is a floor with hysteresis, NOT a target to top up on every block.
  // Blocks arrive once per emulated refresh and cover exactly their own
  // duration, so the queue depth only changes when the emulator runs above or
  // below realtime. Re-priming whenever the lead dipped below the reserve
  // punched a hole in the stream on *every* block once the queue settled at the
  // reserve, and that is what sounds like "a little choppy": with the emulator
  // even 8% below realtime the hole is ~1.4ms per block, ~8% of the audio,
  // spread as a discontinuity 60 times a second. So only a queue that has
  // genuinely run dry gets re-primed; in between, blocks are scheduled back to
  // back and the stream is contiguous by construction.
  if (nextTime <= now) {
    if (streaming) {
      ensoniqDebug.underruns++
      ensoniqDebug.gapSeconds += Math.min(now - nextTime, 1)
    }
    nextTime = now + minLead
  } else if (nextTime > now + maxLead) {
    // The worker sprinted ahead (a catch-up run). Skip forward rather than
    // letting the backlog grow without bound; this loses audio by design.
    ensoniqDebug.underruns++
    nextTime = now + minLead
  }
  streaming = true
  ensoniqDebug.lastLeadSeconds = nextTime - now
  source.start(nextTime)
  nextTime += duration
  ensoniqDebug.blocksScheduled++
  noteEnsoniqDebug()
}

export const resetEnsoniqAudio = () => {
  if (!audioContext) return
  nextTime = audioContext.currentTime
  streaming = false
  resampleState.pos = 0
  resampleState.tailL = 0
  resampleState.tailR = 0
  unregister?.()
  unregister = undefined
  void audioContext.close()
  audioContext = null
  outputNode = null
  blocksPlayed = 0
  ensoniqDebug.contextState = "none"
  ensoniqDebug.resumeAttempts = 0
  ensoniqDebug.resumeFailures = 0
  ensoniqDebug.lastResumeError = ""
  ensoniqDebug.playCalls = 0
  ensoniqDebug.underruns = 0
  ensoniqDebug.gapSeconds = 0
  ensoniqDebug.blocksScheduled = 0
  ensoniqDebug.lastLeadSeconds = 0
  if (typeof window !== "undefined") {
    ;(window as unknown as { __ensoniqBlocks?: number }).__ensoniqBlocks = 0
  }
  noteEnsoniqDebug()
}