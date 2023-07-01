import { handleKeyMapping } from "./game_mappings"
import { memGetC000, memSetC000 } from "./memory"
import { doSaveTimeSlice } from "./motherboard"

const keyPress = (key: number) => {
  memSetC000(0xC000, key | 0b10000000, 32)
}

let keyBuffer = ''
let forceKeyPress = false
export const popKey = () => {
  // Make sure that key presses get processed in a timely manner,
  // even if $C010 (the keyboard strobe) isn't being called properly.
  // This was a problem for certain games such as Firebug or Wolfenstein,
  // which only access $C010 if it was a valid game key.
  if (keyBuffer !== '' && (memGetC000(0xC000) < 128 || (forceKeyPress))) {
    forceKeyPress = false
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
  prevKey = text
  keyBuffer += text
}

let tPrev = 0

export const addToBufferDebounce = (text: string, timeout = 300) => {
  // Avoid repeating keys in the buffer if the Apple isn't processing them.
  const t = performance.now()
  if ((t - tPrev) < timeout) {
    return
  }
  tPrev = t
  addToBuffer(text)
}

export const sendTextToEmulator = (text: string) => {
  if (text.length === 1) {
    console.log(text.charCodeAt(0))
    text = handleKeyMapping(text)
    // Process key presses quickly. See popKey for details.
    forceKeyPress = true
  }
  addToBuffer(text)
}
