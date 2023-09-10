import {isAudioEnabled, registerAudioContext} from "./speaker"

const hasAudioContext = typeof AudioContext !== 'undefined'
let mockingboardAudio: AudioDevice | undefined
let tones: OscillatorNode[][]
let gains: GainNode[][]
let noiseFilter: BiquadFilterNode[][]
let envelope: (AudioBufferSourceNode | null)[]
//let connectedParam: (AudioParam | null)[][]

const createNoise = (ctx: AudioContext, chip: number) => {
  const bufferSize = 2 * ctx.sampleRate
  const noiseBuffer = ctx.createBuffer(2, bufferSize, ctx.sampleRate)
  const output = noiseBuffer.getChannelData(chip);
  let b0 = 0
  let b1 = 0
  let b2 = 0
  let b3 = 0
  let b4 = 0
  let b5 = 0
  let b6 = 0
  for (let i = 0; i < bufferSize; i++) {
    var white = Math.random() * 2 - 1;
    b0 = 0.99886 * b0 + white * 0.0555179;
    b1 = 0.99332 * b1 + white * 0.0750759;
    b2 = 0.96900 * b2 + white * 0.1538520;
    b3 = 0.86650 * b3 + white * 0.3104856;
    b4 = 0.55000 * b4 + white * 0.5329522;
    b5 = -0.7616 * b5 - white * 0.0168980;
    output[i] = 4 * (b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362);
    b6 = white * 0.115926;
  }
  const whiteNoise = new AudioBufferSourceNode(ctx,
    {buffer: noiseBuffer, loop: true});
  return whiteNoise
}

const constructAudio = () => {
  if (!hasAudioContext) return
  const audioDevice: AudioDevice = {
    context: new AudioContext(),
    element: new Audio()
  }
  registerAudioContext(audioDevice.context)
  const stereoMerge = audioDevice.context.createChannelMerger(2)
  const chipMerge = new GainNode(audioDevice.context, {gain: 0.05})
  chipMerge.connect(audioDevice.context.destination)
  stereoMerge.connect(chipMerge)
  gains = []
  tones = []
  noiseFilter = []
  envelope = []
//  connectedParam = []

  for (let chip = 0; chip <= 1; chip++) {
    gains[chip] = []
    tones[chip] = []
    noiseFilter[chip] = []
//    connectedParam[chip] = []
    envelope[chip] = null

    for (let i = 0; i <= 2; i++) {
      gains[chip][i] = new GainNode(audioDevice.context, {gain: 0})
      gains[chip][i].connect(stereoMerge, 0, chip)
      tones[chip][i] = new OscillatorNode(audioDevice.context, {type: "square"})
      tones[chip][i].connect(gains[chip][i])
      tones[chip][i].start()
      gains[chip][i + 3] = new GainNode(audioDevice.context, {gain: 0})
      gains[chip][i + 3].connect(chipMerge)
      noiseFilter[chip][i] = new BiquadFilterNode(audioDevice.context, {type: "bandpass"})
      let noise = createNoise(audioDevice.context, chip)
      noise.connect(noiseFilter[chip][i])
      noiseFilter[chip][i].connect(gains[chip][i + 3])
      noise.start()
//      connectedParam[chip][i] = null
//      connectedParam[chip][i + 3] = null
    }
  }

  mockingboardAudio?.context.suspend()
  return audioDevice
}

const clock = 1020488

const computeToneFreq = (fine: number, coarse: number) => {
  const factor = 4096 * (coarse & 0x0F) + 16 * fine
  let freq = (factor > 0) ? (clock / factor) : 0
  if (freq < 15 || freq > 24000) freq = 0
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

const computeGain = (level: number) => {
  // TODO: The gain should probably follow the log steps from the AY-3-8910
  // datasheet, but it sounds okay to me.
  let gain = level / 15
  return gain
}

const doReset = (params: MockingboardSound) => {
  for (let chip = 0; chip <= 1; chip++) {
    // Only process sound if at least one tone/noise channel is enabled.
    if ((params[chip][7] & 0x3F) !== 0x3F) {
      for (let i = 0; i < 16; i++) {
        if (params[chip][i] > 0) {
          return false
        }
      }
    }
  }
  return true
}

const constructEnvelopeBuffer = (context: AudioContext, chip: number, freq: number, shape: number) => {
  if (freq === 0) return null
  let length = context.sampleRate / freq
  length = (length > 3) ? length : 3
  if (shape === 10 || shape === 13) length *= 2
  const buffer = new AudioBuffer({numberOfChannels: 2,
    length: (length >= 2) ? length : 2, sampleRate: context.sampleRate})
  const buf = buffer.getChannelData(chip)
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
      for (let i = 0; i < len; i++) buf[i] = 1 - i / (len - 1)
      if (shape === 11) buf[len - 1] = 1
      break
    case 10:  // down triangle
      for (let i = 0; i < len; i++) buf[i] = Math.abs(half - i) / half
      break
    case 14:  // up triangle
      for (let i = 0; i < len; i++) buf[i] = 1 - Math.abs(half - i) / half
      break
    case 4:  // sawtooth up (hold 0)
    case 5:  // sawtooth up (hold 0)
    case 6:  // sawtooth up (hold 0)
    case 7:  // sawtooth up (hold 0)
    case 15: // sawtooth up (hold 0)
    case 13: // sawtooth up (hold 1)
    case 12: // sawtooth up
      for (let i = 0; i < len; i++) buf[i] = i / (len - 1)
      // shapes 4,5,6,7,15 jump down to zero at the end
      if (shape <= 7 || shape === 15) buf[len - 1] = 0
      break
  }
  const hold = (shape & 1) || (shape <= 7)
  return new AudioBufferSourceNode(context, {loop: !hold, buffer: buffer})
}

export const playMockingboard = (params: MockingboardSound) => {
  if (!hasAudioContext || !isAudioEnabled) return
  if (!mockingboardAudio) {
    mockingboardAudio = constructAudio()
  }
  if (!mockingboardAudio) return

  if (doReset(params)) {
    mockingboardAudio.context.suspend()
    return
  }

  for (let chip = 0; chip <= 1; chip++) {
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
        freq = computeToneFreq(params[chip][2 * c], params[chip][2 * c + 1])
        tones[chip][c].frequency.value = freq
      } else {
        freq = computeNoiseFreq(params[chip][6])
        const Q = computeQ(freq)
        noiseFilter[chip][c % 3].frequency.value = freq
        noiseFilter[chip][c % 3].Q.value = Q
      }
      const levelParam = params[chip][8 + (c % 3)] & 0x1F
      const isEnabled = !(params[chip][7] & (1 << c))
      const envFreq = computeEnvFreq(params[chip][11], params[chip][12])
      if (isEnabled && (levelParam === 16) && envFreq > 0) {
        gains[chip][c].gain.value = 0
        console.log(`${chip} ${c} ${envFreq}`)
        if (!envelope[chip]) {
          envelope[chip] = constructEnvelopeBuffer(mockingboardAudio.context,
            chip, envFreq, params[chip][13] & 0xF)
          envelope[chip]?.start()
        }
        envelope[chip]?.connect(gains[chip][c].gain)
      } else {
        const gain = isEnabled ? computeGain(levelParam) : 0
        gains[chip][c].gain.value = freq ? gain : 0
      }
    }
  }

  if (mockingboardAudio.context.state === 'suspended') {
    mockingboardAudio.context.resume();
  }
}
