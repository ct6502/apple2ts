import { handleKeyMapping } from "../games/game_mappings"
import { memGetC000, memSetC000 } from "../memory"
import { doSaveTimeSlice } from "../motherboard"

const keyPress = (key: number) => {
  memSetC000(0xC000, key | 0b10000000, 32)
}

// Make sure that key presses get processed in a timely manner,
// even if $C010 (the keyboard strobe) isn't being called properly.
// This was a problem for certain games such as Firebug or Wolfenstein,
// which only clear the $C010 strobe if it is a valid game key.
// 1500 ms was heuristically chosen, as that's about how long it takes
// Applesoft BASIC to process a huge line of code.
// TODO: We could use two buffers - one for keypress (with a short delay)
// and another for pasted text, with a longer delay to give Applesoft BASIC
// time to process

let keyBuffer = ''
let tPrevPop = 1000000000
export const popKey = () => {
  // See note above about this time cutoff before dropping buffer text.
  const t = performance.now()
  if (keyBuffer !== '' && (memGetC000(0xC000) < 128 || (t - tPrevPop) > 1500)) {
    tPrevPop = t
    const key = keyBuffer.charCodeAt(0)
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
    text = handleKeyMapping(text)
  }
  addToBuffer(text)
}

// TODO: Does this need its own buffer, so we can guarantee that chars
// won't get dropped from the text if it takes too long to process?
export const sendPastedText = (text: string) => {
  if (text.length === 1) {
    text = handleKeyMapping(text)
  }
  addToBuffer(text)
}
