import { isAudioEnabled, registerAudioContext } from "./speaker"

let veraPsgContext: AudioContext
let veraPsgNode: AudioWorkletNode
let initPromise: Promise<void> | null = null

const enableContext = (enable: boolean) => {
  if (!veraPsgContext) return
  if (enable) {
    veraPsgContext.resume()
  } else {
    veraPsgContext.suspend()
  }
}

const initVeraPsgAudio = async () => {
  if (initPromise) return initPromise

  initPromise = (async () => {
    veraPsgContext = new AudioContext({ latencyHint: "interactive" })
    console.log("VERA PSG sample rate", veraPsgContext.sampleRate)
    registerAudioContext(enableContext)
    const fmWasmModule = await WebAssembly.compileStreaming(fetch("js/vera-ym.wasm"))
    await veraPsgContext.audioWorklet.addModule("worklet/vera-psg.js")
    veraPsgNode = new AudioWorkletNode(veraPsgContext, "vera-psg", { processorOptions: { fmWasmModule } })
    veraPsgNode.connect(veraPsgContext.destination)
    veraPsgNode.port.postMessage({ type: "fm-enabled", enabled: isVeraFmAudioEnabled })
  })()

  return initPromise
}

let hasLoggedAudioWorkletError = false

export const playVeraPsgBatch = async (events: VeraPsgWrite[]) => {
  if (!isAudioEnabled() || events.length === 0) return

  try {
    await initVeraPsgAudio()
    if (veraPsgContext.state !== "running") {
      await veraPsgContext.resume()
    }
    veraPsgNode.port.postMessage(events)
  } catch {
    if (!hasLoggedAudioWorkletError) {
      hasLoggedAudioWorkletError = true
      console.error("VERA PSG audioWorklet not available - must run on https")
    }
  }
}

export const playVeraPsgWrite = async (event: VeraPsgWrite) => {
  if (!isAudioEnabled()) return

  try {
    await initVeraPsgAudio()
    if (veraPsgContext.state !== "running") {
      await veraPsgContext.resume()
    }
    veraPsgNode.port.postMessage(event)
  } catch {
    if (!hasLoggedAudioWorkletError) {
      hasLoggedAudioWorkletError = true
      console.error("VERA PSG audioWorklet not available - must run on https")
    }
  }
}

export const playVeraPcmWrite = async (event: VeraPcmWrite) => {
  if (!isAudioEnabled()) return

  try {
    await initVeraPsgAudio()
    if (veraPsgContext.state !== "running") {
      await veraPsgContext.resume()
    }
    veraPsgNode.port.postMessage(event)
  } catch {
    console.error("VERA PSG audioWorklet not available - must run on https")
  }
}

export const playVeraFmWrite = async (events: VeraFmWrite[]) => {
  if (!isAudioEnabled()) return
  try {
    await initVeraPsgAudio()
    if (veraPsgContext.state !== "running") await veraPsgContext.resume()
    // The CPU worker already sends one batch per frame. Forward it directly:
    // a main-thread timer here is throttled when the tab is in the background.
    veraPsgNode.port.postMessage(events.map(event => ({ type: "fm", ...event })))
  } catch (error) {
    if (!hasLoggedAudioWorkletError) {
      hasLoggedAudioWorkletError = true
      console.error("VERA FM audio worklet is unavailable", error)
    }
  }
}

let isVeraFmAudioEnabled = true

export const setVeraFmAudioEnabled = (enabled: boolean) => {
  isVeraFmAudioEnabled = enabled
  veraPsgNode?.port.postMessage({ type: "fm-enabled", enabled })
}

export const playVeraFmReset = () => {
  veraPsgNode?.port.postMessage({ type: "fm-reset" })
}
