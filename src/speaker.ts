
let audioContext: AudioContext
let speaker: OscillatorNode

export const getAudioContext = () => {
  if (!audioContext) {
    audioContext = new AudioContext()
  }
  return audioContext
}

// https://marcgg.com/blog/2016/11/01/javascript-audio/
let speakerStartTime = -99;
const duration = 0.1
export const clickSpeaker = () => {
  if (true) return
  if (getAudioContext().state !== "running") {
    audioContext.resume();
  }
  if ((speakerStartTime + 2*duration) >= audioContext.currentTime) {
    return
  }
  try {
    speaker = audioContext.createOscillator();
    speaker.type = "square";
    speaker.frequency.value = 930
    const gain = audioContext.createGain();
    speaker.connect(gain);
    gain.connect(audioContext.destination);
    gain.gain.value = 0.25;
    speakerStartTime = audioContext.currentTime;
    speaker.start(speakerStartTime);
    speaker.stop(speakerStartTime + duration);
  } catch (error) {
    console.error("error")
  }
};

