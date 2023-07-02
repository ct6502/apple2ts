
let audioContext: AudioContext
let speaker: AudioWorkletNode
export let isAudioEnabled = false//typeof AudioContext !== 'undefined'

const audioContexts = new Array<AudioContext>()

// This is primarily used by the Disk Drives.
// Any AudioContext registered here will be suspended/resumed when
// audioEnable is called.
export const registerAudioContext = (context: AudioContext)  => {
  audioContexts.push(context)
  // Our audio might be disabled from the beginning.
  if (!isAudioEnabled) {
    context.suspend()
  }
}

export const audioEnable = (enable: boolean) => {
  isAudioEnabled = enable
  audioContexts.forEach(context => {
    if (isAudioEnabled) {
      context.resume()
    } else {
      context.suspend()
    }
  });
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
  if (!isAudioEnabled) return
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

