let audioContext: AudioContext | undefined
let speaker: AudioWorkletNode | undefined
let initializationPromise: Promise<void> | undefined
let audioUnavailable = false

// Ctrl-Reset/Boot has to cancel an initialization that may still be loading the
// worklet, and it must not let that in-flight graph install itself afterwards.
let speakerGeneration = 0

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
  noteAudioDebug()
}

export const emulatorSoundEnable = (enable: boolean) => {
  emulatorSoundEnabled = enable
  changeAudioContexts()
  noteAudioDebug()
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

const closeSpeakerNode = (node: AudioWorkletNode | undefined) => {
  if (!node) return
  try {
    node.disconnect()
  } catch (error) {
    console.error("Unable to disconnect the speaker worklet.", error)
  }
  try {
    node.port.close()
  } catch (error) {
    console.error("Unable to close the speaker worklet port.", error)
  }
}

// Boot and Ctrl-Reset post MSG_WORKER.AUDIO_RESET. The speaker worklet queues
// its clicks and renders them as sound, so closing the context is what stops
// already-scheduled audio; merely clearing the worker state would leave the
// last seconds of a game's sound playing after the reset. A later click lazily
// builds a fresh graph through startOscillator().
export const stopSpeakerAudio = () => {
  speakerGeneration++
  initializationPromise = undefined
  unregisterSpeakerContext?.()
  unregisterSpeakerContext = undefined
  const failedContext = audioContext
  const failedSpeaker = speaker
  audioContext = undefined
  speaker = undefined
  audioDebug.workletReady = false
  audioDebug.initStage = ""
  closeSpeakerNode(failedSpeaker)
  if (failedContext) closeContext(failedContext)
  noteAudioDebug()
}

const makeAudioUnavailable = (message: string, error: unknown) => {
  console.error(message, error)
  noteAudioDebug()
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

// Debug-only audio diagnostics (window.__audioDebug). A user reporting "the
// browser is silent" needs the state of every link: was the worklet ever
// created, did its module load fail, how many clicks arrived, and what the
// context state is right now. audioUnavailable being true silences ALL audio
// (Ensoniq isAudioEnabled() includes it), so that one flag is decisive.
const audioDebug = {
  clickCalls: 0,
  workletReady: false,
  initStage: "",
  initError: "",
}

export const getAudioDebug = () => ({
  ...audioDebug,
  audioUnavailable,
  isAudioButtonEnabled,
  emulatorSoundEnabled,
  contextState: audioContext ? audioContext.state : "none",
  speakerWorklet: !!speaker,
})

const noteAudioDebug = () => {
  if (typeof window !== "undefined") {
    ;(window as unknown as { __audioDebug?: unknown }).__audioDebug = getAudioDebug()
  }
}

type SpeakerInitializationStage =
  | "creating the audio context"
  | "loading the speaker worklet"
  | "creating the speaker worklet node"
  | "connecting the speaker output"

const initializeOscillator = async (generation: number) => {
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

    // A Ctrl-Reset during a slow module load must cancel this graph instead of
    // resurrecting the old audio after the reset already stopped it.
    if (generation !== speakerGeneration) {
      closeSpeakerNode(node)
      closeContext(createdContext)
      return
    }

    audioContext = createdContext
    speaker = node
    audioUnavailable = false
    audioDebug.workletReady = true
    audioDebug.initStage = "ready"
    unregisterSpeakerContext = registerAudioContext(
      enable => enableContext(createdContext, enable),
    )
    changeAudioContexts()
    emitAudioStatus()
    noteAudioDebug()
  } catch (error) {
    audioDebug.initStage = stage
    audioDebug.initError = String(error)
    noteAudioDebug()
    if (generation === speakerGeneration) {
      makeAudioUnavailable(
        `Unable to initialize speaker audio while ${stage}.`,
        error,
      )
    }
    if (context) closeContext(context)
  }
}

const startOscillator = () => {
  initializationPromise ??= initializeOscillator(speakerGeneration)
  return initializationPromise
}

export const retrySpeakerAudio = async () => {
  if (!audioUnavailable) return
  if (initializationPromise) return initializationPromise
  await startOscillator()
}

// https://marcgg.com/blog/2016/11/01/javascript-audio/
export const clickSpeaker = (cycleCount: number) => {
  audioDebug.clickCalls++
  if (!(isAudioEnabled())) {
    noteAudioDebug()
    return
  }
  if (!audioContext || !speaker) {
    void startOscillator()
    return
  }
  if (audioContext.state !== "running") {
    void audioContext.resume()
  }
  try {
    speaker.port.postMessage(cycleCount)
    noteAudioDebug()
  } catch (error) {
    makeAudioUnavailable(
      "Unable to send a speaker event to the audio worklet.",
      error,
    )
  }
}
