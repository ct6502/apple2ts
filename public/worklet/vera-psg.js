import { AudioClock } from "./audio-clock.js"
import createYmfm from "../js/vera-ym.js"
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

const pcmVolumeLut = new Uint8Array([0, 1, 2, 3, 4, 5, 6, 8, 11, 14, 18, 23, 30, 38, 49, 64])

const clampAudio = (value) => Math.max(-1, Math.min(1, value / 32768))

const signExtend8To16 = (value) => ((value << 8) << 16) >> 16

const signExtend16 = (value) => (value << 16) >> 16

class VeraPsgProcessor extends AudioWorkletProcessor {
  constructor(options) {
    super()
    this.psgSample = { left: 0, right: 0 }
    this.pcmSample = { left: 0, right: 0 }
    this.channels = Array.from({ length: 16 }, () => new Channel())
    this.noiseState = 1
    this.phaseScale = (25000000 / 512) / sampleRate
    this.pcmFifo = new Uint8Array(4096)
    this.pcmFifoWridx = 0
    this.pcmFifoRdidx = 0
    this.pcmFifoCnt = 0
    this.pcmCtrl = 0
    this.pcmRate = 0
    this.pcmLoop = false
    this.pcmCurL = 0
    this.pcmCurR = 0
    this.pcmPhase = 0
    this.audioClock = null
    this.fmModule = null
    this.fmBuffer = 0
    this.fmCapacity = 128
    this.fmEnabled = true
    this.pendingFmWrites = []
    this.fmReady = this.initFm(options.processorOptions.fmWasmModule)
    this.port.onmessage = (e) => {
      if (e.data.type === "clock-port") {
        this.audioClock = new AudioClock(sampleRate, e.data.port)
        return
      }
      if (Array.isArray(e.data)) {
        for (let i = 0; i < e.data.length; i++) {
          const item = e.data[i]
          if (item.type === "fm") {
            this.writeFm(item)
            continue
          }
          if (item.reg === "ctrl") {
            this.writePcmCtrl(item.value)
          } else if (item.reg === "rate") {
            this.writePcmRate(item.value)
          } else if (item.reg === "fifo") {
            this.writePcmFifo(item.value)
          } else {
            this.writeReg(item.reg, item.value)
          }
        }
        return
      }
      if (e.data.type === "fm") {
        this.writeFm(e.data)
        return
      }
      if (e.data.type === "fm-reset") {
        this.pendingFmWrites = []
        if (this.fmModule) this.fmModule._ymfm_reset()
        return
      }
      if (e.data.type === "fm-enabled") {
        this.fmEnabled = e.data.enabled
        return
      }
      const { reg, value } = e.data
      if (reg === "ctrl") {
        this.writePcmCtrl(value)
      } else if (reg === "rate") {
        this.writePcmRate(value)
      } else if (reg === "fifo") {
        this.writePcmFifo(value)
      } else {
        this.writeReg(reg, value)
      }
    }
  }

  async initFm(wasmModule) {
    try {

      this.fmModule = await createYmfm({ instantiateWasm(imports, receiveInstance) {
        const instance = new WebAssembly.Instance(wasmModule, imports)
        receiveInstance(instance)
        return instance.exports
      } })
      this.fmBuffer = this.fmModule._malloc(this.fmCapacity * 2 * Int16Array.BYTES_PER_ELEMENT)
      this.pendingFmWrites.forEach(event => this.writeFm(event))
      this.pendingFmWrites = []
    } catch (error) {
      console.error("Unable to load VERA YM2151 WebAssembly module", error)
      this.pendingFmWrites = []
    }
  }

  writeFm(event) {
    if (!this.fmModule) {
      this.pendingFmWrites.push(event)
      return
    }
    this.fmModule._ymfm_write(event.port, event.value)
  }

