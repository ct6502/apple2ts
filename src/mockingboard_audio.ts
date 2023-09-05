import {isAudioEnabled, registerAudioContext} from "./speaker"

const hasAudioContext = typeof AudioContext !== 'undefined'
let mockingboardAudio: AudioDevice | undefined
let tones: OscillatorNode[][]
let gains: GainNode[][]
let noiseFilter: BiquadFilterNode[][]
let envelope: OscillatorNode[]
let envGain: GainNode[]

const createNoise = (ctx: AudioContext) => {
  const bufferSize = 2 * ctx.sampleRate
  const noiseBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate)
  const output = noiseBuffer.getChannelData(0);
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
  stereoMerge.connect(audioDevice.context.destination)
  gains = []
  tones = []
  noiseFilter = []
  envelope = []
  envGain = []

  for (let chip = 0; chip <= 1; chip++) {
    const chipMerge = new GainNode(audioDevice.context, {gain: 0.05})
    chipMerge.connect(stereoMerge, 0, chip)
    gains[chip] = []
    tones[chip] = []
    noiseFilter[chip] = []
    envelope[chip] = new OscillatorNode(audioDevice.context, {type: "sawtooth"})
    envGain[chip] = new GainNode(audioDevice.context, {gain: 0.5})
    const constantSourceNode = new ConstantSourceNode(audioDevice.context, {offset: 1})
    constantSourceNode.connect(envGain[chip])
    envelope[chip].connect(envGain[chip])
    envelope[chip].start()

    for (let i = 0; i <= 2; i++) {
      gains[chip][i] = new GainNode(audioDevice.context, {gain: 0})
      gains[chip][i].connect(chipMerge)
      tones[chip][i] = new OscillatorNode(audioDevice.context, {type: "square"})
      tones[chip][i].connect(gains[chip][i])
      tones[chip][i].start()
      envGain[chip].connect(gains[chip][i].gain)
      gains[chip][i + 3] = new GainNode(audioDevice.context, {gain: 0})
      gains[chip][i + 3].connect(chipMerge)
      noiseFilter[chip][i + 3] = new BiquadFilterNode(audioDevice.context, {type: "bandpass"})
      const noise = createNoise(audioDevice.context)
      noise.connect(noiseFilter[chip][i + 3])
      noiseFilter[chip][i + 3].connect(gains[chip][i + 3])
      noise.start()
      // const noise2 = createNoise(audioDevice.context)
      // noise2.start()
      // noise2.connect(gains[chip][i + 3])
    }
  }

  mockingboardAudio?.context.suspend()
  return audioDevice
}

const clock = 1020488

const computeToneFreq = (fine: number, coarse: number) => {
  const factor = 4096 * (coarse & 0x0F) + 16 * fine
  let freq = (factor > 0) ? (clock / factor) : 440
  if (freq > 24000) freq = 24000
  return freq
}

const computeNoiseFreq = (param: number) => {
  const factor = 16 * 8 * param
  let freq = (factor > 0) ? (clock / factor) : 12000
  if (freq > 12000) freq = 12000
  return freq
}

const computeQ = (freq: number) => {
  const top = (freq < 12000) ? freq * 2 : 24000
  const bottom = freq / 8
  const Q = 2 * freq / (top - bottom)
  console.log(`freq ${freq}  Q ${Q}`)
  return Q
}

const computeEnvFreq = (fine: number, coarse: number) => {
  const factor = (coarse * 65536) + 256 * fine
  let freq = (factor > 0) ? (clock / factor) : 0
  if (freq > 24000) freq = 24000
  return freq
}

const computeGain = (bit: number, enable: number, level: number) => {
  if (enable & (1 << bit)) return 0
  level = level & 0x1F
  // TODO: level = 16 should indicate variable amplitude (using envelope)
  let gain = (level <= 15) ? (level / 15) : 1
  return gain
}

export const playMockingboard = (sound: MockingboardSound) => {
  if (!hasAudioContext || !isAudioEnabled) return
  if (!mockingboardAudio) {
    mockingboardAudio = constructAudio()
  }
  if (!mockingboardAudio) return
  let doReset = true
  for (let i = 0; i < 16; i++) {
    if (sound.params[i] > 0) {
      doReset = false
      break
    }
  }
  if (doReset) {
    mockingboardAudio.context.suspend()
    return
  }
  tones[sound.chip][0].frequency.value = computeToneFreq(sound.params[0], sound.params[1])
  tones[sound.chip][1].frequency.value = computeToneFreq(sound.params[2], sound.params[3])
  tones[sound.chip][2].frequency.value = computeToneFreq(sound.params[4], sound.params[5])
  for (let bit = 0; bit <= 5; bit++) {
    gains[sound.chip][bit].gain.value = computeGain(bit, sound.params[7], sound.params[8])
  }
  const freq = computeNoiseFreq(sound.params[6])
  const Q = computeQ(freq)
  for (let bit = 3; bit <= 5; bit++) {
    noiseFilter[sound.chip][bit].frequency.value = freq
    noiseFilter[sound.chip][bit].Q.value = Q
  }
  const envFreq = computeEnvFreq(sound.params[11], sound.params[12])
  if (sound.params[8] & 16) {
    envelope[sound.chip].frequency.value = envFreq
  } else {
    envelope[sound.chip].frequency.value = 0
  }

  if (mockingboardAudio.context.state === 'suspended') {
    mockingboardAudio.context.resume();
  }
}
