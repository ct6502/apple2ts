let audioContext: AudioContext | undefined
let speaker: AudioWorkletNode | undefined
let initializationPromise: Promise<void> | undefined
let audioUnavailable = false

export type AudioStatus = "enabled" | "muted" | "unavailable"

export const isAudioEnabled = () => (
  isAudioButtonEnabled && emulatorSoundEnabled && !audioUnavailable
)

export const canShowAudioControl = () => typeof AudioContext !== "undefined"

export const getAudioStatus = (): AudioStatus => {
  if (audioUnavailable) return "unavailable"
  return isAudioButtonEnabled ? "enabled" : "muted"
}

const audioStatusListeners = new Set<() => void>()

export const subscribeAudioStatus = (listener: () => void) => {
  audioStatusListeners.add(listener)
  return () => audioStatusListeners.delete(listener)
}

const emitAudioStatus = () => {
  audioStatusListeners.forEach(listener => listener())
}

const audioContexts = new Array<(enable: boolean) => void>()

// Any AudioContext registered here will be suspended/resumed when
// audioEnable is called.
export const registerAudioContext = (fn: (enable: boolean) => void) => {
  audioContexts.push(fn)
  // Our audio might be disabled from the beginning.
  if (!isAudioEnabled()) {
    fn(false)
  }
  return () => {
    const index = audioContexts.indexOf(fn)
    if (index >= 0) audioContexts.splice(index, 1)
  }
}

let isAudioButtonEnabled = true
let emulatorSoundEnabled = true

export const audioEnable = (enable: boolean) => {
  if (isAudioButtonEnabled === enable) return
  isAudioButtonEnabled = enable
  changeAudioContexts()
  emitAudioStatus()
}

export const emulatorSoundEnable = (enable: boolean) => {
  emulatorSoundEnabled = enable
  changeAudioContexts()
}

const changeAudioContexts = () => {
  if (isAudioEnabled()) {
    audioContexts.forEach(fn => fn(true))
  } else {
    audioContexts.forEach(fn => fn(false))
  }
}

const enableContext = (context: AudioContext, enable: boolean) => {
  if (enable) {
    void context.resume()
  } else {
    void context.suspend()
  }
}

let unregisterSpeakerContext: (() => void) | undefined

const closeContext = (context: AudioContext) => {
  if (context.state === "closed") return
  void context.close().catch(error => {
    console.error("Unable to close the failed speaker audio context.", error)
  })
}

const makeAudioUnavailable = (message: string, error: unknown) => {
  console.error(message, error)
  const failedContext = audioContext
  unregisterSpeakerContext?.()
  unregisterSpeakerContext = undefined
  audioContext = undefined
  speaker = undefined
  initializationPromise = undefined
  audioUnavailable = true
  changeAudioContexts()
  emitAudioStatus()
  if (failedContext) closeContext(failedContext)
}

type SpeakerInitializationStage =
  | "creating the audio context"
  | "loading the speaker worklet"
  | "creating the speaker worklet node"
  | "connecting the speaker output"

const initializeOscillator = async () => {
  let context: AudioContext | undefined
  let stage: SpeakerInitializationStage = "creating the audio context"
  try {
    const createdContext = new AudioContext({latencyHint: 0, sampleRate: 44100})
    context = createdContext
    stage = "loading the speaker worklet"
    await createdContext.audioWorklet.addModule("worklet/oscillator.js")
    stage = "creating the speaker worklet node"
    const node = new AudioWorkletNode(createdContext, "oscillator")
    stage = "connecting the speaker output"
    node.connect(createdContext.destination)

    audioContext = createdContext
    speaker = node
    audioUnavailable = false
    unregisterSpeakerContext = registerAudioContext(
      enable => enableContext(createdContext, enable),
    )
    changeAudioContexts()
    emitAudioStatus()
  } catch (error) {
    makeAudioUnavailable(
      `Unable to initialize speaker audio while ${stage}.`,
      error,
    )
    if (context) closeContext(context)
  }
}

const startOscillator = () => {
  initializationPromise ??= initializeOscillator()
  return initializationPromise
}

export const retrySpeakerAudio = async () => {
  if (!audioUnavailable) return
  if (initializationPromise) return initializationPromise
  await startOscillator()
}

// https://marcgg.com/blog/2016/11/01/javascript-audio/
export const clickSpeaker = (cycleCount: number) => {
  if (!(isAudioEnabled())) return
  if (!audioContext || !speaker) {
    void startOscillator()
    return
  }
  if (audioContext.state !== "running") {
    void audioContext.resume()
  }
  try {
    speaker.port.postMessage(cycleCount)
  } catch (error) {
    makeAudioUnavailable(
      "Unable to send a speaker event to the audio worklet.",
      error,
    )
  }
}
