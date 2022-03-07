
let audioContext: AudioContext
let speaker: AudioWorkletNode

const startOscillator = async () => {
  audioContext = new AudioContext()
  await audioContext.audioWorklet.addModule('worklet/oscillator.js')
  speaker = new AudioWorkletNode(audioContext, 'oscillator')
  speaker.connect(audioContext.destination)
}

export const getAudioContext = () => {
  if (!audioContext) {
    startOscillator()
  }
  return audioContext
}

// https://marcgg.com/blog/2016/11/01/javascript-audio/
export const clickSpeaker = (cycleCount: number) => {
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

