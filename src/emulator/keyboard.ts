import { keyMapping } from "./game_mappings"
import { memGetC000, memSetC000 } from "./memory"
import { doSaveTimeSlice } from "./motherboard"

const keyPress = (key: number) => {
  memSetC000(0xC000, key | 0b10000000, 32)
}

let keyBuffer = ''
export const popKey = () => {
  if (memGetC000(0xC000) < 128 && keyBuffer !== '') {
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
  prevKey = text.slice(0,1)
  keyBuffer += text
  popKey()
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
  popKey()
}

export const sendTextToEmulator = (text: string) => {
  if (text.length === 1) {
    addToBuffer(keyMapping(text))
  } else {
    addToBuffer(text)
  }
}
