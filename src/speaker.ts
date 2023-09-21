let audioContext: AudioContext
let speaker: AudioWorkletNode
export let isAudioEnabled = () => (isAudioButtonEnabled && emulatorSoundEnabled)

const audioContexts = new Array<AudioContext>()

// Any AudioContext registered here will be suspended/resumed when
// audioEnable is called.
export const registerAudioContext = (context: AudioContext)  => {
  audioContexts.push(context)
  // Our audio might be disabled from the beginning.
  if (!isAudioEnabled()) {
    context.suspend()
  }
}

let isAudioButtonEnabled = true
let emulatorSoundEnabled = true

export const audioEnable = (enable: boolean) => {
  isAudioButtonEnabled = enable
  changeAudioContexts()
}

export const emulatorSoundEnable = (enable: boolean) => {
  emulatorSoundEnabled = enable
  changeAudioContexts()
}

const changeAudioContexts = () => {
  if (isAudioButtonEnabled && emulatorSoundEnabled) {
    audioContexts.forEach(context => context.resume());
  } else {
    audioContexts.forEach(context => context.suspend());
  }
}

const startOscillator = async () => {
  audioContext = new AudioContext({latencyHint: 0, sampleRate: 44100})
  registerAudioContext(audioContext)
  await audioContext.audioWorklet.addModule('worklet/oscillator.js')
  speaker = new AudioWorkletNode(audioContext, 'oscillator')
  speaker.connect(audioContext.destination)
}

const getAudioContext = () => {
  if (!audioContext) {
    startOscillator()
  }
  return audioContext
}

// https://marcgg.com/blog/2016/11/01/javascript-audio/
export const clickSpeaker = (cycleCount: number) => {
  if (!(isAudioEnabled())) return
  if (getAudioContext().state !== "running") {
    audioContext.resume();
  }
  try {
    if (speaker) {
      speaker.port.postMessage(cycleCount)
    }
  } catch (error) {
    console.error("error")
  }
};