  renderFm(count) {
    if (!this.fmModule || !this.fmEnabled) return null
    if (count > this.fmCapacity) {
      this.fmModule._free(this.fmBuffer)
      this.fmCapacity = count
      this.fmBuffer = this.fmModule._malloc(this.fmCapacity * 2 * Int16Array.BYTES_PER_ELEMENT)
    }
    this.fmModule._ymfm_render(this.fmBuffer, count, sampleRate)
    return this.fmModule.HEAP16.subarray(this.fmBuffer >> 1, (this.fmBuffer >> 1) + count * 2)
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
      // Keep phase/noise evolution even while silent, so unmuting is exact.
      // Waveform and mixing work cannot contribute when volume or pan is off.
      if (ch.volume === 0 || (!ch.left && !ch.right)) continue

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

  pcmFifoReset() {
    this.pcmFifoWridx = 0
    this.pcmFifoRdidx = 0
    this.pcmFifoCnt = 0
  }

  pcmFifoRestart() {
    this.pcmFifoRdidx = 0
    this.pcmFifoCnt = this.pcmFifoWridx
  }

  writePcmCtrl(value) {
    value &= 0xff
    if ((value & 0xc0) === 0xc0) {
      this.pcmLoop = true
    } else {
      this.pcmLoop = false
      if (value & 0x80) {
        this.pcmFifoReset()
      }
    }
    if (value & 0x40) {
      this.pcmFifoRestart()
    }
    this.pcmCtrl = value & 0x3f
  }

  writePcmRate(value) {
    value &= 0xff
    this.pcmRate = value > 128 ? 256 - value : value
  }

  writePcmFifo(value) {
    if (this.pcmFifoCnt < 4095) {
      this.pcmFifo[this.pcmFifoWridx++] = value & 0xff
      if (this.pcmFifoWridx === 4096) {
        this.pcmFifoWridx = 0
      }
      this.pcmFifoCnt++
    }
  }

  readPcmFifo() {
    if (this.pcmFifoCnt === 0) {
      return 0
    }
    const result = this.pcmFifo[this.pcmFifoRdidx++]
    if (this.pcmFifoRdidx === 4096) {
      this.pcmFifoRdidx = 0
    }
    this.pcmFifoCnt--
    return result
  }

  pcmUnderrun() {
    this.pcmFifoCnt = 0
    this.pcmFifoRdidx = this.pcmFifoWridx
  }

  renderPcmSample() {
    const oldPhase = this.pcmPhase | 0
    this.pcmPhase = (this.pcmPhase + this.pcmRate * this.phaseScale) % 256
    const newPhase = this.pcmPhase | 0

    if ((oldPhase & 0x80) !== (newPhase & 0x80)) {
      if (this.pcmFifoCnt === 0) {
        this.pcmCurL = 0
        this.pcmCurR = 0
      } else {
        switch ((this.pcmCtrl >> 4) & 3) {
          case 0:
            this.pcmCurL = signExtend8To16(this.readPcmFifo())
            this.pcmCurR = this.pcmCurL
            break
          case 1:
            if (this.pcmFifoCnt < 2) {
              this.pcmUnderrun()
            } else {
              this.pcmCurL = signExtend8To16(this.readPcmFifo())
              this.pcmCurR = signExtend8To16(this.readPcmFifo())
            }
            break
          case 2:
            if (this.pcmFifoCnt < 2) {
              this.pcmUnderrun()
            } else {
              const l = this.readPcmFifo() | (this.readPcmFifo() << 8)
              this.pcmCurL = signExtend16(l)
              this.pcmCurR = this.pcmCurL
            }
            break
          case 3:
            if (this.pcmFifoCnt < 4) {
              this.pcmUnderrun()
            } else {
              const l = this.readPcmFifo() | (this.readPcmFifo() << 8)
              const r = this.readPcmFifo() | (this.readPcmFifo() << 8)
              this.pcmCurL = signExtend16(l)
              this.pcmCurR = signExtend16(r)
            }
            break
        }
        if (this.pcmLoop && this.pcmFifoCnt === 0) {
          this.pcmFifoRestart()
        }
      }
    }

    const volume = pcmVolumeLut[this.pcmCtrl & 0x0f]
    this.pcmSample.left = Math.trunc(this.pcmCurL * volume / 64)
    this.pcmSample.right = Math.trunc(this.pcmCurR * volume / 64)
    return this.pcmSample
  }

  process(inputs, outputs) {
    const output = outputs[0]
    const left = output[0]
    const right = output[1] || output[0]

    this.audioClock?.advance(left.length)
    const fm = this.renderFm(left.length)
    for (let i = 0; i < left.length; i++) {
      const psg = this.renderSample()
      const pcm = this.renderPcmSample()
      const fmLeft = fm ? fm[i * 2] : 0
      const fmRight = fm ? fm[i * 2 + 1] : 0
      left[i] = clampAudio((psg.left + pcm.left) * 2 + fmLeft)
      right[i] = clampAudio((psg.right + pcm.right) * 2 + fmRight)
    }

    return true
  }
}

registerProcessor("vera-psg", VeraPsgProcessor)
