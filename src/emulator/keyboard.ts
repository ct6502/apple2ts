import { memC000 } from "./memory"
import { doSaveTimeSlice } from "./motherboard"

let keyBuffer = ''
export const popKey = () => {
  if (memC000[0] < 128 && keyBuffer !== '') {
    let key = keyBuffer.charCodeAt(0)
    keyPress(key)
    keyBuffer = keyBuffer.slice(1)
    if (keyBuffer.length === 0) {
      doSaveTimeSlice()
    }
  }
}

let prevKey = ''

export const addToBuffer = (text: String) => {
  // Avoid repeating keys in the buffer if the Apple isn't processing them.
  if (text === prevKey && keyBuffer.length > 0) {
    return
  }
  prevKey = text.slice(0,1)
  keyBuffer += text
  popKey()
}

let tPrev = 0

export const addToBufferDebounce = (text: String, timeout: number) => {
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

const keyPress = (key: number) => {
  memC000.fill(key | 0b10000000, 0, 32)
}

