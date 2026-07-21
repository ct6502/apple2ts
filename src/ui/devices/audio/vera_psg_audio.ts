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
    await veraPsgContext.audioWorklet.addModule("worklet/vera-psg.js")
    veraPsgNode = new AudioWorkletNode(veraPsgContext, "vera-psg")
    veraPsgNode.connect(veraPsgContext.destination)
  })()

  return initPromise
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
    console.error("VERA PSG audioWorklet not available - must run on https")
  }
}
