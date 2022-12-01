import { memC000 } from "./memory"

let keyBuffer = ''
export const popKey = () => {
  if (memC000[0] < 128 && keyBuffer !== '') {
    let key = keyBuffer.charCodeAt(0)
    if (key === 10) {
      key = 13
    }
    keyPress(key)
    keyBuffer = keyBuffer.slice(1)
  }
}
export const addToBuffer = (text: String) => {
  keyBuffer += text
  popKey()
}

const keyPress = (key: number) => {
  memC000.fill(key | 0b10000000, 0, 32)
}

