// Pre-optimization PSG renderer retained for bit-for-bit regression checks.
import { readFileSync } from "node:fs"
import vm from "node:vm"
const WF_PULSE = 0, WF_SAWTOOTH = 1, WF_TRIANGLE = 2, WF_NOISE = 3

export function makeProcessor(rate) {
  let Processor
  const source = readFileSync(new URL("../../public/worklet/vera-psg.js", import.meta.url), "utf8").replace(/^import .*$/gm, "")
  vm.runInNewContext(source, {
    sampleRate: rate,
    AudioWorkletProcessor: class { constructor() { this.port = { postMessage() {} } } },
    registerProcessor: (_name, ctor) => { Processor = ctor },
    createYmfm: () => new Promise(() => {}),
    console,
  })
  return new Processor({ processorOptions: {} })
}

export function referenceRenderSample() {
    let l = 0
    let r = 0

    for (let i = 0; i < 16; i++) {
      this.noiseState = (this.noiseState << 1) |
        (((this.noiseState >> 1) ^ (this.noiseState >> 2) ^ (this.noiseState >> 4) ^ (this.noiseState >> 15)) & 1)
      this.noiseState &= 0xffff

      const ch = this.channels[i]
      const oldPhase = ch.phase | 0
      const newPhase = (ch.left || ch.right) ? ((ch.phase + ch.freq * this.phaseScale) % 0x20000) : 0
      const newPhaseInt = newPhase | 0
      if ((oldPhase & 0x10000) && !(newPhaseInt & 0x10000)) {
        ch.noiseval = (this.noiseState >> 1) & 0x3f
      }
      ch.phase = newPhase

      let v = 0
      switch (ch.waveform) {
        case WF_PULSE:
          v = ((newPhaseInt >> 10) > ch.pw) ? 0 : 0x3f
          break
        case WF_SAWTOOTH:
          v = (newPhaseInt >> 11) ^ ((ch.pw ^ 0x3f) & 0x3f)
          break
        case WF_TRIANGLE:
          v = ((newPhaseInt & 0x10000) ? (~(newPhaseInt >> 10) & 0x3f) : ((newPhaseInt >> 10) & 0x3f)) ^
            ((ch.pw ^ 0x3f) & 0x3f)
          break
        case WF_NOISE:
          v = ch.noiseval
          break
      }

      let sv = v ^ 0x20
      if (sv & 0x20) {
        sv |= 0xffc0
      }
      sv = (sv << 16) >> 16

      const val = sv * ch.volume
      if (ch.left) l += val >> 3
      if (ch.right) r += val >> 3
    }

    this.psgSample.left = (l << 16) >> 16
    this.psgSample.right = (r << 16) >> 16
    return this.psgSample
  }

