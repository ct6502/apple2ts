import {isAudioEnabled, registerAudioContext} from "./speaker"

const hasAudioContext = typeof AudioContext !== 'undefined'
let mockingboardAudio: AudioDevice | undefined
let chipMerge: GainNode
let tones: OscillatorNode[][]
let gains: GainNode[][]
let noiseFilter: BiquadFilterNode[][]
let envelope: (AudioBufferSourceNode | null)[]

const createNoise = (context: AudioContext, chip: number) => {
  const bufferSize = 2 * context.sampleRate
  // We have to create a two-channel stereo buffer and then assign one chip
  // to each channel. Using a mono buffer will play thru both speakers.
  const buffer = new AudioBuffer({numberOfChannels: 2,
    length: bufferSize, sampleRate: context.sampleRate})
  const output = buffer.getChannelData(chip);
  const b = new Float32Array(7).fill(0)
  const c1 = [0.99886, 0.99332, 0.96900, 0.86650, 0.55000, -0.7616, 0.115926]
  const c2 = [0.0555179, 0.0750759, 0.1538520, 0.3104856, 0.5329522, -0.0168980, 0.5362]
  for (let i = 0; i < bufferSize; i++) {
    const white = Math.random() * 2 - 1;
    let sum = 0
    for (let c = 0; c <= 5; c++) {
      b[c] = c1[c] * b[c] + white * c2[c]
      sum += b[c]
    }
    output[i] = (sum + b[6] + white * c2[6]) / 1.5;
    b[6] = white * c1[6];
  }
  return new AudioBufferSourceNode(context, {buffer: buffer, loop: true})
}

const constructAudio = () => {
  if (!hasAudioContext) return
  const audioDevice: AudioDevice = {
    context: new AudioContext(),
    element: new Audio()
  }
  registerAudioContext(audioDevice.context)
  const stereoMerge = audioDevice.context.createChannelMerger(2)
  chipMerge = new GainNode(audioDevice.context, {gain: 0.15})
  chipMerge.connect(audioDevice.context.destination)
  stereoMerge.connect(chipMerge)
  gains = []
  tones = []
  noiseFilter = []
  envelope = []

  for (let chip = 0; chip <= 1; chip++) {
    gains[chip] = []
    tones[chip] = []
    noiseFilter[chip] = []
    envelope[chip] = null

    for (let i = 0; i <= 2; i++) {
      gains[chip][i] = new GainNode(audioDevice.context, {gain: 0})
      gains[chip][i].connect(stereoMerge, 0, chip)
      tones[chip][i] = new OscillatorNode(audioDevice.context)
      tones[chip][i].connect(gains[chip][i])
      tones[chip][i].start()
      gains[chip][i + 3] = new GainNode(audioDevice.context, {gain: 0})
      gains[chip][i + 3].connect(chipMerge)
      noiseFilter[chip][i] = new BiquadFilterNode(audioDevice.context, {type: "bandpass"})
      let noise = createNoise(audioDevice.context, chip)
      noise.connect(noiseFilter[chip][i])
      noiseFilter[chip][i].connect(gains[chip][i + 3])
      noise.start()
    }
  }
  changeMockingboardMode(modeSave)
  mockingboardAudio?.context.suspend()
  return audioDevice
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

const real = new Float32Array([0,0.4,0.4,1,1,1,0.3,0.7,0.6,0.5,0.9,0.8]);
const imag = new Float32Array(real.length)
let hornTable: PeriodicWave
let modeSave = 0

export const changeMockingboardMode = (mode: number) => {
  modeSave = mode
  if (!chipMerge) return
  for (let chip = 0; chip <= 1; chip++) {
    for (let c = 0; c <= 2; c++) {
      switch (mode) {
        case 0: tones[chip][c].type = "square"; chipMerge.gain.value = 0.15; break
        case 1: tones[chip][c].type = "sawtooth"; chipMerge.gain.value = 0.2; break
        case 2:
        case 3:
          if (!hornTable && mockingboardAudio) {
            hornTable = mockingboardAudio?.context.createPeriodicWave(real, imag)
          }
          tones[chip][c].setPeriodicWave(hornTable)
          chipMerge.gain.value = 0.3
          break
      }
    }
  }
}

export const playMockingboard = (sound: MockingboardSound) => {
  if (!hasAudioContext || !isAudioEnabled()) return
  if (!mockingboardAudio) {
    mockingboardAudio = constructAudio()
  }
  if (!mockingboardAudio) return

  const chip = sound.chip
  const params = sound.params
  if (envelope[chip]) {
    for (let c = 0; c <= 5; c++) {
      try {
        envelope[chip]?.disconnect(gains[chip][c].gain)
      } catch (error) {
      }
    }
    try {
      envelope[chip]?.stop()
    } catch (error) {
    }
    envelope[chip] = null
  }
  for (let c = 0; c <= 5; c++) {
    let freq = 0
    if (c <= 2) {
      freq = computeToneFreq(params[2 * c], params[2 * c + 1])
      tones[chip][c].frequency.value = freq
    } else {
      freq = computeNoiseFreq(params[6])
      const Q = computeQ(freq)
      noiseFilter[chip][c % 3].frequency.value = freq
      noiseFilter[chip][c % 3].Q.value = Q
    }
    const levelParam = params[8 + (c % 3)] & 0x1F
    const isEnabled = !(params[7] & (1 << c))
    const envFreq = computeEnvFreq(params[11], params[12])
//    if (isEnabled) console.log(`${chip} ${(255 - params[7]).toString(2)} ${c} ${envFreq}`)
    if (isEnabled && (levelParam === 16)) {
      gains[chip][c].gain.value = 0
      if (envFreq > 0) {
        if (!envelope[chip]) {
          envelope[chip] = constructEnvelopeBuffer(mockingboardAudio.context,
            chip, envFreq, params[13] & 0xF)
          envelope[chip]?.start()
        }
        envelope[chip]?.connect(gains[chip][c].gain)
      }
    } else {
      const gain = isEnabled ? computeGain(levelParam / 15) : 0
      gains[chip][c].gain.value = freq ? gain : 0
    }
  }

  if (mockingboardAudio.context.state === 'suspended') {
    mockingboardAudio.context.resume();
  }
}
