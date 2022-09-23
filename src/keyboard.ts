import { KeyboardEvent } from "react"
import { memC000 } from "./memory"

let keyBuffer = ''
export const popKey = () => {
  if (memC000[0] < 128 && keyBuffer !== '') {
    let key = keyBuffer.charCodeAt(0)
    if (key === 10) {
      key = 13
    }
    memC000.fill(key | 0b10000000, 0, 32)
    keyBuffer = keyBuffer.slice(1)
  }
}
export const addToBuffer = (text: String) => {
  keyBuffer += text
  popKey()
}

export const keyPress = (key: number) => {
  memC000.fill(key | 0b10000000, 0, 32)
}

export const convertAppleKey = (e: KeyboardEvent, uppercase=false) => {
  let key = 0
  if (e.key.length === 1) {
    if (e.metaKey || e.altKey) {
      return 0
    }
    key = e.key.charCodeAt(0)
    if (e.ctrlKey) {
      if (key >= 0x40 && key <= 0x7E) {
        key &= 0b00011111
      } else {
        return 0
      }
    } else if (uppercase) {
      key = e.key.toUpperCase().charCodeAt(0)
    }
  } else {
    const keymap: { [key: string]: number } = {
      Enter: 13,
      ArrowRight: 21,
      ArrowLeft: 8,
      Backspace: 8,
      ArrowUp: 11,
      ArrowDown: 10,
      Escape: 27,
      Shift: -1,
      Control: -1
    };
    if (e.key === "Backspace" && e.shiftKey) {
      key = 0x7F
    } else if (e.key in keymap) {
      key = keymap[e.key]
    }
  }
  return key
};
