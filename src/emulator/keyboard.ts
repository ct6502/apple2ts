import { matchMemory, memGetC000, memSetC000 } from "./memory"
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

type KeyMap = {
  [key: string]: string;
};

export const sendTextToEmulator = (text: string) => {
  if (text.length === 1) {
    let mapping: KeyMap = {}
    const isKarateka = matchMemory(0x6E6C, [0xAD, 0x00, 0xC0])
    if (isKarateka) {
      mapping['N'] = '\x08'
      mapping['M'] = '\x15'
      mapping[','] = '\x08'
      mapping['.'] = '\x15'
    }
    const key = (text in mapping) ? mapping[text] : text
    addToBuffer(key)
  } else {
    addToBuffer(text)
  }
}
