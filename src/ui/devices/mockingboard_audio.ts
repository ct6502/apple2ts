import {isAudioEnabled, registerAudioContext} from "./speaker"
import {Organ2} from "./wavetables/Organ2"
import {PhonemeEe} from "./wavetables/PhonemeEe"
import {TwelveStringGuitar1} from "./wavetables/TwelveStringGuitar1"
import {Wurlitzer2} from "./wavetables/Wurlitzer2"

const hasAudioContext = typeof AudioContext !== "undefined"
let mboardContext: AudioContext
let stereoMerge: ChannelMergerNode
let chipMerge: GainNode

type ChipNodes = {
  tones: OscillatorNode[]
  gains: GainNode[]
  noise: BiquadFilterNode[]
  envelope: (AudioBufferSourceNode | null)
}

const nodes: Array<Array<ChipNodes>> = []

// let tones: OscillatorNode[][]
// let gains: GainNode[][]
// let noiseFilter: BiquadFilterNode[][]
// let envelope: (AudioBufferSourceNode | null)[]

const createNoise = (context: AudioContext, chip: number) => {
  const bufferSize = 2 * context.sampleRate
  // We have to create a two-channel stereo buffer and then assign one chip
  // to each channel. Using a mono buffer will play thru both speakers.
  const buffer = new AudioBuffer({numberOfChannels: 2,
    length: bufferSize, sampleRate: context.sampleRate})
  const output = buffer.getChannelData(chip)
  const b = new Float32Array(7).fill(0)
  const c1 = [0.99886, 0.99332, 0.96900, 0.86650, 0.55000, -0.7616, 0.115926]
  const c2 = [0.0555179, 0.0750759, 0.1538520, 0.3104856, 0.5329522, -0.0168980, 0.5362]
  for (let i = 0; i < bufferSize; i++) {
    const white = Math.random() * 2 - 1
    let sum = 0
    for (let c = 0; c <= 5; c++) {
      b[c] = c1[c] * b[c] + white * c2[c]
      sum += b[c]
    }
    output[i] = (sum + b[6] + white * c2[6]) / 1.5
    b[6] = white * c1[6]
  }
  return new AudioBufferSourceNode(context, {buffer: buffer, loop: true})
}

const enableContext = (enable: boolean) => {
  if (enable) {
    mboardContext.resume()
  } else {
    mboardContext.suspend()
  }
}

const constructAudio = (slot: number) => {
  if (!hasAudioContext) return
  if (!mboardContext) {
    mboardContext = new AudioContext()
    registerAudioContext(enableContext)
    stereoMerge = mboardContext.createChannelMerger(2)
    chipMerge = new GainNode(mboardContext, {gain: 0.15})
    chipMerge.connect(mboardContext.destination)
    stereoMerge.connect(chipMerge)
  }
  nodes[slot] = []

  for (let chip = 0; chip <= 1; chip++) {
    nodes[slot][chip] = {
      gains: [],
      tones: [],
      noise: [],
      envelope: null
    }
    for (let i = 0; i <= 2; i++) {
      nodes[slot][chip].gains[i] = new GainNode(mboardContext, {gain: 0})
      nodes[slot][chip].gains[i].connect(stereoMerge, 0, chip)
      nodes[slot][chip].tones[i] = new OscillatorNode(mboardContext)
      nodes[slot][chip].tones[i].connect(nodes[slot][chip].gains[i])
      nodes[slot][chip].tones[i].start()
      nodes[slot][chip].gains[i + 3] = new GainNode(mboardContext, {gain: 0})
      nodes[slot][chip].gains[i + 3].connect(chipMerge)
      nodes[slot][chip].noise[i] = new BiquadFilterNode(mboardContext, {type: "bandpass"})
      const noise = createNoise(mboardContext, chip)
      noise.connect(nodes[slot][chip].noise[i])
      nodes[slot][chip].noise[i].connect(nodes[slot][chip].gains[i + 3])
      noise.start()
    }
  }
  changeMockingboardMode(modeSave)
  mboardContext?.suspend()
}

const clock = 1020488

const computeToneFreq = (fine: number, coarse: number) => {
  const factor = 4096 * (coarse & 0x0F) + 16 * fine
  let freq = (factor > 0) ? (clock / factor) : 0
  if (freq < 10 || freq > 24000) freq = 0
  return freq
}

const computeNoiseFreq = (param: number) => {
  const factor = 16 * 8 * (param & 31)
  let freq = (factor > 0) ? (clock / factor) : 0
  if (freq < 15 || freq > 12000) freq = 0
  return freq
}

const computeQ = (freq: number) => {
  if (!freq) return 1
  const top = (freq < 12000) ? freq * 2 : 24000
  const bottom = freq / 8
  const Q = 2 * freq / (top - bottom)
  return Q
}

const computeEnvFreq = (fine: number, coarse: number) => {
  const factor = (coarse * 65536) + 256 * fine
  let freq = (factor > 0) ? (clock / factor) : 0
  if (freq > 24000) freq = 24000
  return freq
}

// These were measured using an oscilloscope on a Phasor sound card.
const volts = [0, 0.018, 0.025, 0.037, 0.051, 0.074, 0.100, 0.139,
  0.170, 0.230, 0.302, 0.380, 0.500, 0.650, 0.780, 1, 1]

  const computeGain = (x: number) => volts[Math.floor(16 * x)]

