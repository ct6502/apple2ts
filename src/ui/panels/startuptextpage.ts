let emulatorStartText = `Welcome to Apple2TS

TypeScript Apple IIe Emulator

(c) 2024 Chris Torrence


Click on the Start Tour globe
button to begin a guided tour.
`

// const isMac = navigator.platform.startsWith('Mac')
// const keyMod = isMac ? `Cmd+` : 'Alt+'
// const arrowMod = isMac ? 'Cmd+' : 'Ctrl+'
const isTouchDevice = "ontouchstart" in document.documentElement

if (isTouchDevice) {

  emulatorStartText += `\n\nTo show keyboard, touch screen.
To send special keys, touch the
arrows, esc, or tab buttons.
To send Ctrl or Open Apple keys,
touch button to enable it, then
touch screen to show keyboard.
Touch twice to lock it on.`

}

const textPage = new Array<string>(24).fill("")
const startupTextSplit = emulatorStartText.split("\n")
const n = startupTextSplit.length
for (let j = 0; j < n; j++) {
  textPage[j + 12 - Math.floor(n/2)] = startupTextSplit[j]
}
textPage[0] = "*".repeat(40)
textPage[23] = "*".repeat(40)
for (let j = 1; j < 23; j++) {
  const len = (38 - textPage[j].length) / 2
  const left = " ".repeat(Math.floor(len))
  const right = " ".repeat(Math.ceil(len))
  textPage[j] = `*${left}${textPage[j]}${right}*`
}

export const startupTextPage = new Uint8Array(40 * 24)
for (let j = 0; j < 24; j++) {
  for (let i = 0; i < 40; i++) {
    const c = textPage[j].charCodeAt(i)
    startupTextPage[40 * j + i] = (c + 128) % 256
  }
}
