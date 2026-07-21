const WF_PULSE = 0
const WF_SAWTOOTH = 1
const WF_TRIANGLE = 2
const WF_NOISE = 3

class Channel {
  constructor() {
    this.freq = 0
    this.volume = 0
    this.left = false
    this.right = false
    this.pw = 0
    this.waveform = 0
    this.noiseval = 0
    this.phase = 0
  }
}

const volumeLut = new Uint16Array([
  0, 4, 8, 12,
  16, 17, 18, 20, 21, 22, 23, 25, 26, 28, 30, 31,
  33, 35, 37, 40, 42, 45, 47, 50, 53, 56, 60, 63,
  67, 71, 75, 80, 85, 90, 95, 101, 107, 113, 120, 127,
  135, 143, 151, 160, 170, 180, 191, 202, 214, 227, 241, 255,
  270, 286, 303, 321, 341, 361, 382, 405, 429, 455, 482, 511,
])

class VeraPsgProcessor extends AudioWorkletProcessor {
  constructor() {
    super()
    this.channels = Array.from({ length: 16 }, () => new Channel())
    this.noiseState = 1
    this.phaseScale = (25000000 / 512) / sampleRate
    this.port.onmessage = (e) => {
      const { reg, value } = e.data
      this.writeReg(reg, value)
    }
  }

  writeReg(reg, value) {
    reg &= 0x3f
    value &= 0xff

    const ch = Math.floor(reg / 4)
    const idx = reg & 3

    switch (idx) {
      case 0:
        this.channels[ch].freq = (this.channels[ch].freq & 0xff00) | value
        break
      case 1:
        this.channels[ch].freq = (this.channels[ch].freq & 0x00ff) | (value << 8)
        break
      case 2:
        this.channels[ch].right = (value & 0x80) !== 0
        this.channels[ch].left = (value & 0x40) !== 0
        this.channels[ch].volume = volumeLut[value & 0x3f]
        break
      case 3:
        this.channels[ch].pw = value & 0x3f
        this.channels[ch].waveform = value >> 6
        break
    }
  }

  renderSample() {
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

    return {
      left: (l << 16) >> 16,
      right: (r << 16) >> 16,
    }
  }

  process(inputs, outputs) {
    const output = outputs[0]
    const left = output[0]
    const right = output[1] || output[0]

    for (let i = 0; i < left.length; i++) {
      const sample = this.renderSample()
      left[i] = sample.left / 32768
      right[i] = sample.right / 32768
    }

    return true
  }
}

registerProcessor("vera-psg", VeraPsgProcessor)
