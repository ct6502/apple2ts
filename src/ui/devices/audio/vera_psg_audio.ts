import { passAudioClockPort } from "../../main2worker"
import { isAudioEnabled, registerAudioContext } from "./speaker"

let veraPsgContext: AudioContext | null = null
let veraPsgNode: AudioWorkletNode | null = null
let initPromise: Promise<void> | null = null
let unregisterAudioContext: (() => void) | undefined
// Incremented by stopVeraPsgAudio. An AudioWorklet initialization that was
// already in flight when a reset arrived must not install its node afterwards.
let generation = 0
// Delivery queue for the current AudioWorklet graph. A reset invalidates the
// generation and drains the queue, so a stale PCM/PSG batch cannot reach the
// rebuilt graph.
interface VeraWorkletPost {
  generation: number
  message: unknown
}
const scheduledWorkletPosts: VeraWorkletPost[] = []

const flushWorkletPosts = () => {
  const node = veraPsgNode
  if (!node) {
    scheduledWorkletPosts.length = 0
    return
  }
  while (scheduledWorkletPosts.length > 0) {
    const post = scheduledWorkletPosts.shift() as VeraWorkletPost
    if (post.generation !== generation) continue
    node.port.postMessage(post.message)
  }
}

const scheduleWorkletPost = (playGeneration: number, message: unknown) => {
  if (playGeneration !== generation) return
  scheduledWorkletPosts.push({ generation: playGeneration, message })
  flushWorkletPosts()
}

const enableContext = (enable: boolean) => {
  if (!veraPsgContext) return
  if (enable) {
    void veraPsgContext.resume()
  } else {
    void veraPsgContext.suspend()
  }
}

const initVeraPsgAudio = async () => {
  if (initPromise) return initPromise

  initPromise = (async () => {
    const initGeneration = generation
    isVeraFmAudioEnabled = localStorage.getItem("veraFmAudioEnabled") !== "false"
    const context = new AudioContext({ latencyHint: "interactive" })
    console.log("VERA PSG sample rate", context.sampleRate)
    const fmWasmModule = await WebAssembly.compileStreaming(fetch("js/vera-ym.wasm"))
    await context.audioWorklet.addModule("worklet/vera-psg.js")
    if (initGeneration !== generation) {
      // A Boot/Ctrl-Reset closed the context while the worklet module loaded.
      void context.close().catch(() => {})
      return
    }
    const node = new AudioWorkletNode(context, "vera-psg", { processorOptions: { fmWasmModule } })
    const clockChannel = new MessageChannel()
    passAudioClockPort(clockChannel.port1)
    node.port.postMessage({ type: "clock-port", port: clockChannel.port2 }, [clockChannel.port2])
    node.connect(context.destination)
    node.port.postMessage({ type: "fm-enabled", enabled: isVeraFmAudioEnabled })
    veraPsgContext = context
    veraPsgNode = node
    unregisterAudioContext = registerAudioContext(enableContext)
  })()

  return initPromise
}

let hasLoggedAudioWorkletError = false

export const playVeraPsgBatch = async (events: VeraPsgWrite[]) => {
  if (!isAudioEnabled() || events.length === 0) return
  const playGeneration = generation

  try {
    await initVeraPsgAudio()
    if (playGeneration !== generation) return
    const node = veraPsgNode
    const context = veraPsgContext
    if (!node || !context) return
    if (context.state !== "running") {
      await context.resume()
    }
    if (playGeneration !== generation) return
    scheduleWorkletPost(playGeneration, events)
  } catch {
    if (!hasLoggedAudioWorkletError) {
      hasLoggedAudioWorkletError = true
      console.error("VERA PSG audioWorklet not available - must run on https")
    }
  }
}

export const playVeraPsgWrite = async (event: VeraPsgWrite) => {
  if (!isAudioEnabled()) return
  const playGeneration = generation

  try {
    await initVeraPsgAudio()
    if (playGeneration !== generation) return
    const node = veraPsgNode
    const context = veraPsgContext
    if (!node || !context) return
    if (context.state !== "running") {
      await context.resume()
    }
    if (playGeneration !== generation) return
    scheduleWorkletPost(playGeneration, event)
  } catch {
    if (!hasLoggedAudioWorkletError) {
      hasLoggedAudioWorkletError = true
      console.error("VERA PSG audioWorklet not available - must run on https")
    }
  }
}

export const playVeraPcmWrite = async (event: VeraPcmWrite) => {
  if (!isAudioEnabled()) return
  const playGeneration = generation

  try {
    await initVeraPsgAudio()
    if (playGeneration !== generation) return
    const node = veraPsgNode
    const context = veraPsgContext
    if (!node || !context) return
    if (context.state !== "running") {
      await context.resume()
    }
    if (playGeneration !== generation) return
    scheduleWorkletPost(playGeneration, event)
  } catch {
    console.error("VERA PSG audioWorklet not available - must run on https")
  }
}

export const playVeraFmWrite = async (events: VeraFmWrite[]) => {
  if (!isAudioEnabled()) return
  const playGeneration = generation
  try {
    await initVeraPsgAudio()
    if (playGeneration !== generation) return
    const node = veraPsgNode
    const context = veraPsgContext
    if (!context || !node) return
    if (context.state !== "running") await context.resume()
    if (playGeneration !== generation) return
    // The CPU worker already sends one batch per frame. Forward it directly:
    // a main-thread timer here is throttled when the tab is in the background.
    scheduleWorkletPost(playGeneration, events.map(event => ({ type: "fm", ...event })))
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

// Boot/Ctrl-Reset stop for VERA PSG, PCM and FM. Closing the AudioContext
// discards every message already queued for the AudioWorklet (PSG register
// writes, PCM FIFO writes, and FM batches) and stops the audio thread. The
// worklet is rebuilt lazily by playVera*; an in-flight initialization is
// guarded by `generation` so a reset cannot reinstall the old node.
export const stopVeraPsgAudio = () => {
  generation++
  scheduledWorkletPosts.length = 0
  const context = veraPsgContext
  const node = veraPsgNode
  veraPsgContext = null
  veraPsgNode = null
  initPromise = null
  unregisterAudioContext?.()
  unregisterAudioContext = undefined
  try {
    node?.disconnect()
  } catch {
    // Already disconnected.
  }
  try {
    node?.port.close()
  } catch {
    // The port may already be closed.
  }
  if (context) {
    void context.close().catch(() => {
      // The context may already be closed.
    })
  }
}
