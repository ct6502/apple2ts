let audioContext: AudioContext
let speaker: AudioWorkletNode
export const isAudioEnabled = () => (isAudioButtonEnabled && emulatorSoundEnabled)

const audioContexts = new Array<(enable: boolean) => void>()

// Any AudioContext registered here will be suspended/resumed when
// audioEnable is called.
export const registerAudioContext = (fn: (enable: boolean) => void) => {
  audioContexts.push(fn)
  // Our audio might be disabled from the beginning.
  if (!isAudioEnabled()) {
    fn(false)
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
    audioContexts.forEach(fn => fn(true));
  } else {
    audioContexts.forEach(fn => fn(false));
  }
}

const enableContext = (enable: boolean) => {
  if (enable) {
    audioContext.resume()
  } else {
    audioContext.suspend()
  }
}

const startOscillator = async () => {
  audioContext = new AudioContext({latencyHint: 0, sampleRate: 44100})
  registerAudioContext(enableContext)
  try {
    await audioContext.audioWorklet.addModule('worklet/oscillator.js')
    speaker = new AudioWorkletNode(audioContext, 'oscillator')
    speaker.connect(audioContext.destination)
  } catch {
    console.error("audioWorklet not available - must run on https")
    isAudioButtonEnabled = false
    emulatorSoundEnabled = false
  }
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
  } catch {
    console.error("error")
  }
};

