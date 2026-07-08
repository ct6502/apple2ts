import { handleKeyMapping } from "../games/game_mappings"
import { memGetC000, memSetC000 } from "../memory"
import { doTakeSnapshot } from "../motherboard"

const setKeyStrobe = (key: number) => {
  // Sather, Understanding the Apple IIe p2-16, all addresses from $C000-$C01F
  // contain the ASCII key code in the low 7 bits, and the high bit is set
  // to 1 to indicate a key press.
  // $C000-$C00F will maintain that high bit.
  // $C010-$C01F will override that high bit with their own status flag
  // whenever they are read but there's no harm in setting it now.
  memSetC000(0xC000, key | 0b10000000, 16)
  memSetC000(0xC010, (key & 0b11111111) | 128, 16)
}

let keyboardRepeatKey = 0
let nextKeyboardRepeatTime = 0
const Apple2eRepeatDelayMs = 600
const Apple2eRepeatRateMs = 75

export const setKeyboardState = (state: KeyboardState) => {
  if (!state.isDown || state.key <= 0) {
    keyboardRepeatKey = 0
    apple2KeyRelease()
    return
  }
  keyboardRepeatKey = handleKeyMapping(String.fromCharCode(state.key)).charCodeAt(0)
  setKeyStrobe(keyboardRepeatKey)
  if (!state.repeat) {
    keyboardRepeatKey = 0
    return
  }
  nextKeyboardRepeatTime = performance.now() + Apple2eRepeatDelayMs
}

export const pollKeyboardRepeat = () => {
  if (!keyboardRepeatKey) return
  const now = performance.now()
  if (now < nextKeyboardRepeatTime) return
  setKeyStrobe(keyboardRepeatKey)
  nextKeyboardRepeatTime = now + Apple2eRepeatRateMs
}

export const clearKeyStrobe = () => {
  // Here, we only clear the high bit for $C00x, not $C01x (AKD, any-key-down).
  // We will clear AKD when the key is released (below).
  const keyvalue = memGetC000(0xC000) & 0b01111111
  memSetC000(0xC000, keyvalue, 16)
}

export const apple2KeyRelease = () => {
  // Here, the key has been released and we clear the AKD flag.
  const keyvalue = memGetC000(0xC000) & 0b01111111
  memSetC000(0xC000, keyvalue, 32)
}

// Make sure that key presses get processed in a timely manner,
// even if $C010 (the keyboard strobe) isn't being called properly.
// This was a problem for certain games such as Firebug or Wolfenstein,
// which only clear the $C010 strobe if it is a valid game key.
// 3800 ms was heuristically chosen, as that's about how long it takes
// Applesoft BASIC to process a huge line of code.
// TODO: We could use two buffers - one for keypress (with a short delay)
// and another for pasted text, with a longer delay to give Applesoft BASIC
// time to process
let keyBuffer = ""
let tPrevPop = 1000000000
let tPrevSnapshot = 0

// CT 6/27/2026: Added a tiny delay of a couple calls to avoid dropping keys when
// Applesoft BASIC is processing them. This only seemed to be a problem when
// pasting programs in Chrome. Safari worked fine.
let nCalled = 0

export const popKey = () => {
  // See note above about this time cutoff before dropping buffer text.
  const t = performance.now()
  nCalled++
  if (keyBuffer !== "" && nCalled > 2 && (memGetC000(0xC000) < 128 || (t - tPrevPop) > 3800)) {
    nCalled = 0
    tPrevPop = t
    const key = keyBuffer.charCodeAt(0)
    setKeyStrobe(key)
    keyBuffer = keyBuffer.slice(1)
    // Take a time travel snapshot if buffer is empty and it's been at least 500 ms.
    // We don't want to overload the snapshots.
    if (keyBuffer.length === 0 && (t - tPrevSnapshot) > 500) {
      tPrevSnapshot = t
      doTakeSnapshot(true)
    }
  }
}

let prevKey = ""

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

export const sendTextToEmulator = (key: number) => {
  let text = String.fromCharCode(key)
  text = handleKeyMapping(text)
  addToBuffer(text)
  popKey()
}

// TODO: Does this need its own buffer, so we can guarantee that chars
// won't get dropped from the text if it takes too long to process?
export const sendPastedText = (text: string) => {
  if (text.length === 1) {
    text = handleKeyMapping(text)
  }
  addToBuffer(text) // Bypass duplicate check for pasted text
}
