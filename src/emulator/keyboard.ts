import { keyMapping } from "./game_mappings"
import { memGetC000, memSetC000 } from "./memory"
import { doSaveTimeSlice } from "./motherboard"

const keyPress = (key: number) => {
  memSetC000(0xC000, key | 0b10000000, 32)
}

let keyBuffer = ''
let prevCount = 0
export const popKey = (cycleCount: number) => {
  const diff = cycleCount - prevCount
  if (keyBuffer !== '' && (memGetC000(0xC000) < 128 || diff > 100000)) {
    prevCount = cycleCount
    let key = keyBuffer.charCodeAt(0)
    keyPress(key)
    keyBuffer = keyBuffer.slice(1)
    if (keyBuffer.length === 0) {
      doSaveTimeSlice()
    }
  }
}

let prevKey = ''

export const addToBuffer = (text: string) => {
  // Avoid repeating keys in the buffer if the Apple isn't processing them.
  if (text === prevKey && keyBuffer.length > 0) {
    return
  }
  prevKey = text.length === 1 ? text : ''
  keyBuffer += text
}

let tPrev = 0

export const addToBufferDebounce = (text: string, timeout: number) => {
  // Avoid repeating keys in the buffer if the Apple isn't processing them.
  const t = performance.now()
  if ((t - tPrev) < timeout) {
    return
  }
  tPrev = t
  prevKey = text.slice(0,1)
  keyBuffer += text
}

export const sendTextToEmulator = (text: string) => {
  if (text.length === 1) {
    addToBuffer(keyMapping(text))
//    keyPress(keyMapping(text).charCodeAt(0))
  } else {
    addToBuffer(text)
  }
}