const constructEnvelopeBuffer = (context: AudioContext, chip: number, freq: number, shape: number) => {
  if (freq === 0) return null
  let length = context.sampleRate / freq
  length = (length > 3) ? length : 3
  if (shape === 10 || shape === 14) length *= 2
  const buffer = new AudioBuffer({numberOfChannels: 1,
    length: (length >= 2) ? length : 2, sampleRate: context.sampleRate})
  const buf = buffer.getChannelData(0)
  const len = buffer.length
  const half = (len - 1) / 2
  switch (shape) {
    case 0:  // sawtooth down (hold 0)
    case 1:  // sawtooth down (hold 0)
    case 2:  // sawtooth down (hold 0)
    case 3:  // sawtooth down (hold 0)
    case 9:  // sawtooth down (hold 0)
    case 11: // sawtooth down (hold 1)
    case 8:  // sawtooth down
      for (let i = 0; i < len; i++) {
        buf[i] = computeGain(1 - i / (len - 1))
      }
      if (shape === 11) buf[len - 1] = 1
      break
    case 10:  // down triangle
      for (let i = 0; i < len; i++) {
        buf[i] = computeGain(Math.abs(half - i) / half)
      }
      break
    case 14:  // up triangle
      for (let i = 0; i < len; i++) {
        buf[i] = computeGain(1 - Math.abs(half - i) / half)
      }
      break
    case 4:  // sawtooth up (hold 0)
    case 5:  // sawtooth up (hold 0)
    case 6:  // sawtooth up (hold 0)
    case 7:  // sawtooth up (hold 0)
    case 15: // sawtooth up (hold 0)
    case 13: // sawtooth up (hold 1)
    case 12: // sawtooth up
      for (let i = 0; i < len; i++) {
        buf[i] = computeGain(i / (len - 1))
      }
      // shapes 4,5,6,7,15 jump down to zero at the end
      if (shape <= 7 || shape === 15) buf[len - 1] = 0
      break
  }
  const hold = (shape & 1) || (shape <= 7)
  return new AudioBufferSourceNode(context, {loop: !hold, buffer: buffer})
}

// const real = new Float32Array([0,0.4,0.4,1,1,1,0.3,0.7,0.6,0.5,0.9,0.8]);
// const imag = new Float32Array(real.length)
// let hornTable: PeriodicWave
let modeSave = 0

export const MockingboardNames = ["Square","Sawtooth","Organ","12 String Guitar","Phoneme Ee","Wurlitzer"]

export const getMockingboardMode = () => {
  return modeSave
}

export const changeMockingboardMode = (mode = 0) => {
  modeSave = mode
  if (!chipMerge) return
  nodes.forEach(nodes1 => {
    for (let chip = 0; chip <= 1; chip++) {
      for (let c = 0; c <= 2; c++) {
        let t: {real: number[], imag: number[]} = {real: [], imag: []}
        let v = 0.30
        switch (mode) {
          case 0: nodes1[chip].tones[c].type = "square"; v = 0.15; break
          case 1: nodes1[chip].tones[c].type = "sawtooth"; v = 0.2; break
          case 2: t = Organ2; break
          case 3: t = TwelveStringGuitar1; break
          case 4: t = PhonemeEe; break
          case 5: t = Wurlitzer2; break
        }
        if (t.real.length > 0) {
          const table = mboardContext?.createPeriodicWave(t.real, t.imag)
          if (table) nodes1[chip].tones[c].setPeriodicWave(table)
        }
        chipMerge.gain.value = v
      }
    }      
  })
}

export const playMockingboard = (sound: MockingboardSound) => {
  if (!hasAudioContext || !isAudioEnabled()) return
  if (!nodes[sound.slot]) {
    constructAudio(sound.slot)
  }
  if (!mboardContext) return
  const chip = sound.chip
  const params = sound.params
  if (nodes[sound.slot][chip].envelope) {
    for (let c = 0; c <= 5; c++) {
      try {
        nodes[sound.slot][chip].envelope?.disconnect(nodes[sound.slot][chip].gains[c].gain)
      } catch {
        // do nothing
      }
    }
    try {
      nodes[sound.slot][chip].envelope?.stop()
    } catch {
      // do nothing
    }
    nodes[sound.slot][chip].envelope = null
  }
  for (let c = 0; c <= 5; c++) {
    let freq = 0
    if (c <= 2) {
      freq = computeToneFreq(params[2 * c], params[2 * c + 1])
      nodes[sound.slot][chip].tones[c].frequency.value = freq
    } else {
      freq = computeNoiseFreq(params[6])
      const Q = computeQ(freq)
      nodes[sound.slot][chip].noise[c % 3].frequency.value = freq
      nodes[sound.slot][chip].noise[c % 3].Q.value = Q
    }
    const isEnabled = !(params[7] & (1 << c))
    const levelParam = params[8 + (c % 3)] & 15
    const envelopeEnable = params[8 + (c % 3)] & 16
//    if (isEnabled) console.log(`${chip} ${(255 - params[7]).toString(2)} ${c} ${envFreq}`)
    if (isEnabled && envelopeEnable) {
      nodes[sound.slot][chip].gains[c].gain.value = 0
      const envFreq = computeEnvFreq(params[11], params[12])
      if (envFreq > 0) {
        if (!nodes[sound.slot][chip].envelope) {
          nodes[sound.slot][chip].envelope = constructEnvelopeBuffer(mboardContext,
            chip, envFreq, params[13] & 0xF)
            nodes[sound.slot][chip].envelope?.start()
        }
        nodes[sound.slot][chip].envelope?.connect(nodes[sound.slot][chip].gains[c].gain)
      }
    } else {
      const gain = isEnabled ? computeGain(levelParam / 15) : 0
      nodes[sound.slot][chip].gains[c].gain.value = freq ? gain : 0
    }
  }

  if (mboardContext.state === "suspended") {
    mboardContext.resume()
  }
}
